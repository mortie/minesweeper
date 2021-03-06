import {Events} from "../events.js";

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Tile {
	constructor(game, imgs, x, y, isMine = false) {
		this.game = game;
		this.isClicked = false;
		this.imgs = imgs;
		this.x = x;
		this.y = y;
		this.isMine = isMine;
		this.isFlagged = false;
	}

	getState() {
		return ""+
			(this.isClicked ? "1" : "0")+
			(this.isMine ? "1" : "0")+
			(this.isFlagged ? "1" : "0")+","+
			this.x+","+
			this.y;
	}

	setState(state, game=this.game, imgs=this.imgs) {
		this.game = game;
		this.imgs = imgs;

		let parts = state.split(",");

		console.log(parts[0]);
		this.isClicked = (parts[0][0] == "1");
		this.isMine = (parts[0][1] == "1");
		this.isFlagged = (parts[0][2] == "1");
		this.x = parseInt(parts[1]);
		this.y = parseInt(parts[2]);
	}

	click(tiles) {
		if (this.isClicked || this.isFlagged)
			return;

		this.isClicked = true;
		this.isFlagged = false;

		if (this.isMine)
			return this.game.lose();

		if (this.getSurroundingMines(tiles) > 0)
			return;

		this.getSurroundingTiles(tiles).forEach((tile) => {
			if (!tile.isMine)
				tile.click(tiles);
		});
	}

	toggleFlag() {
		if (this.isClicked)
			return;

		this.isFlagged = !this.isFlagged;
	}

	draw(ctx, size, tiles) {
		let drawImg = (img) => {
			ctx.drawImage(
				img,
				this.x * size,
				this.y * size,
				size,
				size
			);
		};

		if (!this.isClicked)
			drawImg(this.imgs.tile);
		else if (this.isMine)
			drawImg(this.imgs.mine);

		if (this.isFlagged)
			drawImg(this.imgs.flag);

		if (this.isClicked && !this.isMine) {
			var surroundingMines = this.getSurroundingMines(tiles);
			if (surroundingMines === 0)
				return;

			ctx.font = (size/2)+"px serif";
			ctx.fillText(
				surroundingMines.toString(),
				(this.x * size) + (size / 3),
				(this.y * size) + (size / 1.5)
			);
		}
	}

	getSurroundingTiles(tiles) {
		if (this.getSurroundingTilesCache)
			return this.getSurroundingTilesCache;

		if (tiles === undefined)
			return console.trace(new Error(":("));

		var x = this.x;
		var y = this.y;
		var arr = [];

		if (tiles[x-1]) {
			arr.push(tiles[x-1][y-1]);
			arr.push(tiles[x-1][y]);
			arr.push(tiles[x-1][y+1]);
		}

		arr.push(tiles[x][y-1]);
		arr.push(tiles[x][y+1]);

		if (tiles[x+1]) {
			arr.push(tiles[x+1][y-1]);
			arr.push(tiles[x+1][y]);
			arr.push(tiles[x+1][y+1]);
		}

		arr = arr.filter((tile) => tile !== undefined);

		this.getSurroundingTilesCache = arr;
		return arr;
	}

	getSurroundingMines(tiles) {
		if (this.getSurroundingMinesCache)
			return this.getSurroundingMinesCache;

		var n = 0;

		this.getSurroundingTiles(tiles).forEach((tile) => {
			if (tile && tile.isMine)
				n += 1;
		});

		this.getSurroundingMinesCache = n;
		return n;
	}
}

