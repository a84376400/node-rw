DROP TABLE IF EXISTS `opt_worksheet`;
CREATE TABLE `opt_worksheet` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `delflag` tinyint(1) NOT NULL DEFAULT '0',
  `createAt` bigint(20) NOT NULL,
  `updateAt` bigint(20) NOT NULL,
  `trouble_id` bigint(20) DEFAULT NULL COMMENT '故障编号',
  `company_id` bigint(20) NOT NULL COMMENT '运维单位',
  `status` varchar(200) NOT NULL DEFAULT 'TODO',
  `code` varchar(50) NOT NULL COMMENT '工单号',
  `finishAt` bigint(20) NOT NULL COMMENT '修复时间',
  `dispatchAt` bigint(20) NOT NULL COMMENT '派单时间',
  `staff_id` bigint(11) NOT NULL COMMENT '运维人员id',
  `dispatcher_id` bigint(11) NOT NULL COMMENT '派单人员id',
  `reason` varchar(500) DEFAULT NULL COMMENT '原因',
  `remark` varchar(1000) DEFAULT NULL COMMENT '备注',
  `duration` int(11) DEFAULT NULL COMMENT '修复时长，小时',
  `message` varchar(1000) NOT NULL COMMENT '故障信息',
  `troubleAt` bigint(20) NOT NULL COMMENT '故障发生时间',
  `sn` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)  
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;