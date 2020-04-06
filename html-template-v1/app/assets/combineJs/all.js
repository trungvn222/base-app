"use strict"
/* 
	DEFINE FUNCTIONS GENERAL
*/
var $ = jQuery;

const host = typeof jsData !== "undefined" ? jsData.assetsUrl : '';

/*
    {
        'key' : {
            url : host + 'assets/libs/textillate/animate.css',
            type : 'js|css' default is js
            loaded : false,
             dependancies: ['key']
        }
    }
*/
const scripts = {
    'animate': {
        url: host + 'assets/libs/textillate/animate.css',
        type: 'css',
        loaded: false
    },
    'lazy-image': {
        url: host + 'assets/libs/lazy-load/jquery.lazy.min.js',
        loaded: false,
    },
    'popper': {
        url: host + 'assets/libs/popper/popper.min.js',
        loaded: false,
    },
    'bootstrap': {
        url: host + 'assets/libs/bootstrap/js/bootstrap.min.js',
        loaded: false,
        dependancies: ['popper']
    }
}

const VIEW_PORT = {
    SMALL: 'SMALL',
    MEDIUM: 'MEDIUM',
    LARGE: 'LARGE',
   
};

const BREAK_POINT = {
    0: VIEW_PORT.SMALL,
    768: VIEW_PORT.MEDIUM,
    1025: VIEW_PORT.LARGE,
}

const viewport = () => {
    var e = window,
        a = 'inner';
    if (!('innerWidth' in window)) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return { width: e[a + 'Width'], height: e[a + 'Height'] };
}

const getViewPort = (key) => {
    return VIEW_PORT[key] || '';
}

const detectViewPort = breakpoint => {
    let vWidth = viewport()['width'];
    var vp = ''

    Object.keys(breakpoint).forEach(key => {
        if (vWidth >= key) {
            vp = breakpoint[key];
        }
    });
    return vp;
}

const message = message => {
    if (typeof console.log !== "undefined") {
        console.log(message);
    }
}

const loadScript = (script, callback) => {
    if (script.loaded) {
        
        if (typeof callback === 'function') {
            callback();
        }
        message(`${script.url} is loaded`);
        return;
    } else {
        $.ajax({
            url: script.url,
            dataType: 'script',
            cache: true, // or get new, fresh copy on every page load
            success: function(data) {
                script.loaded = true;
                message(`${script.url} is success`);
                if (script.type === 'css') {
                    jQuery('<link>', {rel:'stylesheet', type:'text/css', 'href': script.url}).appendTo('head');
                }
               
                if (typeof callback === 'function') {
                    callback();
                }
            }
        });
        return;
    }
}

const addScript = (list, key, callback) => {
    let script = list[key] || false;
    let count = 0;
    if (!script) {
        return;
    }
    if (typeof script.dependancies !== "undefined" && script.dependancies.length > 0) {
        script.dependancies.forEach(scr => {
            if (typeof list[scr] != "undefined") {
                addScript(list, scr, function() {
                    if (count == script.dependancies.length - 1) {
                        loadScript(script, callback);
                    }
                    count++;
                });
            }
        });
        return;
    } else {
        loadScript(script, callback);
    }


}

/* 
	container (jQuery element): parent of items Ex: .list .list-item => container is ".list"
	itemClass (String): class of item EX: .list-item
	elClassNeed (Array): elements need make same height  Ex: ['h2', '.description', ...]
*/
function makeSameHeight(container, itemClass, elClassNeed) {

    var container = jQuery(container);
    var itemClass = itemClass || '';
    var elClassNeed = elClassNeed || [];

    if (itemClass != "" && elClassNeed.length > 0) {
        var items = container.find(itemClass);
        var containerW = container.outerWidth();
        var totalItemW = 0;
        var maxH = {};
        var argsElement = [];

        //set default height
        jQuery.each(elClassNeed, function(index, c) {
            maxH[c] = {
                height: 0
            };
        });

        jQuery.each(items, function(index, item) {
            jQuery.each(elClassNeed, function(index, c) {
                jQuery(item).find(c).height('');
            });
        });

        jQuery.each(items, function(index, item) {
            totalItemW += jQuery(item).outerWidth(true);
            argsElement.push(item);

            /* find max height */
            jQuery.each(elClassNeed, function(index, c) {
                var h = jQuery(item).find(c).outerHeight();
                var mh = maxH[c].height;

                if (h > mh) {
                    maxH[c].height = h;
                }
            });
            //set max height
            if (Math.round(totalItemW) >= containerW) {
                jQuery.each(argsElement, function(index, el) {
                    jQuery.each(elClassNeed, function(index, c) {
                        jQuery(el).find(c).css({
                            height: maxH[c].height + 'px'
                        });
                    });
                });

                jQuery.each(elClassNeed, function(index, c) {
                    maxH[c] = {
                        height: 0
                    };
                });

                argsElement = [];
                totalItemW = 0;
            }
        });

        if (argsElement.length > 0) {
            jQuery.each(argsElement, function(index, el) {
                jQuery.each(elClassNeed, function(index, c) {
                    jQuery(el).find(c).css({
                        height: maxH[c].height + 'px'
                    });
                });
            });
        }
    }
}

