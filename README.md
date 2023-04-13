## Qatrix - Easily build up high-performance applications with less code.

> This project is no longer maintained.

Qatrix is a new kind of JavaScript framework targeting building up high-performance and flexible web applications with less code and friendly construction. It`s free and open source.

Designed to simplify the script with friendly and easy-to-learn code construction and noticeably increase the performance and efficiency of the development of web applications.

### Main Features

* **Hardware accelerated animation** - The first framework supports hardware-accelerated native CSS3 transition for animation. The animation of Qatrix will be impressively faster and smoother than other frameworks. Significantly improved the visual effects on the web application.

* **High performance code** - Supports CSS3 and HTML5. Qatrix is using more native code and special design to increase performance. The web application will run much faster and more efficiently than other frameworks about 50% on average.

* **Easy-to-learn** - The names of functions on Qatrix are simple, user-friendly, and familiar with jQuery. It will be much easier to use without re-learn other new concepts and knowledge.

* **Incredible size** - Only 6KB compressed and gzipped file size with 60+ functions, including hardware accelerated animation, DOM, AJAX, template, require loader, various selectors, cookie, event handle, local storage, and so on, enough for most common web development needs. Load powerful script instantly without expectation.

### Quick start

#### DOM & Animation
```JavaScript
$tag($('wrap'), 'div', function (item) {
    $html(item, 'some value');
});

$hide($('element_id'));

$hide($('element_id_1 element_id_2 element_id_3'), 500);

$animate($("element"), {
    "width": {
        from: 200,
        to: 30
    }
}, 500, function () {
    // Do something
});
```

#### AJAX
```JavaScript
$ajax("example.php", {
    data: {
        "foo": "bar"
    },
    success: function (data) {
        // Do something
    }
});
```

#### Template
```JavaScript
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
```

#### Require
```JavaScript
$require([
    "http://abc.com/foo.js",
    "http://abc.com/foo.css"
], function () {
    // Do something
});
```

#### Cookie & storage
```JavaScript
$cookie.set("foo", "bar");
$storage.set("foo", "bar");
```

### License

Qatrix is under the MIT license. You can freely use or distribute your project as long as declaring the original copyright information.

### Compatibility

IE6+, Chrome, Firefox 2+, Safari 3+, Opera 9+.

### Benchmark

Template (500% faster) - [http://jsperf.com/dom-vs-innerhtml-based-templating/735](http://jsperf.com/dom-vs-innerhtml-based-templating/735)
