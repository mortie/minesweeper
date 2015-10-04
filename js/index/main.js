import {Events} from "../events.js";
import {q} from "../q.js";
import {notify} from "../notify.js";

document.body.height = window.innerHeight+"px"
window.addEventListener("resize", () => document.body.height = window.innerHeight+"px");

function onInput(evt) {
	if (evt.keyCode === 8 || evt.keyCode === 27 || evt.ctrlKey || evt.metaKey)
		return;

	if (evt.keyCode < 48 || evt.keyCode > 57)
		evt.preventDefault();
}

q("#width").on("keydown", onInput);
q("#height").on("keydown", onInput);
q("#nmines").on("keydown", onInput);

function start() {
	location.href = "game.html#"+
		q("#width").value+","+
		q("#height").value+","+
		q("#nmines").value;
}

new Events(q("#start")).on("click", () => {
	let width = q("#width").value;
	let height = q("#height").value;
	let nmines = q("#nmines").value;

	if (width > 1000)
		return notify("Please specify a width below 1000.");
	else if (width > 1000)
		return notify("Please specify a height below 1000.");
	else if (nmines > 1000)
		return notify("Please specify a number of mines below 1000.");
	else if (nmines > width * height)
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
