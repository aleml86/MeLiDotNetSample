/*!
 * Chico UI v0.12.2
 * http://chico-ui.com.ar/
 *
 * Copyright (c) 2012, MercadoLibre.com
 * Released under the MIT license.
 * http://chico-ui.com.ar/license
 */

;(function (window, $) {
	'use strict';

/**
 * An object which contains all the public members.
 * @namespace
 */
var ch = {},
	/**
	 * A map of all widget's instances created by Chico.
	 * @memberOf ch
	 * @type {Object}
	 */
	instances = {},

	/**
	 * Reference to the window Selector Object.
	 * @private
	 * @type {Selector}
	 */
	$window = $(window),

	/**
	 * Reference to the navigator object.
	 * @private
	 * @type {Object}
	 */
	navigator = window.navigator,

	/**
	 * Reference to the userAgent.
	 * @private
	 * @type {String}
	 */
	userAgent = navigator.userAgent,

	/**
	 * Reference to the HTMLDocument.
	 * @private
	 * @type {Object}
	 */
	document = window.document,

	/**
	 * Reference to the document Selector Object.
	 * @private
	 * @type {Selector}
	 */
	$document = $(document),

	/**
	 * Reference to the HTMLBodyElement.
	 * @private
	 * @type {Object}
	 */
	body = document.body,

	/**
	 * Reference to the body Selector Object.
	 * @private
	 * @type {Selector}
	 */
	$body = $(body),

	/**
	 * Reference to the HTMLElement.
	 * @private
	 * @type {Object}
	 */
	html = document.getElementsByTagName('html')[0],

	/**
	 * Reference to the html Selector Object.
	 * @private
	 * @type {Selector}
	 */
	$html = $(html),

	/**
	 * Reference to the Object Contructor.
	 * @private
	 * @function
	 * @type {Function}
	 */
	Object = window.Object,

	/**
	 * Reference to the Array Contructor.
	 * @private
	 * @function
	 * @type {Function}
	 */
	Array = window.Array,

	/**
	 * Reference to the vendor prefix of the current browser.
	 * @private
	 * @constant
	 * @type {String}
	 * @see <a href="http://lea.verou.me/2009/02/find-the-vendor-prefix-of-the-current-browser/" target="_blank">http://lea.verou.me/2009/02/find-the-vendor-prefix-of-the-current-browser/</a>
	 */
	VENDOR_PREFIX = (function () {

		var regex = /^(Webkit|Khtml|Moz|ms|O)(?=[A-Z])/,
			styleDeclaration = document.getElementsByTagName('script')[0].style,
			prop;

		for (prop in styleDeclaration) {
			if (regex.test(prop)) {
				return prop.match(regex)[0].toLowerCase();
			}
		}

		// Nothing found so far? Webkit does not enumerate over the CSS properties of the style object.
		// However (prop in style) returns the correct value, so we'll have to test for
		// the precence of a specific property
		if ('WebkitOpacity' in styleDeclaration) { return 'webkit'; }
		if ('KhtmlOpacity' in styleDeclaration) { return 'khtml'; }

		return '';
	}()),

	/**
	 * zIndex values.
	 * @private
	 * @type {Number}
	 */
	zIndex = 1000;

(function () {
	/**
	 * Provides varies utilities and commons functions that are used across all widgets.
	 * @name ch.util
	 * @namespace
	 */
	var util = {};

	/**
	 * Returns a boolean indicating whether the object has the specified property.
	 * @name hasOwn
	 * @methodOf ch.util
	 * @param {Object} obj The object to be checked.
	 * @param {String} prop The name of the property to test.
	 * @returns {Boolean}
	 */
	util.hasOwn = (function () {
		var hOP = Object.prototype.hasOwnProperty;

		return function (obj, prop) {

			if (obj === undefined) {
				throw new Error('"ch.util.hasOwn(obj, prop)": It must receive an object as first parameter.');
			}

			if (prop === undefined || typeof prop !== 'string') {
				throw new Error('"ch.util.hasOwn(obj, prop)": It must receive a string as second parameter.');
			}

			return hOP.call(obj, prop);
		};
	}());

	/**
	 * Returns true if an object is an array, false if it is not.
	 * @name isArray
	 * @methodOf ch.util
	 * @param {Object} obj The object to be checked.
	 * @returns {Boolean}
	 */
	util.isArray = (function () {
		if (typeof Array.isArray === 'function') {
			return Array.isArray;
		}

		return function (obj) {
			if(obj === undefined){
				throw new Error('"ch.util.isArray(obj)": It must receive a parameter.');
			}

			return (Object.prototype.toString.call(obj) === '[object Array]');
		};
	}());

	/**
	 * Returns a boolean indicating whether the selector is into DOM.
	 * @name inDom
	 * @methodOf ch.util
	 * @param {String} selector The selector to be checked.
	 * @param {String} [context=document] Explicit context to the selector.
	 * @returns {Boolean}
	 */
	util.inDom = function (selector, context) {
		if (selector === undefined || typeof selector !== 'string') {
			return false;
		}
		// jQuery: If you wish to use any of the meta-characters ( such as !"#$%&'()*+,./:;<=>?@[\]^`{|}~ ) as a literal part of a name, you must escape the character with two backslashes: \\.
		selector = selector.replace(/(\!|\"|\$|\%|\&|\'|\(|\)|\*|\+|\,|\/|\;|\<|\=|\>|\?|\@|\[|\\|\]|\^|\`|\{|\||\}|\~)/gi, function (str, $1) {
			return "\\\\" + $1;
		});
		return $(selector, context).length > 0;
	};

	/**
	 * Checks if the url given is right to load content.
	 * @name isUrl
	 * @methodOf ch.util
	 * @param {String} url The url to be checked.
	 * @returns {Boolean}
	 */
	util.isUrl = function (url) {
		if (url === undefined || typeof url !== 'string') {
			return false;
		}

		/*
		# RegExp

		https://github.com/mercadolibre/chico/issues/579#issuecomment-5206670

		```javascript
		1	1.1						   1.2	 1.3  1.4		1.5		  1.6					2					   3 			   4					5
		/^(((https|http|ftp|file):\/\/)|www\.|\.\/|(\.\.\/)+|(\/{1,2})|(\d{1,3}\.){3}\d{1,3})(((\w+|-)(\.?)(\/?))+)(\:\d{1,5}){0,1}(((\w+|-)(\.?)(\/?))+)((\?)(\w+=(\w?)+(&?))+)?$/
		```

		## Description
		1. Checks for the start of the URL
			1. if starts with a protocols followed by :// Example: file://chico
			2. if start with www followed by . (dot) Example: www.chico
			3. if starts with ./
			4. if starts with ../ and can repeat one or more times
			5. if start with double slash // Example: //chico.server
			6. if start with an ip address
		2. Checks the domain
		  letters, dash followed by a dot or by a slash. All this group can repeat one or more times
		3. Ports
		 Zero or one time
		4. Idem to point two
		5. QueryString pairs

		## Allowed URLs
		1. http://www.mercadolibre.com
		2. http://mercadolibre.com/
		3. http://mercadolibre.com:8080?hola=
		4. http://mercadolibre.com/pepe
		5. http://localhost:2020
		6. http://192.168.1.1
		7. http://192.168.1.1:9090
		8. www.mercadolibre.com
		9. /mercadolibre
		10. /mercadolibre/mercado
		11. /tooltip?siteId=MLA&categId=1744&buyingMode=buy_it_now&listingTypeId=bronze
		12. ./pepe
		13. ../../mercado/
		14. www.mercadolibre.com?siteId=MLA&categId=1744&buyingMode=buy_it_now&listingTypeId=bronze
		15. www.mercado-libre.com
		16. http://ui.ml.com:8080/ajax.html

		## Forbiden URLs
		1. http://
		2. http://www&
		3. http://hola=
		4. /../../mercado/
		5. /mercado/../pepe
		6. mercadolibre.com
		7. mercado/mercado
		8. localhost:8080/mercadolibre
		9. pepe/../pepe.html
		10. /pepe/../pepe.html
		11. 192.168.1.1
		12. localhost:8080/pepe
		13. localhost:80-80
		14. www.mercadolibre.com?siteId=MLA&categId=1744&buyi ngMode=buy_it_now&listingTypeId=bronze
		15. `<asd src="www.mercadolibre.com">`
		16. Mercadolibre.................
		17. /laksjdlkasjd../
		18. /..pepe..
		19. /pepe..
		20. pepe:/
		21. /:pepe
		22. dadadas.pepe
		23. qdasdasda
		24. http://ui.ml.com:8080:8080/ajax.html
		*/
		return ((/^(((https|http|ftp|file):\/\/)|www\.|\.\/|(\.\.\/)+|(\/{1,2})|(\d{1,3}\.){3}\d{1,3})(((\w+|-)(\.?)(\/?))+)(\:\d{1,5}){0,1}(((\w+|-)(\.?)(\/?)(#?))+)((\?)(\w+=(\w?)+(&?))+)?(\w+#\w+)?$/).test(url));
	};

	/**
	 * Adds CSS rules to disable text selection highlighting.
	 * @name avoidTextSelection
	 * @methodOf ch.util
	 * @param {Object} Selector1 The HTMLElements to disable text selection highlighting.
	 * @param {Object} [Selector2] The HTMLElements to disable text selection highlighting.
	 * @param {Object} [SelectorN] The HTMLElements to disable text selection highlighting.
	 */
	util.avoidTextSelection = function () {
		var args = arguments;

		if (arguments.length < 1) {
			throw new Error('"ch.util.avoidTextSelection(selector)": The selector parameter is required.');
		}

		$.each(args, function(i, $arg){

			if (!($arg instanceof $)) {
				throw new Error('"ch.util.avoidTextSelection(selector)": The parameter must be a query selector.');
			}

			if ($.browser.msie) {
				$arg.attr('unselectable', 'on');
			} else if ($.browser.opera) {
				$arg.bind('mousedown', function () { return false; });
			} else {
				$arg.addClass('ch-user-no-select');
			};
		});
	};

	/**
	 * Gives the final used values of all the CSS properties of an element.
	 * @name getStyles
	 * @methodOf ch.util
	 * @param {object} el The HTMLElement for which to get the computed style.
	 * @param {string} prop The name of the CSS property to test.
	 * @returns {CSSStyleDeclaration}
	 * @see Based on: <a href="http://www.quirksmode.org/dom/getstyles.html" target="_blank">http://www.quirksmode.org/dom/getstyles.html</a>
	 */
	util.getStyles = function (el, prop) {

		if (el === undefined || !(el.nodeType === 1)) {
			throw new Error('"ch.util.getStyles(el, prop)": The "el" parameter is required and must be a HTMLElement.');
		}

		if (prop === undefined || typeof prop !== 'string') {
			throw new Error('"ch.util.getStyles(el, prop)": The "prop" parameter is required and must be a string.');
		}

		if (window.getComputedStyle) {
			return window.getComputedStyle(el, "").getPropertyValue(prop);
		// IE
		} else {
			// Turn style name into camel notation
			prop = prop.replace(/\-(\w)/g, function (str, $1) { return $1.toUpperCase(); });
			return el.currentStyle[prop];
		}
	};

	/**
	 * Returns a boolean indicating whether the string is a HTML tag.
	 * @name isTag
	 * @methodOf ch.util
	 * @param {String} tag The name of the tag to be checked.
	 * @returns {Boolean}
	 */
	util.isTag = function (tag) {
		if (tag === undefined || typeof tag !== 'string') {
			return false;
		}

		return (/<([\w:]+)/).test(tag);
	};

	/**
	 * Returns a boolean indicating whether the string is a CSS selector.
	 * @name isSelector
	 * @methodOf ch.util
	 * @param {String} selector The selector to be checked.
	 * @returns {Boolean}
	 */
	util.isSelector = function (selector) {
		if (selector === undefined || typeof selector !== 'string') {
			return false;
		}

		var regex;
		for (regex in $.expr.match) {
			if ($.expr.match[regex].test(selector) && !util.isTag(selector)) {
				return true;
			};
		};
		return false;
	};

	/**
	 * Returns a shallow-copied clone of the object.
	 * @name clone
	 * @methodOf ch.util
	 * @param {Object} obj The object to copy.
	 * @returns {Object}
	 */
	util.clone = function (obj) {
		if (obj === undefined || typeof obj !== 'object') {
			throw new Error('"ch.util.clone(obj)": The "obj" parameter is required and must be a object.');
		}
		var copy = {},
			prop;

		for (prop in obj) {
			if (util.hasOwn(obj, prop)) {
				copy[prop] = obj[prop];
			}
		}
		return copy;
	};

	/**
	 * Inherits the prototype methods from one constructor into another. The parent will be accessible through the obj.super property.
	 * @name inherits
	 * @methodOf ch.util
	 * @param {Function} obj The object that have new members.
	 * @param {Function} superConstructor The construsctor Class.
	 * @returns {Object}
	 * @exampleDescription
	 * @example
	 * inherit(obj, parent);
	 */
	util.inherits = function (obj, superConstructor) {

		if (obj === undefined || typeof obj !== 'function') {
			throw new Error('"ch.util.inherits(obj, superConstructor)": The "obj" parameter is required and must be a constructor function.');
		}
		if (superConstructor === undefined || typeof superConstructor !== 'function') {
			throw new Error('"ch.util.inherits(obj, superConstructor)": The "superConstructor" parameter is required and must be a constructor function.');
		}

		var child = obj.prototype || {};
		obj.prototype = $.extend(child, superConstructor.prototype);
		obj.prototype.uber = superConstructor.prototype;

		/*var fn = function () {};
		fn.prototype = superConstructor.prototype;
		obj.prototype = new fn();
		obj.prototype.constructor = obj;*/
	};

	/**
	 * Uses a spesific class or collecton of classes
	 * @name use
	 * @methodOf ch.util
	 * @param {Object} obj The object that have new members.
	 * @param {Function} deps The dependecies objects.
	 * @returns {Object}
	 * @exampleDescription
	 * @example
	 * use(obj, [foo, bar]);
	 */
	util.use = function (obj, deps) {
		if (obj === undefined) {
			throw new Error('"ch.util.use(obj, deps)": The "obj" parameter is required and must be an object or constructor function.');
		}

		if (deps === undefined) {
			throw new Error('"ch.util.use(obj, deps)": The "deps" parameter is required and must be a function or collection.');
		}

		var context = obj.prototype
			deps = (util.isArray(deps)) ? deps : [deps];

		$.each(deps, function (i, dep) {
			dep.call(context);
		});

	};

	/**
	 * Prevent propagation and default actions.
	 * @name prevent
	 * @methodOf ch.util
	 * @param {Event} event The event ot be prevented.
	 * @returns {Object}
	 */
	util.prevent = function (event) {

		if (typeof event === 'object') {
			event.preventDefault();
			event.stopPropagation();
		}
	};

	/**
	 * Reference to the vendor prefix of the current browser.
	 * @name VENDOR_PREFIX
	 * @constant
	 * @methodOf ch.util
	 * @type {String}
	 * @see <a href="http://lea.verou.me/2009/02/find-the-vendor-prefix-of-the-current-browser/" target="_blank">http://lea.verou.me/2009/02/find-the-vendor-prefix-of-the-current-browser/</a>
	 */
	util.VENDOR_PREFIX = (function () {

		var regex = /^(Webkit|Khtml|Moz|ms|O)(?=[A-Z])/,
			styleDeclaration = document.getElementsByTagName('script')[0].style,
			prop;

		for (prop in styleDeclaration) {
			if (regex.test(prop)) {
				return prop.match(regex)[0].toLowerCase();
			}
		}

		// Nothing found so far? Webkit does not enumerate over the CSS properties of the style object.
		// However (prop in style) returns the correct value, so we'll have to test for
		// the precence of a specific property
		if ('WebkitOpacity' in styleDeclaration) { return 'webkit'; }
		if ('KhtmlOpacity' in styleDeclaration) { return 'khtml'; }

		return '';
	}());

	/**
	 * zIndex values.
	 * name zIndex
	 * @methodOf ch.util
	 * @type {Number}
	 */
	util.zIndex = 1000;

	ch.util = util;
}());

(function () {
	/**
	 * Global events reference.
	 * @name ch.events
	 * @namespace
	 */
	var events = {};

	/**
	 * Layout events collection.
	 * @name layout
	 * @namespace
	 * @memberOf ch.events
	 */
	events.layout = {};

	/**
	 * Every time Chico-UI needs to inform all visual components that layout has been changed, it emits this event.
	 * @name CHANGE
	 * @constant
	 * @memberOf ch.events.layout
	 * @type {String}
	 */
	events.layout.CHANGE = 'change';

	/**
	 * Viewport events collection.
	 * @name viewport
	 * @namespace
	 * @memberOf ch.events
	 */
	events.viewport = {};

	/**
	 * Every time Chico UI needs to inform all visual components that window has been scrolled or resized, it emits this event.
	 * @name CHANGE
	 * @constant
	 * @memberOf ch.events.viewport
	 * @type {String}
	 * @see ch.Positioner
	 */
	events.viewport.CHANGE = 'change';

	ch.events = events;
}());

(function () {

	$.extend(ch.events, {
		/**
		 * Keryboard event collection.
		 * @name key
		 * @namespace
		 * @memberOf ch.events
		 */
		'key': {

			/**
			 * Enter key event.
			 * @name ENTER
			 * @constant
			 * @memberOf ch.events.key
			 * @type {String}
			 */
			'ENTER': 'enter',

			/**
			 * Esc key event.
			 * @name ESC
			 * @constant
			 * @memberOf ch.events.key
			 * @type {String}
			 */
			'ESC': 'esc',

			/**
			 * Left arrow key event.
			 * @name LEFT_ARROW
			 * @constant
			 * @memberOf ch.events.key
			 * @type {String}
			 */
			'LEFT_ARROW': 'left_arrow',

			/**
			 * Up arrow key event.
			 * @name UP_ARROW
			 * @constant
			 * @memberOf ch.events.key
			 * @type {String}
			 */
			'UP_ARROW': 'up_arrow',

			/**
			 * Rigth arrow key event.
			 * @name RIGHT_ARROW
			 * @constant
			 * @memberOf ch.events.key
			 * @type {String}
			 */
			'RIGHT_ARROW': 'right_arrow',

			/**
			 * Down arrow key event.
			 * @name DOWN_ARROW
			 * @constant
			 * @memberOf ch.events.key
			 * @type {String}
			 */
			'DOWN_ARROW': 'down_arrow',

			/**
			 * Backspace key event.
			 * @name BACKSPACE
			 * @constant
			 * @memberOf ch.events.key
			 * @type {String}
			 */
			'BACKSPACE': 'backspace'
		}

	});

}());

(function () {
	/**
	 * Returns a data object with features supported by the device
	 * @name ch.support
	 * @namespace
	 */
	var support = {};

	/**
	 * Verify that CSS Transitions are supported (or any of its browser-specific implementations).
	 * @name transition
	 * @memberOf ch.support
	 * @type {Boolean}
	 * @see <a href="http://gist.github.com/373874" target="_blank">http://gist.github.com/373874</a>
	 */
	support.transition = body.style.WebkitTransition !== undefined || body.style.MozTransition !== undefined || body.style.MSTransition !== undefined || body.style.OTransition !== undefined || body.style.transition !== undefined;

	/**
	 * Boolean property that indicates if CSS "Fixed" positioning are supported by the device.
	 * @name fixed
	 * @memberOf ch.support
	 * @type {Boolean}
	 * @see <a href="http://kangax.github.com/cft/#IS_POSITION_FIXED_SUPPORTED" target="_blank">http://kangax.github.com/cft/#IS_POSITION_FIXED_SUPPORTED</a>
	 */
	support.fixed = (function () {

		// Flag to know if position is supported
		var isSupported = false,
		// Create an element to test
			el = document.createElement("div");

		// Set the position fixed
		el.style.position = "fixed";
		// Set a top
		el.style.top = "10px";

		// Add element to DOM
		body.appendChild(el);

		// Compare setted offset with "in DOM" offset of element
		isSupported = (el.offsetTop === 10);

		// Delete element from DOM
		body.removeChild(el);

		// Results
		return isSupported;
	}());

	ch.support = support;
}());

(function () {

	var util = ch.util,
		events = ch.events;

	/**
	 * Map with references to key codes.
	 * @private
	 * @name ch.Keyboard#codeMap
	 * @type object
	 */
	var codeMap = {
		"13": "ENTER",
		"27": "ESC",
		"37": "LEFT_ARROW",
		"38": "UP_ARROW",
		"39": "RIGHT_ARROW",
		"40": "DOWN_ARROW",
		 "8": "BACKSPACE"
	};

	/**
	 * Keyboard event controller utility to know wich keys are begin.
	 * @name Keyboard
	 * @class Keyboard
	 * @memberOf ch
	 * @param event
	 */
	function keyboard(event) {
		var keyCode = event.keyCode.toString();

		// Check for event existency on the map
		if(!util.hasOwn(codeMap, keyCode)) { return; }

		// Trigger custom event with original event as second parameter
		$document.trigger(events.key[codeMap[keyCode]], event);
	}

	ch.keyboard = keyboard;
}());

(function () {
	/**
	 * Reference to determine what "options" member should be created using the type of parameter that is received through the $-plugin.
	 * @namespace
	 */
	// TODO: This should be in the init() method of each widget
	var map = {
		/**
		 * When a type String is received, an options.content should be created.
		 * @memberOf map
		 * @type {String}
		 */
		'string': 'content',
		/**
		 * When a type Object and instance of $ is received, an options.content should be created.
		 * @memberOf map
		 * @type {String}
		 */
		'object': 'content',
		/**
		 * When a type Number is received, an options.num should be created.
		 * @memberOf map
		 * @type {String}
		 */
		'number': 'num',
		/**
		 * When a type Function is received, an options.fn should be created.
		 * @memberOf map
		 * @type {String}
		 */
		'function': 'fn'
	};

	/**
	 * Method in change of expose a friendly interface of the Chico constructors.
	 * @methodOf ch
	 * @param {Object} Klass Direct reference to the constructor from where the $-plugin will be created.
	 * @see <a href="http://docs.jquery.com/Plugins/Authoring" target="_blank">http://docs.jquery.com/Plugins/Authoring</a>
	 */
	function factory(Klass) {
		/**
		 * Identification of the constructor, in lowercases.
		 * @type {String}
		 */
		var name = Klass.prototype.name,
			/**
			 * Reference to the class name. When it's a interface, take its constructor name via the "interface" property.
			 * @type {String}
			 */
			constructorName = Klass.prototype['interface'] || name;

		/**
		 * The class constructor exposed directly into the "ch" namespace.
		 * @exampleDescription Creating a widget instance by specifying a query selector and a configuration object.
		 * @example
		 * ch.Widget($('#example'), {
		 *     'key': 'value'
		 * });
		 */
		// Uses the function.name property (non-standard) on the newest browsers OR
		// uppercases the first letter from the identification name of the constructor
		ch[(name.charAt(0).toUpperCase() + name.substr(1))] = Klass;

		/**
		 * The class constructor exposed into the "$" namespace.
		 * @exampleDescription Creating a widget instance by specifying a query selector and a configuration object.
		 * @example
		 * $.widget($('#example'), {
		 *     'key': 'value'
		 * });
		 * @exampleDescription Creating a widget instance by specifying only a query selector. The default options of each widget will be used.
		 * @example
		 * $.widget($('#example')});
		 * @exampleDescription Creating a widget instance by specifying only a cofiguration object. It only works on compatible widgets, when those doesn't depends on a element to be created.
		 * @example
		 * $.widget({
		 *     'key': 'value'
		 * });
		 * @exampleDescription Creating a widget instance by no specifying parameters. It only works on compatible widgets, when those doesn't depends on a element to be created. The default options of each widget will be used.
		 * @example
		 * $.widget();
		 */
		$[name] = function ($el, options) {
			// When exists only the first parameter containing the options object
			// ($.widget({'key': 'value'})), then accommodate the resources
			// TODO: This should be in the init() method of each widget
			if (options === undefined && typeof $el === 'object') {
				options = $el;
				$el = undefined;
			}
			// Create a new instance of the constructor and return it
			return new Klass($el, options);
		};

		/**
		 * The class constructor exposed as a "$" plugin.
		 * @exampleDescription Creating a widget instance by specifying only a cofiguration object.
		 * @example
		 * $('#example').widget({
		 *     'key': 'value'
		 * });
		 * @exampleDescription Creating a widget instance by specifying only a query selector as parameter. It will be into the "options" object as "content".
		 * @example
		 * $('#example').widget($('#anotherElement'));
		 * @exampleDescription Creating a widget instance by specifying only a string parameter. It will be into the "options" object as "content".
		 * @example
		 * $('#example').widget('A string parameter');
		 * @exampleDescription Creating a widget instance by specifying only a numeric parameter. It will be into the "options" object as "num".
		 * @example
		 * $('#example').widget(123);
		 * @exampleDescription Creating a widget instance by specifying a numeric parameter followed by a string parameter. These will be into the "options" object as "num" and "content" respectively.
		 * @example
		 * $('#example').widget(123, 'A string parameter');
		 * @exampleDescription Creating a widget instance by specifying only a function as parameter. It will be into the "options" object as "fn".
		 * @example
		 * $('#example').widget(function () { ... });
		 * @exampleDescription Creating a widget instance by specifying a function followed by a string parameter. These will be into the "options" object as "fn" and "content" respectively.
		 * @example
		 * $('#example').widget(function () { ... }, 'A string parameter');
		 * @exampleDescription Creating a widget instance by no specifying parameters. The default options of each widget will be used.
		 * @example
		 * $('#example').widget();
		 */
		$.fn[name] = function (options) {
			// Collection with each instanced widget
			var widgets = [],
				// Each instance of the widget
				widget,
				// What kind of parameter is "options"
				type = typeof options;

			// Put the specified parameters into corresponding options object
			// when the "options" parameter is not the configuration object or
			// it's a query selector
			// TODO: This should be in the init() method of each widget
			if ((options !== undefined && type !== 'object') || options instanceof $) {
				// Grab temporally the received parameter
				var parameter = options,
					// Grab the second parameter
					content = arguments[1];
				// Empty "options" to use it as the real configuration object
				options = {};
				// Put the received parameter into options object with correspondig name getted from the map
				options[map[type]] = parameter;

				// Could have a content as a second argument when it receives a string or a query selector
				if (typeof content === 'string' || content instanceof $) {
					options.content = content;
				}
			}

			// Analize every match of the main query selector
			$.each(this, function (i, el) {
				// Get into the "$" scope
				var $el = $(el),
					// Try to get the "data" reference to this widget related to the element
					data = $el.data(constructorName);

				// When this widget isn't related to the element via data, create a new instance and save
				if (!data) {
					// Create a new instance of the widget
					widget = new Klass($el, options);
					// Save the reference to this instance into the element data
					$el.data(constructorName, widget);
				// When this widget is related to the element via data, return it
				} else {
					// Get the data as the widget itself
					widget = data;
					// By dispatching an event, widgets can know when it already exists
					if (ch.util.hasOwn(widget, 'trigger')) {
						widget.trigger('exists', {
							'type': name,
							'options': options
						});
					}
				}

				// Add the widget reference to the final collection
				widgets.push(widget);
			});

			// Return the instance/instances of widgets
			return ((widgets.length > 1) ? widgets : widgets[0]);
		};
	}

	// Export
	ch.factory = factory;
}());

(function () {

	/**
	 * Exposes all widget's instances into the ch.instances object.
	 * @returns {Object} ch
	 */
	function debug () {
		ch.instances = instances;
		return ch;
	}

	ch.instances = instances;

	ch.debug = debug;
}());

/**
 * Core constructor function.
 * @private
 */
(function init() {
	// unmark the no-js flag on html tag
	$html.removeClass('no-js');
	// TODO: This should be on keyboard controller.
	$document.bind('keydown', function(event){ ch.keyboard(event); });
}());

ch.version = '0.12.2';


	window.ch = ch;
})(this, jQuery);

(function ($, ch) {
	'use strict';

	// Initial options to be merged with the user's options
	var defaults = {
		'method': 'GET',
		'params': '',
		'cache': true,
		'async': true
	};

	/**
	 * Creates a component to manage content through 3 ways: plain text, DOM elements, AJAX requests.
	 * @memberOf ch
	 * @class ch.Content
	 * @require ch.cache
	 * @returns {Object}
	 */
	function Content() {

		var that = this,
			// Merged options of each instance
			options,
			// The lastest data sent to the client. Used to return on the .get() method
			current = 'Chico Error: Content is not defined.',
			/**
			 * Allows to manage the widgets content.
			 * @namespace
			 */
			content = {};

		/**
		 * Send the result data to the "client".
		 * @private
		 */
		function postMessage(data) {
			// Update the lastest reference of data sent to the user
			content.onmessage(current = data);
			// TODO: Trigger the "message" event to allow multiple suscription
			// that.trigger('message', data)
		}

		/**
		 * Serves data from cache or AJAX.
		 * @private
		 */
		function getContentFromAJAX() {

			// When exists posibilities of find something saved into ch.cache...
			if (options.cache) {
				// Try to get data from cache
				var cached = ch.cache.get(options.input);
				// If there are data, then send to the client and avoid the AJAX request
				if (cached) { return postMessage(cached); }
			}

			$.ajax({
				'url': options.input,
				'type': options.method,
				'data': 'x=x' + ((options.params !== '') ? '&' + options.params : ''),
				'cache': options.cache,
				'async': options.async,
				'beforeSend': function (jqXHR) {
					// Set the AJAX default HTTP headers
					jqXHR.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
				},
				'success': function (data) {
					// Grab the data on the cache if it's necessary
					if (options.cache) { ch.cache.set(options.input, data); }
					// Send the result data to the client
					postMessage(data);
				},
				'error': function (jqXHR, textStatus, errorThrown) {
					// Grab all the parameters into a JSON to send to the client
					var data = {
						'jqXHR': jqXHR,
						'textStatus': textStatus,
						'errorThrown': errorThrown
					};
					// Send a defined error message
					postMessage('<p>Error on ajax call.</p>');
					// Execute the 'onerror' method if exists
					if (ch.util.hasOwn(content, 'onerror')) {
						content.onerror(data);
					}
					// TODO: Trigger the "error" event to allow multiple suscription
					//that.trigger('error', data);
				}
			});
		}

		/**
		 * Merges the current options with the options specified by user.
		 * @name configure
		 * @methodOf content
		 * @param {Object} userOptions Options specified by user.
		 */
		content.configure = function (userOptions) {
			// Merge the defaults options with user options
			options = $.extend(userOptions, defaults);
			// Since second time, just merge the current options with user options
			content.configure = function (userOptions) {

				// Getter: return the current configuration (options)
				if (userOptions === undefined) {
					return options;
				}

				// Setter: Merge current options with the new ones
				$.extend(options, userOptions);

				return content;
			};

			return content;
		};

		/**
		 * Determines what kind of input have to use, and send to client plain text, DOM element or the result of an AJAX request.
		 * @name set
		 * @methodOf content
		 */
		content.set = function (userOptions) {

			if (userOptions !== undefined) {
				content.configure(userOptions);
			}

			// Input as string
			if (typeof options.input === 'string') {
				// Case 1: AJAX call
				if (ch.util.isUrl(options.input)) {
					getContentFromAJAX();
				// Case 2: Plain text
				} else {
					postMessage(options.input);
				}
			// Case 3: DOM element
			} else if (options.input instanceof $) {
				postMessage(options.input.detach().removeClass('ch-hide'));
			// Default: No message
			} else {
				postMessage(current);
			}

			return content;
		};

		/**
		 * Returns the last updated content.
		 * @name get
		 * @methodOf content
		 */
		content.get = function () {
			return current;
		};

		that.content = content;
	}

	ch.Content = Content;

}(this.jQuery, this.ch));

/**
 * Cache control utility.
 * @name Cache
 * @class Cache
 * @memberOf ch
 */
(function (window, ch) {
	'use strict';

	if (ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	// Cache control utility.
	var cache = {};

	/**
	* Map of cached resources
	* @public
	* @name ch.Cache#map
	* @type object
	*/
	cache.map = {};

	/**
	* Set a resource to the cache control
	* @public
	* @function
	* @name ch.Cache#set
	* @param {string} url Resource location
	* @param {string} data Resource information
	*/
	cache.set = function (url, data) {
		cache.map[url] = data;
	};

	/**
	* Get a resource from the cache
	* @public
	* @function
	* @name ch.Cache#get
	* @param {string} url Resource location
	* @returns data Resource information
	*/
	cache.get = function (url) {
		return cache.map[url];
	};

	/**
	* Remove a resource from the cache
	* @public
	* @function
	* @name ch.Cache#rem
	* @param {string} url Resource location
	*/
	cache.rem = function (url) {
		cache.map[url] = null;
		delete cache.map[url];
	};

	/**
	* Clears the cache map
	* @public
	* @function
	* @name ch.Cache#flush
	*/
	cache.flush = function () {
		delete cache.map;
		cache.map = {};
	};

	ch.cache = cache;

}(this, this.ch));

/**
 * Viewport is a reference to position and size of the visible area of browser.
 * @name Viewport
 * @class Viewport
 * @standalone
 * @memberOf ch
 */
(function (window, $, ch) {
	'use strict';

	if (ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	var $window = $(window),
		// Viewport is a reference to position and size of the visible area of browser.
		viewport = {};

	/**
	 * Width of the visible area.
	 * @public
	 * @name ch.Viewport#width
	 * @type Number
	 */
	viewport.width = $window.width();

	/**
	 * Height of the visible area.
	 * @public
	 * @name ch.Viewport#height
	 * @type Number
	 */
	viewport.height = $window.height();

	/**
	 * Left offset of the visible area.
	 * @public
	 * @name ch.Viewport#left
	 * @type Number
	 */
	viewport.left = $window.scrollLeft();

	/**
	 * Top offset of the visible area.
	 * @public
	 * @name ch.Viewport#top
	 * @type Number
	 */
	viewport.top = $window.scrollTop();

	/**
	 * Right offset of the visible area.
	 * @public
	 * @name ch.Viewport#right
	 * @type Number
	 */
	viewport.right = $window.scrollLeft() + $window.width();

	/**
	 * Bottom offset of the visible area.
	 * @public
	 * @name ch.Viewport#bottom
	 * @type Number
	 */
	viewport.bottom = $window.scrollTop() + $window.height();

	/**
	 * Element representing the visible area.
	 * @public
	 * @name ch.Viewport#element
	 * @type Object
	 */
	viewport.element = $window;

	/**
	 * Updates width and height of the visible area and updates ch.viewport.width and ch.viewport.height
	 * @public
	 * @function
	 * @name ch.Viewport#getSize
	 * @returns Object
	 */
	viewport.getSize = function () {

		return {
			"width": ch.viewport.width = $window.width(),
			"height": ch.viewport.height = $window.height()
		};
	};

	/**
	 * Updates left, top, right and bottom coordinates of the visible area, relative to the window.
	 * @public
	 * @function
	 * @name ch.Viewport#getPosition
	 * @returns Object
	 */
	viewport.getPosition = function () {

		var size = viewport.getSize();

		return {
			"left": 0,
			"top": 0,
			"right": size.width,
			"bottom": size.height,
			// Size is for use as context on Positioner
			// (see getCoordinates method on Positioner)
			"width": size.width,
			"height": size.height
		};
	};

	/**
	 * Updates left, top, right and bottom coordinates of the visible area, relative to the document.
	 * @public
	 * @function
	 * @name ch.Viewport#getOffset
	 * @returns Object
	 */
	viewport.getOffset = function () {

		var position = viewport.getPosition(),
			scrollLeft = $window.scrollLeft(),
			scrollTop = $window.scrollTop();

		return {
			"left": ch.viewport.left = scrollLeft,
			"top": ch.viewport.top = scrollTop,
			"right": ch.viewport.right = scrollLeft + position.right,
			"bottom": ch.viewport.bottom = scrollTop + position.bottom
		};
	};

	ch.viewport = viewport;

}(this, this.jQuery, this.ch));

/**
* Positioner lets you centralize and manage changes related to positioned elements. Positioner returns an utility that resolves positioning for all widget.
* @name Positioner
* @class Positioner
* @memberOf ch
* @param {Object} conf Configuration object with positioning properties.
* @param {String} conf.element Reference to the DOM Element to be positioned.
* @param {String} [conf.context] It's a reference to position and size of element that will be considered to carry out the position. If it isn't defined through configuration, it will be the viewport.
* @param {String} [conf.points] Points where element will be positioned, specified by configuration or centered by default.
* @param {String} [conf.offset] Offset in pixels that element will be displaced from original position determined by points. It's specified by configuration or zero by default.
* @param {Boolean} [conf.reposition] Parameter that enables or disables reposition intelligence. It's disabled by default.
* @requires ch.Viewport
* @see ch.Viewport
* @returns {Function} The Positioner returns a Function that it works in 3 ways: as a setter, as a getter and with the "refresh" parameter refreshes the position.
* @exampleDescription
* Instance the Positioner It requires a little configuration.
* The default behavior place an element centered into the Viewport.
*
* @example
* var positioned = ch.positioner({
*     element: "#element1",
* });
* @exampleDescription 1. Getting the current configuration properties.
* @example
* var configuration = positioned()
* @exampleDescription 2. Updates the current position with <code>refresh</code> as a parameter.
* @example
* positioned("refresh");
* @exampleDescription 3. Define a new position
* @example
* positioned({
*     element: "#element2",
*     context: "#context2",
*     points: "lt rt"
* });
* @exampleDescription <strong>Offset</strong>: The positioner could be configurated with an offset.
* This example show an element displaced horizontally by 10px of defined position.
* @example
* var positioned = ch.positioner({
*     element: "#element3",
*     context: "#context3",
*     points: "lt rt",
*     offset: "10 0"
* });
* @exampleDescription <strong>Reposition</strong>: Repositionable feature moves the postioned element if it can be shown into the viewport.
* @example
* var positioned = ch.positioner({
*     element: "#element4",
*     context: "#context4",
*     points: "lt rt",
*     reposition: true
* });
*/

(function (window, $, ch) {
	'use strict';

	if (ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	var $window = $(window),
		parseInt = window.parseInt;

	/**
	 * Converts points in className.
	 * @private
	 * @name ch.Positioner#classNamePoints
	 * @function
	 * @returns String
	 */
	var classNamePoints = function (points) {
		return "ch-points-" + points.replace(" ", "");
	},

	/**
	 * Reference that allows to know when window is being scrolled or resized.
	 * @private
	 * @name ch.Positioner#changing
	 * @type Boolean
	 */
		changing = false,

	/**
	 * Checks if window is being scrolled or resized, updates viewport position and triggers internal Change event.
	 * @private
	 * @name ch.Positioner#triggerScroll
	 * @function
	 */
		triggerChange = function () {
			// No changing, no execution
			if (!changing) { return; }

			// Updates viewport position
			ch.viewport.getOffset();

			/**
			 * Triggers when window is being scrolled or resized.
			 * @private
			 * @name ch.Positioner#change
			 * @event
			 */
			$window.trigger(ch.events.viewport.CHANGE);

			// Change scrolling status
			changing = false;
		};

	// Resize and Scroll events binding. These updates respectives boolean variables
	$window.bind("resize scroll", function () { changing = true; });

	// Interval that checks for resizing status and triggers specific events
	window.setInterval(triggerChange, 350);

	// Returns Positioner Abstract Component
	function Positioner(conf) {

		// Validation for required "element" parameter
		if (!ch.util.hasOwn(conf, "element")) {
			throw new window.Error('Chico UI error: Expected to find \"element\" as required configuration parameter of ch.Positioner.');

			return;
		}

		/**
		 * Configuration parameter that enables or disables reposition intelligence. It's disabled by default.
		 * @private
		 * @name ch.Positioner#reposition
		 * @type Boolean
		 * @default false
		 * @exampleDescription Repositionable Element if it can't be shown into viewport area
		 * @example
		 * ch.positioner({
		 *     element: "#element1",
		 *     reposition: true
		 * });
		 */
		conf.reposition = conf.reposition || false;

		/**
		 * Reference that saves all members to be published.
		 * @private
		 * @name ch.Positioner#that
		 * @type Object
		 */
		var that = {},

		/**
		 * Reference to the DOM Element to be positioned.
		 * @private
		 * @name ch.Positioner#$element
		 * @type jQuery Object
		 */
			$element = $(conf.element),

		/**
		 * Points where element will be positioned, specified by configuration or centered by default.
		 * @private
		 * @name ch.Positioner#points
		 * @type String
		 * @default "cm cm"
		 * @exampleDescription Element left-top point = Context right-bottom point
		 * @example
		 * ch.positioner({
		 *     element: "#element1",
		 *     points: "lt rt"
		 * });
		 * @exampleDescription Element center-middle point = Context center-middle point
		 * @example
		 * ch.positioner({
		 *     element: "#element2",
		 *     points: "cm cm"
		 * });
		 */
			points = conf.points || "cm cm",

		/**
		 * Offset in pixels that element will be displaced from original position determined by points. It's specified by configuration or zero by default.
		 * @private
		 * @name ch.Positioner#offset
		 * @type {Array} X and Y references determined by "offset" configuration parameter.
		 * @default "0 0"
		 * @exampleDescription Moves 5px to right and 5px to bottom
		 * @example
		 * ch.positioner({
		 *     element: "#element1",
		 *     offset: "5 5"
		 * });
		 * @exampleDescription It will be worth:
		 * @example
		 * offset[0] = 5;
		 * offset[1] = 5;
		 * @exampleDescription Moves 10px to right and 5px to top
		 * @example
		 * ch.positioner({
		 *     element: "#element1",
		 *     offset: "10 -5"
		 * });
		 * @exampleDescription It will be worth:
		 * @example It will be worth:
		 * offset[0] = 10;
		 * offset[1] = -5;
		 */
			offset = (conf.offset || "0 0").split(" "),

		/**
		 * Defines context element, its size, position, and methods to recalculate all.
		 * @function
		 * @name ch.Positioner#getContext
		 * @returns Context Object
		 */
			getContext = function () {

				// Parse as Integer offset values
				offset[0] = parseInt(offset[0], 10);
				offset[1] = parseInt(offset[1], 10);

				// Context by default is viewport
				if (!ch.util.hasOwn(conf, "context") || !conf.context || conf.context === "viewport") {
					contextIsNotViewport = false;
					return ch.viewport;
				}

				// Context from configuration
				// Object to be returned.
				var self = {};

				/**
				 * Width of context.
				 * @private
				 * @name width
				 * @type Number
				 * @memberOf ch.Positioner#context
				 */
				self.width =

				/**
				 * Height of context.
				 * @private
				 * @name height
				 * @type Number
				 * @memberOf ch.Positioner#context
				 */
					self.height =

				/**
				 * Left offset of context.
				 * @private
				 * @name left
				 * @type Number
				 * @memberOf ch.Positioner#context
				 */
					self.left =

				/**
				 * Top offset of context.
				 * @private
				 * @name top
				 * @type Number
				 * @memberOf ch.Positioner#context
				 */
					self.top =

				/**
				 * Right offset of context.
				 * @private
				 * @name right
				 * @type Number
				 * @memberOf ch.Positioner#context
				 */
					self.right =

				/**
				 * Bottom offset of context.
				 * @private
				 * @name bottom
				 * @type Number
				 * @memberOf ch.Positioner#context
				 */
					self.bottom = 0;

				/**
				 * Context HTML Element.
				 * @private
				 * @name element
				 * @type HTMLElement
				 * @memberOf ch.Positioner#context
				 */
				self.element = $(conf.context);

				/**
				 * Recalculates width and height of context and updates size on context object.
				 * @private
				 * @function
				 * @name getSize
				 * @returns Object
				 * @memberOf ch.Positioner#context
				 */
				self.getSize = function () {

					return {
						"width": context.width = self.element.outerWidth(),
						"height": context.height = self.element.outerHeight()
					};

				};

				/**
				 * Recalculates left and top of context and updates offset on context object.
				 * @private
				 * @function
				 * @name getOffset
				 * @returns Object
				 * @memberOf ch.Positioner#context
				 */
				self.getOffset = function () {

					// Gets offset of context element
					var contextOffset = self.element.offset(),
						size = self.getSize(),
						scrollLeft = contextOffset.left, // + offset[0], // - relativeParent.left,
						scrollTop = contextOffset.top; // + offset[1]; // - relativeParent.top;

					if (!parentIsBody) {
						scrollLeft -= relativeParent.left,
						scrollTop -= relativeParent.top;
					}

					// Calculated including offset and relative parent positions
					return {
						"left": context.left = scrollLeft,
						"top": context.top = scrollTop,
						"right": context.right = scrollLeft + size.width,
						"bottom": context.bottom = scrollTop + size.height
					};
				};

				contextIsNotViewport = true;

				return self;
			},

		/**
		 * Reference that allows to know if context is different to viewport.
		 * @private
		 * @name ch.Positioner#contextIsNotViewport
		 * @type Boolean
		 */
			contextIsNotViewport,

		/**
		 * It's a reference to position and size of element that will be considered to carry out the position. If it isn't defined through configuration, it will be the viewport.
		 * @private
		 * @name ch.Positioner#context
		 * @type Object
		 * @default ch.Viewport
		 */
			context = getContext(),

		/**
		 * Reference to know if direct parent is the body HTML element.
		 * @private
		 * @name ch.Positioner#parentIsBody
		 * @type Boolean
		 */
			parentIsBody,

		/**
		 * It's the first of context's parents that is styled positioned. If it isn't defined through configuration, it will be the HTML Body Element.
		 * @private
		 * @name ch.Positioner#relativeParent
		 * @type Object
		 * @default HTMLBodyElement
		 */
			relativeParent = (function () {

				// Context's parent that's positioned.
				var element = (contextIsNotViewport) ? context.element.offsetParent()[0] : window.document.body,

				// Object to be returned.
					self = {};

				/**
				 * Left offset of relative parent.
				 * @private
				 * @name left
				 * @type Number
				 * @memberOf ch.Positioner#relativeParent
				 */
				self.left =

				/**
				 * Top offset of relative parent.
				 * @private
				 * @name top
				 * @type Number
				 * @memberOf ch.Positioner#relativeParent
				 */
					self.top = 0;

				/**
				 * Recalculates left and top of relative parent of context and updates offset on relativeParent object.
				 * @private
				 * @name getOffset
				 * @function
				 * @memberOf ch.Positioner#relativeParent
				 * @returns Offset Object
				 */
				// TODO: on ie6 the relativeParent border push too (also on old positioner)
				self.getOffset = function () {
					// If first parent relative is Body, don't recalculate position
					if (element.tagName === "BODY") { return; }

					// Offset of first parent relative
					var parentOffset = $(element).offset(),

					// Left border width of context's parent.
						borderLeft = parseInt(ch.util.getStyles(element, "border-left-width"), 10),

					// Top border width of context's parent.
						borderTop = parseInt(ch.util.getStyles(element, "border-top-width"), 10);

					// Returns left and top position of relative parent and updates offset on relativeParent object.
					return {
						"left": relativeParent.left = parentOffset.left + borderLeft,
						"top": relativeParent.top = parentOffset.top + borderTop
					};
				};

				return self;
			}()),

		/**
		 * Calculates left and top position from specific points.
		 * @private
		 * @name ch.Positioner#getCoordinates
		 * @function
		 * @param {String} points String with points to be calculated.
		 * @returns Offset measures
		 * @exampleDescription
		 * @example
		 * var foo = getCoordinates("lt rt");
		*
		 * foo = {
		 *     left: Number,
		 *     top: Number
		 * };
		 */
			getCoordinates = function (pts) {

				// Calculates left or top position from points related to specific axis (X or Y).
				// TODO: Complete cases: X -> lc, cl, rc, cr. Y -> tm, mt, bm, mb.
				var calculate = function (reference) {

					// Use Position or Offset of Viewport if position is fixed or absolute respectively
					var ctx = (!contextIsNotViewport && ch.support.fixed) ? ch.viewport.getPosition() : context,

					// Returnable value
						r;

					switch (reference) {
					// X references
					case "ll": r = ctx.left + offset[0]; break;
					case "lr": r = ctx.right + offset[0]; break;
					case "rl": r = ctx.left - $element.outerWidth() + offset[0]; break;
					case "rr": r = ctx.right - $element.outerWidth() + offset[0]; break;
					case "cc": r = ctx.left + (ctx.width / 2) - ($element.outerWidth() / 2) + offset[0]; break;
					// Y references
					case "tt": r = ctx.top + offset[1]; break;
					case "tb": r = ctx.bottom + offset[1]; break;
					case "bt": r = ctx.top - $element.outerHeight() + offset[1]; break;
					case "bb": r = ctx.bottom - $element.outerHeight() + offset[1]; break;
					case "mm": r = ctx.top + (ctx.height / 2) - ($element.outerHeight() / 2) + offset[1]; break;
					}

					return r;
				},

				// Splitted points
					splittedPoints = pts.split(" ");

				// Calculates left and top with references to X and Y axis points (crossed points)
				return {
					"left": calculate(splittedPoints[0].charAt(0) + splittedPoints[1].charAt(0)),
					"top": calculate(splittedPoints[0].charAt(1) + splittedPoints[1].charAt(1))
				};
			},

		/**
		 * Gets new coordinates and checks its space into viewport.
		 * @private
		 * @name ch.Positioner#getPosition
		 * @function
		 * @returns Offset measures
		 */
			getPosition = function () {

				// Gets coordinates from main points
				var coordinates = getCoordinates(points);

				// Update classPoints
				// TODO: Is this ok in this place?
				classPoints = classNamePoints(points);

				// Default behavior: returns left and top offset related to main points
				if (!conf.reposition) { return coordinates; }

				if (points !== "lt lb" && points !== "rt rb" && points !== "lt rt") { return coordinates; }

				// Intelligence
				// TODO: Improve and unify intelligence code
				var newData,
					newPoints = points,
					offsetX = /*relativeParent.left + */offset[0],
					offsetY = /*relativeParent.top + */offset[1];

				if (!parentIsBody) {
					offsetX += relativeParent.left;
					offsetY += relativeParent.top;
				}

				// Viewport limits (From bottom to top)
				if (coordinates.top + offsetY + $element.outerHeight() > ch.viewport.bottom && points !== "lt rt") {
					newPoints = newPoints.charAt(0) + "b " + newPoints.charAt(3) + "t";
					newData = getCoordinates(newPoints);

					newData.classPoints = classNamePoints(newPoints);

					if (newData.top + offsetY > ch.viewport.top) {
						coordinates.top = newData.top - (2 * offset[1]);
						coordinates.left = newData.left;
						classPoints = newData.classPoints;
					}
				}

				// Viewport limits (From right to left)
				if (coordinates.left + offsetX + $element.outerWidth() > ch.viewport.right) {
					// TODO: Improve this
					var orientation = (newPoints.charAt(0) === "r") ? "l" : "r";
					// TODO: Use splice or slice
					newPoints = orientation + newPoints.charAt(1) + " " + orientation + newPoints.charAt(4);

					newData = getCoordinates(newPoints);

					newData.classPoints = classNamePoints(newPoints);

					if (newData.left + offsetX > ch.viewport.left) {
						coordinates.top = newData.top;
						coordinates.left = newData.left - (2 * offset[0]);
						classPoints = newData.classPoints;
					}
				}

				// Returns left and top offset related to modified points
				return coordinates;
			},

		/**
		 * Reference that stores last changes on coordinates for evaluate necesaries redraws.
		 * @private
		 * @name ch.Positioner#lastCoordinates
		 * @type Object
		 */
			lastCoordinates = {},

		/**
		 * Checks if there are changes on coordinates to reposition the element.
		 * @private
		 * @name ch.Positioner#draw
		 * @function
		 */
			draw = function () {

				// New element position
				var coordinates,

					// Update classname related to position
					updateClassName = function ($element) {
						$element.removeClass(lastClassPoints).addClass(classPoints);
					};

				// Save the last className before calculate new points
				lastClassPoints = classPoints;

				// Gets definitive coordinates for element repositioning
				coordinates = getPosition();

				// Coordinates equal to last coordinates means that there aren't changes on position
				if (coordinates.left === lastCoordinates.left && coordinates.top === lastCoordinates.top) {
					return;
				}

				// If there are changes, it stores new coordinates on lastCoordinates
				lastCoordinates = coordinates;

				// Element reposition (Updates element position based on new coordinates)
				updateClassName($element.css({ "left": coordinates.left, "top": coordinates.top }));

				// Context class-names
				if (contextIsNotViewport) { updateClassName(context.element); }
			},

		/**
		 * Constructs a new position, gets viewport size, checks for relative parent's offset,
		 * finds the context and sets the position to a given element.
		 * @private
		 * @function
		 * @constructs
		 * @name ch.Positioner#init
		 */
			init = function () {
				// Calculates viewport position for prevent auto-scrolling
				//ch.viewport.getOffset();

				// Refresh parent parameter
				// TODO: Put this code in some better place, where it's been calculated few times
				parentIsBody = $element.parent().length > 0 && $element.parent().prop("tagName") === "BODY";

				// Calculates relative parent position
				relativeParent.getOffset();

				// If context isn't the viewport, calculates its position and size
				if (contextIsNotViewport) { context.getOffset(); }

				// Calculates coordinates and redraws if it's necessary
				draw();
			},

		/**
		 * Listen to LAYOUT.CHANGE and VIEWPORT.CHANGE events and recalculate data as needed.
		 * @private
		 * @function
		 * @name ch.Positioner#changesListener
		 */
			changesListener = function (event) {
				// Only recalculates if element is visible
				if (!$element.is(":visible")) { return; }

				// If context isn't the viewport...
				if (contextIsNotViewport) {
					// On resize and layout change, recalculates relative parent position
					relativeParent.getOffset();

					// Recalculates its position and size
					context.getOffset();
				}

				draw();
			},

		/**
		 * Position "element" as fixed or absolute as needed.
		 * @private
		 * @function
		 * @name ch.Positioner#addCSSproperties
		 */
			addCSSproperties = function () {

				// Fixed position behavior
				if (!contextIsNotViewport && ch.support.fixed) {

					// Sets position of element as fixed to avoid recalculations
					$element.css("position", "fixed");

					// Bind reposition only on resize
					$window.bind("resize", changesListener);

				// Absolute position behavior
				} else {

					// Sets position of element as absolute to allow continuous positioning
					$element.css("position", "absolute");

					// Bind reposition recalculations (scroll, resize and changeLayout)
					$window.bind(ch.events.viewport.CHANGE + " " + ch.events.layout.CHANGE, changesListener);
				}

			},

		/**
		 * Classname relative to position points.
		 * @private
		 * @name ch.Positioner#classPoints
		 * @type String
		 * @default "ch-points-cmcm"
		 */
			classPoints = classNamePoints(points),

		/**
		 * The last className before calculate new points.
		 * @private
		 * @name ch.Positioner#lastClassPoints
		 * @type string
		 */
			lastClassPoints = classPoints;

		/**
		 * Control object that allows to change configuration properties, refresh current position or get current configuration.
		 * @ignore
		 * @protected
		 * @name ch.Positioner#position
		 * @function
		 * @param {Object} [o] Configuration object.
		 * @param {String} ["refresh"] Refresh current position.
		 * @returns Control Object
		 * @exampleDescription Sets a new configuration
		 * @example
		 * var foo = ch.positioner({ ... });
		 * foo.position({ ... });
		 * @exampleDescription Refresh current position
		 * @example
		 * foo.position("refresh");
		 * @exampleDescription Gets current configuration properties
		 * @example
		 * foo.position();
		 */
		that.position = function (o) {

			var r = that;

			switch (typeof o) {

			// Changes configuration properties and repositions the element
			case "object":
				// New points
				if (ch.util.hasOwn(o, "points")) { points = o.points; }

				// New reposition
				if (ch.util.hasOwn(o, "reposition")) { conf.reposition = o.reposition; }

				// New offset (splitted)
				if (ch.util.hasOwn(o, "offset")) { offset = o.offset.split(" "); }

				// New context
				if (ch.util.hasOwn(o, "context")) {
					// Sets conf value
					conf.context = o.context;

					// Clear the conf.context variable
					if (o.context === "viewport") { conf.context = undefined; }

					// Regenerate the context object
					context = getContext();

					// Update CSS properties to element (position fixed or absolute)
					addCSSproperties();
				}

				// Reset
				init();

				break;

			// Refresh current position
			case "string":
				if (o !== "refresh") {
					window.alert("Chico UI error: expected to find \"refresh\" parameter on position() method of Positioner component.");
				}

				// Reset
				init();

				break;

			// Gets current configuration
			case "undefined":
			default:
				r = {
					"context": context.element,
					"element": $element,
					"points": points,
					"offset": offset.join(" "),
					"reposition": conf.reposition
				};

				break;
			}

			return r;
		};

		// Apply CSS properties to element (position fixed or absolute)
		addCSSproperties();

		// Inits positioning
		init();

		return that.position;
	}

	Positioner.prototype.name = 'positioner';
	Positioner.prototype.constructor = Positioner;

	ch.Positioner = Positioner;

}(this, this.jQuery, this.ch));

/**
 * OnImagesLoads executes a callback function when the images of a query selection loads.
 * @name onImagesLoads
 * @class onImagesLoads
 * @memberOf ch
 * @param callback function The function that the component will fire after the images load.
 * @returns jQuery
 * @factorized
 * @exampleDescription
 * @example
 * $("img").onImagesLoads(callback);
 */
(function (window, $, ch) {
	'use strict';

	if (ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function OnImagesLoads($el, conf) {

		/**
		 * Reference to a internal component instance, saves all the information and configuration properties.
		 * @private
		 * @name ch.onImagesLoads#that
		 * @type object
		 */
		var that = this;
		that.$element = $el;
		that.element = $el[0];
		that.type = 'onImagesLoads';
		conf = conf || {};

		conf = ch.util.clone(conf);
		that.conf = conf;

		that.$element
			// On load event
			.one("load", function () {
				window.setTimeout(function () {
					if (--that.$element.length <= 0) {
						that.conf.fn.call(that.$element, this);
					}
				}, 200);
			})
			// For each image
			.each(function () {
				// Cached images don't fire load sometimes, so we reset src.
				if (this.complete || this.complete === undefined) {
					var src = this.src;

					// Data uri fix bug in web-kit browsers
					this.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
					this.src = src;
				}
			});

		return that;
	}

	OnImagesLoads.prototype.name = 'onImagesLoads';
	OnImagesLoads.prototype.constructor = OnImagesLoads;

	ch.factory(OnImagesLoads);

}(this, this.jQuery, this.ch));

/**
* Represents the abstract class of all widgets.
* @abstract
* @name Widget
* @class Widget
* @memberOf ch
*/
(function (window, $, ch) {
	'use strict';

	if (ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	/**
	 * Global instantiation widget id.
	 * @private
	 * @type {Number}
	 */
	var uid = 0;


	function Widget() {

		/**
		 * Reference to a internal component instance, saves all the information and configuration properties.
		 * @private
		 * @name ch.Widget#that
		 * @type object
		 */
		var that = this;

		var conf = that.conf;

	/**
	 * Public Members
	 */

		/**
		 * This method will be deprecated soon. Triggers a specific callback inside component's context.
		 * @name ch.Widget#callbacks
		 * @function
		 * @protected
		 */
		// TODO: Add examples!!!
		that.callbacks = function (when, data) {
			if( ch.util.hasOwn(conf, when) ) {
				var context = ( that.controller ) ? that.controller["public"] : that["public"];
				return conf[when].call( context, data );
			};
		};


		// Triggers a specific event within the component public context.
		that.trigger = function (event, data) {
			$(that["public"]).trigger("ch-"+event, data);
		};

		// Add a callback function from specific event.
		that.on = function (event, handler) {
			if (event && handler) {
				$(that["public"]).bind("ch-"+event, handler);
			}
			return that["public"];
		};

		// Add a callback function from specific event that it will execute once.
		that.once = function (event, handler) {

			if (event && handler) {
				$(that["public"]).one("ch-"+event, handler);
			}

			return that["public"];
		};


		// Removes a callback function from specific event.
		that.off = function (event, handler) {
			if (event && handler) {
				$(that["public"]).unbind("ch-"+event, handler);
			} else if (event) {
				$(that["public"]).unbind("ch-"+event);
			}
			return that["public"];
		};

		/**
		 * Component's public scope. In this scope you will find all public members.
		 */
		that["public"] = {};

		/**
		 * The 'uid' is the Chico's unique instance identifier. Every instance has a different 'uid' property. You can see its value by reading the 'uid' property on any public instance.
		 * @public
		 * @name ch.Widget#uid
		 * @type number
		 */
		that["public"].uid = that.uid = (uid += 1);

		/**
		 * Reference to a DOM Element. This binding between the component and the HTMLElement, defines context where the component will be executed. Also is usual that this element triggers the component default behavior.
		 * @public
		 * @name ch.Widget#element
		 * @type HTMLElement
		 */
		that["public"].element = that.element;

		/**
		 * This public property defines the component type. All instances are saved into a 'map', grouped by its type. You can reach for any or all of the components from a specific type with 'ch.instances'.
		 * @public
		 * @name ch.Widget#type
		 * @type string
		 */
		that["public"].type = that.type;

		/**
		 * Triggers a specific event within the component public context.
		 * @name trigger
		 * @name ch.Widget
		 * @public
		 * @param {string} event The event name you want to trigger.
		 * @since 0.7.1
		 */
		that["public"].trigger = that.trigger;

		/**
		 * Add a callback function from specific event.
		 * @public
		 * @name ch.Widget#on
		 * @function
		 * @param {string} event Event nawidget.
		 * @param {function} handler Handler function.
		 * @returns itself
		 * @since version 0.7.1
		 * @exampleDescription Will add a event handler to the "ready" event
		 * @example
		 * widget.on("ready", startDoingStuff);
		 */
		that["public"].on = that.on;

		/**
		 * Add a callback function from specific event that it will execute once.
		 * @public
		 * @name ch.Widget#once
		 * @function
		 * @param {string} event Event nawidget.
		 * @param {function} handler Handler function.
		 * @returns itself
		 * @since version 0.8.0
		 * @exampleDescription Will add a event handler to the "contentLoad" event once
		 * @example
		 * widget.once("contentLoad", startDoingStuff);
		 */
		that["public"].once = that.once;

		/**
		 * Removes a callback function from specific event.
		 * @public
		 * @function
		 * @name ch.Widget#off
		 * @param {string} event Event nawidget.
		 * @param {function} handler Handler function.
		 * @returns itself
		 * @since version 0.7.1
		 * @exampleDescription Will remove event handler to the "ready" event
		 * @example
		 * var startDoingStuff = function () {
		 *     // Some code here!
		 * };
		 *
		 * widget.off("ready", startDoingStuff);
		 */
		that["public"].off = that.off;

		// Gets or creates the klass's instances map
		ch.instances[that.name] = ch.instances[that.name] || {};
		ch.instances[that.name][uid] = that['public'];

		return that;
	}

	Widget.prototype.name = 'widget';
	Widget.prototype.constructor = Widget;

	ch.Widget = Widget;

}(this, this.jQuery, this.ch));

/**
* Controls brings the functionality of all form controls.
* @abstract
* @name Controls
* @class Controls
* @augments ch.Widget
* @requires ch.Floats
* @memberOf ch
* @returns itself
* @see ch.Countdown
* @see ch.Validation
* @see ch.AutoComplete
* @see ch.DatePicker
* @see ch.Widget
* @see ch.Floats
*/
(function (window, $, ch) {
	'use strict';

	if (ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function Controls($el, conf) {

		/**
		* Reference to a internal component instance, saves all the information and configuration properties.
		* @name ch.Controls#that
		* @type Object
		*/
		var that = this;
		var	conf = conf || {};

	/**
	*  Inheritance
	*/
		that = ch.Widget.call(that);
		that.parent = ch.util.clone(that);

	/**
	*  Protected Members
	*/

		/**
		* Creates a reference to the Float component instanced.
		* @protected
		* @type Object
		* @name ch.Controls#createFloat
		*/
		that.createFloat = function (c) {
			c.position = {
				"context": conf.context || c.context || c.$element || that.$element,
				"offset": c.offset,
				"points": c.points
			};

			return ch.Floats.call({
				"element": (ch.util.hasOwn(c, "$element")) ? c.$element[0] : that.element,
				"$element": c.$element || that.$element,
				"source": c.content,
				"uid": (ch.util.index += 1),
				"type": c.type || that.type,
				"conf": c
			});
		};

	/**
	*  Public Members
	*/

		return that;
	}

	ch.Controls = Controls;

}(this, this.jQuery, this.ch));

/**
 * Floats brings the functionality of all Floats elements.
 * @abstract
 * @name ch.Floats
 * @class Floats
 * @augments ch.Widget
 * @requires ch.Positioner
 * @returns itself
 * @see ch.Tooltip
 * @see ch.Layer
 * @see ch.Modal
 * @see ch.Controls
 * @see ch.Transition
 * @see ch.Zoom
 * @see ch.Widget
 * @see ch.Positioner
 */
(function (window, $, ch) {
	'use strict';

	if (ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	var document = window.document,
		$document = $(document),
		$html = $('html');

	function Floats() {

		/**
		 * Reference to a internal component instance, saves all the information and configuration properties.
		 * @protected
		 * @name ch.Floats#that
		 * @type object
		 */
		var that = this,
			conf = that.conf;
	/**
	 * Inheritance
	 */

		that = ch.Widget.call(that);
		that.parent = ch.util.clone(that);

	/**
	 * Abilities
	 */

		ch.Content.call(that);

		that.content.configure({
			'input': that.source
		});

		/**
		 * This callback is triggered when content request have finished.
		 * @protected
		 * @name ch.Floats#onmessage
		 * @function
		 * @returns {this}
		 */
		that.content.onmessage = function (data) {

			if (!that.active) { return; }

			that.$content.html(data);

			that.trigger("contentLoad");
			if (ch.util.hasOwn(conf, "onContentLoad")) {
				conf.onContentLoad.call((that.controller || that), data);
			}

			that.position('refresh');
		};

		/**
		 * This callback is triggered when async request fails.
		 * @protected
		 * @name ch.Floats#onerror
		 * @function
		 * @returns {this}
		 */
		that.content.onerror = function (data) {

			if (!that.active) { return; }

			that.$content.html(data);

			that.trigger("contentError");
			if (ch.util.hasOwn(conf, "onContentError")) {
				conf.onContentError.call((that.controller || that), data.jqXHR, data.textStatus, data.errorThrown);
			}

			that.position('refresh');
		};

	/**
	 * Private Members
	 */

		/**
		 * Creates a 'cone', is a visual asset for floats.
		 * @private
		 * @function
		 * @deprecated
		 * @name ch.Floats#createCone
		 */

		/**
		 * Creates close button.
		 * @private
		 * @function
		 * @deprecated
		 * @name ch.Floats#createClose
		 */

		/**
		 * Closable behavior.
		 * @private
		 * @function
		 * @name ch.Floats-closable
		 */
		// TODO: Create "closable" interface
		var closable = (function () {
			/**
			 * Returns any if the component closes automatic.
			 * @public
			 * @function
			 * @methodOf ch.Floats#closabe
			 * @exampleDescription to get the height
			 * @example
			 * widget.closable() // true | false | "button"
			 * @returns boolean | string
			 */
			that["public"].closable = function () {
				return that.closable;
			};


			return function () {

				// Closable Off: don't anything
				if (!that.closable) { return; }

				// Closable On
				if (ch.util.hasOwn(conf, "closeButton") && conf.closeButton || ch.util.hasOwn(conf, "event") && conf.event === "click") {
					// Append close buttons
					// It will close with close button
					that.$container
						.prepend("<a class=\"ch-close\" role=\"button\" style=\"z-index:" + (ch.util.zIndex += 1) + "\"></a>")
						.on("click", function (event) {
							if ($(event.target || event.srcElement).hasClass("ch-close")) {
								that.innerHide(event);
							}
						});
				}

				// ESC key support
				$document.on(ch.events.key.ESC, function () {
					that.innerHide();
				});

				// It will close only with close button
				if (that.closable === "button") {
					return;
				}

				// Default Closable behavior
				// It will close with click on document, too
				that.on("show", function () {
					$document.one("click", that.innerHide);
				});

				// Stop event propatation, if click container.
				that.$container.on("click", function (event) {
					event.stopPropagation();
				});
			};

		})();

	/**
	 * Protected Members
	 */
		/**
		 * Flag that indicates if the float is active and rendered on the DOM tree.
		 * @protected
		 * @name ch.Floats#active
		 * @type boolean
		 */
		that.active = false;

		/**
		 * It sets the hablity of auto close the component or indicate who closes the component.
		 * @protected
		 * @function
		 * @name ch.Floats#closable
		 * @type boolean | string
		 */
		that.closable = ch.util.hasOwn(conf, "closable") ? conf.closable: true;

		/**
		 * Inner function that resolves the component's layout and returns a static reference.
		 * @protected
		 * @name ch.Floats#$container
		 * @type jQuery
		 */
		that.$container = (function () {

			// Final jQuery Object
			var $container,

			// HTML Div Element with role for WAI-ARIA
			container = ["<div role=\"" + conf.aria.role + "\""];

			var id = "ch-" + that.type + "-" + that.uid;
			// ID for WAI-ARIA
			if (ch.util.hasOwn(conf.aria, "identifier")) {
				// Generated ID using component name and its instance order

				// Add aria attribute to trigger element
				that.$element.attr(conf.aria.identifier, id);
			}

			// Add ID to container element
			container.push(" id=\"" + id + "\"");

			// Classname with component type and extra classes from conf.classes
			container.push(" class=\"ch-hide ch-" + that.type + (ch.util.hasOwn(conf, "classes") ? " " + conf.classes : "") + "\"");

			// Z-index
			container.push(" style=\"z-index:" + (ch.util.zIndex += 1) + ";");

			// Width
			if (ch.util.hasOwn(conf, "width")) {
				container.push("width:" + conf.width + ((typeof conf.width === "number") ? "px;" : ";"));
			}

			// Height
			if (ch.util.hasOwn(conf, "height")) {
				container.push("height:" + conf.height + ((typeof conf.height === "number") ? "px;" : ";"));
			}

			// Style and tag close
			container.push("\">");

			// Create cone
			if ($html.hasClass("lt-ie8") && ch.util.hasOwn(conf, "cone")) {
				container.push("<div class=\"ch-" + that.type + "-cone\"></div>");
			}

			// Tag close
			container.push("</div>");

			// jQuery Object generated from string
			$container = $(container.join(""));

			// Create cone
			if (ch.util.hasOwn(conf, "cone")) { $container.addClass("ch-cone"); }

			// Efects configuration
			conf.fx = ch.util.hasOwn(conf, "fx") ? conf.fx : true;

			// Position component configuration
			conf.position = conf.position || {};
			conf.position.element = $container;
			conf.position.reposition = ch.util.hasOwn(conf, "reposition") ? conf.reposition : true;

			// Initialize positioner component
			that.position = ch.Positioner(conf.position);

			// Return the entire Layout
			return $container;
		})();

		/**
		 * Inner reference to content container. Here is where the content will be added.
		 * @protected
		 * @name ch.Floats#$content
		 * @type jQuery
		 * @see ch.Content
		 */
		that.$content = $("<div class=\"ch-" + that.type + "-content\">").appendTo(that.$container);

		/**
		 * Inner show method. Attach the component layout to the DOM tree.
		 * @protected
		 * @function
		 * @name ch.Floats#innerShow
		 * @returns itself
		 */
		that.innerShow = function (event) {
			if (event) {
				ch.util.prevent(event);
			}

			// Avoid showing things that are already shown
			if (that.active) return;

			that.active = true;

			// Add layout to DOM tree
			// Increment zIndex
			that.$container
				.appendTo("body")
				.css("z-index", ch.util.zIndex++);

			// Request the content
			that.content.set();

			/**
			 * Triggers when component is visible.
			 * @name ch.Floats#show
			 * @event
			 * @public
			 * @exampleDescription It change the content when the component was shown.
			 * @example
			 * widget.on("show",function () {
			 * this.content("Some new content");
			 * });
			 * @see ch.Floats#show
			 */
			// Show component with effects
			if (conf.fx) {
				that.$container.fadeIn("fast", function () {

					that.$container.removeClass("ch-hide");
					// new callbacks
					that.trigger("show");
					// Old callback system
					that.callbacks('onShow');

				});
			} else {
			// Show component without effects
				that.$container.removeClass("ch-hide");
				// new callbacks
				that.trigger("show");
				// Old callback system
				that.callbacks('onShow');
			}

			that.position("refresh");

			return that;
		};

		/**
		 * Inner hide method. Hides the component and detach it from DOM tree.
		 * @protected
		 * @function
		 * @name ch.Floats#innerHide
		 * @returns itself
		 */
		that.innerHide = function (event) {

			if (event) {
				event.stopPropagation();
			}

			if (!that.active) { return; }

			that.active = false;

			var afterHide = function () {
				/**
				 * Triggers when component is not longer visible.
				 * @name ch.Floats#hide
				 * @event
				 * @public
				 * @exampleDescription When the component hides show other component.
				 * @example
				 * widget.on("hide",function () {
				 * otherComponent.show();
				 * });
				 */
				// new callbacks
				that.trigger("hide");
				// Old callback system
				that.callbacks('onHide');

				that.$container.detach();

			};

			// Show component with effects
			if (conf.fx) {
				that.$container.fadeOut("fast", afterHide);

			// Show component without effects
			} else {
				that.$container.addClass("ch-hide");
				afterHide();
			}

			// Removes the innerHide listener
			// #708 Modal: The widget closes by itself when It's showing the second time
			$document.off("click", that.innerHide);

			return that;

		};

		/**
		 * Getter and setter for size attributes on any float component.
		 * @protected
		 * @function
		 * @name ch.Floats#size
		 * @param {String} prop Property that will be setted or getted, like "width" or "height".
		 * @param {String} [data] Only for setter. It's the new value of defined property.
		 * @returns itself
		 */
		that.size = function (prop, data) {
			// Getter
			if (!data) { return that.conf[prop]; }

			// Setter
			that.conf[prop] = data;

			// Container size
			that.$container[prop](data);

			// Refresh position
			that.position("refresh");

			return that["public"];
		};


	/**
	 * Public Members
	 */

		/**
		 * @borrows ch.Widget#on as ch.Floats#on
		 * @borrows ch.Widget#once as ch.Floats#once
		 * @borrows ch.Widget#off as ch.Floats#off
		 */

		//Documented again because the method works in this class
		/**
		 * Sets and gets component content. To get the defined content just use the method without arguments, like 'widget.content()'. To define a new content pass an argument to it, like 'widget.content("new content")'. Use a valid URL to get content using AJAX. Use a CSS selector to get content from a DOM Element. Or just use a String with HTML code.
		 * @public
		 * @name ch.Content
		 * @function
		 * @param {string} content Static content, DOM selector or URL. If argument is empty then will return the content.
		 * @exampleDescription Get the defined content
		 * @example
		 * widget.content();
		 * @exampleDescription Set static content
		 * @example
		 * widget.content("Some static content");
		 * @exampleDescription Set DOM content
		 * @example
		 * widget.content("#hiddenContent");
		 * @exampleDescription Set AJAX content
		 * @example
		 * widget.content("http://chico.com/some/content.html");
		 */

		/**
		 * Triggers the innerShow method, returns the public scope to keep method chaining and sets new content if receive a parameter.
		 * @public
		 * @function
		 * @name ch.Floats#show
		 * @returns itself
		 * @see ch.Floats#content
		 */
		that["public"].show = function (content) {
			if (content !== undefined) {
				that.content.configure({
					'input': content
				});
			}

			that.innerShow();
			return that["public"];
		};

		/**
		 * Triggers the innerHide method and returns the public scope to keep method chaining.
		 * @public
		 * @function
		 * @name ch.Floats#hide
		 * @returns itself
		 */
		that["public"].hide = function () {
			that.innerHide();
			return that["public"];
		};

		/**
		 * Sets or gets positioning configuration. Use it without arguments to get actual configuration. Pass an argument to define a new positioning configuration.
		 * @public
		 * @function
		 * @name ch.Floats#position
		 * @exampleDescription Change component's position.
		 * @example
		 * widget.position({
		 *   offset: "0 10",
		 *   points: "lt lb"
		 * });
		 * @exampleDescription Refresh position.
		 * @example
		 * widget.position("refresh");
		 * @see ch.Floats#position
		 */
		// Create a custom Positioner object to update conf.position data of Float family
		that["public"].position = function (o) {

			var r = that["public"];

			switch (typeof o) {
			// Custom Setter: It updates conf.position data
			case "object":
				// New points
				if (ch.util.hasOwn(o, "points")) { conf.position.points = o.points; }

				// New reposition
				if (ch.util.hasOwn(o, "reposition")) { conf.position.reposition = o.reposition; }

				// New offset (splitted)
				if (ch.util.hasOwn(o, "offset")) { conf.position.offset = o.offset; }

				// New context
				if (ch.util.hasOwn(o, "context")) { conf.position.context = o.context; }

				// Original Positioner
				that.position(conf.position);

				break;

			// Refresh
			case "string":
				that.position("refresh");

				break;

			// Getter
			case "undefined":
			default:
				r = that.position();

				break;
			}

			return r;
		};

		/**
		 * Sets or gets the width property of the component's layout. Use it without arguments to get the value. To set a new value pass an argument, could be a Number or CSS value like '300' or '300px'.
		 * @public
		 * @function
		 * @name ch.Floats#width
		 * @param {Number|String} [width]
		 * @returns itself
		 * @see ch.Zarasa#size
		 * @see ch.Floats#size
		 * @exampleDescription to set the width
		 * @example
		 * widget.width(700);
		 * @exampleDescription to get the width
		 * @example
		 * widget.width() // 700
		 */
		that["public"].width = function (data) {
			return that.size("width", data) || that["public"];
		};

		/**
		 * Sets or gets the height of the Float element.
		 * @public
		 * @function
		 * @name ch.Floats#height
		 * @returns itself
		 * @see ch.Floats#size
		 * @exampleDescription to set the height
		 * @example
		 * widget.height(300);
		 * @exampleDescription to get the height
		 * @example
		 * widget.height // 300
		 */
		that["public"].height = function (data) {
			return that.size("height", data) || that["public"];
		};

		/**
		 * Returns a Boolean if the component's core behavior is active. That means it will return 'true' if the component is on and it will return false otherwise.
		 * @public
		 * @function
		 * @name ch.Floats#isActive
		 * @returns boolean
		 */
		that["public"].isActive = function () {
			return that.active;
		};

		/**
		 * Merges the current options with new options specified by user, and requires the content again.
		 * @public
		 * @name ch.Floats#content
		 * @function
		 * @param {Object} userOptions Options specified by user.
		 */
		that['public'].content = function ($content) {
			// Gets a new content
			if ($content === undefined) {
				return that.content.get();
			}

			// Configures a new content
			that.content.configure({
				'input': $content
			});

			// Sets the new content only if it's active
			if (that.active) {
				that.content.set();
			}

			return that["public"];
		};

		/**
		 * Triggers when the component is ready to use.
		 * @name ch.Floats#ready
		 * @event
		 * @public
		 * @exampleDescription Following the first example, using <code>widget</code> as modal's instance controller:
		 * @example
		 * widget.on("ready",function () {
		 * this.show();
		 * });
		 */
		that.trigger("ready");

		/**
		 * Default behavior
		 */

		// Add Closable behavior
		closable();

		return that;
	}

	Floats.prototype.name = 'floats';
	Floats.prototype.constructor = Floats;

	ch.Floats = Floats;

}(this, this.jQuery, this.ch));

/**
 * Layer lets you show a contextual floated data.
 * @name Layer
 * @class Layer
 * @augments ch.Floats
 * @standalone
 * @memberOf ch
 * @param {Object} [conf] Object with configuration properties.
 * @param {String} [conf.content] Sets content by: static content, DOM selector or URL. By default, the content is empty.
 * @param {Number|String} [conf.width] Sets width property of the component's layout. By default, the width is "500px".
 * @param {Number|String} [conf.height] Sets height property of the component's layout. By default, the height is elastic.
 * @param {Boolean} [conf.fx] Enable or disable UI effects. By default, the effects are enable.
 * @param {String} [conf.event] Sets the event ("click" or "hover") that trigger show method. By default, the event is "hover".
 * @param {String} [conf.points] Sets the points where component will be positioned, specified by configuration or centered by default: "cm cm".
 * @param {String} [conf.offset] Sets the offset in pixels that component will be displaced from original position determined by points. It's specified by configuration or zero by default: "0 0".
 * @param {Boolean} [conf.cache] Enable or disable the content cache. By default, the cache is enable.
 * @param {String} [conf.closable] Sets the way (true, "button" or false) the Layer close when conf.event is set as "click". By default, the layer close true.
 * @returns itself
 * @factorized
 * @see ch.Floats
 * @see ch.Tooltip
 * @see ch.Modal
 * @see ch.Zoom
 * @exampleDescription To create a ch.Layer you have to give a selector.
 * @example
 * var widget = $(".some-element").layer("<tag>Some content.</tag>");
 * @exampleDescription ch.Layer component can receive a parameter. It is a literal object { }, with the properties you want to configurate.
 * @example
 * var conf = {
 *     "width": 200,
 *     "height": 50
 * };
 * @exampleDescription Create a layer with configuration.
 * @example
 * var widget = $(".some-element").layer({
 *     "content": "Some content here!",
 *     "width": "200px",
 *     "height": 50,
 *     "event": "click",
 *     "closable": "button",
 *     "offset": "10 -10",
 *     "cache": false,
 *     "points": "lt rt"
 * });
 * @exampleDescription Now <code>widget</code> is a reference to the layer instance controller. You can set a new content by using <code>widget</code> like this:
 * @example
 * widget.content("http://content.com/new/content");
 */
(function (window, $, ch) {
	'use strict';

	if (ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function Layer($el, conf) {

		/**
		 * Reference to a internal component instance, saves all the information and configuration properties.
		 * @private
		 * @name ch.Layer#that
		 * @type object
		 */
		var that = this;
		that.$element = $el;
		that.element = $el[0];
		that.type = 'layer';
		conf = conf || {};

		conf = ch.util.clone(conf);

		conf.cone = true;
		conf.classes = conf.classes || "ch-box-lite";

		// Closable configuration
		conf.closeButton = ch.util.hasOwn(conf, "closeButton") ? conf.closeButton : (conf.event === "click");
		conf.closable = ch.util.hasOwn(conf, "closable") ? conf.closable : true;

		conf.aria = {};
		conf.aria.role = "tooltip";
		conf.aria.identifier = "aria-describedby";

		conf.position = {};
		conf.position.context = that.$element;
		conf.position.offset = conf.offset || "0 10";
		conf.position.points = conf.points || "lt lb";

		that.conf = conf;

		/**
		 * Content configuration property.
		 * @protected
		 * @name ch.Modal#source
		 */
		that.source = conf.content;
	/**
	 * Inheritance
	 */

		that = ch.Floats.call(that);
		that.parent = ch.util.clone(that);

	/**
	 * Private Members
	 */

		/**
		 * Delay time to hide component's contents.
		 * @private
		 * @name ch.Layer#hideTime
		 * @type number
		 * @default 400
		 */
		var hideTime = 400,

		/**
		 * Hide timer instance.
		 * @private
		 * @name ch.Layer#ht
		 * @type timer
		 */
			ht,

		/**
		 * Starts hide timer.
		 * @private
		 * @function
		 * @name ch.Layer#hideTimer
		 */
			hideTimer = function (event) {
				if (conf.event !== "click") {
					var target = event.srcElement || event.target;

					var relatedTarget = event.relatedTarget || event.toElement;

					if (relatedTarget === null || target === relatedTarget || relatedTarget === undefined || relatedTarget.parentNode === null || target.nodeName === "SELECT") {
						return;
					}
				}

				ht = setTimeout(function () { that.innerHide() }, hideTime);
			},

		/**
		 * Clear all timers.
		 * @private
		 * @function
		 * @name ch.Layer#clearTimers
		 */
			clearTimers = function () { clearTimeout(ht); };

	/**
	 * Protected Members
	 */

		/**
		 * Inner show method. Attach the component layout to the DOM tree.
		 * @protected
		 * @function
		 * @name ch.Layer#innerShow
		 * @returns itself
		 */
		that.innerShow = function (event) {
			// Reset all layers, except me and not auto closable layers
			$.each(ch.instances.layer, function (i, e) {
				if (e !== that["public"] && e.closable() === true) {
					e.hide();
				}
			});

			// conf.position.context = that.$element;
			that.parent.innerShow(event);

			if (conf.event !== "click") {
				that.$container.one("mouseenter", clearTimers).bind("mouseleave", hideTimer);
			}

			return that;
		};

		/**
		 * Inner hide method. Hides the component and detach it from DOM tree.
		 * @protected
		 * @function
		 * @name ch.Layer#innerHide
		 * @returns itself
		 */
		that.innerHide = function (event) {
			that.$container.unbind("mouseleave", hideTimer);

			that.parent.innerHide(event);
		}

	/**
	 * Public Members
	 */

		/**
		 * @borrows ch.Widget#on as ch.Layer#on
		 */


	/**
	 * Default event delegation
	 */

		// Click
		if (conf.event === "click") {
			that.$element
				.css("cursor", "pointer")
				.bind("click", that.innerShow);

		// Hover
		} else {
			that.$element
				.css("cursor", "default")
				.bind("mouseenter", that.innerShow)
				.bind("mouseleave", hideTimer);
		}

		/**
		 * Triggers when the component is ready to use (Since 0.8.0).
		 * @name ch.Layer#ready
		 * @event
		 * @public
		 * @since 0.8.0
		 * @exampleDescription Following the first example, using <code>widget</code> as layer's instance controller:
		 * @example
		 * widget.on("ready",function () {
		 * this.show();
		 * });
		 */
		window.setTimeout(function(){ that.trigger("ready")}, 50);

		return that['public'];
	}

	Layer.prototype.name = 'layer';
	Layer.prototype.constructor = Layer;

	ch.factory(Layer);

}(this, this.jQuery, this.ch));

/**
 * Tooltip improves the native tooltips. Tooltip uses the 'alt' and 'title' attributes to grab its content.
 * @name Tooltip
 * @class Tooltip
 * @augments ch.Floats
 * @memberOf ch
 * @param {Object} [conf] Object with configuration properties.
 * @param {Boolean} [conf.fx] Enable or disable UI effects. By default, the effects are enable.
 * @param {String} [conf.points] Sets the points where component will be positioned, specified by configuration or centered by default: "cm cm".
 * @param {String} [conf.offset] Sets the offset in pixels that component will be displaced from original position determined by points. It's specified by configuration or zero by default: "0 0".
 * @returns itself
 * @factorized
 * @see ch.Modal
 * @see ch.Layer
 * @see ch.Zoom
 * @see ch.Flaots
 * @exampleDescription Create a tooltip.
 * @example
 * var widget = $(".some-element").tooltip();
 * @exampleDescription Create a new tooltip with configuration.
 * @example
 * var widget = $("a.example").tooltip({
 *     "fx": false,
 *     "offset": "10 -10",
 *     "points": "lt rt"
 * });
 * @exampleDescription
 * Now <code>widget</code> is a reference to the tooltip instance controller.
 * You can set a new content by using <code>widget</code> like this:
 * @example
 * widget.width(300);
 */
(function (window, $, ch) {
	'use strict';

	if (ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function Tooltip($el, conf) {
		/**
		 * Reference to a internal component instance, saves all the information and configuration properties.
		 * @private
		 * @name ch.Tooltip#that
		 * @type object
		 */
		var that = this;
		that.$element = $el;
		that.element = $el[0];
		that.type = 'tooltip';
		conf = conf || {};

		conf = ch.util.clone(conf);

		conf.cone = true;
		conf.classes = conf.classes || "ch-box-lite";

		// Closable configuration
		conf.closable = false;

		conf.aria = {};
		conf.aria.role = "tooltip";
		conf.aria.identifier = "aria-describedby";

		conf.position = {};
		conf.position.context = that.$element;
		conf.position.offset = conf.offset || "0 10";
		conf.position.points = conf.points || "lt lb";

		that.conf = conf;

		/**
		 * Content configuration property.
		 * @protected
		 * @name ch.Modal#source
		 */
		that.source = conf.content || that.element.title || that.element.alt;

	/**
	 *	Inheritance
	 */

		that = ch.Floats.call(that);
		that.parent = ch.util.clone(that);

	/**
	 *	Private Members
	 */
		/**
		 * The attribute that will provide the content. It can be "title" or "alt" attributes.
		 * @protected
		 * @name ch.Tooltip#attrReference
		 * @type string
		 */
		var attrReference = (that.element.title) ? "title" : "alt",

		/**
		 * The original attribute content.
		 * @private
		 * @name ch.Tooltip#attrContent
		 * @type string
		 */
			attrContent = that.element.title || that.element.alt;

	/**
	 *	Protected Members
	 */

		/**
		 * Inner show method. Attach the component layout to the DOM tree.
		 * @protected
		 * @name ch.Tooltip#innerShow
		 * @function
		 * @returns itself
		 */
		that.innerShow = function (event) {

			// Reset all tooltip, except me
			$.each(ch.instances.tooltip, function (i, e) {
				if (e !== that["public"]) {
					e.hide();
				}
			});

			// IE8 remembers the attribute even when is removed, so ... empty the attribute to fix the bug.
			that.element[attrReference] = "";

			that.parent.innerShow(event);

			return that;
		};

		/**
		 * Inner hide method. Hides the component and detach it from DOM tree.
		 * @protected
		 * @name ch.Tooltip#innerHide
		 * @function
		 * @returns itself
		 */
		that.innerHide = function (event) {
			that.element[attrReference] = attrContent;

			that.parent.innerHide(event);

			return that;
		};

	/**
	 *	Public Members
	 */

		/**
		 * @borrows ch.Widget#uid as ch.Tooltip#uid
		 * @borrows ch.Widget#element as ch.Tooltip#element
		 * @borrows ch.Widget#type as ch.Tooltip#type
		 * @borrows ch.Floats#isActive as ch.Tooltip#isActive
		 * @borrows ch.Floats#show as ch.Tooltip#show
		 * @borrows ch.Floats#hide as ch.Tooltip#hide
		 * @borrows ch.Floats#width as ch.Tooltip#width
		 * @borrows ch.Floats#height as ch.Tooltip#height
		 * @borrows ch.Floats#position as ch.Tooltip#position
		 * @borrows ch.Floats#closable as ch.Tooltip#closable
		 */

	/**
	 *	Default event delegation
	 */

		that.$element
			.bind("mouseenter", that.innerShow)
			.bind("mouseleave", that.innerHide);

		/**
		 * Triggers when component is ready to use.
		 * @name ch.Tooltip#ready
		 * @event
		 * @public
		 * @example
		 * // Following the first example, using <code>widget</code> as tooltip's instance controller:
		 * widget.on("ready",function () {
		 *	this.show();
		 * });
		 */
		window.setTimeout(function(){ that.trigger("ready")}, 50);

		return that['public'];
	}

	Tooltip.prototype.name = 'tooltip';
	Tooltip.prototype.constructor = Tooltip;

	ch.factory(Tooltip);

}(this, this.jQuery, this.ch));

/**
 * Modal is a centered floated window with a dark gray dimmer background. Modal lets you handle its size, positioning and content.
 * @name Modal
 * @class Modal
 * @augments ch.Floats
 * @memberOf ch
 * @param {Object} [conf] Object with configuration properties.
 * @param {String} [conf.content] Sets content by: static content, DOM selector or URL. By default, the content is the href attribute value  or form's action attribute.
 * @param {Number || String} [conf.width] Sets width property of the component's layout. By default, the width is "500px".
 * @param {Number || String} [conf.height] Sets height property of the component's layout. By default, the height is elastic.
 * @param {Boolean} [conf.fx] Enable or disable UI effects. By default, the effects are enable.
 * @param {Boolean} [conf.cache] Enable or disable the content cache. By default, the cache is enable.
 * @param {String} [conf.closable] Sets the way (true, "button" or false) the Modal close. By default, the modal close true.
 * @returns itself
 * @factorized
 * @see ch.Floats
 * @see ch.Tooltip
 * @see ch.Layer
 * @see ch.Zoom
 * @exampleDescription Create a new modal window triggered by an anchor with a class name 'example'.
 * @example
 * var widget = $("a.example").modal();
 * @exampleDescription Create a new modal window triggered by form.
 * @example
 * var widget = $("form").modal();
 * @exampleDescription Create a new modal window with configuration.
 * @example
 * var widget = $("a.example").modal({
 *     "content": "Some content here!",
 *     "width": "500px",
 *     "height": 350,
 *     "cache": false,
 *     "fx": false
 * });
 * @exampleDescription Now <code>widget</code> is a reference to the modal instance controller. You can set a new content by using <code>widget</code> like this:
 * @example
 * widget.content("http://content.com/new/content");
 */
(function (window, $, ch) {
	'use strict';

	if (ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	var $html = $('html');

	function Modal($el, conf) {

		/**
		 * Reference to a internal component instance, saves all the information and configuration properties.
		 * @private
		 * @name ch.Modal#that
		 * @type object
		 */
		var that = this;
		that.$element = $el;
		that.element = $el[0];
		that.type = 'modal';
		conf = conf || {};

		conf = ch.util.clone(conf);

		conf.classes = conf.classes || "ch-box";
		conf.reposition = false;

		// Closable configuration
		conf.closeButton = ch.util.hasOwn(conf, "closeButton") ? conf.closeButton : true;
		conf.closable = ch.util.hasOwn(conf, "closable") ? conf.closable : true;

		conf.aria = {};

		if (conf.closeButton) {
			conf.aria.role = "dialog";
			conf.aria.identifier = "aria-label";
		} else {
			conf.aria.role = "alert";
		}

		that.conf = conf;

		/**
		 * Content configuration property.
		 * @protected
		 * @name ch.Modal#source
		 */
		that.source = conf.content || that.element.href || that.$element.parents("form").attr("action");

	/**
	 * Inheritance
	 */

		that = ch.Floats.call(that);
		that.parent = ch.util.clone(that);

	/**
	 * Private Members
	 */

		/**
		 * Reference to the dimmer object, the gray background element.
		 * @private
		 * @name ch.Modal#$dimmer
		 * @type jQuery
		 */
		var $dimmer = $("<div class=\"ch-dimmer\">"),

			/**
			 * Reference to dimmer control, turn on/off the dimmer object.
			 * @private
			 * @name ch.Modal#dimmer
			 * @type object
			 */
			dimmer = {
				on: function () {

					if (that.active) { return; }

					$dimmer
						.css("z-index", ch.util.zIndex += 1)
						.appendTo($('body'))
						.fadeIn();

					if (conf.closable && conf.closable !== 'button') {
						$dimmer.one("click", function (event) { that.innerHide(event) });
					}

					// TODO: position dimmer with Positioner
					if (!ch.support.fixed) {
					 	ch.positioner({ element: $dimmer });
					}
				},
				off: function () {
					$dimmer.fadeOut("normal", function () {
						$dimmer.detach();
					});
				}
			};

	/**
	 * Protected Members
	 */

		/**
		 * Inner show method. Attach the component's layout to the DOM tree and load defined content.
		 * @protected
		 * @name ch.Modal#innerShow
		 * @function
		 * @returns itself
		 */
		that.innerShow = function (event) {
			dimmer.on();
			that.parent.innerShow(event);
			that.$element.blur();
			return that;
		};

		/**
		 * Inner hide method. Hides the component's layout and detach it from DOM tree.
		 * @protected
		 * @name ch.Modal#innerHide
		 * @function
		 * @returns itself
		 */
		that.innerHide = function (event) {
			dimmer.off();
			that.parent.innerHide(event);
			return that;
		};

		/**
		 * Returns any if the component closes automatic.
		 * @protected
		 * @name ch.Modal#closable
		 * @function
		 * @returns boolean
		 */

	/**
	 * Public Members
	 */

		/**
		 * @borrows ch.Widget#uid as ch.Modal#uid
		 * @borrows ch.Widget#element as ch.Modal#element
		 * @borrows ch.Widget#type as ch.Modal#type
		 * @borrows ch.Floats#isActive as ch.Modal#isActive
		 * @borrows ch.Floats#show as ch.Modal#show
		 * @borrows ch.Floats#hide as ch.Modal#hide
		 * @borrows ch.Floats#width as ch.Modal#width
		 * @borrows ch.Floats#height as ch.Modal#height
		 * @borrows ch.Floats#position as ch.Modal#position
		 * @borrows ch.Floats#closable as ch.Modal#closable
		 */

	/**
	 * Default event delegation
	 */

		if (that.element.tagName === "INPUT" && that.element.type === "submit") {
			that.$element.parents("form").on("submit", function (event) { that.innerShow(event); });
		} else {
			that.$element.on("click", function (event) { that.innerShow(event); });
		}

		/**
		 * Triggers when the component is ready to use.
		 * @name ch.Modal#ready
		 * @event
		 * @public
		 * @example
		 * // Following the first example, using <code>widget</code> as modal's instance controller:
		 * widget.on("ready",function () {
		 *	this.show();
		 * });
		 */
		window.setTimeout(function(){ that.trigger("ready")}, 50);

		return that['public'];
	}

	Modal.prototype.name = 'modal';
	Modal.prototype.constructor = Modal;

	ch.factory(Modal);

}(this, this.jQuery, this.ch));

/**
 * Transition lets you give feedback to the users when their have to wait for an action.
 * @name Transition
 * @class Transition
 * @interface
 * @augments ch.Floats
 * @requires ch.Modal
 * @memberOf ch
 * @param {Object} [conf] Object with configuration properties.
 * @param {String} [conf.content] Sets content by: static content, DOM selector or URL. By default, the content is the href attribute value  or form's action attribute.
 * @param {Number || String} [conf.width] Sets width property of the component's layout. By default, the width is "500px".
 * @param {Number || String} [conf.height] Sets height property of the component's layout. By default, the height is elastic.
 * @param {Boolean} [conf.fx] Enable or disable UI effects. By default, the effects are enable.
 * @param {Boolean} [conf.cache] Enable or disable the content cache. By default, the cache is enable.
 * @param {String} [conf.closable] Sets the way (true, "button" or false) the Transition close. By default, the transition close true.
 * @returns itself
 * @factorized
 * @see ch.Tooltip
 * @see ch.Layer
 * @see ch.Zoom
 * @see ch.Modal
 * @see ch.Floats
 * @exampleDescription Create a transition.
 * @example
 * var widget = $("a.example").transition();
 * @exampleDescription Create a transition with configuration.
 * @example
 * var widget = $("a.example").transition({
 *     "content": "Some content here!",
 *     "width": "500px",
 *     "height": 350,
 *     "cache": false,
 *     "fx": false
 * });
 */
(function (window, $, ch) {
	'use strict';

	if (ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function Transition($el, conf) {

		conf = conf || {};

		conf.closable = false;

		conf.classes = 'ch-box-lite ch-transition';

		conf.content = $('<div class="ch-loading-big"></div><p>' + (conf.content || 'Please wait...') + '</p>');

		return new ch.Modal($el, conf);
	}

	Transition.prototype.name = 'transition';
	Transition.prototype.constructor = Transition;

	ch.factory(Transition);

}(this, this.jQuery, this.ch));

/**
* Zoom shows a contextual reference to an augmented version of main declared image.
* @name Zoom
* @class Zoom
* @augments ch.Floats
* @requires ch.onImagesLoads
* @memberOf ch
* @param {Object} [conf] Object with configuration properties.
* @param {Boolean} [conf.fx] Enable or disable fade effect on show. By default, the effect are disabled.
* @param {Boolean} [conf.context] Sets a reference to position of component that will be considered to carry out the position. By default is the anchor of HTML snippet.
* @param {String} [conf.points] Sets the points where component will be positioned, specified by configuration or "lt rt" by default.
* @param {String} [conf.offset] Sets the offset in pixels that component will be displaced from original position determined by points. It's specified by configuration or "20 0" by default.
* @param {String} [conf.content] This message will be shown when component needs to communicate that is in process of load. It's "Loading zoom..." by default.
* @param {Number} [conf.width] Width of floated area of zoomed image. Example: 500, "500px", "50%". Default: 350.
* @param {Number} [conf.height] Height of floated area of zoomed image. Example: 500, "500px", "50%". Default: 350.
* @returns itself
* @exampleDescription Create a Zoom component wrapping the original image with a anchor element pointing to a bigger version than the original.
* @example
* var widget = $(".example").zoom();
* @factorized
* @see ch.Floats
* @see ch.Modal
* @see ch.Tooltip
* @see ch.Layer
* @see ch.OnImagesLoads
*/
(function (window, $, ch) {
	'use strict';

	if (ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function Zoom($el, conf) {

		/**
		 * Reference to an internal component instance, saves all the information and configuration properties.
		 * @private
		 * @name ch.Zoom#that
		 * @type itself
		 */
		var that = this;
		that.$element = $el;
		that.element = $el[0];
		that.type = 'zoom';
		conf = conf || {};

		/**
		 * Constructor
		 */
		conf = ch.util.clone(conf);

		conf.fx = conf.fx || false;

		conf.cache = false;

		// WAI-ARIA
		conf.aria = {};
		conf.aria.role = "tooltip";
		conf.aria.identifier = "aria-describedby";

		// Position
		conf.position = {};
		conf.position.context = conf.context || that.$element;
		conf.position.offset = conf.offset || "20 0";
		conf.position.points = conf.points || "lt rt";
		conf.reposition = false;

		// Transition message and size
		conf.content = conf.content || "Loading zoom...";
		conf.width = conf.width || 300;
		conf.height = conf.height || 300;

		// Closable configuration
		conf.closable = false;

		that.conf = conf;

		var isIE = $('html').hasClass('lt-ie10');

		/**
		 * Element showed before zoomed image is load. It's a transition message and its content can be configured through parameter "message".
		 * @private
		 * @name ch.Zoom#$loading
		 * @type Object
		 */
		/**
		 * Content configuration property.
		 * @protected
		 * @name ch.Modal#source
		 */
		var $loading = that.source = $("<p class=\"ch-zoom-loading ch-hide\">" + conf.content + "</p>").appendTo(that.$element);

	/**
	 * Inheritance
	 */

		that = ch.Floats.call(that);
		that.parent = ch.util.clone(that);

	/**
	 * Private Members
	 */

		/**
		 * Position of main anchor. It's for calculate cursor position hover the image.
		 * @private
		 * @name ch.Zoom#offset
		 * @type Object
		 */
		var offset = that.$element.offset(),

		/**
		 * Visual element that follows mouse movement for reference to zoomed area into original image.
		 * @private
		 * @name ch.Zoom#seeker
		 * @type Object
		 */
			seeker = {
				/**
				 * Element shown as seeker.
				 * @private
				 * @name shape
				 * @memberOf ch.Zoom#seeker
				 * @type Object
				 */
				"$shape": $("<div class=\"ch-zoom-seeker ch-hide\">"),

				/**
				 * Half of width of seeker element. It's only half to facilitate move calculations.
				 * @private
				 * @name width
				 * @memberOf ch.Zoom#seeker
				 * @type Number
				 */
				"width": 0,

				/**
				 * Half of height of seeker element. It's only half to facilitate move calculations.
				 * @private
				 * @name height
				 * @memberOf ch.Zoom#seeker
				 * @type Number
				 */
				"height": 0
			},

		/**
		 * Reference to main image declared on HTML code snippet.
		 * @private
		 * @name ch.Zoom#original
		 * @type Object
		 */
			original = (function () {
				// Define the content source
				var $img = that.$element.children("img");

				// Grab some data when image loads
				$img.onImagesLoads(function () {

					// Grab size of original image
					original.width = $img.prop("width");
					original.height = $img.prop("height");

					// Anchor size (same as image)
					that.$element.css({
						"width": original.width,
						"height": original.height
					});

					// Loading position centered at anchor
					$loading.css({
						"left": (original.width - $loading.width()) / 2,
						"top": (original.height - $loading.height()) / 2
					});

				});

				return {
					/**
					 * Reference to HTML Element of original image.
					 * @private
					 * @name img
					 * @memberOf ch.Zoom#original
					 * @type Object
					 */
					"$image": $img,

					/**
					 * Position of original image relative to viewport.
					 * @private
					 * @name offset
					 * @memberOf ch.Zoom#original
					 * @type Object
					 */
					"offset": {},

					/**
					 * Width of original image.
					 * @private
					 * @name width
					 * @memberOf ch.Zoom#original
					 * @type Number
					 */
					"width": 0,

					/**
					 * Height of original image.
					 * @private
					 * @name height
					 * @memberOf ch.Zoom#original
					 * @type Number
					 */
					"height": 0
				};
			}()),

		/**
		 * Relative size between zoomed and original image.
		 * @private
		 * @name ch.Zoom#ratio
		 * @type Object
		 */
			ratio = {
				/**
				 * Relative size of X axis.
				 * @private
				 * @name width
				 * @memberOf ch.Zoom#ratio
				 * @type Number
				 */
				"width": 0,

				/**
				 * Relative size of Y axis.
				 * @private
				 * @name height
				 * @memberOf ch.Zoom#ratio
				 * @type Number
				 */
				"height": 0
			},

		/**
		 * Reference to the augmented version of image, that will be displayed into a floated element.
		 * @private
		 * @name ch.Zoom#zoomed
		 * @type Object
		 */
			zoomed = (function () {
				// Define the content source
				var $img = $("<img src=\"" + that.element.href + "\" class=\"ch-hide\">").appendTo(that.$element);

				if (isIE) { $img.css('visibility', 'hidden').removeClass('ch-hide'); }

				// Grab some data when zoomed image loads
				$img.onImagesLoads(function () {

					// Save the zoomed image size
					zoomed.width = $img.prop("width");
					zoomed.height = $img.prop("height");

					if (isIE) { $img.css('visibility', 'visible').addClass('ch-hide'); }

					that.content.configure({
						'input': $img
					});

					// Save the zoom ratio
					ratio.width = zoomed.width / original.width;
					ratio.height = zoomed.height / original.height;

					// Seeker: Size relative to zoomed image respect zoomed area
					var w = ~~(conf.width / ratio.width),
						h = ~~(conf.height / ratio.height);

					// Seeker: Save half width and half height
					seeker.width = w / 2;
					seeker.height = h / 2;

					// Seeker: Set size and append it
					seeker.$shape.css({"width": w, "height": h}).appendTo(that.$element);

					// Remove loading
					$loading.remove();

					// Change zoomed image status to Ready
					zoomed.ready = true;

					// TODO: MAGIC here! if mouse is over image show seeker and make all that innerShow do
				});

				return {
					/**
					 * Reference to HTML Element of augmented image.
					 * @private
					 * @name img
					 * @memberOf ch.Zoom#zoomed
					 * @type Object
					 */
					"$image": $img,

					/**
					 * Status of augmented image. When it's load, the status is "true".
					 * @private
					 * @name ready
					 * @memberOf ch.Zoom#zoomed
					 * @type Boolean
					 */
					"ready": false,

					/**
					 * Width of augmented image.
					 * @private
					 * @name width
					 * @memberOf ch.Zoom#zoomed
					 * @type Number
					 */
					"width": 0,

					/**
					 * Height of augmented image.
					 * @private
					 * @name height
					 * @memberOf ch.Zoom#zoomed
					 * @type Number
					 */
					"height": 0
				};
			}()),

		/**
		 * Calculates movement limits and sets it to seeker and augmented image.
		 * @private
		 * @function
		 * @name ch.Zoom#move
		 * @param {Event} event Mouse event to take the cursor position.
		 */
			move = function (event) {

				var x, y;

				// Left side of seeker LESS THAN left side of image
				if (event.pageX - seeker.width < offset.left) {
					x = 0;
				// Right side of seeker GREATER THAN right side of image
				} else if (event.pageX + seeker.width > original.width + offset.left) {
					x = original.width - (seeker.width * 2) - 2;
				// Free move
				} else {
					x = event.pageX - offset.left - seeker.width;
				}

				// Top side of seeker LESS THAN top side of image
				if (event.pageY - seeker.height < offset.top) {
					y = 0;
				// Bottom side of seeker GREATER THAN bottom side of image
				} else if (event.pageY + seeker.height > original.height + offset.top) {
					y = original.height - (seeker.height * 2) - 2;
				// Free move
				} else {
					y = event.pageY - offset.top - seeker.height;
				}

				// Move seeker
				seeker.$shape.css({"left": x, "top": y});
				
				// Move zoomed image
				zoomed.$image.css({"left": (-ratio.width * x), "top": (-ratio.height * y)});

			};

	/**
	 * Protected Members
	 */

		/**
		 * Inner show method. Attach the component's layout to the DOM tree and load defined content.
		 * @protected
		 * @name ch.Zoom#innerShow
		 * @function
		 * @returns itself
		 */
		that.innerShow = function () {

			// If the component isn't loaded, show loading transition
			if (!zoomed.ready) {
				$loading.removeClass("ch-hide");
				return that;
			}

			// Update position of anchor here because Zoom can be inside a Carousel and its position updates
			offset = that.$element.offset();

			// Bind move calculations
			that.$element.bind("mousemove", function (event) { move(event); });

			// Show seeker
			seeker.$shape.removeClass("ch-hide");

			// Show float
			that.parent.innerShow();

			return that;
		};

		/**
		 * Inner hide method. Hides the component's layout and detach it from DOM tree.
		 * @protected
		 * @name ch.Zoom#innerHide
		 * @function
		 * @returns itself
		 */
		that.innerHide = function () {

			// If the component isn't loaded, hide loading transition
			if (!zoomed.ready) {
				$loading.addClass("ch-hide");
				return that;
			}

			// Unbind move calculations
			that.$element.unbind("mousemove");

			// Hide seeker
			seeker.$shape.addClass("ch-hide");

			// Hide float
			that.parent.innerHide();

			return that;

		};

		/**
		 * Getter and setter for size attributes of float that contains the zoomed image.
		 * @protected
		 * @function
		 * @name ch.Zoom#size
		 * @param {string} prop Property that will be setted or getted, like "width" or "height".
		 * @param {string} [data] Only for setter. It's the new value of defined property.
		 * @returns itself
		 */
		that.size = function (prop, data) {

			// Seeker: Updates styles and size value
			if (data) {
				// Seeker: Size relative to zoomed image respect zoomed area
				var size = ~~(data / ratio[prop]);

				// Seeker: Save half width and half height
				seeker[prop] = size / 2;

				// Seeker: Set size
				seeker.$shape.css(prop, size);
			}

			// Change float size
			return that.parent.size(prop, data);
		};

	/**
	 * Public Members
	 */

		/**
		 * @borrows ch.Widget#uid as ch.Modal#uid
		 * @borrows ch.Widget#element as ch.Zoom#element
		 * @borrows ch.Widget#type as ch.Zoom#type
		 * @borrows ch.Floats#isActive as ch.Zoom#isActive
		 * @borrows ch.Floats#show as ch.Zoom#show
		 * @borrows ch.Floats#hide as ch.Zoom#hide
		 * @borrows ch.Floats#width as ch.Zoom#width
		 * @borrows ch.Floats#height as ch.Zoom#height
		 * @borrows ch.Floats#position as ch.Zoom#position
		 */

	/**
	 * Default event delegation
	 */

		// Anchor
		that.$element
			.addClass("ch-zoom-trigger")
			// Prevent click
			.bind("click", function (event) { ch.util.prevent(event); })
			// Show component or loading transition
			.bind("mouseenter", that.innerShow)
			// Hide component or loading transition
			.bind("mouseleave", that.innerHide);

		/**
		 * Triggers when component is visible.
		 * @name ch.Zoom#show
		 * @event
		 * @public
		 * @example
		 * widget.on("show",function () {
		 * this.content("Some new content");
		 * });
		 * @see ch.Floats#event:show
		 */

		/**
		 * Triggers when component is not longer visible.
		 * @name ch.Zoom#hide
		 * @event
		 * @public
		 * @example
		 * widget.on("hide",function () {
		 * otherComponent.show();
		 * });
		 * @see ch.Floats#event:hide
		 */

		/**
		 * Triggers when the component is ready to use (Since 0.8.0).
		 * @name ch.Zoom#ready
		 * @event
		 * @public
		 * @since 0.8.0
		 * @example
		 * // Following the first example, using <code>widget</code> as zoom's instance controller:
		 * widget.on("ready",function () {
		 * this.show();
		 * });
		 */
		window.setTimeout(function () { that.trigger("ready"); }, 50);

		return that['public'];
	}

	Zoom.prototype.name = 'zoom';
	Zoom.prototype.constructor = Zoom;

	ch.factory(Zoom);

}(this, this.jQuery, this.ch));

/**
* Navs is a representation of navs components.
* @abstract
* @name Navs
* @class Navs
* @standalone
* @augments ch.Widget
* @memberOf ch
* @param {object} conf Object with configuration properties
* @returns itself
* @see ch.Widget
* @see ch.Dropdown
* @see ch.Expando
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	var $html = $('html');

	function Navs($el, conf) {
		/**
		 * Reference to a internal component instance, saves all the information and configuration properties.
		 * @private
		 * @name ch.Navs#that
		 * @type object
		 */
		var that = this,
			conf = that.conf;

		conf.icon = ch.util.hasOwn(conf, "icon") ? conf.icon : true;
		conf.open = conf.open || false;
		conf.fx = conf.fx || false;

		/**
		 *	Inheritance
		 */

		that = ch.Widget.call(that);
		that.parent = ch.util.clone(that);

		/**
		 *	Protected Members
		 */

		/**
		 * Status of component
		 * @protected
		 * @name ch.Navs#active
		 * @returns boolean
		 */
		that.active = false;

		/**
		 * The component's trigger.
		 * @private
		 * @name ch.Navs#$trigger
		 * @type jQuery
		 */
		that.$trigger = that.$element.children().eq(0);

		/**
		 * The component's content.
		 * @private
		 * @name ch.Navs#$content
		 * @type jQuery
		 */
		that.$content = that.$element.children().eq(1);

		/**
		 * Shows component's content.
		 * @protected
		 * @name ch.Navs#innerShow
		 * @returns itself
		 */
		that.innerShow = function (event) {
			ch.util.prevent(event);

			if (that.active) {
				return that.innerHide(event);
			}

			that.active = true;

			that.$trigger.addClass("ch-" + that["type"] + "-trigger-on");

			/**
			 * onShow callback function
			 * @name ch.Navs#onShow
			 * @event
			 */
			// Animation
			if (conf.fx) {
				that.$content.slideDown("fast", function () {
					// new callbacks
					that.trigger("show");
					// old callback system
					that.callbacks("onShow");
				});
			} else {
				// new callbacks
				that.trigger("show");
				// old callback system
				that.callbacks("onShow");
			}

			that.$content.removeClass("ch-hide");

			return that;
		};

		/**
		 * Hides component's content.
		 * @protected
		 * @function
		 * @name ch.Navs#innerHide
		 * @returns itself
		 */
		that.innerHide = function (event) {
			ch.util.prevent(event);

			if (!that.active) { return; }

			that.active = false;

			that.$trigger.removeClass("ch-" + that["type"] + "-trigger-on");

			/**
			 * onHide callback function
			 * @name ch.Navs#onHide
			 * @event
			 */
			// Animation
			if (conf.fx) {
				that.$content.slideUp("fast", function () {
					that.callbacks("onHide");
				});
			} else {
				// new callbacks
				that.trigger("hide");
				// old callback system
				that.callbacks("onHide");
			}

			that.$content.addClass("ch-hide");

			return that;
		};

		/**
		 * Create component's layout
		 * @protected
		 * @function
		 * @name ch.Navs#configBehavior
		 */
		that.configBehavior = function () {
			that.$trigger
				.addClass("ch-" + that.type + "-trigger")
				.bind("click", function (event) { that.innerShow(event); });

			that.$content.addClass("ch-" + that.type + "-content ch-hide");

			// Icon configuration
			if ($html.hasClass("lt-ie8") && conf.icon) {
				$("<span class=\"ch-" + that.type + "-ico\">Drop</span>").appendTo(that.$trigger);
			} else if (conf.icon) {
				that.$trigger.addClass("ch-" + that.type + "-ico");
			}

			if (conf.open) { that.innerShow(); }

		};

		/**
		 * Public Members
		 */

		/**
		 * Shows component's content.
		 * @public
		 * @function
		 * @name ch.Navs#show
		 * @returns itself
		 */
		that["public"].show = function(){
			that.innerShow();
			return that["public"];
		};

		/**
		 * Hides component's content.
		 * @public
		 * @function
		 * @name ch.Navs#hide
		 * @returns itself
		 */
		that["public"].hide = function(){
			that.innerHide();
			return that["public"];
		};

		/**
		 * Returns a Boolean if the component's core behavior is active. That means it will return 'true' if the component is on and it will return false otherwise.
		 * @public
		 * @function
		 * @name ch.Navs#isActive
		 * @returns boolean
		 */
		that["public"].isActive = function () {
			return that.active;
		};

		/**
		 *	Default event delegation
		 */

		that.configBehavior();
		that.$element.addClass("ch-" + that.type);

		/**
		 * Triggers when component is visible.
		 * @name ch.Navs#show
		 * @event
		 * @public
		 * @example
		 * widget.on("show",function () {
		 *	otherComponent.hide();
		 * });
		 * @see ch.Navs#event:show
		 */

		/**
		 * Triggers when component is not longer visible.
		 * @name ch.Navs#hide
		 * @event
		 * @public
		 * @example
		 * widget.on("hide",function () {
		 *	otherComponent.show();
		 * });
		 * @see ch.Navs#event:hide
		 */

		return that;

	}

	Navs.prototype.name = 'navs';
	Navs.prototype.constructor = Navs;

	ch.Navs = Navs;

}(this, this.jQuery, this.ch));

/**
* AutoComplete lets you suggest anything from an input element. Use a suggestion service or use a collection with the suggestions.
* @name AutoComplete
* @class AutoComplete
* @augments ch.Controls
* @see ch.Controls
* @memberOf ch
* @param {Object} [conf] Object with configuration properties.
* @param {String} conf.url The url pointing to the suggestions's service.
* @param {String} [conf.content] It represent the text when no options are shown.
* @param {Array} [conf.suggestions] The suggestions's collection. If a URL is set at conf.url parametter this will be omitted.
* @returns itself
* @factorized
* @exampleDescription Create a new autoComplete with configuration.
* @example
* var widget = $(".example").autoComplete({
*     "url": "http://site.com/mySuggestions?q=",
*     "message": "Write..."
* });
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	var setTimeout = window.setTimeout,
		setInterval = window.setInterval,
		$document = $(window.document);

	function AutoComplete($el, conf){

		/**
		* Reference to a internal component instance, saves all the information and configuration properties.
		* @private
		* @name ch.AutoComplete#that
		* @type object
		*/
		var that = this;

		that.$element = $el;
		that.element = $el[0];
		that.type = 'autoComplete';
		conf = conf || {};


		conf = ch.util.clone(conf);
		conf.icon = false;
		conf.type = "autoComplete";
		conf.content = conf.content || "Please write to be suggested";
		conf.suggestions = conf.suggestions;
		conf.jsonpCallback = conf.jsonpCallback || "autoComplete";

		that.conf = conf;

	/**
	*	Inheritance
	*/

		that = ch.Controls.call(that);
		that.parent = ch.util.clone(that);

	/**
	*  Private Members
	*/

		/**
		* Select an item.
		* @private
		* @type Function
		* @name ch.AutoComplete#selectItem
		*/
		var selectItem = function (arrow, event) {
			ch.util.prevent(event);

			if (that.selected === (arrow === "bottom" ? that.items.length - 1 : 0)) { return; }
			$(that.items[that.selected]).removeClass("ch-autoComplete-selected");

			if (arrow === "bottom") { that.selected += 1; } else { that.selected -= 1; }
			$(that.items[that.selected]).addClass("ch-autoComplete-selected");
		};

	/**
	*  Protected Members
	*/

		/**
		* The number of the selected item.
		* @protected
		* @type Number
		* @name ch.AutoComplete#selected
		*/
		that.selected = -1;

		/**
		* List of the shown suggestions.
		* @protected
		* @type Array
		* @name ch.AutoComplete#suggestions
		*/
		that.suggestions = that.conf.suggestions;

		/**
		* The input where the AutoComplete works.
		* @protected
		* @type jQuery
		* @name ch.AutoComplete#$trigger
		*/
		//that.$trigger = that.$element.addClass("ch-" + that.type + "-trigger");

		/**
		* Inner reference to content container. Here is where the content will be added.
		* @protected
		* @type jQuery
		* @name ch.AutoComplete#$content
		*/
		that.$content = $("<ul class=\"ch-autoComplete-list\"></ul>");

		/**
		* It has the items loaded.
		* @protected
		* @type Boolean
		* @name ch.AutoComplete#behaviorActived
		*/
		that.behaviorActived = false;

		/**
		* It has the items loaded.
		* @protected
		* @type Array
		* @name ch.AutoComplete#items
		*/
		that.items = [];

		/**
		* Reference to the Float component instanced.
		* @protected
		* @type Object
		* @name ch.AutoComplete#float
		*/
		that["float"] = that.createFloat({
			"content": that.$content,
			"points": conf.points || "lt lb",
			"cache": false,
			"closable": false,
			"aria": {
				"role": "tooltip",
				"identifier": "aria-describedby"
			},
			"width": that.$element.outerWidth() + "px"
		});

		/**
		* It sets On/Off the loading icon.
		* @protected
		* @function
		* @name ch.AutoComplete#loading
		*/
		that.loading = function(show){
			if(show){
				that.$element.addClass("ch-autoComplete-loading");
			} else {
				that.$element.removeClass("ch-autoComplete-loading");
			}
		}

		/**
		* It fills the content inside the element represented by the float.
		* @protected
		* @function
		* @name ch.AutoComplete#populateContent
		*/
		that.populateContent = function (event,result) {
			// No results doesn't anything
			if (result.length===0 || that.element.value==="") {
				that.loading(false);
				that["float"].innerHide();
				return that;
			}

			// Only one result and the same as the input hide float and doesn't anything
			if (result.length===1 && result[0]===that.element.value) {
				that.loading(false);
				that["float"].innerHide();
				return that;
			}

			var list = "";
			$.each(result, function (i, e) {
				list+="<li data-index=\""+i+"\">"+e+"</li>";
			})

			that.trigger("contentUnload");
			that.$content.html(list);
			that.selected = -1;

			that["float"].content.configure({
				'input': that.$content
			});

			that.trigger("contentLoaded");

			that.items = that.$content.children();

			// Adds only once the behavior
			if (!that.behaviorActived) {
				that.suggestionsBehavior(event);
				that.behaviorActived = true;
			}

			that["float"].innerShow();
			that.loading(false);
			return that;
		}

		/**
		* It does the query to the server if configured an URL, or it does the query inside the array given.
		* @protected
		* @function
		* @name ch.AutoComplete#doQuery
		*/
		that.doQuery = function(event){

			if(!event){
				that.populateContent(window.event,that.suggestions);
				return that;
			}

			var q = that.$element.val().toLowerCase();
			// When URL is configured it will execute an ajax request.
			if (that.element.value !== "" && event.keyCode !== 38 && event.keyCode !== 40  && event.keyCode !== 13  && event.keyCode !== 27) {
				if (that.conf.url !== undefined) {
					that.loading(true);
					var result = $.ajax({
						url: that.conf.url + q + "&callback=" + that.conf.jsonpCallback,
						dataType:"jsonp",
						cache:false,
						global:true,
						context: window,
						jsonp:that.conf.jsonpCallback,
						crossDomain:true
					});
				// When not URL configured and suggestions array were configured it search inside the suggestions array.
				} else if (that.conf.url === undefined) {
					var result = [];
					for(var a=(that.suggestions.length-1);(a+1);a--){
						var word = that.suggestions[a].toLowerCase();
						var exist = word.search(q);
						if(!exist){
							result.push(that.suggestions[a]);
						}
					};
					that.populateContent(event,result);
				}
			}
			return that;
		}

		/**
		* Binds the behavior related to the list.
		* @protected
		* @function
		* @name ch.AutoComplete#suggestionsBehavior
		*/
		that.suggestionsBehavior = function(event){
			// BACKSPACE key bheavior. When backspace go to the start show the message
			$document.on(ch.events.key.BACKSPACE + ".autoComplete", function (x, event) {

				// When the user make backspace with empty input autocomplete is shutting off
				if(that.element.value.length===0){
					ch.util.prevent(event);
					that.$element.trigger("blur");
				}

				// When isn't any letter it hides the float
				if(that.element.value.length<=1){
					that["float"].innerHide();
					that.loading(false);
				}

			})
			// ESC key behavior, it closes the suggestions's list
			.on(ch.events.key.ESC + ".autoComplete", function (x, event) { that.$element.trigger("blur"); })
			// ENTER key behavior, it selects the item who is selected
			.on(ch.events.key.ENTER + ".autoComplete", function (x, event) { that.$element.val($(that.items[that.selected]).text()); that.$element.trigger("blur"); })
			// UP ARROW key behavior, it selects the previous item
			.on(ch.events.key.UP_ARROW + ".autoComplete", function (x, event) { selectItem("up", event); })
			// DOWN ARROW key behavior, it selects the next item
			.on(ch.events.key.DOWN_ARROW + ".autoComplete", function (x, event) { selectItem("bottom", event); });
			// MouseOver & MouseDown Behavior
			that["float"].$content.on("mouseover mousedown",function(evt){
				var event = evt || window.event;
				var target = event.target || event.srcElement;
				var type = event.type;
				if(target.tagName === "LI"){
					// mouse over behavior
					if(type === "mouseover"){
						// removes the class if one is selected
						$(that.items[that.selected]).removeClass("ch-autoComplete-selected");
						// selects the correct item
						that.selected = parseInt(target.getAttribute("data-index"));
						// adds the class to highlight the item
						$(that.items[that.selected]).addClass("ch-autoComplete-selected");
					}
					// mouse down behavior
					if(type === "mousedown") {
						ch.util.prevent(event);
						that.$element.val($(that.items[that.selected]).text());
						that.$element.trigger("blur");
					}
				}
			});
		}

		/**
		* Internal show method. It adds the behavior.
		* @protected
		* @function
		* @name ch.AutoComplete#show
		*/
		that.show = function(event){
			// new callbacks
			that.trigger("show");
			var query = that.element.value;
			that.doQuery(event);
			// Global keyup behavior
			$document.on("keyup.autoComplete", function (event) { that.doQuery(event); });
			//that.$content.html("");

			return that;
		}

		/**
		* Internal hide method. It removes the behavior.
		* @protected
		* @function
		* @name ch.AutoComplete-hide
		*/
		that.hide = function(event){
			that.trigger("hide");
			that.behaviorActived = false;
			that.$content.off("mouseover mousedown");
			$document.off(".autoComplete");
			that["float"].innerHide();
			return that;
		}

		/**
		* It gives the main behavior(focus, blur and turn off autocomplete attribute) to the $trigger.
		* @protected
		* @function
		* @name ch.AutoComplete#configBehavior
		*/
		that.configBehavior = function () {
			that.$element
				.bind("focus", function (event) {
					that.show(event);
				})
				.bind("blur", function (event) {
					that.hide(event);
				})
				.attr("autocomplete","off")
				.addClass("ch-" + that.type + "-trigger");
			return that;
		};

	/**
	*  Public Members
	*/

		/**
		 * @borrows ch.Widget#uid as ch.Menu#uid
		 * @borrows ch.Widget#element as ch.Menu#element
		 * @borrows ch.Widget#type as ch.Menu#type
		 */

		/**
		* Shows component's content.
		* @public
		* @name ch.AutoComplete-show
		* @function
		* @returns itself
		*/
		that["public"].show = function(){
			that.show();
			return that["public"];
		};

		/**
		* Hides component's content.
		* @public
		* @name ch.AutoComplete#hide
		* @function
		* @returns itself
		*/
		that["public"].hide = function(){
			that.hide(ch.events.key.ESC);
			return that["public"];
		};

		/**
		* Add suggestions to be shown.
		* @public
		* @name ch.AutoComplete#suggest
		* @function
		* @returns itself
		*/
		that["public"].suggest = function(data){
			that.suggestions = data;
			that.populateContent(window.event,that.suggestions);
			return that["public"];
		};


		//Fills the Float with the message.
		//that.populateContent([that.conf.content]);

	/**
	*  Default event delegation
	*/
		that.configBehavior();

		/*that["float"].on("ready", function () {
			that["float"]["public"].width((that.$element.outerWidth()));
		});*/

		/**
		* Triggers when the component is ready to use (Since 0.8.0).
		* @name ch.AutoComplete#ready
		* @event
		* @public
		* @exampleDescription Following the first example, using <code>widget</code> as autoComplete's instance controller:
		* @example
		* widget.on("ready",function () {
		*	this.show();
		* });
		*/
		setTimeout(function(){ that.trigger("ready")}, 50);

		return that['public'];
	}

	AutoComplete.prototype.name = 'autoComplete';
	AutoComplete.prototype.constructor = AutoComplete;

	ch.factory(AutoComplete);

}(this, this.jQuery, this.ch));

/**
* Calendar shows months, and lets you move across the months of the year. Calendar lets you set one or many dates as selected.
* @name Calendar
* @class Calendar
* @augments ch.Widget
* @see ch.Widget
* @memberOf ch
* @param {Object} [conf] Object with configuration properties.
* @param {String} [conf.format] Sets the date format. By default is "DD/MM/YYYY".
* @param {String} [conf.selected] Sets a date that should be selected by default. By default is the date of today.
* @param {String} [conf.from] Set a maximum selectable date.
* @param {String} [conf.to] Set a minimum selectable date.
* @param {Array} [conf.monthsNames] By default is ["Enero", ... , "Diciembre"].
* @param {Array} [conf.weekdays] By default is ["Dom", ... , "Sab"].
* @returns itself
* @factorized
* @exampleDescription Create a new Calendar with a class name 'example'.
* @example
* var widget = $(".example").calendar();
* @exampleDescription Create a new Calendar with configuration.
* @example
* var widget = $(".example").calendar({
*	 "format": "MM/DD/YYYY",
*	 "selected": "2011/12/25",
*	 "from": "2010/12/25",
*	 "to": "2012/12/25",
*	 "monthsNames": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
*	 "weekdays": ["Su", "Mo", "Tu", "We", "Thu", "Fr", "Sa"]
* });
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	var setTimeout = window.setTimeout,
		setInterval = window.setInterval,
		$html = $('html'),
		$document = $(window.document);

	function Calendar($el, conf) {

		/**
		* Reference to a internal component instance, saves all the information and configuration properties.
		* @private
		* @name ch.Calendar#that
		* @type object
		*/
		var that = this;

		that.$element = $el;
		that.element = $el[0];
		that.type = 'calendar';
		conf = conf || {};

		conf = ch.util.clone(conf);

		// Format by default
		conf.format = conf.format || "DD/MM/YYYY";

		that.conf = conf;

	/**
	*	Inheritance
	*/

		that = ch.Widget.call(that);
		that.parent = ch.util.clone(that);

	/**
	*	Private Members
	*/

		/**
		* Collection of months names.
		* @private
		* @name ch.Calendar#MONTHS_NAMES
		* @type Array
		*/
		//TODO: Default language should be English and then sniff browser language or something
		var MONTHS_NAMES = conf.monthsNames || ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],

		/**
		* Collection of weekdays (short names).
		* @private
		* @name ch.Calendar#DAYS_SHORTNAMES
		* @type Array
		*/
		//TODO: Default language should be English and then sniff browser language
			DAYS_SHORTNAMES = conf.weekdays || ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],

		/**
		* Creates a JSON Object with reference to day, month and year, from a determinated date.
		* @private
		* @name ch.Calendar#createDateObject
		* @function
		* @param date
		* @returns Object
		*/
			createDateObject = function (date) {

				if(!/^\d{4}\/((0?[1-9])|(1?[0-2]))\/([0-2]?[0-9]|3[0-1])$/.test(date) && date !== undefined){
					throw new window.Error('The date "'+date+'" is not valid format. It must follow this format YYYY/MM/DD.');
				}
				// Uses date parameter or create a date from today
				date = (date) ? new Date(date) : new Date();

				return {
					/**
					* Number of day.
					* @private
					* @name day
					* @type Number
					* @memberOf ch.Calendar#createDateObject
					*/
					"day": date.getDate(),

					/**
					* Order of day in a week.
					* @private
					* @name order
					* @type Number
					* @memberOf ch.Calendar#createDateObject
					*/
					"order": date.getDay(),

					/**
					* Number of month.
					* @private
					* @name month
					* @type Number
					* @memberOf ch.Calendar#createDateObject
					*/
					"month": date.getMonth() + 1,

					/**
					* Number of full year.
					* @private
					* @name year
					* @type Number
					* @memberOf ch.Calendar#createDateObject
					*/
					"year": date.getFullYear()
				};

			},

		// Today's date object
			today = createDateObject(),

		// Minimum selectable date
			from = (function () {

				// Only works when there are a "from" parameter on configuration
				if (!ch.util.hasOwn(conf, "from") || !conf.from) { return; }

				// Return date object
				return (conf.from === "today") ? today : createDateObject(conf.from);

			}()),

		// Maximum selectable date
			to = (function () {

				// Only works when there are a "to" parameter on configuration
				if (!ch.util.hasOwn(conf, "to") || !conf.to) { return; }

				// Return date object
				return (conf.to === "today") ? today : createDateObject(conf.to);

			}()),

		/**
		* Parse string to YYYY/MM/DD or DD/MM/YYYY format date.
		* @private
		* @function
		* @name ch.Calendar#parseDate
		* @param value {String} The date to be parsed.
		*/
			parseDate = function (value) {

				// Splitted string
				value = value.split("/");

				// Date to be returned
				var result = [];

				// Parse date
				switch (conf.format) {
					case "DD/MM/YYYY":
						result.push(value[2], value[1], value[0]);
						break;
					case "MM/DD/YYYY":
						result.push(value[2], value[0], value[1]);
						break;
				}

				return result.join("/");
			},

		/**
		* The current date that should be shown on Calendar.
		* @private
		* @name ch.Calendar#currentDate
		* @type Object
		*/
			currentDate = today,

		/**
		* Sets the date object of selected day.
		* @private
		* @name ch.Calendar#setSelected
		* @type Object
		*/
			setSelected = function () {

				// Get date from configuration or input value
				var sel = conf.selected || conf.content;

				// Do it only if there are a "selected" parameter
				if (!sel) { return; }

				// Simple date selection
				if (!ch.util.isArray(sel)) {

					// Return date object and update currentDate
					return (sel !== "today") ? currentDate = createDateObject(sel) : today;

				// Multiple date selection
				} else {
					$.each(sel, function (i, e) {
						// Simple date
						if (!ch.util.isArray(e)) {
							sel[i] = (sel[i] !== "today") ? createDateObject(e) : today;
						// Range
						} else {
							sel[i][0] = (sel[i][0] !== "today") ? createDateObject(e[0]) : today;
							sel[i][1] = (sel[i][1] !== "today") ? createDateObject(e[1]) : today;
						}
					});

					return sel;
				}
			},

		/**
		* Date of selected day.
		* @private
		* @name ch.Calendar-selected
		* @type Object
		*/
			selected = setSelected(),

		/**
		* Indicates if an specific date is selected or not (including date ranges and simple dates).
		* @private
		* @name ch.Calendar#isSelectable
		* @function
		* @param year
		* @param month
		* @param day
		* @return Boolean
		*/
			isSelectable = function (year, month, day) {

				if (!selected) { return; }

				var yepnope = false;

				// Simple selection
				if (!ch.util.isArray(selected)) {
					if (year === selected.year && month === selected.month && day === selected.day) {
						return yepnope = true;
					}
				// Multiple selection (ranges)
				} else {
					$.each(selected, function (i, e) {
						// Simple date
						if (!ch.util.isArray(e)) {
							if (year === e.year && month === e.month && day === e.day) {
								return yepnope = true;
							}
						// Range
						} else {
							if (
								(year >= e[0].year && month >= e[0].month && day >= e[0].day) &&
								(year <= e[1].year && month <= e[1].month && day <= e[1].day)
							) {
								return yepnope = true;
							}
						}
					});
				}

				return yepnope;
			},

		/**
		* Thead tag, including ARIA and cells with each weekday nawidget.
		* @private
		* @name ch.Calendar#thead
		* @type String
		*/
			thead = (function () {

				// Create thead structure
				var t = ["<thead><tr role=\"row\">"];

				// Add week names
				for (var i = 0; i < 7; i += 1) {
					t.push("<th role=\"columnheader\">" + DAYS_SHORTNAMES[i] + "</th>");
				};

				// Close thead structure
				t.push("</tr></thead>");

				// Join structure and return
				return t.join("");

			}()),

		/**
		* Creates a complete month in a table.
		* @private
		* @function
		* @name ch.Calendar#createTable
		* @param date {Object} Date from will be created the entire month.
		* @return jQuery Object
		*/
			createTable = function (date) {
				// Total amount of days into month
				var cells = (function () {

					// Amount of days of current month
					var currentMonth = new Date(date.year, date.month, 0).getDate(),

					// Amount of days of previous month
						prevMonth = new Date([date.year, date.month, "01"].join("/")).getDay(),

					// Merge amount of previous and current month
						subtotal = prevMonth + currentMonth,

					// Amount of days into last week of month
						latest = subtotal % 7,

					// Amount of days of next month
						nextMonth = (latest > 0) ? 7 - latest : 0;

					return {
						"previous": prevMonth,
						"subtotal": subtotal,
						"total": subtotal + nextMonth
					};

				}()),

				// Final array with month table structure
					r = [
						"<table class=\"ch-calendar-month\" role=\"grid\" id=\"ch-calendar-grid-" + that.uid + "\">",
						"<caption>" + MONTHS_NAMES[date.month - 1] + " - " + date.year + "</caption>",
						thead,
						"<tbody>",
						"<tr class=\"ch-week\" role=\"row\">"
					];

				// Iteration of weekdays
				for (var i = 0; i < cells.total; i += 1) {

					// Push an empty cell on previous and next month
					if (i < cells.previous || i > cells.subtotal - 1) {
						r.push("<td role=\"gridcell\" class=\"ch-calendar-other\">X</td>");
					} else {

						// Positive number of iteration
						var positive = i + 1,

						// Day number
							day = positive - cells.previous,

						// Define if it's the day selected
							isSelected = isSelectable(date.year, date.month, day);

						// Create cell
						r.push(
							// Open cell structure including WAI-ARIA and classnames space opening
							"<td role=\"gridcell\"" + (isSelected ? " aria-selected=\"true\"" : "") + " class=\"ch-calendar-day",

							// Add Today classname if it's necesary
							(date.year === today.year && date.month === today.month && day === today.day) ? " ch-calendar-today" : null,

							// Add Selected classname if it's necesary
							(isSelected ? " ch-calendar-selected" : null),

							// From/to range. Disabling cells
							(
								// Disable cell if it's out of FROM range
								(from && day < from.day && date.month === from.month && date.year === from.year) ||

								// Disable cell if it's out of TO range
								(to && day > to.day && date.month === to.month && date.year === to.year)

							) ? " ch-calendar-disabled" : null,

							// Close classnames attribute and print content closing cell structure
							"\">" + day + "</td>"
						);

						// Cut week if there are seven days
						if (positive % 7 === 0) {
							r.push("</tr><tr class=\"ch-calendar-week\" role=\"row\">");
						}

					}

				};

				// Return table object
				return r.join("");

			},

		/**
		* Handles behavior of arrows to move around months.
		* @private
		* @name ch.Calendar#arrows
		* @type Object
		*/
			arrows = {

				/**
				* Handles behavior of previous arrow to move back in months.
				* @private
				* @name $prev
				* @memberOf ch.Calendar#arrows
				* @type Object
				*/
				"$prev": $("<p class=\"ch-calendar-prev\" role=\"button\" aria-controls=\"ch-calendar-grid-" + that.uid + "\" aria-hidden=\"false\">" + (($html.hasClass("lt-ie8")) ? "<span></span>" : "") + "</p>").bind("click", function (event) { ch.util.prevent(event); prevMonth(); }),

				/**
				* Handles behavior of next arrow to move forward in months.
				* @private
				* @name $next
				* @memberOf ch.Calendar#arrows
				* @type Object
				*/
				"$next": $("<p class=\"ch-calendar-next\" role=\"button\" aria-controls=\"ch-calendar-grid-" + that.uid + "\" aria-hidden=\"false\">" + (($html.hasClass("lt-ie8")) ? "<span></span>" : "") + "</p>").bind("click", function (event) { ch.util.prevent(event); nextMonth(); }),

				/**
				* Refresh arrows visibility depending on "from" and "to" limits.
				* @private
				* @name update
				* @memberOf ch.Calendar#arrows
				* @function
				*/
				"update": function () {

					// "From" limit
					if (from) {
						// Hide previous arrow when it's out of limit
						if (from.month >= currentDate.month && from.year >= currentDate.year) {
							arrows.$prev.addClass("ch-hide").attr("aria-hidden", "true");
						// Show previous arrow when it's out of limit
						} else {
							arrows.$prev.removeClass("ch-hide").attr("aria-hidden", "false");
						}
					}

					// "To" limit
					if (to) {
						// Hide next arrow when it's out of limit
						if (to.month <= currentDate.month && to.year <= currentDate.year) {
							arrows.$next.addClass("ch-hide").attr("aria-hidden", "true");
						// Show next arrow when it's out of limit
						} else {
							arrows.$next.removeClass("ch-hide").attr("aria-hidden", "false");
						}
					}
				}
			},

		/**
		* Completes with zero the numbers less than 10.
		* @private
		* @name ch.Calendar#addZero
		* @function
		* @param num Number
		* @returns String
		*/
			addZero = function (num) {
				return (parseInt(num, 10) < 10) ? "0" + num : num;
			},

		/**
		* Map of date formats.
		* @private
		* @name ch.Calendar#FORMAT_DATE
		* @type Object
		*/
			FORMAT_DATE = {

				"YYYY/MM/DD": function (date) {
					return [date.year, addZero(date.month), addZero(date.day)].join("/");
				},

				"DD/MM/YYYY": function (date) {
					return [addZero(date.day), addZero(date.month), date.year].join("/");
				},

				"MM/DD/YYYY": function (date) {
					return [addZero(date.month), addZero(date.day), date.year].join("/");
				}

			},

		/**
		* Refresh the structure of Calendar's table with a new date.
		* @private
		* @function
		* @name ch.Calendar#updateTable
		* @param date {String} Date to be selected.
		*/
			updateTable = function (date) {

				// Update "currentDate" object
				currentDate = (typeof date === "string") ? createDateObject(date) : date;

				// Delete old table
				that.$element.children("table").remove();

				// Append new table to content
				that.$element.append(createTable(currentDate));

				// Refresh arrows
				arrows.update();

			},

		/**
		* Selects an specific date to show.
		* @private
		* @function
		* @name ch.Calendar#select
		* @param date {Date} Date to be selected.
		* @return itself
		*/
		// TODO: Check "from" and "to" range
			select = function (date) {

				// Update selected date
				selected = date;

				// Create a new table of selected month
				updateTable(selected);

				/**
				* It triggers a callback when a date is selected.
				* @public
				* @name ch.Calendar#select
				* @event
				* @exampleDescription
				* @example
				* widget.on("select",function(){
				* 	sowidget.action();
				* });
				*/
				// Old callback system
				that.callbacks("onSelect");
				// New callback
				that.trigger("select");

				return that;
			},

		/**
		* Move to next month of Calendar.
		* @private
		* @function
		* @name ch.Calendar#nextMonth
		* @return itself
		*/
			nextMonth = function () {

				// Next year
				if (currentDate.month === 12) {
					currentDate.month = 0;
					currentDate.year += 1;
				}

				// Create a new table of selected month
				updateTable([currentDate.year, currentDate.month + 1, "01"].join("/"));

				/**
				* It triggers a callback when a next month is shown.
				* @public
				* @name ch.Calendar#nextMonth
				* @event
				* @exampleDescription
				* @example
				* widget.on("nextMonth",function(){
				* 	sowidget.action();
				* });
				*/
				// Callback
				that.callbacks("onNextMonth");
				// New callback
				that.trigger("nextMonth");

				return that;
			},

		/**
		* Move to previous month of Calendar.
		* @private
		* @function
		* @name ch.Calendar#prevMonth
		* @return itself
		*/
			prevMonth = function () {

				// Previous year
				if (currentDate.month === 1) {
					currentDate.month = 13;
					currentDate.year -= 1;
				}

				// Create a new table of selected month
				updateTable([currentDate.year, currentDate.month - 1, "01"].join("/"));

				/**
				* It triggers a callback when a previous month is shown.
				* @public
				* @name ch.Calendar#prevMonth
				* @event
				* @exampleDescription
				* @example
				* widget.on("prevMonth",function(){
				* 	sowidget.action();
				* });
				*/
				// Callback
				that.callbacks("onPrevMonth");
				// New callback
				that.trigger("prevMonth");

				return that;
			},

		/**
		* Move to next year of Calendar.
		* @private
		* @function
		* @name ch.Calendar#nextYear
		* @return itself
		*/
			nextYear = function () {

				// Create a new table of selected month
				updateTable([currentDate.year + 1, currentDate.month, "01"].join("/"));

				/**
				* It triggers a callback when a next year is shown.
				* @public
				* @name ch.Calendar#nextYear
				* @event
				* @exampleDescription
				* @example
				* widget.on("nextYear",function(){
				* 	sowidget.action();
				* });
				*/
				// Callback
				that.callbacks("onNextYear");
				// New callback
				that.trigger("nextYear");

				return that;
			},

		/**
		* Move to previous year of Calendar.
		* @private
		* @function
		* @name ch.Calendar#prevYear
		* @return itself
		*/
			prevYear = function () {

				// Create a new table of selected month
				updateTable([currentDate.year - 1, currentDate.month, "01"].join("/"));

				/**
				* It triggers a callback when a previous year is shown.
				* @public
				* @name ch.Calendar#prevYear
				* @event
				* @exampleDescription
				* @example
				* widget.on("prevYear",function(){
				* 	sowidget.action();
				* });
				*/
				// Callback
				that.callbacks("onPrevYear");
				// New callback
				that.trigger("prevYear");

				return that;
			};

	/**
	*  Public Members
	*/

		/**
		 * @borrows ch.Widget#uid as ch.Menu#uid
		 * @borrows ch.Widget#element as ch.Menu#element
		 * @borrows ch.Widget#type as ch.Menu#type
		 */

		/**
		* Select a specific date or returns the selected date.
		* @public
		* @since 0.9
		* @name ch.Calendar#select
		* @function
		* @param {string} "YYYY/MM/DD".
		* @return itself
		*/
		that["public"].select = function (date) {

			// Getter
			if (!date) { return FORMAT_DATE[conf.format](selected); }

			// Setter
			select((date === "today") ? today : createDateObject(parseDate(date)));

			return that["public"];

		};

		/**
		* Select a specific day into current month and year.
		* @public
		* @since 0.10.1
		* @name ch.Calendar#selectDay
		* @function
		* @param {string || number}
		* @return {string} New selected date.
		*/
		that["public"].selectDay = function (day) {

			var date = createDateObject([currentDate.year, currentDate.month, day].join("/"));

			select(date);

			return FORMAT_DATE[conf.format](date);

		};

		/**
		* Returns date of today
		* @public
		* @since 0.9
		* @name ch.Calendar#today
		* @function
		* @return date
		*/
		that["public"].today = function () {
			return FORMAT_DATE[conf.format](today);
		};

		/**
		* Move to the next month or year. If it isn't specified, it will be moved to next month.
		* @public
		* @name ch.Calendar#next
		* @function
		* @param {String} time A string that allows specify if it should move to next month or year.
		* @return itself
		* @default Next month
		*/
		that["public"].next = function (time) {

			switch (time) {
				case "month":
				case undefined:
				default:
					nextMonth();
					break;
				case "year":
					nextYear();
					break;
			}

			return that["public"];
		};

		/**
		* Move to the previous month or year. If it isn't specified, it will be moved to previous month.
		* @public
		* @function
		* @name ch.Calendar#prev
		* @param {String} time A string that allows specify if it should move to previous month or year.
		* @return itself
		* @default Previous month
		*/
		that["public"].prev = function (time) {

			switch (time) {
				case "month":
				case undefined:
				default:
					prevMonth();
					break;
				case "year":
					prevYear();
					break;
			}

			return that["public"];
		};

		/**
		* Reset the Calendar to date of today
		* @public
		* @name ch.Calendar#reset
		* @function
		* @return itself
		*/
		that["public"].reset = function () {
			reset();

			return that["public"];
		};

		/**
		* Set a minimum selectable date.
		* @public
		* @since 0.9
		* @name ch.Calendar#from
		* @function
		* @param {string} "YYYY/MM/DD".
		* @return itself
		*/
		that["public"].from = function (date) {
			from = createDateObject(date);
			return that["public"];
		};

		/**
		* Set a maximum selectable date.
		* @public
		* @since 0.9
		* @name ch.Calendar#to
		* @function
		* @param {string} "YYYY/MM/DD".
		* @return itself
		*/
		that["public"].to = function (date) {
			to = createDateObject(date);
			return that["public"];
		};

	/**
	*	Default event delegation
	*/

		// Show or hide arrows depending on "from" and "to" limits
		arrows.update();

		// General creation: classname + arrows + table of month
		that.$element
			.addClass("ch-calendar")
			.prepend(arrows.$prev)
			.prepend(arrows.$next)
			.append(createTable(currentDate));

		// Avoid selection on the component
		ch.util.avoidTextSelection(that.$element);

		/**
		* Triggers when the component is ready to use (Since 0.8.0).
		* @name ch.Calendar#ready
		* @event
		* @public
		* @since 0.8.0
		* @exampleDescription Following the first example, using <code>widget</code> as Calendar's instance controller:
		* @example
		* widget.on("ready", function () {
		* 	this.show();
		* });
		*/
		setTimeout(function () { that.trigger("ready"); }, 50);

		return that['public'];
	}

	Calendar.prototype.name = 'calendar';
	Calendar.prototype.constructor = Calendar;

	ch.factory(Calendar);

}(this, this.jQuery, this.ch));

/**
* Datepicker lets you select dates.
* @name DatePicker
* @class DatePicker
* @augments ch.Controls
* @requires ch.Calendar
* @see ch.Controls
* @see ch.Calendar
* @memberOf ch
* @param {Object} [conf] Object with configuration properties.
* @param {String} [conf.format] Sets the date format. By default is "DD/MM/YYYY".
* @param {String} [conf.selected] Sets a date that should be selected by default. By default is the date of today.
* @param {String} [conf.from] Set a maximum selectable date.
* @param {String} [conf.to] Set a minimum selectable date.
* @param {String} [conf.points] Points to be positioned. See Positioner component. By default is "ct cb".
* @param {Array} [conf.monthsNames] By default is ["Enero", ... , "Diciembre"].
* @param {Array} [conf.weekdays] By default is ["Dom", ... , "Sab"].
* @param {Boolean} [conf.closable] Defines if floated component will be closed when a date is selected or not. By default it's "true".
* @returns itself
* @factorized
* @exampleDescription Create a new datePicker.
* @example
* var widget = $(".example").datePicker();
* @exampleDescription Create a new Date Picker with configuration.
* @example
* var widget = $(".example").datePicker({
*	 "format": "MM/DD/YYYY",
*	 "selected": "2011/12/25",
*	 "from": "2010/12/25",
*	 "to": "2012/12/25",
*	 "monthsNames": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
*	 "weekdays": ["Su", "Mo", "Tu", "We", "Thu", "Fr", "Sa"]
* });
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	var setTimeout = window.setTimeout,
		setInterval = window.setInterval,
		$document = $(window.document);

	function DatePicker($el, conf) {

		/**
		* Reference to a internal component instance, saves all the information and configuration properties.
		* @private
		* @name ch.DatePicker#that
		* @type object
		*/
		var that = this;

		that.$element = $el;
		that.element = $el[0];
		that.type = 'datePicker';
		conf = conf || {};

		conf = ch.util.clone(conf);

		// Configuration by default
		conf.format = conf.format || "DD/MM/YYYY";
		conf.points = conf.points || "ct cb";
		conf.closable = ch.util.hasOwn(conf, "closable") ? conf.closable : true;

		that.conf = conf;

	/**
	*	Inheritance
	*/

		that = ch.Controls.call(that);
		that.parent = ch.util.clone(that);

	/**
	*	Private Members
	*/

	/**
	*	Protected Members
	*/

		/**
		* Pick a date in the Calendar and updates the input data.
		* @protected
		* @function
		* @name ch.DatePicker#process
		*/
		that.process = function (event) {

			// Day selection
			if (event.target.nodeName !== "TD" || event.target.className.indexOf("ch-calendar-disabled") !== -1 || event.target.className.indexOf("ch-calendar-other") !== -1) {
				return;
			}

			// Select the day and update input value with selected date

			that.element.value = that.calendar.selectDay(event.target.innerHTML);

			// Hide float
			if (conf.closable) { that["float"].innerHide(); }

			/**
			* Callback function
			* @public
			* @name ch.DatePicker#select
			* @event
			*/
			// Old callback system
			that.callbacks("onSelect");
			// New callback
			that.trigger("select");

		};


		/**
		* Reference to the Calendar component instance.
		* @protected
		* @type Object
		* @name ch.DatePicker#calendar
		*/
		that.calendar = $("<div>")
			// Add functionality for date selection
			.on("click", function (event) { that.process(event); })
			// Instance Calendar component
			.calendar({
				"format": conf.format,
				"from": conf.from,
				"to": conf.to,
				"selected": conf.selected,
				"monthsNames": conf.monthsNames,
				"weekdays": conf.weekdays
			});

		/**
		* Reference to the Float component instanced.
		* @protected
		* @type Object
		* @name ch.DatePicker#float
		*/
		that["float"] = that.createFloat({
			"$element": $("<i role=\"button\" class=\"ch-datePicker-trigger ch-icon-calendar\"></i>").insertAfter(that.element),
			"content": $(that.calendar.element),
			"points": conf.points,
			"offset": "-1 8",
			"aria": {
				"role": "tooltip"
			},
			"closeButton": false,
			"cone": true
		});
		// The input element is described by the float
		that.$element.attr('aria-describedby', 'ch-' + that.type + '-' + that['float'].uid)

	/**
	*  Public Members
	*/

		/**
		 * @borrows ch.Widget#uid as ch.Menu#uid
		 * @borrows ch.Widget#element as ch.Menu#element
		 * @borrows ch.Widget#type as ch.Menu#type
		 */

		/**
		* Triggers the innerShow method and returns the public scope to keep method chaining.
		* @public
		* @name ch.DatePicker#show
		* @function
		* @returns itself
		* @exampleDescription Following the first example, using <code>widget</code> as modal's instance controller:
		* @example
		* widget.show();
		*/
		that["public"].show = function () {

			that["float"].innerShow();

			return that["public"];
		};

		/**
		* Triggers the innerHide method and returns the public scope to keep method chaining.
		* @public
		* @name ch.DatePicker#show
		* @function
		* @returns itself
		* @exampleDescription Following the first example, using <code>widget</code> as modal's instance controller:
		* @example
		* widget.hide();
		*/
		that["public"].hide = function () {
			that["float"].innerHide();

			return that["public"];
		};

		/**
		* Select a specific date or returns the selected date.
		* @public
		* @since 0.9
		* @name ch.DatePicker#select
		* @function
		* @param {string} "YYYY/MM/DD".
		* @return itself
		*/
		that["public"].select = function (date) {
			// Select the day and update input value with selected date
			// Setter
			if (date) {
				that.calendar.select(date);
				that.element.value = that.calendar.select();

				return that["public"];
			}

			// Getter
			return that.calendar.select();
		};

		/**
		* Returns date of today
		* @public
		* @since 0.9
		* @name ch.DatePicker#today
		* @function
		* @return date
		*/
		that["public"].today = function () {
			return that.calendar.today();
		};

		/**
		* Move to the next month or year. If it isn't specified, it will be moved to next month.
		* @public
		* @function
		* @name ch.DatePicker#next
		* @param {String} time A string that allows specify if it should move to next month or year.
		* @return itself
		* @default Next month
		*/
		that["public"].next = function (time) {
			that.calendar.next(time);

			return that["public"];
		};

		/**
		* Move to the previous month or year. If it isn't specified, it will be moved to previous month.
		* @public
		* @function
		* @name ch.DatePicker#prev
		* @param {String} time A string that allows specify if it should move to previous month or year.
		* @return itself
		* @default Previous month
		*/
		that["public"].prev = function (time) {
			that.calendar.prev(time);

			return that["public"];
		};

		/**
		* Reset the Date Picker to date of today
		* @public
		* @name ch.DatePicker#reset
		* @function
		* @return itself
		*/
		that["public"].reset = function () {

			// Delete input value
			that.element.value = "";

			that.calendar.reset();

			return that["public"];
		};

		/**
		* Set a minimum selectable date.
		* @public
		* @name ch.DatePicker#from
		* @function
		* @param {string} "YYYY/MM/DD".
		* @return itself
		*/
		that["public"].from = function (date) {
			that.calendar.from(date);

			return that["public"];
		};

		/**
		* Set a maximum selectable date.
		* @public
		* @name ch.DatePicker#to
		* @function
		* @param {string} "YYYY/MM/DD".
		* @return itself
		*/
		that["public"].to = function (date) {
			that.calendar.to(date);

			return that["public"];
		};


	/**
	*	Default event delegation
	*/

		// Change type of input to "text"
		that.element.type = "text";

		// Change value of input if there are a selected date
		that.element.value = (conf.selected) ? that.calendar.select() : that.element.value;

		// Add show behaivor to float's trigger.
		that["float"].$element.on("click", function (event) {
			that["float"].innerShow(event);
		});

		/**
		* Triggers when the component is ready to use (Since 0.8.0).
		* @name ch.DatePicker#ready
		* @event
		* @public
		* @exampleDescription Following the first example, using <code>widget</code> as Date Picker's instance controller:
		* @example
		* widget.on("ready", function () {
		* 	this.show();
		* });
		*/
		setTimeout(function () { that.trigger("ready"); }, 50);

		return that['public'];
	}

	DatePicker.prototype.name = 'datePicker';
	DatePicker.prototype.constructor = DatePicker;

	ch.factory(DatePicker);

}(this, this.jQuery, this.ch));

/**
* Countdown counts the maximum of characters that user can enter in a form control. Countdown could limit the possibility to continue inserting charset.
* @name Countdown
* @class Countdown
* @augments ch.Controls
* @see ch.Controls
* @memberOf ch
* @param {Object} conf Object with configuration properties.
* @param {Number} conf.max Number of the maximum amount of characters user can input in form control.
* @param {String} [conf.plural] Message of remaining amount of characters, when it's different to 1. The variable that represents the number to be replaced, should be a hash. By default this parameter is "# characters left.".
* @param {String} [conf.singular] Message of remaining amount of characters, when it's only 1. The variable that represents the number to be replaced, should be a hash. By default this parameter is "# character left.".
* @returns itself
* @factorized
* @exampleDescription Create a simple Countdown. Then <code>widget</code> is a reference to the Countdown instance controller.
* @example
* var widget = $(".some-form-control").countdown(500);
* @exampleDescription Create a Countdown with configuration.
* @example
* var widget = $(".some-form-control").countdown({
*     "max": 500,
*     "plural": "Restan # caracteres.",
*     "singular": "Resta # caracter."
* });
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	var setTimeout = window.setTimeout;

	function Countdown($el, conf) {

		/**
		* Reference to an internal component instance, saves all the information and configuration properties.
		* @private
		* @name ch.Countdown#that
		* @type Object
		*/
		var that = this;

		that.$element = $el;
		that.element = $el[0];
		that.type = 'countdown';
		conf = conf || {};

		conf = ch.util.clone(conf);

		// Configuration by default
		// Max length of content
		conf.max = parseInt(conf.max) || conf.num || parseInt(conf.content) || 500;

		// Messages
		conf.plural = conf.plural || "# characters left.";
		conf.singular = conf.singular || "# character left.";

		that.conf = conf;

	/**
	*	Inheritance
	*/

		that = ch.Controls.call(that);
		that.parent = ch.util.clone(that);

	/**
	*	Private Members
	*/
		/**
		* Length of value of form control.
		* @private
		* @name ch.Countdown#contentLength
		* @type Number
		*/
		var contentLength = that.element.value.length,

		/**
		* Amount of free characters until full the field.
		* @private
		* @name ch.Countdown#remaining
		* @type Number
		*/
			remaining = conf.max - contentLength,

		/**
		* Change the visible message of remaining characters.
		* @private
		* @name ch.Countdown#updateRemaining
		* @function
		* @param num {Number} Remaining characters.
		*/
			updateRemaining = (function () {

				// Singular or Plural message depending on amount of remaining characters
				var message = (remaining === 1) ? conf.singular : conf.plural,

				// Append to container to allow icon aside inputs
					$container = that.$element.parent(),

				// Create the DOM Element when message will be shown
					$display = $("<p class=\"ch-form-hint\">" + message.replace("#", remaining) + "</p>").appendTo($container);

				// Real function
				return function (num) {

					// Singular or Plural message depending on amount of remaining characters
					var message = (num !== 1 ? conf.plural : conf.singular).replace(/\#/g, num);

					// Update DOM text
					$display.text(message);

					// Update amount of remaining characters
					remaining = num;

				};

			}());

	/**
	*	Protected Members
	*/

		/**
		* Process input of data on form control and updates remaining amount of characters or limits the content length
		* @protected
		* @name ch.Countdown#process
		* @function
		*/
		that.process = function () {

			var len = that.element.value.length;

			// Countdown or Countup
			if ((len > contentLength && len <= conf.max) || (len < contentLength && len >= 0)) {

				// Change visible message of remaining characters
				updateRemaining(remaining - (len - contentLength));

				// Update length of value of form control.
				contentLength = len;

			// Limit Count
			} else if (len > contentLength && len > conf.max) {

				// Cut the string value of form control
				that.element.value = that.element.value.substr(0, conf.max);

			};

		};


	/**
	*	Public Members
	*/

		/**
		 * @borrows ch.Widget#uid as ch.Menu#uid
		 * @borrows ch.Widget#element as ch.Menu#element
		 * @borrows ch.Widget#type as ch.Menu#type
		 */

	/**
	*	Default event delegation
	*/

		// Bind process function to element
		that.$element.on("keyup keypress paste", function () { setTimeout(that.process, 0); });

		/**
		* Triggers when component is ready to use.
		* @name ch.Countdown#ready
		* @event
		* @public
		* @exampleDescription Following the first example, using <code>widget</code> as Countdown's instance controller:
		* @example
		* widget.on("ready",function () {
		*	this.element;
		* });
		*/
		setTimeout(function () { that.trigger("ready"); }, 50);

		return that['public'];
	};

	Countdown.prototype.name = 'countdown';
	Countdown.prototype.constructor = Countdown;

	ch.factory(Countdown);

}(this, this.jQuery, this.ch));

/**
* Condition utility.
* @name Condition
* @class Condition
* @memberOf ch
* @param {Object} condition Object with configuration properties.
* @param {String} condition.name
* @param {Object} [condition.patt]
* @param {Function} [condition.expr]
* @param {Function} [condition.fn]
* @param {Number || String} [condition.value]
* @param {String} condition.message Validation message
* @returns itself
* @exampleDescription Create a new condition object with patt.
* @example
* var widget = ch.condition({
*     "name": "string",
*     "patt": /^([a-zA-Z\u00C0-\u00C4\u00C8-\u00CF\u00D2-\u00D6\u00D9-\u00DC\u00E0-\u00E4\u00E8-\u00EF\u00F2-\u00F6\u00E9-\u00FC\u00C7\u00E7\s]*)$/,
*     "message": "Some message here!"
* });
* @exampleDescription Create a new condition object with expr.
* @example
* var widget = ch.condition({
*     "name": "maxLength",
*     "patt": function(a,b) { return a.length <= b },
*     "message": "Some message here!",
*     "value": 4
* });
* @exampleDescription Create a new condition object with func.
* @example
* var widget = ch.condition({
*     "name": "custom",
*     "patt": function (value) {
*         if (value === "ChicoUI") {
*
*             // Some code here!
*
*             return true;
*         };
*
*         return false;
*     },
*     "message": "Your message here!"
* });
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function Condition(condition) {

		if (condition === undefined) {
			throw new window.Error('"ch.Condition(condition)": Expected condition be defined and be an object.');
		}

		if ((condition.name === undefined) || (typeof condition.name !== 'string')) {
			throw new window.Error('"ch.Condition({ \'name\': \'custom\' })": Expected property name be defined and be a string.');
		}

		if ((condition.name === 'custom') && (typeof condition.fn !== 'function')) {
			throw new window.Error('"ch.Condition({ \'name\': \'custom\', \'fn\': function(){} })": Expected property "fn" be defined as a function with "custom" condition name.');
		}

		if ((condition.name === 'min') && ((condition.num === undefined) || (typeof condition.num !== 'number'))) {
			throw new window.Error('"ch.Condition({ \'name\': \'min\', \'num\': 10 })": Expected property "num" be defined as a number with "min" condition name.');
		}

		if ((condition.name === 'max') && ((condition.num === undefined) || (typeof condition.num !== 'number'))) {
			throw new window.Error('"ch.Condition({ \'name\': \'max\', \'num\': 10 })": Expected property "num" be defined as a number with "max" condition name.');
		}

		if ((condition.name === 'minLength') && ((condition.num === undefined) || (typeof condition.num !== 'number'))) {
			throw new window.Error('"ch.Condition({ \'name\': \'minLength\', \'num\': 10 })": Expected property "num" be defined as a number with "minLength" condition name.');
		}

		if ((condition.name === 'maxLength') && ((condition.num === undefined) || (typeof condition.num !== 'number'))) {
			throw new window.Error('"ch.Condition({ \'name\': \'maxLength\', \'num\': 10 })": Expected property "num" be defined as a number with "maxLength" condition name.');
		}

	/**
	* Reference to a internal component instance, saves all the information and configuration properties.
	* @protected
	* @name ch.Condition#that
	* @type itself
	*/
		var that = this;

	/**
	* Private Members
	*/

		var conditions = {
			'string': {
				// the following regular expression has the utf code for the lating characters
				// the ranges are A,EI,O,U,a,ei,o,u,ç,Ç please for reference see http://www.fileformat.info/info/charset/UTF-8/list.htm
				'patt': /^([a-zA-Z\u00C0-\u00C4\u00C8-\u00CF\u00D2-\u00D6\u00D9-\u00DC\u00E0-\u00E4\u00E8-\u00EF\u00F2-\u00F6\u00E9-\u00FC\u00C7\u00E7\s]*)$/,
				'message': 'Use only letters.'
			},
			'email': {
				'patt': /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
				'message': 'Use a valid e-mail such as name@example.com.'
			},
			'url': {
				'patt': /^((https?|ftp|file):\/\/|((www|ftp)\.)|(\/|.*\/)*)[a-z0-9-]+((\.|\/)[a-z0-9-]+)+([/?].*)?$/,
				'message': 'It must be a valid URL.'
			},
			'minLength': {
				'expr': function(a,b) { return a.length >= b },
				'message': 'Enter at least {#num#} characters.'
			},
			'maxLength': {
				'expr': function(a,b) { return a.length <= b },
				'message': 'The maximum amount of characters is {#num#}.'
			},
			'number': {
				'patt': /^(-?[0-9\s]+)$/,
				'message': 'Use only numbers.'
			},
			'max': {
				'expr': function(a, b) { return a <= b },
				'message': 'The amount must be smaller than {#num#}.'
			},
			'min': {
				'expr': function(a, b) { return a >= b },
				'message': 'The amount must be higher than {#num#}.'
			},
			'price': {
				'patt': /^(\d+)[.,]?(\d?\d?)$/,
				'message': 'Use a valid price such as (1,00).'
			},
			'required': {
				'expr': function(e) {

					if (e === undefined) {
						throw new window.Error('"instance.test(HTMLElement)": The "HTMLElement" parameter must be defined and be HTMLElement object.');
					}

					var $e = $(e);

					var tag = $e.hasClass("ch-form-options") ? "OPTIONS" : e.tagName;
					switch (tag) {
						case 'OPTIONS':
							return $e.find('input:checked').length !== 0;
						break;

						case 'SELECT':
							var val = $e.val();
							return (val != "-1" && val != "");
						break;

						case 'INPUT':
						case 'TEXTAREA':
							return $.trim($e.val()).length !== 0;
						break;
					};
				},
				'message': 'Fill in this information.'
			},
			'custom': {
				// I don't have pre-conditions, comes within conf.fn argument
				'message': 'Error'
			}
		};

		/**
		* Flag that let you know if the condition is enabled or not.
		* @private
		* @name ch.Condition-enabled
		* @type boolean
		*/
		var	enabled = true,

			test = function (value) {

				if (value === undefined) {
					throw new window.Error('"instance.test(value)": The "value" parameter must be defined.');
				}

				if (!enabled) {
					return true;
				}

				if (condition.patt){
					return condition.patt.test(value);
				}

				if (condition.expr){
					return condition.expr(value, condition.num);
				}

				if (condition.fn){
					// Call validation function with 'this' as scope.
					return condition.fn.call(this, value);
				}

			},

			enable = function() {
				enabled = true;

				return condition;
			},

			disable = function() {
				enabled = false;

				return condition;
			};

	/**
	* Protected Members
	*/

	/**
	* Public Members
	*/

		/**
		* Flag that let you know if the all conditions are enabled or not.
		* @public
		* @name ch.Condition#name
		* @type string
		*/

		/**
		* Message defined for this condition
		* @public
		* @name ch.Condition#message
		* @type string
		*/

		/**
		* Run configured condition
		* @public
		* @function
		* @name ch.Condition#test
		* @returns boolean
		*/

		/**
		* Turn on condition.
		* @public
		* @name ch.Condition#enable
		* @function
		* @returns itself
		*/

		/**
		* Turn off condition.
		* @public
		* @name ch.Condition#disable
		* @function
		* @returns itself
		*/

		if (conditions[condition.name] === undefined) {
			throw new window.Error('"ch.Condition({ \'name\': \''+condition.name+'\' })": "'+condition.name+'" Condition is not defined. Use "custom" to define your own condition.');
		}

		// replaces the condition default message in the following conditions max, min, minLenght, maxLenght
		if(!condition.message && (condition.name === 'min' || condition.name === 'max' || condition.name === 'minLength' || condition.name === 'maxLength')){

			conditions[condition.name].message = conditions[condition.name].message.replace('{#num#}', condition.num);

		}

		// condition override the default conditions configuration
		condition = $.extend({}, conditions[condition.name], condition, {
			test: test,
			enable: enable,
			disable: disable
		});

		return condition;

	};

	Condition.prototype.name = 'condition';
	Condition.prototype.constructor = Condition;

	ch.Condition = Condition;

}(this, this.jQuery, this.ch));

