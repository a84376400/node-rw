const { Fpm } = require('yf-fpm-server');
const path = require('path');

const RouterBuilder = require('./router/router.js');

const BizIniter = require('./biz').init;


const fpm = new Fpm();
const biz = fpm.createBiz('0.0.1');
/*进行依赖的装配*/
BizIniter(fpm, biz)

fpm.addBizModules(biz)

fpm.run().then( async () => {

  // curl -H "Content-Type:application/json" -X POST --data '{"id":10}' http://localhost:9994/webhook/run/biz/foo.bar
  fpm.subscribe('#webhook/run/biz', ( topic, data ) => {
      /*接收到相对应的发布之后就去执行一下的logic*/
    const { url_data } = data;
    delete data.url_data;
    fpm.execute(url_data, data)
      .catch(console.error)
  });
  /*mqtt执行订阅*/
  fpm.execute('mqttclient.subscribe', { topic: ['$d2s/u1/p1/tianyi', '$d2s/u1/p1/tcp']})
    .catch(error => console.error('Startup:error', error))

  try {
    await fpm.M.install(path.join(fpm.get('CWD'), 'sql'))
  } catch (error) {
    console.error('Meta Data Error:', error)
  }

  try {
    await fpm.M.install(path.join(fpm.get('CWD'), 'mock'))
  } catch (error) {
    console.error('Mock Data Error:', error)
  }

  // 构建自定义的路由信息
  RouterBuilder(fpm);
})

    /*处理异常*/
process.on('unhandledRejection', (error) => {
  // Will print "unhandledRejection err is not defined"
  console.error('unhandledRejection', error);
});
