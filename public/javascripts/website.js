const list = document.querySelector("#words");
const counter = document.getElementById("counter");
let words = [];
let copy = [];
let countNot = 0;

const ws = new WebSocket("ws://localhost:3000")
ws.addEventListener("open", () => console.log("We are connected!"))

ws.addEventListener("message", msg => {
	msg = JSON.parse(msg.data);

	switch (msg.header) {
		case messages.WORDS:
			words = msg.body.words;
			for (let word of words)
				copy.push(word);
			showWords(words);
			break;
	}
})

document.onkeydown = function (e) {
	if (e.code == 'Enter') {
		search();
		e.preventDefault()
	}
}

function showWords() {

	for (let word of words) {
		const element = document.createElement("li");
		element.innerHTML = word;
		list.appendChild(element);
	}
	let n = list.childNodes.length;
	counter.innerHTML = `Number of words: ${n}`
}

function search() {
	let start = document.getElementById("start").value.toLowerCase();
	let length = document.getElementById("length").value;
	let end = document.getElementById("end").value.toLowerCase();
	let con = document.getElementById("con").value.toLowerCase();
	let rep = document.getElementById("rep").value.toLowerCase();
	let not = document.getElementById("not").value.toLowerCase();
	let pos = document.getElementById("pos").value.toLowerCase();
	let posn = document.querySelectorAll(".notPos");
	reset();
	if (start) {
		let n = start.length;
		words = words.filter(word => word.substring(0, n) === start);
	}
	if (length) {
		length = parseInt(length);
		words = words.filter(word => word.length === length);
	}
	if (end) {
		let n = end.length;
		words = words.filter(word => word.substring(word.length - n) === end);
	}
	if (con) {
		for (i = 0; i < con.length; i++) {
			words = words.filter(word => word.includes(con.charAt(i)));
		}
	}
	if (rep) {
		for (i = 0; i < rep.length; i++) {
			words = words.filter(word => dontRepeat(word, rep.charAt(i)));
		}
	}
	if (not) {
		for (i = 0; i < not.length; i++) {
			words = words.filter(word => !word.includes(not.charAt(i)));
		}
	}
	if (pos) {
		words = words.filter(word => matchWord(word, pos));
	}
	for (i = 0; i <= countNot; i++) {
		let pnot = posn[i].value.toLowerCase();
		if (pnot !== '') {
			words = words.filter(word => notMatchWord(word, pnot));
		}
	}
	showWords();
}

function dontRepeat(word, letter) {
	return word.split(letter).length-1 === 1;
}

function matchWord(word, pattern) {
	let ret = true
	pattern.split("").forEach((c, i) => {
		if (c != "_" && word[i] != c)
			ret = false
	})
	return ret
}

function notMatchWord(word, pattern) {
	let ret = true
	pattern.split("").forEach((c, i) => {
		if (c != "_" && word[i] == c)
			ret = false
	})
	return ret
}

function reset() {
	words = []
	for (let word of copy)
		words.push(word);
	let n = list.childNodes.length;
	for (i = 0; i < n; i++)
		list.removeChild(list.childNodes[0]);
}

function resetInput() {
	let form = document.querySelector("ul");
	document.getElementById("start").value = '';
	document.getElementById("end").value = '';
	document.getElementById("con").value = '';
	document.getElementById("rep").value = '';
	document.getElementById("not").value = '';
	document.getElementById("length").value = '';
	document.getElementById("pos").value = '';
	let posn = document.querySelectorAll(".notPos");
	for (i = 0; i <= countNot; i++) {
		posn[i].value = '';
	}
	while (countNot > 0) {
		form.removeChild(form.lastChild);
		countNot--;
	}
	const plus = document.querySelector(".fa-plus");
	plus.style = "display: ;";
	reset();
	showWords();
}

function addField() {
	countNot++;
	let form = document.querySelector("ul");
	const element = document.createElement("li");
	const label = document.createElement("label");
	const inp = document.createElement("input");
	inp.className = "notPos";
	label.innerHTML = "Not position:"
	let id = "posn" + countNot;
	label.setAttribute("for", id);
	inp.id = id;
	element.appendChild(label);
	element.appendChild(inp);
	form.appendChild(element);
	if (countNot === 2) {
		const plus = document.querySelector(".fa-plus");
		plus.style = "display: none;";
	}
}