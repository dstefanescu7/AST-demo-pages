"use strict";

(function(){

    var init = function(){
        nav_div = document.getElementById('nav');
        nav_btn = document.getElementById('nav_btn');
        nav_c = document.getElementById('nav_c');
        nav_c2 = document.getElementById('nav_c2');
        nav_btn.onclick = navBtnClick;
        lc.addEvent(window, 'scroll', onScroll);

        resize(lc._screen.width, lc._screen.height);
        lc._screen.responsive.push(resize);
    };

    var navBtnClick = function(){
        if(!is_min_nav){
            is_min_nav = true;
            nav_c2.appendChild(nav_div);
        }
        else{
            is_min_nav = false;
            nav_c.appendChild(nav_div);
        }
    };

    var onScroll = function(){
        var st = lc.getScrollTop();
        if(!is_nav_fixed && st > nav_div.offsetTop){
            is_nav_fixed = true;
            document.body.className += ' nav_fixed';
        }
        else if(is_nav_fixed && st <= nav_div.parentNode.offsetTop){
            is_nav_fixed = false;
            document.body.className = document.body.className.replace(' nav_fixed', '');
        }
    };

    var resize = function(w, h){
        if(w > 700){
            if(is_min_nav) lc.eventFire(nav_btn, 'click');
            if(isLoad){
                nav_c.style.width = (nav_div.offsetWidth+1) + 'px';
                isLoad = false;
            }
        }
    };

    var nav_div = null;
    var nav_btn = null;
    var nav_c = null;
    var nav_c2 = null;
    var is_min_nav = false;
    var is_nav_fixed = false;
    var isLoad = true;

    init();

})();