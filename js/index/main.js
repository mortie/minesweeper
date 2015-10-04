import {Events} from "../events.js";
import {q} from "../q.js";
import {notify} from "../notify.js";

function onInput(evt) {
	if (!evt.isChar || evt.ctrlKey)
		return;

	if (!/^[0-9]+$/.test(evt.key))
		evt.preventDefault();
}

q("#width").on("keydown", onInput);
q("#height").on("keydown", onInput);
q("#nmines").on("keydown", onInput);

new Events(q("#start")).on("click", () => {
	if (q("#width").value > 1000)
		return notify("Please specify a width below 1000.");
	else if (q("#height").value > 1000)
		return notify("Please specify a height below 1000.");
	else if (q("#nmines").value > 1000)
		return notify("Please specify a number of mines below 1000.");

	location.href = "game.html#"+
		q("#width").value+","+
		q("#height").value+","+
		q("#nmines").value;
});
