import {MineSweeper} from "./minesweeper.js";

var canvas = document.getElementById("canvas");
var ms;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener("resize", () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	ms.draw();
});

var imgs = {};
["tile", "mine", "flag", "tile_empty"].forEach((elem) => {
	var qs = ".imgs ."+elem;
	imgs[elem] = document.querySelector(qs);
	if (!imgs[elem])
		throw new Error("'"+qs+"' doesn't match any elements.");
});

ms = new MineSweeper(canvas, imgs, 20, 20, 50);
ms.draw();
