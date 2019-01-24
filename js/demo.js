"use strict";

(function(){

    function Nav(is2){

        var thatNav = this ;
        
        var init = function(){
            div = document.getElementById('nav');
            nav_c_div = document.getElementById('nav_c');
            nav_btn = document.getElementById('nav_btn');
            nav_btn.onclick = navBtnClick;
            thatNav.resize(lc._screen.width, lc._screen.height);

            items = lc.gebcn({p:div, tag:'div', cn:'item'});

            setItems();
            thatNav.setHeight();

            setTimeout(function(){
                checkVisible(div.scrollTop);
            }, 100);
            lc.addEvent(div, 'scroll', onScroll);
        };

        var setItems = function(){
            for(var i=0; i<items.length; i++){
                items[i] = {div:items[i], isVisible:false};
                items[i].div.onclick = itemClick;
                items[i].div.className += ' color'+(i%2+1);
            }
        };

        this.setHeight = function(){
            if(!items) return;

            var minH = !is_nav2 ? 120 : 60;

            if(items.length*minH < main_height){
                var hh = Math.floor(main_height/items.length);
            }
            else var hh = minH;

            if(is_nav2 && !is_nav3) hh = 60;

            height = hh;
    
            for(var i=0; i<items.length; i++){
                items[i].div.style.height = hh+'px';
            }
        };

        var navBtnClick = function(){
            if(is_nav2 && !is_nav3){
                is_nav3 = true;
                document.body.className += ' nav3';
                nav3_div.appendChild(nav.getDiv());
                thatNav.resize(lc._screen.width, lc._screen.height);
            }
            else if(is_nav3){
                is_nav3 = false;
                nav2_div.appendChild(nav.getDiv());
                nav.setHeight();
                document.body.className = document.body.className.replace(' nav3', '');
            }
        };

        var checkVisible = function(st){
            if(!items) return;
            for(var i=0; i<items.length; i++){
                if(
                    !items[i].isVisible 
                    && items[i].div.offsetTop+height >= st 
                    && items[i].div.offsetTop <= st+div.offsetHeight
                ){
                    items[i].isVisible = true;
                    items[i].div.className += ' item_anim';
                    if(st<oldSt) items[i].div.style.transformOrigin = '0 '+height+'px 0';
                }
                else if(
                    items[i].isVisible 
                    && (
                        items[i].div.offsetTop < st-height 
                        || items[i].div.offsetTop > (st+div.offsetHeight)
                    )
                ){
                    items[i].isVisible = false;
                    items[i].div.className = items[i].div.className.replace(' item_anim', '');
                    items[i].div.style.transformOrigin = '0 0 0';
                }
            }
            oldSt = st;
        };

        var onScroll = function(){
            checkVisible(this.scrollTop);
        };

        this.resize = function(w, h){
            if(!is_nav2 || is_nav3){
                div.style.height = main_height+'px';
                thatNav.setHeight();
            }            
            checkVisible(div.scrollTop);
            if(ifr){
                ifr.style.height = main_height+'px';
            }
        };

        var itemClick = function(){
            var cid = 0;

            if(is_nav3){
                lc.eventFire(nav_btn, 'click');
            }

            if(this.className.indexOf('selected') != -1){
                this.className = this.className.replace(' selected', '');
            }
            else{
                if(thatNav.current_content_idx > 0){
                    items[thatNav.current_content_idx-1].div.className = items[thatNav.current_content_idx-1].div.className.replace(' selected', '');
                }
                cid = this.getAttribute('data-content');
                this.className += ' selected';
            }

            loadContent(cid);
        }

        var loadContent = function(cid){

            if(!cid){
                content_divs[thatNav.current_content_idx].className = content_divs[thatNav.current_content_idx].className.replace(' selected', '');
                content_divs[thatNav.current_content_idx].innerHTML = '';
                content_divs[0].className += ' selected';
                thatNav.current_content_idx = 0;
                if(is_nav2) nav_btn.style.display = 'none';
                return;
            }

            if(is_nav2) nav_btn.style.display = 'block';

            ifr = document.createElement('iframe');
            for(var i=0; i<content_divs.length; i++){
                if(content_divs[i].getAttribute('data-content') != cid) continue;
                content_divs[i].appendChild(ifr);
                ifr.onload = ifrOnLoad;
                ifr.setAttribute('data-idx', i);
                ifr.setAttribute('src', 'content/'+cid+'.html');
                break;
            }
        }

        var ifrOnLoad = function(){
            content_divs[thatNav.current_content_idx].className = content_divs[thatNav.current_content_idx].className.replace(' selected', '');
            if(thatNav.current_content_idx > 0) content_divs[thatNav.current_content_idx].innerHTML = '';
            thatNav.resize(lc._screen.width, lc._screen.height);
            var idx = parseInt(this.getAttribute('data-idx'));
            content_divs[idx].className += ' selected';
            thatNav.current_content_idx = idx;
        };

        this.getDiv = function(){
            return div;
        }

        this.getNavC = function(){
            return nav_c_div;
        }

        var div = null;
        var nav_c_div = null;
        var items = null;
        var height = null;
        var oldSt = 0;
        this.current_content_idx = 0;
        var ifr = null;
        var nav_btn = null;

        init();
    }

    var init = function(){
        header_div = document.getElementById('header');
        dtable_div = document.getElementById('dtable');
        content_divs = lc.gebcn({p:dtable_div, tag:'div', cn:'content'});
        nav2_div = document.getElementById('nav2');
        nav3_div = document.getElementById('nav3');
        content_default_div = document.getElementById('content_default');

        nav = new Nav;

        resize(lc._screen.width, lc._screen.height);
        lc._screen.responsive.push(resize);
    };

    var resize = function(w, h){
        main_height = h - header_div.offsetHeight;
        dtable_div.style.height = main_height+'px';
        
        nav.resize(w, h);

        if(w <= 980 && !is_nav2){
            is_nav2 = true;
            document.body.className += ' nav2';
            nav2_div.appendChild(nav.getDiv());
            if(nav.current_content_idx > 0){
                nav_btn.style.display = 'block';
            }
            nav.setHeight();
        }
        else if(w > 980 && is_nav2){
            is_nav2 = is_nav3 = false;
            nav.getNavC().appendChild(nav.getDiv());
            document.body.className = document.body.className.replace(' nav2').replace(' nav3');
            nav_btn.style.display = 'none';
            nav.setHeight();
            content_default_div.style.height = 'auto';
            nav.resize(w, h);
        }

        if(is_nav2){
            content_default_div.style.height = main_height+'px';
        }
    };

    var header_div = null;
    var dtable_div = null;
    var content_divs = null;
    var main_height = null;
    var nav = null;
    var nav2_div = null;
    var nav3_div = null;
    var is_nav2 = false;
    var is_nav3 = false;
    var content_default_div = null;

    init();

})();