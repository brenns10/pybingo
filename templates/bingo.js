var PB_USERNAME = prompt("Please enter a nickname:", "bingo_user")
var PB_WEBSOCKET = new WebSocket("{{url}}")
var PB_CHATBOX = "chat-box"
var PB_CHATMSG = "chat-msg"
var PB_BINGOTBL = "bingo-table"
var PB_CELLS;

/*******************************************************************************
                                  Chat stuff!
*******************************************************************************/

/*
  Called when the websocket is opened - we first set our nickname.
*/
PB_WEBSOCKET.onopen = function (e) {
    var chat_obj = {};
    chat_obj["cmd"] = "nick";
    chat_obj["nick"] = PB_USERNAME;
    PB_WEBSOCKET.send(JSON.stringify(chat_obj));
    console.log("Sending nick command.");
    console.log(chat_obj);
};

/* Replace :smile: or :) type emojis with images. */
function emojify(x) {return emoji.replace_emoticons(emoji.replace_colons(x));};

/* Return a JSON object for broadcasting a message. */
function send_message (message) {
    return {"cmd": "msg", "msg": message};
}

/*
  List of lists for commands you type in the chat box.
  [0]: regular expression that matches the command and captures its args
  [1]: function that is called with the RegExp match list.  Should return an
       object to serialize as JSON and send, or null if nothing should be sent
  If there is no match, defaults to "send_message()"
*/
var send_commands = [
    [/^\/msg (.*)/i, function (m) {return send_message(m[1]);}],
    [/^\/nick ([\w: -]+)/i, function (m) {return {"cmd": "nick", "nick": m[1]};}],
    [/^\/me (.*)/i, function (m) {return {"cmd": "emote", "msg": m[1]};}],
    [/^\/emoji (.*)/, function(m) {
        if (m[1] in emoji.img_sets) {
            emoji.img_set = m[1];
            console.log("Emoji icons set to: " + m[1]);
        } else {
            recv_commands.error({'msg': 'Icon set doesn\'t exist!'},
                                document.getElementById(PB_CHATBOX));
        }
        return null;
    }],
];

/*
  Dictionary mapping received command names to their implementations.
  Implementation functions take the message (parsed as JSON) as their first
  argument, and the chat box div as their second argument.
*/
var recv_commands = {
    msg: function(message, chat_box) {
        message.msg = emojify(message.msg);
        message.from = emojify(message.from);
        chat_box.innerHTML += "<span class=\"chat-from\">" + message.from + ": </span>"
        chat_box.innerHTML += "<span class=\"chat-text\">" + message.msg + "</span><br>";
        return true;
    },
    error: function (message, chat_box) {
        chat_box.innerHTML += "<span class=\"chat-err\">error: </span>";
        chat_box.innerHTML += "<span class=\"chat-text\">" + message.msg + "</span><br>";
        return true;
    },
    server: function (message, chat_box) {
        message.msg = emojify(message.msg);
        chat_box.innerHTML += "<span class=\"chat-server\">" + message.msg + "</span><br>";
        return true;
    },
    emote: function (message, chat_box) {
        message.msg = emojify(message.msg);
        message.from = emojify(message.from);
        chat_box.innerHTML += "<span class=\"chat-from\">" + message.from + " </span>"
        chat_box.innerHTML += "<span class=\"chat-emote\">" + message.msg + "</span><br>";
    },
    who: function (message, chat_box) {
        var users = "";
        for (i = 0; i < message.who.length; i++) {
            users += message.who[i];
            if (i < message.who.length-1) {
                users += ",  ";
            }
        }
        users = emojify(users);
        document.getElementById("chat-users").innerHTML = users;
        return false;
    }
};

/*
  Message receipt function.
*/
PB_WEBSOCKET.onmessage = function (e) {
    var chat_box = document.getElementById(PB_CHATBOX);
    var message = JSON.parse(e.data);
    var cmd = message.cmd.toLowerCase();
    if (cmd in recv_commands) {
        if (recv_commands[cmd](message, chat_box)) {
            chat_box.scrollTop = chat_box.scrollHeight;
        }
    }
    console.log("Receive:" + e.data);
}

/*
  Keypress in message box - Enter sends message.
*/
function pb_send(event) {
    if (event.keyCode == 13) {
        var chat_msg = document.getElementById(PB_CHATMSG);
        for (i = 0; i < send_commands.length; i++) {
            var pattern = send_commands[i][0];
            var func =  send_commands[i][1];
            var match = pattern.exec(chat_msg.value);
            if (match) {
                var obj = func(match);
                chat_msg.value = "";
                if (obj) { // only send if not null
                    var msg = JSON.stringify(obj);
                    PB_WEBSOCKET.send(msg);
                    console.log("Send:" + msg);
                }
                return;
            }
        }
        // send_message won't return null
        var msg = JSON.stringify(send_message(chat_msg.value));
        PB_WEBSOCKET.send(msg);
        chat_msg.value = "";
        console.log("Send:" + msg);
    }
}

/*******************************************************************************
                                  Bingo Stuff
*******************************************************************************/

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
