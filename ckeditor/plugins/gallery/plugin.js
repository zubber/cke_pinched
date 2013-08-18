$(document).ready(function(){
    
    CKEDITOR.plugins.add('gallery', {
        
        init : function( editor ) {

            var titleText = "Введите название галереи";
            var descrText = "Тут вы можете ввести описание галереи. Если такой необходимости нет, то просто оставьте это поле как есть.";

            editor.addCommand('rt_cmd_gallery', {
                    exec: function(editor, photos) {
                        // сюда добавить обработку
                        editor.insertHtml(getGalleryHtml(photos, "", ""));
                    }
            });
            
            editor.ui.addButton('rtGallery', {
                icon    : '/i/ico_btn_gal.gif',
                label   : 'Вставить галерею',
                command : 'rt_cmd_dlg_gallery_selector'
            });

            //команда вызова диалога "селектора фото"
            editor.addCommand('rt_cmd_dlg_gallery_selector', {

                exec: function(editor) {
                    // сюда добавить обработку

                    window.photoSelector.display({
                        isSinglePhotoSelection: false,
                        onSelectHandler: function(photos) {

                            if (!photos.length) {
                                return;
                            }

                            // посылаем команду для добавления контента
                            editor.execCommand('rt_cmd_gallery', photos);

                            editor.fire("clearEmptyP");

                            // инициализация полей диалога значениями по умолчанию
                            $.each(photos, function(i, el) {
                                $('#' + editor.name).trigger('addGeo', el);
                            });

                        }
                    });
                }
            });

            /**
             * устанавливает/обновляет действия на контролах галерей
             */
            var updateGalleryControls = function () {

                //удаление галереи
                var jqDelGallery = $(editor.document['$']).find('.gallery .title .del');

                jqDelGallery.unbind('click').click(function(){

                    var element = $(this).parents('.gallery');
                    confirm('Вы действительно хотите удалить данную галерею из заметки?', function(result){

                        if (result) {

                            element.remove();
                        }
                    }, undefined, undefined, 'Редактирование заметки');

                    return false;
                });

                //клик по фотке - отмечаем чек-бокс, выделяем фотку
                var jqPhotoContainer = $(editor.document['$']).find('.gallery .imgs li');
                var fromCheckbox = false; //был клик по чекбоксу или по li
                jqPhotoContainer.unbind('click').click(function(event){
                    var li = this;
                    var checkbox = $(this).find("input[type=checkbox]");

                    if($(event.target).attr("type") == "checkbox"){
                        setTimeout(function () {
                            $(li).click();
                        }, 1);
                    } else {
                        if (checkbox.attr('checked')) {
                            $(this).removeClass('act');
                            checkbox.removeAttr('checked');
                        } else {
                            $(this).addClass('act');
                            checkbox.attr('checked', 'checked');
                        }
                    }


                    fromCheckbox = false;
                    return false;
                });

                //отдельно обрабатываем клик по чек-боксу
                $("input[type=checkbox]", jqPhotoContainer).unbind("dblclick").dblclick(function (event) {
                    event.stopPropagation();
                });

                //li с фотками - при наведении подсвечиваются
                $(editor.document['$']).find('.gallery .imgs li').hover(function () {
                    $(this).addClass("act");
                }, function () {
                    var checkbox = $("input[type=checkbox]", this);
                    if(checkbox.attr("checked") != "checked"){
                        $(this).removeClass("act");
                    }
                });

                //удаление выбранных фото
                $(editor.document['$']).find('.gallery .buttons .ico_delete').unbind('click').click(function(){
                    $(this).parents(".gallery").find(".imgs li input[checked=checked]").parents("li").remove();
                });

                //добавление фото к галерее
                $(editor.document['$']).find('.gallery .buttons .ico_plus').unbind('click').click(function(){
                    var button = this;
                    window.photoSelector.display({
                        isSinglePhotoSelection: false,
                        onSelectHandler: function(photos) {

                            if (!photos.length) {
                                return;
                            }

                            // посылаем команду для добавления контента
                            appendPhotos(photos, $(button).parents(".gallery"));

                            editor.fire("clearEmptyP");

                            // инициализация полей диалога значениями по умолчанию
                            $.each(photos, function(i, el) {
                                $('#' + editor.name).trigger('addGeo', el);
                            });
                        }
                    });
                });

                //описание галереи
                $(editor.document['$']).find('.gallery .desc .edit').unbind('click').click(function(){
                    var _selfFunc = arguments.callee;

                    var e = $(this).parents('.gallery');
                    var descr  = e.find('div.desc p').text() == descrText ? "" : e.find('div.desc p').text();
                    var jqPopup = $('#add_desc_gallery');
                    var jqTextarea = jqPopup.find('textarea');

                    //ввод текста
                    jqTextarea.val(descr).bind('focus keyup', function(){

                        if ($(this).val().length >= 300) {
                            $(this).val($(this).val().substr(0, 300));
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
                        var text = $.trim(jqPopup.find('textarea').val().replace(/\s+/gi,' ').replace(/"+/gi, '').replace(/<\/?[^>]+>|\&[^;]+;/gi, ''));
                        e.find('div.desc p').text(text ? text : descrText);
                        jqPopup.hide();
                        $('#overlay').remove();
                        return false;
                    });

                    jqPopup.overlay().centering().show();
                    jqTextarea.focus().setCursorPosition(jqTextarea.val().length);

                    return false;
                });

                //название галереи
                $(editor.document['$']).find('.gallery .title .edit').unbind('click').click(function(){
                    var _selfFunc = arguments.callee;

                    var e = $(this).parents('.gallery');
                    var title  = e.find('div.title div.text').text() == titleText ? "" : e.find('div.title div.text').text();
                    var jqPopup = $('#add_title_gallery');
                    var jqTextarea = jqPopup.find('textarea');

                    //ввод текста
                    jqTextarea.val(title).bind('focus keyup', function(){

                        if ($(this).val().length >= 40) {
                            $(this).val($(this).val().substr(0, 40));
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
                        var text = $.trim(jqPopup.find('textarea').val().replace(/\s+/gi,' ').replace(/"+/gi, '').replace(/<\/?[^>]+>|\&[^;]+;/gi, ''));
                        e.find('div.title div.text').text(text ? text : titleText);
                        jqPopup.hide();
                        $('#overlay').remove();
                        return false;
                    });

                    jqPopup.overlay().centering().show();
                    jqTextarea.focus().setCursorPosition(jqTextarea.val().length);

                    return false;
                });

            };

            /**
             * перед тем как отдать данные для сохранения, нам нужно
             * подменить вёрстку всех блоков на внутреннюю
             */
            editor.on('beforeGetData', function(e){

                if (isDefined(e.editor.document)) {

                    //находим все блоки фото, сейчас они в редактируемом виде
                    var jqPhotoBlocks = $(e.editor.document['$']).find('div.gallery');

                    //для каждого
                    jqPhotoBlocks.each(function(i, e) {
                        var jqElement = $(e);

                        //выдираем нужные нам параметры из вёрстки
                        var photoIds = new Array();
                        var photoPreviewSrcs = new Array();
                        $(".imgs input[type=checkbox]",jqElement).each(function (el, i) {
                            photoIds.push($(this).attr('data-id'));
                            photoPreviewSrcs.push($(this).parents("li").find("div.imgContainer").css("background-image").
                                replace('url(', '').replace(')', '').replace(/"/g, ''). //убираем обёртку бэкгроунда
                                replace(window.location.protocol+'//'+window.location.hostname, '')); //убираем путь хоста
                            // , т.к. можно сохранить на локальном, а если смотреть с теста, будет ничего не видно
                        });

                        var title = (jqElement.find('div.title div.text').text() || '').substr(0, 300); //обрезаем длину
                        if(title == titleText){
                            title = "";
                        }

                        var descr = (jqElement.find('div.desc p').text() || '').substr(0, 300); //обрезаем длину
                        if(descr == descrText){
                            descr = "";
                        }

                        //подставляем заменяющий блок перед заменяемый, который после грохаем
                        jqElement.before(preparePlaceholderStr(photoIds, photoPreviewSrcs, title, descr));
                        jqElement.remove();
                    });
                }
            });

            editor.on('rtUpdateControls', updateGalleryControls);

            var appendPhotos = function (photos, gallery) {

                var photosStr = "";

                for (var i = 0; i < photos.length; i++) {
                    if($(".imgs input[data-id='"+photos[i].id+"']", gallery).size() == 0 ){
                        //проверка на то что такая фотка не была уже добавлена
                        photosStr += preparePhotoStr(photos[i]);
                    }
                }

                $(".imgs ul", gallery).append(photosStr);
            };

            /**
             * из данных о фото формирует строку для вставки в галерею
             * @param data
             */
            var preparePhotoStr = function(data){
                return '<li><div class="imgContainer" style="cursor:pointer;background:url(' + data.src + ') no-repeat center center"><img src="/i/px.gif" width="1" height="1" /></div><span class="dummy"><input type="checkbox" data-id="' + data.id + '" /></span></li>'
            };

            /**
             * возвращает html галереи
             * @param photos
             */
            var getGalleryHtml = function (photos, title, descr) {

                var photosStr = "";

                for (var i = 0; i < photos.length; i++) {
                    photosStr += preparePhotoStr(photos[i]);
                }

                if (!title) {
                    title = titleText;
                }

                if (!descr) {
                    descr = descrText;
                }

                return '<div class="gallery noSelect" contenteditable="false" style="cursor:default;">\
                    <div class="title" contenteditable="false">\
                    <span class="del"><img src="/i/px.gif" width="1" height="1" /></span>\
                    <span class="edit"><img src="/i/px.gif" width="1" height="1" /></span>\
                    <div class="text">' + title + '</div>\
                </div>\
                <div class="cont">\
                    <div class="buttons">\
                        <ul>\
                            <li class="ico_delete"><a href="#" style="cursor: pointer;">Удалить выбранное</a></li>\
                            <li class="ico_plus"><a href="#" style="cursor: pointer;">Добавить ещё</a></li>\
                        </ul>\
                        <div class="clear_both"><img src="/i/px.gif" width="1" height="1" /></div>\
                    </div>\
                    <div class="imgs">\
                        <ul>' + photosStr + '</ul>\
                    </div>\
                    <div class="clear_both"><img src="/i/px.gif" width="1" height="1" /></div>\
                </div>\
                <div class="desc" contenteditable="false">\
                    <span class="edit"><img src="/i/px.gif" width="1" height="1" /></span>\
                    <p contenteditable="false">' + descr + '</p>\
                <div class="clear_both"><img src="/i/px.gif" width="1" height="1" /></div>\
                </div>\
                </div>';
            };

            /**
             * подготавливает из данных плейсхолдер для сохранения
             * @param photoIds
             * @param photoPreviewStrs
             * @param title
             * @param descr
             */
            var preparePlaceholderStr = function(photoIds, photoPreviewStrs, title, descr) {
                if(photoIds.length != photoPreviewStrs.length) {
                    throw "Length of photoIds must be same as photoPreviewStrs.length";
                }

                return '<placeholder type="gallery" photoIds="'+photoIds.join(',')+'" photoPreviews="'+photoPreviewStrs.join(',')+'" title="'+title+'" descr="'+descr+'">_</placeholder>';
            };

            /**
             * Заменяет плейсхолдеры на соответствующие представления в редакторе
             */
            var replacePlaceholdersWithGalleries = function (e) {
                if (isDefined(e.editor.document)) {

                    //находим все блоки фото, сейчас они в внутреннем виде
                    var placeholders = e.editor.document.getElementsByTag("placeholder");
                    var el, i, j;

                    //для каждого
                    for (i = placeholders.count()-1; i >= 0; i--) {
                        el = placeholders.getItem(i);

                        if(el.getAttribute("type") != "gallery"){
                            continue;
                        }

                        //выдираем нужные нам параметры из вёрстки
                        var photoIds = el.getAttribute('photoIds').split(",");
                        var src = el.getAttribute('photoPreviews').split(",");
                        var title = el.getAttribute('title');
                        var descr = el.getAttribute('descr');
                        var photos = new Array();

                        for (j = 0; j < photoIds.length; j++) {
                            photos.push({id: photoIds[j], src : src[j]});
                        }

                        //заменяем блоки
                        $(el['$']).replaceWith(getGalleryHtml(photos, title, descr));
                    }

                    //навесить ивенты
                    updateGalleryControls();
                }
            };

            /**
             * событие происходит при загрузка едитора, после добавлених хтмл-кода в элемент
             * нам теперь нужно, заменить внутренний вид на тот, что используется в эдиторе
             * и навесить события
             */
            editor.on('instanceReady', replacePlaceholdersWithGalleries);

            /**
             * событие происходит после того, как отдали данные на сохранение, теперь нужно провести обратную замену на редактируемый вид
             * и снова навесить события
             */
            editor.on('getData', replacePlaceholdersWithGalleries);
        }

    });
});