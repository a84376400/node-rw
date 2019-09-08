const assert = require('assert');
const _ = require('lodash');
const hexToString = (hex, bytes = 1) => {
  return _.padStart(hex.toString('hex'), bytes * 2, '0');
}
const { generateHex, parseHex } = require('../source/kit').protocol

describe('The latest protocol-11 Function', function(){

  it('generateHex GET/SET', function(done){
    //fffefdfc030001000e
    var hex = generateHex('fffefdfc', 'GET', 1)
    assert( hex === 'fffefdfc03000100010011' )
    hex = generateHex('fffefdfc', 'SET', 2, '0001', '1')
    assert( hex === 'fffefdfc1000020001000101')

    hex = generateHex('fffefdfc', 'SET', 2, '0001', '1', true)
    assert( hex === '1000020cfffefdfc1000020001000101', 'the hex is ' + hex)
    done()
  })

  it('generateHex REBOOT', function(done){
    var hex = generateHex('ff210032', 'REBOOT', 1)
    assert( hex === 'ff210032ff00010000' )
    done()
  })

  it('generateHex FIX_MODE', function(done){
    var hex = generateHex('ff210032', 'FIX_MODE', 1)
    assert( hex === 'ff210032a10001' )
    done()
  })

  it('generateHex SELF_CHECK', function(done){
    var hex = generateHex('ff210032', 'SELF_CHECK', 1)
    assert( hex === 'ff210032b10001' )
    done()
  })

  it('generateHex RESET_MODE', function(done){
    var hex = generateHex('ff210032', 'RESET_MODE', 1)
    assert( hex === 'ff210032a20001' )
    done()
  })

  it('generateHex PUT_SETTING', function(done){
    //fffefdfc030001000e
    
    const minTBuf = Buffer.alloc(1, -5);
    const maxTBuf = Buffer.alloc(1, 35);
    const minVBuf = Buffer.alloc(1, 22);
    const maxVBuf = Buffer.alloc(1, 26);
    const maxEBuf = Buffer.alloc(2, 800);
    const settingData = `${hexToString(minTBuf)}${hexToString(maxTBuf)}${hexToString(minVBuf)}${hexToString(maxVBuf)}${hexToString(maxEBuf)}`;
    
    var hex = generateHex('ffffffff', 'PUT_SETTING', 1, undefined, settingData)
    assert( hex === 'ffffffff800001fb23161a2020' )
    done()
  })

  it('generateHex Camera_ips', function(done){
    var hex = generateHex('ff210032', 'SET_CAMERA', 1, undefined, [ '10.10.10.10', '10.10.10.11'])
    assert( hex === 'ff210032110001020a0a0a0a0a0a0a0b' )
    hex = generateHex('ff210032', 'SET_CAMERA', 1, undefined, '10.10.10.10,10.10.10.11')
    assert( hex === 'ff210032110001020a0a0a0a0a0a0a0b' )
    done()
  })


  it('parseHex REBOOT/ONLINE/OFFLINE/FIX_MODE/RESET_MODE', function(done){
    var info = parseHex(Buffer.from('ff210032ff00010000', 'hex'))
    assert(info.sn === 'ff210032')
    assert(info.fn === 'REBOOT')

    info = parseHex(Buffer.from('ff210032a100010000', 'hex'))
    assert(info.sn === 'ff210032')
    assert(info.fn === 'FIX_MODE')

    info = parseHex(Buffer.from('ff210032a200010000', 'hex'))
    assert(info.sn === 'ff210032')
    assert(info.fn === 'RESET_MODE')

    done()
  })

  it('parseHex Trouble/Alarm', function(done){
    let info = parseHex(Buffer.from('ff210032e1000100', 'hex'))
    assert(info.sn === 'ff210032')
    assert(info.fn === 'ALARM')
    assert(info.alarms.a1 === 0)
    assert(info.alarms.a2 === 1)
    assert(info.alarms.a3 === 0)
    
    info = parseHex(Buffer.from('ff210032e20001000000', 'hex'))
    assert(info.sn === 'ff210032')
    assert(info.fn === 'TROUBLE')
    assert(info.troubles.t1 === 0)
    assert(info.troubles.t2 === 1)
    assert(info.troubles.t3 === 0)
    assert(info.troubles.t4 === 0)
    assert(info.troubles.t5 === 0)

    done()
  })

  it('parseHex Camera ip alarm', function(done){
    let info = parseHex(Buffer.from('ff210032e300c0a80bfb', 'hex'))
    assert(info.sn === 'ff210032')
    assert(info.fn === 'CAMERA_TROUBLE')
    assert(info.code === 0)
    assert(info.ip === `192.168.11.251`)
    
    info = parseHex(Buffer.from('ff210032e301c0a80bfa', 'hex'))
    assert(info.sn === 'ff210032')
    assert(info.fn === 'CAMERA_TROUBLE')
    assert(info.code === 1)
    assert(info.ip === `192.168.11.250`)

    done()
  })


  it('parseHex auto info', function(done){
    //fffefdfc030001000e
    var info = parseHex(Buffer.from('fffefdfcaa000100120000000000000000000000003c0100000000', 'hex'))

    assert(info.sn === 'fffefdfc')
    assert(info.fn === 'PUSH')
    assert(info.start === 0x01)
    assert(info.length === 0x12)
    assert(info.registers['0001'].val === 0)
    assert(info.registers['000d'].val === 0x3c01)
    done()
  })

})
