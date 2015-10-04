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

var _minesweeperJs = require("./minesweeper.js");

var _eventsJs = require("../events.js");

var _qJs = require("../q.js");

var _notifyJs = require("../notify.js");

var args = location.hash.substring(1).split(",");
var width = args[0];
var height = args[1];
var nMines = args[2];

var canvas = (0, _qJs.q)("#canvas");

var ms = undefined;

function startGame(w, h, nMines) {
	var imgs = {};
	["tile", "mine", "flag"].forEach(function (str) {
		imgs[str] = (0, _qJs.q)(".imgs ." + str);
		if (!imgs[str]) throw new Error("'" + str + "' doesn't match any elements.");
	});

	ms = new _minesweeperJs.MineSweeper(canvas, imgs, w, h, nMines);

	ms.onflag = function (nLeft) {
		(0, _qJs.q)(".controls .nleft").innerHTML = nLeft;
	};

	ms.onlose = function () {
		(0, _notifyJs.notify)("You lost!");
	};

	ms.onwin = function () {
		(0, _notifyJs.notify)("You won!");
	};

	(0, _qJs.q)(".controls .nleft").innerHTML = nMines;
}

//Size canvas correctly
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener("resize", function () {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	ms.draw();
});

//Prevent unwanted context menus
canvas.on("contextmenu", function (evt) {
	return evt.preventDefault();
});

//Start game
startGame(width, height, nMines);

//Add controls
new _eventsJs.Events((0, _qJs.q)(".controls .back")).on("click", function () {
	return location.href = "index.html";
});
new _eventsJs.Events((0, _qJs.q)(".controls .reset")).on("click", function () {
	return location.reload();
});
new _eventsJs.Events((0, _qJs.q)(".controls .zoom-in")).on("click", function () {
	return ms.zoom(0.2);
});
new _eventsJs.Events((0, _qJs.q)(".controls .zoom-out")).on("click", function () {
	return ms.zoom(-0.2);
});
new _eventsJs.Events((0, _qJs.q)(".controls .zoom-reset")).on("click", function () {
	return ms.zoom(0);
});

},{"../events.js":1,"../notify.js":4,"../q.js":5,"./minesweeper.js":3}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _eventsJs = require("../events.js");

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

var Tile = (function () {
	function Tile(game, imgs, x, y) {
		var isMine = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

		_classCallCheck(this, Tile);

		this.game = game;
		this.isClicked = false;
		this.imgs = imgs;
		this.x = x;
		this.y = y;
		this.isMine = isMine;
		this.isFlagged = false;
	}

	_createClass(Tile, [{
		key: "click",
		value: function click(tiles) {
			if (this.isClicked || this.isFlagged) return;

			this.isClicked = true;
			this.isFlagged = false;

			if (this.isMine) return this.game.lose();

			if (this.getSurroundingMines(tiles) > 0) return;

			this.getSurroundingTiles(tiles).forEach(function (tile) {
				if (!tile.isMine) tile.click(tiles);
			});
		}
	}, {
		key: "toggleFlag",
		value: function toggleFlag() {
			if (this.isClicked) return;

			this.isFlagged = !this.isFlagged;
		}
	}, {
		key: "draw",
		value: function draw(ctx, size, tiles) {
			var _this = this;

			var drawImg = function drawImg(img) {
				ctx.drawImage(img, _this.x * size, _this.y * size, size, size);
			};

			if (!this.isClicked) drawImg(this.imgs.tile);else if (this.isMine) drawImg(this.imgs.mine);

			if (this.isFlagged) drawImg(this.imgs.flag);

			if (this.isClicked && !this.isMine) {
				var surroundingMines = this.getSurroundingMines(tiles);
				if (surroundingMines === 0) return;

				ctx.font = size / 2 + "px serif";
				ctx.fillText(surroundingMines.toString(), this.x * size + size / 3, this.y * size + size / 1.5);
			}
		}
	}, {
		key: "getSurroundingTiles",
		value: function getSurroundingTiles(tiles) {
			if (this.getSurroundingTilesCache) return this.getSurroundingTilesCache;

			if (tiles === undefined) return console.trace(new Error(":("));

			var x = this.x;
			var y = this.y;
			var arr = [];

			if (tiles[x - 1]) {
				arr.push(tiles[x - 1][y - 1]);
				arr.push(tiles[x - 1][y]);
				arr.push(tiles[x - 1][y + 1]);
			}

			arr.push(tiles[x][y - 1]);
			arr.push(tiles[x][y + 1]);

			if (tiles[x + 1]) {
				arr.push(tiles[x + 1][y - 1]);
				arr.push(tiles[x + 1][y]);
				arr.push(tiles[x + 1][y + 1]);
			}

			arr = arr.filter(function (tile) {
				return tile !== undefined;
			});

			this.getSurroundingTilesCache = arr;
			return arr;
		}
	}, {
		key: "getSurroundingMines",
		value: function getSurroundingMines(tiles) {
			if (this.getSurroundingMinesCache) return this.getSurroundingMinesCache;

			var n = 0;

			this.getSurroundingTiles(tiles).forEach(function (tile) {
				if (tile && tile.isMine) n += 1;
			});

			this.getSurroundingMinesCache = n;
			return n;
		}
	}]);

	return Tile;
})();

