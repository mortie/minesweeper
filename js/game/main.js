import {MineSweeper} from "./minesweeper.js";
import {Events} from "../events.js";
import {q} from "../q.js";
import {notify} from "../notify.js";

let args = location.hash.substring(1).split(",");
let width = args[0];
let height = args[1];
let nMines = args[2];

let canvas = q("#canvas");

let ms;

function startGame(w, h, nMines) {
	let imgs = {};
	["tile", "mine", "flag"].forEach((str) => {
		imgs[str] = q(".imgs ."+str);
		if (!imgs[str])
			throw new Error("'"+str+"' doesn't match any elements.");
	});

	ms = new MineSweeper(canvas, imgs, w, h, nMines);

	ms.onflag = (nLeft) => {
		q(".controls .nleft").innerHTML = nLeft;
	};

	ms.onlose = () => {
		notify("You lost!");
	};

	ms.onwin = () => {
		notify("You won!");
	};

	q(".controls .nleft").innerHTML = nMines;
}

//Size canvas correctly
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener("resize", () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	ms.draw();
});

//Prevent unwanted context menus
canvas.on("contextmenu", (evt) => evt.preventDefault());

//Start game
startGame(width, height, nMines);

//Add controls
new Events(q(".controls .back")).on("click", () => {
	location.href = `index.html#${width},${height},${nMines}`;
});
new Events(q(".controls .reset")).on("click", () => location.reload());
new Events(q(".controls .zoom-in")).on("click", () => ms.zoom(0.2));
new Events(q(".controls .zoom-out")).on("click", () => ms.zoom(-0.2));
new Events(q(".controls .zoom-reset")).on("click", () => ms.zoom(0));