/**
* Validator is an engine for HTML forms elements.
* @name Validator
* @class Validator
* @augments ch.Widget
* @requires ch.Condition
* @memberOf ch
* @param {Object} conf Object with configuration properties.
* @param {Object} conf.conditions Object with conditions.
* @returns itself
* @factorized
* @see ch.Widget
* @see ch.Condition
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	var setTimeout = window.setTimeout;

	function Validator($el, conf) {
		/**
		* Reference to a internal component instance, saves all the information and configuration properties.
		* @protected
		* @name ch.Validator#that
		* @type Object
		*/
		var that = this;

		that.$element = $el;
		that.element = $el[0];
		that.type = 'validator';
		var conf = conf || {};

		conf = ch.util.clone(conf);
		that.conf = conf;

	/**
	* Inheritance
	*/
		that = ch.Widget.call(that);
		that.parent = ch.util.clone(that);

	/**
	* Private Members
	*/
		var conditions = (function(){
			var c = {}; // temp collection

			var condition = ch.Condition.call(that["public"], conf.condition);

			c[condition.name] = condition;

			// return all the configured conditions
			return c;
		})(); // Love this ;)

		var validate = function(value) {

			if (!that.enabled) { return true; }

			var condition, tested, empty, val, message, required = conditions["required"];

			// Avoid fields that aren't required when they are empty or de-activated
			if (!required && value === "" && that.active === false) { return {"status": true}; }

			if (that.enabled && (!that.active || value !== "" || required)) {
				/**
				* Triggers before start validation process.
				* @name ch.Validator#beforeValidate
				* @event
				* @public
				* @exampleDescription
				* @example
				* widget.on("beforeValidate",function(){
				*	submitButton.disable();
				* });
				*/
				// old callback system
				that.callbacks('beforeValidate');
				// new callback
				that.trigger("beforeValidate");

				// for each condition
				for (condition in conditions){

					val = ((condition === "required") ? that.element : value.toLowerCase());
					// this is the validation
					tested = test.call(this, condition, val);

					// return false if any test fails,
					if (!tested) {

						/**
						* Triggers when an error occurs on the validation process.
						* @name ch.Validator#error
						* @event
						* @public
						* @exampleDescription
						* @example
						* widget.on("error",function(event, condition){
						*	errorModal.show();
						* });
						*/
						// old callback system
						that.callbacks('onError', condition);
						// new callback
						that.trigger("error", condition);

						that.active = true;

						// stops the proccess
						//return false;
						return {
							"status": false,
							"condition": condition,
							"msg": conditions[condition].message
						}
					};
				}
			}

			// Status OK (with previous error)
			if (that.active || !that.enabled) {
				// Public status OK
				that.active = false;
			}

			/**
			* Triggers when the validation process ends.
			* @name ch.Validator#afterValidate
			* @event
			* @public
			* @exampleDescription
			* @example
			* widget.on("afterValidate",function(){
			*	submitButton.disable();
			* });
			*/
			// old callback system
			that.callbacks('afterValidate');
			// new callback
			that.trigger("afterValidate");

			// It's all good ;)
			//return true;
			return {
				"status": true
			}
		}

		/**
		* Test a condition looking for error.
		* @private
		* @name ch.Validator#test
		* @see ch.Condition
		*/
		var test = function(condition, value){

			if (value === "" && condition !== "required") { return true };

			var isOk = false,
				// this is the validation
				validation = this || window,
				condition = conditions[condition];

			isOk = condition.test.call(validation, value);

			return isOk;

		};

	/**
	* Protected Members
	*/

		/**
		* Flag that let you know if there's a validation going on.
		* @protected
		* @name ch.Validator#active
		* @type boolean
		*/
		that.active = false;

		/**
		* Flag that let you know if the all conditions are enabled or not.
		* @protected
		* @name ch.Validator#enabled
		* @type boolean
		*/
		that.enabled = true;

	/**
	*	Public Members
	*/

		/**
		* @borrows ch.Widget#uid as ch.TabNavigator#uid
		*/

		/**
		* This public property defines the component type. All instances are saved into a 'map', grouped by its type. You can reach for any or all of the components from a specific type with 'ch.instances'.
		* @public
		* @name ch.Validator#type
		* @type String
		*/
		that["public"].type = "validator";

		/**
		* This public Map saves all the validation configurations from this instance.
		* @public
		* @name ch.Validator#conditions
		* @type object
		*/
		that["public"].conditions = conditions;

		/**
		* Active is a boolean property that let you know if there's a validation going on.
		* @public
		* @function
		* @name ch.Validator#isActive
		* @returns itself
		*/
		that["public"].isActive = function() {
			return that.active;
		};

		/**
		* Let you keep chaining methods.
		* @public
		* @function
		* @name ch.Validator#and
		* @returns Object
		*/
		that["public"].and = function(){
			return that.$element;
		};

		/**
		* Merge its conditions with a new conditions of another instance with the same trigger.
		* @public
		* @function
		* @name ch.Validator#extend
		* @returns itself
		*/
		that["public"].extend = function(condition){

			conditions[condition.name] = ch.Condition.call(that["public"], condition);

			return that["public"];
		};

		/**
		* Clear all active validations.
		* @public
		* @function
		* @name ch.Validator#clear
		* @returns itself
		*/
		that["public"].clear = function() {
			that.active = false;

			return that["public"];
		};

		/**
		* Runs all configured conditions and returns an object with a status value, condition name and a message.
		* @public
		* @function
		* @name ch.Validator#validate
		* @returns Status Object
		*/
		that["public"].validate = function(value){
			// this is the validation
			return validate.call(this, value);
		}

		/**
		* Turn on Validator engine or an specific condition.
		* @public
		* @name enable
		* @name ch.Validator#enable
		* @returns itself
		*/
		that["public"].enable = function(condition){
			if (condition && conditions[condition]){
				// Enable specific condition
				conditions[condition].enable();
			} else {
				// enable all
				that.enabled = true;
				for (condition in conditions){
					conditions[condition].enable();
				}
			}
			return that["public"];
		}

		/**
		* Turn on Validator engine or an specific condition.
		* @public
		* @name disable
		* @name ch.Validator#disable
		* @returns itself
		*/
		that["public"].disable = function(condition){
			if (condition && conditions[condition]){
				// disable specific condition
				conditions[condition].disable();
			} else {
				// disable all
				that.enabled = false;
				for (condition in conditions){
					conditions[condition].disable();
				}
			}
			return that["public"];
		}

	/**
	*	Default event delegation
	*/
		/**
		* Triggers when the component is ready to use.
		* @name ch.Validator#ready
		* @event
		* @public
		* @exampleDescription Following the first example, using <code>widget</code> as modal's instance controller:
		* @example
		* widget.on("ready",function(){
		*	this.show();
		* });
		*/
		that.trigger("ready");

		return that;
	}

	Validator.prototype.name = 'validator';
	Validator.prototype.constructor = Validator;

	ch.factory(Validator);

}(this, this.jQuery, this.ch));

