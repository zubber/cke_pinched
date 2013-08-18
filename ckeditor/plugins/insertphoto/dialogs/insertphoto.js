CKEDITOR.dialog.add( 'insertphotoDialog', function ( editor ) {
    return {
        title:          'insertphoto Dialog',
        resizable:      CKEDITOR.DIALOG_RESIZE_BOTH,
        minWidth:       500,
        minHeight:      400,
        contents: [
            {
                id:         'tab1',
                label:      'First Tab',
                title:      'First Tab Title',
                accessKey:  'Q',
                elements: [
                    {
                        type:           'select',
                        label:          'выбираем src',
                        id:             'srcSel',
						items:			[
							['Котик','http://byaki.net/uploads/posts/2008-10/1225141003_1-21.jpg'],
							['Псинка', 'http://img0.liveinternet.ru/images/attach/c/5/87/507/87507376_42_Kazhetsya_kak_budto_bednaya_psinka_tolko_chto_popala_v_ray.jpg']]
                    }
                ]
            }
        ],
		onOk: function() {
			var dialog = this;
			var img = editor.document.createElement( 'img' );

			img.setAttribute( 'src', dialog.getValueOf( 'tab1', 'srcSel' ) );
			img.setAttribute( 'title', dialog.getValueOf( 'tab1', 'srcSel' ) );

			editor.insertElement( img );
		}
    };
});