<html>
  <head>
   <script type="text/javascript" src="/js/jquery/jquery-1.7.1.min.js"></script>
   <script>
    var gaData = {
    	'id0' : { 'id': 'id0', 'title' : 'Белка','src' : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSt6Xq_N9hW-lx31JJ81WEuisRLXrjdypdNUZgo_qygDIP9zfBgFw' },
		'id1' : { 'id': 'id1', 'title' : 'Барс', 'src' : 'http://img0.liveinternet.ru/images/attach/c/0//45/618/45618009_1246031329_07.jpg' },
        'id2' : { 'id': 'id2', 'title' : 'Жирафы', 'src' : 'http://omvesti.ru/wp-content/uploads/2013/01/7-383.jpg' },
        'id3' : { 'id': 'id3', 'title' : 'Киса', 'src' : 'http://www.ellf.ru/uploads/posts/2011-10/1318538766_00-20.jpg' },
        'id4' : { 'id': 'id4', 'title' : 'Псинка', 'src' : 'http://www.fresher.ru/manager_content/images/zhizn-zhivotnih-v-mgnovenii-objektiva/0.jpg' },
        'id5' : { 'id': 'id5', 'title' : 'Сурикаты', 'src' : 'http://www.megainet.info/uploads/posts/2012-05/www.megainet.info_3680_foto-malenkih-zhivotnyh_2_600.jpg' },
        
        'id7' : { 'id': 'id7', 'title' : 'Медведь', 'src' : 'http://yaicom.ru/o/2012/02/zhivotnye-pytajutsja-byt-djudmi_57429_s__2.jpg' },
        'id8' : { 'id': 'id8', 'title' : 'Белка', 'src' : 'http://www.bugaga.ru/uploads/posts/2012-11/1353520730_pozitivnye-zhivotnye-24.jpg' }
        
        
        
    };
    var gsEditor = "<?php echo $_GET['CKEditor']; ?>";
    
    var getPhotoChoiceHtml = function(data) {
        return '\
            <img class="sel" id="' + data.id + '" src="' + data.src + '" title="' + data.title + '" width=180>';
    };
    
    $(document).ready( function() {
    
        for ( var id in gaData )      
        {
            $('#content').append( getPhotoChoiceHtml(gaData[id]) );
        }
        
        $('img.sel').click( function(event){
            var editor = window.parent.CKEDITOR.instances[gsEditor];
            editor.execCommand('pl_cmd_add_photo', gaData[$(event.target).attr('id')] );
        });
    });
    
   </script>
  </head>
  <body><div id="content"></div></body>
</html>