/**
* Validation is a engine for HTML forms elements.
* @name Validation
* @class Validation
* @augments ch.Controls
* @requires ch.Form
* @requires ch.Validator
* @requires ch.Required
* @requires ch.String
* @requires ch.Number
* @requires ch.Custom
* @memberOf ch
* @param {Object} [conf] Object with configuration properties.
* @param {String} [conf.content] Validation message.
* @param {String} [conf.points] Sets the points where validation-bubble will be positioned.
* @param {String} [conf.offset] Sets the offset in pixels that validation-bubble will be displaced from original position determined by points. It's specified by configuration or zero by default: "0 0".
* @param {String} [conf.context] It's a reference to position the validation-bubble.
* @returns itself
* @factorized
* @see ch.Controls
* @see ch.Form
* @see ch.Validator
* @see ch.Required
* @see ch.String
* @see ch.Number
* @see ch.Custom
*/

(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	var setTimeout = window.setTimeout,
		setInterval = window.setInterval,
		$document = $(window.document);

	function Validation($el, conf) {

		/**
		* Reference to a internal component instance, saves all the information and configuration properties.
		* @protected
		* @name ch.Validation#that
		* @type itself
		*/
		var that = this;

		that.$element = $el;
		that.element = $el[0];
		that.type = 'validation';
		conf = conf || {};

		conf = ch.util.clone(conf);

		// Configuration by default
		conf.offset = conf.offset || "10 0";
		conf.points = conf.points || "lt rt";

		that.conf = conf;

	/**
	* Inheritance
	*/

		that = ch.Controls.call(that);
		that.parent = ch.util.clone(that);

	/**
	* Private Members
	*/

		// Reference to a Validator instance. If there isn't any, the Validation instance will create one.
		var validator = that.validator = (function(){
			var c = {};
				c.condition = conf.condition;

		 	return that.$element.validator(c)['public'];
		})();

		// Reference to a Form instance. If there isn't any, the Validation instance will create one.
		var form = that.form = (function() {

			if (ch.util.hasOwn(ch.instances, "form")) {
				for (var instance in ch.instances.form) {
					if (ch.instances.form[instance].element === that.$element.parents("form")[0]) {

						return ch.instances.form[instance]; // Get my parent
					}
				}
			}

			var instance = that.$element.parents("form").form();

			for (var i in ch.instances.form) {
				if (ch.instances.form[i].element === instance.element) {

					return ch.instances.form[i]; // Get my parent
				}
			}

		})();

		form.children.push(that["public"]);

		/**
		* Validation event
		* @private
		* @name ch.Validation#validationEvent
		*/
		var validationEvent = (that.$element.hasClass("options") || that.$element.hasClass("ch-form-options") || that.element.tagName == "SELECT" || ( that.element.tagName == "INPUT" && that.element.type === 'range') ) ? "change" : "blur";

		var clear = function() {

			that.$element.removeClass("ch-form-error");
			that["float"].innerHide();

			validator.clear();

			/**
			* Triggers when al validations are cleared.
			* @name ch.Validation#clear
			* @event
			* @public
			* @exampleDescription Title
			* @example
			* widget.on("clear",function(){
			*	submitButton.enable();
			* });
			*/
			// old callback system
			that.callbacks('onClear');
			// new callback
			that.trigger("clear");
		};

	/**
	* Protected Members
	*/

		/**
		* Flag that let you know if the validations is enabled or not.
		* @protected
		* @name ch.Validation#enabled
		* @type boolean
		*/
		that.enabled = true;

		/**
		* Reference to the Float component instanced.
		* @protected
		* @type Object
		* @name ch.Validation#float
		*/



		that["float"] = that.createFloat({
			"$element": (function() {
				var reference;
				// CHECKBOX, RADIO
				// TODO: when old forms be deprecated we must only support ch-form-options class
				if (that.$element.hasClass("options") || that.$element.hasClass("ch-form-options")) {
					// Helper reference from will be fired
					// H4
					if (that.$element.find("h4").length > 0) {
						var h4 = that.$element.find("h4"); // Find h4
							h4.wrapInner("<span>"); // Wrap content with inline element
						reference = h4.children(); // Inline element in h4 like helper reference
					// Legend
					} else if (that.$element.prev().prop("tagName") == "LEGEND") {
						reference = that.$element.prev(); // Legend like helper reference
					} else {
						reference = $(that.$element.find("label")[0]);
					}
				// INPUT, SELECT, TEXTAREA
				} else {
					reference = that.$element;
				}

				return reference;
			})(),
			"type": "validation",
			"content": "Error.",
			"classes": conf.classes || "ch-box-error",
			"cone": true,
			"cache": false,
			"closable": false,
			"aria": {
				"role": "alert"
			},
			"offset": conf.offset,
			"points": conf.points,
			"reposition": false
		});


		/**
		* Stores the error object
		* @protected
		* @type Object
		* @name ch.Validation#error
		*/
		that.error = {
			"condition": false,
			"msg": ""
		}

		/**
		* Runs all validations to check if it has an error.
		* @protected
		* @type function
		* @returns boolean
		* @name ch.Validation#process
		*/
		that.process = function (evt) {

			// Pre-validation: Don't validate disabled
			if (that.$element.attr("disabled") || !that.enabled) { return false; }

			/**
			* Triggers before start validation process.
			* @name ch.Validation#beforeValidate
			* @event
			* @public
			* @exampleDescription
			* @example
			* widget.on("beforeValidate",function(event) {
			*	submitButton.disable();
			* });
			*/
			// old callback system
			that.callbacks('beforeValidate');
			// new callback
			that.trigger("beforeValidate");

			// Executes the validators engine with a specific value and returns an object.
			// Context is the validation
			var gotError = validator.validate.call(that["public"], that.element.value);

			// Save the validator's status.
			var status = !gotError.status;

			// If has Error...
			if (status) {

				if (that.$element.prop("tagName") === "INPUT" || that.$element.prop("tagName") === "TEXTAREA") {
					// TODO: remove error class when deprecate old forms only ch-form error must be.
					that.$element.addClass("ch-form-error");
				}

				// to avoid reload the same content
				if (!that["float"]["public"].isActive() || !that.error.condition || that.error.condition !== gotError.condition) {
					that["float"]["public"].show((gotError.msg || form.messages[gotError.condition] || "Error"));
					// the aria-label attr should get the message element id, but is not public
					that.$element.attr('aria-label', 'ch-' + that["float"]["public"].type + '-' + that["float"]["public"].uid );
				}

				// Add blur or change event only one time to the element or to the elements's group
				if (!that.$element.data("events")) { that.$element.one(validationEvent, function(evt){that.process(evt);}); }

				/**
				* Triggers when an error occurs on the validation process.
				* @name ch.Validation#error
				* @event
				* @public
				* @exampleDescription
				* @example
				* widget.on("error",function(event, condition) {
				*	if (condition === "required") {
				* 		errorModal.show();
				* 	}
				* });
				*/
				// old callback system
				that.callbacks('onError', gotError.condition);
				// new callback
				that.trigger("error", gotError.condition);

				// Saves gotError
				that.error = gotError;

			// else NOT Error!
			} else {
				that.$element.removeClass("ch-form-error");
				that.$element.removeAttr('aria-label');
				that["float"].innerHide();
				form.trigger('validated');
			}

			/**
			* Triggers when the validation process ends.
			* @name ch.Validation#afterValidate
			* @event
			* @public
			* @exampleDescription
			* @example
			* widget.on("afterValidate",function(){
			*	submitButton.disable();
			* });
			*/
			// old callback system
			that.callbacks('afterValidate');
			// new callback
			that.trigger("afterValidate");

			return status;

		};

	/**
	*	Public Members
	*/

		/**
		* The 'uid' is the Chico's unique instance identifier. Every instance has a different 'uid' property. You can see its value by reading the 'uid' property on any public instance.
		* @public
		* @name ch.Validation#uid
		* @type number
		*/

		/**
		* Reference to a DOM Element. This binding between the component and the HTMLElement, defines context where the component will be executed. Also is usual that this element triggers the component default behavior.
		* @public
		* @name ch.Validation#element
		* @type HTMLElement
		*/

		/**
		* This public property defines the component type. All instances are saved into a 'map', grouped by its type. You can reach for any or all of the components from a specific type with 'ch.instances'.
		* @public
		* @name ch.Validation#type
		* @type string
		*/
		that["public"].type = "validation"; // Everything is a "validation" type, no matter what interface is used

		/**
		* Deprecated: Used by the helper's positioner to do his magic.
		* @public
		* @deprecated
		* @name ch.Validation#reference
		* @type jQuery Object
		* @TODO: remove 'reference' from public scope
		*/
		//that["public"].reference = that.$reference;

		/**
		* Run all configured validations.
		* @public
		* @function
		* @name ch.Validation#hasError
		* @returns boolean
		*/
		that["public"].hasError = function(){
			return that.process();
		}

		/**
		* Run all configured validations.
		* @public
		* @function
		* @name ch.Validation#validate
		* @returns boolean
		*/
		that["public"].validate = function(){
			that.process();

			return that["public"];
		}

		/**
		* Clear all active validations.
		* @public
		* @name ch.Validation#clear
		* @function
		* @returns itself
		*/
		that["public"].clear = function() {
			clear();

			return that["public"];
		};

		/**
		* Let you keep chaining methods.
		* @public
		* @name ch.Validation#and
		* @function
		* @returns jQuery Object
		*/
		that["public"].and = function(){
			return that.$element;
		};

		/**
		* Is the little sign that floats showing the validation message. Is a Float component, so you can change it's content, width or height and change its visibility state.
		* @public
		* @name ch.Validation#form
		* @type ch.Form
		* @see ch.Form
		*/
		that["public"].form = form;

		/**
		* Is the little sign that floats showing the validation message. Is a Float component, so you can change it's content, width or height and change its visibility state.
		* @public
		* @name ch.Validation#validator
		* @type ch.Validator
		* @see ch.Validator
		*/
		that["public"].validator = validator;

		/**
		* Is the little sign that floats showing the validation message. Is a Float component, so you can change it's content, width or height and change its visibility state.
		* @public
		* @Deprecated
		* @name ch.Validation#helper
		* @type ch.Helper
		* @see ch.Floats
		*/
		that["public"].helper = that["float"]["public"];

		/**
		* Is the little sign that floats showing the validation message. Is a Float component, so you can change it's content, width or height and change its visibility state.
		* @public
		* @since 0.10.2
		* @name float
		* @memberOf ch.Validation
		* @type ch.Floats
		* @see ch.Floats
		*/
		that["public"]["float"] = that["float"]["public"];

		/**
		* Turn on Validation and Validator engine or an specific condition.
		* @public
		* @name ch.Validation#enable
		* @function
		* @returns itself
		* @see ch.Validator
		*/
		that["public"].enable = function(condition){
			validator.enable(condition);

			if (!condition) {
				that.enabled = true;
			}

			return that["public"];
		};

		/**
		* Turn off Validation and Validator engine or an specific condition.
		* @public
		* @name ch.Validation#disable
		* @function
		* @returns itself
		* @see ch.Validator
		*/
		that["public"].disable = function (condition) {
			// Clean the validation if is active;
			clear();

			// Turn off validator
			validator.disable(condition);

			// Turn off validation, if all conditions are disabled
			if (!condition){
				that.enabled = false;
			}

			return that["public"];
		};

		/**
		* Turn on/off the Validation and Validator engine.
		* @public
		* @since 0.10.4
		* @name ch.Validation#toggleEnable
		* @function
		* @returns itself
		* @see ch.Validator
		*/
		that["public"].toggleEnable = function () {

			if (that.enabled) {
				that["public"].disable();
			} else {
				that["public"].enable();
			}

			return that["public"];
		};

		/**
		* Turn off Validation and Validator engine or an specific condition.
		* @public
		* @name ch.Validation#isActive
		* @function
		* @returns boolean
		* @see ch.Validator
		*/
		that["public"].isActive = function(){
			return validator.isActive();
		};

		/**
		* Sets or gets positioning configuration. Use it without arguments to get actual configuration. Pass an argument to define a new positioning configuration.
		* @public
		* @since 0.10.4
		* @name ch.Validation#position
		* @function
		* @returns itself
		* @exampleDescription Change validaton bubble's position.
		* @example
		* validation.position({
		*	  offset: "0 10",
		*	  points: "lt lb"
		* });
		*/
		that["public"].position = function (o) {

			if (o === undefined) { return that["float"].position(); }

			that["float"]["public"].position(o);

			return that["public"];
		};

		/**
		* Sets or gets conditions messages
		* @public
		* @since 0.10.4
		* @name ch.Validation#message
		* @function
		* @returns itself
		* @exampleDescription Sets a new message
		* @example
		* validation.message("required", "New message for required validation");
		* @exampleDescription Gets a message from a condition
		* @example
		* validation.message("required");
		*/
		that["public"].message = function (condition, msg) {
			if (condition === undefined) {
				throw "validation.message(condition, message): Please, give me a condition as parameter.";
			}

			// Get a new message from a condition
			if (msg === undefined) {
				return validator.conditions[condition].message;
			}

			// Sets a new message
			validator.conditions[condition].message = msg;

			if (validator.isActive()) {
				that["public"]["float"].content(msg);
			}

			return that["public"];
		}

		that['public'].and = function () {
			return that.$element;
		}

	/**
	*	Default event delegation
	*/

		/**
		* Triggers when the component is ready to use.
		* @name ch.Validation#ready
		* @event
		* @public
		* @exampleDescription Following the first example, using <code>widget</code> as modal's instance controller:
		* @example
		* widget.on("ready",function(){
		*	this.show();
		* });
		*/
		setTimeout(function(){ that.trigger("ready")}, 50);

		that.on('exists', function (e, data){

			var condition = {
				'name': data.type
			};

			if(data.options !== undefined){
				if(data.options.content){
					condition.message = data.options.content;
				}

				if (data.options.num) {
					condition.num = data.options.num;
				}

				if (data.options.fn) {
					condition.fn = data.options.fn;
				}
			}

			validator.extend(condition);

		});

		return that['public'];
	}

	Validation.prototype.name = 'validation';
	Validation.prototype.constructor = Validation;

	ch.factory(Validation);

}(this, this.jQuery, this.ch));

