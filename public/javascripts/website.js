const list = document.querySelector("#words");
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

}

function search(){
    let start = document.getElementById("start").value;
    document.getElementById("start").value = '';
    let end = document.getElementById("end").value;
    document.getElementById("end").value = '';
    let pos = document.getElementById("pos").value;
    document.getElementById("pos").value = '';
    let length = parseInt(document.getElementById("length").value);
    document.getElementById("length").value = '';
    reset();
    if(start !== ''){
        words = words.filter(word => word.charAt(0) === start);
    }
    if(length !== ''){
        words = words.filter(word => word.length === length);
    }
    showWords();
}

function reset(){
    words = []
    for(let word of copy)
        words.push(word);
    let n = list.childNodes.length;
    for(i = 0;i<n;i++)
        list.removeChild(list.childNodes[0]);
}