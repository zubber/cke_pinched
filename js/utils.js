//определена ли переменная
function isDefined (mixed) {
    
    return typeof(mixed) != 'undefined';
}

//является ли функцией переменная
function isFunction (mixed) {
    
    return isDefined(mixed) && mixed.constructor == Function;
}


/**
 * получаем хтмл код редактирования блока фото
 */
function getPhotoEditHtml(photo_data) {

    return '\
        <div contenteditable="false" photoid="' + photo_data.id + '" class="picture" style="width:534px;">\
            <div contenteditable="false" class="img" style="background:url(' + photo_data.src + ') no-repeat center center;height:363px;">\
                <span contenteditable="false" class="del">&nbsp;</span>\
                <div contenteditable="false" class="clear_both">&nbsp;</div>\
            </div>\
            <div class="t" contenteditable="false" width="100%">' + photo_data.description + '</div>\
        </div>';
};

/**
 * получаем внутренний хтмл код блока фото (в том виде, в котором он хранится в бд)
 */
function getPhotoInternalHtml(photo_data) {
    return '<placeholder type="photo" photoid="' + photo_data.id + '" photosrc="' + photo_data.src + '" phototitle="' + photo_data.title + '">_</placeholder>';
};