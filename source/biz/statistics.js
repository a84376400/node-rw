const _ = require('lodash')

const getToday00 = () =>{
  const date = new Date();
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return today.getTime();

}
const StatisticsBiz = (fpm) => {
  return {
    dashboard: async (args) => {
      const datas = {};
      const today = getToday00();
      try {
        const a = {}, b = {}, c = {};
        a.a1 = await fpm.M.countAsync({
          table: 'opt_worksheet',
          condition: `status = 'TODO'`
        });

        a.a2 = await fpm.M.countAsync({
          table: 'opt_trouble',
          condition: `createAt >= ${ today }`
        })

        a.a3 = await fpm.M.countAsync({
          table: 'opt_worksheet',
          condition: `status = 'DOING'`
        })

        a.a41 = await fpm.M.countAsync({
          table: 'dvc_device',
          condition: `status in ('ONLINE', 'OFFLINE')`
        })

        a.a42 = await fpm.M.countAsync({
          table: 'dvc_device',
          condition: `status = 'ONLINE'`
        })

        datas.a = a;

        c.c1 = await fpm.M.countAsync({
          table: 'dvc_device',
          condition: `createAt >= ${ today }`
        })

        // TODO:
        c.c21 = 2;
        c.c22 = 1;

        // 7 故障率
        c.c3 = 1.1;

        c.c4 = 0.15;

        datas.c = c;
      } catch (error) {
        console.log(error)
      }
      return datas;
    },
      test: () => {

      }
  }
}

exports.StatisticsBiz = StatisticsBiz
