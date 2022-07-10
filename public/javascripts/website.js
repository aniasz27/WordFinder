const list = document.querySelector("#words");
const counter = document.getElementById("counter");
const sug = document.getElementById("sug");
let form = document.querySelector("form");

let words = [];
let copy = [];
let sugs = [];
let countNot = 0;
let suggested = "";

const map = new Map()
let letters;
let alphabet;
let used;
let frequency = "etaoinshrdlucmwfgypbvkqjxz"

/**
 * Connects to a websocket and displays the website
 */
const ws = new WebSocket("ws://localhost:3000")
ws.addEventListener("open", () => console.log("We are connected!"))

ws.addEventListener("message", msg => {
	msg = JSON.parse(msg.data);

	switch (msg.header) {
		case messages.WORDS:
			words = msg.body.words;
			for (let word of words) {
				copy.push(word);
				map.set(word, new Set(word))
			}
			showWords(words);
			break;
	}
})

/**
 * Searches for words after enter being pressed
 * @param {*} e 
 */
document.onkeydown = function (e) {
	if (e.code == 'Enter') {
		search();
		e.preventDefault()
	}
}

/**
 * Searches for words after button being pressed
 */
form.addEventListener("submit", function(e) {
	e.preventDefault();
	search();
})

/**
 * Displays all words on the website + counter of words + suggested word
 */
function showWords() {
	for (let word of words) {
		const element = document.createElement("li");
		element.innerHTML = word;
		list.appendChild(element);
	}
	let n = list.childNodes.length;
	suggestedWord()
	counter.innerHTML = `Number of words: ${n}`
	sug.innerHTML = `Suggested word: ${suggested}`
}

/**
 * Performs the searching for words
 */
function search() {
	reset();
	let start = document.getElementById("start").value.toLowerCase();
	let length = document.getElementById("length").value;
	let end = document.getElementById("end").value.toLowerCase();
	let con = document.getElementById("con").value.toLowerCase();
	let rep = document.getElementById("rep").value.toLowerCase();
	let not = document.getElementById("not").value.toLowerCase();
	let pos = document.getElementById("pos").value.toLowerCase();
	let posn = document.querySelectorAll(".notPos");
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

/**
 * Makes sure that a word does not contain more than once a particular letter
 * @param {*} word 
 * @param {*} letter 
 * @returns 
 */
function dontRepeat(word, letter) {
	return word.split(letter).length-1 === 1;
}

/**
 * Makes sure that a word contains a particular pattern
 * @param {*} word 
 * @param {*} pattern 
 * @returns 
 */
function matchWord(word, pattern) {
	let ret = true
	pattern.split("").forEach((c, i) => {
		if (c != "_" && word[i] != c)
			ret = false
	})
	return ret
}

/**
 * Makes sure that a word does not contain a particular pattern
 * @param {*} word 
 * @param {*} pattern 
 * @returns 
 */
function notMatchWord(word, pattern) {
	let ret = true
	pattern.split("").forEach((c, i) => {
		if (c != "_" && word[i] == c)
			ret = false
	})
	return ret
}

/**
 * Resets the words array to a default one
 */
function reset() {
	words = []
	for (let word of copy)
		words.push(word);
	let n = list.childNodes.length;
	for (i = 0; i < n; i++)
		list.removeChild(list.childNodes[0]);
}

/**
 * Clears all inputs
 */
function resetInput() {
	let form = document.querySelector("ul");
	let posn = document.querySelectorAll(".notPos");
	while (countNot > 0) {
		form.removeChild(form.lastChild);
		countNot--;
	}
	const plus = document.querySelector(".fa-plus");
	plus.style = "display: ;";
	reset();
	showWords();
}

/**
 * Adds an extra field for not position
 */
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

/**
 * Calculates occurences of each letter in words array
 */
function suggestedWord() {
	letters = new Array(26).fill(0);
	alphabet = [...'abcdefghijklmnopqrstuvwxyz'];
	used = new Array(26).fill(false);
	for(let word of words) {
		let setWord = map.get(word)
		for(let item of setWord) {
			let index = parseInt(item, 36) - 10
			letters[index]++
		}
	}
	let con = document.getElementById("con").value.toLowerCase();
	if(con) {
		for (i = 0; i < con.length; i++) {
			let ind = parseInt(con.charAt(i), 36) - 10
			used[ind] = true
		}
	}
	let pos = document.getElementById("pos").value.toLowerCase();
	if(pos) {
		for (i = 0; i < pos.length; i++) {
			if(pos.charAt(i) != '_') {
				let ind = parseInt(pos.charAt(i), 36) - 10
				used[ind] = true
			}
		}
	}
	sortArray()
	suggested = getSuggested()
}

/**
 * Returns a suggested word
 * @returns 
 */
function getSuggested() {
	sugs = words.slice()
	let copyOfSugs = sugs.slice()
	for(let i = 0;i<26;i++) {
		if(used[i])
			continue
		if(sugs.length === 1) {
			return sugs[0]
		}
		let letter = alphabet[i].charAt(0)
		sugs = sugs.filter(word => word.includes(letter));
		if(sugs.length === 0) {
			sugs = copyOfSugs.slice()
		}
		else {
			copyOfSugs = sugs.slice()
		}
	}
	return sugs[0]
}

/**
 * Sorts arrays based on occurences
 */
function sortArray() {
	for (let i = 1; i < letters.length; i++) {
		let j = i
		while(j > 0 && letters[j-1] <= letters[j]) {
			if(letters[j-1] == letters[j] && order(j-1, j)) {
				continue
			}
			swap(letters, j, j-1)
			swap(used, j, j-1)
			swap(alphabet, j, j-1)
			j--
		}
	}
}

/**
 * Swaps two elements in an array
 * @param {*} array 
 * @param {*} a 
 * @param {*} b 
 */
function swap(array, a, b) {
	let temp = array[a]
	array[a] = array[b]
	array[b] = temp
}

/**
 * Returns true if frequency of a is bigger than frequency of b
 * @param {*} a 
 * @param {*} b 
 * @returns 
 */
function order(a, b) {
	return frequency.indexOf(a) < frequency.indexOf(b)
}
