const { assert, Func } = require('./before.js');

describe('Function', function(){

  it('ListWorksheet', function(done){
    var func = new Func('worksheet.list');
    func.invoke({keywords: '91', status: 'TODO'})
      .then(function(data){
        console.log(data)
        done();
      }).catch(function(err){
        done(err);
      })
  })

  it('createCode', function(done){
    var func = new Func('worksheet.createCode');
    func.invoke({})
      .then(function(data){
        console.log(data); // W1540343340831
        done();
      }).catch(function(err){
        done(err);
      })
  })

  // it('dispatch', function(done){
  //   var func = new Func('worksheet.dispatch');
  //   func.invoke({})
  //     .then(function(data){
  //       console.log(data)
  //       done();
  //     }).catch(function(err){
  //       done(err);
  //     })
  // })

})
