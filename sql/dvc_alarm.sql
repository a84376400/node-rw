DROP TABLE IF EXISTS `dvc_alarm`;
CREATE TABLE IF NOT EXISTS `dvc_alarm` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `delflag` tinyint(4) NOT NULL DEFAULT '0' COMMENT '删除标示',
  `createAt` bigint(20) NOT NULL DEFAULT '0' COMMENT '数据创建时间戳',
  `updateAt` bigint(20) NOT NULL DEFAULT '0' COMMENT '数据更新时间戳',
  `sn` varchar(200)  NULL  COMMENT '设备编号', 
  `title` varchar(200)  NULL  COMMENT '告警标题', 
  `code` varchar(200)  NULL  COMMENT '告警编码', 
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='设备告警信息';