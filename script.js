const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetButton = document.getElementById('reset');
const difficultySelect = document.getElementById('difficulty');
const moveSound = document.getElementById('moveSound');
const winSound = document.getElementById('winSound');
const playerXInput = document.getElementById('playerX');
const playerOInput = document.getElementById('playerO');
const modeSwitch = document.getElementById('modeSwitch');
const darkModeToggle = document.getElementById('darkModeToggle');
const muteToggle = document.getElementById('muteToggle');

let board = Array(9).fill('');
let currentPlayer = 'X';
let isGameActive = true;
let isTwoPlayer = false;
let scoreX = 0;
let scoreO = 0;
let mute = false;

const winConditions = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

modeSwitch.addEventListener('change', () => {
  isTwoPlayer = modeSwitch.checked;
  resetGame();
});

darkModeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark');
});

muteToggle.addEventListener('change', () => {
  mute = muteToggle.checked;
});

function getPlayerName(symbol) {
  return symbol === 'X' ? playerXInput.value : playerOInput.value;
}

function playSound(sound) {
  if (!mute) sound.play();
}

function checkWinner() {
  for (let [a, b, c] of winConditions) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      [a, b, c].forEach(i => cells[i].classList.add('win'));
      statusText.textContent = `🎉 ${getPlayerName(board[a])} Wins!`;
      playSound(winSound);
      updateLeaderboard(board[a]);
      isGameActive = false;
      return true;
    }
  }
  if (!board.includes('')) {
    statusText.textContent = '⚖️ It\'s a Tie!';
    isGameActive = false;
    return true;
  }
  return false;
}

function handleClick(e) {
  const index = e.target.dataset.index;
  if (board[index] === '' && isGameActive) {
    makeMove(index, currentPlayer);
    if (!checkWinner()) {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      if (!isTwoPlayer && currentPlayer === 'O') {
        setTimeout(aiMove, 500);
      } else {
        statusText.textContent = `${getPlayerName(currentPlayer)}'s Turn (${currentPlayer})`;
      }
    }
  }
}

function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;
  cells[index].style.color = player === 'X' ? '#0ff' : '#f0f';
  playSound(moveSound);
}

function aiMove() {
  if (!isGameActive) return;
  const level = difficultySelect.value;
  let move;

  if (level === 'easy') {
    const empty = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
    move = empty[Math.floor(Math.random() * empty.length)];
  } else if (level === 'medium') {
    move = getMediumAIMove();
  } else {
    move = getBestMove(board, 'O').index;
  }

  makeMove(move, 'O');
  checkWinner();
  currentPlayer = 'X';
  statusText.textContent = `${getPlayerName(currentPlayer)}'s Turn (X)`;
}

function getMediumAIMove() {
  for (let i = 0; i < board.length; i++) {
    if (board[i] === '') {
      board[i] = 'O';
      if (isWinning('O')) {
        board[i] = '';
        return i;
      }
      board[i] = '';
    }
  }
  for (let i = 0; i < board.length; i++) {
    if (board[i] === '') {
      board[i] = 'X';
      if (isWinning('X')) {
        board[i] = '';
        return i;
      }
      board[i] = '';
    }
  }
  const empty = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function isWinning(player) {
  return winConditions.some(([a, b, c]) => board[a] === player && board[b] === player && board[c] === player);
}

function getBestMove(newBoard, player) {
  const availSpots = newBoard.map((v, i) => v === '' ? i : null).filter(v => v !== null);
  if (isWinningState(newBoard, 'X')) return { score: -10 };
  if (isWinningState(newBoard, 'O')) return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  const moves = availSpots.map(index => {
    newBoard[index] = player;
    const score = getBestMove(newBoard, player === 'O' ? 'X' : 'O').score;
    newBoard[index] = '';
    return { index, score };
  });

  return player === 'O'
    ? moves.reduce((best, move) => move.score > best.score ? move : best)
    : moves.reduce((best, move) => move.score < best.score ? move : best);
}

function isWinningState(b, p) {
  return winConditions.some(([a, b1, c]) => b[a] === p && b[b1] === p && b[c] === p);
}

function updateLeaderboard(winner) {
  if (winner === 'X') scoreX++;
  if (winner === 'O') scoreO++;
  document.getElementById('scoreX').textContent = `${playerXInput.value} Wins: ${scoreX}`;
  document.getElementById('scoreO').textContent = `${playerOInput.value} Wins: ${scoreO}`;
}

function resetGame() {
  board = Array(9).fill('');
  currentPlayer = 'X';
  isGameActive = true;
  statusText.textContent = `Your Turn (X)`;
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('win');
  });
}

cells.forEach(cell => cell.addEventListener('click', handleClick));
resetButton.addEventListener('click', resetGame);