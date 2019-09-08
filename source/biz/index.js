const StatisticsBiz = require('./statistics.js').StatisticsBiz;
const DeviceBiz = require('./device.js').DeviceBiz;
const StaffBiz = require('./staff.js').StaffBiz;
const WorksheetBiz = require('./worksheet.js').WorksheetBiz;
const TroubleBiz = require('./trouble.js').TroubleBiz;

const MessageReceiver = require('../logic/MessageReceiver.js').MessageReceiver;
const cache = require('memory-cache');

const init = (fpm, biz) => {
  // inject the cache component
  fpm.cache = cache;
  biz.addSubModules('statistics', StatisticsBiz(fpm));
  biz.addSubModules('device', DeviceBiz(fpm));
  biz.addSubModules('staff', StaffBiz(fpm));
  biz.addSubModules('worksheet', WorksheetBiz(fpm));
  biz.addSubModules('trouble', TroubleBiz(fpm));

  new MessageReceiver(fpm);
}

exports.init = init;