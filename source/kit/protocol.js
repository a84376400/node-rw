const _ = require('lodash')

const REGISTER_LIST = require('./registers.json');

/**
[
{ "id": 1,
    "addr": "0001",
    "name": "光端机",
    "length": 1,
    "rw": 3,
    "type": "Boolean",
    "val": 0,
    "getWriteHex":0 },

{ "id": 2,
    "addr": "0002",
    "name": "摄像机",
    "length": 1,
    "rw": 3,
    "type": "Boolean",
    "val": 0,
    "getWriteHex":0 },

...

{ "id": 15,
    "addr": "000f",
    "name": "电压(V)",
    "length": 2,
    "rw": 2,
    "type": "UInt16",
    "val": 0,
    "getWriteHex":0 },

{ "id": 17,
    "addr": "0011",
    "name": "电流(mA)",
    "length": 2,
    "rw": 2,
    "type": "UInt16",
    "val": 0,
    "getWriteHex":0 }
]
 */

// the max register address
const MAX_REGISTER_ADDR = _.last(REGISTER_LIST)['id']

_.forEach(REGISTER_LIST, (register, index) => {
  register.getWriteHex = (val) => {
    if (register.rw == 3 || register.rw == 2) {
      const buf = Buffer.allocUnsafe(register.length)
      buf.writeIntBE(val, 0, register.length)
      return `${register.addr}000${ register.length }${ buf.toString('hex') }`
    } else {
      return
    }
  }
})


const REGISTER = _.keyBy(REGISTER_LIST, 'addr')
const REGISTER_KEY_ID = _.keyBy(REGISTER_LIST, 'id')
const REGISTER_ADDR = _.keys(REGISTER_KEY_ID)

// function code
const FUNCTION_CODE = {
  GET: 0x03,
  SET: 0x10,
  SET_CAMERA: 0x11,
  PUSH: 0xAA,
  PUSH_TIME: 0xf1,
  REBOOT: 0xff,
  PUT_SETTING: 0x80,
  GET_SETTING: 0x81,
  SET_LED: 0x82,
  GET_DEVICE_INFO: 0x83,
  SELF_CHECK: 0xb1,
  ALARM: 0xe1,
  TROUBLE: 0xe2,
  CAMERA_TROUBLE: 0xe3,
  FIX_MODE: 0xa1,
  RESET_MODE: 0xa2,
}

const GET_FUNCTION = (code) => {
  for (let k in FUNCTION_CODE) {
    if (FUNCTION_CODE[k] == code) {
      return k
    }
  }
}

const MAX_TROUBLE = 5; // 协议中设定的故障数

const MAX_ALARM = 3; // 协议中定义的报警数

// 生成服务端控制设备的指令
const generateHex = (sn, op, callback, unit, val, nb = false) => {
  const callbackIdHex = _.padStart(callback.toString(16), 4, '0')

  let body = '';

  switch (op) {
    case 'REBOOT':
      body = `${ sn }${ Buffer.from([FUNCTION_CODE.REBOOT]).toString('hex') }${ callbackIdHex }0000`
      break;
    case 'PUT_SETTING':
      // TODO: parse the temperature
      body = `${ sn }${ Buffer.from([FUNCTION_CODE.PUT_SETTING]).toString('hex') }${ callbackIdHex }${val}`
      break;
    case 'SET_LED':
      body = `${ sn }${ Buffer.from([FUNCTION_CODE.SET_LED]).toString('hex') }${ callbackIdHex }${val}`
      break;
    case 'PUSH_TIME':
      body = `${ sn }${ Buffer.from([FUNCTION_CODE.PUSH_TIME]) }`
    case 'GET_SETTING':
      // padding end `0000`
      body = `${ sn }${ Buffer.from([FUNCTION_CODE.GET_SETTING]).toString('hex') }${ callbackIdHex }0000`
      break;
    case 'FIX_MODE':
      body = `${ sn }${ Buffer.from([FUNCTION_CODE.FIX_MODE]).toString('hex') }${ callbackIdHex }`
      break;
    case 'SELF_CHECK':
      body = `${ sn }${ Buffer.from([FUNCTION_CODE.SELF_CHECK]).toString('hex') }${ callbackIdHex }`
      break;
    case 'RESET_MODE':
      body = `${ sn }${ Buffer.from([FUNCTION_CODE.RESET_MODE]).toString('hex') }${ callbackIdHex }`
      break;
    case 'SET_CAMERA':
      let len = 0;
      if(_.isString(val)){
        val = val.split(',');
      }
      if(_.isArray(val)){
        len = _.size(val);
      }
      len = _.padStart(len.toString(16), 2, '0')
      // convert ip string => hex
      const ips = _.map(val, ip => {
        return _.map(ip.split('.'), sub => {
          return _.padStart(parseInt(sub).toString(16), 2, '0')
        }).join('')
      }).join('')
      body = `${ sn }${ Buffer.from([FUNCTION_CODE.SET_CAMERA]).toString('hex') }${ callbackIdHex }${len}${ips}`
      break;
    case 'GET':
      // always get all register info(device)
      // Read device [ SN | FN | ADDR | LENGTH ]
      body = `${ sn }${ Buffer.from([FUNCTION_CODE.GET]).toString('hex') }${ callbackIdHex }${'0001'}${ Buffer.from([0, MAX_REGISTER_ADDR]).toString('hex') }`
      break;
    case 'SET':
      // Write device [ SN | FN | ADDR | LENGTH | DATA ]
      const register = REGISTER[unit]
      const hex = register.getWriteHex(val)

      body = `${ sn }${ Buffer.from([FUNCTION_CODE.SET]).toString('hex') }${ callbackIdHex }${ hex }`
      break;
  }

  let header = '';
  if(nb){
    header = `${Buffer.from([FUNCTION_CODE[op]]).toString('hex')}${callbackIdHex}${ _.padStart( (_.size(body) / 2).toString(16), 2, '0') }`
  }
  return `${header}${body}`;


}

