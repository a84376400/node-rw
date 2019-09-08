const _ = require('lodash')
const cache = require('memory-cache');
const Worksheet = require('./worksheet.js');
const Trouble = require('./trouble.js');
const dataCache = new cache.Cache();

const getNow = () => {
  return _.now();
}
const Message = (M) => {
  return {
    saveBroadcastMessage: async (args) => {
      const NOW = getNow()
      try {
        let message = args.message
        if (_.isPlainObject(message)) {
          message = JSON.stringify(message)
        }
        const data = await M.createAsync({
          table: 'msg_message',
          row: {
            content: message,
            createAt: NOW,
            updateAt: NOW,
            channel: args.channel || 'ALL',
            status: 'DONE',
            method: 'broadcast'
          }
        })
        return {
          data: {
            id: data.id
          }
        };
      } catch (e) {
        return Promise.reject({
          errno: -2001,
          error: e
        });
      }
    },
    saveSendMessage: async (args) => {
      const NOW = getNow()
      try {
        let {
          message,
          clientId,
          val,
          unit,
          uid
        } = args
        if (_.isPlainObject(message)) {
          message = JSON.stringify(message)
        }
        const data = await M.createAsync({
          table: 'msg_message',
          row: {
            content: message,
            unit,
            val,
            uid,
            createAt: NOW,
            updateAt: NOW,
            channel: '',
            status: 'DONE',
            method: 'send',
            clientId: args.clientId
          }
        })
        return {
          data: {
            id: data.id
          }
        };
      } catch (e) {
        return Promise.reject({
          errno: -2002,
          error: e
        });
      }
    },
    getCommands: async args => {
      try {
        const {
          limit = 20, page = 1
        } = args
        const data = await M.findAndCountAsync({
          table: 'msg_message m, (select nickname, id as user_id from usr_userinfo) u',
          condition: `clientId = '${args.sn}' and user_id = uid`,
          sort: 'createAt-',
          limit,
          skip: (page - 1) * limit,
        })
        return {
          data
        }
      } catch (e) {
        return Promise.reject({
          errno: -2003,
          error: e
        });
      }
    },
    feedbackBroadcastMessage: () => {}
  }
}
/*事务的存储以及获取*/
exports.Event = (M) => {

  return {
    saveEvent: async (event) => {
      const NOW = getNow()
      try {
        const data = await M.createAsync({
          table: 'evt_event',
          row: _.assign({
            createAt: NOW,
            updateAt: NOW,
            status: 'DEFAULT'
          }, event)
        })
        return {
          data: {
            id: data.id
          }
        };
      } catch (e) {
        return Promise.reject({
          errno: -2001,
          error: e
        });
      }
    },
    getLatest: async sn => {
      try {
        const data = await M.firstAsync({
          table: 'evt_event',
          condition: `sn = '${sn}' and fn in ('PUSH')`,
          sort: 'createAt-',
        })
        if (_.isEmpty(data)) {
          return Promise.reject({
            errno: -2001,
            message: 'not received yet'
          });
        }
        return {
          data
        }
      } catch (e) {
        return Promise.reject({
          errno: -2001,
          error: e
        });
      }
    }
  }
}

exports.Message = Message

