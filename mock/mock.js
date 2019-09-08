const _ = require('lodash');

compiled = _.template("INSERT INTO dvc_device (createAt, updateAt, delflag, name, sn, ip, gps_lat, gps_lng, status, nb, area_id) VALUES ('1548413415180', '1548413420687', '0', '南部快速通道<%= id %>', 'ff000<%= id %>', '192.168.88.<%=id%>', '', '', 'OFFLINE', '000000000000000', '1');")
_.map(_.range(200), id=>{
  const sql = compiled({ id });
  console.log(sql)
})
