var PB_USERNAME = prompt("Please enter a nickname:", "bingo_user")
var PB_WEBSOCKET = new WebSocket("ws://localhost:8888/chat")
var PB_CHATBOX = "chat-box"
var PB_CHATMSG = "chat-msg"

PB_WEBSOCKET.onmessage = function (e) {
  var chat_box = document.getElementById(PB_CHATBOX);
  chat_box.value += e.data;
  console.log(e.data);
}

function pb_send(event) {
  console.log("In pybingo_send().")
  if (event.keyCode == 13) {
    var chat_msg = document.getElementById(PB_CHATMSG);
    PB_WEBSOCKET.send(PB_USERNAME + ": " + chat_msg.value + "\n");
    chat_msg.value = "";
  }
}