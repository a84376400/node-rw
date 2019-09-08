const _ = require('lodash')
const crypto = require('crypto')
const protocol = require('./protocol')
const { spawnSync } = require('child_process');

const randomStr = (bytes = 4) => {
  return crypto.randomBytes(bytes).toString('hex');
}

const getIp = (ip) => {
  const reg = /(?=(\b|\D))(((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))(?=(\b|\D))$/
  if(reg.test(ip)){
    let ipv4 = reg.exec(ip)[0]
    return ipv4
  }
  return ip
}

const pingHost = ip => {
  
  const ping = spawnSync('ping', [ip, '-c', 3, '-q'], { timeout: 10 * 1000 });
  const { status, error, stderr } = ping;
  if( status == 0 ){
    return true;
  }
  return { error, stderr: stderr.toString() };
}

exports.randomStr = randomStr
exports.getIp = getIp
exports.pingHost = pingHost;
exports.protocol = protocol