var MineSweeper = (function () {
	function MineSweeper(canvas, imgs, width, height, nMines) {
		var _this2 = this;

		_classCallCheck(this, MineSweeper);

		var i, j;

		this.canvas = canvas;
		this.offCanvas = document.createElement("canvas");
		this.imgs = imgs;
		this.width = width;
		this.height = height;
		this.nMines = nMines;
		this.ctx = canvas.getContext("2d");
		this.offCtx = this.offCanvas.getContext("2d");
		this.tiles = [];
		this.gameEnded = false;
		this.zoomLevel = 1;
		this.touched = false;

		//Make offset canvas size appropriate
		this.offCanvas.width = this.getTileSize() * width;
		this.offCanvas.height = this.getTileSize() * height;

		this.camera = {
			x: -(canvas.width / 2) + this.getTileSize() * width / 2,
			y: 0
		};

		for (i = 0; i < width; ++i) {
			this.tiles[i] = [];
			for (j = 0; j < height; ++j) {
				this.tiles[i][j] = new Tile(this, imgs, i, j);
			}
		}

		//Generate random mines
		for (i = 0; i < nMines; ++i) {
			var x, y;

			do {
				x = randInt(0, width - 1);
				y = randInt(0, height - 1);
			} while (this.tiles[x][y].isMine);

			this.tiles[x][y] = new Tile(this, imgs, x, y, true);
		}

		var events = new _eventsJs.Events(canvas);

		events.on("click", function (x, y) {
			if (_this2.gameEnded) return;

			var tile = _this2.getTile(x, y);
			if (tile === null) return;

			tile.click(_this2.tiles);
			_this2.draw();
		});

		var flag = function flag(x, y) {
			if (_this2.gameEnded) return;

			var tile = _this2.getTile(x, y);
			if (tile === null) return;

			tile.toggleFlag();

			if (navigator.vibrate) navigator.vibrate(200);

			_this2.draw();

			var nFlagged = 0;
			var nMinesFlagged = 0;
			_this2.tiles.forEach(function (row) {
				row.forEach(function (tile) {
					if (tile.isFlagged) nFlagged += 1;
					if (tile.isMine && tile.isFlagged) nMinesFlagged += 1;
				});
			});

			var nLeft = _this2.nMines - nFlagged;
			var nMinesLeft = _this2.nMines - nMinesFlagged;

			if (_this2.onflag) _this2.onflag(nLeft);

			if (nMinesLeft === 0) _this2.win();
		};

		events.on("longclick", flag);
		events.on("rightclick", flag);

		events.on("movestart", function () {
			_this2.draw(_this2.offCanvas, _this2.offCtx, true);
		});
		events.on("moveend", function () {
			return _this2.draw();
		});
		events.on("move", function (x, y, prevX, prevY) {
			_this2.camera.x -= (x - prevX) / _this2.zoomLevel;
			_this2.camera.y -= (y - prevY) / _this2.zoomLevel;
			_this2.updateCanvas();
		});

		this.draw();
	}

	_createClass(MineSweeper, [{
		key: "getTile",
		value: function getTile(x, y) {
			var _adjustCoords = this.adjustCoords(x, y);

			var _adjustCoords2 = _slicedToArray(_adjustCoords, 2);

			x = _adjustCoords2[0];
			y = _adjustCoords2[1];

			var size = this.getTileSize();
			x = Math.floor(x / size);
			y = Math.floor(y / size);

			if (!this.tiles[x] || !this.tiles[x][y]) return null;

			return this.tiles[x][y];
		}
	}, {
		key: "adjustCoords",
		value: function adjustCoords(x, y) {
			return [x / this.zoomLevel + this.camera.x, y / this.zoomLevel + this.camera.y];
		}
	}, {
		key: "lose",
		value: function lose() {
			this.gameEnded = true;
			this.tiles.forEach(function (row) {
				row.forEach(function (tile) {
					if (tile.isMine) tile.isClicked = true;
				});
			});
			this.draw();

			if (this.onlose) this.onlose();
		}
	}, {
		key: "win",
		value: function win() {
			this.gameEnded = true;
			if (this.onwin) this.onwin();
		}
	}, {
		key: "zoom",
		value: function zoom(n) {
			if (n === 0) {
				this.zoomLevel = 1;
				this.camera.x = -(this.canvas.width / 2) + this.getTileSize() * this.width / 2;
				this.camera.y = 0;
				this.draw();
				return;
			}

			this.zoomLevel += n;
			this.camera.x /= this.zoomLevel;
			this.camera.y /= this.zoomLevel;
			this.draw();
		}
	}, {
		key: "updateCanvas",
		value: function updateCanvas() {
			this.canvas.width = this.canvas.width;
			this.ctx.save();

			this.ctx.scale(this.zoomLevel, this.zoomLevel);
			this.ctx.translate(-this.camera.x, -this.camera.y);
			this.ctx.drawImage(this.offCanvas, 0, 0);

			this.ctx.restore();
		}
	}, {
		key: "draw",
		value: function draw(canvas, ctx) {
			var _this3 = this;

			var preventTransform = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

			canvas = canvas || this.canvas;
			ctx = ctx || this.ctx;
			canvas.width = canvas.width;

			ctx.save();

			if (!preventTransform) {
				this.ctx.scale(this.zoomLevel, this.zoomLevel);
				ctx.translate(-this.camera.x, -this.camera.y);
			}

			this.tiles.forEach(function (row, x) {
				row.forEach(function (tile, y) {
					tile.draw(ctx, _this3.getTileSize(), _this3.tiles);
				});
			});

			ctx.restore();
		}
	}, {
		key: "getTileSize",
		value: function getTileSize() {
			return 30;
		}
	}]);

	return MineSweeper;
})();

exports.MineSweeper = MineSweeper;

},{"../events.js":1}],4:[function(require,module,exports){
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

},{"./events.js":1}],5:[function(require,module,exports){
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

},{}]},{},[1,4,5,2,3]);
