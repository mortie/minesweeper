import {Events} from "../events.js";
import {q} from "../q.js";
import {notify} from "../notify.js";

document.body.style.height = window.innerHeight+"px";
window.addEventListener("resize", () => document.body.height = window.innerHeight+"px");

function onInput(evt) {
	if (evt.keyCode === 8 || evt.keyCode === 27 || evt.ctrlKey || evt.metaKey)
		return;

	if (evt.keyCode < 48 || evt.keyCode > 57)
		evt.preventDefault();
}

let width = q("#width");
let height = q("#height");
let nMines = q("#nMines");

width.on("keydown", onInput);
height.on("keydown", onInput);
nMines.on("keydown", onInput);

let args = location.hash.substring(1).split(",");

width.value = args[0] || width.value;
height.value = args[1] || height.value;
nMines.value = args[2] || nMines.value;

if (localStorage.getItem("state"))
	start();

function start() {
	location.href = "game.html#"+
		width.value+","+
		height.value+","+
		nMines.value;
}

new Events(q("#start")).on("click", () => {
	if (width.value > 1000)
		return notify("Please specify a width below 1000.");
	else if (height.value > 1000)
		return notify("Please specify a height below 1000.");
	else if (nMines.value > 1000)
		return notify("Please specify a number of mines below 1000.");
	else if (nMines.value > width.value * height.value)
		return notify("You can't have more mines than tiles.");

	if (document.activeElement) {
		document.activeElement.blur();
		setTimeout(() => start(), 500);
	} else {
		start();
	}
});

//Prevent scrolling
window.addEventListener("touchmove", (evt) => evt.preventDefault());
