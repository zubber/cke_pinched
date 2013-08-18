<html>
  <head>
   <script type="text/javascript" src="/js/jquery/jquery-1.7.1.min.js"></script>
   <script>
    var gaData = {
    	'id0' : { 'id': 'id0', 'description' : 'Белка','src' : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSt6Xq_N9hW-lx31JJ81WEuisRLXrjdypdNUZgo_qygDIP9zfBgFw' },
		'id1' : { 'id': 'id1', 'description' : 'Барс', 'src' : 'http://img0.liveinternet.ru/images/attach/c/0//45/618/45618009_1246031329_07.jpg' },
        'id2' : { 'id': 'id2', 'description' : 'Жирафы', 'src' : 'http://omvesti.ru/wp-content/uploads/2013/01/7-383.jpg' },
        'id3' : { 'id': 'id3', 'description' : 'Киса', 'src' : 'http://www.ellf.ru/uploads/posts/2011-10/1318538766_00-20.jpg' },
        'id4' : { 'id': 'id4', 'description' : 'Псинка', 'src' : 'http://www.fresher.ru/manager_content/images/zhizn-zhivotnih-v-mgnovenii-objektiva/0.jpg' },
        'id5' : { 'id': 'id5', 'description' : 'Сурикаты', 'src' : 'http://www.megainet.info/uploads/posts/2012-05/www.megainet.info_3680_foto-malenkih-zhivotnyh_2_600.jpg' }
        
        
    };
    var gsEditor = "<?php echo $_GET['CKEditor']; ?>";
    
    var getPhotoChoiceHtml = function(data) {
        return '\
            <img class="sel" id="' + data.id + '" src="' + data.src + '" title="' + data.description + '" width=180>';
    };
    
    $(document).ready( function() {
    
        for ( var id in gaData )      
        {
            $('#content').append( getPhotoChoiceHtml(gaData[id]) );
        }
        
        $('img.sel').click( function(event){
            var editor = window.parent.CKEDITOR.instances[gsEditor];
            var content = window.parent.getPhotoEditHtml( gaData[$(event.target).attr('id')] );

            editor.insertHtml( content, 'unfiltered_html' );
            window.parent.insertphoto_dialog.dialog('close');
            
            
        });
    });
   </script>
  </head>
  <body>

    Выберите изображение:
    <div id="content"></div>
    
  </body>
</html>