function diff(a, b) {
	return Math.abs(a - b);
}

export class Events {
	constructor(elem) {
		elem.addEventListener("mousedown", (evt) => {
			evt.preventDefault();
			if (!this.isTouching && evt.button === 0)
				this.onDown(evt.offsetX, evt.offsetY);
		});
		elem.addEventListener("mousemove", (evt) => {
			evt.preventDefault();
			if (!this.isTouching && evt.button === 0)
				this.onMove(evt.offsetX, evt.offsetY);
		});
		elem.addEventListener("mouseup", (evt) => {
			evt.preventDefault();
			if (!this.isTouching && evt.button === 0)
				this.onUp(evt.offsetX, evt.offsetY);

			if (!this.isTouching && evt.button === 2)
				this.emit("rightclick", evt.offsetX, evt.offsetY);
		});

		elem.addEventListener("touchstart", (evt) => {
			evt.preventDefault();
			this.onDown(
				evt.changedTouches[0].clientX - elem.offsetLeft,
				evt.changedTouches[0].clientY - elem.offsetTop
			);
			this.isTouching = true;
		});
		elem.addEventListener("touchmove", (evt) => {
			evt.preventDefault();
			this.onMove(
				evt.changedTouches[0].clientX - elem.offsetLeft,
				evt.changedTouches[0].clientY - elem.offsetTop
			);
		});
		elem.addEventListener("touchend", (evt) => {
			evt.preventDefault();
			this.onUp(
				evt.changedTouches[0].clientX - elem.offsetLeft,
				evt.changedTouches[0].clientY - elem.offsetTop
			);
			this.isTouching = false;
		});

		this.cbs = {};
		this.startPos = {x: 0, y: 0};
		this.prevPos = {x: 0, y: 0};
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

	onDown(x, y) {
		this.isHolding = true;
		this.startPos = {x, y};
		this.prevPos = {x, y};
		this.startTime = new Date().getTime();
		this.isMoving = false;
		this.hasLongTouched = false;

		setTimeout(() => {
			if (this.isMoving || !this.isHolding)
				return;

			this.hasLongTouched = true;
			this.emit("longclick", x, y);
		}, this.prefs.longTouchTimeout);
	}

	onMove(x, y) {
		if (!this.isHolding)
			return;

		if (
			!this.isMoving && (
				diff(x, this.startPos.x) > this.prefs.minMoveDistance ||
				diff(y, this.startPos.y) > this.prefs.minMoveDistance
			)
		) {
			this.isMoving = true;
			this.emit("movestart", x, y);
		}

		if (this.isMoving)
			this.emit("move", x, y, this.prevPos.x, this.prevPos.y);

		this.prevPos = {x: x, y: y};
	}

	onUp(x, y) {
		if (this.isMoving)
			this.emit("moveend", x, y);

		this.isHolding = false;

		if (this.isMoving || this.hasLongTouched)
			return;

		var time = new Date().getTime();

		this.emit("click", x, y);
	}

	on(name, cb) {
		if (!this.cbs[name])
			this.cbs[name] = [];

		this.cbs[name].push(cb);
	}

	emit(name, ...args) {
		if (!this.cbs[name])
			return;

		this.cbs[name].forEach((cb) => cb.apply(null, args));
	}
}
