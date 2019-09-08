const _ = require('lodash');
const { Trouble } = require('../store');
const send = require('koa-send')


const TroubleBiz = fpm => {
    const trStore = Trouble(fpm.M);
    return {
        list: async args => {
            let data = await trStore.listTrouble(args);
            return data;
        },
        getLatestTroubleInfo: async (ctx) => {
            let data = {
                arr: {}
            }
            const len = await fpm.M.countAsync({
                table: 'opt_trouble',
                condition: `status in (0,1)`
              });
            _.assign(data, {len: len})
            const troubleArr = await fpm.M.commandAsync({ sql: `select dd.name,ot.title,dd.sn,ot.createAt,ot.id, ot.status from opt_trouble ot left join dvc_device dd on ot.sn = dd.sn where ot.status in (0,1) order by ot.id desc limit 5`}) 
            _.assign(data.arr, troubleArr)
            return data
        }
    }
}

exports.TroubleBiz = TroubleBiz;
