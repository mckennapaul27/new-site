/*side-menu-start*/

$(function () {
    var Accordion = function (el, multiple) {
        this.el = el || {};
        this.multiple = multiple || false;

        // Variables privadas
        var links = this.el.find('.m-title');
        // Evento
        links.on('click', {
            el: this.el,
            multiple: this.multiple
        }, this.dropdown)
    }
    Accordion.prototype.dropdown = function (e) {
        var $el = e.data.el;
        $this = $(this),
                $next = $this.next();

        $next.slideToggle();
        $this.parent().toggleClass('open');

        if (!e.data.multiple) {
            $el.find('.dropdown_menu').not($next).slideUp().parent().removeClass('open');
        }
        ;
    }
    var accordion = new Accordion($('#accordion'), false);
});

/*side-menu-end*/


/*full-width-start*/

$(document).ready(function () {
    $(".slide-toggle").click(function () {
        $('body').toggleClass('full-width');
    });
});

/*full-width-end*/

/*selectbox-start*/

$(".select-box").click(function () {
    $(this).attr("tabindex", 1).focus();
    $(this).toggleClass("active");
    $(this).find(".dropdown-menu").slideToggle(150)
});
$(".select-box").focusout(function () {
    $(this).removeClass("active");
    $(this).find(".dropdown-menu").slideUp(150)
});
$(".select-box .dropdown-menu li").click(function () {
    $(this).parents(".select-box").find("span").text($(this).text());
    $(this).parents(".select-box").find("input").attr("value", $(this).attr("id"))
});

/*selectbox-end*/


/*searchbox-start*/

//$(".link").click(function () {
//    $('.searchbox').slideToggle();
//});

/*searchbox-end*/

/*searchbox-start*/

$(document).ready(function () {
    $(".link").click(function () {
        $('body').toggleClass('search-slide');
    });
});
/*searchbox-end*/
