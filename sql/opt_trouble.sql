DROP TABLE IF EXISTS `opt_trouble`;
CREATE TABLE IF NOT EXISTS `opt_trouble` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `createAt` bigint(20) NOT NULL DEFAULT '0',
  `updateAt` bigint(20) NOT NULL DEFAULT '0',
  `delflag` tinyint(4) NOT NULL DEFAULT '0',
  `sn` varchar(200) NOT NULL COMMENT '设备编号',
  `device` varchar(200) NOT NULL COMMENT '设备名称',
  `ip` varchar(200) NOT NULL COMMENT '设备IP',
  `relay` varchar(200) NOT NULL COMMENT '传感器编号',
  `title` varchar(200) NOT NULL COMMENT '异常标题',
  `message` varchar(200) NOT NULL COMMENT '异常信息',
  `code` varchar(200) NOT NULL DEFAULT '' COMMENT '异常编码',
  `fixAt` bigint(20) DEFAULT NULL COMMENT '修复时间',
  `level` int(4) DEFAULT 1 COMMENT '异常等级',
  `status` int(11) DEFAULT NULL COMMENT '异常处理状态',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;