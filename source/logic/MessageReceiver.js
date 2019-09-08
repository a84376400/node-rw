const _ = require('lodash');
const debug = require('debug')('server:messagereceiver');
const EventStore = require('../store/index.js').Event;
const DeviceStore = require('../store/index.js').Device;
const TroubleStore = require('../store/trouble.js');
const { ALARM, TROUBLE } = require('../kit/error.json');
const {
  parseHex
} = require('../kit').protocol;

const TIMEOUT = 2 * 60 * 60 * 1000; // time in ms

class MessageReceiver {
  constructor(fpm) {
    this._fpm = fpm;
    this.cache = fpm.cache;
    this.eventStore = EventStore(this._fpm.M)
    this.deviceStore = DeviceStore(this._fpm.M)
    this.troubleStore = TroubleStore(this._fpm.M);
    this.init()
  }

  init() {
    this._fpm.subscribe('$d2s/u1/p1/tianyi', this.subscriber.bind(this))
    this._fpm.subscribe('$d2s/u1/p1/tcp', this.subscriber.bind(this))
  }
  subscriber(topic, message) {
    // message is Buffer
    const packet = JSON.parse(message.toString());
    const {
      header,
      payload
    } = packet;
    if (header.network === 'tcp') {
        this.handReceive(payload, header)
    } else {
      this.handNbiotReceive(payload, header)
    }
  }

