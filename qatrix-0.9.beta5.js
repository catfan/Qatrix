/*
    Qatrix JavaScript v0.9

    Copyright (c) 2012, The Qatrix project, Angel Lai
    The Qatrix project is under MIT license.
    For details, see the Qatrix web site: http://qatrix.com
*/

var Qatrix = {
		version: '0.9',

		rtrim: /(^\s*)|(\s*$)/g,
		rcamelCase: /-([a-z])/ig,
		rdigit: /\d/,
		rspace: /\s+/,
		rnum: /[0-9\.]/ig,
		rvalidchars: /^[\],:{}\s]*$/,
		rvalidescape: /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
		rvalidtokens: /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
		rvalidbraces: /(?:^|:|,)(?:\s*\[)+/g,

		nodeManip: function (elem, node)
		{
			var type = typeof node;
			if (type === 'string')
			{
				var doc = (elem && elem.ownerDocument) ? elem.ownerDocument : document,
					fragment = doc.createDocumentFragment(),
					div = document.createElement("div"),
					ret = [];

				div.innerHTML = node;
				while (div.childNodes[0] != null)
				{
					fragment.appendChild(div.childNodes[0]);
				}
				node = fragment;

				//Release  memory
				div = null;
			}

			if (type === 'number')
			{
				node += '';
			}

			return node;
		}
	},
	//Compatible for other $ based libraries
	$ = ($ === undefined) ?
	function (id)
	{
		//Qatrix just returns getElementById directly without additional process for highest performance.
		//For more complex manipulation, use $id.
		return document.getElementById(id);
	} : $,
	$each = function (haystack, callback)
	{
		var i = 0,
			length = haystack.length,
			name;
		if (length)
		{
			for (; i < length; ++i)
			{
				callback.call(haystack[i], i, haystack[i]);
			}
		}
		else
		{
			for (name in haystack)
			{
				callback.call(haystack[name], name, haystack[name]);
			}
		}
	},
	$id = function (id, callback)
	{
		var match = [],
			elem;
		if (typeof id === 'string')
		{
			elem = $(id);
			if (elem != null && callback)
			{
				callback(elem);
			}
			return elem;
		}
		$each(id, function (i, item)
		{
			elem = $(item);
			if (elem != null)
			{
				match.push(elem);
			}
		});
		if (callback && match.length > 0)
		{
			$each(match, function (i, item)
			{
				callback(item);
			});
		}
		return match;
	},
	$tag = function (elem, name, callback)
	{
		var match = elem.getElementsByTagName(name);
		if (callback && match.length > 0)
		{
			$each(match, function (i, item)
			{
				callback(item);
			});
		}
		return match;
	},
	$class = document.getElementsByClassName ?
	function (elem, className, callback)
	{
		var match = elem.getElementsByClassName(className);
		if (callback && match.length > 0)
		{
			$each(match, function (i, item)
			{
				callback(item);
			});
		}
		return match;
	} :
	function (elem, className, callback)
	{
		var match = [],
			rclass = new RegExp('\\b' + className + '\\b'),
			childs = elem.getElementsByTagName('*');
		$each(childs, function (i, item)
		{
			if (rclass.test(item.className))
			{
				match.push(item);
			}
		});
		if (callback && match.length > 0)
		{
			$each(match, function (i, item)
			{
				callback(item);
			});
		}
		return match;
	},
	$select = document.querySelectorAll ?
	function (selector, callback)
	{
		var match = document.querySelectorAll(selector);
		if (callback && match.length > 0)
		{
			$each(match, function (i, item)
			{
				callback(item);
			});
		}
		return match;
	} :
	//Hack native CSS selector quering matched element for IE6/7.
	function (selector, callback)
	{
		var style = Qatrix.Qselector.styleSheet,
			match = [];
		style.addRule(selector, 'q:a');
		$tag(document, '*', function (item)
		{
			if (item.currentStyle.q === 'a')
			{
				match.push(item);
			}
		});
		style.cssText = '';
		if (callback && match.length > 0)
		{
			$each(match, function (i, item)
			{
				callback(item);
			});
		}
		return match;
	},
	$new = function (tag, properties)
	{
		var elem = document.createElement(tag);
		if (properties)
		{
			$each(properties, function (name, property)
			{
				switch (name)
				{
				case 'css':
				case 'style':
					$each(property[name], function (css, value)
					{
						$style.set(elem, css, value);
					});
					break;

				case 'innerHTML':
				case 'html':
					$html(elem, property);
					break;

				case 'text':
					$text(elem, property);
					break;
				default:
					elem[name] = properties[name];
					break;
				}
			});
		}
		return elem;
	},
	$string = {
		camelCase: function (string)
		{
			return string.replace('-ms-', 'ms-').replace(Qatrix.rcamelCase, function (match, letter)
			{
				return (letter + '').toUpperCase();
			});
		},
		replace: function (string, replacements)
		{
			for (var key in replacements)
			{
				string = string.replace(new RegExp(key, 'ig'), replacements[key]);
			}
			return string;
		},
		trim: (String.prototype.trim) ?
		function (string)
		{
			return string.trim();
		} :
		function (string)
		{
			return string.replace(Qatrix.rtrim, '');
		}
	},
	$attr = {
		get: function (elem, name)
		{
			return elem.getAttribute(name);
		},
		set: function (elem, name, value)
		{
			return elem.setAttribute(name, value);
		},
		remove: function (elem, name)
		{
			return elem.removeAttribute(name);
		}
	},
	$data = {
		get: function (elem, name)
		{
			var value = $attr.get(elem, 'data-' + name);
			return value === "true" ? true :
						value === "false" ? false :
						value === "null" ? '' :
						value === null ? '' :
						value === '' ? '' :
						Qatrix.rdigit.test(value) ? parseInt(value) :
						$json.isJSON(value) ? $json.decode(value) :
						value;
		},
		set: function (elem, name, value)
		{
			if (typeof name === 'object')
			{
				$each(name, function (key, value)
				{
					$attr.set(elem, 'data-' + key, value);
				});
			}
			else
			{
				$attr.set(elem, 'data-' + name, value);
			}
			return elem;
		},
		remove: function (elem, name)
		{
			return $attr.remove(elem, 'data-' + name);
		}
	},
	$cache = {
		data: {},
		get: function (key)
		{
			var data = $cache.data[key];
			return (data || typeof data === 'number') ? data : null;
		},
		set: function (key, value)
		{
			$cache.data[key] = value;
			return value;
		},
		inc: function (key)
		{
			var data = $cache.data[key];
			return (typeof data === 'number') ? $cache.data[key]++ : data;
		},
		dec: function (key)
		{
			var data = $cache.data[key];
			return (typeof data === 'number') ? $cache.data[key]-- : data;
		},
		remove: function (key)
		{
			delete $cache.data[key];
			return true;
		},
		flush: function ()
		{
			$cache.data = {};
			return true;
		}
	},
	$event = {
		add: function (elem, type, handler)
		{
			if (elem.nodeType === 3 || elem.nodeType === 8 || !type || !handler)
			{
				return false;
			}

			if (type === 'mouseenter' || type === 'mouseleave')
			{
				type = type === 'mouseenter' ? 'mouseover' : 'mouseout';
				handler = $event.handler.mouseenter(handler);
			}

			if (elem.addEventListener)
			{
				elem.addEventListener(type, handler, false);
			}
			else
			{
				//Prevent attaching duplicate event with same event type and same handler for IE8-6
				var handlerName = handler.toString();
				if ($data.get(elem, 'event-' + type + '-' + handlerName))
				{
					return false;
				}
				$data.set(elem, 'event-' + type + '-' + handlerName, true);

				elem.attachEvent('on' + type, handler);
			}
			return elem;
		},
		remove: document.removeEventListener ?
		function (elem, type, handler)
		{
			elem.removeEventListener(type, handler, false);
			return elem;
		} :
		function (elem, type, handler)
		{
			elem.detachEvent('on' + type, handler);
			return elem;
		},
		handler: {
			mouseenter: function (handler)
			{
				return function (event)
				{
					function is_child(elem_parent, elem_child)
					{
						if (elem_parent === elem_child)
						{
							return false;
						}
						while (elem_child && elem_child !== elem_parent)
						{
							elem_child = elem_child.parentNode;
						}
						return elem_child === elem_parent;
					}
					var target = event.relatedTarget;
					if (this === target || is_child(this, target))
					{
						return;
					}
					handler.call(this, event);
				}
			}
		},
		key: function (event)
		{
			if (event.which == null && (event.charCode != null || event.keyCode != null))
			{
				event.which = event.charCode != null ? event.charCode : event.keyCode;
			}
			return event.which;
		},
		metaKey: function (event)
		{
			return (!event.metaKey && event.ctrlKey) ? event.ctrlKey : event.metaKey;
		},
		target: function (event)
		{
			if (!event.target)
			{
				event.target = event.srcElement || document;
			}
			return event.target;
		},
		mouseOver: function (event, originElement)
		{
			if (!event.relatedTarget && event.fromElement)
			{
				event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
			}
			var parent = event.relatedTarget;
			while (parent && parent !== originElement)
			{
				parent = parent.parentNode;
			}
			if (parent !== originElement)
			{
				return true;
			}
			return false;
		}
	},
	$clear = function (timer)
	{
		if (timer)
		{
			clearTimeout(timer);
			clearInterval(timer);
		}
		return null;
	},
	$ready = function (callback)
	{
		if (document.readyState === 'complete')
		{
			return setTimeout(callback, 1);
		}
		
		if( document.addEventListener )
		{
			document.addEventListener( "DOMContentLoaded", callback, false );
			return;
		}
		
		//Hack IE DOM for ready event.
		function domready()
		{
			try
			{
				document.documentElement.doScroll('left');
				callback();
			}
			catch (e)
			{
				setTimeout(domready, 1);
				return;
			}
		}
		domready();
	},
	$css = {
		get: function (elem, name)
		{
			return $style.get(elem, name);
		},
		set: function (elem, name, value)
		{
			if (typeof name === 'object')
			{
				$each(name, function (propertyName, value)
				{
					$style.set(elem, $string.camelCase(propertyName), $css.fix(propertyName, value));
				});
			}
			else
			{
				$style.set(elem, $string.camelCase(name), $css.fix(name, value));
			}
			return elem;
		},
		number: {
			'fontWeight': true,
			'lineHeight': true,
			'opacity': true
		},
		unit: function (name, value)
		{
			if ($css.number[name])
			{
				return '';
			}
			var unit = value.toString().replace(Qatrix.rnum, '');
			return (unit === '') ? 'px' : unit;
		},
		fix: function (name, value)
		{
			var type = typeof value;
			if (type === 'number' && !$css.number[name])
			{
				value += 'px';
			}
			if (value == null && isNaN(value))
			{
				return false;
			}
			return value;
		}
	},
	$style = {
		get: window.getComputedStyle ?
		function (elem, property)
		{
			if (elem !== null)
			{
				return document.defaultView.getComputedStyle(elem, null).getPropertyValue(property);
			}
		} :
		function (elem, property)
		{
			if (elem !== null)
			{
				if (property === 'width' && elem.currentStyle['width'] === 'auto')
				{
					return elem.offsetWidth;
				}
				if (property === 'height' && elem.currentStyle['height'] === 'auto')
				{
					return elem.offsetHeight;
				}
				return elem.currentStyle[$string.camelCase(property)];
			}
		},
		set: document.documentElement.style.opacity !== undefined ?
		function (elem, name, value)
		{
			elem.style[name] = value;
		} :
		function (elem, name, value)
		{
			if (!elem.currentStyle || !elem.currentStyle.hasLayout)
			{
				elem.style.zoom = 1;
			}
			if (name === 'opacity')
			{
				elem.style.filter = 'alpha(opacity=' + value * 100 + ')';
			}
			else
			{
				elem.style[name] = value;
			}
		}
	},
	$pos = function (elem, x, y)
	{
		$style.set(elem, 'left', x + 'px');
		$style.set(elem, 'top', y + 'px');
		return elem;
	},
	$offset = function (elem)
	{
		var left = elem.offsetLeft,
			top = elem.offsetTop,
			offsetParent = elem.offsetParent;
		while (offsetParent !== null)
		{
			left += offsetParent.offsetLeft + offsetParent.clientLeft;
			top += offsetParent.offsetTop + offsetParent.clientTop;
			if (offsetParent != document.body && offsetParent != document.documentElement)
			{
				left -= offsetParent.scrollLeft;
				top -= offsetParent.scrollTop;
			}
			offsetParent = offsetParent.offsetParent;
		}
		return {
			top: top,
			left: left
		};
	},
	$append = function (elem, node)
	{
		return elem.appendChild(Qatrix.nodeManip(elem, node));
	},
	$prepend = function (elem, node)
	{
		return (elem.firstChild) ? elem.insertBefore(Qatrix.nodeManip(elem, node), elem.firstChild) : elem.appendChild(Qatrix.nodeManip(elem, node));
	},
	$before = function (elem, node)
	{
		return elem.parentNode.insertBefore(Qatrix.nodeManip(elem, node), elem);
	},
	$after = function (elem, node)
	{
		return (elem.nextSibling) ? elem.parentNode.insertBefore(Qatrix.nodeManip(elem, node), elem.nextSibling) : elem.parentNode.appendChild(Qatrix.nodeManip(elem, node));
	},
	$remove = function (elem)
	{
		if (elem != null && elem.parentNode)
		{
			elem.parentNode.removeChild(elem);
		}
		return elem;
	},
	$empty = function (elem)
	{
		//Directly setting the innerHTML attribute to blank will release memory for browser.
		//Only remove the childNodes will not able to do this for some browsers.
		elem.innerHTML = '';
		return elem;
	},
	$html = function (elem, html)
	{
		try
		{
			elem.innerHTML = html;
		}
		catch (e)
		{
			$append($empty(elem), html);
		}
		return elem;
	},
	$text = function (elem, text)
	{
		$empty(elem);
		elem.appendChild(document.createTextNode(text));
		return elem;
	},
	$className = {
		add: function (elem, name)
		{
			if (elem.className === '')
			{
				elem.className = name;
			}
			else
			{
				//Qatrix do not check duplicate class name because it will be removed on $className.remove.
				//So just simply put it to the end.
				elem.className += ' ' + name;
			}
			return elem;
		},
		set: function (elem, name)
		{
			elem.className = name;
			return elem;
		},
		has: function (elem, name)
		{
			return new RegExp('\\b(' + name.split(Qatrix.rspace).join('|') + ')\\b').test(elem.className);
		},
		remove: function (elem, name)
		{
			elem.className = (name) ? $string.trim(elem.className.replace(new RegExp('\\b(' + name.split(Qatrix.rspace).join('|') + ')\\b', 'g'), '').split(Qatrix.rspace).join(' ')) : '';
			return elem;
		}
	},
	$hide = function (elem)
	{
		$each(arguments, function (i, argument)
		{
			(typeof argument === 'string') ? $(argument).style.display = 'none' : (typeof argument === 'object' && argument.length) ? $each(argument, function (i, elem)
			{
				elem.style.display = 'none';
			}) : argument.style.display = 'none';
		});
	},
	$show = function (elem)
	{
		$each(arguments, function (i, argument)
		{
			(typeof argument === 'string') ? $(argument).style.display = 'block' : (typeof argument === 'object' && argument.length) ? $each(argument, function (i, elem)
			{
				elem.style.display = 'block';
			}) : argument.style.display = 'block';
		});
	},
	$animate = (function ()
	{
		//Use CSS3 native transition for animation as possible.
		var elem_style = document.documentElement.style;
		return (
			elem_style.webkitTransition !== undefined ||
			elem_style.MozTransition !== undefined ||
			elem_style.OTransition !== undefined ||
			elem_style.MsTransition !== undefined ||
			elem_style.transition !== undefined
		);
	}()) ? (function ()
	{
		var elem_style = document.documentElement.style,
			prefix_name =
				(elem_style.webkitTransition !== undefined) ? '-webkit-' :
				(elem_style.MozTransition !== undefined) ? '-moz-' :
				(elem_style.OTransition !== undefined) ? '-o-' :
				(elem_style.MsTransition !== undefined) ? '-ms-' : '';
		transition_name = prefix_name + 'transition';
		return function (elem, properties, duration, callback)
		{
			var property_name = [],
				property_to_value = [],
				property_camelCase = [],
				unit = [],
				css, translate3d, AUID, rule;
			duration = (duration) ? duration : '500';
			for (css in properties)
			{
				property_camelCase[css] = $string.camelCase(css);
				if (properties[css].from != null)
				{
					property_to_value[css] = (!$css.number[css]) ? parseInt(properties[css].to) : properties[css].to;
					unit[css] = $css.unit(css, properties[css].to);
					$style.set(elem, property_camelCase[css], parseInt(properties[css].from) + unit[css]);
				}
				else
				{
					property_to_value[css] = (!$css.number[css]) ? parseInt(properties[css]) : properties[css];
					unit[css] = $css.unit(css, properties[css]);
					$style.set(elem, property_camelCase[css], $style.get(elem, property_camelCase[css]));
				}
				property_name.push(css);
			}

			//Using CSS3 transform function will enable to use hardware acceleration to handle this animation.
			if (properties['left'] || properties['top'])
			{
				property_name.push(prefix_name + 'transform');
			}

			AUID = 'Qatrix_animation_' + Math.random().toString().replace('0.', '');
			rule = '.' + AUID + '{' + transition_name + ':all ' + duration + 'ms;}';

			Qatrix.Qanimate.sheet.insertRule('.' + AUID + '{' + transition_name + ':all ' + duration + 'ms;}', 0);
			setTimeout(function ()
			{
				$className.add(elem, AUID);
				if (properties['left'] || properties['top'])
				{
					var transform = $string.camelCase(prefix_name + 'transform'),
						offset = $offset(elem);
					translate3d = (properties['left'] && properties['top']) ? 'translate3d(' + (property_to_value['left'] - offset.left) + unit['left'] + ',' + (property_to_value['top'] - offset.top) + unit['top'] + ',0)' :
											(properties['left']) ? 'translate3d(' + (property_to_value['left'] - offset.left) + unit['left'] + ',0,0)' :
											'translate3d(0,' + (property_to_value['top'] - offset.top) + unit['top'] + ',0)';
					$style.set(elem, transform, translate3d);
					$style.set(elem, transform, '');
				}
				for (css in properties)
				{
					$style.set(elem, property_camelCase[css], property_to_value[css] + unit[css]);
				}
			}, 50);

			//Animation completed
			setTimeout(function ()
			{
				$className.remove(elem, AUID);
				Qatrix.Qanimate.sheet.textContent = Qatrix.Qanimate.textContent.replace(rule, '');
				if (callback)
				{
					callback();
				}
			}, duration);
			
			return elem;
		}
	})() :
	function (elem, properties, duration, callback)
	{
		var $timer = [],
			$step = 0,
			p = 30,
			ori = [],
			diff = [],
			unit = [],
			i = 0,
			css, property_name = [],
			property_to_value = [],
			property_camelCase = [],
			from_value, style_value;
		duration = (duration) ? duration : '500';
		for (css in properties)
		{
			property_camelCase[css] = $string.camelCase(css);
			if (properties[css].from != null)
			{
				property_to_value[css] = (!$css.number[css]) ? parseInt(properties[css].to) : properties[css].to;
				unit[css] = $css.unit(css, properties[css].to);
				from_value = (!$css.number[css]) ? parseInt(properties[css].from) : properties[css].from;
				$style.set(elem, property_camelCase[css], from_value + unit[css]);
				diff[css] = (property_to_value[css] - from_value) / p;
				ori[css] = from_value;
			}
			else
			{
				style_value = parseInt($style.get(elem, property_camelCase[css]));
				property_to_value[css] = (!$css.number[css]) ? parseInt(properties[css]) : properties[css];
				unit[css] = $css.unit(css, properties[css]);
				$style.set(elem, property_camelCase[css], $style.get(elem, property_camelCase[css]));
				diff[css] = (property_to_value[css] - style_value) / p;
				ori[css] = style_value;
			}
		}
		for (; i < p; ++i)
		{
			$timer[i] = setTimeout(function ()
			{
				for (css in properties)
				{
					$style.set(elem, property_camelCase[css], (ori[css] + (diff[css] * $step)) + unit[css]);
				}
				$step++;
			}, (duration / p) * i);
		}
		$timer[p] = setTimeout(function ()
		{
			for (css in properties)
			{
				$style.set(elem, property_camelCase[css], property_to_value[css] + unit[css]);
			}
			if (callback)
			{
				callback();
			}
		}, duration);

		return elem;
	},
	$fadeout = function (elem, duration, callback)
	{
		duration = (duration) ? duration : '500';
		return $animate(elem, {
			'opacity': {
				from: 1,
				to: 0
			}
		}, duration, callback);
	},
	$fadein = function (elem, duration, callback)
	{
		duration = (duration) ? duration : '500';
		return $animate(elem, {
			'opacity': {
				from: 0,
				to: 1
			}
		}, duration, callback);
	},
	$cookie = {
		get: function (key)
		{
			var tempArr = document.cookie.split('; '),
				i = 0,
				l = tempArr.length,
				temp;
			for (; i < l; i++)
			{
				temp = tempArr[i].split('=');
				if (temp[0] == key)
				{
					return decodeURIComponent(temp[1]);
				}
			}
		},
		set: function (key, value, expires)
		{
			var today = new Date(),
				expires_date;
			today.setTime(today.getTime());
			if (expires)
			{
				expires = expires * 86400000;
			}
			expires_date = new Date(today.getTime() + (expires));
			document.cookie = key + '=' + encodeURIComponent(value) + ((expires) ? ';expires=' + expires_date.toGMTString() : '') + '; path=/';
		},
		remove: function ()
		{
			$each(arguments, function (i, key)
			{
				$cookie.set(key, '', -1);
			});
		}
	},
	$json = {
		decode: window.JSON && window.JSON.parse ?
		function (data)
		{
			return JSON.parse(data);
		} :
		function (data)
		{
			if ($json.isJSON(data))
			{
				return eval('(' + data + ')');
			}
			else
			{
				return false;
			}
		},
		isJSON: function (string)
		{
			if (typeof string === 'string' && string !== '')
			{
				return Qatrix.rvalidchars.test(string.replace(Qatrix.rvalidescape, '@').replace(Qatrix.rvalidtokens, ']').replace(Qatrix.rvalidbraces, ''));
			}
			else
			{
				return false;
			}
		}
	},
	$ajax = function (url, options)
	{
		if (typeof url === 'object')
		{
			options = url;
			url = undefined;
		}
		options = options || {};
		var request = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP'),
			param = [],
			type = (options.type !== undefined) ? options.type : 'POST',
			response, url;
		if (request)
		{
			url = (url) ? url : options.url;
			request.open(type, url, true);
			request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');

			if (options.header !== undefined)
			{
				$each(options.header, function (key, value)
				{
					request.setRequestHeader(key, value);
				});
			}

			if (options.data !== undefined)
			{
				$each(options.data, function (key, value)
				{
					param.push($url(key) + '=' + $url(value));
				});
			}

			request.send(param.join('&').replace(/%20/g, '+'));
			request.onreadystatechange = function ()
			{
				if (request.readyState == 4 && request.status == 200)
				{
					if (options.success !== undefined)
					{
						response = request.responseText;
						if (response != '' && $json.isJSON(response))
						{
							options.success($json.decode(response));
						}
						else
						{
							options.success(response);
						}
					}
				}
			};
		}
	},
	$loadscript = function (src)
	{
		return $before(document.head || document.getElementsByTagName('head')[0] || document.documentElement, $new('script', {
			'type': 'text/javascript',
			'async': true,
			'src': src
		}));
	},
	$url = function (data)
	{
		return encodeURIComponent(data);
	},
	$rand = function (min, max)
	{
		return Math.floor(Math.random() * (max - min + 1) + min);
	};

var $browser = {};
(function ()
{
	var ua = navigator.userAgent.toLowerCase(),
		rbrowser = {
			msie: /msie/,
			msie6: /msie 6\.0/,
			msie7: /msie 7\.0/,
			msie8: /msie 8\.0/,
			msie9: /msie 9\.0/,
			msie10: /msie 10\.0/,
			firefox: /firefox/,
			opera: /opera/,
			webkit: /webkit/,
			iPad: /ipad/,
			iPhone: /iphone/,
			android: /android/
		},
		i;
	$each(rbrowser, function (key, value)
	{
		$browser[key] = rbrowser[key].test(ua);
	});
	//For hack CSS selector
	if (document.querySelectorAll === undefined)
	{
		$ready(function ()
		{
			Qatrix.Qselector = $append(document.body, $new('style'));
		});
	}
	//For animation
	Qatrix.Qanimate = $append(document.head || document.getElementsByTagName('head')[0] || document.documentElement, $new('style'));
})();