class MineSweeper {
	constructor(canvas, imgs, width, height, nMines) {
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
			x: -(canvas.width / 2) + ((this.getTileSize() * width) / 2),
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

		let events = new Events(canvas);

		events.on("click", (x, y) => {
			if (this.gameEnded)
				return;

			let tile = this.getTile(x, y);
			if (tile === null)
				return;

			tile.click(this.tiles);
			this.draw();

			if (this.onchange)
				this.onchange();
		});

		let flag = (x, y) => {
			if (this.gameEnded)
				return;

			let tile = this.getTile(x, y);
			if (tile === null)
				return;

			tile.toggleFlag();

			if (navigator.vibrate)
				navigator.vibrate(100);

			this.draw();

			let nFlagged = 0;
			let nMinesFlagged = 0;
			this.tiles.forEach((row) => {
				row.forEach((tile) => {
					if (tile.isFlagged)
						nFlagged += 1;
					if (tile.isMine && tile.isFlagged)
						nMinesFlagged += 1;
				});
			});

			let nLeft = this.nMines - nFlagged;
			let nMinesLeft = this.nMines - nMinesFlagged;

			if (this.onflag)
				this.onflag(nLeft);

			if (nMinesLeft === 0)
				this.win();

			if (this.onchange)
				this.onchange();
		};

		events.on("longclick", flag);
		events.on("rightclick", flag);

		events.on("movestart", () => {
			this.draw(this.offCanvas, this.offCtx, true);
		});
		events.on("moveend", () => this.draw());
		events.on("move", (x, y, prevX, prevY) => {
			this.camera.x -= (x - prevX) / this.zoomLevel;
			this.camera.y -= (y - prevY) / this.zoomLevel;
			this.updateCanvas();
		});

		this.draw();
	}

	getState() {
		let tiles = "";
		this.tiles.forEach((row) => {
			row.forEach((tile) => {
				tiles += tile.getState() + ";";
			});
		});
		tiles.substring(0, tiles.length - 1);

		return {
			tiles: tiles
		};
	}

	setState(state) {
		this.tiles = [];

		state.tiles.split(";").forEach((tile) => {
			let t = new Tile();
			t.setState(tile, this, this.imgs);

			if (!this.tiles[t.x])
				this.tiles[t.x] = [];

			this.tiles[t.x][t.y] = t;
		});

		this.draw();
	}

	getTile(x, y) {
		[x, y] = this.adjustCoords(x, y);
		let size = this.getTileSize();
		x = Math.floor(x / size);
		y = Math.floor(y / size);

		if (!this.tiles[x] || !this.tiles[x][y])
			return null;

		return this.tiles[x][y];
	}

	adjustCoords(x, y) {
		return [
			(x / this.zoomLevel) + this.camera.x,
			(y / this.zoomLevel) + this.camera.y
		];
	}

	lose() {
		this.gameEnded = true;
		this.tiles.forEach((row) => {
			row.forEach((tile) => {
				if (tile.isMine)
					tile.isClicked = true;
			});
		});
		this.draw();

		if (navigator.vibrate)
			navigator.vibrate(1000);

		if (this.onlose)
			this.onlose();
	}

	win() {
		this.gameEnded = true;

		if (navigator.vibrate)
			navigator.vibrate([100, 200, 100, 200, 100]);

		if (this.onwin)
			this.onwin();
	}

	zoom(n) {
		if (n === 0) {
			this.zoomLevel = 1;
			this.camera.x = -(this.canvas.width / 2) + ((this.getTileSize() * this.width) / 2);
			this.camera.y = 0;
			this.draw();
			return;
		}

		this.zoomLevel += n;
		this.camera.x /= this.zoomLevel;
		this.camera.y /= this.zoomLevel;
		this.draw();
	}

	updateCanvas() {
		this.canvas.width = this.canvas.width;
		this.ctx.save();

		this.ctx.scale(this.zoomLevel, this.zoomLevel);
		this.ctx.translate(-this.camera.x, -this.camera.y);
		this.ctx.drawImage(this.offCanvas, 0, 0);

		this.ctx.restore();
	}

	draw(canvas, ctx, preventTransform = false) {
		canvas = canvas || this.canvas;
		ctx = ctx || this.ctx;
		canvas.width = canvas.width;

		ctx.save();

		if (!preventTransform) {
			this.ctx.scale(this.zoomLevel, this.zoomLevel);
			ctx.translate(-this.camera.x, -this.camera.y);
		}

		this.tiles.forEach((row, x) => {
			row.forEach((tile, y) => {
				tile.draw(ctx, this.getTileSize(), this.tiles);
			});
		});

		ctx.restore();
	}

	getTileSize() {
		return 40;
	}
}

export {MineSweeper};
