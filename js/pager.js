/* @resource /js/component/photo/selector.js */
var Pager = function(params) {

    var _self = this;

    this.jqContainer = params.container;
    this.onSetPageHandler = params.onSetPageHandler || function(){};
    this.currentPage = 0;
    this.totalPages = 0;

    /**
     *
     * @param currentPage
     * @param totalPages
     */
    this.setPages = function(currentPage, totalPages) {

        this.currentPage = currentPage;

        if (isDefined(totalPages)) {
            this.totalPages = parseInt(totalPages);
        }

        if (this.totalPages) {

            if (this.currentPage < 0) {
                this.currentPage = 0;
            } else if (this.currentPage >= this.totalPages) {
                this.currentPage = this.totalPages - 1;
            }
        } else {
            this.currentPage = 0;
        }

        this.onSetPageHandler(this.currentPage);
        this.display();
    };

    /**
     * хтмл-код пейджера
     */
    this.getHtml = function() {

        var html = '<div class="npwrap">';
        if (this.currentPage > 0) {
            html += '<span class="prev">&#8592;&nbsp;<a href="#" id="pagerPrevPage">предыдущая</a></span> <span class="first"><a id="pagerFirstPage" href="#">первая</a></span>';
        }
        html += '</div>';

        html += '<div class="pages">';
        for(var i = 0; i < this.totalPages; i ++) {

            if (i >= (this.currentPage - 2) && i <= (this.currentPage + 2)) {

                if (i == this.currentPage) {
                    html += '<span>' + (i + 1) + '</span>';
                } else {
                    html += '<a href="#" id="pager_' + i + '">' + (i + 1) + '</a>';
                }
            }
        }
        html += '</div>';

        html += '<div class="npwrap">';
        if (this.currentPage < (this.totalPages - 1)) {
            html += '<span class="next"><a href="#" id="pagerNextPage">следующая</a>&nbsp;&#8594;</span> <span class="last"><a id="pagerLastPage" href="#">последняя</a> (' + this.totalPages + ')</span>';
        }
        html += '</div>';

        return html;
    }

    /**
     * вывод пейджера
     */
    this.display = function() {
        this.jqContainer.toggle(this.totalPages > 1).html(this.getHtml());

        //предыдушая страница
        $('#pagerPrevPage').click(function(){
            _self.setPages(_self.currentPage - 1);
            return false;
        });

        //следующая страница
        $('#pagerNextPage').click(function(){
            _self.setPages(_self.currentPage + 1);
            return false;
        });

        //первая страница
        $('#pagerFirstPage').click(function(){
            _self.setPages(0);
            return false;
        });

        //последняя страница
        $('#pagerLastPage').click(function(){
            _self.setPages(_self.totalPages - 1);
            return false;
        });

        //ссылки на конкретные страницы
        this.jqContainer.find('div.pages a').click(function() {
            var page = parseInt(this.id.split('_')[1]);
            _self.setPages(page);
            return false;
        });
    }
}