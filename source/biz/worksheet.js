const _ = require('lodash');
const {
  Worksheet
} = require('../store');

const WorksheetBiz = fpm => {
  const wsStore = Worksheet(fpm.M);
  return {
    list: async args => {
      let data = await wsStore.listWorksheet(args);
      return data;
    },
    createCode: args => {
      return wsStore.createWorksheetCode();
    },
    dispatch: async args => {
      // dispath a worksheet
      let data = await wsStore.dispatchWorksheet(args);
      return data;
    }
  }
}

exports.WorksheetBiz = WorksheetBiz;