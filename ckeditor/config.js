CKEDITOR.on('instanceReady', function( ev ) {
    //инитим кнопки
    var obj = new editor();
    obj.prepareTezis();
    obj.preparePhotoDialog();


    //устанвливаем чтобы всегда выводились скроллы для редактора
    if ($.browser.msie && (parseInt($.browser.version) == 7 || parseInt($.browser.version) == 8)) {
        $('#field_noteeditor').css('overflow-y', 'scroll');
        $('#cke_contents_field_noteeditor').css('width', '580px');
    } else {
        $(ev.editor.document['$']).find('body').css('overflow-y', 'scroll');
    }


    //запрещаем добавление лишних новых строк и отступов внутри исходного html
    var blockTags = ['div','h1','h2','h3','h4','h5','h6','p','pre','li','blockquote','ul','ol',
        'table','thead','tbody','tfoot','td','th'];

    for (var i = 0; i < blockTags.length; i++)
    {
        ev.editor.dataProcessor.writer.setRules( blockTags[i], {
        indent : false,
        breakBeforeOpen : true,
        breakAfterOpen : false,
        breakBeforeClose : false,
        breakAfterClose : true
        });
    }

    /**
     * запрещаем удалять div-ы c помощью кнопок delete и backspace
     */
/*
    ev.editor.on("key", function (e) {
        var ranges,curRange,boundaryNodes;

        if(e.data.keyCode == 8){ //backspace
            ranges = e.editor.getSelection().getRanges();
            curRange = ranges[0];

            boundaryNodes = curRange.getBoundaryNodes();

            if (curRange.startOffset == 0 && curRange.endOffset == curRange.startOffset
                && curRange.startContainer["$"] == curRange.endContainer["$"]) {

                if ( "div" == $(boundaryNodes.startNode["$"]).parent().prev().children(":first").get(0).nodeName.toLowerCase()){
                    e.cancel();
                }
            }

            return false;
        } else if (e.data.keyCode == 46){//delete

            ranges = e.editor.getSelection().getRanges();
            curRange = ranges[0];

            boundaryNodes = curRange.getBoundaryNodes();

            if (curRange.startOffset == curRange.startContainer["$"].length
                && curRange.endOffset == curRange.startOffset
                && curRange.startContainer["$"] == curRange.endContainer["$"]
                && typeof $(boundaryNodes.endNode["$"]).parent().next().children(":first").get(0) != "undefined"
                && "div" == $(boundaryNodes.endNode["$"]).parent().next().children(":first").get(0).nodeName.toLowerCase()
                || typeof $(boundaryNodes.endNode["$"]).next().children().get(1) != "undefined"
                && "div" == $(boundaryNodes.endNode["$"]).next().children().get(1).nodeName.toLowerCase()) {

                    e.cancel();
            }

            return false;

        //обработка нажатий курсорных клавиш чтобы в ИЕ не заходил внутрь блоков div
        //обработку нужно вызвать через какое-то время, чтобы курсор оказался внутри блока
        } else if (e.data.keyCode == 39 || e.data.keyCode == 40){//right & down arrows
            var fCharTimeout;

            var forwardHandler = function(){
                if(checkIsCarrierInDiv(e)){
                    if(!moveCarrierToNextParagraph(e)){
                        moveCarrierToPrevParagraph(e);
                    }
                }

            };

            if(fCharTimeout){
                clearTimeout(fCharTimeout);
            }

            fCharTimeout = setTimeout(forwardHandler, 50);
        } else if (e.data.keyCode == 37 || e.data.keyCode == 38){//left & up arrows
            var bCharTimeout;

            var bakcwardHandler = function(){
                if(checkIsCarrierInDiv(e)){
                    if(!moveCarrierToPrevParagraph(e)){
                        moveCarrierToNextParagraph(e);
                    }
                }

            };

            if(bCharTimeout){
                clearTimeout(bCharTimeout);
            }

            bCharTimeout = setTimeout(bakcwardHandler, 10);
        }
    });
*/

    //убираем пустые теги P вокруг DIV
    ev.editor.on('clearEmptyP', function(ev){
        //trace('clearEmptyP');
        //trace(ev.editor.document.getBody().getHtml());

        if(CKEDITOR.env.ie){//для IE вычищаем _</placeholder>
            ev.editor.document.getBody().setHtml(
                ev.editor.document.getBody().getHtml().replace(/_?<\/placeholder>/ig, "")
            );
        }

        var divs = ev.editor.document.getElementsByTag("div"), el;

        for (var i = divs.count()-1; i >= 0; i--) {
            el = divs.getItem(i);
            if(el.getParent().getName().toLowerCase() == "body"){
                if (el.hasPrevious() && el.getPrevious().hasOwnProperty("getName") && el.getPrevious().getName().toLowerCase() == "p" && el.getPrevious().getText() == ""){
                    el.getPrevious().remove();
                }

                if (el.hasNext() && el.getNext().hasNext() && el.getNext().hasOwnProperty("getName") && el.getNext().getName().toLowerCase() == "p" && el.getPrevious().getText() == ""){
                    el.getPrevious().remove();
                }
            }

        }

        ev.editor.fire("rtUpdateControls");

        $('.noSelect', ev.editor.document["$"]).disableTextSelect();//No text selection on elements with a class of 'noSelect'
    });

    ev.editor.fire("clearEmptyP");

    ev.editor.on("getData", function(){
        ev.editor.fire("clearEmptyP");
    });
});


/**
 * @param event CKEDITOR.event
 */
function checkIsCarrierInDiv(event){
    var inDiv = false;

    var selection = event.editor.getSelection();
    var ranges = selection.getRanges();
    var nodes = ranges[0].getBoundaryNodes();
    var parents = nodes.startNode.getParents(true);

    $.each(parents, function( index, el){
        if(el["$"].nodeName.toLowerCase() == "div"){
            inDiv = true;
        }
    });

    return inDiv;
}

/**
 * @param event CKEDITOR.event
 */
function moveCarrierToNextParagraph(event){
    var moved = false;
    var selection = event.editor.getSelection();
    var ranges = selection.getRanges();
    var nodes = ranges[0].getBoundaryNodes();
    var parents = nodes.startNode.getParents(true);

    var prevEl;

    $.each(parents, function( index, el){
        if(el["$"].nodeName.toLowerCase() == "body"){
            ranges[0].setStartAt(prevEl.getNext(), CKEDITOR.POSITION_AFTER_START);
            ranges[0].setEndAt(prevEl.getNext(), CKEDITOR.POSITION_AFTER_START);
            selection.selectRanges(ranges);
            moved = true;
        }
        prevEl = el;

    });

    return moved;
}

/**
 * @param event CKEDITOR.event
 */
function moveCarrierToPrevParagraph(event){
    var moved = false;
    var selection = event.editor.getSelection();
    var ranges = selection.getRanges();
    var nodes = ranges[0].getBoundaryNodes();
    var parents = nodes.endNode.getParents(true);

    var prevEl;

    $.each(parents, function( index, el){
        if(el["$"].nodeName.toLowerCase() == "body"){
            ranges[0].setStartAt(prevEl.getPrevious(), CKEDITOR.POSITION_BEFORE_END);
            ranges[0].setEndAt(prevEl.getPrevious(), CKEDITOR.POSITION_BEFORE_END);
            selection.selectRanges(ranges);
            moved = true;
        }
        prevEl = el;
    });

    return moved;
}