/**
* Custom creates a validation interface for validation engine.
* @name Custom
* @class Custom
* @augments ch.Controls
* @augments ch.Validation
* @memberOf ch
* @param {Object} [conf] Object with configuration properties.
* @param {String} [conf.content] Validation message.
* @param {String} [conf.points] Sets the points where validation-bubble will be positioned.
* @param {String} [conf.offset] Sets the offset in pixels that validation-bubble will be displaced from original position determined by points. It's specified by configuration or zero by default: "0 0".
* @param {String} [conf.context] It's a reference to position the validation-bubble
* @param {Function} [conf.fn] Custom function to evaluete a value.
* @returns itself
* @factorized
* @see ch.Validation
* @see ch.Required
* @see ch.Number
* @see ch.String
* @see ch.Validator
* @see ch.Condition
* @exampleDescription Validate a even number
* @example
* var widget = $("input").custom(function (value) {
* 	return (value%2==0) ? true : false;
* }, "Enter a even number");
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function Custom($el, conf) {

		var conf = conf || {};

		if (!conf.fn) {
			alert("Custom Validation fatal error: Need a function to evaluate, try $().custom(function(){},\"Message\");");
		}

		// Define the conditions of this interface
		conf.condition = {
			// I don't have pre-conditions, comes within conf.fn argument
			name: "custom",
			fn: conf.fn,
			message: conf.content
		};

		return $el.validation(conf);
	}

	Custom.prototype.name = 'custom';
	Custom.prototype.constructor = Custom;
	Custom.prototype.interface = 'validation';

	ch.factory(Custom);

}(this, this.jQuery, this.ch));

/**
* Number validates a given number.
* @name Number
* @class Number
* @interface
* @augments ch.Controls
* @augments ch.Validation
* @memberOf ch
* @param {Object} [conf] Object with configuration properties.
* @param {String} [conf.content] Validation message.
* @param {String} [conf.points] Sets the points where validation-bubble will be positioned.
* @param {String} [conf.offset] Sets the offset in pixels that validation-bubble will be displaced from original position determined by points. It's specified by configuration or zero by default: "0 0".
* @param {String} [conf.context] It's a reference to position the validation-bubble
* @returns itself
* @factorized
* @see ch.Validation
* @see ch.Required
* @see ch.Custom
* @see ch.String
* @see ch.Validator
* @see ch.Condition
* @exampleDescription Create a number validation
* @example
* $("input").number("This field must be a number.");
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function Number($el, conf){

		var conf = conf || {};

		// Define the conditions of this interface
		conf.condition = {
			name: "number",
			message: conf.content
		};

		return $el.validation(conf);
	}

	Number.prototype.name = 'number';
	Number.prototype.constructor = Number;
	Number.prototype.interface = 'validation';

	ch.factory(Number);

}(this, this.jQuery, this.ch));


/**
* Min validates a number with a minimun value.
* @name Min
* @class Min
* @interface
* @augments ch.Controls
* @augments ch.Validation
* @requires ch.Validation
* @memberOf ch
* @param {Object} [conf] Object with configuration properties.
* @param {String} [conf.content] Validation message.
* @param {String} [conf.points] Sets the points where validation-bubble will be positioned.
* @param {String} [conf.offset] Sets the offset in pixels that validation-bubble will be displaced from original position determined by points. It's specified by configuration or zero by default: "0 0".
* @param {String} [conf.context] It's a reference to position the validation-bubble
* @param {Number} value Minimun number value.
* @returns itself
* @factorized
* @see ch.Validation
* @see ch.Required
* @see ch.Custom
* @see ch.String
* @see ch.Validator
* @see ch.Condition
* @exampleDescription
* @example
* $("input").min(10, "Write a number bigger than 10");
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function Min($el, conf) {

		var conf = conf || {};

		conf.condition = {
			name: "min",
			message: conf.content,
			num: conf.num
		};

		return $el.validation(conf);
	}

	Min.prototype.name = 'min';
	Min.prototype.constructor = Min;
	Min.prototype.interface = 'validation';

	ch.factory(Min);

}(this, this.jQuery, this.ch));

/**
* Max validates a number with a maximun value.
* @name Max
* @class Max
* @interface
* @augments ch.Controls
* @augments ch.Validation
* @requires ch.Validation
* @memberOf ch
* @param {Object} [conf] Object with configuration properties.
* @param {String} [conf.content] Validation message.
* @param {String} [conf.points] Sets the points where validation-bubble will be positioned.
* @param {String} [conf.offset] Sets the offset in pixels that validation-bubble will be displaced from original position determined by points. It's specified by configuration or zero by default: "0 0".
* @param {String} [conf.context] It's a reference to position the validation-bubble
* @param {Number} value Minimun number value.
* @returns itself
* @factorized
* @see ch.Validation
* @see ch.Required
* @see ch.Custom
* @see ch.String
* @see ch.Validator
* @see ch.Condition
* @exampleDescription
* @example
* $("input").max(10, "Write a number smaller than 10");
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function Max($el, conf) {

		var conf = conf || {};

		conf.condition = {
			name: "max",
			message: conf.content,
			num: conf.num
		};

		return $el.validation(conf);

	}

	Max.prototype.name = 'max';
	Max.prototype.constructor = Max;
	Max.prototype.interface = 'validation';

	ch.factory(Max);

}(this, this.jQuery, this.ch));

/**
* Price validates a number like the price format.
* @name Price
* @class Price
* @interface
* @augments ch.Controls
* @augments ch.Validation
* @requires ch.Validation
* @memberOf ch
* @param {Object} [conf] Object with configuration properties.
* @param {String} [conf.content] Validation message.
* @param {String} [conf.points] Sets the points where validation-bubble will be positioned.
* @param {String} [conf.offset] Sets the offset in pixels that validation-bubble will be displaced from original position determined by points. It's specified by configuration or zero by default: "0 0".
* @param {String} [conf.context] It's a reference to position the validation-bubble
* @returns itself
* @factorized
* @see ch.Validation
* @see ch.Required
* @see ch.Custom
* @see ch.String
* @see ch.Validator
* @see ch.Condition
* @exampleDescription
* @example
* $("input").price("Write valid price.");
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function Price($el, conf) {

		var conf = conf || {};

		conf.condition = {
			name: "price",
			message: conf.content
		};

		return $el.validation(conf);

	}

	Price.prototype.name = 'price';
	Price.prototype.constructor = Price;
	Price.prototype.interface = 'validation';

	ch.factory(Price);

}(this, this.jQuery, this.ch));

/**
* String validates a given text as string.
* @name String
* @class String
* @interface
* @augments ch.Controls
* @augments ch.Validation
* @memberOf ch
* @param {Object} [conf] Object with configuration properties.
* @param {String} [conf.content] Validation message.
* @param {String} [conf.points] Sets the points where validation-bubble will be positioned.
* @param {String} [conf.offset] Sets the offset in pixels that validation-bubble will be displaced from original position determined by points. It's specified by configuration or zero by default: "0 0".
* @param {String} [conf.context] It's a reference to position the validation-bubble
* @returns itself
* @factorized
* @see ch.Validation
* @see ch.Required
* @see ch.Custom
* @see ch.Number
* @see ch.Validator
* @see ch.Condition
* @exampleDescription Create a string validation
* @example
* $("input").string("This field must be a string.");
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function String($el, conf) {

		var conf = conf || {};

		conf.condition = {
			name: "string",
			message: conf.content
		};

		return $el.validation(conf);

	}

	String.prototype.name = 'string';
	String.prototype.constructor = String;
	String.prototype.interface = 'validation';

	ch.factory(String);

}(this, this.jQuery, this.ch));

/**
* Email validates a correct email syntax.
* @name Email
* @class Email
* @interface
* @augments ch.Controls
* @augments ch.Validation
* @requires ch.Validation
* @memberOf ch
* @param {Object} [conf] Object with configuration properties.
* @param {String} [conf.content] Validation message.
* @param {String} [conf.points] Sets the points where validation-bubble will be positioned.
* @param {String} [conf.offset] Sets the offset in pixels that validation-bubble will be displaced from original position determined by points. It's specified by configuration or zero by default: "0 0".
* @param {String} [conf.context] It's a reference to position the validation-bubble
* @returns itself
* @factorized
* @see ch.Validation
* @see ch.Required
* @see ch.Custom
* @see ch.Number
* @see ch.Validator
* @see ch.Condition
* @exampleDescription Create a email validation
* @example
* $("input").email("This field must be a valid email.");
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function Email($el, conf) {

		var conf = conf || {};

		// OLD RegExp
		// /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/,
		conf.condition = {
			name: "email",
			message: conf.content
		};

		return $el.validation(conf);

	}

	Email.prototype.name = 'email';
	Email.prototype.constructor = Email;
	Email.prototype.interface = 'validation';

	ch.factory(Email);

}(this, this.jQuery, this.ch));



/**
* Url validates URL syntax.
* @name Url
* @class Url
* @interface
* @augments ch.Controls
* @augments ch.Validation
* @requires ch.Validation
* @memberOf ch
* @param {Object} [conf] Object with configuration properties.
* @param {String} [conf.content] Validation message.
* @param {String} [conf.points] Sets the points where validation-bubble will be positioned.
* @param {String} [conf.offset] Sets the offset in pixels that validation-bubble will be displaced from original position determined by points. It's specified by configuration or zero by default: "0 0".
* @param {String} [conf.context] It's a reference to position the validation-bubble
* @returns itself
* @factorized
* @see ch.Validation
* @see ch.Required
* @see ch.Custom
* @see ch.Number
* @see ch.Validator
* @see ch.Condition
* @exampleDescription Create a URL validation
* @example
* $("input").url("This field must be a valid URL.");
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function URL($el, conf) {

		var conf = conf || {};

		conf.condition = {
			name: "url",
			message: conf.content
		};

		return $el.validation(conf);

	}

	URL.prototype.name = 'url';
	URL.prototype.constructor = URL;
	URL.prototype.interface = 'validation';

	ch.factory(URL);

}(this, this.jQuery, this.ch));

/**
* MinLength validates a minimun amount of characters.
* @name MinLength
* @class MinLength
* @interface
* @augments ch.Controls
* @augments ch.Validation
* @requires ch.Validation
* @memberOf ch
* @param {Object} [conf] Object with configuration properties.
* @param {String} [conf.content] Validation message.
* @param {String} [conf.points] Sets the points where validation-bubble will be positioned.
* @param {String} [conf.offset] Sets the offset in pixels that validation-bubble will be displaced from original position determined by points. It's specified by configuration or zero by default: "0 0".
* @param {String} [conf.context] It's a reference to position the validation-bubble
* @param {Number} num Minimun number characters.
* @returns itself
* @factorized
* @see ch.Validation
* @see ch.Required
* @see ch.Custom
* @see ch.Number
* @see ch.Validator
* @see ch.Condition
* @exampleDescription Create a minLength validation
* @example
* $("input").minLength(10, "At least 10 characters..");
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function MinLength($el, conf) {

		var conf = conf || {};

		conf.condition = {
			name: "minLength",
			message: conf.content,
			num: conf.num
		};

		return $el.validation(conf);

	}

	MinLength.prototype.name = 'minLength';
	MinLength.prototype.constructor = MinLength;
	MinLength.prototype.interface = 'validation';

	ch.factory(MinLength);

}(this, this.jQuery, this.ch));

/**
* MaxLength validates a maximun amount of characters.
* @name MaxLength
* @class MaxLength
* @interface
* @augments ch.Controls
* @augments ch.Validation
* @requires ch.Validation
* @memberOf ch
* @param {Object} [conf] Object with configuration properties.
* @param {String} [conf.content] Validation message.
* @param {String} [conf.points] Sets the points where validation-bubble will be positioned.
* @param {String} [conf.offset] Sets the offset in pixels that validation-bubble will be displaced from original position determined by points. It's specified by configuration or zero by default: "0 0".
* @param {String} [conf.context] It's a reference to position the validation-bubble
* @param {Number} num Maximun number of characters.
* @returns itself
* @factorized
* @see ch.Validation
* @see ch.Required
* @see ch.Custom
* @see ch.Number
* @see ch.Validator
* @see ch.Condition
* @exampleDescription Create a maxLength validation
* @example
* $("input").maxLength(10, "No more than 10 characters..");
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function MaxLength($el, conf) {

		var conf = conf || {};

		conf.condition = {
			name: "maxLength",
			message: conf.content,
			num: conf.num
		};

		return $el.validation(conf);

	}

	MaxLength.prototype.name = 'maxLength';
	MaxLength.prototype.constructor = MaxLength;
	MaxLength.prototype.interface = 'validation';

	ch.factory(MaxLength);

}(this, this.jQuery, this.ch));

/**
* Required validates that a must be filled.
* @name Required
* @class Required
* @interface
* @augments ch.Controls
* @augments ch.Validation
* @memberOf ch
* @param {Object} [conf] Object with configuration properties.
* @param {String} [conf.content] Validation message.
* @param {String} [conf.points] Sets the points where validation-bubble will be positioned.
* @param {String} [conf.offset] Sets the offset in pixels that validation-bubble will be displaced from original position determined by points. It's specified by configuration or zero by default: "0 0".
* @param {String} [conf.context] It's a reference to position the validation-bubble
* @returns itself
* @factorized
* @see ch.Validation
* @see ch.Custom
* @see ch.Number
* @see ch.String
* @see ch.Validator
* @see ch.Condition
* @exampleDescription Simple validation
* @example
* $("input").required("This field is required");
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function Required($el, conf) {

		var conf = conf || {};

		conf.condition = {
			name: "required",
			message: conf.content
			//,value: conf.value
		};

		return $el.validation(conf);

	}

	Required.prototype.name = 'required';
	Required.prototype.constructor = Required;
	Required.prototype.interface = 'validation';

	ch.factory(Required);

}(this, this.jQuery, this.ch));

/**
* Expandable lets you show or hide the content. Expandable needs a pair: the title and the content related to that title.
* @name Expandable
* @class Expandable
* @augments ch.Navs
* @see ch.Dropdown
* @see ch.TabNavigator
* @see ch.Navs
* @standalone
* @memberOf ch
* @param {Object} [conf] Object with configuration properties.
* @param {Boolean} [conf.open] Shows the expandable open when component was loaded. By default, the value is false.
* @param {Boolean} [conf.fx] Enable or disable UI effects. By default, the effects are disable.
* @returns itself
* @factorized
* @exampleDescription Create a new expandable without configuration.
* @example
* var widget = $(".example").expandable();
* @exampleDescription Create a new expandable with configuration.
* @example
* var widget = $(".example").expandable({
*     "open": true,
*     "fx": true
* });
*/

