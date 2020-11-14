'use strict';

/** Connect Four
   *
   * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
   * column until a player gets four-in-a-row (horiz, vert, or diag) or until
   * board fills (tie)
   */
class Game {
  constructor(width = 7, height = 6, playerColor="red", compColor="blue") {
    this.width = width;
    this.height = height;
    this.board = []; // array of rows, each row is array of cells  (board[y][x])

    this.currPlayer = new Player(playerColor);
    this.compPlayer = new ComputerPlayer(compColor);

    this.handleClick = this.handleClick.bind(this);

    this.canClick = true;

    // refresh the board on DOM
    document.getElementById('board').innerHTML = "";

    this.makeBoard();
    this.makeHtmlBoard();
  }

  /** makeBoard: create in-JS board structure:
   *   board = array of rows, each row is array of cells  (board[y][x])
   */

  makeBoard() {
    for (let y = 0; y < this.height; y++) {
      this.board.push(Array.from({ length: this.width }));
    }
  }

  /** makeHtmlBoard: make HTML table and row of column tops. */

  makeHtmlBoard() {
    const board = document.getElementById('board');

    // make column tops (clickable area for adding a piece to that column)
    const top = document.createElement('tr');
    top.setAttribute('id', 'column-top');
    top.addEventListener('click', this.handleClick); //try to put in constructor

    for (let x = 0; x < this.width; x++) {
      const headCell = document.createElement('td');
      headCell.setAttribute('id', x);
      top.append(headCell);
    }

    board.append(top);

    // make main part of board
    for (let y = 0; y < this.height; y++) {
      const row = document.createElement('tr');

      for (let x = 0; x < this.width; x++) {
        const cell = document.createElement('td');
        cell.setAttribute('id', `${y}-${x}`);
        row.append(cell);
      }

      board.append(row);
    }
  }

  /** findSpotForCol: given column x, return top empty y (null if filled) */

  findSpotForCol(x) {
    for (let y = this.height - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        return y;
      }
    }
    return null;
  }

  /** placeInTable: update DOM to place piece into HTML table of board */

  placeInTable(y, x, player) {
    const piece = document.createElement('div');
    piece.classList.add('piece');
    piece.style.backgroundColor = player.color;
    piece.style.top = -50 * (y + 2);

    const spot = document.getElementById(`${y}-${x}`);
    spot.append(piece);
  }

  /** endGame: announce game end */

  endGame(msg) {
    setTimeout(alert, 200, msg);

    let topRow = document.querySelector("#column-top");
    topRow.removeEventListener("click", this.handleClick);
  }


  /** Checks whether the game has been won or tied */

  evaluateGame(player) {
    if (this.checkForWin(player)) {
      return this.endGame(`The ${player.name} won!`);
    }

    if (this.board.every(row => row.every(cell => cell))) {
      return this.endGame('Tie!');
    }
  }


  /** handleClick: handle click of column top to play piece */

  handleClick(evt) {

    // Only allow a click if computer is not making a move currently
    if (this.canClick) {
      
      // get x from ID of clicked cell
      const x = +evt.target.id;
      
      this.makeMove(x, this.currPlayer);
      
      this.evaluateGame(this.currPlayer);
    } else {
      return;
    }

    this.canClick = false;

    // The computer makes a move after a random amount of time (0 - 1000ms)
    setTimeout( () => {
      // computer makes a move
      const compX = this.compPlayer.makeMove(this.width);
  
      this.makeMove(compX, this.compPlayer);
  
      this.evaluateGame(this.compPlayer);

      this.canClick = true;

    }, Math.floor(Math.random() * 1000));




  }

  makeMove (x, player) {
    // get next spot in column (if none, ignore click)
    const y = this.findSpotForCol(x);
    if (y === null) {
      return;
    }

    // place piece in board and add to HTML table
    this.board[y][x] = player.color;
    this.placeInTable(y, x, player);

    
  }

  /** checkForWin: check board cell-by-cell for "does a win start here?" */

  checkForWin(player) {

    function _win(cells) {
      // Check four cells to see if they're all color of current player
      //  - cells: list of four (y, x) cells
      //  - returns true if all are legal coordinates & all match currPlayer

      return cells.every(
        ([y, x]) =>
          y >= 0 &&
          y < this.height &&
          x >= 0 &&
          x < this.width &&
          this.board[y][x] === player.color
      );
    }

    let boundWin = _win.bind(this);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // get "check list" of 4 cells (starting here) for each of the different
        // ways to win
        const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
        const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
        const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
        const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

        // find winner (only checking each win-possibility as needed)
        if (boundWin(horiz) || boundWin(vert) ||
            boundWin(diagDR) || boundWin(diagDL)) {
          return true;
        }
      }
    }
  }
}


// The player class holds the color of the game pieces
class Player {
  constructor(color) {
    this.color = color;
    this.name = "Player"
  }
}

class ComputerPlayer extends Player {
  constructor(color){
    super(color);
    this.name = "Computer"
  }

  makeMove(width) {
    return Math.floor(Math.random() * width);
  }
}

let startGameForm = document.querySelector("#startGame");
startGameForm.addEventListener("submit", startGame);

function startGame(evt) {
  evt.preventDefault();
  
  let playerColor = evt.target.p1Color.value || undefined;
  let compColor = evt.target.p2Color.value || undefined;
  
  new Game(7, 6, playerColor, compColor);
}
