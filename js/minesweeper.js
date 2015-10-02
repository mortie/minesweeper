function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Tile {
	constructor(imgs, x, y, isMine = false) {
		this.isClicked = false;
		this.imgs = imgs;
		this.x = x;
		this.y = y;
		this.isMine = isMine;
		this.isFlagged = false;
	}

	click(tiles) {
		if (this.isClicked === true)
			return;

		this.isClicked = true;
		this.isFlagged = false;

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
		for (i = 0; i < width; ++i) {
			this.tiles[i] = [];
			for (j = 0; j < height; ++j) {
				this.tiles[i][j] = new Tile(imgs, i, j);
			}
		}

		for (i = 0; i < nMines; ++i) {
			var x, y;

			do {
				x = randInt(0, width - 1);
				y = randInt(0, height - 1);
			} while (this.tiles[x][y].isMine);

			this.tiles[x][y] = new Tile(imgs, x, y, true);
		}

		canvas.addEventListener("mousedown", (evt) => {
			this.onDown(evt.offsetX, evt.offsetY);
		});

		canvas.addEventListener("mouseup", (evt) => {
			if (this.onDown.shouldOnUp)
				this.onUp(evt.offsetX, evt.offsetY);
		});

		canvas.addEventListener("touchdown", (evt) => {
			this.onDown(evt.pageX, evt.pageY);
		});

		canvas.addEventListener("touchup", (evt) => {
			if (this.onDown.shouldOnUp)
				this.onUp(evt.pageX, evt.pageY);
		});
	}

	onDown(posX, posY) {
		if (this.gameEnded)
			return;

		this.onDown.shouldOnUp = true;
		this.onDown.posX = posX;
		this.onDown.posY = posY;

		this.onDown.timeout = setTimeout(() => {
			this.onDown.shouldOnUp = false;
			this.onUp(posX, posY, true);
		}, 210);
	}

	onUp(posX, posY, shouldFlag = false) {
		if (this.gameEnded)
			return;

		clearTimeout(this.onDown.timeout);

		var size = this.getTileSize();

		var x = Math.floor(posX / size);
		var y = Math.floor(posY / size);

		var tile = this.tiles[x][y];

		if (shouldFlag) {
			tile.toggleFlag();
		} else {
			tile.click(this.tiles);
			if (tile.isMine)
				this.lose();
		}

		this.draw();
	}

	lose() {
		alert("You lost!");
		this.gameEnded = true;
		this.tiles.forEach((row) => {
			row.forEach((tile) => {
				tile.isClicked = true;
				tile.isFlagged = false;
			});
		});
		this.draw();
	}

	draw() {
		this.canvas.width = this.canvas.width;

		this.tiles.forEach((row, x) => {
			row.forEach((tile, y) => {
				tile.draw(this.ctx, this.getTileSize(), this.tiles);
			});
		});
	}

	getTileSize() {
		return Math.min(
			this.canvas.width / this.width,
			this.canvas.height / this.height
		);
	}
}

export {MineSweeper};
