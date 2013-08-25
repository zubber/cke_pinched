<?php
    # $db_host = 'u65603.mysql.masterhost.ru';
    # $db_user = 'u65603_2';
    # $db_pass = '32ylaterca';
    # $db_name = 'u65603_test';

    $db_host = $_SERVER['SERVER_ADDR'];
    $db_user = 'zubber';
    $db_pass = '';
    $db_name = 'c9';

# CREATE TABLE IF NOT EXISTS Blog_Main(
#   id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
#   cdate DATETIME DEFAULT NULL,
#   mdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
#   body TEXT NOT NULL,
#   PRIMARY KEY (id),
#   INDEX cdate (cdate),
#   INDEX mdate (mdate)
# )
# ENGINE = INNODB
# CHARACTER SET utf8
# COLLATE utf8_general_ci;

# INSERT INTO Blog_Main ( body, cdate ) VALUES ( 'Первая запись', NOW() );
?>
