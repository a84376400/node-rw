## 2.0.3 (2019-02-26)
Update:
- 1) Plugins
  - Remove `fpm-plugin-schedule`
  - update `fpm-plugin-mysql`



## 2.0.2 (2019-02-21)
Feature:
- 1) [ ] Add a webhook to execute biz method!
- 2) [x] Add a schedule `device.checkNetwork` to scan all the online device's network connect status
  - if the device online and push tcp message > 2~5 mins, it means offline.

TODO:
- 1) [ ] How to notify the offline event?
- 2) [ ] How to create the offline trouble?

Remark:
- 1) [x] 操作完开关之后 立刻刷新会出现开关状态复位了，因为 设备没有上传状态数据（有30s的间隔）；这是正常情况，不需要作调整。

## 2.0.2 (2019-02-20)

Feature:
- 1) [ ] Add a plugin `fpm-plugin-dataview` for mysql dataview
- 2) [ ] make a schedule for count data.

## 2.0.2 (2019-02-19)

Feature:
- 1) [x] Auto fix trouble when device send normal message
  - a) Trouble Exists?
    - how to judge the trouble exists?
    
      **the `opt_trouble` table contains one row with the code = `E-${err_id}` and status in (0,1) and sn = `${sn}` and fixAt = 0** 

    - i) Make it fixed !
    - ii) Worksheet Exists?
      - 1) Close it automaticlly!
  - b) Trouble Not Exists?
    - i) Do Nothing !

## 2.0.2 (2019-02-18)

BreakChange:
- 1) [x] Add `setting` & `strategy` to `Area`.
  - a) [x] Remove `ref_setting.sql`
  - b) [x] Add `setting` & `strategy` fields for table `rw_area`.
- 2) [x] Add `area` for `device.putSetting`.

- 3) [x] Change Tablename 
  - a) from `rw_area` to `dvc_area`
  - b) from `rw_device` to `dvc_device`
  - c) from `rw_event` to `evt_event`
  - c) from `rw_message` to `msg_message`



Tip:
[百度地图围栏Demo](http://lbsyun.baidu.com/jsdemo.htm#c2_9)

## 2.0.1 (2019-01-08)

Target:
- 1) [x] 添加运检人员的入口，允许运检人员登录系统进行操作
  - a) 对运维单位加入到系统的OBS中进行管理，使其能够保证运维检查人员具有相应的权限
  - b) 用户管理中可以添加普通的运维人员，不同的运维单位有相同的权限
  - c) 人员签到视同单位签到
    - 1.1) [x] 创建数据库结构
    - 1.2) [x] 实现签到
- 2) 添加一个 webview 可以让用户登录进行正常的反馈
- 3) 异常和告警的处理细节
  - a) [x] 异常可以自动修复,自动修复其工单
    - a.1) [ ] 温度，电压，电流；收到警告之后做出相应的提醒即可。
  - b) [x] 告警可以自动修复
  - c) [x] 都不产生重复的提示信息
  - d) 通过音频播放和短信提示
- 4) 视频在线率的统计
  - a) [ ] 以天计算
  - b) [ ] 保存每天的结果
  - c) [ ] 掉线/在线如何及时计算出来？
  - d) [ ] 默认网络和电源以继电器的开关状态为准
  - e) [ ] 定义一个数据表来保存数据
- 5) 补光灯策略
  - a) [x] 选择月份和时间点来定义区间 生成 CRON 表达式
  - b) [x] 定义打开和关闭的业务函数

## 2.0.0 (2018-11-27)

Change
- add `CC` fn for TCP reconnect event
- change `guang duan ji` from switcher to sensor
- add `CRC16` compare when received the message

Fixbug
- `bindNB` change when the nbcode changed
  ```javascript
  // before
  condition: `sn='${sn}' and nb is null`,
  // after
  condition: `sn='${sn}' and nb != '${nb}'`,
  ```

## 2.0.0 (2018-11-26)
Change:
- Dcokerfile
  - add node_modules in the docker context
Fixbug:
- Error When the device lost connect!
  - publish an device offline message from mqttserver
    ```javascript
    this._fpm.execute('mqttclient.publish', {
      topic: '$d2s/offline/tcp',
      payload: `00000001000000010000000000000000${ info.sn }bb0000`,
      format: 'hex'
    })
    ```


## 2.0.0 (2018-10-16)
Add:
- Camers
  - 

## 2.0.0 (2018-09-21)
Add:
- Worksheet Store script
  - [ ] 
  - [ ]

## 2.0.0 (2018-09-14)
Remove: 
- ~fpm-plugin-socket~
- ~fpm-plugin-nbiot~

> All message get from the `fpm-iot-cloud-mqtt` server. And the data format is the same.

## 1.0.2 (2018-08-24)
Add:
- Get/Set Temperature Function
- Reboot Function

## 1.0.2 (2018-08-20)
TODO:
- [x] Make `get info` to be a promise
  - [x] Change `protocol` , add an `CallbackId` field

## 1.0.2 (2018-08-15)
Change:
- `protocol.js` is too hard to read
  - define static data file
  
Fixbug:
- `CRC16` Encoder Bug
  - it's return `<Buffer 3a>` when the CRC16Code is `03ab`
  - return `<Buffer 3a 1b>` when the CRC16Code is `3a1b`
  - it occords error when the CRC16Code starts with `0`
  - padding the string `0` if necessary


## 1.0.2 (2018-08-14)
Add:
- Try to send data by NB if TCP not connect
- Save the sn code

## 1.0.2 (2018-08-10)
TODO:
- get nb id by sn code
- add `nb` field for device