  async handNbiotReceive(data, header) {
    // the data contains `nb` and `message` fields, need the message normally
    const {
      nb,
      sid
    } = header

    // nb bind to device by id
    debug('Nbiot receive: Header: %O, Payload: %O', header, data);
    try {
      // store it
      this.deviceStore.bindNb({
          sn: sid,
          nb
        })
        .catch(error => this._fpm.logger.error('bindNb', error));
      //this.cache.put(`#sn:${sid}/network`, network);
      await this.handMessage(data, 'NB')
    } catch (e) {
      this._fpm.logger.error(e)
    }
  }
  async handReceive(data, header) {
    const {
      sid
    } = header
    try {
      // ONLINE
      this.deviceStore.changeState({
        sn: sid,
        status: 'ONLINE'
      })
      await this.handMessage(data, 'TCP')

    } catch (e) {
      this._fpm.logger.error(e)
    }
  }
  //See The README.md #Data Transform Protocol
  async handMessage(data, network) {

    const info = parseHex(data)
    if (!info) {
      return
    }
    debug('The origin info: %O', info);
    // // Do sth Logic according to the `fn`, Such as 'offline'...
    // if (info.fn === 'ONLINE') {
    //   this._fpm.execute('mqttclient.publish', {
    //     topic: '$d2s/online/tcp',
    //     payload: `1100000100000001${ info.sn }cc0000`,
    //     format: 'hex'
    //   })
    //   this.handConnect(undefined, {
    //     id: info.sn
    //   })
    // }
    // if (info.fn === 'OFFLINE') {
    //   this._fpm.execute('mqttclient.publish', {
    //     topic: '$d2s/offline/tcp',
    //     payload: `1100000100000001${ info.sn }bb0000`,
    //     format: 'hex'
    //   })
    //   this.handClose(undefined, {
    //     id: info.sn
    //   })
    // }

    // [ Save The Event Message ]
    const event = {
      fn: info.fn,
      network: (network || 'TCP'),
      sn: info.sn,
      origin: data.toString('hex')
    }

    _.map(info.registers, (reg, id) => {
      // the registerid starts with 000 , we need use 'r000' to replace '000'
      event['r' + id] = reg.val
    })
    this.eventStore.saveEvent(event)
      .catch(e => {
        this._fpm.logger.error(e)
      })

    // check exists
    try {
      const flag = await this.deviceStore.checkExists({ sn: info.sn });
      if(!flag){
        debug('The sn : %s, not exists!', info.sn);
        return ;
      }
    } catch (error) {
      this._fpm.logger.error(error);
    }
    
    // [ Finally ]
    // We need calc the data between the twice push data
    // So, store the last data we need
    let changeFlag = false
    // get data from cache
    const cacheData = this.cache.get(`#sn:${event.sn}/handMessage/${event.fn}`)
    if (cacheData) {
      // not same
      if (cacheData != event.origin) {
        changeFlag = true
      }
    } else {
      // first get
      changeFlag = true
    }
    // update cache
    this.cache.put(`#sn:${event.sn}/handMessage/${event.fn}`, event.origin)

    if(!changeFlag){
      // 没有修改过任何信息，表示为一条重复的数据，可直接忽略
      return;
    }

    if(info.fn !== 'CAMERA_TROUBLE' &&
      info.fn !== 'TROUBLE' &&
      info.fn !== 'ALARM'){
      this._fpm.execute('socketio.broadcast', info)
      return;
    }

    
    // make a error notify if the message contains the info not normally of the setting.
    // if it's in fixing, it will not notify the error message.

    // Get the status flag if it's in fixing mode.

    try {
      let fixMode = await this.deviceStore.isInFixMode({ sn: info.sn, })
      if(fixMode){
        return;
      }
    } catch (error) {
      this._fpm.logger.error(error);
    }

    //根据info.sn获取设备名
    const deviceName = await this.deviceStore.findDeviceInfo({ sn: info.sn })
    
    // [ Handle the camera ip online status ]
    if(info.fn === 'CAMERA_TROUBLE'){
      debug('Device CAMERA_TROUBLE: %O', info)
      // it always report 1 ip for 1 device
      const { sn, code, ip } = info;
      try {
        let prevCameraStatus = await this.deviceStore.getCameraStatus({ sn, ip });
        debug('Camera status: %d, prev: %d', code, prevCameraStatus)
        if( code === prevCameraStatus ){
          // not change
          // ??? return without any notify!!!!
          return;
        }
        // change the camera network status
        await this.deviceStore.setCameraStatus({ sn, ip, status: code });

      } catch (error) {

      }

      if( code === 0 ){
        // camera network working
        // autofix
        try {
          const the_trouble = await this.troubleStore.autoFixTroubleByDevice({ sn, code: 't6' })
          this._fpm.execute('socketio.broadcast', {
            sn,
            name: deviceName,
            fn: `TROUBLE_FIX`,
            code: 't6',
            title: `${ the_trouble.device } 摄像机恢复正常`,
            trouble_id: the_trouble.id,
          })
          // this._fpm.execute('socketio.broadcast', {
          //   sn,
          //   fn: `CAMERA_TROUBLE`,
          //   code: 0,
          //   title: `${ the_trouble.device } 摄像机恢复正常`,
          //   trouble_id: the_trouble.id,
          // })
        } catch (error) {
          debug('autoFixTroubleByDevice Error %O', error);
          this._fpm.logger.error(error);
        }

      }else{
        // camera network trouble.
        // make a trouble
        try {
          const troubleData = await this.troubleStore.createCameraTrouble({
            sn, ip, code: 't6',
          });
          debug('troubleData %O', troubleData);
          this._fpm.execute('socketio.broadcast', {
            sn: info.sn,
            name: deviceName,
            fn: 'TROUBLE',
            code: 't6',
            title: `${ troubleData.title }`,
            trouble_id: troubleData.id,
          })
          // this._fpm.execute('socketio.broadcast', {
          //   sn,
          //   fn: `CAMERA_TROUBLE`,
          //   code: 1,
          //   title: `${ troubleData.title }`,
          //   trouble_id: troubleData.id,
          // })
        } catch (error) {
          debug('Create Trouble: %O', error);
          this._fpm.logger.error(error);
        }
      }
      return;
    }
    // [ Handle the trouble ]
    if(info.fn === 'TROUBLE'){
      debug('Device Trouble: %O', info)
      // Get the device's trouble status;
      let prevTrouble = this.cache.get(`#sn:${info.sn}/trouble`)
      if(!prevTrouble){
        // never cached
        prevTrouble = {};
        try {
          const troubleList = await this.troubleStore.getUnFixedTroublesByDevice({ sn: info.sn });
          _.map(troubleList, (trouble, code) =>{
            prevTrouble[code] = 1;
          })
        } catch (error) {
          debug('getUnFixedTroublesByDevice %O', error);
          this._fpm.logger.error(error);
        }
      }
      debug('The prev trouble info %O', prevTrouble);
      this.cache.put(`#sn:${info.sn}/trouble`, info.troubles);

      // loop the latest troubles
      _.map(info.troubles, async (val, trouble) => {
        // ignore the same status or normal status
        if((prevTrouble[trouble] || 0) === val){
          return;
        }
        if( trouble === 't3'){
          // t3 针对网络的状态，其变化需要特殊处理
          if(val === 1){
            // offline
            this.handClose('offline', { id: info.sn,fn: 'OFFLINE' })
            debug('device offline %O', info)
          }else{
            this.handConnect('online', { id: info.sn })
            debug('device online %O', info)
          }
        }
        if(val === 0){
          // Switch status from 1 => 0
          // it means autoFix
          try {
            const the_trouble = await this.troubleStore.autoFixTroubleByDevice({ sn: info.sn, code: trouble })
            this._fpm.execute('socketio.broadcast', {
              sn: info.sn,
              name: deviceName,
              fn: `TROUBLE_FIX`,
              code: trouble,
              title: TROUBLE[trouble][`0`],
              trouble_id: the_trouble.id,
            })
          } catch (error) {
            debug('autoFixTroubleByDevice Error %O', error);
            this._fpm.logger.error(error);
          }
          return;
        }

        // the blow code handle the trouble staff
        const data = {
          sn: info.sn,
          title: TROUBLE[trouble][`1`],
          code: trouble,
        }
        try {
          const troubleData = await this.troubleStore.createTrouble(data);
          this._fpm.execute('socketio.broadcast', {
            sn: info.sn,
            name: deviceName,
            fn: `TROUBLE`,
            code: trouble,
            val,
            title: TROUBLE[trouble][`${val}`],
            trouble_id: troubleData.id,
          })
        } catch (error) {
          debug('Create Trouble: %O', error);
          this._fpm.logger.error(error);
        }
      })
      return;
    }
    // [ Handle the alarm ]
    if(info.fn == 'ALARM'){
      debug('Device Alarm: %O', info)
      // How to use this?
      _.map(info.alarms, async (val, alarm) => {
        if( val === 0) return;
        const data = {
          sn: info.sn,
          title: ALARM[alarm][`${val}`],
          code: alarm,
        }
        try {
          await this.troubleStore.createAlarm(data);
        } catch (error) {
          debug('Create Alarm: %O', error);
          this._fpm.logger.error(error);
        }
        this._fpm.execute('socketio.broadcast', {
          sn: info.sn,
          name: deviceName,
          fn: `ALARM`,
          code: data.code,
          title: data.title,
        })
      })
      return;
    }

    
  }

  handClose(topic, data) {
    //Save The Close Event
    this.eventStore.saveEvent({
      sn: data.id,
      fn: 'OFFLINE',
      origin: ''
    })
    this.deviceStore.changeState({
      sn: data.id,
      status: 'OFFLINE'
    })
    this.cache.del(`#sn:${data.id}/handMessage`)
    this._fpm.execute('socketio.broadcast', data)
  }

  handConnect(topic, data) {
    //Save The Connect Event
    this.eventStore.saveEvent({
      sn: data.id,
      fn: 'ONLINE',
      origin: ''
    })
    this.deviceStore.changeState({
      sn: data.id,
      status: 'ONLINE'
    })
    this._fpm.execute('socketio.broadcast', {
      id: data.id, //之前的版本就是id ,sn我自己后来改的
      fn: 'ONLINE'
    })
  }
}

exports.MessageReceiver = MessageReceiver