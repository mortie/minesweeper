import {Events} from "./events.js";

export function notify(msg, cb) {
	let elem = document.createElement("div");
	elem.className = "notification";

	let textElem = document.createElement("div");
	textElem.innerHTML = msg;
	elem.appendChild(textElem);

	let okButtonElem = document.createElement("div");
	okButtonElem.className = "button";
	okButtonElem.innerHTML = "OK";
	new Events(okButtonElem).on("click", () => {
		document.body.removeChild(elem);

		if (cb)
			cb();
	});
	elem.appendChild(okButtonElem);

	document.body.appendChild(elem);
}