(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function Expandable($el, conf) {

		/**
		 * Reference to a internal component instance, saves all the information and configuration properties.
		 * @private
		 * @name ch.Expandable#that
		 * @type object
		 */
		var that = this;

		that.$element = $el;
		that.element = $el[0];
		that.type = 'expandable';
		conf = conf || {};

		conf = ch.util.clone(conf);
		that.conf = conf;

		/**
		 *	Inheritance
		 */

		that = ch.Navs.call(that);
		that.parent = ch.util.clone(that);

		/**
		 *  Protected Members
		 */
		var $nav = that.$element.children(),
			triggerAttr = {
				"aria-expanded": conf.open,
				"aria-controls":"ch-expandable-" + that.uid
			},
			contentAttr = {
				"id": triggerAttr["aria-controls"],
				"aria-hidden": !triggerAttr["aria-expanded"]
			};

		/**
		 * The component's trigger.
		 * @protected
		 * @name ch.Expandable#$trigger
		 * @type jQuery
		 */
		that.$trigger = that.$trigger.attr(triggerAttr);

		/**
		 * The component's trigger.
		 * @protected
		 * @name ch.Expandable#$content
		 * @type jQuery
		 */
		that.$content = $nav.eq(1).attr(contentAttr);

		/**
		 * Shows component's content.
		 * @protected
		 * @function
		 * @name ch.Expandable#innerShow
		 * @returns itself
		 */
		that.innerShow = function(event){
			that.$trigger.attr("aria-expanded","true");
			that.$content.attr("aria-hidden","false");
			that.parent.innerShow();
			return that;
		}

		/**
		 * Hides component's content.
		 * @protected
		 * @function
		 * @name ch.Expandable#innerHide
		 * @returns itself
		 */
		that.innerHide = function(event){
			that.$trigger.attr("aria-expanded","false");
			that.$content.attr("aria-hidden","true");
			that.parent.innerHide();
			return that;
		}


		/**
		 *  Public Members
		 */

		/**
		 * @borrows ch.Widget#uid as ch.Expandable#uid
		 * @borrows ch.Widget#element as ch.Expandable#element
		 * @borrows ch.Widget#type as ch.Expandable#type
		 * @borrows ch.Navs#show as ch.Expandable#show
		 * @borrows ch.Navs#hide as ch.Expandable#hide
		 */

		/**
		 *  Default event delegation
		 */

		that.$trigger.children().attr("role","presentation");
		ch.util.avoidTextSelection(that.$trigger);

		/**
		 * Triggers when the component is ready to use (Since 0.8.0).
		 * @name ch.Expandable#ready
		 * @event
		 * @public
		 * @since 0.8.0
		 * @exampleDescription Following the first example, using <code>widget</code> as expandable's instance controller:
		 * @example
		 * widget.on("ready",function () {
		 *	this.show();
		 * });
		 */
		window.setTimeout(function(){ that.trigger("ready") }, 50);

		return that['public'];

	}

	Expandable.prototype.name = 'expandable';
	Expandable.prototype.constructor = Expandable;

	ch.factory(Expandable);

	$.fn.expando = $.fn.expandable;

}(this, this.jQuery, this.ch));

