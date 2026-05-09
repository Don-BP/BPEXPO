// Hidden Picture Game Logic

let gameState = {
    sets: {},
    currentSetId: 'default',
    teams: [],
    numTeams: 2,
    currentTeamIndex: 0,
    gridSize: 16, // Total tiles (e.g. 16 for 4x4)
    gridRows: 4,
    gridCols: 4,
    dimmedTiles: [], // Indices of removed tiles
    currentTile: null // { index, question }
};

const defaultSets = {
    'default': {
        name: 'Animals (Sample)',
        image: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Fox
        questions: [
            "What color is a banana?", "Name a fruit.", "Count to 5.", "Say hello.",
            "What is it?", "Is it big?", "Can it fly?", "Do you like it?",
            "What sound does a dog make?", "Stand up.", "Sit down.", "Touch your nose.",
            "What is 1 + 1?", "Name a color.", "Spell 'CAT'.", " What time is it?"
        ] // Needs enough questions for max grid (25)
    }
};

function initGame() {
    loadSets();
    populateSetSelect();
    setupEventListeners();
}

function loadSets() {
    const saved = localStorage.getItem('hidden_picture_sets');
    if (saved) {
        gameState.sets = JSON.parse(saved);
        // Merge defaults
        for (let key in defaultSets) {
            if (!gameState.sets[key]) {
                gameState.sets[key] = defaultSets[key];
            }
        }
    } else {
        gameState.sets = JSON.parse(JSON.stringify(defaultSets));
    }
    localStorage.setItem('hidden_picture_sets', JSON.stringify(gameState.sets));
}

function populateSetSelect() {
    const select = document.getElementById('game-set-select');
    select.innerHTML = '';
    for (let key in gameState.sets) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = gameState.sets[key].name;
        select.appendChild(option);
    }
}

function setupEventListeners() {
    document.querySelectorAll('.team-count-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.team-count-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            gameState.numTeams = parseInt(this.dataset.teams);
        });
    });

    document.querySelectorAll('.grid-size-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.grid-size-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const total = parseInt(this.dataset.size);
            gameState.gridSize = total;
            gameState.gridRows = Math.sqrt(total);
            gameState.gridCols = Math.sqrt(total);
        });
    });
}

function startGame() {
    gameState.currentSetId = document.getElementById('game-set-select').value;
    const set = gameState.sets[gameState.currentSetId];

    // Setup Teams
    gameState.teams = [];
    for (let i = 0; i < gameState.numTeams; i++) {
        gameState.teams.push({ name: `Team ${i + 1}`, score: 0 });
    }

    // Setup Image
    document.getElementById('hidden-image').src = set.image;

    // Setup Grid
    renderGrid(set);
    renderScores();
    updateTurnDisplay();

    document.getElementById('setup-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
}

function renderGrid(set) {
    const gridEl = document.getElementById('overlay-grid');
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = `repeat(${gameState.gridCols}, 1fr)`;
    gridEl.style.gridTemplateRows = `repeat(${gameState.gridRows}, 1fr)`;

    for (let i = 0; i < gameState.gridSize; i++) {
        const tile = document.createElement('div');
        tile.className = 'cover-tile';
        tile.textContent = i + 1;
        tile.onclick = () => handleTileClick(i, set);
        gridEl.appendChild(tile);
    }
}

function handleTileClick(index, set) {
    if (gameState.dimmedTiles.includes(index)) return;

    // Get question - cycle through if not enough
    const question = set.questions[index % set.questions.length] || "Mystery Question!";

    gameState.currentTile = { index, question };

    document.getElementById('question-text').textContent = question;
    document.getElementById('question-modal').classList.add('active');
}

function answerCorrect() {
    window.audioManager.play('correct');
    // Award points
    gameState.teams[gameState.currentTeamIndex].score += 10;

    // Remove tile
    const tileIndex = gameState.currentTile.index;
    gameState.dimmedTiles.push(tileIndex);

    const tileEl = document.querySelectorAll('.cover-tile')[tileIndex];
    tileEl.classList.add('revealed');

    closeModal('question-modal');
    renderScores();

    checkWinCondition(); // If all tiles gone? Rare, usually they guess before.
    nextTurn();
}

function answerWrong() {
    window.audioManager.play('wrong');
    // Just next turn, don't remove tile
    closeModal('question-modal');
    nextTurn();
}

function attemptGuess() {
    document.getElementById('guess-modal').classList.add('active');
}

function revealAll() {
    window.audioManager.play('daily_double'); // Celebration sound
    // Award BIG points to current team
    gameState.teams[gameState.currentTeamIndex].score += 50;
    renderScores();

    // Remove all tiles
    document.querySelectorAll('.cover-tile').forEach(tile => tile.classList.add('revealed'));

    closeModal('guess-modal');

    setTimeout(() => {
        showWinModal();
    }, 2000); // Wait to enjoy the picture
}

function closeGuessModal() {
    document.getElementById('guess-modal').classList.remove('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function nextTurn() {
    gameState.currentTeamIndex = (gameState.currentTeamIndex + 1) % gameState.numTeams;
    updateTurnDisplay();
    renderScores();
}

function updateTurnDisplay() {
    const name = gameState.teams[gameState.currentTeamIndex].name;
    document.getElementById('current-team-display').textContent = `${name}'s Turn`;
}

function renderScores() {
    const container = document.getElementById('teams-scores');
    container.innerHTML = gameState.teams.map((t, i) => `
        <div class="team-score ${i === gameState.currentTeamIndex ? 'active' : ''}">
            <div class="team-name">${t.name}</div>
            <div class="team-points">${t.score}</div>
        </div>
    `).join('');
}

function showWinModal() {
    // Determine winner
    const sorted = [...gameState.teams].sort((a, b) => b.score - a.score);
    const winner = sorted[0];

    document.getElementById('winner-announcement').textContent = `${winner.name} Wins!`;
    document.getElementById('final-scores').innerHTML = sorted.map(t =>
        `<div>${t.name}: ${t.score}</div>`
    ).join('');

    document.getElementById('win-modal').classList.add('active');
}

function checkWinCondition() {
    // If all tiles revealed?
    if (gameState.dimmedTiles.length >= gameState.gridSize) {
        setTimeout(showWinModal, 1000);
    }
}

document.addEventListener('DOMContentLoaded', initGame);