// 解析从设备发送过来的 Buffer 数据
const parseHex = (hex) => {

  if (_.isString(hex)) {
    hex = Buffer.from(hex, 'hex')
  }
  if (!Buffer.isBuffer(hex)) {
    return
  }
  // 0-4 is the sn
  let sn = hex.toString('hex', 0, 4)
  // 4-5 is the fn
  let fn = GET_FUNCTION(hex.readUInt8(4))

  if( !fn ){
    // fn not defined.
    return;
  }
  if (fn === 'REBOOT' ||
      fn === 'FIX_MODE' ||
      fn === 'RESET_MODE' ||
      fn === 'SELF_CHECK' ||
      fn === 'SET_CAMERA'
      ) {
    return {
      sn,
      fn
    }
  }

  if( fn === 'CAMERA_TROUBLE'){
    const code = hex.readInt8(5); // 第5个字节存放 状态
    const ip1 = hex.readUInt8(6);
    const ip2 = hex.readUInt8(7);
    const ip3 = hex.readUInt8(8);
    const ip4 = hex.readUInt8(9);
    const payload = {
      sn,
      fn,
      code,
      ip: `${ip1}.${ip2}.${ip3}.${ip4}`, //
    }
    return payload;
  }

  if( fn === 'TROUBLE' ){
    // 设定了若干异常，从第5个字节开始读取，以此类推，最多 MAX_TROUBLE 个
    const payload = {
      sn,
      fn,
      troubles: {}
    }
    _.map(_.range(1, MAX_TROUBLE + 1), idx => {
      payload.troubles[`t${idx}`] = hex.readInt8(4 + idx)
    });

    return payload;
  }
  if( fn === 'ALARM' ){
    // 设定了若干个报警，从第5个字节开始读取，以此类推，最多 MAX_ALARM 个
    const payload = {
      sn,
      fn,
      alarms: {}
    }
    _.map(_.range(1, MAX_ALARM + 1), idx => {
      payload.alarms[`a${idx}`] = hex.readInt8(4 + idx)
    });

    return payload;
  }

  if (fn === 'PUT_SETTING' || fn === 'GET_SETTING') {
    // TODO: debug
    // 5-6 is the cb
    // 6 is the minT
    // 7 is the maxT
    const minT = hex.readInt16BE(6)
    const maxT = hex.readInt16BE(7)
    return {
      sn,
      fn,
      maxT,
      minT
    }
  }

  let addr_s = 5,
    length_s = 7,
    data_s = 9
  if (fn != 'PUSH') {
    addr_s += 2
    length_s += 2
    data_s += 2
  }
  // 5-7 is the addr
  let addr = hex.toString('hex', addr_s, addr_s + 2)

  const start = parseInt(addr, 16)
  // 7-9 is the length
  let length = hex.readUIntBE(length_s, 2)
  // 9- -1 is the data
  const position = data_s

  const info = {
    sn,
    fn,
    addr,
    start,
    length
  }
  // define the registers
  const subRegisters = _.slice(REGISTER_ADDR, start - 1) //registers id str
  info.registers = {}
  for (let i = 0, offset = 0; i < subRegisters.length; i++) {
    const rid = subRegisters[i]
    let reg = REGISTER_KEY_ID[rid]
    const len = reg.length
    // read the register data
    let val
    switch (reg.type) {
      case 'Boolean':
        val = hex.readUIntBE(position + offset, len)
        break
      case 'Onoff':
        val = hex.readUIntBE(position + offset, len)
        break
      case 'UInt16':
        val = hex.readUInt16BE(position + offset, len)
        break
      case 'Int16':
        val = hex.readInt16BE(position + offset, len)
        break
    }

    info.registers[reg.addr] = _.assign(reg, {
      val
    })
    offset += len // remove the point
    // break the cursor if out of range
    if (offset >= length) {
      break
    }
  }
  _.assign(info.registers,{
    "000a":{
      id: 10,
      addr: '000a',
      name: '功率(W)',
      length: 2,
      rw: 2,
      type: 'UInt16',
      val: (info.registers['000f'].val) * (info.registers['0011'].val)/1000 ,
      getWriteHex: [Function]
    }
  })
  return info
}

exports.REGISTER = REGISTER

exports.FUNCTION_CODE = FUNCTION_CODE
exports.generateHex = generateHex
exports.parseHex = parseHex
