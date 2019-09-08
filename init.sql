CREATE DATABASE IF NOT EXISTS ruiwei CHARACTER SET utf8 COLLATE utf8_general_ci;
CREATE USER 'dbadmin'@'localhost' IDENTIFIED BY '741235896';
CREATE USER 'dbadmin'@'%' IDENTIFIED BY '741235896';
grant all privileges on ruiwei.* to 'dbadmin'@'localhost' identified by '741235896';
grant all privileges on ruiwei.* to 'dbadmin'@'%' identified by '741235896';
