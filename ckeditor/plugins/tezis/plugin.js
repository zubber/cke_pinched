$(document).ready(function(){

    /**
     * Создаем плагин для добавления тезиса к заметке
     */
    CKEDITOR.plugins.add( 'tezis', {
        
        /**
         * При инициализации всего ckeditor заходим сюда 
         * PS: до загрузки данных и отображения
         */
        init : function( editor ) {
            /**
             * Событие для обработки нажатия по клавише Редактировать
             * PS: нужно инициализировать при добавлении нового и открытии сохраненного
             */
            var editClick = function(){
                
                editor.execCommand('pl_cmd_dialog_tezis', [this]);
                return false;
            };
            
            /**
             * Событие для обработки нажатия по клавише Удалить
             * PS: нужно инициализировать при добавлении нового и открытии сохраненного
             */
            var delClick = function(){
                
                var element = $(this).parents('.line_head');
                var result = confirm('Вы действительно хотите удалить данный тезис?', undefined, undefined, 'Создание заметки');
                if (result) {
                    element.remove();
                }
                return false;
            };
            
            /**
             * Функция для верстки редактирования
             */
            var editHTML = function(message) {

                return '<div contenteditable="false" class="line_head">\
                            <div contenteditable="false" class="vn">\
                                <div contenteditable="false" class="buttons">\
                                    <span contenteditable="false" class="del">&nbsp;</span>\
                                    <span contenteditable="false" class="edit">&nbsp;</span>\
                                </div>\
                                <p contenteditable="false">' + message + '</p>\
                            </div>\
                        </div><p>&nbsp;</p>';
            };
            
            /**
             * Функция для верстки просмотра
             */
            var previewHTML = function(message) {
                
                return '<placeholder type="tezis" value="' + message.replace(/"/g, '\\"') + '">_</placeholder>';
            };
            
            /**
             * Функция для назначения событий на клавиши
             */
            var setEditEvents = function (document) {
                $(document).find('.line_head').unbind('click').click(editClick).not('.del').unbind('click').click(editClick).end().find('.del').unbind('click').click(delClick);
            };
            
            /**
             * Функция для подготовки верстки редактирования тезисов
             */
            var prepareEditHTML = function (document) {
                
                // подменяем верстку - старый вариант
                var blockquotes = $(document["$"]).find('blockquote');

                blockquotes.find('span').each(function(index, element){
                    $(element).parents('blockquote').before(editHTML($(element).text()));
                });

                blockquotes.empty();
                blockquotes.remove();

                //плейсхолдеры
                //находим все блоки тезисов, сейчас они в внутреннем виде
                var placeholders = document.getElementsByTag("placeholder");
                var el;

                //для каждого
                for (var i = placeholders.count()-1; i >= 0; i--) {
                    el = placeholders.getItem(i);

                    if(el.getAttribute("type") != "tezis"){
                        continue;
                    }

                    //выдираем нужные нам параметры из вёрстки
                    var value = el.getAttribute('value');

                    //заменяем блоки
                    $(el['$']).replaceWith(editHTML(value));
                }

            };
            
            /**
             * Функция для подготовки верстки просмотра тезисов
             */
            var preparePreviewHTML = function (document) {
                
                // подменяем верстку
                var lineHeads = $(document).find('.line_head');
                lineHeads.find('p').each(function(index, element){

                    var parent = $(element).parents('.line_head');
                    parent.replaceWith(previewHTML($(element).text()));

                });
                //lineHeads.remove();
            };
            
            /**
             * ************* Команды редактора
             */

            /**
             * Создаем команду для добавления контента
             */
            editor.addCommand('pl_cmd_tezis', {
                
                exec: function(editor, data) {
                    
                    // добавляем в текущее место блок с тезисом
                    editor.insertHtml(editHTML(data));
                    setEditEvents(editor.document['$']);
                }
            });
            
            /**
             * Создаем команду для тулбара
             * открывает диалог и посылает команду для добавления контента
             */
            editor.addCommand('pl_cmd_dialog_tezis', {
                
                exec: function (editor, data) {
                    
                    // определяем текущий элемент
                    var sel = editor.getSelection(),
                    element = sel.getStartElement();
                    var insertMode;
                    var tezis;
                    
                    // редактирование или добавление
                    if (isDefined(data)) {
                        
                        tezis = $(data);
                        if (!tezis.hasClass('line_head')) {
                            
                            tezis = tezis.parents('.line_head');
                        }
                        insertMode = false;
                    } else if (element) {
                        
                        if ($(element['$']).hasClass('line_head')) {
                            
                            tezis = $(element['$']);
                        } else {
                            
                            tezis = $(element['$']).parents('.line_head');
                        }
                        
                        insertMode = element.data( 'cke-realelement' ) || !tezis.size();
                    } else {
                        
                        insertMode = true;
                    }
                    
                    if (insertMode) {
                        
                        // инициализация полей диалога значениями по умолчанию
                        $('#' + editor.name).trigger('showTezis', [function(message){
                            
                            if ($.trim(message).length) {
                                
                                // посылаем команду для добавления контента
                                editor.execCommand('pl_cmd_tezis', [message]);
                            }
                        }, '']);
                    } else {
                        
                        // инициализация полей диалога значениями из текущего элемента
                        $('#' + editor.name).trigger('showTezis', [function(message){
                            
                            if ($.trim(message).length) {
                                
                                tezis.find('p').text(message);
                            }
                        }, tezis.find('p').text()]);
                    }
                }
            });

            
            /**
             * ************* События
             */

            /**
             * Настраиваем попап-меню по клику на правую клавишу мыши
             */
            // if (editor.contextMenu) {
                
            //     // по нажатию будет открывать диалог
            //     editor.addMenuGroup('rutraveller');
            //     editor.addMenuItem('tezisItem', {
            //         label   : 'Редактировать',
            //         icon    : '/i/ico_ne_edit.gif',
            //         command : 'pl_cmd_dialog_tezis',
            //         group   : 'rutraveller'
            //     });
                
            //     // настраиваем место, клик по которому покажет меню Редактировать
            //     editor.contextMenu.addListener( function( element ) {
                    
            //         if (element) {
                        
            //             element = ($(element['$']).hasClass('line_head') || $(element['$']).parents('.line_head').size()) && !element.data('cke-realelement');
            //         }
                    
            //         if (element) {
                        
            //             return {tezisItem : CKEDITOR.TRISTATE_OFF};
            //         }
                    
            //         return null;
            //     });
            // }
            
            /**
             * Создаем клавиши и назначаем события на них
             * PS: сюда приходит уже после добавления данных в элемент
             */
            editor.on('instanceReady', function(e){
                
                if (isDefined(e.editor.document)) {
                    
                    prepareEditHTML(e.editor.document);
                    setEditEvents(e.editor.document['$']);
                }
            });


            /**
             * Сигнал на обновление контролов
             */
            editor.on('rtUpdateControls', function(e){
                setEditEvents(e.editor.document['$']);
            });


            /**
             * возвращаем события при Ctrl-Z
             */
            editor.on('key', function(e){
                if (isDefined(e.editor.document) && CKEDITOR.CTRL + 90 == e.data.keyCode) {//Ctrl-Z
                    setTimeout(function(){
                        setEditEvents(e.editor.document['$'])
                    }, 100);
                }
            });

            /**
             * Перед тем как отдать данные удаляем клавиши из контента
             */
            editor.on('beforeGetData', function(e){
                
                if (isDefined(e.editor.document)) {
                    
                    preparePreviewHTML(e.editor.document['$']);
                }
            });
            
            /**
             * После того как данные отдали, возвращаем клавишии на место
             */
            editor.on('getData', function(e){
                
                // находим клавиши и инициализируем события клика по ним
                if (isDefined(e.editor.document)) {
                    
                    prepareEditHTML(e.editor.document);
                    setEditEvents(e.editor.document['$']);
                }
            });
            
            /**
             * Добавляем клавишу для тулбара, нажатие по которой заставит открыть диалог
             */
            editor.ui.addButton('Tezis', {
                icon    : '/i/ico_btn_line.gif',
                label   : 'Вставить тезис',
                command : 'pl_cmd_dialog_tezis'
            });
        }
    });
});