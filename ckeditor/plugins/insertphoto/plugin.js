$(document).ready(function(){

    CKEDITOR.plugins.add('insertphoto', {
		init : function(editor) {
            editor.addCommand( 'insertphoto_showdialog', {
                exec: function(editor) {
                    var editor_name = CKEDITOR.currentInstance.name;
                    var page = 'lib/insertphoto.php?CKEditor='+editor_name;
                    window.insertphoto_dialog = $('<div id="insertphoto_dialog"></div>')
                                   .html('<iframe style="border: 0px; " src="' + page + '" width="700" height="380"></iframe>')
                                   .dialog({
                                       autoOpen: false,
                                       modal: true,
                                       height: 400,
                                       width: 800,
                                       title: "Insert photo"
                                   });
                    window.insertphoto_dialog.dialog('open');
            } } );
            
    		editor.ui.addButton('rtPhoto', {
				icon    : '/i/ico_btn_img.gif',
				label   : 'Вставить фото',
				command : 'insertphoto_showdialog'
			});

            
            editor.addCommand( 'insertphoto_edithtml', {
                exec: function(editor, photo_data) {
                    getPhotoEditHtml(photo_data);
                
            }});

		}
	});
	
	
	
});