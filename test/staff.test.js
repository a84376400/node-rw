const { assert, Func } = require('./before.js');

describe('Staff', function(){

  it('Sign', function(done){
    var func = new Func('staff.signin');
    func.invoke({ uid: 3 })
      .then(function(data){
        console.log(JSON.stringify(data, null, 2))
        done();
      }).catch(function(err){
        done(err);
      })
  })

  it('staff.getrecord', function(done){
    var func = new Func('staff.getSigninRecord');
    func.invoke({ uid: 3 })
      .then(function(data){
        console.log(JSON.stringify(data, null, 2))
        done();
      }).catch(function(err){
        done(err);
      })
  })

  it('staff.createCompany', function(done){
    var func = new Func('staff.createCompany');
    func.invoke({ name: 'yunplus', phone: '13770683580', contact: 'price', address: 'babababa' })
      .then(function(data){
        console.log(JSON.stringify(data, null, 2))
        done();
      }).catch(function(err){
        done(err);
      })
  })
})
