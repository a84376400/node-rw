DROP TABLE IF EXISTS `evt_event`;
CREATE TABLE IF NOT EXISTS `evt_event` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `delflag` tinyint(4) NOT NULL DEFAULT 0,
  `createAt` bigint(20) NOT NULL,
  `updateAt` bigint(20) NOT NULL,
  `fn` varchar(10) CHARACTER SET utf8 NOT NULL DEFAULT 'PUSH', -- PUSH/
  `network` varchar(10) CHARACTER SET utf8 NOT NULL DEFAULT 'TCP', -- TCP/NB
  `sn` varchar(100) CHARACTER SET utf8 NOT NULL,
  `status` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `origin` varchar(500) CHARACTER SET utf8 NOT NULL,
  `r0001` bigint(20) DEFAULT 0,
  `r0002` bigint(20) DEFAULT 0,
  `r0003` bigint(20) DEFAULT 0,
  `r0004` bigint(20) DEFAULT 0,
  `r0005` bigint(20) DEFAULT 0,
  `r0006` bigint(20) DEFAULT 0,
  `r0007` bigint(20) DEFAULT 0,
  `r0008` bigint(20) DEFAULT 0,
  `r0009` bigint(20) DEFAULT 0,
  `r000a` bigint(20) DEFAULT 0,
  `r000b` bigint(20) DEFAULT 0,
  `r000c` bigint(20) DEFAULT 0,
  `r000d` bigint(20) DEFAULT 0,
  `r000f` bigint(20) DEFAULT 0,
  `r0011` bigint(20) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8;