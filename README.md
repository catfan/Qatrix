[Qatrix](http://qatrix.com/) - Easily build up high performance application with less code
===========================================================

Qatrix is a new kind of JavaScript framework targeting on building up high performance and flexible web application with less code and friendly construction. It`s free and open source.

Qatrix is designed to simplify the script with friendly and easy-to-learn code construction and noticeably increase the performance and efficiency for the development of web application.

Main Features
---------------

### Hardware accelerated animation ###
The first framework supported hardware accelerated native CSS3 transition for animation. The animation of Qatrix will be impressively faster and smoother than other frameworks. Significantly improved the visual effects on web application.

### High performance code ###
CSS3 and HTML5 supported. Qatrix is using more native code and special design to increase the performance. Web application will run much more faster and more efficient than other frameworks about 50% in average.

### Easy-to-learn ###
The name of functions on Qatrix are simple, user-friendly and familiar with the jQuery. It will be much more easy to use without re-learn other new concept and knowledge.

### Incredible size ###
Only 4.7KB compressed and gzipped file size with 60+ functions, including hardware accelerated animation, DOM, AJAX, various selectors, cookie, event handle, local storage, cache system functions, and so on, enough for most common web development needs. Load powerful script instantly without expectation.

Quick start
-----------
**Get element by Qatrix selectors**

`$(id)`

`$id(id, callback)`

`$class(element, class, callback)`

`$tag(element, tag, callback)`

`$dom(dom, callback)`

`$select(selector, callback)`

**Use Qatrix functions**
```
$animate($('id'), {
	'width': {
		from: 300,
		to: 10
	},
	'opacity': {
		from: 1,
		to: 0.5
	}
});

$style.set($('id'), 'width', '400px');
$data.get($('id), 'city');
```

License
--------
The Qatrix JavaScript is under MIT license. You can freely to use or distribute for your project as long as declaring the original copyright information.

Compatibility
--------------
IE6-10, Chrome, Firefox2+, Safari3+, Opera9+

Links
------

Official website: [http://qatrix.com](http://qatrix.com)

Documentation: [http://qatrix.com/doc](http://qatrix.com/doc)

Benchmark: [http://qatrix.com/benchmark](http://qatrix.com/benchmark)

Download: [http://qatrix.com/download](http://qatrix.com/download)