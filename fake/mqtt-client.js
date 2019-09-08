const mqtt = require('mqtt');
const { mqttserver } = require('../config.json');
const client = mqtt.connect(`mqtt://${ mqttserver.host }:${ mqttserver.port }`, mqttserver);
client.on('message', (topic, message) =>{
    // message is Buffer
    console.log(topic, message.toString());
    //client.end();

    // setTimeout( () =>{
    //   // send to tcp
    //   client.publish('$s2d/tcp/push', Buffer.from('ff210032bb00010000', 'hex'))
    // }, 1000 )
});

client.on('connect', () =>{
    console.log('connected');
    // client.subscribe('$d2s/u1/p1/tianyi');
    client.publish('$s2d/tcp/push', Buffer.from('1100000100000001ff210032110001020a0a0a0ac0a80b66', 'hex'))

})


