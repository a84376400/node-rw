# Protocol

> The detail of the protocol.

## 1. Payload Format

  ```javascript
  /*
  -----------------------------------------------
  |      SN      | FN | EXTRA |      DATA...    |
  -----------------------------------------------
  | ---- 4B ---- | 1B | - 2B -| ----- ?B ------ |
  -----------------------------------------------
  */
  ```

### 2. Function Codes

  | Code | Name | Remark |
  |------|------|--------|
  | `0x03` | [GET](#0x03) | Server get data of device |
  | `0x10` | [SET](#0x10) | Server set data of device |
  | `0x11` | [CAMERA_IP](#0x11) | Server set cameras's ip to device flash |
  | `0x80` | [SET CONFIG](#0x80) | Set the max value and min value temperature of the device |
  | `0x81` | [GET CONFIG](#0x81) | Get the max value and min value temperature of the device |
  | `0xa1` | [FIX_MODE](#0xa1) | Make the device in fix mode. |
  | `0xa2` | [RESET_MODE](#0xa2) | Reset the device mode. |
  | `0xaa` | [AUTO PUSH](#0xaa) | Device push data to server |
  | `0xb1` | [SELF_CHECK](#0xaa) | Server send a signl to device. |
  | `0xe1` | [ALARM](#0xe1) | Push the device's alarm |
  | `0xe2` | [TROUBLE](#0xe2) | Push the device's trouble |
  | `0xe3` | [CAMERA TROUBLE](#0xe3) | Push the camera's trouble |

  #### Protocol list:

  > The list of protocols.

  - ##### 0x03

    ```
    // Read all sensor
    fffefdfc 03 0123 0001 000e
    fffefdfc0301230001000e
    ```

  - ##### 0x10

    ```
    // close the 0001 switcher
    fffefdfc 10 0123 0001 0001 00
    fffefdfc1001230001000100
    ```

  - ##### 0x11

    ```
    // 发送设备关联的监控ip地址
    fffefdfc 11 0123 01 0a0a0a0a
    fffefdfc110123010a0a0a0a
    ```

  - ##### 0xaa

    ```
    // the device info of all relays
    fffefdfc aa 0001 0012 00.........
    ```

  - ##### 0xb1

    平台发送一个信号给设备，设备进入自检状态，检查一些复杂的外设状态，并将结果通过 e1/e2 的协议进行返回。
    ```
    // the device info of all relays
    fffefdfcb1 b1 0001 

  - ##### 0xe1

    用于推送设备的告警信息；每个字节为对应一个告警，`0`代表正常，非零代表该状态出现了告警。
    > 0正常  1小于下陷 2大于上限

    | 1. 温度 | 2. 电压 | 3. 电流 |
    |-----|------|------|
    | 00 | 00 | 00 |
    ```
    // 
    fffefdfc e1 01 00 00 
    ```

  - ##### 0xe2

    用于推送设备的异常信息；每个字节为对应一个异常，`0`代表正常，非零代表该状态出现了异常。

    | 1. 市电 | 2. 补光灯 | 3. 网络 | 4. 柜门 | 5. 防雷器 |
    |-----|------|------|------|------|
    | 00 | 00 | 00 | 00 | 00 |
    ```
    // 
    fffefdfc e2 01 00 00 00 00
    ```


  - ##### 0xe3

    用于推送设备下的监控异常信息；函数码后面的一个字节中存放 00/01，其中 00代表该IP恢复了通讯，01代表该IP无法通讯。

    数据中存放ip地址的 16 进制数。

    通常，该消息是在状态发生变化才会上报；默认要求设备通电之后会上报一次。每隔1个小时上报一次。
    ```
    // 中间的一个字节
    fffefdfc e3 00 0a0a0a
    ```