/**
* Dropdown shows a list of options for navigation.
* @name Dropdown
* @class Dropdown
* @augments ch.Navs
* @requires ch.Positioner
* @see ch.Navs
* @see ch.Positioner
* @see ch.Expando
* @see ch.TabNavigator
* @memberOf ch
* @param {Object} [conf] Object with configuration properties.
* @param {Boolean} [conf.open] Shows the dropdown open when component was loaded. By default, the value is false.
* @param {Boolean} [conf.icon] Shows an arrow as icon. By default, the value is true.
* @param {String} [conf.points] Sets the points where component will be positioned, specified by configuration or centered by default: "cm cm".
* @param {Boolean} [conf.fx] Enable or disable UI effects. By default, the effects are disable.
* @returns itself
* @factorized
* @exampleDescription Create a new dropdown without configuration.
* @example
* var widget = $(".example").dropdown();
* @exampleDescription Create a new dropdown with configuration.
* @example
* var widget = $(".example").dropdown({
*     "open": true,
*     "icon": false,
*     "points": "lt lt",
*     "fx": true
* });
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	var $document = $(window.document);

	function Dropdown($el, conf) {
		/**
		 * Reference to a internal component instance, saves all the information and configuration properties.
		 * @private
		 * @name ch.Dropdown#that
		 * @type object
		 */
		var that = this;

		that.$element = $el;
		that.element = $el[0];
		that.type = 'dropdown';
		conf = conf || {};

		conf = ch.util.clone(conf);

		conf.reposition = ch.util.hasOwn(conf, "reposition") ? conf.reposition : true;

		that.conf = conf;

		/**
		 *	Inheritance
		 */

		that = ch.Navs.call(that);
		that.parent = ch.util.clone(that);

		/**
		 *  Private Members
		 */


		/**
		 *  Protected Members
		 */

		/**
		 * The component's trigger.
		 * @protected
		 * @name ch.Dropdown#$trigger
		 * @type jQuery
		 */
		that.$trigger = (function () {

			var $el = that.$trigger;

			if (!that.$element.hasClass("ch-dropdown-skin")) {
				$el.addClass("ch-btn-skin ch-btn-small");
			}

			return $el;

		}());

		/**
		 * The component's content.
		 * @protected
		 * @name ch.Dropdown#$content
		 * @type jQuery
		 */
		that.$content = (function () {

			// jQuery Object
			var $content = that.$content
			// Prevent click on content (except links)
				.bind("click", function(event) {
					if ((event.target || event.srcElement).tagName === "A") {
						that.innerHide();
					}
					event.stopPropagation();
				})
			// WAI-ARIA properties
				.attr({ "role": "menu", "aria-hidden": "true" });

			// WAI-ARIA for options into content
			$content.children("a").attr("role", "menuitem");

			// Position
			that.position = ch.Positioner({
				"element": $content,
				"context": that.$trigger,
				"points": (conf.points || "lt lb"),
				"offset": "0 -1",
				"reposition": conf.reposition
			});

			return $content;
		}());


		/**
		 * Dropdown options.
		 * @protected
		 * @jQuery Collection
		 * @name ch.Dropdown#$options
		 */
		that.$options = that.$content.find("a");


		/**
		 * Keyboard events object.
		 * @protected
		 * @Object
		 * @name ch.Dropdown#shortcuts
		 */
		that.shortcuts = (function () {
			var selected,
				map = {},
				arrow,
				optionsLength = that.$options.length,
				selectOption = function (key, event) {
					// Validations
					if (!that.active) { return; }

					// Prevent default behaivor
					ch.util.prevent(event);

					// Sets the arrow that user press
					arrow = key.type;

					// Sets limits behaivor
					if (selected === (arrow === "down_arrow" ? optionsLength - 1 : 0)) { return; }

					// Unselects current option
					that.$options[selected].blur();

					if (arrow === "down_arrow") { selected += 1; } else { selected -= 1; }

					// Selects new current option
					that.$options[selected].focus();
				};

			return function () {
				// Keyboard support initialize
				selected = 0;

				// Item selected by mouseover
				$.each(that.$options, function (i, e) {
					$(e).bind("mouseenter", function () {
						that.$options[selected = i].focus();
					});
				});

				// Creates keyboard shortcuts map and binding events
				map["click " + ch.events.key.ESC] = function () { that.innerHide(); };
				map[ch.events.key.UP_ARROW + " " +ch.events.key.DOWN_ARROW] = selectOption;
				$document.on(map);
			}
		}());

		/**
		 * Shows component's content.
		 * @protected
		 * @function
		 * @name ch.Dropdown#innerShow
		 * @returns itself
		 */
		that.innerShow = function (event) {

			// Stop propagation
			ch.util.prevent(event);

			// Z-index of content and updates aria values
			that.$content.css("z-index", ch.util.zIndex += 1).attr("aria-hidden", "false");

			// Z-index of trigger over content (secondary / skin dropdown)
			if (that.$element.hasClass("ch-dropdown-skin")) { that.$trigger.css("z-index", ch.util.zIndex += 1); }

			// Inheritance innerShow
			that.parent.innerShow(event);

			// Refresh position
			that.position("refresh");

			// Reset all dropdowns except itself
			$.each(ch.instances.dropdown, function (i, e) {
				if (e.uid !== that.uid) { e.hide(); }
			});

			that.$options[0].focus();

			return that;
		};

		/**
		 * Hides component's content.
		 * @protected
		 * @function
		 * @name ch.Dropdown#innerHide
		 * @returns itself
		 */
		that.innerHide = function (event) {

			// Inheritance innerHide
			that.parent.innerHide(event);

			// Updates aria values
			that.$content.attr("aria-hidden", "true");

			return that;
		};

		/**
		 *  Public Members
		 */

		/**
		 * @borrows ch.Widget#uid as ch.Menu#uid
		 * @borrows ch.Widget#element as ch.Menu#element
		 * @borrows ch.Widget#type as ch.Menu#type
		 * @borrows ch.Navs#show as ch.Dropdown#type
		 * @borrows ch.Navs#hide as ch.Dropdown#hide
		 */

		/**
		 * Positioning configuration.
		 * @public
		 * @name ch.Dropdown#position
		 * @function
		 */
		that["public"].position = that.position;

		/**
		 *  Default event delegation
		 */

		ch.util.avoidTextSelection(that.$trigger);

		// Inits keyboards support
		that.shortcuts();

		/**
		 * Triggers when the component is ready to use (Since 0.8.0).
		 * @name ch.Dropdown#ready
		 * @event
		 * @public
		 * @since 0.8.0
		 * @exampleDescription Following the first example, using <code>widget</code> as dropdown's instance controller:
		 * @example
		 * widget.on("ready",function () {
		 *	this.show();
		 * });
		 */
		window.setTimeout(function(){ that.trigger("ready")}, 50);

		return that['public'];
	}

	Dropdown.prototype.name = 'dropdown';
	Dropdown.prototype.constructor = Dropdown;

	ch.factory(Dropdown);

}(this, this.jQuery, this.ch));

