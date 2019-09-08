DROP TABLE IF EXISTS `dvc_area`;
CREATE TABLE IF NOT EXISTS `dvc_area` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `createAt` bigint(20) NOT NULL DEFAULT '0',
  `updateAt` bigint(20) NOT NULL DEFAULT '0',
  `delflag` tinyint(4) NOT NULL DEFAULT '0',
  `name` varchar(200) NOT NULL,
  `code` varchar(200) DEFAULT '',
  `polygon` varchar(4000) NULL COMMENT '区域的多边形围栏，采用百度地图的api',
  `setting` varchar(2000) DEFAULT '{\"voltage\":{\"max\":240,\"min\":200},\"temprature\":{\"max\":30,\"min\":-5},\"electric\":800}' COMMENT '设置信息，json格式', 
  `strategy` varchar(2000) DEFAULT '1' COMMENT '策略信息，json格式', 
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

INSERT INTO `dvc_area` (`id`, `createAt`, `updateAt`, `delflag`, `name`, `code`) VALUES
(1, 1525245044356, 1525245044356, 0, '广陵区', ''),
(2, 1525245044356, 1525245044356, 0, '邗江区', ''),
(3, 1525245044356, 1525243102083, 0, '江都区', ''),
(4, 1525245044356, 1525247197800, 0, '仪征区', '');