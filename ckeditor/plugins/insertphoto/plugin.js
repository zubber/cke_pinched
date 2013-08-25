$(document).ready(function(){

    CKEDITOR.plugins.add('insertphoto', {
		init : function(editor) {
            var maxImageHeight  = 400;
            var maxImageWidth   = 600;
            /**
             **************** Фукнции
             */

            /**
             * получаем хтмл код редактирования блока фото
             */
            var getPhotoEditHtml = function(photo_data) {
            
                return '\
                    <div contenteditable="false" photoid="' + photo_data.id + '" class="picture" style="width:534px;">\
                        <div contenteditable="false" class="img" style="background:url(' + photo_data.src + ') no-repeat center center;height:' + maxImageHeight + 'px;">\
                            <span contenteditable="false" class="del">&nbsp;</span>\
                            <div contenteditable="false" class="clear_both">&nbsp;</div>\
                        </div>\
                        <div class="t" contenteditable="false" width="100%">' + getTitleHtml( photo_data.title ) + '</div>\
                    </div>';
            };


            /**
             * получаем внутренний хтмл код блока фото (в том виде, в котором он хранится в бд)
             */
            var getPhotoInternalHtml = function(photo_data) {
                return '<placeholder type="photo" photoid="' + photo_data.id + '" photosrc="' + photo_data.src + '" phototitle="' + photo_data.title + '">_</placeholder>';
            };
            
            /**
             * получаем хтмл код описания
             * @param title
             */
            var getTitleHtml = function(title) {
            
                if (title) {
                    return '<span contenteditable="false" class="edit">&nbsp;</span><p contenteditable="false">' + title + '</p><div contenteditable="false" class="clear_both"></div>';
                } else {
                    return '<div contenteditable="false" class="add_desc"><a contenteditable="false" href="#"><span contenteditable="false">Добавить описание фотографии</span></a></div>';
                }
            };

            /**
             * Подготовка данных для отображения в editor'е
             * @param e
             */
            var dataReadyHandler = function(e) {
                if (isDefined(e.editor.document)) {

                    //находим все блоки фото, сейчас они в внутреннем виде
                    var placeholders = e.editor.document.getElementsByTag("placeholder");
                    var el;

                    //для каждого
                    for (var i = placeholders.count()-1; i >= 0; i--) {
                        el = placeholders.getItem(i);

                        if(el.getAttribute("type") != "photo"){
                            continue;
                        }

                        //выдираем нужные нам параметры из вёрстки
                        var photo_data = { 
                            id: el.getAttribute('photoid')
                            , src: el.getAttribute('photosrc')
                            , title : el.getAttribute('phototitle')
                        };
                        
                        //обработчик загрузки фото
                        var handler = function() {
                            normalizePhotoBlock(this);                            
                        };
                        //загружаем фото, и по окончанию загрузки обрабыбатываем
                        var img = $(new Image()).attr('id', photo_data.id).attr('src', photo_data.src).attr('title', photo_data.title);
                        $(img).load(handler);
                        var e_data = { id : photo_data.id, src : '/i/ajaxLoading.gif', title: photo_data.title };

                        //заменяем блоки
                        $(el['$']).replaceWith(getPhotoEditHtml(e_data));
                    }

                    //навесить ивенты
                    preparePhotos();
                }
            };
            
            /**
             * если фото вертикальное - масштабирует его размеры под максимально разрешенную высоту
             * @param img
             */
            var normalizePhotoBlock = function(img) {
                        var width, height;
                        //Пытаемся определить размер
                        if ( ! ( height = $(img).height() ) ) {
                            if ( ! ( height = img.clientHeight) ) {
                                if ( ! ( height = img.naturalHeight) ) {
                                    height = maxImageHeight;
                                    width = maxImageWidth;
                                } else width = img.naturalWidth;
                            } else width = img.clientWidth;
                        } else width = $(img).width();
                        
                        var div_pic = $(editor.document['$']).find('div[photoid=' + $(img).attr('id') + '] div.img');
                        if ( height > maxImageHeight )
                        {
                            var ko = maxImageHeight / maxImageWidth;
                            width = parseInt( width * ko );
                            height = parseInt( height * ko );
                            $(editor.document['$']).find('div[photoid=' + $(img).attr('id') + ']').css('width', width );
                            
                            div_pic.css('background-size', width + 'px ' + height + 'px')
                        }
                        div_pic.css('background-image', 'url(' + $(img).attr('src') + ')');

            }
            
            /**
             * подготовливаем блок редактирования фотографии
             */
            var preparePhotos = function() {
                var jqDelPhotos = $(editor.document['$']).find('.picture .img .del');
                var jqEditTitle = $(editor.document['$']).find('.picture span.edit, .picture .add_desc a, .picture p');

                //редактирование фото
                jqEditTitle.unbind('click').click(function() {

                    var _selfFunc = arguments.callee;

                    var e = $(this).parents('.picture');
                    var title  = e.find('div.t p').text();
                    var jqPopup = $('#add_desc_photo');
                    var jqTextarea = jqPopup.find('textarea');

                    //ввод текста
                    jqTextarea.val(title || '').bind('focus keyup', function(){

                        if ($(this).val().length >= 300) {
                            $(this).val($(this).val().substr(0, 300))
                            return false;
                        }
                    });

                    //очищаем описание
                    jqPopup.find('a.cancel').unbind('click').click(function() {
                        jqPopup.find('textarea').val('');
                        return false;
                    });

                    //устанавлвиаем описание
                    jqPopup.find('a.choose').unbind('click').click(function(){
                        var titleHtml = getTitleHtml($.trim(jqPopup.find('textarea').val().replace(/\s+/gi,' ').replace(/"+/gi, '').replace(/<\/?[^>]+>|\&[^;]+;/gi, '')));
                        e.find('div.t').html(titleHtml);
                        e.find('span.edit, .add_desc a, p').click(_selfFunc);
                        jqPopup.hide();
                        $('#overlay').remove();
                        return false;
                    });

                    jqPopup.centering().overlay().show();
                    // var d = jqPopup.dialog({
                    //     autoOpen: false,
                    //     modal: true,
                    //     height: 400,
                    //     width: 800,
                    //     title: "Insert photo 2"
                    // });
                    // d.dialog('open');
                    jqTextarea.focus().setCursorPosition(jqTextarea.val().length);

                    return false;
                });

                //удаление фото
                jqDelPhotos.unbind('click').click(function(){

                    var element = $(this).parents('.picture');
                    var result = confirm('Вы действительно хотите удалить данную фотографию из заметки?', undefined, undefined, 'Удаление фотографии из заметки');
                    if ( result ) {
                            element.remove();
                    }
                    return false;
                });
            };
            
            var newPreloadImage = function() 
            {
                return $("<img src='' alt='изображение загружается' />"); 
            }
            
            /**
             **************** Команды редактора
             */
            
            //показать диалог добавления фото
            editor.addCommand( 'insertphoto_showdialog', {
                exec: function(editor) {
                    var editor_name = CKEDITOR.currentInstance.name;
                    var page = 'lib/insertphoto.php?CKEditor='+editor_name;
                    
                    $('#insertphoto_dialog .content .iframe_place') .html('<iframe style="border: 0px; " src="' + page + '" width="700" height="580"></iframe>')
                    $('#insertphoto_dialog').centering().overlay().show();
                                    
                        // инициализация полей диалога значениями по умолчанию
                    $('#' + editor.name).trigger('showInsertPhoto', [function(message){
                            // посылаем команду для добавления контента
                            editor.execCommand('pl_cmd_tezis', [message]);
                    }, '']);
            } } );

            /** 
             * добавление фото в едитор
             * @param photo_data {id,src,title}
             */
            editor.addCommand('pl_cmd_add_photo', {

                exec: function(editor, photo_data) {
                    //обработчик загрузки фото
                    var handler = function() {
                        normalizePhotoBlock(this);
                    };

                    //загружаем фото, и по окончанию загрузки обрабатываем
                    var img = $(new Image()).attr('id', photo_data.id).attr('src', photo_data.src).attr('title', photo_data.title);
                    $(img).load(handler);
                    var e_data = { id : photo_data.id, src : '/i/ajaxLoading.gif', title: photo_data.title };
                    editor.insertHtml( getPhotoEditHtml( e_data ), 'unfiltered_html' );
                    editor.fire("clearEmptyP");
                    preparePhotos();
                    
                    $('#insertphoto_dialog .close:not(.choose)').trigger('click');
                    
                    //заменяем размеры и получаем нужный размер фото
//                    photo.src = photo.src.replace('60x60', '534x363');

                }
            });
            
            // editor.addCommand( 'insertphoto_edithtml', {
            //     exec: function(editor, photo_data) {
            //         getPhotoEditHtml(photo_data);
                
            // }}); ?
            
            /**
             **************** События редактора
             */
            
            /**
             * событие происходит при загрузка едитора, после добавлених хтмл-кода в элемент
             * нам теперь нужно, заменить внутренний вид на тот, что используется в эдиторе
             * и навесить события
             */
            editor.on('instanceReady', dataReadyHandler);
            
            /**
             * перед тем как отдать данные для сохранения, нам нужно
             * подменить вёрстку всех блоков на внутреннюю
             */
            editor.on('beforeGetData', function(e){

                if (isDefined(e.editor.document)) {

                    //находим все блоки фото, сейчас они в редактируемом виде
                    var jqPhotoBlocks = $(e.editor.document['$']).find('div.picture');

                    //для каждого
                    jqPhotoBlocks.each(function(i, e) {
                        var jqElement = $(e);

                        //выдираем нужные нам параметры из вёрстки
                        //var photoId = parseInt(jqElement.attr('photoid'));
                        var photoId = jqElement.attr('photoid');
                        var src = jqElement.find('div.img').css('background-image').
                                replace('url(', '').replace(')', '').replace(/"/g, ''). //убираем обёртку бэкгроунда
                                replace(window.location.protocol+'//'+window.location.hostname, ''); //убираем путь хоста
                                // , т.к. можно сохранить на локальном, а если смотреть с теста, будет ничего не видно
                        var title = (jqElement.find('div.t p').text() || '').substr(0, 300); //обрезаем длину

                        //подставляем заменяющий блок перед заменяемый, который после грохаем
                        var internal_html = getPhotoInternalHtml({'id':photoId, 'src':src, 'title':title})
                        jqElement.before(internal_html);
                        jqElement.remove();
                    });
                }
            });

            editor.on('plUpdateControls', preparePhotos); 

            /**
             * событие происходит после того, как отдали данные на сохранение, теперь нужно провести обратную замену на редактируемый вид
             * и снова навесить события. Иначе в редакторе останется служебная верстка.
             */
            editor.on('getData', dataReadyHandler);
            /**
             * возвращаем события при Ctrl-Z
             */
            editor.on('key', function(e){
                if (isDefined(e.editor.document) && CKEDITOR.CTRL + 90 == e.data.keyCode) {//Ctrl-Z
                    setTimeout(function(){
                        preparePhotos();
                    }, 100);
                }
            });

        	editor.ui.addButton('Photo', {
				icon    : '/i/ico_btn_img.gif',
				label   : 'Вставить фото',
				command : 'insertphoto_showdialog'
			});
		}
	});
	
	
	
});