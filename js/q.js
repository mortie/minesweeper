export function q(qs) {
	let elem = document.querySelector(qs);
	if (!elem)
		throw new Error("No matching element: '"+qs+"'");

	elem.on = (...args) => elem.addEventListener.apply(elem, args);
	return elem;
}
