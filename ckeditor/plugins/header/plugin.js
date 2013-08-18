$(document).ready(function(){
    
CKEDITOR.plugins.add( 'header',
{
    // requires : [ 'styles', 'button' ],
    
    init : function( editor ) {
        
        var config = editor.config;
      		
        var style = new CKEDITOR.style( config.coreStyles_header );
  
        editor.attachStyleStateChange( style, function( state ) {
            
            !editor.readOnly && editor.getCommand( 'rt_cmd_header' ).setState( state );
        });

        editor.addCommand( 'rt_cmd_header', new CKEDITOR.styleCommand(style));

        editor.ui.addButton( 'rtHeader', {
            label : 'Заголовок',
            command : 'rt_cmd_header',
            icon    : '/i/ico_btn_em.gif'
        });

    }
});

CKEDITOR.config.coreStyles_header = { element : 'h2' };

});