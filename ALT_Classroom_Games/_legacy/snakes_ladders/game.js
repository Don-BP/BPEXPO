// Snakes & Ladders Game Logic

let gameState = {
    players: [],
    numPlayers: 2,
    currentPlayerIndex: 0,
    snakes: [],
    ladders: [],
    isMoving: false,
    questionMode: false
};

// Start/End points (1-100)
const DEFAULT_LADDERS = [
    { start: 2, end: 38 },
    { start: 7, end: 14 },
    { start: 8, end: 31 },
    { start: 15, end: 26 },
    { start: 21, end: 42 },
    { start: 28, end: 84 },
    { start: 36, end: 44 },
    { start: 51, end: 67 },
    { start: 71, end: 91 },
    { start: 78, end: 98 },
    { start: 87, end: 94 },
];

const DEFAULT_SNAKES = [
    { start: 16, end: 6 },
    { start: 46, end: 25 },
    { start: 49, end: 11 },
    { start: 62, end: 19 },
    { start: 64, end: 60 },
    { start: 74, end: 53 },
    { start: 89, end: 68 },
    { start: 92, end: 88 },
    { start: 95, end: 75 },
    { start: 99, end: 80 }
];

// Simple questions for demo
const DEMO_QUESTIONS = [
    { q: "What is the past tense of 'Go'?", a: true }, // Logic handled loosely for now
    { q: "Spell 'Elephant'.", a: true },
    { q: "Count to 10.", a: true },
    { q: "What color is a banana?", a: true }
];

