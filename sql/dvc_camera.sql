DROP TABLE IF EXISTS `dvc_camera`;
CREATE TABLE `dvc_camera` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `createAt` bigint(20) NOT NULL DEFAULT '0',
  `updateAt` bigint(20) NOT NULL DEFAULT '0',
  `delflag` tinyint(4) NOT NULL DEFAULT '0',
  `name` varchar(200) NOT NULL,
  `stream_id` varchar(200) DEFAULT '',
  `ip` varchar(50) DEFAULT NULL,
  `brand` varchar(50) NOT NULL DEFAULT 'haikang',
  `admin_name` varchar(100) NOT NULL DEFAULT 'admin',
  `admin_pass` varchar(100) NOT NULL DEFAULT 'admin',
  `channel` varchar(10) DEFAULT '01',
  `device_sn` varchar(100) NOT NULL,
  `stream_port` varchar(10) NOT NULL DEFAULT '554',
  `camera_sn` varchar(100) NOT NULL,
  `status` varchar(10) NOT NULL DEFAULT 'ONLINE',
  `setup_date` varchar(50) DEFAULT NULL,
  `qa_length` varchar(50) DEFAULT NULL,
  `model` varchar(50) DEFAULT NULL,
  `token` varchar(500) DEFAULT NULL,
  `network` varchar(100) DEFAULT 'LAN',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;
INSERT INTO `dvc_camera` (`id`, `createAt`, `updateAt`, `delflag`, `name`, `stream_id`, `ip`, `brand`, `admin_name`, `admin_pass`, `channel`, `device_sn`, `stream_port`, `camera_sn`, `status`, `setup_date`, `qa_length`, `model`, `token`, `network`) VALUES
(1, 1543980581636, 1545191103828, 0, 'Demo01', '', '192.168.100.206', 'haikang', 'admin', 'admin123', '1', '0024001e', '554', '', 'ONLINE', '1543980575481', '24', 'kakou', '', 'LAN'),
(2, 1543992652118, 1545191105946, 0, 'Demo2', '', '192.168.100.210', 'haikang', 'admin', 'admin123', '1', '0024001e', '554', '', 'OFFLINE', '1543992636720', '24', 'kakou', '', 'LAN'),
(3, 1546395288789, 1546395288789, 0, '211球机', '', '192.168.100.211', 'haikang', 'admin', 'admin123', '1', '0024001e', '554', '', 'ONLINE', '1546395249092', '24', 'kakou', '', 'LAN'),
(4, 1546395312262, 1546569642470, 0, '214广角', '', '192.168.100.214', 'haikang', 'admin', 'admin123', '1', '0024001e', '554', '', 'ONLINE', '1546395290698', '24', 'kakou', '', 'LAN'),
(5, 1546395332210, 1546395332210, 0, '215半球机', '', '192.168.100.215', 'haikang', 'admin', 'admin123', '1', '0024001e', '554', '', 'ONLINE', '1546395313499', '24', 'kakou', '', 'LAN');