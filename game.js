const canvas = document.getElementById('gameBoard');
const ctx = canvas.getContext('2d');

const cellSize = 5;
const colors = ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#8B00FF"];

canvas.width = window.innerWidth - (window.innerWidth % cellSize);
canvas.height = window.innerHeight - (window.innerHeight % cellSize);

const rows = canvas.height / cellSize;
const cols = canvas.width / cellSize;

let board = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({
    alive: Math.random() > 0.5,
    color: colors[Math.floor(Math.random() * colors.length)],
})));

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = board[i][j];
            if (cell.alive) {
                ctx.fillStyle = cell.color;
                ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            }
        }
    }
}

function getNeighbors(x, y) {
    const neighbors = [];
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const row = (x + i + rows) % rows;
            const col = (y + j + cols) % cols;
            neighbors.push(board[row][col]);
        }
    }
    return neighbors;
}

function nextGeneration() {
    const newBoard = board.map((row, i) => row.map((cell, j) => {
        const aliveNeighbors = getNeighbors(i, j).filter(neighbor => neighbor.alive);
        const aliveCount = aliveNeighbors.length;

        let newCell = { ...cell };

        if (cell.alive && (aliveCount < 2 || aliveCount > 3)) {
            newCell.alive = false;
        } else if (!cell.alive && aliveCount === 3) {
            newCell.alive = true;
            newCell.color = colors[(colors.indexOf(cell.color) + 1) % colors.length];
        }

        return newCell;
    }));

    board = newBoard;
}

// Add event listeners for the WASD keys
document.addEventListener('keydown', handleKeyPress);

// Add the player object
const player = {
    x: Math.floor(cols / 2),
    y: Math.floor(rows / 2),
    size: 3
};

function handleKeyPress(e) {
    const key = e.key.toLowerCase();
    const { x, y } = player;

    if (key === 'w' && y > 0) {
        pushAutomata("up");
        player.y--;
    } else if (key === 's' && y < rows - player.size) {
        pushAutomata("down");
        player.y++;
    } else if (key === 'a' && x > 0) {
        pushAutomata("left");
        player.x--;
    } else if (key === 'd' && x < cols - player.size) {
        pushAutomata("right");
        player.x++;
    }
}
function pushAutomata(direction) {
  const pushAmount = 3;
  const startingRow = direction === "down" ? player.y + player.size - 1 : player.y;
  const startingCol = direction === "right" ? player.x + player.size - 1 : player.x;

  const newBoard = JSON.parse(JSON.stringify(board));

  for (let i = 0; i < player.size; i++) {
      let sourceRow, sourceCol;
      let targetRow, targetCol;

      if (direction === "up" || direction === "down") {
          sourceRow = (startingRow + (direction === "up" ? -1 : 1) + rows) % rows;
          sourceCol = (player.x + i + cols) % cols;
          targetRow = (sourceRow + (direction === "up" ? -pushAmount : pushAmount) + rows) % rows;
          targetCol = sourceCol;
      } else {
          sourceRow = (player.y + i + rows) % rows;
          sourceCol = (startingCol + (direction === "left" ? -1 : 1) + cols) % cols;
          targetRow = sourceRow;
          targetCol = (sourceCol + (direction === "left" ? -pushAmount : pushAmount) + cols) % cols;
      }

      if (board[sourceRow][sourceCol].alive) {
          newBoard[targetRow][targetCol] = { ...board[sourceRow][sourceCol] };
          newBoard[sourceRow][sourceCol].alive = false;
      }
  }

  board = newBoard;
}

function drawPlayer() {
    ctx.fillStyle = "#000";
    for (let i = 0; i < player.size; i++) {
        for (let j = 0; j < player.size; j++) {
            ctx.fillRect((player.x + j) * cellSize, (player.y + i) * cellSize, cellSize, cellSize);
        }
    }
}

// Modify the gameLoop function to include drawing the player
function gameLoop() {
    drawBoard();
    drawPlayer();
    nextGeneration();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();