function selectTeams(count, btn) {
    document.querySelectorAll('.team-count-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    gameState.numPlayers = parseInt(count);
}

function startGame() {
    gameState.snakes = JSON.parse(JSON.stringify(DEFAULT_SNAKES));
    gameState.ladders = JSON.parse(JSON.stringify(DEFAULT_LADDERS));
    gameState.questionMode = document.getElementById('game-set-select').value !== 'none';

    // Setup Players
    gameState.players = [];
    for (let i = 0; i < gameState.numPlayers; i++) {
        gameState.players.push({
            id: i,
            name: `Player ${i + 1}`,
            position: 1, // Start at square 1
            colorClass: `p${i + 1}`
        });
    }

    renderBoard();
    renderPlayersList();
    placeTokens();

    // Draw SVG lines
    setTimeout(drawOverlay, 100); // Wait for layout

    document.getElementById('setup-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
}

function renderBoard() {
    const board = document.getElementById('board');
    // Clear keeping overlay
    const overlay = document.getElementById('board-overlay');
    board.innerHTML = '';
    board.appendChild(overlay);

    // Generate 100 cells, visually top-left to bottom-right
    // But logical numbering is zig-zag from bottom-left
    // 100 99 ... 91
    // 81 82 ... 90
    // ...
    // 1 2 ... 10

    // Loop rows 9 down to 0 (logical rows 10 down to 1)
    for (let row = 9; row >= 0; row--) {
        const isRight = row % 2 === 0; // Even rows (0-indexed) go 1->10 (Left-Right)

        // Wait, standard zig zag:
        // Row 0 (Bottom): 1-10 (L->R)
        // Row 1: 20-11 (R->L)

        let start = row * 10 + 1;
        let end = start + 9;

        let cells = [];
        for (let i = start; i <= end; i++) cells.push(i);

        if (row % 2 !== 0) {
            // Odd rows (1, 3... which are visual rows 8, 6...) need reverse?
            // Row 0 (1-10) is L->R.
            // Row 1 (11-20) is R->L.
            // visual row 9 (top) = logical row 9 (91-100). 9%2!=0. R->L.
            cells.reverse();
        }

        cells.forEach(num => {
            const cell = document.createElement('div');
            cell.className = 'board-cell';
            cell.innerHTML = num;
            cell.dataset.num = num;
            board.appendChild(cell);
        });
    }
}

function placeTokens() {
    gameState.players.forEach(p => {
        let token = document.getElementById(`token-${p.id}`);
        if (!token) {
            token = document.createElement('div');
            token.id = `token-${p.id}`;
            token.className = `player-token ${p.colorClass}`;
            document.getElementById('board').appendChild(token);
        }
        updateTokenPosition(p, token);
    });
}

function updateTokenPosition(player, tokenEl) {
    // Find cell
    const cell = document.querySelector(`.board-cell[data-num="${player.position}"]`);
    if (cell) {
        // Position relative to board
        // We can use offsetLeft/Top, but purely safer to append?
        // No, animation needs absolute.
        const cellRect = cell.getBoundingClientRect();
        const boardRect = document.getElementById('board').getBoundingClientRect();

        const relativeTop = cellRect.top - boardRect.top;
        const relativeLeft = cellRect.left - boardRect.left;

        // Offset slightly for multiple players?
        const offset = player.id * 5;

        tokenEl.style.top = (relativeTop + 5 + offset) + 'px';
        tokenEl.style.left = (relativeLeft + 5 + offset) + 'px';
        tokenEl.style.width = (cellRect.width * 0.5) + 'px';
        tokenEl.style.height = (cellRect.height * 0.5) + 'px';
    }
}

function drawOverlay() {
    const svg = document.getElementById('board-overlay');
    svg.innerHTML = '';

    // Draw Ladders
    gameState.ladders.forEach(l => renderLine(l.start, l.end, '#FF9800', 8));
    // Draw Snakes
    gameState.snakes.forEach(s => renderLine(s.start, s.end, '#4CAF50', 8));
}

function renderLine(startNum, endNum, color, width) {
    const startCell = document.querySelector(`.board-cell[data-num="${startNum}"]`);
    const endCell = document.querySelector(`.board-cell[data-num="${endNum}"]`);

    if (!startCell || !endCell) return;

    const boardRect = document.getElementById('board').getBoundingClientRect();
    const sRect = startCell.getBoundingClientRect();
    const eRect = endCell.getBoundingClientRect();

    const x1 = sRect.left - boardRect.left + sRect.width / 2;
    const y1 = sRect.top - boardRect.top + sRect.height / 2;
    const x2 = eRect.left - boardRect.left + eRect.width / 2;
    const y2 = eRect.top - boardRect.top + eRect.height / 2;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", width);
    line.setAttribute("stroke-linecap", "round");
    line.style.opacity = "0.7";

    document.getElementById('board-overlay').appendChild(line);
}

function rollDice() {
    if (gameState.isMoving) return;
    gameState.isMoving = true;

    const diceEl = document.getElementById('dice-display');
    diceEl.classList.add('rolling');
    window.audioManager.play('timer'); // Rolling sound?

    setTimeout(() => {
        diceEl.classList.remove('rolling');
        const roll = Math.floor(Math.random() * 6) + 1;
        diceEl.textContent = getDiceFace(roll);
        // window.audioManager.play('daily_double'); // reveal sound

        movePlayer(roll);
    }, 800);
}

function getDiceFace(num) {
    return ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][num - 1];
}

function movePlayer(steps) {
    const player = gameState.players[gameState.currentPlayerIndex];
    const newPos = Math.min(player.position + steps, 100);

    // Animate step by step? Or jump. Jump for now for simplicity, step-by-step better later.
    player.position = newPos;
    const token = document.getElementById(`token-${player.id}`);
    updateTokenPosition(player, token);

    setTimeout(() => {
        checkSpecialSquare(player);
    }, 600);
}

function checkSpecialSquare(player) {
    /* 
       Question Mode Logic:
       - Found Ladder: Ask Question. Correct -> Climb. Wrong -> Stay at base.
       - Found Snake: Ask Question. Correct -> Stay at head (Safe). Wrong -> Slide down.
    */

    const ladder = gameState.ladders.find(l => l.start === player.position);
    const snake = gameState.snakes.find(s => s.start === player.position);

    if (ladder) {
        if (gameState.questionMode) {
            triggerQuestion("LADDER!", "Answer correctly to climb up!", () => performMove(player, ladder.end), () => nextTurn());
        } else {
            // Auto climb
            window.audioManager.play('correct');
            performMove(player, ladder.end);
        }
        return;
    }

    if (snake) {
        if (gameState.questionMode) {
            triggerQuestion("SNAKE!", "Answer correctly to avoid sliding down!", () => nextTurn(), () => performMove(player, snake.end));
        } else {
            // Auto slide
            window.audioManager.play('wrong');
            performMove(player, snake.end);
        }
        return;
    }

    // Normal square check win
    if (player.position === 100) {
        window.audioManager.play('daily_double'); // Win sound
        showWinModal(player);
    } else {
        nextTurn();
    }
}

function performMove(player, targetPos) {
    player.position = targetPos;
    const token = document.getElementById(`token-${player.id}`);
    updateTokenPosition(player, token);

    setTimeout(() => {
        if (player.position === 100) showWinModal(player);
        else nextTurn();
    }, 600);
}

function nextTurn() {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.numPlayers;
    renderPlayersList();
    renderTurnDisplay();
    gameState.isMoving = false;
}

function renderPlayersList() {
    const list = document.getElementById('players-list');
    list.innerHTML = gameState.players.map((p, i) => `
        <div class="player-status" style="${i === gameState.currentPlayerIndex ? 'background:#e3f2fd; font-weight:bold;' : ''}">
            <span>${p.name}</span>
            <span>Sq: ${p.position}</span>
        </div>
    `).join('');
}

function renderTurnDisplay() {
    const p = gameState.players[gameState.currentPlayerIndex];
    const display = document.getElementById('current-player-display');
    display.textContent = p.name;
    display.className = `player-badge ${p.colorClass}`;
}

// Question Modal logic
let currentCallbackCorrect = null;
let currentCallbackWrong = null;

function triggerQuestion(title, subtitle, onCorrect, onWrong) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('question-text').previousElementSibling.textContent = subtitle;

    // Pick random question (Text only for now)
    const q = DEMO_QUESTIONS[Math.floor(Math.random() * DEMO_QUESTIONS.length)];
    document.getElementById('question-text').textContent = q.q;

    currentCallbackCorrect = onCorrect;
    currentCallbackWrong = onWrong;

    document.getElementById('question-modal').classList.add('active');
}

function handleAnswer(isCorrect) {
    document.getElementById('question-modal').classList.remove('active');

    if (isCorrect) {
        window.audioManager.play('correct');
        if (currentCallbackCorrect) currentCallbackCorrect();
    } else {
        window.audioManager.play('wrong');
        if (currentCallbackWrong) currentCallbackWrong();
    }
}

function showWinModal(player) {
    document.getElementById('winner-name').textContent = player.name;
    document.getElementById('winner-name').className = player.colorClass; // Color it?
    document.getElementById('win-modal').classList.add('active');
}

// Resize handler (redraw lines)
window.addEventListener('resize', () => {
    drawOverlay();
    placeTokens();
});

document.addEventListener('DOMContentLoaded', () => {
    // Wait for auth? No, local game.
    // Just ready logic
});
