/* @resource /js/component/note/editor.js */
function editor() {}

editor.prototype.callback = 0;

editor.prototype.prepareTezis = function() {

    var _self = this;

    // объект счетчика
    var counter = $('#tezis_counter');
    var maxLength = 140;

    // подключаем возможность вызова окна для ввода тезиса
    $('#' + CKEDITOR.instances['field_noteeditor'].name).bind('showTezis', function(event, callback, message){

        _self.showTezis(callback);
        $('#add_tezis input').val(message);
        $('#add_tezis input').focus();
        $('#add_tezis input').blur();
        counter.html((maxLength - message.length) + " символов.</b>");
    });

    $('#add_tezis .cancel').click(function(){
        $('#add_tezis .close').click();
        return false;
    });

    // закрытие всплывающего окна для ввода тезиса
    $('#add_tezis .close').click(function(event){

        if ($(this).hasClass('choose')) {

            if (isDefined(_self.callback) && $.isFunction(_self.callback)) {

                _self.callback($('#add_tezis input').val().replace(/<\/?[^>]+>|\&[^;]+;/gi, ''));
                _self.callback = 0;
            }
        }
    });

    // счетчик символов
    $('#add_tezis input').bind('focus keyup', function(){

        var len = $(this).val().length;
        if (len <= maxLength) {

            counter.html((maxLength - len) + " символов.</b>");
        } else {

            counter.html(len + " символов.</b>");
        }
    });
};

editor.prototype.showTezis = function(callback) {
    
    this.callback = callback;
    $('#add_tezis').centering().overlay().show();
    $('#overlay').click(function(){
        
        $('#add_tezis .close:not(.choose)').trigger('click');
    });
};

editor.prototype.preparePhotoDialog = function() {

    var _self = this;

    //создаём объект селектора фото - для выбора фотографий и галерей
	var params = {};
	params.user_id = 1;
	params.dopParams = 2;
	// window.photoSelector = new PhotoSelector(params); сначала разобраться с $.telmplate
};

// END editor
