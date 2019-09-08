const { assert, Func } = require('./before.js');

describe('Function', function(){

  it('ListTrouble', function(done){
    var func = new Func('trouble.list');
    func.invoke({})
      .then(function(data){
        console.log(data)
        done();
      }).catch(function(err){
        done(err);
      })
  })

})
