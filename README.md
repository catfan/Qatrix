## [Qatrix](http://qatrix.com/) - Easily build up high performance application with less code

Qatrix is a new kind of JavaScript framework targeting on building up high performance and flexible web application with less code and friendly construction. It`s free and open source.

Qatrix is designed to simplify the script with friendly and easy-to-learn code construction and noticeably increase the performance and efficiency for the development of web application.

### Main Features

* **Hardware accelerated animation** - The first framework supported hardware accelerated native CSS3 transition for animation. The animation of Qatrix will be impressively faster and smoother than other frameworks. Significantly improved the visual effects on web application.

* **High performance code** - CSS3 and HTML5 supported. Qatrix is using more native code and special design to increase the performance. Web application will run much more faster and more efficient than other frameworks about 50% in average.

* **Easy-to-learn** - The name of functions on Qatrix are simple, user-friendly and familiar with the jQuery. It will be much more easy to use without re-learn other new concept and knowledge.

* **Incredible size** - Only 6KB compressed and gzipped file size with 60+ functions, including hardware accelerated animation, DOM, AJAX, template, require loader, various selectors, cookie, event handle, local storage, and so on, enough for most common web development needs. Load powerful script instantly without expectation.

### Quick start

#### DOM & Animation

    $tag($('wrap'), 'div', function (item)
    {
        $html(item, 'some value');
    });
    
    $hide($('element_id'));
    
    $hide($('element_id_1 element_id_2 element_id_3'), 500);
    
    $animate($("element"), {
    	"width": {
    		from: 200,
    		to: 30
    	}
    }, 500, function ()
    {
    	// Do something
    });

#### AJAX

    $ajax("example.php", {
    	data: {
    		"foo": "bar"
    	},
    	success: function (data)
    	{
    		// Do something
    	}
    }
    });

#### Template

    var template = "<div><h1>{{header}}</h1><h2>{{header2}}</h2><ul>{{#list}}<li>{{this}}</li>{{/list}}</ul><ul>{{#people}}<li>{{name}} - {{city}}</li>{{/people}}</ul></div>";
    
    var data = {
    	header: "Header",
    	header2: "Header2",
    	header3: "Header3",
    	list: ["1", "2", "3"],
    	people: [
    		{"name": "Tom", "city": "California"},
    		{"name": "Jack", "city": "Newton"},
    		{"name": "Jone", "city": "Tokyo"}
    	]
    };
    
    $append($("container"), $template(template, data));

#### Require

    $require([
    	"http://abc.com/foo.js",
    	"http://abc.com/foo.css"
    ], function ()
    {
    	// Do something
    });

#### Cookie & storage

    $cookie.set("foo", "bar");
    
    $storage.set("foo", "bar");


### License

The Qatrix JavaScript is under MIT license. You can freely to use or distribute for your project as long as declaring the original copyright information.

### Compatibility

IE6+, Chrome, Firefox2+, Safari3+, Opera9+

### Benchmark

Template (500% faster) - [http://jsperf.com/dom-vs-innerhtml-based-templating/735](http://jsperf.com/dom-vs-innerhtml-based-templating/735)

### Links

Official website: [http://qatrix.com](http://qatrix.com)

Documentation: [http://qatrix.com/doc](http://qatrix.com/doc)

Download: [http://qatrix.com/download](http://qatrix.com/download)