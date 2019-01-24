"use strict";

(function(){

    var init = function(){
        nav_div = document.getElementById('nav');
        nav_div.parentNode.style.width = (nav_div.offsetWidth+1) + 'px';
        lc.addEvent(window, 'scroll', onScroll);
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
    }

    var nav_div = null;
    var is_nav_fixed = false;

    init();

})();