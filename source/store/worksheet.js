const _ = require('lodash');

const getNow = () => {
  return _.now();
}
const Worksheet = (M) => {
  return {
    createWorksheetCode: args => {
      return `W${ _.now() }`;
    },
    dispatchWorksheet: async (args) => {
      // create a worksheet
      // let data = {};
      // const NOW = getNow();
      // try{
      //     const data = await M.createAsync({
      //         table: 'opt_worksheet',
      //         row: _.assign({ createAt: NOW, updateAt: NOW, status: 'TODO' }, data)
      //     })
      //     return Promise.resolve({ data: {
      //         id: data.id
      //     } });
      // }catch(e){
      //     return Promise.reject({ errno: -2001, error: e });
      // }
      // return {}
    },
    listWorksheet: async (args) => {

      try {
        let params = {
          table: `(SELECT ws.*, d.name, d.ip, d.gps_lat, d.gps_lng, o.name as company, a.name as area, (select nickname from usr_userinfo where id = ws.dispatcher_id) as dispatcher, u.nickname as staff, u.mobile, u.enable as staff_status
          FROM opt_worksheet ws, usr_obs o, dvc_device d, dvc_area a, usr_userinfo u
          WHERE ws.company_id = o.id and ws.delflag = 0 and ws.sn = d.sn and d.area_id = a.id and staff_id = u.id)
                        as v_ws`,
          skip: (parseInt(args.page || 1) - 1) * 10,
          condition: ' 1 = 1 ',
        }
        const {
          status,
          keywords
        } = args;
        if (!_.isEmpty(status)) {
          params.condition += ` and status like '%${ status }%'`
        }
        if (!_.isEmpty(keywords)) {
          params.condition += ` and (name like '%${ keywords }%' or code like '%${ keywords }%')`
        }
        const result = await M.findAndCountAsync(params)
        return Promise.resolve(result)
      } catch (e) {
        return Promise.reject({
          errno: -9003,
          message: '系统错误',
          error: e
        })
      }

    },
    fix: async args => {
      const {
        reason = '', remark = '', duration = '1', code
      } = args
      const now = _.now();
      const data = await M.updateAsync({
        table: 'opt_worksheet',
        condition: `code='${code}'`,
        row: {
          status: 'FIXED',
          updateAt: now,
          reason,
          remark,
          duration
        },
      });
      return data;
    },
    getWorksheet: async (args) => {

    },
    feedback: async (args) => {

    },
  }
}

module.exports = Worksheet;