(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function diff(a, b) {
	return Math.abs(a - b);
}

var Events = (function () {
	function Events(elem) {
		var _this = this;

		_classCallCheck(this, Events);

		elem.addEventListener("mousedown", function (evt) {
			evt.preventDefault();
			if (!_this.isTouching && evt.button === 0) _this.onDown(evt.offsetX, evt.offsetY);
		});
		elem.addEventListener("mousemove", function (evt) {
			evt.preventDefault();
			if (!_this.isTouching && evt.button === 0) _this.onMove(evt.offsetX, evt.offsetY);
		});
		elem.addEventListener("mouseup", function (evt) {
			evt.preventDefault();
			if (!_this.isTouching && evt.button === 0) _this.onUp(evt.offsetX, evt.offsetY);

			if (!_this.isTouching && evt.button === 2) _this.emit("rightclick", evt.offsetX, evt.offsetY);
		});

		elem.addEventListener("touchstart", function (evt) {
			evt.preventDefault();
			_this.onDown(evt.changedTouches[0].clientX - elem.offsetLeft, evt.changedTouches[0].clientY - elem.offsetTop);
			_this.isTouching = true;
		});
		elem.addEventListener("touchmove", function (evt) {
			evt.preventDefault();
			_this.onMove(evt.changedTouches[0].clientX - elem.offsetLeft, evt.changedTouches[0].clientY - elem.offsetTop);
		});
		elem.addEventListener("touchend", function (evt) {
			evt.preventDefault();
			_this.onUp(evt.changedTouches[0].clientX - elem.offsetLeft, evt.changedTouches[0].clientY - elem.offsetTop);
			_this.isTouching = false;
		});

		this.cbs = {};
		this.startPos = { x: 0, y: 0 };
		this.prevPos = { x: 0, y: 0 };
		this.startTime = 0;
		this.isMoving = false;
		this.isHolding = false;
		this.isTouching = false;
		this.hasLongTouched = false;

		this.prefs = {
			longTouchTimeout: 200,
			minMoveDistance: 10
		};
	}

	_createClass(Events, [{
		key: "onDown",
		value: function onDown(x, y) {
			var _this2 = this;

			this.isHolding = true;
			this.startPos = { x: x, y: y };
			this.prevPos = { x: x, y: y };
			this.startTime = new Date().getTime();
			this.isMoving = false;
			this.hasLongTouched = false;

			setTimeout(function () {
				if (_this2.isMoving || !_this2.isHolding) return;

				_this2.hasLongTouched = true;
				_this2.emit("longclick", x, y);
			}, this.prefs.longTouchTimeout);
		}
	}, {
		key: "onMove",
		value: function onMove(x, y) {
			if (!this.isHolding) return;

			if (!this.isMoving && (diff(x, this.startPos.x) > this.prefs.minMoveDistance || diff(y, this.startPos.y) > this.prefs.minMoveDistance)) {
				this.isMoving = true;
				this.emit("movestart", x, y);
			}

			if (this.isMoving) this.emit("move", x, y, this.prevPos.x, this.prevPos.y);

			this.prevPos = { x: x, y: y };
		}
	}, {
		key: "onUp",
		value: function onUp(x, y) {
			if (this.isMoving) this.emit("moveend", x, y);

			this.isHolding = false;

			if (this.isMoving || this.hasLongTouched) return;

			var time = new Date().getTime();

			this.emit("click", x, y);
		}
	}, {
		key: "on",
		value: function on(name, cb) {
			if (!this.cbs[name]) this.cbs[name] = [];

			this.cbs[name].push(cb);
		}
	}, {
		key: "emit",
		value: function emit(name) {
			for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				args[_key - 1] = arguments[_key];
			}

			if (!this.cbs[name]) return;

			this.cbs[name].forEach(function (cb) {
				return cb.apply(null, args);
			});
		}
	}]);

	return Events;
})();

exports.Events = Events;

},{}],2:[function(require,module,exports){
"use strict";

var _eventsJs = require("../events.js");

var _qJs = require("../q.js");

var _notifyJs = require("../notify.js");

function onInput(evt) {
	if (!evt.isChar || evt.ctrlKey) return;

	if (!/^[0-9]+$/.test(evt.key)) evt.preventDefault();
}

(0, _qJs.q)("#width").on("keydown", onInput);
(0, _qJs.q)("#height").on("keydown", onInput);
(0, _qJs.q)("#nmines").on("keydown", onInput);

new _eventsJs.Events((0, _qJs.q)("#start")).on("click", function () {
	if ((0, _qJs.q)("#width").value > 1000) return (0, _notifyJs.notify)("Please specify a width below 1000.");else if ((0, _qJs.q)("#height").value > 1000) return (0, _notifyJs.notify)("Please specify a height below 1000.");else if ((0, _qJs.q)("#nmines").value > 1000) return (0, _notifyJs.notify)("Please specify a number of mines below 1000.");

	location.href = "game.html#" + (0, _qJs.q)("#width").value + "," + (0, _qJs.q)("#height").value + "," + (0, _qJs.q)("#nmines").value;
});

},{"../events.js":1,"../notify.js":3,"../q.js":4}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.notify = notify;

var _eventsJs = require("./events.js");

function notify(msg, cb) {
	var elem = document.createElement("div");
	elem.className = "notification";

	var textElem = document.createElement("div");
	textElem.innerHTML = msg;
	elem.appendChild(textElem);

	var okButtonElem = document.createElement("div");
	okButtonElem.className = "button";
	okButtonElem.innerHTML = "OK";
	new _eventsJs.Events(okButtonElem).on("click", function () {
		document.body.removeChild(elem);

		if (cb) cb();
	});
	elem.appendChild(okButtonElem);

	document.body.appendChild(elem);
}

},{"./events.js":1}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.q = q;

function q(qs) {
	var elem = document.querySelector(qs);
	if (!elem) throw new Error("No matching element: '" + qs + "'");

	elem.on = function () {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		return elem.addEventListener.apply(elem, args);
	};
	return elem;
}

},{}]},{},[1,3,4,2]);
