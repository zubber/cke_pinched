window.PhotoSelector = function(params) {

    var _self = this;

    this.userId = parseInt(params['user_id']); //идентификатор пользователя
    this.dopParams = typeof(params['dopParams']) == 'number' ? new Object() : params['dopParams'];
    this.dopParams['userId'] = this.userId;
    this.photoPageSize = parseInt(params['photo_page_size']); //количество фоток на страница пагинатора
    this.isSinglePhotoSelection = null; //выделяется ли только одно фото или можно много
    this.onSelectHandler = function(photos){}; //функция обработчик выбора фотографий, обязательно нужно задать при вызове метода display

    this.albums = null; //список альбомов пользователя
    this.selectedAlbumIndex = null; //индекс выбранного альбома
    this.photos = null; //список фотографий по альбомам пользователей

    this.photosById = {}; //список фотографий по идентификатора, нужно для быстрого доступа, чтобы не прыгать потом по альбомам, страницам, и т.д.

    //отмеченные фотографии, ключ является id фотографии, потом легко вытащить все ключи и сразу всё уникально
    this.markedPhotos = {};
    //выбранные альбомы, ключ является id альбома, значение количество отмеченных от него фотографий
    //нужно для отображения
    this.markedAlbums = {};

    this.jqPopup = $('#pp-add-gal');
    this.jqAlbumsPrev = this.jqPopup.find('.nav .prev');
    this.jqAlbumsNext = this.jqPopup.find('.nav .next');
    this.jqAlbums = $('#photo-selector-albums');
    this.jqPhotos = $('#photo-selector-photos');
    this.jqPhotosList = this.jqPhotos.find('ul li');
    this.jqBigText = this.jqPopup.find('.bigtext');
    this.jqPaginator = this.jqPopup.find('.pagination');
    this.jqMarkedInfo =  this.jqPopup.find('.count_photo');
    this.jqChoose = $('#photo-selector-choose');
    this.jqClose = this.jqPopup.find('.cancel, span.close');

    //пагинатор для фотографий
    this.photoPager = new Pager({
        container: this.jqPaginator,
        //здесь будем обрабатывать вывод коментов по выбранной странице для текущей фотки
        onSetPageHandler: function(page) {
            _self.displayPhotos(_self.selectedAlbumIndex, page);
        }
    });

    //шаблон для альбомов
    $.template('tplAlbum', '\
        <div>\
        <li id="pp-photo-selector-${index}"{{if isActive}} class="active"{{/if}}>\
            <table{{if isActive}} class="active"{{/if}}>\
                <tr>\
                    <td rowspan="2"><a href="#" class="preview"><img src="${cover}" alt="" width="60" height="60" /></a></td>\
                    <td class="title"><a href="#">${name}</a></td>\
                </tr>\
                <tr>\
                    <td class="title">${photo_count} фото</td>\
                </tr>\
            </table>\
        </li>\
        </div>'
    );

    $.template('tplPhoto', '\
        <div>\
        <div id="pp-photo-selector-${album_id}-${id}" class="i{{if isMarked}} ia{{/if}}">\
            <img src="${curSrc}" alt="" width="60" height="60" />\
            <span class="checkbox"><input {{if hidePlace}}disabled="disabled"{{/if}} type="checkbox" {{if isMarked || hidePlace}} checked{{/if}} /></span>\
        </div>\
        </div>'
    );

    //выбор фотографии
    this.jqChoose.unbind('click').click(function() {

        var photos = _self.getMarkedInfo(true).photos;
        var handler = function(){

            _self.jqPopup.hide();
            $('#overlay').remove();

            //вызываем обработчик
            _self.onSelectHandler(photos);
        };
        if (photos.length) {

            // нам нужно знать, если ли в выбранном наборе фотографий
            // фотографии с геопривязкой не равной заданной при получении информации
            var notEqualGeo = 0;
            $.each(photos, function(index, photo){

                notEqualGeo += photo.notEqualGeo;
            });

            // если хотя бы одна фотография есть, то выводим попап
            if (notEqualGeo > 0) {

                // попап у нас только в качестве уведомления, в любом случае ждем ответа Да
                confirm('Привязать фото к курорту автоматически?', function(result){

                    if (result) {

                        handler();
                    }
                })
            } else {
                
                // если у всех фоток геопривязки совпадают с заданной, то просто закачиваем работу
                handler();
            }
        } else {

            stdAlert('Выберите фотографии из альбома!');
        }
        return false;
    });

    //отмена, закрытие попапа
    this.jqClose.unbind('click').click(function() {
        _self.jqPopup.hide();
        $('#overlay').remove();
        return false;
    });

    /**
     * кэширование изображения фотографии посредством предварительной загрузки
     * @param albumId
     * @param page
     * @param photoIndex
     */
    this.cachePhotoImage = function(albumId, page, photoIndex) {

        var photo = this.photos[albumId][page][photoIndex];

        //смысл такой, что по загрузке кэшированного фото, оно автоматически отобразится, если оно на виду
        //а до этого выводится гифка подгрузки
        var handler = function(){
            photo.cached = true;
            $('#pp-photo-selector-' + albumId + '-' + photo.id).find('img').attr('src', photo.src);
        };

        $(new Image()).load(handler).attr('src', photo.src);
    };

    /**
     * отмечено ли фото
     * @param photoId
     */
    this.isPhotoMarked = function(photoId) {

        return isDefined(this.markedPhotos[photoId]) && (this.markedPhotos[photoId] !== null);
    };

    /**
     * получаем инфо об отмеченных фотографиях и альбомах
     */
    this.getMarkedInfo = function(isDetail) {

        var markedPhotoCount = 0;
        var markedAlbumCount = 0;
        var photoCountByAlbum = 0;

        for(var i in this.markedAlbums) {

            photoCountByAlbum = parseInt(this.markedAlbums[i]);

            if (photoCountByAlbum > 0) {
                markedAlbumCount++;
            }

            markedPhotoCount += photoCountByAlbum;
        }

        var info = {
            photoCount: markedPhotoCount,
            albumCount: markedAlbumCount
        };

        //получать ли детальную информацию по id фото
        if (isDetail || false)  {

            var markedPhotos = [];

            for(var photoId in this.markedPhotos) {

                if (this.markedPhotos[photoId] !== null) {
                    markedPhotos.push(this.markedPhotos[photoId]);
                }
            }

            info['photos'] = markedPhotos;
        }

        return info;
    };

    /**
     * добавляем в фотографии по идентификатору
     * @param photos
     */
    this.addToPhotosById = function(photos) {

        var i = photos.length;
        while (i--) {

            this.photosById[photos[i].id] = photos[i];
        }
    };

    /**
     * снимаем отметки со всех фотографий
     */
    this.unmarkAllPhotos = function() {

        //очищаем все предыдущие отметки
        this.markedPhotos = {};
        this.markedAlbums = {};

        //визуально снимаем отметки на текущей странице (потому что мы её видим)
        var jqDivs = this.jqPhotosList.find('div.i');
        jqDivs.removeClass('ia');
        jqDivs.find('.ico').remove();
        jqDivs.find('input[type=checkbox]').attr('checked', false);

        this.jqMarkedInfo.html("");//убираем текст о выделенных фото
    };

    /**
     * переключаем отмеченность фото
     * @param photoId
     * @param albumId
     */
    this.toggleMarkingPhoto = function(photoId, albumId, e) {

        var checkbox = e.find('input[type=checkbox]');
        if (checkbox.attr('disabled')) {
            return;
        }

        //в зависимости от того, находится ли в отмеченных
        if (this.isPhotoMarked(photoId)) {

            //отображаем как неотмеченную
            e.removeClass('ia');
            e.find('input[type=checkbox]').attr('checked', false);

            //в массиве тоже
            this.markedPhotos[photoId] = null;

            //убавляем количество выделенных по альбома
            this.markedAlbums[albumId]--;
        } else {

            //если возможен выбор только одного фото
            //очищаем предыдущие отметки
            if (this.isSinglePhotoSelection) {
                this.unmarkAllPhotos();
            }

            //добалвяем фото в отмеченные
            this.markedPhotos[photoId] = this.photosById[photoId];

            //устанавливаем количество выделенных по альбому
            if (isDefined(this.markedAlbums[albumId])) {

                this.markedAlbums[albumId]++;
            } else {

                this.markedAlbums[albumId] = 1;
            }

            e.find('input[type=checkbox]').attr('checked', true);
            e.addClass('ia');
        }

        var markedInfo = this.getMarkedInfo();
        this.jqMarkedInfo.html(!this.isSinglePhotoSelection ? ('ВЫБРАНО ' + markedInfo.photoCount + ' фото из ' + declOfNum(markedInfo.albumCount, ['альбома', 'альбомов', 'альбомов'])) : '');
        this.jqMarkedInfo.show();
        this.jqMarkedInfo.forceRedraw(true);//Хром криво рисует этот блок

    };

    /**
     * получаем количество страниц фотографий для альбома
     * @param index
     */
    this.getAlbumTotalPages = function(index) {

        return Math.ceil(this.albums[index]['photo_count'] / this.photoPageSize);
    };

    /**
     * html-код альбома
     * @param index
     */
    this.getAlbumHtml = function(index) {

        if (isDefined(this.albums[index])) {

            var album = this.albums[index];
            album.isActive = (index == this.selectedAlbumIndex);
            album.index = index;
            return $.tmpl('tplAlbum', album).html();
        } else {
            
            return '';
        }
    };

    /**
     * html-код списка фотографий
     * @param photos
     */
    this.getPhotosHtml = function(photos) {

        var html = '', i, photo;

        for(i = 0; i < photos.length; i++) {

            photo = photos[i];
            photo.isMarked = this.isPhotoMarked(photo.id);
            photo.curSrc = (photo.cached || false) ? photo.src : '/i/ajaxLoading_60x60.gif';

            //подгружаем фото, если не закешировано
            if (!photo.cached) {
                this.cachePhotoImage(photo.album_id, this.photoPager.currentPage, i);
            }

            html += $.tmpl('tplPhoto', photo).html();
        }

        return html;
    };

    /**
     * выбираем альбом
     * @param index
     */
    this.selectAlbum = function(index) {

        this.selectedAlbumIndex = index;

        //выделяем блок для этого альбома
        this.jqAlbums.find('li, li table').removeClass('active');
        $('#pp-photo-selector-' + index).addClass('active').find('table').addClass('active');

        //говорим пагинатору показать нулевую страницу выбранного альбома
        this.photoPager.setPages(0, this.getAlbumTotalPages(index));
    };

    /**
     * подготавливаем фотки, для взаимодействия с ними
     */
    this.preparePhotos = function() {

        //скрываем начальный блок, открываем блок с фотками
        this.jqBigText.hide();
        this.jqPhotos.show();

        var jqDivs = this.jqPhotosList.find('div.i');

        //обработка отмечания фото
        jqDivs.click(function() {

            var domIdChain = this.id.split('-');
            var albumId = parseInt(domIdChain[3]);
            var photoId = parseInt(domIdChain[4]);

            _self.toggleMarkingPhoto(photoId, albumId, $(this));
        });

        //наведение на фото
        jqDivs.hover(
            function() {
                var e = $(this);
                var domIdChain = this.id.split('-');
                var photoId = parseInt(domIdChain[4]);
                
                e.prepend('<span href="/photo?id=' + photoId + '" class="ico" />');
                e.addClass('ia');
                e.find('.ico').click(function(){
                    
                    window.open($(this).attr('href'));
                });
            },
            function() {
                var e = $(this);
                e.find('.ico').remove();

                var domIdChain = this.id.split('-');
                var photoId = parseInt(domIdChain[4]);

                if (!_self.isPhotoMarked(photoId)) {
                    e.removeClass('ia');
                }
            }
        )
    };

    /**
     * @param index индекс альбома в массиве
     * @param page
     */
    this.displayPhotos = function(index, page) {

        var albumId = this.albums[index].id;

        if (!isDefined(this.photos[albumId][page])) {

            //чтобы если прокликать по альбом, загрузка ещё раз не началась
            this.photos[albumId][page] = [];

            this.dopParams.albumId = albumId;
            this.dopParams.offset = page * this.photoPageSize;
            ajaxSendRequest({
                action: 'getPhotosSelector',
                data: this.dopParams,
                complete: function(response) {

                    _self.photos[albumId][page] = response.data;

                    //добавляем для быстрого доступа при отдаче детальной информации о выбранных фотках
                    _self.addToPhotosById(response.data);

                    //значит уже выбрали другой альбом, или другую страницу этого альбома
                    //поэтому ничего отрисовывать не надо, просто сохраняем данные, и всё
                    if (!(index == _self.selectedAlbumIndex && page == _self.photoPager.currentPage)) {
                        return;
                    }

                    _self.jqPhotosList.html(_self.getPhotosHtml(response.data));
                    _self.preparePhotos();
                }
            });

        //уже загружаемый, но ещё не загруженный альбом отсеивается, просто ничего не произойдёт
        } else if (this.photos[albumId][page].length > 0) {

            this.jqPhotosList.html(_self.getPhotosHtml(this.photos[albumId][page]));
            this.preparePhotos();
        }
    };

    /**
     * отображаем альбомы
     */
    this.displayAlbums = function() {
        
        var html = '', len = this.albums.length, i;

        for(i = 0; i < len; i = i + 2) {
            html += this.getAlbumHtml(i);

            if ((i + 1) < len) {
                html += this.getAlbumHtml(i + 1);
            }
        }

        this.jqAlbums.html('<ul>' + html + '</ul>');

        //почемуто если сделать это без задержки, карусель срабатываем неправильно
        //возможно, это связано с тем, что js требутется некоторое время, чтобы запостить тот html-код
        //который я передаю выше
        setTimeout(function(){

            //подключаем карусель для альбомов
            //тут она подходит, т.к. список альбомов не статичный
            _self.jqAlbums.jCarouselLite({
                visible: 2,
                speed: 800,
                btnNext: '#pp-add-gal .nav .next',
                btnPrev: '#pp-add-gal .nav .prev',
                circular: false
            });

            //нажатие на альбом
            _self.jqAlbums.find('li a').click(function() {
                var albumIndex = parseInt($(this).parents('li').attr('id').split('-')[3]);
                _self.selectAlbum(albumIndex);
                return false;
            });

            //наведение на альбом
            _self.jqAlbums.find('td a').hover(
                function() {
                    var links = $(this).parents('table').find('a'),
                        cover = links.eq(0),
                        name = links.eq(1),
                        image = cover.find('img')[0];

                    $('<span class="ihover" />').prependTo(cover)
                    .css({'height':image.height,'width':image.width,'background-image':'url(/i/frame'+image.width+'x'+image.height+'.png)'});

                    name.addClass('hover');
                },
                function() {
                    var links = $(this).parents('table').find('a');
                    $('.ihover', links.eq(0)).remove();
                    links.eq(1).removeClass('hover');
                }
            );

            //если альбомов меньше 3ёх нужны в прокрутке нету
            if (_self.albums.length <= 2) {
                _self.jqAlbumsNext.addClass('disabled');
            }
        }, 10);
    };

    /**
     * показываем попоп
     */
    this.popup = function() {

        this.jqPopup.overlay().centering().show();
    };

    /**
     * вызываем попап
     */
    this.display = function(params) {

        if (!isDefined(params['isSinglePhotoSelection'])) {
            trace('Не указан режим выбора фотографий.');
            return;
        }

        if (!isDefined(params['onSelectHandler']) || !isFunction(params['onSelectHandler'])) {
            trace('Не указана функция-обработчик выбора фотографий.');
            return;
        }

        this.isSinglePhotoSelection = params['isSinglePhotoSelection'];
        this.onSelectHandler = params['onSelectHandler'];

        if (this.albums === null) {

            this.albums = false; //чтобы предотвратить дублирование загрузки
            ajaxSendRequest({
                action: 'getAlbumsSelector',
                data: this.dopParams,
                complete: function(response) {

                    _self.albums = response.data;

                    if (_self.albums.length === 0) {
                               
                        alert(window.component['Photo_Selector'].noAlbumsMsg);
                        return;
                    }                    

                    _self.photos = {};

                    //устанавливаем пустые значения по id альбомов, там будут храниться фотографии постранично
                    for(var i = 0; i < _self.albums.length; i++) {

                        _self.photos[_self.albums[i].id] = {};
                    }

                    _self.displayAlbums();
                    _self.popup();
                }
            })
        } else if (this.albums !== false) { //пока загружается

            if (this.albums.length === 0) {
                 
                alert(component['Photo_Selector'].noAlbumsMsg);
                return;
            }

            this.popup();
        }

        this.unmarkAllPhotos();
    }
};