exports.Device = (M) => {
  return {
    findDeviceInfo: async args => {
      const { sn, flush = false, } = args
      try {
        let cachedName = dataCache.get(`#sn:${sn}/device/name`);
        if(false !== flush && cachedStatus !== null){
          return cachedName;
        }
        const record = await M.firstAsync({
            table: 'dvc_device',
            condition: `sn='${sn}'`,
            fields: 'name'
        })
        if (_.isEmpty(record)) {
            throw new Error('the device not exist')
        }
        dataCache.put(`#sn:${sn}/device/name`, record.name, 10 * 60 * 60);
        return record.name
      } catch (e) {
          return Promise.reject({
              error: e
          })
      }
    },
    checkExists: async args => {
      const {
        sn,
        flush = false,
      } = args;
      try {
        let cachedStatus = dataCache.get(`#sn:${sn}/device/exists`);
        if(false !== flush && cachedStatus !== null){
          return cachedStatus;
        }
        const count = await M.countAsync({
          table: 'dvc_device',
          condition: `sn='${sn}' and delflag = 0`
        })
        const flag = count === 1;
        dataCache.put(`#sn:${sn}/device/exists`, flag, 10 * 60 * 60);
        return flag

      } catch (error) {
        return Promise.reject({
          error
        })
      }
    },
    getCameraStatus: async args => {
      const {
        sn,
        ip,
        flush = false,
      } = args;
      try {
        let cachedStatus = dataCache.get(`#sn:${sn}/camera/${ip}/status`);
        if(false !== flush && cachedStatus !== null){
          return cachedStatus;
        }
        const data = await M.firstAsync({
          table: 'dvc_camera',
          condition: `device_sn='${sn}' and ip = '${ip}'`,
          fields: 'status',
        })
        const status = (data.status === 'ONLINE'? 0: 1);
        dataCache.put(`#sn:${sn}/camera/${ip}/status`, status);
        return status

      } catch (error) {
        return Promise.reject({
          error
        })
      }
    },
    setCameraStatus: async args => {
      const {
        sn,
        ip,
        status,
      } = args;
      try {
        // ignore if cached the status
        let cachedStatus = dataCache.get(`#sn:${sn}/camera/${ip}/status`);
        if (cachedStatus === status) {
          return status
        }
        await M.updateAsync({
          table: 'dvc_camera',
          condition: `device_sn='${sn}' and ip = '${ip}'`,
          row: {
            status: status === 1? 'OFFLINE': 'ONLINE',
          },
        })
        // change the cache
        dataCache.put(`#sn:${sn}/camera/${ip}/status`, status, 10 * 60 * 1000); // cache 10 min's
        return status
      } catch (e) {
        if (e.errno == -1004) {
          return status
        }
        return Promise.reject({
          error: e
        })
      }
    },
    bindNb: async args => {
      // bind sn
      const {
        sn,
        nb
      } = args
      try {
        let cachedNb = dataCache.get(`#sn:${sn}/nb`);
        if (cachedNb == nb) {
          // the same as the cached data
          return nb
        }
        await M.updateAsync({
          table: 'dvc_device',
          condition: `sn='${sn}' and nb != '${nb}'`,
          row: {
            nb
          },
        })
        // change the cache
        dataCache.put(`#sn:${sn}/nb`, nb);
        return nb
      } catch (e) {
        // ???
        if (e.errno == -1004) {
          return nb
        }
        return Promise.reject({
          error: e
        })
      }
    },
    getCameras: async args => {
      // get all cameras by the device's sn
      const {
        sn
      } = args
      try {
        const data = await M.findAsync({
          table: 'dvc_camera',
          condition: `device_sn='${sn}'`,
          fields: 'name, stream_id, ip, brand, admin_name, admin_pass, channel, stream_port, camera_sn, status',
          limit: 50,
        })
        return data
      } catch (e) {
        return Promise.reject({
          error: e
        })
      }
    },
    getNb: async args => {
      try {
        const {
          sn
        } = args
        let nb = dataCache.get(`#sn:${sn}/nb`);
        if (nb) {
          return nb
        }
        const data = await M.firstAsync({
          table: 'dvc_device',
          condition: `sn='${sn}'`,
          fields: 'nb',
        })
        dataCache.put(`#sn:${sn}/nb`, data.nb);
        return data.nb
      } catch (e) {
        return Promise.reject({
          error: e
        })
      }
    },
    changeState: async args => {
      const {
        sn,
        status
      } = args
      try {
        // ignore if cached the status
        let cachedStatus = dataCache.get(`#sn:${sn}/status`);
        if (cachedStatus === status) {
          return status
        }
        await M.updateAsync({
          table: 'dvc_device',
          condition: `sn='${sn}'`,
          row: {
            status
          },
        })
        // change the cache
        dataCache.put(`#sn:${sn}/status`, status, 10 * 60 * 1000); // cache 10 min's
        return status
      } catch (e) {
        if (e.errno == -1004) {
          return status
        }
        return Promise.reject({
          error: e
        })
      }
    },
    // make a flag if the device in fix mode ?
    // find the worksheet by the device's sn code, the status equal `FIXING`
    isInFixMode: async args => {
      try {
        const {
          sn
        } = args
        let cachedFixMode = dataCache.get(`#sn:${sn}/fixMode`);
        if(cachedFixMode === true || cachedFixMode === false){
          return cachedFixMode;
        }
        const data = await M.countAsync({
          table: 'opt_worksheet',
          condition: `sn='${sn}' and status= 'FIXING'`,
        })
        cachedFixMode = (data === 1);
        dataCache.put(`#sn:${sn}/fixMode`, cachedFixMode, 10 * 60 * 1000);
        return cachedFixMode;
      } catch (e) {
        return Promise.reject({
          error: e
        })
      }
    },
    // get the device's area setting
    // device > area > root > default
    getSetting: async args => {

    },


    getState: async args => {
      try {
        const {
          sn
        } = args
        /*先从缓存中获取该设备的状态
        * 如果缓存中不存在就从数据库获取并更新缓存*/
        let status = dataCache.get(`#sn:${sn}/status`);
        if (status) {
          return status
        }
        const data = await M.firstAsync({
          table: 'dvc_device',
          condition: `sn='${sn}'`,
          fields: 'status',
        })
          /*从数据库中获取该设备的状态然后更新到缓存中*/
        dataCache.put(`#sn:${sn}/status`, data.status);
        return data.status
      } catch (e) {
        return Promise.reject({
          error: e
        })
      }
    },
  }
}

exports.Worksheet = Worksheet;

exports.Trouble = Trouble;