## 1.0.2 (2018-08-08)
Change:
- upgrade the fake bot
- merge the latest registers' info in method `device.getRegisters()`
Add:
- `nodemon.json` ignore some dirs & files
- Save command to db in method `device.send`

## 1.0.2 (2018-08-08)
Add:
- `fpm-plugin-nbiot`
- receive the data from nbiot

Change:
- 1 register addr change & add 1 register


## 1.0.2 (2018-08-03)
Add:
- `memory-cache` to cache the device push event message
- `device.getState` to get the latest event message

## 1.0.2 (2018-08-03)
Change:
- `event` table meta change, add all registers
- fix protocol 
  - use each `read` method by each register `type` and `length`
TODO:
- [x] Do some logic when receive the push data. Dont broadcast the info when 2 data is the same.
- ~Create an redis plugin~
- [x] Add `memory-cache` to cache the device push message

## 1.0.2 (2018-08-02)
Add:
- Generate data to hex
- Parse hex to data

## 1.0.2 (2018-08-01)
Add:
- Done the protocol of the IOT

TODO:
- Convert the hex data to json

## 1.0.2 (2018-07-25)
Debug:
- `socket` plugin

Add:
- Call the `ffmpeg` process to format video stream
  - Make a ffmpeg plugin `fpm-plugin-ffmpeg`

## 1.0.2 (2018-06-05)
Update:
- `yf-fpm-server` update to version: `2.4.9`

Change:
- `yf-fpm-client-nodejs` to `yf-fpm-client-js@1.0.2`
- modify all test script


## 1.0.2 (2018-05-21)

Add:
- add plugin `fpm-plugin-admin`

Update:
- `yf-fpm-server` update to version: `2.3.0`

## 1.0.2 (2018-05-14)

Add:
- add sql file `usr_action_log.sql`
- add plugin `fpm-plugin-logger`
- add config `log4js`

Modeify:
- add log for `user.login`

Update:
- `yf-fpm-server` update to version: `2.2.28`


## 1.0.2 (2018-05-11)

Modify:
- `user.login` limit try fail 5 times, otherwise lock the user untile admin unlock it.
- `userinfo.sql` add `try_fail` field

Add:
- User.Password Always Encode By `AES-256-CBC`

## 1.0.2 (2018-05-08)

Add:
- `user.create`
- `user.toggleEnable`

Modify:
- `user.list` with pagination
- `usr_userinfo` add `enable` field

## 1.0.2 (2018-05-07)

Modify:
- Remove `links` from the `docker-compose.*.yml`, instead of `networks`
- Add `User.ChangePassword`

## 1.0.2 (2018-05-03)

Fixed
- Remove The Dockfile For Build Init Container To Run `init.sql`
- Mount The `init.sql` To `/docker-entrypoint-initdb.d/db_init.sql` Of The Mysql Container

Known Issues
- Cant Use MariaDB With Docker

TODO:
- Make fpm plugin named `fpm-plugin-rbac-fs` && `fpm-plugin-rbac-mysql`

## 1.0.2 (2018-05-02)

Add Docker Compose For Mysql&PhpMyAdmin

## 1.0.2 (2018-04-27)

Add
  - DbBiz
    For FE to Access Db

## 1.0.2 (2018-04-26)

Add
  - `fpm-plugin-schedule`
  - `fpm-plugin-sms`

Job
  - `broadcast` broadcast a heartbeat void package every min
  ```javascript
  {
    "1": {
      "method": "socket.broadcast",
      "v": "0.0.1",
      "cron": "* * * * *",
      "name": "broadcast",
      "args": "{\"message\":\"heartbeat\"}",
      "autorun":1
    }
  }
  ```


## 1.0.2 (2018-04-25)

Remove

  - Biz `socketio.broadcast` & `socketio.send`
    Cause: Upgrade Plugin `fpm-plugin-socketio`; it contains Biz `socketio.broadcast` & `socketio.send`


## 1.0.2 (2018-04-24)

Biz
  - `socketio.broadcast` & `socketio.send`

Plugin
  - `fpm-plugin-socketio`

## 1.0.2 (2018-04-23)

Feature
  - socket.getClients() support pagenation
  - save the `broadcast()` or `send()` Message's Info And Return The MessageId
  - save the `event` Message's Info from Client to DB

Remove
  - `test\client.local.js`
  - `test\client.remote.js`

Plugin
  - `fpm-plugin-mysql`

Database
  Tables
    - `rw_event`
    - `rw_message`



## 1.0.1 (2018-04-21)
Feature

  - Pub The Event Message
    - Notify The Subs(*Only One Process*)
    - Do Some Logic Or Analyse
    - WebSocket Pub The Event Message To The FE
  - Save The Event Message
    - Store In The Mysql Server
  
  - Add MessageReceive Script

TODO

  - Save The Event Message
  - Do sth Then Notify FE By Socket.io

## 1.0.0 (2018-04-20)

Feature

  - Add Biz `socket`
    - `broadcast(message:Object, channel:String/Array[String])` 广播消息
    - `send(message:Object, clientId:Integer)` 发送到指定的客户端

    - `getClients` 获取客户端列表
    
      output 
      ```javascript
      {
          "errno": 0,
          "message": "",
          "starttime": 1524206789753,
          "data": [
              {
                  "id": 1524206773618,
                  "ip": "127.0.0.1",
                  "port": 54057
              },
              {
                  "id": 1524206775155,
                  "ip": "127.0.0.1",
                  "port": 54058
              }
          ],
          "timestamp": 1524206789755
      }
      ```

    
    