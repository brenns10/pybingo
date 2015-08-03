var PB_USERNAME = prompt("Please enter a nickname:", "bingo_user")
var PB_WEBSOCKET = new WebSocket("{{url}}")
var PB_CHATBOX = "chat-box"
var PB_CHATMSG = "chat-msg"
var PB_BINGOTBL = "bingo-table"
var PB_CELLS;

PB_WEBSOCKET.onopen = function (e) {
    var chat_obj = {};
    chat_obj["cmd"] = "nick";
    chat_obj["nick"] = PB_USERNAME;
    PB_WEBSOCKET.send(JSON.stringify(chat_obj));
    console.log("Sending nick command.");
    console.log(chat_obj);
};

/*
  Message receipt function.
*/
PB_WEBSOCKET.onmessage = function (e) {
    var chat_box = document.getElementById(PB_CHATBOX);
    var message = JSON.parse(e.data);
    var chat_box_message = false;
    if (message.cmd == "msg") {
        chat_box.innerHTML += "<span class=\"chat-from\">" + message.from + ": </span>"
        chat_box.innerHTML += "<span class=\"chat-text\">" + message.msg + "</span><br>";
        chat_box_message = true;
    } else if (message.cmd == "error") {
        chat_box.innerHTML += "<span class=\"chat-err\">error: </span>";
        chat_box.innerHTML += "<span class=\"chat-text\">" + message.msg + "</span><br>";
        chat_box_message = true;
    } else if (message.cmd == "server") {
        chat_box.innerHTML += "<span class=\"chat-server\">" + message.msg + "</span><br>";
        chat_box_message = true;
    } else if (message.cmd == "emote") {
        chat_box.innerHTML += "<span class=\"chat-from\">" + message.from + " </span>"
        chat_box.innerHTML += "<span class=\"chat-emote\">" + message.msg + "</span><br>";
        chat_box_message = true;
    } else if (message.cmd == "who") {
        var chat_users = document.getElementById("chat-users");
        chat_users.innerText = "";
        for (i = 0; i < message.who.length; i++) {
            chat_users.innerText += message.who[i];
            if (i < message.who.length-1) {
                chat_users.innerText += ",  ";
            }
        }
    }
    if (chat_box_message) {
        chat_box.scrollTop = chat_box.scrollHeight;
    }
    console.log("Receive Message");
    console.log(e.data);
}

/*
  Keypress in message box - Enter sends message.
*/
function pb_send(event) {
    if (event.keyCode == 13) {
        var chat_msg = document.getElementById(PB_CHATMSG);
        var chat_obj = {};
        var nick = /^\/nick (\w|-)+/i;
        var nick_match = nick.exec(chat_msg.value)
        var emote = /^\/me /i
        if (nick_match) {
            console.log(nick_match);
            var newnick = nick_match[0].slice(6);
            chat_obj["cmd"] = "nick";
            chat_obj["nick"] = newnick;
        } else if (emote.test(chat_msg.value)) {
            var emote_msg = chat_msg.value.slice(4);
            chat_obj["cmd"] = "emote";
            chat_obj["msg"] = emote_msg;
        } else {
            chat_obj["cmd"] = "msg";
            chat_obj["msg"] = chat_msg.value;
        }
        PB_WEBSOCKET.send(JSON.stringify(chat_obj));
        chat_msg.value = "";
        console.log("Send Message");
        console.log(chat_obj);
    }
}

/*
  Return the DOM element of the table data for cell (rowIdx, colIdx).
*/
function pb_get_cell(rowIdx, colIdx)
{
    var tbody = document.getElementById(PB_BINGOTBL).children[0];
    var cell = tbody.children[rowIdx + 1].children[colIdx];
    return cell;
}

/*
  Check whether the board has won, when (rowIdx, colIdx) has been changed.
*/
function pb_check(rowIdx, colIdx) {
    var back_diag = true;
    var fore_diag = true;
    var row = true;
    var col = true;
    for (i = 0; i < 5; i++) {
        if (!PB_CELLS[rowIdx][i]) {
            row = false;
        }
        if (!PB_CELLS[i][colIdx]) {
            col = false;
        }
        if (!PB_CELLS[i][i]) {
            back_diag = false;
        }
        if (!PB_CELLS[i][4-i]) {
            fore_diag = false;
        }
    }
    return row || col || back_diag || fore_diag;
}

/*
  Return a click handler for rowIdx, colIdx
*/
function pb_create_click_handler(rowIdx, colIdx) {
    return function() {
        var cell = pb_get_cell(rowIdx, colIdx);
        if (!PB_CELLS[rowIdx][colIdx]) {
            // was not covered, now will be
            cell.style["background-color"] = "#0a304e";
            PB_CELLS[rowIdx][colIdx] = true;
            if (pb_check(rowIdx, colIdx)) {
                (new Audio("/static/bingo.mp3")).play();
            }
        } else {
            // was covered, now will not be
            PB_CELLS[rowIdx][colIdx] = false;
            cell.style["background-color"] = "#626262";
        }
        document.getElementById(PB_CHATMSG).focus();
    };
}

/*
  Startup (once DOM is ready).
*/
window.onload = function (e) {
    // Add enter button listener.
    var chat_msg = document.getElementById(PB_CHATMSG);
    chat_msg.addEventListener("keypress", pb_send);

    // Initialize array of cells and the click handlers.
    PB_CELLS = [];
    for (r = 0; r < 5; r++) {
        PB_CELLS.push([]);

        for (c = 0; c < 5; c++) {
            PB_CELLS[r].push(false);
            pb_get_cell(r, c).addEventListener("click", pb_create_click_handler(r, c));
        }
    }
    chat_msg.focus();
}
