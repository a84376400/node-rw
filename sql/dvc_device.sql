DROP TABLE IF EXISTS `dvc_device`;
CREATE TABLE IF NOT EXISTS `dvc_device` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `createAt` bigint(20) NOT NULL DEFAULT '0',
  `updateAt` bigint(20) NOT NULL DEFAULT '0',
  `delflag` tinyint(4) NOT NULL DEFAULT '0',
  `name` varchar(200) NOT NULL,
  `sn` varchar(200) DEFAULT '',
  `ip` varchar(200) NOT NULL,
  `gps_lat` varchar(30) NOT NULL,
  `gps_lng` varchar(30) NOT NULL,
  `status` varchar(100) CHARACTER SET utf8 DEFAULT 'READY',
  `nb` varchar(100) DEFAULT '000000000000000',
  `area_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8;

INSERT INTO `dvc_device` (`id`, `createAt`, `updateAt`, `delflag`, `name`, `sn`, `ip`, `gps_lat`, `gps_lng`, `status`, `nb`, `area_id`) VALUES
(10, 1539047897592, 1550451957336, 0, '办公室测试智能箱标配', 'ff24001e', '192.168.100.195', '1', '1', 'ONLINE', '356566078301967', 1),
(11, 1539047897592, 1548295891047, 0, '测试智能箱2', 'fffefdfc', '192.168.100.193', '1', '1', 'OFFLINE', '356566078320777', 2),
(12, 1548230620401, 1550729878594, 0, 'NB测试', 'ff30003a', '192.168.100.161', '1', '1', 'OFFLINE', '356566078332905', 1),
(13, 1548413068160, 1550633408367, 0, '罗克韦尔', 'ff5a0039', '192.168.100.162', '', '', 'ONLINE', '000000000000000', 4),
(14, 1548413415180, 1548413420687, 0, '瑞威测试5', 'ff210026', '192.168.1.100', '', '', 'ONLINE', '000000000000000', 0),
(15, 1548414581928, 1551055422972, 0, '公司高配测试', 'ff420026', '192.168.12.100', '', '', 'ONLINE', '356566078331337', 1),
(16, 1548414915396, 1550727247353, 0, '瑞威工厂', 'ff46003a', '192.168.11.101', '1', '1', 'ONLINE', '000000000000000', 1);