/* 
	Append to above close body tag
	<div style="position: fixed; bottom: 0px; z-index: -1; width: 100%; " id="scroll-anchor-bottom"></div>
	<div style="position: fixed; top: 0px; z-index: -1; width: 100%;" id="scroll-anchor-top"></div>
*/
function simpleParallax(intensity, element) {
    $(element).data('offset-top', $(element).offset().top);
    var currentScroll = $(window).scrollTop();

    $(window).scroll(function() {
        var scrollTop = $(window).scrollTop();
        var offset = $(element).parents('.prallax-image-container').offset() || 0;
        var h = $(element).outerHeight();

        var offsetTop = offset.top || 0;
        var offsetBottom = offsetTop + h;
        var offsetAnchorBottom = $("#scroll-anchor-bottom").offset();
        var offsetAnchorTop = $("#scroll-anchor-top").offset();
        var next = $(window).scrollTop();
        var imgPos = 0;

        if (next < currentScroll) {
            if (offsetAnchorBottom.top < offsetBottom) {
                imgPos = (offsetAnchorBottom.top - offsetBottom) / intensity;
            } else if (offsetAnchorBottom.top > offsetBottom && offsetAnchorTop.top > offsetTop) {
                imgPos = (offsetAnchorTop.top - offsetBottom + h) / intensity;
            }
        } else {
            if (offsetAnchorTop.top > offsetTop) {
                imgPos = (offsetAnchorTop.top - offsetTop) / intensity;
            } else if (offsetAnchorTop.top < offsetTop && (offsetAnchorBottom.top - h) < offsetTop) {
                imgPos = (offsetAnchorBottom.top - offsetTop - h) / intensity;
            }
        }
        $(element).css({ translate: [0, imgPos] });
        currentScroll = next;
    });
    $(window).on('resize', function() {
        $(element).data('offset-top', $(element).offset().top);
        var scrollTop = $(window).scrollTop();
        var offsetTop = $(element).data('offset-top') || 0;

        var imgPos = (scrollTop - offsetTop) / intensity + 'px';
        $(element).css({ translate: [0, imgPos] });
    });
}

const lazyLoadBgImage = (image, parentClass = '.lazy-load-bg-image', callback) => {
    jQuery(image).Lazy({
        afterLoad: function(element) {
            var href = jQuery(element).attr('src');
            jQuery(element).parents(parentClass).css({
                'background-image': "url(" + href + ")"
            });
        },
        onFinishedAll: function() {
            if (typeof callback === 'function')
                callback();
        }
    });
}

const lazyLoadImage = (image, callback) => {
    jQuery(image).Lazy({
        onFinishedAll: function() {
            if (typeof callback === 'function')
                callback();
        }
    });
}

/*
    data-target-pc @STRING : ID OF ELEMENT
    data-target-tablet @STRING : ID OF ELEMENT
    data-target-mobile @STRING : ID OF ELEMENT

    Di chuyển element đến vị trí target

    <div class="take-action moving" data-target-tablet="#take-action-mobile" data-target-pc="#take-action-pc" data-target-mobile="#take-action-mobile">content here...</div>
*/
const moving = () => {
    jQuery('.moving').each(function(index, el) {
        let mobile = jQuery(el).data('target-mobile') || '';
        let tablet = jQuery(el).data('target-tablet') || '';
        let pc = jQuery(el).data('target-pc') || '';

        switch (window.CURRENT_VIEW_PORT) {
            case VIEW_PORT.SMALL:
                if (mobile != '') {
                    jQuery(this).insertAfter($(mobile));
                }
                break;
            case VIEW_PORT.MEDIUM:
                if (tablet != '') {
                    jQuery(this).insertAfter($(tablet));
                }
                break;
            case VIEW_PORT.LARGE:
                if (pc != '') {
                    jQuery(this).insertAfter($(pc));
                }
                break;
        }
    });
}

/*
    sẽ trả về true when scroll vượt qua element
*/
const elementInScroll = elem => {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}


/*
    kiểm tra element có tồn tại hay ko
*/
const checkExistElements = (selectors = []) => {
    let exist = false;
    if (selectors.length > 0) {
        selectors.forEach((value, index) => {
            if ($('body').find(value).length > 0) {
                exist = true;
                return true;
            }
        });
    }
    return exist;
}

