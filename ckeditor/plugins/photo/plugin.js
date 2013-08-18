$(document).ready(function(){

    CKEDITOR.plugins.add('photo', {
        
        init : function(editor) {

            /**
             * получаем хтмл код описания
             * @param title
             */
            var getTitleHtml = function(title) {

                if (title) {
                    return '<span contenteditable="false" class="edit"></span><p contenteditable="false">' + title + '</p><div contenteditable="false" class="clear_both"></div>';
                } else {
                    return '<div contenteditable="false" class="add_desc"><a contenteditable="false" href="#"><span contenteditable="false">Добавить описание фотографии</span></a></div>';
                }
            };

            /**
             * получаем хтмл код редактирования блока фото
             * @param photoId
             * @param src
             * @param title
             */
            var getPhotoEditHtml = function(photoId, src, title) {

                return '\
                    <div contenteditable="false" rtckphotoid="' + photoId + '" class="picture" style="width:534px;">\
                        <div contenteditable="false" class="img" style="background:url(' + src + ') no-repeat center center;height:363px;">\
                            <span contenteditable="false" class="del">&nbsp;</span>\
                            <div contenteditable="false" class="clear_both">&nbsp;</div>\
                        </div>\
                        <div class="t" contenteditable="false" width="100%">' + getTitleHtml(title) + '</div>\
                    </div>';
            };

            /**
             * получаем внутренний хтмл код блока фото (в том виде, в котором он хранится в бд)
             * @param photoId
             * @param src
             * @param title
             */
            var getPhotoInternalHtml = function(photoId, src, title) {

                return '<placeholder type="photo" photoid="' + photoId + '" photosrc="' + src + '" phototitle="' + title + '">_</placeholder>';
            };

            /**
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
                        var photoId = parseInt(el.getAttribute('photoid'));
                        var src = el.getAttribute('photosrc');
                        var title = el.getAttribute('phototitle');

                        //заменяем блоки
                        $(el['$']).replaceWith(getPhotoEditHtml(photoId, src, title));
                    }

                    //навесить ивенты
                    preparePhotos();

                }
            };

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

                    jqPopup.overlay().centering().show();
                    jqTextarea.focus().setCursorPosition(jqTextarea.val().length);

                    return false;
                });

                //удаление фото
                jqDelPhotos.unbind('click').click(function(){

                    var element = $(this).parents('.picture');
                    confirm('Вы действительно хотите удалить данную фотографию из заметки?', function(result){

                        if (result) {

                            element.remove();
                        }
                    }, undefined, undefined, 'Создание заметки');

                    return false;
                });
            };

            //команда вызова диалога "селектора фото"
            editor.addCommand('rt_cmd_dlg_photo_selector', {

                exec: function(editor) {

                    window.photoSelector.display({
                        'isSinglePhotoSelection': true,
                        'onSelectHandler': function(photos) {

                            if (!photos.length) {
                                return;
                            }

                            // посылаем команду для добавления контента
                            editor.execCommand('rt_cmd_photo', photos[0]);
                            
                            // инициализация полей диалога значениями по умолчанию
                            $('#' + editor.name).trigger('addGeo', [photos[0]]);
                        }
                    });
                }
            });

            //добавление фото в едитор
            editor.addCommand('rt_cmd_photo', {

                exec: function(editor, photo) {

                    //заменяем размеры и получаем нужный размер фото
                    photo.src = photo.src.replace('60x60', '534x363');

                    //обработчик загрузки фото
                    var handler = function() {
                        $(editor.document['$']).find('div[rtckphotoid=' + photo.id + '] div.img').css('background-image', 'url(' + photo.src + ')');
                    };

                    editor.insertHtml(getPhotoEditHtml(photo.id, '/i/ajaxLoading.gif'));

                    editor.fire("clearEmptyP");

                    //загружаем фото, и по окончанию загрузки обрабыбатываем
                    $(new Image()).load(handler).attr('src', photo.src);
                }
            });

            //добавляем кнопку в интерфейс
            editor.ui.addButton('rtPhoto', {
                icon    : '/i/ico_btn_img.gif',
                label   : 'Вставить фото',
                command : 'rt_cmd_dlg_photo_selector'
            });

            editor.on('rtUpdateControls', preparePhotos);

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
                        var photoId = parseInt(jqElement.attr('rtckphotoid'));
                        var src = jqElement.find('div.img').css('background-image').
                                replace('url(', '').replace(')', '').replace(/"/g, ''). //убираем обёртку бэкгроунда
                                replace(window.location.protocol+'//'+window.location.hostname, ''); //убираем путь хоста
                                // , т.к. можно сохранить на локальном, а если смотреть с теста, будет ничего не видно
                        var title = (jqElement.find('div.t p').text() || '').substr(0, 300); //обрезаем длину

                        //подставляем заменяющий блок перед заменяемый, который после грохаем
                        jqElement.before(getPhotoInternalHtml(photoId, src, title));
                        jqElement.remove();
                    });
                }
            });

            /**
             * событие происходит после того, как отдали данные на сохранение, теперь нужно провести обратную замену на редактируемый вид
             * и снова навесить события
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
        }
    });
});