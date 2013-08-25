<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<?php
    require_once('config.php');
    require_once('utils.php');
    $dbh = db_init();
    if ( $_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['body']) )
    {
       db_update_blog($dbh,$_POST['body'],1);
    }
    $rec = db_load_blog($dbh , 1 );

?>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link href="css/styles.css" rel="stylesheet">
    <script type="text/javascript" src="js/jquery/jquery-1.7.1.min.js"></script>
    <script type="text/javascript" src="ckeditor/ckeditor.js"></script>
    <script type="text/javascript" src="ckeditor/adapters/jquery.js"></script>
    <script type="text/javascript" src="js/jquery/plugins/jquery.disable.text.select.js"></script>

    <script type="text/javascript">
        $(function () {
                /**
                 * Конфиг ckeditor
                 * Настройка тулбара
                 */
            $("#field_noteeditor").ckeditor({
                    skin : "moono",
                    allowedContent: 'b h2 p; span[contenteditable]{*}(*); div[contenteditable]{*}(*); placeholder[*](*){*};',
					removePlugins : "elementspath",
					resize_enabled : false,
					autoUpdateElement : true,
					disableObjectResizing : true,
					forcePasteAsPlainText : true,
					toolbarCanCollapse : false,
					extraPlugins : 'bold,header,insertphoto,tezis', 
                    autoParagraph  : false,
                    removePlugins : 'magicline,elementspath',
					language : 'ru',
					height : '400px',
                    width : '600px',
					contentsCss : ['/css/style-ckeditor.css'],
					browserContextMenuOnCtrl : true,
					enterMode : CKEDITOR.ENTER_P,
					toolbar : [["rtBold","-","rtHeader","-","Photo","-","Tezis"]] 
		    });
	    });
        
    var saveData = function(editor)
    {
        var body = $('#body');
        body.val( editor.getData() );
        document.forms["edit_body"].submit();
    };
    
	</script>
</head>
<body>
<div style="float: left;">
    <form method=POST action="/editor.php" name="edit_body">
	    <textarea cols="80" id="field_noteeditor" rows="10"><?php print $rec['body']; ?></textarea>
        <textarea name="body" id="body" style="display: none;"></textarea>
        <br/><input type=button value="Сохранить" onclick="saveData(window.CKEDITOR.instances['field_noteeditor']);">
    </form>
</div>
<div style="margin-left: 650px; width: 400px;">

<pre>======== POST data start =============
<?php
    if ( $_SERVER['REQUEST_METHOD'] == 'POST' )
        var_dump($_POST);
    else
        print "REQUEST = GET";
?>

======== POST data end =============</pre>


<pre>======== DB:body content start =============

    <?php print htmlspecialchars($rec['body']); ?>

======== DB:body content end =============</pre>

</div>


<!-- popup -->
<div class="pp-photos popup" style="width:440px;display:none" id="add_tezis">
    <div class="content">
        <h3><span class="close"></span>ВСТАВКА ТЕЗИСА</h3>
        <div class="text_tezis">
            <h4>Текст тезиса</h4>
            <p>Тезисы нужны для выделения самой важной информации в вашей заметке.<br />Формулируйте мысль предельно просто и ясно. На это у вас <strong id="tezis_counter" class="green">140 символов.</strong></p>
            <p class="t_input"><input maxlength="140" type="text" class="text" placeholder="Введите текст вашего тезиса"></p>
        </div>
        <div class="submit"><a href="#" class="close choose">ВСТАВИТЬ</a><a href="#" class="cancel"><span>Отменить</span></a></div>
    </div>
</div>

<div class="pp-photos popup" style="width:435px;display:none;" id="add_desc_photo">
    <div class="content">
        <div class="top_title"><span class="close"></span>Добавление описания фото</div>
        <form action="#">
            <div class="add_desc_photo forms">
                <div class="frmf intro"><textarea cols="30" rows="4"></textarea></div>
            </div>
        </form>
        <div class="submit"><a href="#" class="close choose">ВСТАВИТЬ</a><a href="#" class="cancel"><span>Отменить</span></a></div>
    </div>
</div>

<div class="pp-photos popup" style="width:740px;display:none;" id="insertphoto_dialog">
    <div class="content">
        <h3><span class="close"></span>ВСТАВКА ИЗОБРАЖЕНИЯ</h3>
        <div class="iframe_place"></div>
    </div>
</div>
    
</body>
</html>