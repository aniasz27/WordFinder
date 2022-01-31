const list = document.querySelector("#words");
const counter = document.getElementById("counter");
let words = [];
let copy = [];

const ws = new WebSocket("ws://localhost:3000")
ws.addEventListener("open", () => console.log("We are connected!"))

ws.addEventListener("message", msg =>{
    msg = JSON.parse(msg.data);

    switch(msg.header){
        case messages.WORDS:
            words = msg.body.words;
            for(let word of words)
                copy.push(word);
            showWords(words);
            break;
    }
})

function showWords(){

    for(let word of words){
        const element = document.createElement("li");
        element.innerHTML = word;
        list.appendChild(element);
    }
    let n = list.childNodes.length;
    counter.innerHTML = `Number of words: ${n}`
}

function search(){
    let start = document.getElementById("start").value;
    let end = document.getElementById("end").value;
    let con = document.getElementById("con").value;
    let not = document.getElementById("not").value;
    let length = document.getElementById("length").value;
    let pos = document.getElementById("pos").value;
    reset();
    if(start !== ''){
        let n = start.length;
        words = words.filter(word => word.substring(0, n) === start);
    }
    if(end !== ''){
        let n = end.length;
        words = words.filter(word => word.substring(word.length - n) === end);
    }
    if(length !== ''){
        length = parseInt(length);
        words = words.filter(word => word.length === length);
    }
    if(not !== ''){
        for(i=0;i<not.length;i++){
            words = words.filter(word => !word.includes(not.charAt(i)));
        }
    }
    if(con !== ''){
        for(i=0;i<con.length;i++){
            words = words.filter(word => word.includes(con.charAt(i)));
        }
    }
    if(pos !== ''){
        words = words.filter(word => matchWord(word, pos));
    }
    showWords();
}

function matchWord(word, pattern){
	let ret = true
	pattern.split("").forEach((c, i) => {
		if (c != "_" && word[i] != c)
			ret = false
	})
	return ret
}

function reset(){
    words = []
    for(let word of copy)
        words.push(word);
    let n = list.childNodes.length;
    for(i = 0;i<n;i++)
        list.removeChild(list.childNodes[0]);
}

function resetInput() {
    document.getElementById("start").value = '';
    document.getElementById("end").value = '';
    document.getElementById("con").value = '';
    document.getElementById("not").value = '';
    document.getElementById("length").value = '';
    document.getElementById("pos").value = '';
}