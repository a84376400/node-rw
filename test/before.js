const fpmc = require('fpmc-jssdk');
const assert = require('assert');
fpmc.init({ appkey:'123123', masterKey:'123123', endpoint: `http://localhost:9994/api` })
module.exports = Object.assign(fpmc, { assert } );