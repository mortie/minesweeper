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

let canvas = $("#canvas");

let ms;

function startGame(w, h, nMines) {
	let imgs = {};
	["tile", "mine", "flag"].forEach((str) => {
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
startGame(20, 20, 50);

//Add controls
$(".controls .reset").on("click", () => startGame(20, 20, 50));
$(".controls .zoom-in").on("click", () => ms.zoom(0.2));
$(".controls .zoom-out").on("click", () => ms.zoom(-0.2));
$(".controls .zoom-reset").on("click", () => ms.zoom(0));
