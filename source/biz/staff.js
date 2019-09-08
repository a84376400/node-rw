const _ = require('lodash');

const StaffBiz = (fpm) => {
  return {
    createCompany: async args => {
      // 创建运维单位
      // 向 obs 表中，添加一个子条目
      const { name, phone, contact, address } = args;
      // TODO: check exists
      // get the root company obs
      try {
        const record = await fpm.M.firstAsync({
          table: 'usr_obs',
          condition: {
            code: 'COMPANY',
          }
        })

        if (_.isEmpty(record)) {
          throw new Error('COMPANY root OBS not exists~')
        }
        // get pid, make code and be
        const { id, role_id, profile_id, desktop_id } = record;
        const NOW = _.now();
        const row = { pid: id, name, phone, contact, address, code: 'SUBCOMPANY', role_id, profile_id, desktop_id, createAt: NOW, updateAt: NOW };
        const data = await fpm.M.createAsync({
          table: 'usr_obs',
          row,
        })
        return data;
      } catch (error) {
        fpm.logger.error(error );
        return Promise.reject({
          errno: -9002,
          message: '系统错误',
          error,
        })
      }
    },
    getSigninRecord: async args => {
      try {
        const NOW = new Date();
        const { uid, year = NOW.getFullYear(), month = NOW.getMonth() + 1 } = args;
        const record = await fpm.M.firstAsync({
          table: 'opt_signin_record',
          condition: {
            uid,
            month,
            year,
          }
        })

        if (_.isEmpty(record)) {
          // no record.
          return Promise.reject({
            errno: -9002,
            message: 'no record',
          })
        }
        return record;
      } catch (error) {
        fpm.logger.error(error );
        return Promise.reject({
          errno: -9002,
          message: '系统错误',
          error,
        })
      }
    },
    signin: async args => {
      try {
        // make an point
        const NOW = new Date();
        const { uid, date = NOW.getDate(), year = NOW.getFullYear(), month = NOW.getMonth() + 1 } = args;
        const record = await fpm.M.firstAsync({
          table: 'opt_signin_record',
          condition: {
            uid,
            month,
            year,
          }
        })
        let newRow;
        if (_.isEmpty(record)) {
          // not exists, create new
          const row = { uid, month, year, };
          row['d' + date] = 1;
          await fpm.M.createAsync({
            table: 'opt_signin_record',
            row,
          })
          newRow = row;
        }else{
          // update
          const row = {};
          row['d' + date ] = 1;
          await fpm.M.updateAsync({
            table: 'opt_signin_record',
            condition: {
              id: record.id
            },
            row,
          })
          newRow = _.assign(record, row);
        }
        return newRow;
      } catch (error) {
        fpm.logger.error(error );
        return Promise.reject({
          errno: -9002,
          message: '系统错误',
          error,
        })
      }
    },
  }
}
exports.StaffBiz = StaffBiz