/**
* Blink lets you give visual feedback to the user. Blink can be used when the user performs some action that changes some data at the screen. Blink creates a visual highlight changing background color from yellow to white.
* @name Blink
* @class Blink
* @memberOf ch
* @param {Object} conf Configuration object
* @param {number} [conf.time] Amount of time to blink in milliseconds
* @returns jQuery Object
* @factorized
* @exampleDescription Blinks a element.
* @example
* var widget = $(".example").blink();
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function blink($el, conf) {

		conf = conf || {};

		var that = {},
			// Hex start level toString(16).
			level = 1,
			// Time, 200 miliseconds by default.
			t = conf.time || 200;

		that.$element = $el;
		that.element = $el[0];

		// Inner highlighter.
		function highlight () {
			// Let know everyone we are active.
			that.$element.addClass("ch-blink").attr("role","alert").attr("aria-live","polite");

			// Begin steps.
			window.setTimeout(step, t);
		};

		// Color iteration.
		function step () {
			// New hex level.
			var h = level.toString(16);
			// Change background-color, redraw().
			that.element.style.backgroundColor = '#FFFF' + h + h;
			// Itearate for all hex levels.
			if (level < 15) {
				// Increment hex level.
				level += 1;
				// Inner recursion.
				window.setTimeout(step, t);
			} else {
				// Stop right there...
				that.$element.removeClass("ch-blink").attr("aria-live","off").removeAttr("role");
			}
		};

		// Start a blink if the element isn't active.
		if (!that.$element.hasClass("ch-blink")) {
			highlight();
		}

		// Return the element so keep chaining things.
		return that.$element;
	}

	$.fn.blink = function (conf) {
		$.each(this, function (i, el) {
			blink($(el), conf);
		});
		return this;
	};

	ch.blink = blink;

}(this, this.jQuery, this.ch));

/**
* Tabs lets you create tabs for static and dynamic content.
* @name Tabs
* @class Tabs
* @augments ch.Widget
* @memberOf ch
* @param {Object} [conf] Object with configuration properties.
* @param {Number} [conf.selected] Selects a child that will be open when component was loaded. By default, the value is 1.
* @returns itself
* @factorized
* @exampleDescription Create a new Tab Navigator without configuration.
* @example
* var widget = $(".example").tabs();
* @exampleDescription Create a new Tab Navigator with configuration.
* @example
* var widget = $(".example").tabs({
*     "selected": 2
* });
* @see ch.Widget
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function Tabs($el, conf) {
		/**
		 * Reference to a internal component instance, saves all the information and configuration properties.
		 * @private
		 * @name ch.Tabs#that
		 * @type object
		 */
		var that = this;

		that.$element = $el;
		that.element = $el[0];
		that.type = 'tabs';
		conf = conf || {};

		conf = ch.util.clone(conf);

		that.conf = conf;

		/**
		 * Inheritance
		 */

		that = ch.Widget.call(that);
		that.parent = ch.util.clone(that);

	/**
	*	Private Members
	*/

		// Add CSS class to the main element
		that.$element.addClass("ch-tabs");

		/**
		* The actual location hash, is used to know if there's a specific tab selected.
		* @private
		* @name ch.Tabs#hash
		* @type string
		*/
		var hash = window.location.hash.replace("#!/", ""),

		/**
		* A boolean property to know if the some tag should be selected.
		* @private
		* @name ch.Tabs#hashed
		* @type boolean
		* @default false
		*/
			hashed = false,

		/**
		* Get wich tab is selected.
		* @private
		* @name ch.Tabs#selected
		* @type number
		*/
			selected = conf.selected || conf.num || undefined,

		/**
		* Create controller's children.
		* @private
		* @name ch.Tabs#createTabs
		* @function
		*/
			createTabs = function () {

				// Children
				that.$triggers.find("a").each(function (i, e) {

					// Tab context
					var tab = {};
						tab.type = tab.name = "tab";
						tab.element = e;
						tab.$element = $(e);
						tab.controller = that["public"];

					// Tab configuration
					var config = {};
						config.open = (selected === i);
						config.onShow = function () { selected = i; };

					if (ch.util.hasOwn(that.conf, "cache")) { config.cache = that.conf.cache; }

					/**
					* Fired when the content of one dynamic tab loads.
					* @name ch.Tabs#contentLoad
					* @event
					* @public
					*/
					if (ch.util.hasOwn(that.conf, "onContentLoad")) { config.onContentLoad = that.conf.onContentLoad; }

					/**
					* Fired when the content of one dynamic tab did not load.
					* @name ch.Tabs#contentError
					* @event
					* @public
					*/
					if (ch.util.hasOwn(that.conf, "onContentError")) { config.onContentError = that.conf.onContentError; }

					// Create Tabs
					that.children.push(ch.Tab.call(tab, config));

					// Bind new click to have control
					$(e).on("click", function (event) {
						ch.util.prevent(event);
						select(i);
					});

				});

				return;

			},

		/**
		* Select a child to show its content.
		* @name ch.Tabs#select
		* @private
		* @function
		*/
			select = function (index) {

					// Sets the tab's index
				var tab = that.children[index];

				// If select a tab that doesn't exist do nothing
				// Don't click me if I'm open
				if (!tab || index === selected) {
					return that;
				}

				// Hides the open tab
				if (typeof selected !== "undefined") {
					that.children[selected].innerHide();
				}

				// Shows the current tab
				tab.innerShow();

				// Updated selected index
				selected = index;

				//Change location hash
				window.location.hash = "#!/" + tab.$content.attr("id");

				/**
				* Fired when a tab is selected.
				* @name ch.Tabs#select
				* @event
				* @public
				*/
				that.trigger("select");

				// Callback
				that.callbacks("onSelect");

				return that;
			};

	/**
	*	Protected Members
	*/

		/**
		* Collection of children.
		* @name ch.Form#children
		* @type {Array}
		*/
		that.children = [];


		/**
		* The component's triggers container.
		* @protected
		* @name ch.Tabs#$triggers
		* @type jQuery
		*/
		that.$triggers = that.$element.children(":first").addClass("ch-tabs-triggers").attr("role", "tablist");

		/**
		* The component's content.
		* @protected
		* @name ch.Tabs#$content
		* @type jQuery
		*/
		that.$content = that.$triggers.next().addClass("ch-tabs-content ch-box-lite").attr("role", "presentation");

	/**
	*	Public Members
	*/

		/**
		 * @borrows ch.Widget#uid as ch.Tabs#uid
		 * @borrows ch.Widget#element as ch.Tabs#element
		 * @borrows ch.Widget#type as ch.Tabs#type
		 */

		/**
		* Children instances associated to this controller.
		* @public
		* @name ch.Tabs#children
		* @type collection
		*/
		that["public"].children = that.children;

		/**
		* Select a specific tab or get the selected tab.
		* @public
		* @name ch.Tabs#select
		* @function
		* @param {Number} [tab] Tab's index.
		* @exampleDescription Selects a specific tab
		* @example
		* widget.select(2);
		* @exampleDescription Returns the selected tab's index
		* @example
		* var selected = widget.select();
		*/
		that["public"].select = function (tab) {
			// Returns selected tab instead set it
			// Getter
			if (!parseInt(tab)) {
				return selected + 1;
			}

			// Setter
			select(tab -= 1);
			return that["public"];
		};

	/**
	*	Default event delegation
	*/

		createTabs();

		// If hash open that tab
		for(var i = that.children.length; i--;) {
			if (that.children[i].$content.attr("id") === hash) {
				select(i);
				hashed = true;
				break;
			}
		};

		// Shows the first tab if not hash or it's hash and it isn't from the current tab
		if( !hash || ( hash && !hashed ) ){
			that.children[0].innerShow();
			selected = 0;
		}

		/**
		* Triggers when the component is ready to use (Since 0.8.0).
		* @name ch.Tabs#ready
		* @event
		* @public
		* @since 0.8.0
		* @example
		* // Following the first example, using <code>widget</code> as Tabs's instance controller:
		* widget.on("ready",function () {
		*	this.show();
		* });
		*/
		//This avoit to trigger execute after the component was instanciated
		setTimeout(function(){that.trigger("ready")}, 50);

		return that['public'];
	}

	Tabs.prototype.name = 'tabs';
	Tabs.prototype.constructor = Tabs;

	ch.factory(Tabs);

	$.fn.tabNavigator = $.fn.tabs;

}(this, this.jQuery, this.ch));


/**
* Tab is a simple unit of content for Tabs.
* @abstract
* @name Tab
* @class Tab
* @augments ch.Navs
* @memberOf ch
* @param {object} conf Object with configuration properties
* @returns itself
* @ignore
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function Tab(conf) {
		/**
		* Reference to a internal component instance, saves all the information and configuration properties.
		* @private
		* @name ch.Tab#that
		* @type object
		* @ignore
		*/
		var that = this;
		conf = ch.util.clone(conf);
		conf.icon = false;

		that.conf = conf;

	/**
	*	Inheritance
	*/

		that = ch.Widget.call(that);
		that.parent = ch.util.clone(that);

	/**
	 * Abilities
	 */

		ch.Content.call(that);

		/**
		 * This callback is triggered when content request have finished.
		 * @protected
		 * @name ch.Floats#onmessage
		 * @function
		 * @returns {this}
		 */
		that.content.onmessage = function (data) {

			that.$content.html(data);

			that.controller.trigger("contentLoad");

			if (ch.util.hasOwn(conf, "onContentLoad")) {
				conf.onContentLoad.call(that.controller, data);
			}
		};

		/**
		 * This callback is triggered when async request fails.
		 * @protected
		 * @name ch.Floats#onerror
		 * @function
		 * @returns {this}
		 */
		that.content.onerror = function (data) {

			that.$content.html(data);

			that.controller.trigger("contentError", data);

			if (ch.util.hasOwn(conf, "onContentError")) {
				conf.onContentError.call(that.controller, data.jqXHR, data.textStatus, data.errorThrown);
			}
		};

	/**
	*	Private Members
	*/
		/**
		* Creates the basic structure for the tab's content.
		* @private
		* @name ch.Tab#createContent
		* @function
		* @ignore
		*/
		var createContent = function () {

			var href = that.element.href.split("#"),
				controller = that.$element.parents(".ch-tabs"),
				content = controller.find("#" + href[1]);

			// If there are a tabContent...
			if (content.length > 0) {
				return content;

			// If tabContent doesn't exists
			} else {
				/**
				* Content configuration property.
				* @public
				* @name ch.Tab#source
				* @type string
				* @ignore
				*/
				that.source = that.element.href;

				that.content.configure({
					'input': that.source
				});

				var id = (href.length === 2) ? href[1] : "ch-tab-" + that.uid;

				// Create tabContent
				return $("<div id=\"" + id + "\" role=\"tabpanel\" class=\"ch-hide\">").appendTo(controller.children().eq(1));
			}

		};

	/**
	*	Protected Members
	*/
		/**
		* Reference to the trigger element.
		* @protected
		* @name ch.Tab#$trigger
		* @type jQuery
		* @ignore
		*/
		that.$trigger = that.$element;

		/**
		* The component's content.
		* @protected
		* @name ch.Tab#$content
		* @type jQuery
		* @ignore
		*/
		that.$content = createContent();

		/**
		* Shows component's content.
		* @protected
		* @function
		* @name ch.Tab#innerShow
		* @returns itself
		* @ignore
		*/
		that.innerShow = function (event) {
			ch.util.prevent(event);

			that.active = true;

			// Load my content if I'need an ajax request
			if (ch.util.hasOwn(that, "source")) { that.content.set(); }

			// Show me
			that.$trigger.addClass("ch-" + that["type"] + "-trigger-on");

			// Set me as hidden false
			that.$content
				.attr("aria-hidden", "false")
				.removeClass("ch-hide");

			return that;
		};

		/**
		* Hides component's content.
		* @protected
		* @function
		* @name ch.Tab#innerHide
		* @returns itself
		* @ignore
		*/
		that.innerHide = function (event) {
			ch.util.prevent(event);

			if (!that.active) { return; }

			that.active = false;

			// Hide me
			that.$trigger.removeClass("ch-" + that["type"] + "-trigger-on");

			// Set all inactive tabs as hidden
			that.$content
				.attr("aria-hidden", "true")
				.addClass("ch-hide");

			return that;
		};


	/**
	*	Public Members
	*/

	/**
	*	Default event delegation
	*/

		// Add the attributes for WAI-ARIA to the tabs and tabpanel
		// By default is hidden
		that.$content.attr({
			"role": "tabpanel",
			"aria-hidden": true,
			"class": "ch-hide"
		});

		that.$trigger.attr({
			"role": "tab",
			"arial-controls": that.$content.attr("id"),
			"class": "ch-tab-trigger"
		});

		return that;
	}

	Tab.prototype.name = 'tab';
	Tab.prototype.constructor = Tab;

	ch.Tab = Tab;

}(this, this.jQuery, this.ch));

/**
* Menu lets you organize the links by categories.
* @name Menu
* @class Menu
* @augments ch.Widget
* @requires ch.Expandable
* @memberOf ch
* @param {Object} [conf] Object with configuration properties.
* @param {Number} [conf.selected] Selects a child that will be open when component was loaded.
* @param {Boolean} [conf.fx] Enable or disable UI effects. By default, the effects are disable.
* @returns itself
* @factorized
* @see ch.Expandable
* @see ch.Widget
* @exampleDescription Create a new menu without configuration.
* @example
* var widget = $(".example").menu();
* @exampleDescription Create a new menu with configuration.
* @example
* var widget = $(".example").menu({
*     "selected": 2,
*     "fx": true
* });
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	var $html = $("html");

	function Menu($el, conf) {
		/**
		 * Reference to a internal component instance, saves all the information and configuration properties.
		 * @private
		 * @name ch.Menu#that
		 * @type object
		 */
		var that = this;

		that.$element = $el;
		that.element = $el[0];
		that.type = 'menu';
		conf = conf || {};

		conf = ch.util.clone(conf);
		conf.icon = ch.util.hasOwn(conf, "icon") ? conf.icon : true;

		that.conf = conf;

		/**
		 * Inheritance
		 */

		that = ch.Widget.call(that);
		that.parent = ch.util.clone(that);

	/**
	*	Private Members
	*/

		/**
		* Indicates witch child is opened
		* @private
		* @name ch.Menu#selected
		* @type number
		*/
		var selected = conf.selected - 1;

		/**
		* Inits an Expandable component on each list inside main HTML code snippet
		* @private
		* @name ch.Menu#createLayout
		* @function
		*/
		var createLayout = function(){

			// No slide efects for IE8-
			var efects = ($html.hasClass("lt-ie8")) ? false : true;

			// List elements
			that.$element.children().each(function(i, e){
				// List element
				var $li = $(e);

				// Children of list elements
				var $child = $li.children();

				// Anchor inside list
				if($child.eq(0).prop("tagName") == "A") {

					// Add attr role to match wai-aria
					$li.attr("role","presentation");

					// Add class to list and anchor
					$li.addClass("ch-bellows").children().addClass("ch-bellows-trigger");

					// Add anchor to that.children
					that.children.push( $child[0] );

					return;
				};

				// List inside list, inits an Expandable
				var expandable = $li.expandable({
					icon: conf.icon,
					// Show/hide on IE8- instead slideUp/slideDown
					fx: efects,
					onShow: function(){
						// Updates selected tab when it's opened
						selected = i;

						/**
						* Callback function
						* @name onSelect
						* @type {Function}
						* @memberOf ch.Menu
						*/
						that.callbacks.call(that, "onSelect");

						// new callback
						/**
						* It is triggered when the a fold is selected by the user.
						* @name ch.Menu#select
						* @event
						* @public
						* @exampleDescription When the user select
						* @example
						* widget.on("select",function(){
						*     app.off();
						* });
						*/
						that.trigger("select");
					}
				});

				var childs = $li.children(),
					$triggerCont = $(childs[0]),
					$menu = $(childs[1]);
					if (!conf.accordion) {
						$menu.attr("role","menu");
						$menu.children().children().attr("role", "menuitem");
						$menu.children().attr("role", "presentation");
					}
					$triggerCont.attr("role","presentation");

				// Add expandable to that.children
				that.children.push( expandable );

			});
		};

		/**
		* Opens specific Expandable child and optionally grandson
		* @private
		* @function
		* @name ch.Menu#select
		* @ignore
		*/
		var select = function (item) {

			var child, grandson;

			// Split item parameter, if it's a string with hash
			if (typeof item === "string") {
				var sliced = item.split("#");
				child = sliced[0] - 1;
				grandson = sliced[1];

			// Set child when item is a Number
			} else {
				child = item - 1;
			}

			// Specific item of that.children list
			var itemObject = that.children[ child ];

			// Item as object
			if (ch.util.hasOwn(itemObject, "uid")) {

				// Show this list
				itemObject.show();

				// Select grandson if splited parameter got a specific grandson
				if (grandson) $(itemObject.element).find("a").eq(grandson - 1).addClass("ch-menu-on");
				// Accordion behavior
				if (conf.accordion) {

					// Hides every that.children list that don't be this specific list item
					$.each(that.children, function(i, e){
						if(
							// If it isn't an anchor...
							(e.tagName != "A") &&
							// If there are an unique id...
							(ch.util.hasOwn(e, "uid")) &&
							// If unique id is different to unique id on that.children list...
							(that.children[child].uid != that.children[i].uid)
						){
							// ...hide it
							e.hide();
						};
					});

				};

			// Item as anchor
			} else{
				// Just selects it
				that.children[child].addClass("ch-menu-on");
			};

			return that;
		};

		/**
		* Binds controller's own click to expandable triggers
		* @private
		* @name ch.Menu#configureAccordion
		* @function
		*/
		var configureAccordion = function(){

			$.each(that.children, function(i, e){
				$(e.element).find(".ch-expandable-trigger").unbind("click").bind("click", function () {
					select(i + 1);
				});
			});

			return;
		};

	/**
	*	Protected Members
	*/
		/**
		* Collection of children.
		* @name ch.Form#children
		* @type {Array}
		*/
		that.children = [];


	/**
	*	Public Members
	*/
		/**
		 * @borrows ch.Widget#uid as ch.Menu#uid
		 * @borrows ch.Widget#element as ch.Menu#element
		 * @borrows ch.Widget#type as ch.Menu#type
		 */

		/**
		* Select a specific children.
		* @public
		* @name select
		* @name ch.Menu
		* @param item The number of the item to be selected
		* @returns
		*/
		that["public"].select = function (item) {
			// Getter
			if (!item) {
				if (isNaN(selected)) {
					return "";
				}
				return selected + 1;
			}

			// Setter
			select(item);
			return that["public"];
		};

	/**
	*	Default event delegation
	*/

		// Sets component main class name

		// Inits an expandable component on each list inside main HTML code snippet
		createLayout();

		// Accordion behavior
		if (conf.accordion) {
			// Sets the interface main class name for avoid
			configureAccordion();
		} else {
			// Set the wai-aria for Menu
			that.$element.attr("role", "navigation");
		}

		that.$element.addClass('ch-' + that.type + (ch.util.hasOwn(conf, 'classes') ? ' ' + conf.classes : ''));

		// Select specific item if there are a "selected" parameter on component configuration object
		if (ch.util.hasOwn(conf, "selected")) { select(conf.selected); }

		/**
		* Triggers when the component is ready to use (Since 0.8.0).
		* @name ch.Menu#ready
		* @event
		* @public
		* @since 0.8.0
		* @exampleDescription Following the first example, using <code>widget</code> as menu's instance controller:
		* @example
		* widget.on("ready",function () {
		*	this.select();
		* });
		*/
		setTimeout(function(){ that.trigger("ready")}, 50);

		return that['public'];
	}

	Menu.prototype.name = 'menu';
	Menu.prototype.constructor = Menu;

	ch.factory(Menu);

}(this, this.jQuery, this.ch));

/**
* Accordion lets you organize the content like folds.
* @name Accordion
* @class Accordion
* @factorized
* @interface
* @augments ch.Widget
* @requires ch.Menu
* @requires ch.Expandable
* @see ch.Widget
* @see ch.Menu
* @see ch.Expandable
* @memberOf ch
* @param {Object} [conf] Object with configuration properties.
* @param {Number} [conf.selected] Selects a child that will be open when component was loaded.
* @param {Boolean} [conf.fx] Enable or disable UI effects. By default, the effects are disable.
* @returns itself
* @exampleDescription Create a new Accordion.
* @example
* var widget = $(".example").accordion();
* @exampleDescription Create a new Accordion with configuration.
* @example
* var widget = $(".example").accordion({
*     "selected": 2,
*     "fx": true
* });
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function Accordion($el, conf) {
		conf = conf || {};
		conf.accordion = true;
		conf.classes = conf.classes || 'ch-accordion';

		return $el.menu(conf);
	}

	Accordion.prototype.name = 'accordion';
	Accordion.prototype.constructor = Accordion;
	Accordion.prototype.preset = 'Menu';

	ch.factory(Accordion);

}(this, this.jQuery, this.ch));


/**
 * @borrows ch.Widget#uid as ch.Accordion#uid
 * @borrows ch.Widget#element as ch.Accordion#element
 * @borrows ch.Widget#type as ch.Accordion#type
 */

/**
* Select a specific children.
* @public
* @name select
* @name ch.Accordion#select
* @param item The number of the item to be selected
* @returns
*/

/**
* It is triggered when the a fold is selected by the user.
* @name ch.Accordion#select
* @event
* @public
* @exampleDescription When the user select
* @example
* widget.on("select",function(){
*     app.off();
* });
*/

/**
* Triggers when the component is ready to use (Since 0.8.0).
* @name ch.Accordion#ready
* @event
* @public
* @since 0.8.0
* @exampleDescription Following the first example, using <code>widget</code> as accordion's instance controller:
* @example
* widget.on("ready",function () {
*	this.select();
* });
*/

