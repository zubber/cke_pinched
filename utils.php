<?php
    require_once( 'config.php' );
    
    function db_init()
    {
        global $db_user, $db_pass, $db_host, $db_name;
#        print "mysql:host=$db_host;dbname=$db_name;charset=utf8". $db_user. $db_pass;
        $dbh = new PDO( "mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass );
        $s = $dbh->prepare("SET NAMES utf8;");
        $s->execute();
        return $dbh;
    }

    function db_load_blog( $dbh, $id )
    {
        try {
            return $dbh->query("SELECT * FROM Blog_Main WHERE id = $id LIMIT 1")->fetch();
        } catch (PDOException $e) {
            return array( body => 'Error');
        }
        
    }
    
    function db_update_blog( $dbh, $body = '', $id )
    {
        $s = $dbh->prepare('UPDATE Blog_Main SET body = :body WHERE id = :id LIMIT 1');
        $s->bindParam(":body", $body);
        $s->bindParam(":id", $id);
        $s->execute();
    }
?>