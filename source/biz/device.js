const _ = require('lodash');
const moment = require('moment')
const assert = require('assert');
const {
  protocol,
  pingHost
} = require('../kit');
const schedule = require('node-schedule')
const {
  parseHex,
  generateHex,
  REGISTER
} = protocol;

const EventStore = require('../store/index.js').Event
const  { Message, Device } = require('../store');

const hexToString = (hex, bytes = 1) => {
  return _.padStart(hex.toString('hex'), bytes * 2, '0');
}

const HEADER = '1100000100000001'

let callbackCounter = 1
let jobOn, jobOff
//See The README.md #Data Transform Protocol
const DeviceBiz = (fpm) => {
  const eventStore = EventStore(fpm.M)
  const messageStore = Message(fpm.M)
  const deviceStore = Device(fpm.M)

  const getState = async args => {
    const {
      sn
    } = args

    // get the latest event info from db
    try {
      let {
        data
      } = await eventStore.getLatest(sn)
      return parseHex(data.origin);
    } catch (e) {
      return Promise.reject({
        errno: -1000,
        message: 'No data'
      })
    }
  }

  const send = async args => {
    const {
      unit,
      op,
      val = 0,
      sn,
      uid,
      network = 'TCP',
      extra,
    } = args
    callbackCounter++
    if (callbackCounter > 0xffff) {
      callbackCounter = 1
    }
    const message = generateHex(sn, op, callbackCounter, unit, val)
    // save the command
    if(op !== 'SET_CAMERA'){
      messageStore.saveSendMessage({
        unit: unit || '0000',
        val,
        clientId: sn,
        message,
        uid: uid || 0,
      })
    }

    if(uid === 0 && sn === 'ffffffff'){
      // broadcast mode
      // send from tcp
      const payloadJSON = {
        message,
      };
      if (extra) {
        // get all devices' id of the area;
        payloadJSON.ids = extra;
      }
      const payload = `${ Buffer.from(JSON.stringify(payloadJSON)).toString('hex') }`
      /*向设备发送数据*/
      fpm.execute('mqttclient.publish', {
        topic: '$s2d/tcp/broadcast',
        payload,
        format: 'hex'
      })
      return 1
    }

    try {
      if (network == 'TCP') {
        const state = await deviceStore.getState({
          sn
        })

        if (state == 'ONLINE') {
          //如果数据库的该设备的状态是在线的，就执行一下的逻辑
          // send from tcp
          const payload = `${ HEADER }${message}`
          fpm.execute('mqttclient.publish', {
            topic: '$s2d/tcp/push',
            payload,
            format: 'hex'
          })
          return 1
        }
      }
      /*如果该设备tcp网络断开
      * 就执行一下的逻辑
      * 获取该设备的NB号
      * 然后发送给设备*/
      // get nb by sn
      let nb = await deviceStore.getNb({
        sn
      })
      // send from nb
      if (!nb) {
        return Promise.reject({
          errno: -1001,
          message: 'Device havnt bind a nb code~'
        });
      }

      const payload = `${nb}|${generateHex(sn, op, callbackCounter, unit, val, true)}`
      fpm.execute('mqttclient.publish', {
        topic: '$s2d/nb/yiyuan/push',
        payload,
        format: 'string'
      });
      return 1
    } catch (e) {
      console.error('E', e)
      return e
    }
  }
  // const pushTime = sn_list => {
  //   const sn = 'ffffffff', op = 'PUSH_TIME'
  //   callbackCounter++;
  //   if (callbackCounter > 0xffff) {
  //     callbackCounter = 1;
  //   }
    
  //   let arrTime = moment((_.now())).format('HH:mm').split(':')
  //   let nowTime = parseInt(arrTime[0]) * 60 + parseInt(arrTime[1])
  //   const NowTiBuf = Buffer.alloc(2);
  //   NowTiBuf.writeInt16BE(nowTime);
  //   const message = generateHex(sn, op, callbackCounter,null,`${hexToString(NowTiBuf)}`);
  //   const payloadJSON = {
  //     message: `${message.toString('hex')}`
  //   }
  //   payloadJSON.ids = sn_list.join(',');
  //   const payload = `${ Buffer.from(JSON.stringify(payloadJSON)).toString('hex') }`
  //     fpm.execute('mqttclient.publish', {
  //       topic: '$s2d/tcp/broadcast',
  //       payload,
  //       format: 'hex'
  //     })
  //     return 1
  // }
  return {
    ping: args => {
      const rsp = pingHost(args.ip);
      if (rsp === true) {
        return 1;
      } else {
        fpm.logger.error(rsp);
        return Promise.reject({
          error: rsp
        });
      }
    },
    // merge the register info and latest device info
    getRegisters: async args => {
      const {
        sn = ''
      } = args
      let info
      try {
        info = await getState({
          sn
        })
      } catch (e) {
        info = {}
      }
      // replace the val of the latest device info if there has
      const tempInfo = {}
      _.map(info.registers, (register, id) => {
        tempInfo[id] = _.assign(REGISTER[id], {
          name: register.name,
          rw: register.rw,
          val: register.val,
        })
      })
      return tempInfo
    },
    selfCheck: async args => {
      const {
        sn = 'ffffffff', op = 'SELF_CHECK', area
      } = args
      callbackCounter++;
      if (callbackCounter > 0xffff) {
        callbackCounter = 1;
      }
      const message = generateHex(sn, op, callbackCounter)
      const payloadJSON = {
        message: `${message.toString('hex')}`
      };
      if(area){
        // get sn list by the area
        const devices = await fpm.M.findAsync({
          table: 'dvc_device',
          condition: `area_id = ${ area } and status = 'ONLINE'`
        })
        if(_.size(devices) < 1){
          return -1;
        }
        /*fpm.M.commandAsync({ sql: ``})*/
        let sn_list = _.map(devices, device => {
          return device.sn
        })
        payloadJSON.ids = sn_list.join(',');
      }
      const payload = `${ Buffer.from(JSON.stringify(payloadJSON)).toString('hex') }`
      fpm.execute('mqttclient.publish', {
        topic: '$s2d/tcp/broadcast',
        payload,
        format: 'hex'
      })
      return 1
    },
    putSetting: async args => {
      const {
        sn = 'ffffffff', op = 'PUT_SETTING', maxT, minT, maxV, minV, maxE, area
      } = args;
      callbackCounter++;
      if (callbackCounter > 0xffff) {
        callbackCounter = 1;
      }
      const minTBuf = Buffer.alloc(1, minT);
      const maxTBuf = Buffer.alloc(1, maxT);
      const minVBuf = Buffer.alloc(1, minV);
      const maxVBuf = Buffer.alloc(1, maxV);
      const maxEBuf = Buffer.alloc(2);
      //let payloadJSON_ledtime
      maxEBuf.writeInt16BE(maxE);
      
      const settingData = `${hexToString(minTBuf)}${hexToString(maxTBuf)}${hexToString(minVBuf)}${hexToString(maxVBuf)}${hexToString(maxEBuf)}`;

      const message = generateHex(sn, op, callbackCounter, null, settingData);

      // send from tcp
      const payloadJSON = {
        message: `${message.toString('hex')}`
      };
      if(area){
        // get sn list by the area
        const devices = await fpm.M.findAsync({
          table: 'dvc_device',
          condition: `area_id = ${ area } and status = 'ONLINE'`
        })
        if(_.size(devices) < 1){
          return -1;
        }
        /*fpm.M.commandAsync({ sql: ``})*/
        let sn_list = _.map(devices, device => {
          return device.sn
        })
        payloadJSON.ids = sn_list.join(',');
      }
     
      const payload = `${ Buffer.from(JSON.stringify(payloadJSON)).toString('hex') }`
      fpm.execute('mqttclient.publish', {
        topic: '$s2d/tcp/broadcast',
        payload,
        format: 'hex'
      })
      return 1
    },
    setTiming: async args => {
      const { Turntime, Offtime, area } = args
      let onIntArr = Turntime.split(':').map(date=>{
        return +date
      })
      let offIntArr = Offtime.split(':').map(date=>{
        return +date
      })
      const ruleON = new schedule.RecurrenceRule()
      const ruleOFF = new schedule.RecurrenceRule()
      ruleON.hour = [onIntArr[0]]
      ruleON.minute = [onIntArr[1]]
      ruleON.second = [onIntArr[2]]
      ruleOFF.hour = [offIntArr[0]]
      ruleOFF.minute = [offIntArr[1]]
      ruleOFF.second = [offIntArr[2]]
      if(jobOn && jobOff){
        jobOn.cancel()
        jobOff.cancel()
      }
      jobOn = schedule.scheduleJob(ruleON, async()=>{
        //执行开启补光灯的命令
        await fpm.execute('device.turnOnLight', _.assign(args, { area: area, val: 1 }));
      })
      jobOff = schedule.scheduleJob(ruleOFF, async()=>{
        //执行关闭补光灯的命令
        await fpm.execute('device.turnOnLight', _.assign(args, { area: area, val: 0 }));
      })
      return 1
    },
    send,
    updateCameras: async args => {
      // 更新设备对应的摄像头列表信息
      try {
        const { sn } = args;
        assert(!!sn, 'SN required!');
        const list = await deviceStore.getCameras({ sn });

        const ipList = _.map(list, item => {
          return item.ip;
        })
        return await send({ sn, op: 'SET_CAMERA', val: ipList });
      } catch (error) {
        fpm.logger.error(error);
        return Promise.reject({ error, })
      }
    },
    getState,
    getCommands: async args => {
      return messageStore.getCommands(args)
    },
    turnOnLight: async args => {
      const {
        area = undefined,
        val = 1,
      } = args;
      let extra;
      if(area){
        // get sn list by the area
        const devices = await fpm.M.findAsync({
          table: 'dvc_device',
          condition: `area_id = ${ area } and status = 'ONLINE'`
        })
        if(_.size(devices) < 1){
          return -1;
        }
        const sn_list = _.map(devices, device => {
          return device.sn
        })
        extra = sn_list.join(',');
      }
      fpm.execute('device.send', { sn: 'ffffffff', unit: '0005', op: 'SET', val, uid: 0, extra })
      return 0;
    },
    turnOffLight: async args => {
      return await fpm.execute('device.turnOnLight', _.assign(args, { val: 0 }));
    },
    checkNetwork: async args => {
      // 检查所有在线设备的网络状态，判断依据是：获取最新的心跳数据，时间大于一个值则判定是离线状态
      const { timeout = 7200000 } = fpm.getConfig('heartbeat', { timeout: 7200000 })
      fpm.M.findAndCountAsync({
        table: `( select d.sn, 0 as delflag, IFNULL(latest, 0) as latest, IFNULL(num, 0) as num FROM dvc_device d LEFT JOIN (select max(createAt) as latest, count(*) as num, sn from evt_event group by sn) e ON d.sn = e.sn where d.status = 'ONLINE' ) as T`,
        condition: `(${ _.now() } - T.latest) > ${ timeout }`,
        sort: 'sn-'
      })
      .then(data=>{
        console.log(data)
        const { count, rows } = data;
        if(count < 1) {
          return;
        }
        _.map(rows, row => {
          const { sn } = row;
          fpm.M.updateAsync({
            table: `dvc_device`,
            condition: `sn = '${sn}'`,
            row: { status: 'OFFLINE', updateAt: _.now() }
          })
        })
        // update the status and alarm it
      })
      return 1;
    },
    updateDevice: async args => {
      const { sn,fixing,op } = args
      switch (op) {
          case 'fixing':
              fpm.M.updateAsync({
                  table: `dvc_device`,
                  condition: `sn = '${sn}'`,
                  row: {fixing: fixing}
              })
              break
          case 'fixed':
              fpm.M.updateAsync({
                  table: `dvc_device`,
                  condition: `sn = '${sn}'`,
                  row: {fixing: fixing}
              })
              break
      }
      return 1
    },
    getLastAlarmInfo: async ()=> {
      const data = await fpm.M.commandAsync({ sql: `select dd.name,dv.title,dd.sn,dv.createAt,dv.id from dvc_alarm dv left join dvc_device dd on dv.sn = dd.sn order by dv.id desc limit 5 `})
      return data
    }
  }
}

exports.DeviceBiz = DeviceBiz
