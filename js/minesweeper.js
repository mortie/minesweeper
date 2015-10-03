import {Events} from "./events.js";

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
		ctx.drawImage(
			this.imgs.tile_empty,
			this.x * size,
			this.y * size,
			size,
			size
		);

		var img;

		if (!this.isClicked) {
			img = this.imgs.tile;
		} else {
			if (this.isMine) {
				img = this.imgs.mine;
			} else {
				img = null;
			}
		}

		if (img !== null) {
			ctx.drawImage(
				img,
				this.x * size,
				this.y * size,
				size,
				size
			);
		}

		if (this.isFlagged) {
			ctx.drawImage(
				this.imgs.flag,
				this.x * size,
				this.y * size,
				size,
				size
			);
		}

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

		return arr.filter((tile) => tile !== undefined);
	}

	getSurroundingMines(tiles) {
		var n = 0;

		this.getSurroundingTiles(tiles).forEach((tile) => {
			if (tile && tile.isMine)
				n += 1;
		});

		return n;
	}
}

class MineSweeper {
	constructor(canvas, imgs, width, height, nMines) {
		var i, j;

		this.canvas = canvas;
		this.imgs = imgs;
		this.width = width;
		this.height = height;
		this.nMines = nMines;
		this.ctx = canvas.getContext("2d");
		this.tiles = [];
		this.gameEnded = false;
		this.zoomLevel = 1;
		this.camera = {x: 0, y: 0};
		this.touched = false;

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

		this.draw();

		let events = new Events(canvas);

		events.on("click", (x, y) => {
			this.getTile(x, y).click(this.tiles);
			this.draw();
		});

		events.on("longclick", (x, y) => {
			navigator.vibrate(200);
			this.getTile(x, y).toggleFlag();
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
		});

		events.on("move", (x, y, prevX, prevY) => {
			this.camera.x -= (x - prevX) / this.zoomLevel;
			this.camera.y -= (y - prevY) / this.zoomLevel;
			this.draw();
		});
	}

	getTile(x, y) {
		[x, y] = this.adjustCoords(x, y);
		let size = this.getTileSize();
		x = Math.floor(x / size);
		y = Math.floor(y / size);
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
				tile.isClicked = true;
			});
		});
		this.draw();

		if (this.onlose)
			this.onlose();
	}

	win() {
		this.gameEnded = true;
		if (this.onwin)
			this.onwin();
	}

	zoom(n) {
		this.zoomLevel += n;
		this.camera.x *= n;
		this.camera.y *= n;
		this.draw();
	}

	draw() {
		this.canvas.width = this.canvas.width;

		this.ctx.save();

		this.ctx.scale(this.zoomLevel, this.zoomLevel);
		this.ctx.translate(-this.camera.x, -this.camera.y);

		this.tiles.forEach((row, x) => {
			row.forEach((tile, y) => {
				tile.draw(this.ctx, this.getTileSize(), this.tiles);
			});
		});

		this.ctx.restore();
	}

	getTileSize() {
		return 40;
	}
}

export {MineSweeper};
