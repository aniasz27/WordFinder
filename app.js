const express = require("express");
const http = require("http");
const websocket = require("ws");
const messages = require("./public/javascripts/messages");

const port = process.argv[2];
const app = express();

const fs = require("fs");
const readline = require("readline");

let words = []

app.use(express.static(__dirname + "/public"));

const server = http.createServer(app);
const wss = new websocket.Server({ server });
server.listen(port);

app.set('view engine', 'ejs')

app.get("/", function(req, res){
  res.render("index")
})

const rl = readline.createInterface({
  input: fs.createReadStream("wordlist.txt"),
	output: process.stdout,
	terminal: false
})

rl.on("line", line => {
  words.push(line);
})

wss.on("connection", function connection(ws){
  ws.send(JSON.stringify({
    header: messages.WORDS,
    body: {
      words: words
    }
  }))
})
