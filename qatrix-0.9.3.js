/*
    Qatrix JavaScript v0.9.3

    Copyright (c) 2012, The Qatrix project, Angel Lai
    The Qatrix project is under MIT license.
    For details, see the Qatrix website: http:// qatrix.com
*/

(function () {

var Qatrix = {
	version: '0.9.3',

	rbline: /\n+/g,
	rbrace: /^(?:\{.*\}|\[.*\])$/,
	rcamelCase: /-([a-z])/ig,
	rdigit: /\d/,
	rline: /\r\n/g,
	rnum: /[0-9\.]/ig,
	rspace: /\s+/,
	rtrim: /(^\s*)|(\s*$)/g,
	rvalidchars: /^[\],:{}\s]*$/,
	rvalidescape: /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
	rvalidtokens: /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
	rvalidbraces: /(?:^|:|,)(?:\s*\[)+/g,

	nodeManip: function (elem, node)
	{
		var type = typeof node;
		if (type === 'string')
		{
			var doc = elem && elem.ownerDocument || document,
				fragment = doc.createDocumentFragment(),
				div = document.createElement('div'),
				ret = [];

			div.innerHTML = node;
			while (div.childNodes[0] != null)
			{
				fragment.appendChild(div.childNodes[0]);
			}
			node = fragment;

			// Release  memory
			div = null;
		}

		if (type === 'number')
		{
			node += '';
		}

		return node;
	},
	$: function (id)
	{
		// Qatrix just returns getElementById directly without additional process for highest performance
		// For more complex manipulation, use $id
		return document.getElementById(id);
	},
	$each: function (haystack, callback)
	{
		var i = 0,
			length = haystack.length,
			name;
		if (length)
		{
			for (; i < length; i++)
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
	$id: function (id, callback)
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
	$dom: function (dom, callback)
	{
		if (callback)
		{
			dom.length ? $each(dom, function (i, item)
			{
				callback(item);
			}) : callback(item);
		}
		return dom;
	},
	$tag: function (elem, name, callback)
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
	$class: document.getElementsByClassName ?
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
	}:
	function (elem, className, callback)
	{
		var match = [],
			rclass = new RegExp('\\b' + className + '\\b');
		$tag(elem, '*', function (item)
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
	$select: document.querySelectorAll ?
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
	// Hack native CSS selector quering matched element for IE6/7
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
	$new: function (tag, properties)
	{
		var elem = document.createElement(tag);
		if (properties)
		{
			try
			{
				$each(properties, function (name, property)
				{
					switch (name)
					{
					case 'css':
					case 'style':
						$css.set(elem, property);
						break;

					case 'innerHTML':
					case 'html':
						$html(elem, property);
						break;

					case 'className':
					case 'class':
						$className.set(elem, property);
						break;

					case 'text':
						$text(elem, property);
						break;

					default:
						$attr.set(elem, name, property);
						break;
					}
				});
				return elem;
			}
			catch (e)
			{}
			finally
			{
				// Prevent memory leak
				elem = null;
			}
		}
		return elem;
	},
	$string: {
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
		slashes: function (string)
		{
			return $string.replace(string, {
				"\\\\": '\\\\',
				"\b": '\\b',
				"\t": '\\t',
				"\n": '\\n',
				"\r": '\\r',
				'"': '\\"'
			});
		},
		trim: String.prototype.trim ?
		function (string)
		{
			return string.trim();
		}:
		function (string)
		{
			return string.replace(Qatrix.rtrim, '');
		}
	},
	$attr: {
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
	$data: {
		get: function (elem, name)
		{
			var value = $attr.get(elem, 'data-' + name);
			return value === "true" ? true :
						value === "false" ? false :
						value === "null" ? '' :
						value === null ? '' :
						value === '' ? '' :
						!isNaN(parseFloat(value)) && isFinite(value) ? +value :
						Qatrix.rbrace.test(value) ? $json.decode(value) :
						value;
		},
		set: function (elem, name, value)
		{
			typeof name === 'object' ? $each(name, function (key, value)
			{
				$attr.set(elem, 'data-' + key, value);
			}) : $attr.set(elem, 'data-' + name, value);
			return elem;
		},
		remove: function (elem, name)
		{
			return $attr.remove(elem, 'data-' + name);
		}
	},
	$cache: {
		data: {},
		get: function (key)
		{
			var data = $cache.data[key];
			return data || typeof data === 'number' ? data : null;
		},
		set: function (key, value)
		{
			$cache.data[key] = value;
			return value;
		},
		inc: function (key)
		{
			var data = $cache.data[key];
			return typeof data === 'number' ? $cache.data[key]++ : data;
		},
		dec: function (key)
		{
			var data = $cache.data[key];
			return typeof data === 'number' ? $cache.data[key]-- : data;
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
	$storage: {
		set: window.localStorage ?
		function (name, value)
		{
			localStorage[name] = typeof value === 'object' ? $json.encode(value) : value;
		}:
		function (name, value)
		{
			var value = typeof value === 'object' ? $json.encode(value) : value;
			$data.set(Qatrix.storage, name, value);
			Qatrix.storage.save('Qstorage');
		},
		get: window.localStorage ?
		function (name)
		{
			var data = localStorage[name];
			if ($json.isJSON(data))
			{
				return $json.decode(data);
			}
			return data || '';
		}:
		function (name)
		{
			Qatrix.storage.load('Qstorage');
			return $data.get(Qatrix.storage, name) || '';
		},
		remove: window.localStorage ?
		function (name)
		{
			localStorage.removeItem(name);
			return true;
		}:
		function (name)
		{
			Qatrix.storage.load('Qstorage');
			$data.remove(Qatrix.storage, name);
			return true;
		}
	},
	$event: {
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
				// Prevent attaching duplicate event with same event type and same handler for IE8-6
				if (elem.getAttribute)
				{
					var handlerName = handler.toString();
					if ($data.get(elem, 'event-' + type + '-' + handlerName))
					{
						return false;
					}
					$data.set(elem, 'event-' + type + '-' + handlerName, true);
				}
				elem.attachEvent('on' + type, handler);
			}
			return elem;
		},
		remove: document.removeEventListener ?
		function (elem, type, handler)
		{
			elem.removeEventListener(type, handler, false);
			return elem;
		}:
		function (elem, type, handler)
		{
			elem.detachEvent('on' + type, handler);
			if (elem.removeAttribute)
			{
				$attr.remove(elem, 'event-' + type + '-' + handler.toString());
			}
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
			return event.which || event.charCode || event.keyCode;
		},
		metaKey: function (event)
		{
			return !event.metaKey && event.ctrlKey ? event.ctrlKey : event.metaKey;
		},
		target: function (event)
		{
			return event.target ? event.target : event.srcElement || document;
		}
	},
	$clear: function (timer)
	{
		if (timer)
		{
			clearTimeout(timer);
			clearInterval(timer);
		}
		return null;
	},
	$ready: function (callback)
	{
		if (document.readyState === 'complete')
		{
			return setTimeout(callback, 1);
		}

		if (document.addEventListener)
		{
			document.addEventListener('DOMContentLoaded', callback, false);
			return;
		}

		// Hack IE DOM for ready event
		function domready()
		{
			try
			{
				document.documentElement.doScroll('left');
			}
			catch (e)
			{
				setTimeout(domready, 1);
				return;
			}
			callback();
		}
		domready();
	},
	$css: {
		get: function (elem, name)
		{
			return $style.get(elem, name);
		},
		set: function (elem, name, value)
		{
			typeof name === 'object' ? $each(name, function (propertyName, value)
			{
				$style.set(elem, $string.camelCase(propertyName), $css.fix(propertyName, value));
			}) : $style.set(elem, $string.camelCase(name), $css.fix(name, value));
			return elem;
		},
		number: {
			'fontWeight': true,
			'lineHeight': true,
			'opacity': true,
			"zIndex": true
		},
		unit: function (name, value)
		{
			if ($css.number[name])
			{
				return '';
			}
			var unit = value.toString().replace(Qatrix.rnum, '');
			return unit === '' ? 'px' : unit;
		},
		fix: function (name, value)
		{
			if (typeof value === 'number' && !$css.number[name])
			{
				value += 'px';
			}
			return value == null && isNaN(value) ? false : value;
		}
	},
	$style: {
		get: window.getComputedStyle ?
		function (elem, property)
		{
			if (elem !== null)
			{
				return document.defaultView.getComputedStyle(elem, null).getPropertyValue(property);
			}
			return false;
		}:
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
			return false;
		},
		set: document.documentElement.style.opacity === '' ?
		function (elem, name, value)
		{
			elem.style[name] = value;
			return true;
		}:
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
			return true;
		}
	},
	$pos: function (elem, x, y)
	{
		$style.set(elem, 'left', x + 'px');
		$style.set(elem, 'top', y + 'px');
		return elem;
	},
	$offset: function (elem)
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
	$append: function (elem, node)
	{
		return elem.appendChild(Qatrix.nodeManip(elem, node));
	},
	$prepend: function (elem, node)
	{
		return elem.firstChild ? elem.insertBefore(Qatrix.nodeManip(elem, node), elem.firstChild) : elem.appendChild(Qatrix.nodeManip(elem, node));
	},
	$before: function (elem, node)
	{
		return elem.parentNode.insertBefore(Qatrix.nodeManip(elem, node), elem);
	},
	$after: function (elem, node)
	{
		return elem.nextSibling ? elem.parentNode.insertBefore(Qatrix.nodeManip(elem, node), elem.nextSibling) : elem.parentNode.appendChild(Qatrix.nodeManip(elem, node));
	},
	$remove: function (elem)
	{
		return elem != null && elem.parentNode ? elem.parentNode.removeChild(elem) : elem;
	},
	$empty: function (elem)
	{
		// Directly setting the innerHTML attribute to blank will release memory for browser
		// Only remove the childNodes will not able to do this for some browsers
		elem.innerHTML = '';
		return elem;
	},
	$html: function (elem, html)
	{
		if (!html)
		{
			return elem.nodeType === 1 ? elem.innerHTML : null;
		}
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
	$text: function (elem, text)
	{
		// Retrieve the text value
		// textContent and innerText returns different results from different browser
		// So it have to rewrite the process method
		if (!text)
		{
			var rtext = '',
				textContent = (elem.textContent),
				nodeType;
			for (elem = elem.firstChild; elem; elem = elem.nextSibling)
			{
				nodeType = elem.nodeType;
				if (nodeType === 3 && $string.trim(elem.nodeValue) != '')
				{
					rtext += elem.nodeValue.replace(Qatrix.rbline, '') + "\n";
				}
				if (nodeType === 1 || nodeType === 2)
				{
					rtext += (textContent ? $string.trim(elem.textContent.replace(Qatrix.rbline, '')) : elem.innerText.replace(Qatrix.rline, '')) + "\n";
				}
			}
			return rtext;
		}
		// Set text node.
		$empty(elem);
		elem.appendChild(document.createTextNode(text));
		return elem;
	},
	$className: {
		add: function (elem, name)
		{
			if (elem.className === '')
			{
				elem.className = name;
			}
			else
			{
				var ori = elem.className,
					nclass = [];
				$each(name.split(Qatrix.rspace), function (i, item)
				{
					if (!new RegExp('\\b(' + item + ')\\b').test(ori))
					{
						nclass.push(' ' + item);
					}
				});
				elem.className += nclass.join('');
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
			elem.className = name ? $string.trim(elem.className.replace(new RegExp('\\b(' + name.split(Qatrix.rspace).join('|') + ')\\b', 'g'), '').split(Qatrix.rspace).join(' ')) : '';
			return elem;
		}
	},
	$hide: function (elem)
	{
		$each(arguments, function (i, argument)
		{
			typeof argument === 'string' ? $(argument).style.display = 'none' : typeof argument === 'object' && argument.length ? $each(argument, function (i, elem)
			{
				elem.style.display = 'none';
			}) : argument.style.display = 'none';
		});
	},
	$show: function (elem)
	{
		$each(arguments, function (i, argument)
		{
			typeof argument === 'string' ? $(argument).style.display = 'block' : typeof argument === 'object' && argument.length ? $each(argument, function (i, elem)
			{
				elem.style.display = 'block';
			}) : argument.style.display = 'block';
		});
	},
	$animate: (function ()
	{
		// Use CSS3 native transition for animation as possible
		var style = document.documentElement.style;
		return (
			style.webkitTransition === '' ||
			style.MozTransition === '' ||
			style.OTransition === '' ||
			style.MsTransition === '' ||
			style.transition === ''
		);
	}()) ?
	(function ()
	{
		var style = document.documentElement.style,
			prefix_name = style.webkitTransition === '' ? 'Webkit' :
									style.MozTransition === '' ? 'Moz' :
									style.OTransition === '' ? 'O' :
									style.MsTransition === '' ? 'ms' : '',
			transition_name = prefix_name + 'Transition',
			transform_name = prefix_name + 'Transform';
		return function (elem, properties, duration, callback)
		{
			var css_value = [],
				css_name = [],
				unit = [],
				css_style = [],
				style = elem.style,
				css, offset;
			duration = duration || '300';
			for (css in properties)
			{
				css_name[css] = $string.camelCase(css);
				if (properties[css].from != null)
				{
					css_value[css] = !$css.number[css] ? parseInt(properties[css].to) : properties[css].to;
					unit[css] = $css.unit(css, properties[css].to);
					$style.set(elem, css_name[css], parseInt(properties[css].from) + unit[css]);
				}
				else
				{
					css_value[css] = !$css.number[css] ? parseInt(properties[css]) : properties[css];
					unit[css] = $css.unit(css, properties[css]);
					$style.set(elem, css_name[css], $style.get(elem, css_name[css]));
				}
				if (css === 'left' || css === 'top')
				{
					offset = $offset(elem);
					$style.set(elem, css, (css === 'left' ? offset.left : offset.top) + 'px');
				}
				css_style.push(css);
			}

			setTimeout(function ()
			{
				style[transition_name] = 'all ' + duration + 'ms';
				
				// Using CSS3 transform function will enable hardware acceleration to handle this animation
				if (properties['left'] || properties['top'])
				{
					style[transform_name] = 'translateZ(0)';
				}
				$each(css_style, function (i, css)
				{
					style[css_name[css]] = css_value[css] + unit[css];
				});
			}, 15);

			// Animation completed
			setTimeout(function ()
			{
				// Clear up CSS transition property
				style[transition_name] = style[transform_name] = '';
				if (callback)
				{
					callback(elem);
				}
			}, duration);

			return elem;
		}
	})():
	function (elem, properties, duration, callback)
	{
		var step = 0,
			p = 30,
			i = 0,
			j = 0,
			length = 0,
			css, css_to_value = [],
			css_from_value = [],
			css_name = [],
			css_unit = [],
			css_style = [],
			property_value, offset, timer;
		duration = duration || '300';

		for (css in properties)
		{
			css_name.push( css === 'opacity' ? 'filter' : $string.camelCase(css));
			if (properties[css].from != null)
			{
				property_value = properties[css].to;
				css_from_value.push(!$css.number[css] ? parseInt(properties[css].from) : properties[css].from);
				$style.set(elem, css_name[i], css_from_value[i] + $css.unit(css, property_value));
			}
			else
			{
				property_value = properties[css];

				// Speical handle for left and top
				if (css === 'left' || css === 'top')
				{
					offset = $offset(elem);
					css_from_value.push(css === 'left' ? offset.left : offset.top);
				}
				else
				{
					css_from_value.push(parseInt($style.get(elem, $string.camelCase(css))));
				}
			}
			css_to_value.push(!$css.number[css] ? parseInt(property_value) : property_value);
			css_unit.push($css.unit(css, property_value));
			i++;
			length++;
		}
		// Pre-calculation for CSS value
		for (j = 0; j < p; j++)
		{
			css_style[j] = [];
			for (i = 0; i < length; i++)
			{
				css_style[j][css_name[i]] = css_name[i] === 'filter' ? 'alpha(opacity=' + (css_from_value[i] + (css_to_value[i] - css_from_value[i]) / p * j) * 100 + ')' :
															(css_from_value[i] + (css_to_value[i] - css_from_value[i]) / p * j) + css_unit[i];
			}
		}

		for (; i < p; i++)
		{
			timer = setTimeout(function ()
			{
				for (i = 0; i < length; i++)
				{
					elem.style[css_name[i]] = css_style[step][css_name[i]];
				}
				step++;
			}, (duration / p) * i);
		}

		setTimeout(function ()
		{
			for (i = 0; i < length; i++)
			{
				elem.style[css_name[i]] = css_style[step][css_name[i]];
			}
			if (callback)
			{
				callback(elem);
			}
		}, duration);
		return elem;
	},
	$fadeout: function (elem, duration, callback)
	{
		duration = duration || '500';
		return $animate(elem, {
			'opacity': {
				from: 1,
				to: 0
			}
		}, duration, callback);
	},
	$fadein: function (elem, duration, callback)
	{
		duration = duration || '500';
		return $animate(elem, {
			'opacity': {
				from: 0,
				to: 1
			}
		}, duration, callback);
	},
	$cookie: {
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
			return null;
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
			return document.cookie = key + '=' + encodeURIComponent(value) + ((expires) ? ';expires=' + expires_date.toGMTString() : '') + '; path=/';
		},
		remove: function ()
		{
			$each(arguments, function (i, key)
			{
				$cookie.set(key, '', -1);
			});
			return true;
		}
	},
	$json: {
		decode: window.JSON ?
		function (data)
		{
			return JSON.parse($string.trim(data));
		}:
		function (data)
		{
			return $json.isJSON(data) ? eval('(' + $string.trim(data) + ')') : false;
		},
		encode: window.JSON ?
		function (data)
		{
			return JSON.stringify(data);
		}:
		function (data)
		{
			function stringify(data)
			{
				var temp = [],
					i, type, value, rvalue;
				for (i in data)
				{
					value = data[i];
					type = typeof value;
					if (type === 'undefined')
					{
						return;
					}
					if (type !== 'function')
					{
						switch (type)
						{
						case 'object':
							rvalue = value === null ? value :
							// For ISO date format
							value.getDay ? '"' + (1e3 - ~value.getUTCMonth() * 10 + value.toUTCString() + 1e3 + value / 1).replace(/1(..).*?(\d\d)\D+(\d+).(\S+).*(...)/, '$3-$1-$2T$4.$5Z') + '"' :
							// For Array
							value.length ? '[' + (function ()
							{
								var rdata = [];
								$each(value, function (i, item)
								{
									rdata.push((typeof item === 'string' ? '"' + $string.slashes(item) + '"' : item));
								});
								return rdata.join(',');
							})() + ']' :
							// For Object
							$json.encode(value);
							break;
						case 'number':
							rvalue = !isFinite(value) ? null : value;
							break;
						case 'boolean':
						case 'null':
							rvalue = value;
							break;
						case 'string':
							rvalue = '"' + $string.slashes(value) + '"';
							break;
						}
						temp.push('"' + i + '"' + ':' + rvalue);
					}
				}
				return temp.join(',');
			}
			return '{' + stringify(data) + '}';
		},
		isJSON: function (string)
		{
			return typeof string === 'string' && string !== '' ? Qatrix.rvalidchars.test(string.replace(Qatrix.rvalidescape, '@').replace(Qatrix.rvalidtokens, ']').replace(Qatrix.rvalidbraces, '')) : false;
		}
	},
	$ajax: function (url, options)
	{
		if (typeof url === 'object')
		{
			options = url;
			url = undefined;
		}
		options = options || {};
		var request = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP'),
			param = [],
			type = options.type || 'POST',
			response, url;
		if (request)
		{
			url = url || options.url;
			request.open(type, url, true);
			request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
			if (options.header)
			{
				$each(options.header, function (key, value)
				{
					request.setRequestHeader(key, value);
				});
			}
			if (options.data)
			{
				$each(options.data, function (key, value)
				{
					param.push($url(key) + '=' + $url(value));
				});
			}
			request.send(param.join('&').replace(/%20/g, '+'));
			request.onreadystatechange = function ()
			{
				if (request.readyState === 4 && request.status === 200 && options.success)
				{
					data = request.responseText;
					options.success(data != '' && $json.isJSON(data) ? $json.decode(data) : data);
				}
				else
				{
					if (options.error)
					{
						options.error.call();
					}
				}
			};
		}
	},
	$loadscript: function (src)
	{
		return $before(document.head || document.getElementsByTagName('head')[0] || document.documentElement, $new('script', {
			'type': 'text/javascript',
			'async': true,
			'src': src
		}));
	},
	$url: function (data)
	{
		return encodeURIComponent(data);
	},
	$rand: function (min, max)
	{
		return Math.floor(Math.random() * (max - min + 1) + min);
	},
	$browser: (function(){
		var ua = navigator.userAgent.toLowerCase(),
			browser = {
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
			key;
		for (key in browser)
		{
			browser[key] = browser[key].test(ua);
		}
		return browser;
	}())
};

// Expose Qatrix functions to global

for (var fn in Qatrix)
{
	if (fn.indexOf('$') === 0)
	{
		window[fn] = Qatrix[fn];
	}
}
window.Qatrix = Qatrix;


$ready(function ()
{
	// For hack CSS selector
	if (!document.querySelectorAll)
	{
		Qatrix.Qselector = $append(document.body, $new('style'));
	}
	// For hack storage
	if (!window.localStorage)
	{
		Qatrix.storage = $append(document.body, $new('link', {
			'style': {
				'behavior': 'url(#default#userData)'
			}
		}));
	}
});

})();