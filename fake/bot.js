const net = require('net');
const _ = require('lodash');

const LOCAL_HOST = '192.168.100.196';

const PORT = 5001;

const ID = _.now();

let intervalHandle

let tryHandle

const send = ( client, data ) => {
    if(!client){
        if(intervalHandle){
            clearInterval(intervalHandle)
        }
        return
    }
    const sid = 'ff210032'
    // aa
    // data = data || Buffer.from(`0000000100000001${sid}aa0001001200000000000000000000000000000000000089`, 'hex')
    // e1
    // data = data || Buffer.from(`1100000100000001${sid}e1010101`, 'hex')
    // e2
    // data = data || Buffer.from(`1100000100000001${sid}e2010101010101`, 'hex')
    // e2 fixed
    // data = data || Buffer.from(`1100000100000001${sid}e2000000000000`, 'hex')
    // e2 offline
    // data = data || Buffer.from(`1100000100000001${sid}e2000001000000`, 'hex')
    // console.info(data.toString('hex'), data)
    // e3
    // data = data || Buffer.from(`1100000100000001${sid}e300c0a80bfb`, 'hex')
    data = data || Buffer.from(`1100000100000001${sid}110001020a0a0a0a0a0a0a0b`, 'hex')
    client.write(data);
}

const run = (client) => {
    intervalHandle = setInterval( () => {send(client)}, 10 * 1000)    
}

const reconnect = () => {
    console.info('------------- Trying to reconnect', new Date().toLocaleString());
    create()
}

const create = () => {
    let client = net.createConnection({ host: LOCAL_HOST, port: PORT, timeout: 9 * 1000 }, () =>{
        
        console.log('------------- Connected! Ready To GO ...');
        if(intervalHandle){
            clearInterval(intervalHandle)
        }
        send(client)
        run(client);
    })
    client.on('data', (buf) => {
        // {"sn":"fffefdfc","op":"GET"}
        console.info('------------- Receive Data:\n', buf, '\n------------- @', new Date().toLocaleString());
    })
    client.on('error', (e) => {
        console.error('------------- Ops Exception:\n', 'Trying to reconnect in 10s')
        client.destroy();
        if(intervalHandle){
            clearInterval(intervalHandle)
        }
        // try to reconnect in 10s'
        tryHandle = setTimeout(reconnect, 10 * 1000)
    })
    return client
}

create()






