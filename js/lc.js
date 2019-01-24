/*
------------------
LC V1
Louis Chabot
------------------
*/

var lc = new (function(){

	var that = this;

	// Prototypes 

	if(typeof Array.prototype.move !== "function"){
		Array.prototype.move = function (old_index, new_index){
		    if(new_index >= this.length){
		        var k = new_index - this.length;
		        while((k--) + 1){
		            this.push(undefined);
		        }
		    }
		    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
		};
	}
	if(typeof Array.prototype.map !== "function"){
		Array.prototype.map = function(callback, thisArg){
			for (var i=0, n=this.length, a=[]; i<n; i++){
				if(i in this) a[i] = callback.call(thisArg, this[i]);
			}
			return a;
		};
	}
	if(typeof String.prototype.trimLeft !== "function"){
	    String.prototype.trimLeft = function(){
			return this.replace(/^\s+/, "");
		};
	}
	if(typeof String.prototype.trimRight !== "function"){
		String.prototype.trimRight = function(){
			return this.replace(/\s+$/, "");
		};
	}
	if(typeof String.prototype.trim !== "function"){
   		String.prototype.trim = function(){
   			return this.replace(/^\s+|\s+$/g, '');
   		};
	}

	String.prototype.hashCode = function() {
		var hash = 0, i, chr;
		if (this.length === 0) return hash;
		for (i = 0; i < this.length; i++) {
			chr   = this.charCodeAt(i);
			hash  = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	};

	// Events 

	that.addEvent = function(html_element, event_name, event_function){      
	    if(html_element.attachEvent)
	    	html_element.attachEvent("on" + event_name, function(){event_function.call(html_element);}); 
		else if(html_element.addEventListener)
			html_element.addEventListener(event_name, event_function, false);        
	};

	that.removeEvent = function(html_element, event_name, event_function){      
		if(html_element.removeEventListener) 
			html_element.removeEventListener(event_name,event_function,false);
		if(html_element.detachEvent)
			html_element.detachEvent('on'+event_name,event_function); 
	};

	that.eventFire = function(el, etype){
		if(el.fireEvent){
			(el.fireEvent('on' + etype));
		}
		else{
			var evObj = document.createEvent('Events');
			evObj.initEvent(etype, true, false);
			el.dispatchEvent(evObj);
		}
	};

	that.cancelBubble = function(e){
		if(e.stopPropagation) e.stopPropagation();
		if(e.cancelBubble!=null) e.cancelBubble = true;
	};

	// Ajax
	that.isAjax = false;

	that.loadFile = function(p){
		if(!p.path || !p.method) return false;
		var at = false;
		if(p.timeout){
			if(at!==false) clearTimeout(at);
			at = false;
			at = setTimeout(function(){
				abort();
				if(p.error)	p.error();
			}, p.timeout*1000);
		}
		var abort = function(){
			if(at!==false){
				clearTimeout(at);
				at = false;
			}

			if(p.loadf){
				p.loadf.stop();
				p.loadf.isLoadf = false;
			}
			xhr.onreadystatechange = null;
			xhr.abort();
		};
		this.abort = abort;
		var xhr = getXMLHttpRequest();
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300){
				that.isAjax = false;
				if(at!==false){
					clearTimeout(at);
					at = false;
				}
				if(p.loadf){
					p.loadf.stop();
					p.loadf.isLoadf = false;
				}
				if(p.callback){
					if(p.callback.container){
						var container = document.getElementById(p.callback.container) || p.callback.container;
						if(p.callback.add) container.innerHTML += xhr.responseText;
						else container.innerHTML = xhr.responseText;
					}
					if(p.callback.response){
						if(p.xml) p.callback.response(xhr.responseXML);
						else p.callback.response(xhr.responseText);
					}
					if(p.callback.f) p.callback.f();
				}
				xhr = null;
			}
			else if(xhr.readyState == 4){
				abort();
				if(p.error) p.error();
			}
			else{
				that.isAjax = true;
				if(p.loadf && !p.loadf.isLoadf){
					p.loadf.isLoadf = true;
					p.loadf.start();
				}
			}
		};
		if(p.method == "post" || p.method == "patch"){
			xhr.open(p.method.toUpperCase(), p.path, true);
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			if(p.v){
				var v, key;
				var count = 0;
				v = '';
				for(key in p.v){
					count++;
					if(count>1) v += "&";
					v += key+"="+encodeURIComponent(p.v[key]);
				}
				xhr.send(v);
			}
			else console.log('error missing param');
		}
		else if(p.method == "get"){
			var v, key;
			if(p.v){
				v = '?';
				var count = 0;
				for(key in p.v){
					count++;
					if(count>1) v += "&";
					v += key+"="+p.v[key];
				}
			}
			else v = '';
			xhr.open("GET", p.path+v, true);
			if(p.xml) xhr.setRequestHeader("Content-Type", "text/xml");
			xhr.send(null);
		}
	};

	var getXMLHttpRequest = function(){
		var xhr = null;	
		if(window.XMLHttpRequest || window.ActiveXObject){
			if(window.ActiveXObject){
				try{
					xhr = new ActiveXObject("Msxml2.XMLHTTP");
				}
				catch(e){
					xhr = new ActiveXObject("Microsoft.XMLHTTP");
				}
			}
			else xhr = new XMLHttpRequest();
		}
		else return null;
		return xhr;
	};

	// Environnement

	that._screen = {
		width: 0,
		height: 0,
		responsive: [],
		resize: function(){
			that._screen.width = parseInt(document.body.offsetWidth);
			that._screen.height = (typeof( window.innerWidth ) == 'number') ? window.innerHeight 
				: (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) ? document.documentElement.clientHeight
				: (document.body && (document.body.clientWidth || document.body.clientHeight)) ? document.body.clientHeight 
				: 0;
			for(var i=0; i<that._screen.responsive.length; i++) that._screen.responsive[i](that._screen.width, that._screen.height);
		}
	};

	that.getScrollTop = function(){
		if(typeof pageYOffset != 'undefined') return pageYOffset;
		else{
			var a = document.body;
			var b = document.documentElement;
			b = (b.clientHeight) ? b : a;
			return b.scrollTop;
		}
	};
	
	that.getCursorPos = function(e){
		var c = {x:0, y:0};
		if(e.pageX || e.pageY){
			c.x = e.pageX;
			c.y = e.pageY;
		}
		else{
			c.x = e.clientX + (document.documentElement.scrollLeft 
				|| document.body.scrollLeft) - document.documentElement.clientLeft;
			c.y = e.clientY + (document.documentElement.scrollTop
				|| document.body.scrollTop) - document.documentElement.clientTop;
		}
		return c;
	};

	that.setCookie = function(c_name,value,exdays){
		var exdate=new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
		document.cookie=c_name + "=" + c_value;
	};
		
	that.getCookie = function(name){
		return getCookies()[name];
	};

	var getCookies = function(){
		var c = document.cookie, v = 0, cookies = {};
		if(document.cookie.match(/^\s*\$Version=(?:"1"|1);\s*(.*)/)){
		        c = RegExp.$1;
			v = 1;
		}
		if(v === 0){
			c.split(/[,;]/).map(function(cookie){
			        var parts = cookie.split(/=/, 2),
			        name = decodeURIComponent(parts[0].trimLeft()),
			        value = parts.length > 1 ? decodeURIComponent(parts[1].trimRight()) : null;
			        cookies[name] = value;
			});
		}
	        else{
		        c.match(/(?:^|\s+)([!#$%&'*+\-.0-9A-Z^`a-z|~]+)=([!#$%&'*+\-.0-9A-Z^`a-z|~]*|"(?:[\x20-\x7E\x80\xFF]|\\[\x00-\x7F])*")(?=\s*[,;]|$)/g).map(function($0, $1){
			        var name = $0,
				value = $1.charAt(0) === '"'
					? $1.substr(1, -1).replace(/\\(.)/g, "$1")
					: $1;
				cookies[name] = value;
			});
		}
		return cookies;
	};
	
	that.is_touch_device = 'ontouchstart' in document.documentElement;

	// Selecteurs

	that.gebcn = function(p){
	    var v = {
			p: p.p ? (document.getElementById(p.p) || p.p || document) : document,
			tag: p.tag || '*',
			cn: p.cn || p
		};
		var scope = v.p.getElementsByTagName(v.tag);
		var elmts = [];
		for(var i=0; i<scope.length; i++){
			if(scope[i].className.indexOf(v.cn) != -1){
				elmts.push(scope[i]);
			}
		}
		return elmts.length ? elmts : false;
	};

	that.isInArray = function(i, a){
		for(var j=0; j<a.length; j++){
			if(a[j] == i) return true;
		}
		return false;
    };

	// Animation v1.3

	that.a = new (function(){
		var _that = this;

		_that.animate = function(e, p){
			var el = (typeof e != 'string') ? (e || false) : (document.getElementById(e) || false);
			if(!el) return;
			for(var i=0; i<p.length; i++) if(!allowedCss[p[i].css] || (!p[i].to && p[i].to!==0)) return;
	
			if(typeof e != 'string' && e != window){
				if(el.getAttribute('lca')){
					var eid = el.getAttribute('lca');
				}
				else{
					nbEl++;
					var eid = 'lca'+nbEl;
					el.setAttribute('lca', eid);
				}
			}
			else var eid = e;
				
			ids[eid] = ids[eid] || {};
			ids[eid].anims = ids[eid].anims || 0;
	
			var start = new Date;
			for(var i=0; i<p.length; i++){
				var from = 	p[i].from || (typeof p[i].from == 'undefined' ? _that.getCurrent(el, p[i].css) : 0);
					from = !isNaN(from) ? from : 0;

				var opts = {
					start:    start,
					isNoNeg:  notUnder0[p[i].css] || false,
					isCss3:   prefixCss[p[i].css] || false,
					css:      p[i].css,
					from:     from,
					to:       p[i].to,
					duration: p[i].duration || 1000,
					fx:       p[i].fx ? (fx[p[i].fx] || fx.linear) : fx.linear,
					cssUnit:  p[i].cssUnit || 'px',
					callback: p[i].callback || false,
					bounce:   p[i].bounce || false,
					loop:     p[i].loop || false,
					step:     function(f){
						var vStep = Math.round(this.from-(((this.from)-(this.to))*f));
						if(this.isNoNeg && vStep<0) vStep = 0;
						if(this.isCss3) applyPrefix(el,vStep,this.css,this.cssUnit);
						else if(this.css=='scroll'){
							if(el==window) window.scrollTo(0, vStep);
							else el.scrollTop = vStep;
						}
						else el.style[this.css] = vStep+this.cssUnit;
					}
				};
				ids[eid][p[i].css] = opts;
				ids[eid].anims++;
			}
			return;
		};

		_that.getAnimElement = function(attr){
			var elmts = document.getElementsByTagName('*');
			for(var i=0; i<elmts.length; i++){
				var attr_lca = elmts[i].getAttribute('lca') || false;
				if(attr_lca && attr_lca == attr) return elmts[i];
			}
		};
	
		var frame = function(){
			var keyId, keyCss;
			for(keyId in ids){
				for(keyCss in ids[keyId]){
					if(keyCss=='anims') continue;
					var timePassed = new Date() - ids[keyId][keyCss].start;
					var progress = timePassed / ids[keyId][keyCss].duration;
					if(progress > 1) progress = 1;
					var delta = ids[keyId][keyCss].fx(progress);
					ids[keyId][keyCss].step(delta);
					if(progress == 1 && ids[keyId][keyCss].bounce){
						ids[keyId][keyCss].bounce = false;
						ids[keyId][keyCss].oldValues = {
							from:ids[keyId][keyCss].from,
							to:ids[keyId][keyCss].to
						};
						ids[keyId][keyCss].to = ids[keyId][keyCss].oldValues.from;
						ids[keyId][keyCss].from = ids[keyId][keyCss].oldValues.to;
						ids[keyId][keyCss].start = new Date();
					}
					else if(progress == 1){
						var callback = ids[keyId][keyCss].callback || '';
						if(ids[keyId][keyCss].loop==true){
							if(ids[keyId][keyCss].oldValues){
								ids[keyId][keyCss].from = ids[keyId][keyCss].oldValues.from;
								ids[keyId][keyCss].to = ids[keyId][keyCss].oldValues.to;
								ids[keyId][keyCss].bounce = true;
								delete ids[keyId][keyCss].oldValues;
							}
							ids[keyId][keyCss].start = new Date();
						}
						else{
							if(ids[keyId].anims==1){
								delete ids[keyId];
							}
							else{
								ids[keyId].anims--;
								delete ids[keyId][keyCss];
							}
						}
						if(callback) callback(keyId);
					}
				}	
			}
			enterFrame = setTimeout(frame, 20);
		};
		
		_that.abort = function(e, css){
			var eid = typeof e != 'string' ? (e.getAttribute('lca') || false) : document.getElementById(e) ? e : false;
			if(!eid) return false;
				if(css && ids[eid][css]){
				delete ids[eid][css];
				return true;
			}
			else if(!css && ids[eid]){
				delete ids[eid];
				return true;
			}
			else return false;
		};
	
		var applyPrefix = function(el,step,css,cssUnit){
			if(css=='opacity'){
				if(step>100) step=100;
				el.style.opacity      = (step/100);
				el.style.MozOpacity   = (step/100);
				el.style.KhtmlOpacity = (step/100);
				el.style.filter       = "alpha(opacity="+step+")";
				return;
			}
			else{
				var apply = css=='rotation' ? 'rotate('+(step)+'deg)' 
					: css=='scale' ? 'scale('+(step/100)+')' 
					: parseInt(step)+cssUnit;
				if(css == 'rotation' || css == 'scale') css = 'transform';
				for(var i=0; i<prefix.length; i++){ 
					if(i!=0) css = css.charAt(0).toUpperCase()+css.slice(1);
					el.style[prefix[i]+css] = apply;
				}
			}
		};
	
		var angleFromMatrix = function(m){
			m = m.replace("matrix(", "");
			m = m.replace(")", "");
			m = m.split(",");
			return Math.round((Math.acos(m[0])*180) / Math.PI);
		};
	
		_that.getCurrent = function(el, css){
			if(css=='rotation') css = 'transform';
			else if(css=='borderRadius') css = 'borderTopLeftRadius';	
			var a = ((el.currentStyle) ? el.currentStyle
				: (document.defaultView && document.defaultView.getComputedStyle) ? document.defaultView.getComputedStyle(el, null)
				: el.style);
			var b = css;
			var c = 0;
			if(prefixCss[b]){
				for(var i=0; i<prefix.length; i++){
					if(i==1) b = b.charAt(0).toUpperCase()+b.slice(1);			
					if(a[prefix[i]+b]){
						c = a[prefix[i]+b] || 0;
					}
				}
			}
			if(!c) c = a[b] || 0;	
			if(css=='opacity') c *= 100;
			else if(css=='transform' && c != 'none') c = angleFromMatrix(c);
			else c = parseInt(c);
			return c || 0;
		};
	
		var nbEl = 0;
		var ids = {};
	
		var fx = {
			linear:        function(p){return p;},
			quadEaseIn:    function(p){return Math.pow(p, 2);},
			circEaseIn:    function(p){return 1 - Math.sin(Math.acos(p));},
			bowEaseIn:     function(p){return Math.pow(p, 2) * ((1.5 + 1) * p - 1.5);},
			elasticEaseIn: function(p){return Math.pow(2, 10 * (p-1)) * Math.cos(20*Math.PI*1.5/3*p);},
			bounceEaseIn:  function(p){for(var a = 0, b = 1, result; 1; a += b, b /= 2)
											if(p >= (7 - 4 * a) / 11)
												return -Math.pow((11 - 6 * a - 11 * p) / 4, 2) + Math.pow(b, 2);
											return 0;},
			makeEaseOut:   function(delta){return function(p){return 1 - delta(1 - p);}},
			makeEaseInOut: function(delta){return function(p){if(p < .5) return delta(2*p) / 2;
															  else return (2 - delta(2*(1-p))) / 2;}}
		};
		fx.quadEaseOut      = fx.makeEaseOut(fx.quadEaseIn);
		fx.quadEaseInOut    = fx.makeEaseInOut(fx.quadEaseIn); 
		fx.circEaseOut      = fx.makeEaseOut(fx.circEaseIn); 
		fx.circEaseInOut    = fx.makeEaseInOut(fx.circEaseIn); 
		fx.bowEaseOut       = fx.makeEaseOut(fx.bowEaseIn); 
		fx.bowEaseInOut     = fx.makeEaseInOut(fx.bowEaseIn); 
		fx.elasticEaseOut   = fx.makeEaseOut(fx.elasticEaseIn);
		fx.elasticEaseInOut = fx.makeEaseInOut(fx.elasticEaseIn); 
		fx.bounceEaseOut    = fx.makeEaseOut(fx.bounceEaseIn);
		fx.bounceEaseInOut  = fx.makeEaseInOut(fx.bounceEaseIn);
	
		var prefix = [
			'', 'Webkit', 'Moz', 'o', 'ms'
		];
		var prefixCss = {
			borderRadius:!0,opacity:!0,rotation:!0,transform:!0,scale:!0
		};
		var notUnder0 = {
			width:!0,height:!0,opacity:!0,borderRadius:!0,fontSize:!0,scroll:!0,scale:!0
		};
		var allowedCss = {
			marginLeft:!0,marginRight:!0,marginTop:!0,marginBottom:!0,
			paddingLeft:!0,paddingRight:!0,paddingTop:!0,paddingBottom:!0,
			top:!0,bottom:!0,left:!0,right:!0,
			width:!0,height:!0,
			fontSize:!0,lineHeight:!0,
			borderRadius:!0,
			opacity:!0,
			rotation:!0,
			scroll:!0,
			scale:!0
		};
	
		var enterFrame = setTimeout(frame, 20);
	})();

	// Init
	
	that._screen.resize();
	that.addEvent(window, 'resize', that._screen.resize);
})();