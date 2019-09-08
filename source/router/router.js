const _ = require('lodash');
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const excelPort = require('excel-export')
const send = require('koa-send')
const moment = require('moment')
const { TROUBLE } = require('../kit/error.json')

const write = (postData) => {
   //定义对象，存放内容
   let conf = {}
   //定义表头
   conf.cols = [
     {caption: '点位名称',type: 'string', width: 20},
     {caption: '设备SN',type: 'string', width: 25},
     {caption: '等级',type: 'string', width: 8},
     {caption: '问题描述',type: 'string', width: 50},
     {caption: '告警时间',type: 'string', width: 18},
     {caption: '修复时间',type: 'string', width: 18},
     {caption: '状态',type: 'string', width: 10},
     {caption: '故障类型',type: 'string', width: 10},
   ]
   //创建一个数组用来多次遍历行数据
   let array = []
   //循环导入数据
   for(let i=0; i<postData.length;i++){
     //依次写入
     array[i] = [
       postData[i].device,
       postData[i].sn,
       (postData[i].level === 1) ? '异常' : '告警',
       postData[i].message,
       moment(postData[i].createAt).format('YYYY-MM-DD HH:mm'),
       postData[i].status === 2 ? moment(postData[i].fixAt).format('YYYY-MM-DD HH:mm') : '',
       (postData[i].status === 0) ? '待处理' : ((postData[i].status === 1) ? '处理中' : '已处理'),
       TROUBLE[postData[i].code][`1`],
     ]
   }
   //写入conf对象
   conf.rows = array
   //生成表格
   let result = excelPort.execute(conf)
   fs.writeFileSync('./mock/demo.xlsx',result,'binary')
}

module.exports = fpm => {
  const router = fpm.createRouter();

  router.post('/api/download', async (ctx, next) => {

    let postData = ctx.request.body
    let file = write(postData)
    let path = './mock/demo.xlsx'
    ctx.attachment(path)
    await send(ctx, path)
  })

  fpm.bindRouter(router);

}