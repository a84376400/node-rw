const _ = require('lodash');

const Trouble = (M) => {
  return {
    // fix the trouble by device automaiticlly!
    autoFixTroubleByDevice: async data => {
      const NOW = _.now();
      const { id, sn, code } = data;
      let condition, one;
      if(!!id){
        condition = ` id = ${id}`;
      }else{
        // no id , use sn and code to get trouble;
        condition = `sn = '${ sn }' and status in (0, 1) and code = '${code}'`
      }
      try {
        one = await M.firstAsync({
          table: 'opt_trouble',
          condition
        })
        trouble_id = one.id;  
      } catch (error) {
      }
      // one.id should exists
      if(!one || !one.id){
        return Promise.reject({
          errno: -9003,
          message: '该错误不存在',
        })
      }
      try {
        await M.updateAsync({
          table: 'opt_trouble',
          condition: ` id = ${ one.id }`,
          row: {
            status: 2, fixAt: NOW, updateAt: NOW,
          }
        })
        if(one.status === 1){
          // it's connect an worksheet
          const worksheet = await M.firstAsync({
            table: 'opt_worksheet',
            condition: `trouble_id = ${ one.id }`
          });
          let duration = (NOW - worksheet.createAt) / 1000 / 60 / 60;
          if(isNaN(duration)){
            duration = 1;
          }
          duration = Math.ceil(duration);
          await M.updateAsync({
            table: 'opt_worksheet',
            condition: `trouble_id = ${ one.id }`,
            row: {
              status: 'FIXED',
              updateAt: NOW,
              remark: `${worksheet.remark || ''} \n设备反馈： 已修复`,
              duration,
            },
          });
        }
        return one;
      } catch (error) {
        return Promise.reject({
          errno: -9003,
          message: '系统错误',
          error
        })
      }
    },
    // get troubles of one device
    getUnFixedTroublesByDevice: async data => {
      try{
        const rows = await M.findAsync({
          table: 'opt_trouble',
          condition: ` sn = '${ data.sn }' and status in ( 1, 0 ) and fixAt = 0 `,
        })
        // nothing.
        if(_.size(rows) < 1){
          return {}
        }
        // return a map use the trouble code to be the key.
        return _.keyBy(rows, 'code');
      }catch (e) {
        return Promise.reject({
          errno: -9003,
          message: '系统错误',
          error: e
        })
      }
    },
    // 同一个设备存在一个未处理的同样的异常
    isTroubleExist: async data=> {
      try{
        const count = await M.countAsync({
          table: 'opt_trouble',
          condition: ` sn = '${ data.sn }' and relay = '${ data.relay}' and code = '${ data.code }' and status in ( 1, 0 )`,
        })
        return count > 0;
      }catch (e) {
        return Promise.reject({
          errno: -9003,
          message: '系统错误',
          error: e
        })
      }
    },
    createTrouble: async data => {
      try{
        const NOW = _.now();
        // get devcie info before
        const device = await M.firstAsync({
          table: 'dvc_device',
          condition: `sn = '${ data.sn }'`
        });

        const one = await M.createAsync({
          table: 'opt_trouble',
          row: _.assign({ createAt: NOW, updateAt: NOW, fixAt: 0, status: 0,relay: ''}, 
            { device: device.name, ip: device.ip, area_id: device.area_id, message: `${ device.name } ${ data.title }` }, data)
        })
        return one;
      }catch (e) {
        return Promise.reject({
          errno: -9003,
          message: '系统错误',
          error: e
        })
      }
    },
    createCameraTrouble: async data => {
      try{
        const NOW = _.now();
        // get devcie info before
        const device = await M.firstAsync({
          table: 'dvc_device',
          condition: `sn = '${ data.sn }'`
        });
        
        const camera = await M.firstAsync({
          table: 'dvc_camera',
          condition: `device_sn = '${ data.sn }' and ip = '${ data.ip }'`
        })
        const row =  _.assign({ createAt: NOW, updateAt: NOW, fixAt: 0, status: 0, relay: ''}, 
          { device: device.name, area_id: device.area_id,ip: camera.ip, title: `${ camera.name } 摄像机异常`, message: `${ device.name }-${ camera.name} 摄像机异常` }, data)

        const one = await M.createAsync({
          table: 'opt_trouble',
          row,
        })
        return _.assign( row, { id: one.id, });
      }catch (e) {
        return Promise.reject({
          errno: -9003,
          message: '系统错误',
          error: e
        })
      }
    },
    createAlarm: async data => {
      try{
        const NOW = _.now();

        const one = await M.createAsync({
          table: 'dvc_alarm',
          row: _.assign({ createAt: NOW, updateAt: NOW }, data)
        })
        return one;
      }catch (e) {
        return Promise.reject({
          errno: -9003,
          message: '系统错误',
          error: e
        })
      }
    },
  }
};


module.exports = Trouble;