/* 	
	Structure 
		<div class="spacing" data-height='{"pc":"80px","tablet":"70px","mobile":"80px"}'></div>
*/
const spacing = () => {

    $('.spacing').each(function() {
        var h = $(this).data('height');

        if (window.CURRENT_VIEW_PORT == VIEW_PORT.SMALL) {
            $(this).css({
                'height': h.mobile
            });
        } else if (window.CURRENT_VIEW_PORT == VIEW_PORT.MEDIUM) {
            $(this).css({
                'height': h.tablet
            });
        } else if (window.CURRENT_VIEW_PORT == VIEW_PORT.LARGE) {
            $(this).css({
                'height': h.pc
            })
        }
    });
};

const viewportChange = () => {
    if (window.OLD_VIEW_PORT !== window.CURRENT_VIEW_PORT) {
        $(window).trigger('viewport-changed', [window.CURRENT_VIEW_PORT, window.OLD_VIEW_PORT]);
        window.OLD_VIEW_PORT = window.CURRENT_VIEW_PORT;
    }
}

const header = jQuery('#header');
const mainContent = jQuery("#main-content");
const footer = jQuery("#footer");

const fitHMT = () => {
    jQuery(mainContent).css({
        'min-height' : 0
    });

    const headerH = jQuery(header).outerHeight(true);
    const MainH = jQuery(mainContent).outerHeight(true);
    const footerH = jQuery(footer).outerHeight(true);
    const windowH = jQuery(window).height();

    const totalH = headerH + MainH + footerH;
    const delta = windowH - totalH;
    console.log(totalH, windowH, delta);
    if(delta > 0){
        jQuery(mainContent).css({
            'min-height': delta + 'px'
        });
    }
}


//init view port
window.OLD_VIEW_PORT = '';
window.CURRENT_VIEW_PORT = detectViewPort(BREAK_POINT);

(function() {
    spacing();
    moving();
    $(window).on('load', function() {
        $(window).trigger('resize');
    });

    var timer = window.setTimeout(function() {}, 0)
    $(window).on('resize', function() {
        window.clearTimeout(timer);
        timer = window.setTimeout(function() {
            window.clearTimeout(timer);
            window.CURRENT_VIEW_PORT = detectViewPort(BREAK_POINT);
            viewportChange();
            spacing();
            moving();
            fitHMT();
        }, 100);
    });
})();
jQuery(function($){
    const afterOpenNavMain = () => {
        const headerH = $(header).outerHeight();
        const navMainH = $("#nav-main").outerHeight();
        const windowH = $(window).height();

        const h = headerH + navMainH;
        if(h > windowH){
            $("#wrapper").css({
                height: h + 'px'
            });
        }
    }

    const afterCloseNavMain = () => {
        $("#wrapper").css({
            height: 'auto'
        });
    }

    addScript(scripts, 'bootstrap', function(){
        jQuery("#nav-main").on('show.bs.collapse', function(){
            $("#toggle-nav-main .hamburger").addClass('active');
            afterOpenNavMain();
        });
        jQuery("#nav-main").on('hidden.bs.collapse', function(){
            $("#toggle-nav-main .hamburger").removeClass('active');
            afterCloseNavMain();
        });
    });

    function AddArrowIfHasSubMenu(list){
        let span = '<span class="arrow-down"></span>';
        jQuery(list).each(function(index, el){
            let ul = jQuery(el).find('>ul');
            if(ul.length > 0){
                $(el).find('>a').append(span);
                $(el).find('>a').click(function(e){
                    let target = e.target;
                    if($(target).hasClass('arrow-down')){
                        if($(ul).is(":hidden")){
                            $(ul).slideDown(500, function(){
                                $(el).addClass('active');
                                afterOpenNavMain();
                            });
                        }else{
                            $(ul).slideUp(500, function(){
                                $(el).removeClass('active');
                                afterOpenNavMain();
                            });
                        }
                    }else {
                        return true;
                    }
                    return false;
                });
            }
        });
    }

    function ResetMenuWhenChangeDevice(reset, list){
        if(reset){
            jQuery(list).removeClass('active');
            jQuery(list).find('>ul').removeAttr('style');
        }
    }

    let list = $("#nav-main li");
    AddArrowIfHasSubMenu(list);

    jQuery(window).on('viewport-changed', function(e, currentVP, oldVP){
        if(currentVP === VIEW_PORT.LARGE){
            let menu = $('#nav-main ul li');
            ResetMenuWhenChangeDevice(true, menu);
            afterCloseNavMain();
        }
    })
});