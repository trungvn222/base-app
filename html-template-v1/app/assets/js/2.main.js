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