/*
	Qatrix JavaScript v1.0.3 pre

	Copyright (c) 2013, Angel Lai
	The Qatrix project is under MIT license.
	For details, see the Qatrix website: http://qatrix.com
*/

(function (window, document, undefined) {

var version = '1.0.3 pre',

	rbline = /(^\n+)|(\n+$)/g,
	rbrace = /^(?:\{.*\}|\[.*\])$/,
	rcamelCase = /-([a-z])/ig,
	rdigit = /\d/,
	rline = /\r\n/g,
	rnum = /[\-\+0-9\.]/ig,
	rspace = /\s+/,
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
	ropacity = /opacity=([^)]*)/,
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,

	animDisplay = ['height', 'margin-top', 'margin-bottom', 'padding-top', 'padding-bottom'],
	
	// For DOM ready
	readyList = [],
	ready = function ()
	{
		$each(readyList, function (i, callback)
		{
			callback();
		});
		document.removeEventListener('DOMContentLoaded', ready, false);
	},
	
	// For $append, $prepend, $before, $after
	nodeManip = function (elem, node)
	{
		var type = typeof node;
		if (type === 'string')
		{
			var doc = elem && elem.ownerDocument || document,
				fragment = doc.createDocumentFragment(),
				div = $new('div'),
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
	
	// For map function callback
	mapcall = function (match, callback)
	{
		if (match === null)
		{
			return;
		}

		var length = match.length;
		if (callback)
		{
			if (length !== undefined)
			{
				if (length > 0)
				{
					$each(match, function (i, item)
					{
						callback(item);
					});
				}
				return match;
			}
			else
			{
			 	return callback(match);
			}
		}
		else
		{
			return match;
		}
	},

	// For $show and $hide
	displayElem = function (elem, type, duration, callback)
	{
		return mapcall(elem, function (elem)
		{
			var prop = {},
				show = type === 'show',
				style = elem.style,
				display = $data.get(elem, '_display'),
				temp, overflow;

			if (!display)
			{
				display = $style.get(elem, 'display');
				if (display == 'none' || display == 'inherit')
				{
					temp = $append(document.body, $new(elem.nodeName));
					display = $style.get(temp, 'display');
					$remove(temp);
				}
				$data.set(elem, '_display', display);
			}

			if (show)
			{
				style.display = display;
			}
			else
			{
				display = 'none';
			}

			if (duration)
			{
				overflow = $style.get(elem, 'overflow');
				style.overflow = 'hidden';

				prop.opacity = show ? {
					from: 0,
					to: 1
				} : {
					from: 1,
					to: 0
				};

				$each(animDisplay, function (i, css)
				{
					prop[css] = show ? {
						from: 0,
						to: $style.get(elem, css)
					} : 0;
				});
				$animate(elem, prop, duration, function ()
				{
					$each(animDisplay, function (i, css)
					{
						style[css] = '';
					});
					$style.set(elem, 'opacity', '');
					style.display = display;
					style.overflow = overflow;

					if (callback)
					{
						callback();
					}
				});
			}
			else
			{
				style.display = display;
			}
		});
	},

	// For $ajax parameter
	addParam = function (prefix, data)
	{
		if (typeof data === 'object')
		{
			var rdata = [];
			$each(data, function (key, value)
			{
				if (typeof value === 'object')
				{
					rdata.push(addParam(prefix + '[' + key + ']', value));
				}
				else
				{
					rdata.push(prefix + '[' + $url(key) + ']=' + value);
				}
			});
			return rdata.join('&');
		}
		else
		{
			return $url(prefix) + '=' + $url(data);
		}
	},

	Qatrix = {
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

		if (length !== undefined)
		{
			for (; i < length;)
			{
				if (callback.call(haystack[i], i, haystack[i++]) === false)
				{
					break;
				}
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
			if (elem !== null && callback)
			{
				callback(elem);
			}
			return elem;
		}
		$each(id, function (i, item)
		{
			elem = $(item);
			if (elem !== null)
			{
				match.push(elem);
			}
		});
		return mapcall(match, callback);
	},
	$dom: function (dom, callback)
	{
		if (callback)
		{
			dom.length ? mapcall(dom, callback) : callback(dom);
		}
		return dom;
	},
	$tag: function (elem, name, callback)
	{
		return mapcall(elem.getElementsByTagName(name), callback);
	},
	$class: document.getElementsByClassName ?
	function (elem, className, callback)
	{
		return mapcall(elem.getElementsByClassName(className), callback);
	}:
	function (elem, className, callback)
	{
		var match = [],
			rclass = new RegExp("(^|\\s)" + className + "(\\s|$)");
		$tag(elem, '*', function (item)
		{
			if (rclass.test(item.className))
			{
				match.push(item);
			}
		});
		return mapcall(match, callback);
	},
	$select: document.querySelectorAll ?
	function (selector, callback)
	{
		return mapcall(document.querySelectorAll(selector), callback);
	}:
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
		return mapcall(match, callback);
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
			return string.replace('-ms-', 'ms-').replace(rcamelCase, function (match, letter)
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
		trim: "".trim ?
		function (string)
		{
			return string.trim();
		}:
		function (string)
		{
			return (string + '').replace(rtrim, '');
		}
	},
	$attr: {
		get: function (elem, name)
		{
			return elem.getAttribute(name);
		},
		set: function (elem, name, value)
		{
			return mapcall(elem, function (elem)
			{
				elem.setAttribute(name, value);
			});
		},
		remove: function (elem, name)
		{
			return mapcall(elem, function (elem)
			{
				elem.removeAttribute(name);
			});
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
				rbrace.test(value) ? $json.decode(value) :
				value;
		},
		set: function (elem, name, value)
		{
			return mapcall(elem, function (elem)
			{
				value = typeof value === 'object' ? $json.encode(value) : value;
				typeof name === 'object' ? $each(name, function (key, value)
				{
					$attr.set(elem, 'data-' + key, value);
				}) : $attr.set(elem, 'data-' + name, value);
				return elem;
			});
		},
		remove: function (elem, name)
		{
			return mapcall(elem, function (elem)
			{
				$attr.remove(elem, 'data-' + name);
			});
		}
	},
	$storage: window.localStorage ?
	{
		set: function (name, value)
		{
			localStorage[name] = typeof value === 'object' ? $json.encode(value) : value;
		},
		get: function (name)
		{
			var data = localStorage[name];
			if ($json.isJSON(data))
			{
				return $json.decode(data);
			}
			return data || '';
		},
		remove: function (name)
		{
			localStorage.removeItem(name);
			return true;
		}
	}:
	{
		set: function (name, value)
		{
			value = typeof value === 'object' ? $json.encode(value) : value;
			$data.set(Qatrix.storage, name, value);
			Qatrix.storage.save('Qstorage');
		},
		get: function (name)
		{
			Qatrix.storage.load('Qstorage');
			return $data.get(Qatrix.storage, name) || '';
		},
		remove: function (name)
		{
			Qatrix.storage.load('Qstorage');
			$data.remove(Qatrix.storage, name);
			return true;
		}
	},
	$event: {
		add: function (elem, type, handler)
		{
			return mapcall(elem, function (elem)
			{
				if (typeof type === 'object')
				{
					$each(type, function (type, handler)
					{
						$event.add(elem, type, handler);
					});
					return elem;
				}
				if (elem.nodeType === 3 || elem.nodeType === 8 || !type || !handler)
				{
					return false;
				}
				if (elem.addEventListener)
				{
					if (type === 'mouseenter' || type === 'mouseleave')
					{
						type = type === 'mouseenter' ? 'mouseover' : 'mouseout';
						handler = $event.handler.mouseenter(handler);
					}
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
			});
		},
		remove: document.removeEventListener ?
		function (elem, type, handler)
		{
			return mapcall(elem, function (elem)
			{
				if (typeof type === 'object')
				{
					$each(type, function (type, handler)
					{
						$event.remove(elem, type, handler);
					});
					return elem;
				}
				elem.removeEventListener(type, handler, false);
				return elem;
			});
		}:
		function (elem, type, handler)
		{
			return mapcall(elem, function (elem)
			{
				if (typeof type === 'object')
				{
					$each(type, function (type, handler)
					{
						$event.remove(elem, type, handler);
					});
					return elem;
				}
				elem.detachEvent('on' + type, handler);
				if (elem.removeAttribute)
				{
					$attr.remove(elem, 'event-' + type + '-' + handler.toString());
				}
				return elem;
			});
		},
		handler: {
			mouseenter: function (handler)
			{
				return function (event)
				{
					var target = event.relatedTarget;
					if (this === target)
					{
						return;
					}
					while (target && target !== this)
					{
						target = target.parentNode;
					}
					if (target === this)
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
			return event.metaKey || event.ctrlKey;
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
			readyList.push(callback);
			document.addEventListener('DOMContentLoaded', ready, false);
			return;
		}
		// Hack IE DOM for ready event
		var domready = function ()
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
		};
		domready();
	},
	$css: {
		get: function (elem, name)
		{
			if (typeof name === 'object')
			{
				var haystack = {};
				$each(name, function (i, property)
				{
					haystack[property] = $style.get(elem, property);
				});
				return haystack;
			}
			return $style.get(elem, name);
		},
		set: function (elem, name, value)
		{
			return mapcall(elem, function (elem)
			{
				typeof name === 'object' ? $each(name, function (propertyName, value)
				{
					$style.set(elem, $string.camelCase(propertyName), $css.fix(propertyName, value));
				}) : $style.set(elem, $string.camelCase(name), $css.fix(name, value));
				return elem;
			});
		},
		number: {
			'fontWeight': true,
			'lineHeight': true,
			'opacity': true,
			'zIndex': true
		},
		unit: function (name, value)
		{
			if ($css.number[name])
			{
				return '';
			}
			var unit = value.toString().replace(rnum, '');
			return unit === '' ? 'px' : unit;
		},
		fix: function (name, value)
		{
			if (typeof value === 'number' && !$css.number[name])
			{
				value += 'px';
			}
			return value === null && isNaN(value) ? false : value;
		}
	},
	$style: {
		get: window.getComputedStyle ?
		function (elem, property)
		{
			if (elem !== null)
			{
				var value = document.defaultView.getComputedStyle(elem, null).getPropertyValue(property);
				return value === 'auto' || value === '' ? 0 : value;
			}
			return false;
		}:
		function (elem, property)
		{
			if (elem !== null)
			{
				var value = property === 'opacity' ? ropacity.test(elem.currentStyle['filter']) ?
					(0.01 * parseFloat(RegExp.$1)) + '' :
					1 : elem.currentStyle[$string.camelCase(property)];
				return value === 'auto' ? 0 : value;
			}
			return false;
		},
		set: document.documentElement.style.opacity !== undefined ?
		function (elem, name, value)
		{
			return mapcall(elem, function (elem)
			{
				elem.style[name] = value;
				return true;
			});
		}:
		function (elem, name, value)
		{
			return mapcall(elem, function (elem)
			{
				if (!elem.currentStyle || !elem.currentStyle.hasLayout)
				{
					elem.style.zoom = 1;
				}
				if (name === 'opacity')
				{
					elem.style.filter = 'alpha(opacity=' + value * 100 + ')';
					elem.style.zoom = 1;
				}
				else
				{
					elem.style[name] = value;
				}
				return true;
			});
		}
	},
	$pos: function (elem, x, y)
	{
		return mapcall(elem, function (elem)
		{
			$style.set(elem, 'left', x + 'px');
			$style.set(elem, 'top', y + 'px');
			return elem;
		});
	},
	$offset: function (elem)
	{
		var body = document.body,
			doc_elem = document.documentElement,
			box = elem.getBoundingClientRect();
		return {
			top: box.top + (window.scrollY || body.parentNode.scrollTop || elem.scrollTop) - (doc_elem.clientTop || body.clientTop || 0),
			left: box.left + (window.scrollX || body.parentNode.scrollLeft || elem.scrollLeft) - (doc_elem.clientLeft || body.clientLeft || 0),
			width: elem.offsetWidth,
			height: elem.offsetHeight
		};
	},
	$append: function (elem, node)
	{
		return mapcall(elem, function (elem)
		{
			return elem.appendChild(nodeManip(elem, node));
		});
	},
	$prepend: function (elem, node)
	{
		return mapcall(elem, function (elem)
		{
			return elem.firstChild ? elem.insertBefore(nodeManip(elem, node), elem.firstChild) : elem.appendChild(nodeManip(elem, node));
		});
	},
	$before: function (elem, node)
	{
		return mapcall(elem, function (elem)
		{
			return elem.parentNode.insertBefore(nodeManip(elem, node), elem);
		});
	},
	$after: function (elem, node)
	{
		return mapcall(elem, function (elem)
		{
			return elem.nextSibling ? elem.parentNode.insertBefore(nodeManip(elem, node), elem.nextSibling) : elem.parentNode.appendChild(nodeManip(elem, node));
		});
	},
	$remove: function (elem)
	{
		return mapcall(elem, function (elem)
		{
			return elem !== null && elem.parentNode ? elem.parentNode.removeChild(elem) : elem;
		});
	},
	$empty: function (elem)
	{
		// Directly setting the innerHTML attribute to blank will release memory for browser
		// Only remove the childNodes will not able to do this for some browsers
		return mapcall(elem, function (elem)
		{
			elem.innerHTML = '';
			return elem;
		});
	},
	$html: function (elem, html)
	{
		return mapcall(elem, function (elem)
		{
			if (html)
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
			}
			return elem.nodeType === 1 ? elem.innerHTML : null;
		});
	},
	$text: function (elem, text)
	{
		// Retrieve the text value
		// textContent and innerText returns different results from different browser
		// So it have to rewrite the process method
		return mapcall(elem, function (elem)
		{
			if (text)
			{
				// Set text node.
				$empty(elem);
				elem.appendChild(document.createTextNode(text));
				return elem;
			}
			else
			{
				var rtext = '',
					textContent = elem.textContent,
					nodeType;
				// If the content of elem is text only
				if ((textContent || elem.innerText) === elem.innerHTML)
				{
					rtext = textContent ? $string.trim(elem.textContent.replace(rbline, '')) : elem.innerText.replace(rline, '');
				}
				else
				{
					for (elem = elem.firstChild; elem; elem = elem.nextSibling)
					{
						nodeType = elem.nodeType;
						if (nodeType === 3 && $string.trim(elem.nodeValue) !== '')
						{
							rtext += elem.nodeValue.replace(rbline, '') + (elem.nextSibling && elem.nextSibling.tagName.toLowerCase() !== 'br' ? "\n" : '');
						}
						if (nodeType === 1 || nodeType === 2)
						{
							rtext += $text(elem) + ($style.get(elem, 'display') === 'block' || elem.tagName.toLowerCase() === 'br' ? "\n" : '');
						}
					}
				}
				return rtext;
			}
		});
	},
	$className: {
		add: function (elem, name)
		{
			return mapcall(elem, function (elem)
			{
				if (elem.className === '')
				{
					elem.className = name;
				}
				else
				{
					var ori = elem.className,
						nclass = [];
					$each(name.split(rspace), function (i, item)
					{
						if (!new RegExp('\\b(' + item + ')\\b').test(ori))
						{
							nclass.push(' ' + item);
						}
					});
					elem.className += nclass.join('');
				}
				return elem;
			});
		},
		set: function (elem, name)
		{
			return mapcall(elem, function (elem)
			{
				elem.className = name;
				return elem;
			});
		},
		has: function (elem, name)
		{
			return new RegExp('\\b(' + name.split(rspace).join('|') + ')\\b').test(elem.className);
		},
		remove: function (elem, name)
		{
			return mapcall(elem, function (elem)
			{
				elem.className = name ? $string.trim(
					elem.className.replace(
						new RegExp('\\b(' + name.split(rspace).join('|') + ')\\b', 'g'), '')
						.split(rspace)
						.join(' ')
				) : '';
				return elem;
			});
		}
	},
	$hide: function (elem, duration, callback)
	{
		displayElem(elem, 'hide', duration, callback);
	},
	$show: function (elem, duration, callback)
	{
		displayElem(elem, 'show', duration, callback);
	},
	$toggle: function (elem, duration, callback)
	{
		return mapcall(elem, function (elem)
		{
			$style.get(elem, 'display') === 'none' ?
				$show(elem, duration, callback) :
				$hide(elem, duration, callback);
		});
	},
	$animate: (function ()
	{
		// Use CSS3 native transition for animation as possible
		var style = document.documentElement.style;
		return (
			style.webkitTransition !== undefined ||
			style.MozTransition !== undefined ||
			style.OTransition !== undefined ||
			style.MsTransition !== undefined ||
			style.transition !== undefined
		);
	}()) ?
	(function ()
	{
		var style = document.documentElement.style,
			prefix_name = style.webkitTransition !== undefined ? 'Webkit' :
				style.MozTransition !== undefined ? 'Moz' :
				style.OTransition !== undefined ? 'O' :
				style.MsTransition !== undefined ? 'ms' : '',
			transition_name = prefix_name + 'Transition',
			transform_name = prefix_name + 'Transform';
		return function (elem, properties, duration, callback)
		{
			return mapcall(elem, function (elem)
			{
				var css_value = [],
					css_name = [],
					unit = [],
					css_style = [],
					style = elem.style,
					css, offset;

				for (css in properties)
				{
					css_name[css] = $string.camelCase(css);
					if (properties[css].from !== undefined)
					{
						properties[css].to = properties[css].to || 0;
						css_value[css] = !$css.number[css] ? parseInt(properties[css].to, 10) : properties[css].to;
						unit[css] = $css.unit(css, properties[css].to);
						$style.set(elem, css_name[css], parseInt(properties[css].from, 10) + unit[css]);
					}
					else
					{
						css_value[css] = !$css.number[css] ? parseInt(properties[css], 10) : properties[css];
						unit[css] = $css.unit(css, properties[css]);
						$style.set(elem, css_name[css], $style.get(elem, css_name[css]));
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
				}, duration || 300);

				return elem;
			});
		}
	})():
	function (elem, properties, duration, callback)
	{
		return mapcall(elem, function (elem)
		{
			var step = 0,
				i = 0,
				j = 0,
				length = 0,
				p = 30,
				css_to_value = [],
				css_from_value = [],
				css_name = [],
				css_unit = [],
				css_style = [],
				property_value, css, offset, timer;
			duration = duration || 300;

			for (css in properties)
			{
				css_name.push($string.camelCase(css));
				if (properties[css].from !== undefined)
				{
					property_value = properties[css].to;
					css_from_value.push(!$css.number[css] ? parseInt(properties[css].from, 10) : properties[css].from);
					$style.set(elem, css_name[i], css_from_value[i] + $css.unit(css, property_value));
				}
				else
				{
					property_value = properties[css];
					css_from_value.push(parseInt($style.get(elem, $string.camelCase(css)), 10));
				}
				css_to_value.push(!$css.number[css] ? parseInt(property_value, 10) : property_value);
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
					css_style[j][css_name[i]] =
						(css_from_value[i] + (css_to_value[i] - css_from_value[i]) / p * j) +
						(css_name[i] === 'opacity' ? '' : css_unit[i]);
				}
			}

			for (; i < p; i++)
			{
				timer = setTimeout(function ()
				{
					for (i = 0; i < length; i++)
					{
						$style.set(elem, css_name[i], css_style[step][css_name[i]]);
					}
					step++;
				}, (duration / p) * i);
			}

			setTimeout(function ()
			{
				for (i = 0; i < length; i++)
				{
					$style.set(elem, css_name[i], css_to_value[i] + css_unit[i]);
				}
				if (callback)
				{
					callback(elem);
				}
			}, duration);
			return elem;
		});
	},
	$fadeout: function (elem, duration, callback)
	{
		return mapcall(elem, function (elem)
		{
			$animate(elem, {
				'opacity': {
					from: 1,
					to: 0
				}
			}, duration || 500, callback);
		});
	},
	$fadein: function (elem, duration, callback)
	{
		return mapcall(elem, function (elem)
		{
			$animate(elem, {
				'opacity': {
					from: 0,
					to: 1
				}
			}, duration || 500, callback);
		});
	},
	$cookie: {
		get: function (key)
		{
			var cookies = document.cookie.split('; '),
				i = 0,
				l = cookies.length,
				temp, value;
			for (; i < l; i++)
			{
				temp = cookies[i].split('=');
				if (temp[0] === key)
				{
					value = decodeURIComponent(temp[1]);
					return $json.isJSON(value) ? $json.decode(value) : value.toString();
				}
			}
			return null;
		},
		set: function (key, value, expires)
		{
			if (typeof key === 'object')
			{
				expires = value;
				return $each(key, function (name, value)
				{
					$cookie.set(name, value, expires);
				});
			}

			var today = new Date();
			today.setTime(today.getTime());
			expires = expires ? ';expires=' + new Date(today.getTime() + expires * 86400000).toGMTString() : '';

			value = typeof value === 'object' ? $json.encode(value) : value;

			return document.cookie = key + '=' + $url(value) + expires + ';path=/';
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
			return $json.isJSON(data) ? JSON.parse($string.trim(data)) : false;
		}:
		function (data)
		{
			return $json.isJSON(data) ? (new Function('return ' + $string.trim(data)))() : false;
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
							value.getDay ?
								'"' + (1e3 - ~value.getUTCMonth() * 10 + value.toUTCString() + 1e3 + value / 1)
									.replace(/1(..).*?(\d\d)\D+(\d+).(\S+).*(...)/, '$3-$1-$2T$4.$5Z') + '"' :
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
			return typeof string === 'string' && $string.trim(string) !== '' ?
				rvalidchars.test(string
					.replace(rvalidescape, '@')
					.replace(rvalidtokens, ']')
					.replace(rvalidbraces, '')) :
				false;
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
		var request = window.ActiveXObject ? new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest(),
			param = [],
			response;
		request.open(options.type || 'POST', url || options.url, true);
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
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
				param.push(addParam(key, value));
			});
		}
		request.send(param.join('&').replace(/%20/g, '+'));
		request.onreadystatechange = function ()
		{
			if (request.readyState === 4)
			{
				if (request.status === 200 && options.success)
				{
					data = request.responseText;
					options.success(data !== '' && $json.isJSON(data) ? $json.decode(data) : data);
				}
				else
				{
					if (options.error)
					{
						options.error(request.status);
					}
				}
			}
		};
	},
	$loadscript: function (src)
	{
		return $prepend(document.head || document.getElementsByTagName('head')[0] || document.documentElement, $new('script', {
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
				mozilla: /mozilla/,
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
		browser.is = function (keyword)
		{
			return new RegExp(keyword, 'ig').test(ua);
		};
		return browser;
	}())
};

// Expose Qatrix functions to global
for (var fn in Qatrix)
{
	window[fn] = Qatrix[fn];
}

Qatrix.version = version;
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

// Create a shortcut for compression
})(window, document);