/**
* Forms is a Controller of DOM's HTMLFormElement.
* @name Form
* @class Form
* @augments ch.Widget
* @memberOf ch
* @param {Object} [conf] Object with configuration properties.
* @param {Object} [conf.messages]
* @see ch.Validation
* @see ch.Widget
* @returns itself
* @factorized
* @exampleDescription Create a new Form.
* @example
* var widget = $(".example").form();
* @exampleDescription Create a new Form with some messages that will be use the validation engine.
* @example
* var widget = $(".example").form({
* 	"messages": {
* 		"required": "Error message for all required fields.",
* 		"email": "Show this message on email format error."
* 	}
* });
*/
(function (window, $, ch) {
	'use strict';

	if (window.ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	function Form($el, conf) {

		/**
		* Reference to a internal component instance, saves all the information and configuration properties.
		* @private
		* @name ch.Form#that
		* @type object
		*/
		var that = this;

		that.$element = $el;
		that.element = $el[0];
		that.type = 'form';
		conf = conf || {};

		/**
		* Validation
		*/
		// Are there action and submit type?
		if ( that.$element.find(":submit").length == 0 || that.$element.attr("action") == "" ){
			alert("Form fatal error: The <input type=submit> is missing, or need to define a action attribute on the form tag.");
			return;
		};

		// Is there form in map instances?
		if ( ch.util.hasOwn(ch.instances, "form") && ch.instances.form.length > 0 ){
			for(var i = 0, j = ch.instances.form.length; i < j; i+=1){
				if(ch.instances.form[i].element === that.element){
					return {
						exists: true,
						object: ch.instances.form[i]
					};
				}
			};
		}

		conf = ch.util.clone(conf);
		// Disable HTML5 browser-native validations
		that.$element.attr("novalidate", "novalidate");
		// Grab submit button
		that.$submit = that.$element.find("input:submit");

		that.conf = conf;

	/**
	*  Inheritance
	*/

		that = ch.Widget.call(that);
		that.parent = ch.util.clone(that);

	/**
	*  Private Members
	*/

		/**
		* A Boolean property that indicates is exists errors in the form.
		* @private
		* @name ch.Form#status
		* @type boolean
		*/
		var status = true;

		/**
		* Executes all children's validations, if finds a error will trigger 'onError' callback, if no error is found will trigger 'onValidate' callback, and allways trigger 'afterValidate' callback.
		*/
		var validate = function (event) {

			/**
			* Fired before the validations engine start.
			* @name ch.Form#beforeValidate
			* @event
			* @public
			* @exampleDescription
			* @example
			* widget.on("beforeValidate",function () {
			*	sowidget.action();
			* });
			*/
			that.callbacks("beforeValidate");
			// new callback
			that.trigger("beforeValidate");

			// Status OK (with previous error)
			if ( !status ) {
				status = true;
			};

			var i = 0, j = that.children.length, toFocus, childrenError = [];

			// Shoot validations
			for (i; i < j; i+=1) {
				var child = that.children[i];

				// Validate
				// Save children with errors
				if ( child.hasError() ) {
					childrenError.push(child);
				}
			};

			// Is there's an error
			if (childrenError.length > 0) {
				status = false;
				// Issue UI-332: On validation must focus the first field with errors.
				// Doc: http://wiki.ml.com/display/ux/Mensajes+de+error
				if (childrenError[0].element.tagName === "DIV") {
					$(childrenError[0].element).find("input:first").focus();
				} else if (childrenError[0].element.type !== "hidden") {
					childrenError[0].element.focus();
				}
			} else {
				status = true;
			}

			/**
			* Fired when the form validates.
			* @name ch.Form#validate
			* @event
			* @public
			* @exampleDescription
			* @example
			* widget.on("validate",function () {
			*	sowidget.action();
			* });
			*/

			/**
			* Fired when the form fall on a error.
			* @name ch.Form#error
			* @event
			* @public
			* @exampleDescription
			* @example
			* widget.on("error",function () {
			*	sowidget.action();
			* });
			*/
			if (status) {
				that.callbacks("onValidate");
				// new callback
				that.trigger("validate");
			} else {
				that.callbacks("onError");
				// new callback
				that.trigger("error");
			}

			/**
			* Fired when the validations end.
			* @name ch.Form#afterValidate
			* @event
			* @public
			* @exampleDescription
			* @example
			* widget.on("afterValidate",function () {
			*	sowidget.action();
			* });
			*/
			that.callbacks("afterValidate");
			// new callback
			that.trigger("afterValidate");

			return that;
		};

		/**
		* This methods triggers the 'beforSubmit' callback, then will execute validate() method,
		* and if is defined triggers 'onSubmit' callback, at the end will trigger the 'afterSubmit' callback.
		*/
		var submit = function(event) {

			/**
			* Fired before the form's submition.
			* @name ch.Form#beforeSubmit
			* @event
			* @public
			* @exampleDescription
			* @example
			* widget.on("beforeSubmit",function () {
			*	sowidget.action();
			* });
			*/
			that.callbacks("beforeSubmit");
			// new callback
			that.trigger("beforeSubmit");

			// Execute all validations
			validate(event);

			// If an error occurs prevent default actions
			if (!status) {
				ch.util.prevent(event);
		        if (event) {
		            event.stopImmediatePropagation();
		        }
			}

			// OLD CALLBACK SYSTEM!
			// Is there's no error but there's a onSubmit callback
			if ( status && ch.util.hasOwn(conf, "onSubmit")) {
				// Avoid default actions
				ch.util.prevent(event);
				// To execute defined onSubmit callback
				that.callbacks("onSubmit");
			}

			/**
			* Fired when submits the form.
			* @name ch.Form#submit
			* @event
			* @public
			* @exampleDescription
			* @example
			* widget.on("afterSubmit",function () {
			*	widget.action();
			* });
			*/
			// * New callback system *
			// Check inside $.data if there's a handler for ch-submit event
			// if something found there, avoid submit.

			var formEvents = $(that["public"]).data("events");
			var isSubmitEventDefined = (formEvents && ch.util.hasOwn(formEvents, "ch-submit"));

			if (status && isSubmitEventDefined){
				// Avoid default actions
				ch.util.prevent(event);
				// new callback
				that.trigger("submit");
			};

			/**
			* Fired after the form's submition.
			* @name ch.Form#afterSubmit
			* @event
			* @public
			* @exampleDescription
			* @example
			* widget.on("afterSubmit",function () {
			*	this.reset();
			* });
			*/
			that.callbacks("afterSubmit");
			// new callback
			that.trigger("afterSubmit");

			// Return that to chain methods
			return that;
		};

		/**
		* Use this method to clear al validations.
		*/
		var clear = function(){

			var i = 0, j = that.children.length;
			for(i; i < j; i += 1) {
				that.children[i].clear();
			}

			status = true;

			/**
			* Fired when clean the form's data.
			* @name ch.Form#clear
			* @event
			* @public
			* @exampleDescription
			* @example
			* widget.on("clear",function () {
			*	this.reset();
			* });
			*/
			that.callbacks("onClear");
			// new callback
			that.trigger("clear");

			return that;
		};

		/**
		* Use this method to reset the form's input elements.
		*/
		var reset = function(event){
			clear();
			that.element.reset(); // Reset html form native

			/**
			* Fired when resets the form.
			* @name ch.Form#reset
			* @event
			* @public
			* @exampleDescription
			* @example
			* widget.on("reset",function () {
			*	sowidget.action();
			* });
			*/
			that.callbacks("onReset");
			// new callback
			that.trigger("reset");

			return that;
		};

	/**
	*  Protected Members
	*/

		/**
		* Collection of children.
		* @name ch.Form#children
		* @type {Array}
		*/
		that.children = [];


	/**
	*  Public Members
	*/
		/**
		 * @borrows ch.Widget#uid as ch.Expando#uid
		 * @borrows ch.Widget#element as ch.Expando#element
		 * @borrows ch.Widget#type as ch.Expando#type
		 */

		/**
		* Watcher instances associated to this controller.
		* @public
		* @function
		* @name ch.Form#children
		* @type collection
		*/
		that["public"].children = that.children;

		/**
		* Collection of messages defined.
		* @public
		* @function
		* @name ch.Form#messages
		* @type string
		*/
		that["public"].messages = conf.messages || {};

		/**
		* Executes all children's validations, if finds a error will trigger 'onError' callback, if no error is found will trigger 'onValidate' callback, and allways trigger 'afterValidate' callback.
		* @public
		* @function
		* @name ch.Form#validate
		* @returns itself
		*/
		that["public"].validate = function() {
			validate();

			return that["public"];
		};

		/**
		* This methods triggers the 'beforSubmit' callback, then will execute validate() method, and if is defined triggers 'onSubmit' callback, at the end will trigger the 'afterSubmit' callback.
		* @public
		* @function
		* @name ch.Form#submit
		* @returns itself
		*/
		that["public"].submit = function () {
			submit();

			return that["public"];
		};

		/**
		* Returns the status value of the form.
		* @public
		* @function
		* @name ch.Form#isValidated
		* @returns {Boolean}
		*/
		that["public"].isValidated = function () {
			return status;
		};

		/**
		* Use this method to clear al validations.
		* @public
		* @function
		* @function
		* @name ch.Form#clear
		* @returns itself
		*/
		that["public"].clear = function() {
			clear();

			return that["public"];
		};

		/**
		* Use this method to clear al validations.
		* @public
		* @function
		* @name ch.Form#reset
		* @returns itself
		*/
		that["public"].reset = function() {
			reset();

			return that["public"];
		};

	/**
	*  Default event delegation
	*/

		// patch exists because the components need a trigger
		if (ch.util.hasOwn(conf, "onSubmit")) {
			that.$element.bind('submit', function(event){ ch.util.prevent(event); });
			// Delete all click handlers asociated to submit button >NATAN: Why?
				//Because if you want to do something on submit, you need that the trigger (submit button)
				//don't have events associates. You can add funcionality on onSubmit callback
			that.$element.find(":submit").unbind('click');
		};

		// Bind the submit
		that.$element.bind("submit", function(event) { submit(event) });

		// Bind the reset
		that.$element.find(":reset, .resetForm").bind("click", function(event){ reset(event); });

		// Listen the event "validate" from validations
		that.on('validated', function () {
			status = true;
		});

		/**
		* Triggers when the component is ready to use (Since 0.8.0).
		* @name ch.Form#ready
		* @event
		* @public
		* @since 0.8.0
		* @exampleDescription Following the first example, using <code>widget</code> as form's instance controller:
		* @example
		* widget.on("ready",function () {
		*	this.reset();
		* });
		*/
		window.setTimeout(function(){ that.trigger("ready")}, 50);

		return that['public'];
	}

	Form.prototype.name = 'form';
	Form.prototype.constructor = Form;

	ch.factory(Form);

}(this, this.jQuery, this.ch));

/**
 * Carousel is a large list of elements. Some elements will be shown in a preset area, and others will be hidden waiting for the user interaction to show it.
 * @name Carousel
 * @class Carousel
 * @augments ch.Widget
 * @see ch.Widget
 * @memberOf ch
 * @factorized
 * @param {Object} [conf] Object with configuration properties.
 * @param {Number || String} [conf.width] Sets width property of the component's layout. By default, the width is elastic.
 * @param {Boolean} [conf.pagination] Shows a pagination. By default, the value is false.
 * @param {Boolean} [conf.arrows] Shows arrows icons over or outside the mask. By default, the value is "outside".
 * @param {Array} [conf.asyncData] Defines the content of each item that will be load asnchronously as array.
 * @param {Function} [conf.asyncRender] The function that receives asyncData content and must return a string with result of manipulate that content.
 * @param {Boolean} [conf.fx] Enable or disable UI effects. By default, the effects are enabled.
 * @param {Number} [conf.maxItems] (Since 0.10.6) Set the max amount of items to show in each page.
 * @param {Number} [conf.page] (Since 0.10.6) Initialize the Carousel in a specified page.
 * @returns itself
 * @exampleDescription Create a Carousel without configuration.
 * @example
 * var foo = $("#example").carousel();
 * @exampleDescription Create a Carousel with configuration parameters.
 * @example
 * var foo = $("#example").carousel({
 *     "width": 500,
 *     "pagination": true,
 *     "arrows": "over"
 * });
 * @exampleDescription Create a Carousel with items asynchronously loaded.
 * @example
 * var foo = $("#example").carousel({
 *     "asyncData": [
 *         {"src": "a.png", "alt": "A"},
 *         {"src": "b.png", "alt": "B"},
 *         {"src": "c.png", "alt": "C"}
 *     ],
 *     "asyncRender": function (data) {
 *         return "<img src=\"" + data.src + "\" alt=\"" + data.alt + "\" />";
 *     }
 * });
 */
(function (window, $, ch) {
	'use strict';

	if (ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	var Math = window.Math,
		setTimeout = window.setTimeout,
		setInterval = window.setInterval,
		$html = $('html'),
		$window = $(window);

	function Carousel($el, conf) {

		/**
		 * Reference to a internal component instance, saves all the information and configuration properties.
		 * @protected
		 * @name ch.Carousel#that
		 * @type Object
		 */
		var that = this;
		that.$element = $el;
		that.element = $el[0];
		that.type = 'carousel';
		conf = conf || {};

		conf = ch.util.clone(conf);

		// Efects configuration: boolean
		conf.fx = ch.util.hasOwn(conf, "fx") ? conf.fx : true;
		// Arrows configuration: true, false or string: "outside" (default), "over" or "none"
		conf.arrows = ch.util.hasOwn(conf, "arrows") ? conf.arrows : "outside";
		// Pagination configuration
		conf.pagination = ch.util.hasOwn(conf, "pagination") ? conf.pagination : false;

		that.conf = conf;

	/**
	 *  Inheritance
	 */

		that = ch.Widget.call(that);
		that.parent = ch.util.clone(that);

	/**
	 *  Private Members
	 */

		/**
		 * List of items that should be loaded asynchronously on page movement.
		 * @private
		 * @name ch.Carousel#queue
		 * @type Array
		 */
		var queue = (function () {

			// No queue
			if (!ch.util.hasOwn(conf, "asyncData")) { return []; }

			// Validated queue
			var q = [];

			// Validate each item in queue to be different to undefined
			$.each(conf.asyncData, function (index, item) {
				if (item) { q.push(item); }
			});

			// Return validated queue
			return q;

		}()),

		/**
		 * Element that moves across component (inside the mask).
		 * @private
		 * @name ch.Carousel#$list
		 * @type jQuery Object
		 */
			$list = that.$element.children().addClass("ch-carousel-list").attr("role", "list"),

		/**
		 * Collection of each child of the list.
		 * @private
		 * @name ch.Carousel#$items
		 * @type jQuery Object
		 */
			$items = $list.children().addClass("ch-carousel-item").attr("role", "listitem"),

		/**
		 * The width of each item, including paddings, margins and borders. Ideal for make calculations.
		 * @private
		 * @name ch.Carousel#itemWidth
		 * @type Number
		 */
			itemWidth = $items.width(),

		/**
		 * The height of each item, including paddings, margins and borders. Ideal for make calculations.
		 * @private
		 * @name ch.Carousel#itemHeight
		 * @type Number
		 */
			itemHeight = $items.height(),

		/**
		 * The width of each item, without paddings, margins or borders. Ideal for manipulate CSS width property.
		 * @private
		 * @name ch.Carousel#itemOuterWidth
		 * @type Number
		 */
			itemOuterWidth = $items.outerWidth(),

		/**
		 * The height of each item, without paddings, margins or borders. Ideal for manipulate CSS height property.
		 * @private
		 * @name ch.Carousel#itemOuterHeight
		 * @type Number
		 */
			itemOuterHeight = $items.outerHeight(),

		/**
		 * Size added to each item to make it responsive.
		 * @private
		 * @name ch.Carousel#itemExtraWidth
		 * @type Number
		 */
			itemExtraWidth,

		/**
		 * The margin of all items. Updated in each redraw only if it's necessary.
		 * @private
		 * @name ch.Carousel#itemMargin
		 * @type Number
		 */
			itemMargin,

		/**
		 * Element that denies the list overflow.
		 * @private
		 * @name ch.Carousel#$mask
		 * @type jQuery Object
		 */
			$mask = $("<div class=\"ch-carousel-mask\" role=\"tabpanel\" style=\"height:" + $items.outerHeight() + "px\">"),

		/**
		 * Amount of items in only one page. Updated in each redraw.
		 * @private
		 * @name ch.Carousel#itemsPerPage
		 * @type Number
		 */
			itemsPerPage,

		/**
		 * Distance needed to move ONLY ONE page. Data updated in each redraw.
		 * @private
		 * @name ch.Carousel#pageWidth
		 * @type Number
		 */
			pageWidth,

		/**
		 * Size of the mask. Updated in each redraw.
		 * @private
		 * @name ch.Carousel#maskWidth
		 * @type Number
		 */
			maskWidth,

		/**
		 * Total amount of pages. Data updated in each redraw.
		 * @private
		 * @name ch.Carousel#pages
		 * @type Number
		 */
			pages,

		/**
		 * Page currently showed.
		 * @private
		 * @name ch.Carousel#currentPage
		 * @type Number
		 */
			currentPage = 1,

		/**
		 * Interval used to animate the component autamatically.
		 * @private
		 * @name ch.Carousel#timer
		 * @type Object
		 */
			timer,

		/**
		 * Calculates and set the size of items and its margin to get an adaptive Carousel.
		 * @private
		 * @name ch.Carousel#updateDistribution
		 * @function
		 */
			updateDistribution = function () {

				// Grabs if there are MORE THAN ONE item in a page or just one
				var moreThanOne = itemsPerPage > 1,

				// Total space to use as margin into mask
				// It's the difference between mask width and total width of all items
					freeSpace = maskWidth - (itemOuterWidth * itemsPerPage),

				// Width to add to each item to get responsivity
				// When there are more than one item, get extra width for each one
				// When there are only one item, extraWidth must be just the freeSpace
					extraWidth = moreThanOne ? Math.ceil(freeSpace / itemsPerPage / 2) : Math.ceil(freeSpace);

				// Update ONLY IF margin changed from last redraw
				if (itemExtraWidth === extraWidth) { return; }

				// Amount of spaces to distribute the free space
				// When there are 6 items on a page, there are 5 spaces between them
				// Except when there are only one page that NO exist spaces
				var spaces = moreThanOne ? itemsPerPage - 1 : 0,

				// The new width calculated from current width plus extraWidth
					width = itemWidth + extraWidth;

				// Update global value of width
				itemExtraWidth = extraWidth;

				// Free space for each space between items
				// Ceil to delete float numbers (not Floor, because next page is seen)
				// There is no margin when there are only one item in a page
				// Update global values
				itemMargin = moreThanOne ? Math.ceil(freeSpace / spaces / 2) : 0;

				// Update distance needed to move ONLY ONE page
				// The width of all items on a page, plus the width of all margins of items
				pageWidth = (itemOuterWidth + extraWidth + itemMargin) * itemsPerPage;

				// Update the list width
				// Delete efects on list to change width instantly
				// Do it before item resizing to make space to all items
				$list.addClass("ch-carousel-nofx").css("width", pageWidth * pages);

				// Restore efects to list if it's required
				// Use a setTimeout to be sure to do this after width change
				if (conf.fx) {
					setTimeout(function () { $list.removeClass("ch-carousel-nofx"); }, 0);
				}

				// Update element styles
				// Get the height using new width and relation between width and height of item (ratio)
				$items.css({
					"width": width,
					"height": (width * itemHeight) / itemWidth,
					"margin-right": itemMargin
				});

				// Update the mask height with the list height
				$mask.css("height", $list.outerHeight());
			},

		/**
		 * Trigger all recalculations to get the functionality measures.
		 * @private
		 * @name ch.Carousel#draw
		 * @function
		 */
			draw = function () {

				// Avoid wrong calculations going to first page
				goToPage(1);

				// Trigger Draw event as deferred
				that.trigger("redraw");

				// Trigger Draw event as configuration
				that.callbacks("onRedraw");

				// Update the width of the mask
				maskWidth = $mask.outerWidth();

				// Update amount of items into a single page (from conf or auto calculations)
				itemsPerPage = (function () {
					// The width of each item into the width of the mask
					var i = ~~(maskWidth / itemOuterWidth);

					// Avoid zero items in a page
					if (i === 0) { return 1; }

					// Limit amount of items when user set a maxItems amount
					if (ch.util.hasOwn(conf, "maxItems") && i > conf.maxItems) {
						return conf.maxItems;
					}

					// Default calculation
					return i;
				}());

				// Update amount of total pages
				// The ratio between total amount of items and items in each page
				var totalPages = Math.ceil(($items.length + queue.length) / itemsPerPage);

				// Update only if pages amount changed from last redraw
				if (pages !== totalPages) {
					// Update value
					pages = totalPages;
					// Set WAI-ARIA properties to each item
					updateARIA();
					// Update arrows (when pages === 1, there is no arrows)
					updateArrows();
					// Update pagination
					updatePagination();
				}

				// Update the margin between items and its size
				updateDistribution();
			},

		/**
		 * Defines the sizing behavior of Carousel. It can be elastic and responsive or fixed.
		 * @private
		 * @name ch.Carousel#setWidth
		 * @function
		 */
			setWidth = function () {

				// Width by configuration
				if (ch.util.hasOwn(conf, "width")) {
					return that.$element.css("width", conf.width);
				}

				// Elastic width
				// Flag to know when resize happens
				var resizing = false;

				// Change resize status on Window resize event
				$window.on("resize", function () { resizing = true; });

				// Limit resize execution
				setInterval(function () {

					if (!resizing) { return; }

					resizing = false;
					draw();

				}, 250);
			},

		/**
		 * Makes ready the component structure.
		 * @private
		 * @name ch.Carousel#createLayout
		 * @function
		 */
			createLayout = function () {

				// Defines the sizing behavior of Carousel
				setWidth();

				// Set initial width of the list, to make space to all items
				$list.css("width", itemOuterWidth * ($items.length + queue.length));

				// Wrap the list with mask and change overflow to translate that feature to mask
				that.$element.wrapInner($mask).css("overflow", "hidden");

				// TODO: Get a better reference to rendered mask
				$mask = that.$element.children(".ch-carousel-mask");

				// Update the mask height with the list height
				// Do it here because before, items are stacked
				$mask.css("height", $list.outerHeight());

				// If efects aren't needed, avoid transition on list
				if (!conf.fx) { $list.addClass("ch-carousel-nofx"); }

				// Position absolutelly the list when CSS transitions aren't supported
				if (!ch.support.transition) { $list.css({"position": "absolute", "left": "0"}); }

				// Allow to render the arrows over the mask or not
				arrowsFlow(conf.arrows);

				// Trigger all recalculations to get the functionality measures
				draw();

				// Analizes if next page needs to load items from queue and execute addItems() method
				loadAsyncItems();

				// Set WAI-ARIA properties to each item depending on the page in which these are
				updateARIA();

				// If there are a parameter specifying a pagination, add it
				if (conf.pagination) { addPagination(); }
			},

		/**
		 * DOM element of arrow that moves the Carousel to the previous page.
		 * @private
		 * @name ch.Carousel#$prevArrow
		 * @type jQuery Object
		 */
			$prevArrow = $("<p class=\"ch-carousel-prev ch-carousel-disabled\" role=\"button\" aria-hidden=\"true\">" + (($html.hasClass("lt-ie8")) ? "<span></span>" : "") + "</p>"),

		/**
		 * DOM element of arrow that moves the Carousel to the next page.
		 * @private
		 * @name ch.Carousel#$nextArrow
		 * @type jQuery Object
		 */
			$nextArrow = $("<p class=\"ch-carousel-next\" role=\"button\" aria-hidden=\"false\">" + (($html.hasClass("lt-ie8")) ? "<span></span>" : "") + "</p>"),

		/**
		 * Flag to control when arrows were created before.
		 * @private
		 * @name ch.Carousel#arrowsCreated
		 * @type Boolean
		 */
			arrowsCreated = false,

		/**
		 * Add arrows to DOM, bind these event and change the flag "arrowsCreated".
		 * @private
		 * @name ch.Carousel#addArrows
		 * @function
		 */
			addArrows = function () {

				// Check arrows existency
				if (arrowsCreated) { return; }

				// Add arrows to DOM and bind events
				// TODO: Bind only once when arrows are created
				$prevArrow.prependTo(that.$element).on("click", that.prev);
				$nextArrow.appendTo(that.$element).on("click", that.next);

				// Positions arrows vertically in middle of Carousel
				$prevArrow[0].style.top = $nextArrow[0].style.top = (that.$element.height() - $prevArrow.height()) / 2 + "px";

				// Avoid selection on the arrows
				ch.util.avoidTextSelection($prevArrow, $nextArrow);

				// Check arrows as created
				arrowsCreated = true;
			},

		/**
		 * Delete arrows from DOM, unbind these event and change the flag "arrowsCreated".
		 * @private
		 * @name ch.Carousel#removeArrows
		 * @function
		 */
			removeArrows = function () {

				// Check arrows existency
				if (!arrowsCreated) { return; }

				// Delete arrows only from DOM and keep in variables and unbind events too
				// TODO: Bind only once when arrows are created
				$prevArrow.off("click", that.prev).detach();
				$nextArrow.off("click", that.next).detach();

				// Check arrows as deleted
				arrowsCreated = false;
			},

		/**
		 * Check for arrows behavior on first, last and middle pages, and update class name and ARIA values.
		 * @private
		 * @name ch.Carousel#updateArrows
		 * @function
		 */
			updateArrows = function () {

				// Check arrows existency
				if (!arrowsCreated) { return; }

				// Case 1: Disable both arrows if there are ony one page
				if (pages === 1) {
					$prevArrow.attr("aria-hidden", "true").addClass("ch-carousel-disabled");
					$nextArrow.attr("aria-hidden", "true").addClass("ch-carousel-disabled");
				// Case 2: "Previous" arrow hidden on first page
				} else if (currentPage === 1) {
					$prevArrow.attr("aria-hidden", "true").addClass("ch-carousel-disabled");
					$nextArrow.attr("aria-hidden", "false").removeClass("ch-carousel-disabled");
				// Case 3: "Next" arrow hidden on last page
				} else if (currentPage === pages) {
					$prevArrow.attr("aria-hidden", "false").removeClass("ch-carousel-disabled");
					$nextArrow.attr("aria-hidden", "true").addClass("ch-carousel-disabled");
				// Case 4: Enable both arrows on Carousel's middle
				} else {
					$prevArrow.attr("aria-hidden", "false").removeClass("ch-carousel-disabled");
					$nextArrow.attr("aria-hidden", "false").removeClass("ch-carousel-disabled");
				}
			},

		/**
		 * Allows to render the arrows over the mask or not.
		 * @private
		 * @name ch.Carousel#arrowsFlow
		 * @function
		 * @param {String || Boolean} config Defines the arrows behavior. It can be "outside", "over", "none", true or false. By default it's "outside".
		 */
			arrowsFlow = function (config) {

				// Getter
				if (config === undefined) { return conf.arrows; }

				// Setter
				switch (conf.arrows = config) {
				// The arrows are on the sides of the mask
				case "outside":
				default:
					// Add the adaptive class to mask
					$mask.addClass("ch-carousel-adaptive");
					// Append arrows if previously were deleted
					addArrows();
					break;

				// The arrows are over the mask
				case "over":
				case true:
					// Remove the adaptive class to mask
					$mask.removeClass("ch-carousel-adaptive");
					// Append arrows if previously were deleted
					addArrows();
					break;

				// No arrows
				case "none":
				case false:
					// Remove the adaptive class to mask
					$mask.removeClass("ch-carousel-adaptive");
					// Detach arrows from DOM and continue to remove adaptive class
					removeArrows();
					break;
				}
			},

		/**
		 * HTML Element that contains all thumbnails for pagination.
		 * @private
		 * @name ch.Carousel#$pagination
		 * @jQuery Object
		 */
			$pagination = $("<p class=\"ch-carousel-pages\" role=\"tablist\">").on("click", function (event) {
				goToPage($(event.target).attr("data-page"));
			}),

		/**
		 * Flag to control if pagination was created before.
		 * @private
		 * @name ch.Carousel#paginationCreated
		 * @type Boolean
		 */
			paginationCreated = false,

		/**
		 * Updates the selected page on pagination.
		 * @private
		 * @name ch.Carousel#switchPagination
		 * @function
		 * @param {Number} from Page previously selected. It will be unselected.
		 * @param {Number} to Page to be selected.
		 */
			switchPagination = function (from, to) {

				// Avoid to change something that not exists
				if (!paginationCreated) { return; }

				// Get all thumbnails of pagination element
				var children = $pagination.children();

				// Unselect the thumbnail previously selected
				children.eq(from - 1).attr("aria-selected", "false").removeClass("ch-carousel-selected");

				// Select the new thumbnail
				children.eq(to - 1).attr("aria-selected", "true").addClass("ch-carousel-selected");
			},

		/**
		 * Executed when total amount of pages change, this redraw the thumbnails.
		 * @private
		 * @name ch.Carousel#updatePagination
		 * @function
		 */
			updatePagination = function () {

				// Avoid to change something that not exists
				if (!paginationCreated) { return; }

				// Delete thumbnails
				removePagination();

				// Generate thumbnails
				addPagination();
			},

		/**
		 * Create the pagination on DOM and change the flag "paginationCreated".
		 * @private
		 * @name ch.Carousel#addPagination
		 * @function
		 */
			addPagination = function () {

				// Collection of thumbnails strings
				var thumbs = [];

				// Generate a thumbnail for each page on Carousel
				for (var i = 1, j = pages + 1; i < j; i += 1) {

					// Determine if this thumbnail is selected or not
					var isCurrentPage = (i === currentPage);

					// Add string to collection
					thumbs.push(
						// Tag opening with ARIA role
						"<span role=\"tab\"",
						// Selection depends on current page
						" aria-selected=\"" + isCurrentPage + "\"",
						// WAI-ARIA reference to page that this thumbnail controls
						" aria-controls=\"page" + i + "\"",
						// JS reference to page that this thumbnail controls
						" data-page=\"" + i + "\"",
						// Class name to indicate when this thumbnail is selected or not
						" class=\"" + (isCurrentPage ? "ch-carousel-selected" : "") + "\"",
						// Friendly content and tag close
						">Page " + i + "</span>"
					);
				}

				// Append thumbnails to pagination and append this to Carousel
				$pagination.html(thumbs.join("")).appendTo(that.$element);

				// Avoid selection on the pagination
				ch.util.avoidTextSelection($pagination);

				// Check pagination as created
				paginationCreated = true;
			},

		/**
		 * Delete pagination from DOM and change the flag "paginationCreated".
		 * @private
		 * @name ch.Carousel#removePagination
		 * @function
		 */
			removePagination = function () {

				// Avoid to change something that not exists
				if (!paginationCreated) { return; }

				// Delete thumbnails
				$pagination[0].innerHTML = "";

				// Check pagination as deleted
				paginationCreated = false;
			},

		/**
		 * Set WAI-ARIA properties to each item depending on the page in which these are.
		 * @private
		 * @name ch.Carousel#updateARIA
		 * @function
		 */
			updateARIA = function () {

				// Amount of items when ARIA is updated
				var total = $items.length + queue.length;

				// Update ARIA properties on all items
				$items.each(function (i, item) {

					// Update page where this item is in
					var page = getPage(i);

					// Update ARIA attributes
					$(item).attr({
						"aria-hidden": page !== currentPage,
						"aria-setsize": total,
						"aria-posinset": i + 1,
						"aria-label": "page" + page
					});
				});
			},

		/**
		 * Calculates the page corresponding to a specific item.
		 * @private
		 * @name ch.Carousel#getPage
		 * @function
		 * @param {Number} item Order of item from which calculate the page. Starts in 0.
		 */
			getPage = function (item) {
				return ~~(item / itemsPerPage) + 1;
			},

		/**
		 * Moves the list corresponding to specified displacement.
		 * @private
		 * @name ch.Carousel#translate
		 * @function
		 * @param {Number} displacement Distance to move the list.
		 */
			translate = (function () {

				// CSS property written as string to use on CSS movement
				var transform = "-" + ch.util.VENDOR_PREFIX + "-transform";

				// Translate list using CSS translate transform
				function CSSMove(displacement) {
					$list.css(transform, "translateX(" + displacement + "px)");
				}

				// Translate using jQuery animation
				function jQueryMove(displacement) {
					$list.animate({"left": displacement});
				}

				// Translate without efects
				function directMove(displacement) {
					$list.css("left", displacement);
				}

				// Use CSS transition with JS animate to move as fallback
				return ch.support.transition ? CSSMove : (conf.fx ? jQueryMove : directMove);
			}()),

		/**
		 * Updates all necessary data to move to a specified page.
		 * @private
		 * @name ch.Carousel#goToPage
		 * @function
		 * @param {Number || String} page Reference of page to go. It can be specified as number or "first" or "last" string.
		 */
			goToPage = function (page) {

				// Page getter
				if (!page) { return currentPage; }

				// Page setter
				// Change to number the text pages ("first" and "last")
				if (page === "first") { page = 1; }
				else if (page === "last") { page = pages; }

				// Avoid strings from here
				page = window.parseInt(page);

				// Avoid to select:
				// - The same page that is selected yet
				// - A page less than 1
				// - A page greater than total amount of pages
				if (page === currentPage || page < 1 || page > pages) { return; }

				// Perform these tasks in the following order:
				// Task 1: Move the list!!!
				// Position from 0 (zero), to page to move (page number beginning in zero)
				translate(-pageWidth * (page - 1));

				// Task 2: Update selected thumbnail on pagination
				switchPagination(currentPage, page);

				// Task 3: Update value of current page
				currentPage = page;

				// Task 4: Check for arrows behavior on first, last and middle pages
				updateArrows();

				// Task 5: Get items from queue to the list, if it's necessary
				loadAsyncItems();

				// Task 6: Set WAI-ARIA properties to each item
				updateARIA();

				// Trigger Select event as configuration
				that.trigger("select");

				// Trigger Select event as deferred
				that.callbacks("onSelect");
			},

		/**
		 * Move items from queue to collection.
		 * @private
		 * @name ch.Carousel#addItems
		 * @function
		 * @param {Number} amount Amount of items that will be added.
		 */
			addItems = function (amount) {

				// Take the sample from queue
				var sample = queue.splice(0, amount),

				// Function with content processing using asyncRender or not
					getContent = conf.asyncRender || function (data) { return data; };

				// Replace sample items with Carousel item template)
				for (var i = 0; i < amount; i += 1) {
					// Replace sample item
					sample[i] = [
						// Open tag with ARIA role
						"<li role=\"listitem\"",
						// Add classname to identify this as item
						" class=\"ch-carousel-item\"",
						// Add the same margin than all siblings items
						" style=\"width: " + (itemWidth + itemExtraWidth) + "px; margin-right: " + itemMargin + "px\"",
						// Add content (executing a template, if user specify it) and close the tag
						">" + getContent(sample[i]) + "</li>"
					// Get it as string
					].join("");
				};

				// Add sample items to the list
				$list.append(sample.join(""));

				// Update items collection
				$items = $list.children();

				// Trigger item addition event as deferred
				that.trigger("itemsAdded");

				// Trigger item addition event as configuration
				that.callbacks("onItemsAdded");
			},

		/**
		 * Analizes if next page needs to load items from queue and execute addItems() method.
		 * @private
		 * @name ch.Carousel#loadAsyncItems
		 * @function
		 */
			loadAsyncItems = function () {

				// Load only when there are items in queue
				if (queue.length === 0) { return; }

				// Amount of items from the beginning to current page
				var total = currentPage * itemsPerPage,

				// How many items needs to add to items rendered to complete to this page
					amount = total - $items.length;

				// Load only when there are items to add
				if (amount < 1) { return; }

				// If next page needs less items than it support, then add that amount
				amount = (queue.length < amount) ? queue.length : amount;

				// Add these
				addItems(amount);
			};

	/**
	 *  Protected Members
	 */

		/**
		 * Moves to the previous page.
		 * @protected
		 * @function
		 */
		that.prev = function () {

			goToPage(currentPage - 1);

			that.callbacks("onPrev");
			that.trigger("prev");

			return that;
		};

		/**
		 * Moves to the next page.
		 * @protected
		 * @function
		 */
		that.next = function () {

			goToPage(currentPage + 1);

			that.callbacks("onNext");
			that.trigger("next");

			return that;
		};

		/**
		 * Animates the Carousel automatically. (Since 0.10.6)
		 * @protected
		 * @since 0.10.6
		 * @function
		 * @param {Number} t Delay of transition between pages, expressed in milliseconds.
		 */
		that.play = (function () {

			// Set a default delay
			var delay = 3000;

			// Final function of play
			return function (t) {

				// User timing over the default
				if (t) { delay = t; }

				// Set the interval on private property
				timer = setInterval(function () {
					// Normal behavior: Move to next page
					if (currentPage < pages) { that.next(); }
					// On last page: Move to first page
					else { goToPage(1); }
				// Use the setted timing
				}, delay);
			};
		}());

		/**
		 * Pause the Carousel automatic playing. (Since 0.10.6)
		 * @protected
		 * @since 0.10.6
		 * @function
		 */
		that.pause = function () {
			window.clearInterval(timer);
		};

	/**
	 *  Public Members
	 */
		/**
		 * @borrows ch.Widget#uid as ch.Carousel#uid
		 * @borrows ch.Widget#element as ch.Carousel#element
		 * @borrows ch.Widget#type as ch.Carousel#type
		 */

		/**
		 * Triggers when component moves to next page.
		 * @name ch.Carousel#next
		 * @event
		 * @public
		 * @exampleDescription Using a callback when Carousel moves to the next page.
		 * @example
		 * example.on("next", function () {
		*	alert("Next!");
		 * });
		 */

		/**
		 * Triggers when component moves to previous page.
		 * @name ch.Carousel#prev
		 * @event
		 * @public
		 * @exampleDescription Using a callback when Carousel moves to the previous page.
		 * @example
		 * example.on("prev", function () {
		*	alert("Previous!");
		 * });
		 */

		/**
		 * Since 0.7.9: Triggers when component moves to next or previous page.
		 * @name ch.Carousel#select
		 * @event
		 * @public
		 * @since 0.7.9
		 * @example
		 * @exampleDescription Using a callback when Carousel moves to another page.
		 * example.on("select", function () {
		*	alert("An item was selected!");
		 * });
		 */

		/**
		 * Since 0.10.6: Triggers when component redraws.
		 * @name ch.Carousel#redraw
		 * @event
		 * @public
		 * @since 0.10.6
		 * @exampleDescription Using a callback when Carousel trigger a new redraw.
		 * @example
		 * example.on("redraw", function () {
		*	alert("Carousel was redrawn!");
		 * });
		 */

		/**
		 * Triggers when component adds items asynchronously from queue.
		 * @name ch.Carousel#itemsAdded
		 * @event
		 * @public
		 * @exampleDescription Using a callback when Carousel add items asynchronously.
		 * @example
		 * example.on("itemsAdded", function () {
		*	alert("Some asynchronous items was added.");
		 * });
		 */

		/**
		 * Same as "select". Gets the current page or moves to a defined page (Since 0.7.4).
		 * @public
		 * @function
		 * @name ch.Carousel#page
		 * @returns Chico UI Object
		 * @param {Number || String} page Reference of page to go. It can be specified as number or "first" or "last" string.
		 * @since 0.7.4
		 * @exampleDescription Go to second page.
		 * @example
		 * foo.page(2);
		 * @exampleDescription Get the current page.
		 * @example
		 * foo.page();
		 */
		/**
		 * Same as "page". Moves to a defined page (Since 0.7.5).
		 * @public
		 * @function
		 * @name ch.Carousel#select
		 * @returns Current page number or Chico UI Object
		 * @param {Number || String} page Reference of page to go. It can be specified as number or "first" or "last" string.
		 * @since 0.7.5
		 * @exampleDescription Go to second page.
		 * @example
		 * foo.select(2);
		 */
		that["public"].page = that["public"].select = function (page) {
			return goToPage(page) || that["public"];
		};

		/**
		 * Moves to the previous page.
		 * @public
		 * @function
		 * @name ch.Carousel#prev
		 * @returns Chico UI Object
		 * @exampleDescription Go to previous page.
		 * @example
		 * foo.prev();
		 */
		that["public"].prev = function () {
			that.prev();
			return that["public"];
		};

		/**
		 * Moves to the next page.
		 * @public
		 * @function
		 * @name ch.Carousel#next
		 * @returns Chico UI Object
		 * @exampleDescription Go to next page.
		 * @example
		 * foo.next();
		 */
		that["public"].next = function () {
			that.next();
			return that["public"];
		};

		/**
		 * Allow to manage or disable the "Next" and "Previous" buttons flow ("over" the mask, "outside" it or "none"). (Since 0.10.6).
		 * @public
		 * @function
		 * @name ch.Carousel#arrows
		 * @since 0.10.6
		 * @returns Chico UI Object
		 * @param {String || Boolean} config CSS transition properties. By default it's "outside".
		 * @exampleDescription Put arrows outside the mask.
		 * @example
		 * foo.arrows("outside");
		 * // or
		 * foo.arrows(true);
		 * @exampleDescription Put arrows over the mask.
		 * @example
		 * foo.arrows("over");
		 * @exampleDescription Disable arrows.
		 * @example
		 * foo.arrows("none");
		 * or
		 * foo.arrows(false);
		 */
		that["public"].arrows = function (config) {
			arrowsFlow(config);
			draw();
			return that["public"];
		};

		/**
		 * Trigger all recalculations to get the functionality measures.
		 * @public
		 * @function
		 * @name ch.Carousel#redraw
		 * @returns Chico UI Object
		 * @exampleDescription Re-draw the Carousel.
		 * @example
		 * foo.redraw();
		 */
		that["public"].redraw = function () {
			draw();
			return that["public"];
		};

		/**
		 * Animates the Carousel automatically.
		 * @public
		 * @function
		 * @name ch.Carousel#play
		 * @param {Number} t Delay of transition between pages, expressed in milliseconds.
		 * @returns Chico UI Object
		 * @exampleDescription Start automatic animation.
		 * @example
		 * foo.play();
		 * @exampleDescription Start automatic animation with a 5 seconds delay between pages.
		 * @example
		 * foo.play(5000);
		 */
		that["public"].play = function (t) {
			that.play(t);
			return that["public"];
		};

		/**
		 * Pause the Carousel automatic playing.
		 * @public
		 * @function
		 * @name ch.Carousel#pause
		 * @returns Chico UI Object
		 * @exampleDescription Pause automatic animation.
		 * @example
		 * foo.pause();
		 */
		that["public"].pause = function () {
			that.pause();
			return that["public"];
		};

		/**
		 * Get the items amount of each page (Since 0.7.4).
		 * @public
		 * @since 0.7.4
		 * @name ch.Carousel#itemsPerPage
		 * @returns Number
		 */
		that["public"].itemsPerPage = function () {
			return itemsPerPage;
		};

	/**
	 *  Default event delegation
	 */
		// Get ready the component structure.
		createLayout();

		// Put Carousel on specified page or at the beginning
		goToPage(conf.page || 1);

		// Shoot the ready event
		setTimeout(function () { that.trigger("ready"); }, 50);

		return that['public'];
	}

	Carousel.prototype.name = 'carousel';
	Carousel.prototype.constructor = Carousel;

	ch.factory(Carousel);

}(this, this.jQuery, this.ch));