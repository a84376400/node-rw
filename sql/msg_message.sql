DROP TABLE IF EXISTS `msg_message`;
CREATE TABLE IF NOT EXISTS `msg_message` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `content` varchar(1000) CHARACTER SET utf8 NOT NULL,
  `createAt` bigint(20) NOT NULL,
  `updateAt` bigint(20) NOT NULL,
  `delflag` tinyint(4) NOT NULL DEFAULT '0',
  `channel` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `clientId` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `method` varchar(100) CHARACTER SET utf8 NOT NULL DEFAULT 'broadcast',
  `status` varchar(50) CHARACTER SET utf8 DEFAULT 'INIT' COMMENT 'INIT:初始化,PENDING:发送中,DONE:完成,ERROR:错误',
  `unit` varchar(10) CHARACTER SET utf8 DEFAULT NULL,
  `val` bigint(20) DEFAULT NULL,
  `uid` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Messages';