$(document).ready(function(){
    
    CKEDITOR.plugins.add( 'bold', {
        
        init : function( editor ) {
            
            editor.ui.addButton('rtBold', {
                icon    : '/i/ico_btn_bold.gif',
                label   : 'Полужирный',
                command : 'bold'
            });
        }
    });
});