import {MineSweeper} from "./minesweeper.js";

function $(qs) {
	let elem = document.querySelector(qs);
	if (!elem)
		throw new Error("No matching element: '"+qs+"'");

	elem.on = (...args) => {
		elem.addEventListener.apply(elem, args);
	};
	return elem;
}

let ms;

function startGame(w, h, nMines) {
	let canvas = document.getElementById("canvas");

	let imgs = {};
	["tile", "mine", "flag", "tile_empty"].forEach((str) => {
		imgs[str] = $(".imgs ."+str);
		if (!imgs[str])
			throw new Error("'"+str+"' doesn't match any elements.");
	});

	ms = new MineSweeper(canvas, imgs, w, h, nMines);

	ms.onflag = (nLeft) => {
		$(".controls .nleft").innerHTML = nLeft;
	};

	ms.onlose = () => {
		alert("You lost!");
	};

	ms.onwin = () => {
		alert("You won!");
	};

	$(".controls .nleft").innerHTML = nMines;
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener("resize", () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	ms.draw();
});

startGame(20, 20, 50);

window.onerror = (message, filename, lineno, colno, error) => {
	throw error;
};

$(".controls .reset").on("click", function() {
	startGame(20, 20, 50);
});

$(".controls .zoom-in").on("click", function() {
	ms.zoom(0.2);
});

$(".controls .zoom-out").on("click", function() {
	ms.zoom(-0.2);
});
