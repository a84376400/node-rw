#! /bin/sh
cur_date="`date +%Y_%m_%d_%H_%M`"

BAK_DATA_SQL=backup/d_$cur_date.sql
BAK_TABLE_SQL=backup/t_$cur_date.sql

echo "backup@ `date +%Y/%m/%d_%H:%M`"

arg1=$1
container_name=${arg1:="fpm-mysql-server"}

# container_name ? default: fpm-mysql-server

docker exec -it $container_name mysqldump -uroot -proot -d --compact --add-drop-table ruiwei > $BAK_TABLE_SQL

# 删除包含 Warning 的行
sed -i '/Warning:/'d $BAK_TABLE_SQL
# 删除包含 *!40101 的行, 备份时的注释
sed -i '/*!40101/'d $BAK_TABLE_SQL

docker exec -it $container_name mysqldump -uroot -proot -t --compact --ignore-table=ruiwei.evt_event --ignore-table=ruiwei.job_task ruiwei > $BAK_DATA_SQL

sed -i '/Warning:/'d $BAK_DATA_SQL

# --no-create-info,  -t  只导出数据，而不添加CREATE TABLE 语句。

# --no-data, -d   不导出任何数据，只导出数据库表结构。