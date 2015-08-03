var PB_USERNAME = prompt("Please enter a nickname:", "bingo_user")
var PB_WEBSOCKET = new WebSocket("{{url}}")
var PB_CHATBOX = "chat-box"
var PB_CHATMSG = "chat-msg"
var PB_BINGOTBL = "bingo-table"
var PB_CELLS;

/*
  Message receipt function.
*/
PB_WEBSOCKET.onmessage = function (e) {
    var chat_box = document.getElementById(PB_CHATBOX);
    chat_box.value += e.data;
    console.log("Receive message: " + e.data);
}

/*
  Keypress in message box - Enter sends message.
*/
function pb_send(event) {
    if (event.keyCode == 13) {
        var chat_msg = document.getElementById(PB_CHATMSG);
        PB_WEBSOCKET.send(PB_USERNAME + ": " + chat_msg.value + "\n");
        chat_msg.value = "";
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
        var cell = pb_get_cell(rowIdx, colIdx)
        if (!PB_CELLS[rowIdx][colIdx]) {
            // was not covered, now will be
            cell.style["background-color"] = "#0a304e";
            PB_CELLS[rowIdx][colIdx] = true;
            if (pb_check(rowIdx, colIdx)) {
                alert("You win!");
            }
        } else {
            // was covered, now will not be
            PB_CELLS[rowIdx][colIdx] = false;
            cell.style["background-color"] = "#626262";
        }
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
}
