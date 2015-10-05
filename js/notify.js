import {Events} from "./events.js";

export function notify(msg, cb) {
	if (document.activeElement)
		document.activeElement.blur();

	let wrapper = document.createElement("div");
	wrapper.className = "notification-wrapper";

	let elem = document.createElement("div");
	elem.className = "notification";
	wrapper.appendChild(elem);

	let textElem = document.createElement("div");
	textElem.innerHTML = msg;
	elem.appendChild(textElem);

	let okButtonElem = document.createElement("div");
	okButtonElem.className = "button";
	okButtonElem.innerHTML = "Dismiss";
	new Events(okButtonElem).on("click", () => {
		document.body.removeChild(wrapper);

		if (cb)
			cb();
	});
	elem.appendChild(okButtonElem);

	document.body.appendChild(wrapper);
}
