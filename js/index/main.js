import {Events} from "../events.js";
import {q} from "../q.js";
import {notify} from "../notify.js";

function onInput(evt) {
	if (evt.keyCode === 8 || evt.keyCode === 27 || evt.ctrlKey || evt.metaKey)
		return;

	if (evt.keyCode <= 48 || evt.keyCode >= 57)
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
	if (q("#width").value > 1000)
		return notify("Please specify a width below 1000.");
	else if (q("#height").value > 1000)
		return notify("Please specify a height below 1000.");
	else if (q("#nmines").value > 1000)
		return notify("Please specify a number of mines below 1000.");

	if (document.activeElement) {
		document.activeElement.blur();
		setTimeout(() => start(), 500);
	} else {
		start();
	}
});

//Prevent scrolling
window.addEventListener("touchmove", (evt) => evt.preventDefault());
