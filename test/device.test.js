const { assert, Func } = require('./before.js');

describe('Device Function', function(){

  /*
  it('getState', function(done){
    var func = new Func('device.getState');
    func.invoke({sn: 'fffefdfc'})
      .then(function(d){
        // console.info(d)
        done();
      }).catch(function(err){
        done(err);
      });
  })

  it('getRegisters', function(done){
    var func = new Func('device.getRegisters');
    func.invoke({sn: 'fffefdfc'})
      .then(function(d){
        // console.info(d)
        done();
      }).catch(function(err){
        done(err);
      });
  })

  it('Turn 0004[风机] On of device which sn is fffefdfc', function(done){
    var func = new Func('device.send');
    func.invoke({"sn": "fffe9928", "unit": "0004", "op": "SET", "val": 1, "uid": 1, "network": "NB"})
      .then(function(d){
        console.info(d)
        done();
      }).catch(function(err){
        console.error(err)
        done(err);
      });
  })

  it('Turn 0004[风机] On of device which sn is fffefdfc', function(done){
    var func = new Func('device.send');
    func.invoke({sn: 'fffe9928', unit: '0004', op: 'SET', val: 1, uid: 1})
      .then(function(d){
        console.info(d)
        done();
      }).catch(function(err){
        console.error(err)
        done(err);
      });
  })

  it('getOnlineDevice', function(done){
    var func = new Func('socket.getOnlineDevice');
    func.invoke({})
      .then(function(d){
        console.info(d.data.rows)
        done();
      }).catch(function(err){
        done(err);
      });
  })

  it('getCommands', function(done){
    var func = new Func('device.getCommands');
    func.invoke({sn: 'fffefdfc'})
      .then(function(d){
        // console.info(d.data)
        done();
      }).catch(function(err){
        done(err);
      });
  })
  //*/

  /*
  it('turnOnLight', function(done){
    var func = new Func('device.turnOnLight');
    func.invoke({ area: 1 })
      .then(function(d){
        done();
      }).catch(function(err){
        done(err);
      });
  }) //*/

  it('Turn 0004[风机] On of device which sn is fffefdfc', function(done){
    var func = new Func('device.send');
    func.invoke({sn: 'ff210032', unit: '0004', op: 'SET', val: 1, uid: 1, network: 'NB'})
      .then(function(d){
        console.info(d)
        done();
      }).catch(function(err){
        console.error(err)
        done(err);
      });
  })

  /*
  it('turnOffLight', function(done){
    var func = new Func('device.turnOffLight');
    func.invoke({ area: 1 })
      .then(function(d){
        done();
      }).catch(function(err){
        done(err);
      });
  })//*/

})