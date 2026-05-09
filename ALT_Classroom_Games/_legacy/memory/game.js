// Memory Match Game Logic

let gameState = {
    sets: {},
    currentSetId: 'default',
    teams: [],
    numTeams: 2,
    currentTeamIndex: 0,
    gridSize: 16, // 16, 20, 24, 30, 36
    cards: [], // { id, content, type (text/image), matchId, state: 'hidden'|'flipped'|'matched' }
    flippedCards: [], // Indices of currently flipped cards (max 2)
    isLocked: false // Prevent clicking while animating
};

const defaultSets = {
    'default': {
        id: 'default',
        name: 'Animals (Text ↔ Emoji)',
        pairs: [
            { a: 'Dog', aType: 'text', b: '🐶', bType: 'text' },
            { a: 'Cat', aType: 'text', b: '🐱', bType: 'text' },
            { a: 'Mouse', aType: 'text', b: '🐭', bType: 'text' },
            { a: 'Hamster', aType: 'text', b: '🐹', bType: 'text' },
            { a: 'Rabbit', aType: 'text', b: '🐰', bType: 'text' },
            { a: 'Fox', aType: 'text', b: '🦊', bType: 'text' },
            { a: 'Bear', aType: 'text', b: '🐻', bType: 'text' },
            { a: 'Panda', aType: 'text', b: '🐼', bType: 'text' },
            { a: 'Koala', aType: 'text', b: '🐨', bType: 'text' },
            { a: 'Tiger', aType: 'text', b: '🐯', bType: 'text' },
            { a: 'Lion', aType: 'text', b: '🦁', bType: 'text' },
            { a: 'Cow', aType: 'text', b: '🐮', bType: 'text' },
            { a: 'Pig', aType: 'text', b: '🐷', bType: 'text' },
            { a: 'Frog', aType: 'text', b: '🐸', bType: 'text' },
            { a: 'Monkey', aType: 'text', b: '🐵', bType: 'text' },
            { a: 'Chicken', aType: 'text', b: '🐔', bType: 'text' },
            { a: 'Penguin', aType: 'text', b: '🐧', bType: 'text' },
            { a: 'Bird', aType: 'text', b: '🐦', bType: 'text' }
        ]
    }
};

function initGame() {
    loadSets();
    populateSetSelect();
}

function loadSets() {
    const saved = localStorage.getItem('memory_sets');
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
    localStorage.setItem('memory_sets', JSON.stringify(gameState.sets));
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

function selectGridSize(size, btn) {
    document.querySelectorAll('.grid-size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    gameState.gridSize = parseInt(size);
}

function selectTeams(count, btn) {
    document.querySelectorAll('.team-count-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    gameState.numTeams = parseInt(count);
}

function startGame() {
    gameState.currentSetId = document.getElementById('game-set-select').value;
    const set = gameState.sets[gameState.currentSetId];

    // Validate we have enough pairs
    const pairsNeeded = gameState.gridSize / 2;
    if (set.pairs.length < pairsNeeded) {
        alert(`Ideally need ${pairsNeeded} pairs for this grid size. Repeating some might occur.`);
        // Note: For now we'll just cycle if short, but ideal logic handled in generation
    }

    // Setup Teams
    gameState.teams = [];
    for (let i = 0; i < gameState.numTeams; i++) {
        gameState.teams.push({ name: `Team ${i + 1}`, score: 0 });
    }

    // Generate Cards
    generateCards(set, pairsNeeded);

    // Render Board
    renderGrid();
    renderScores();
    updateTurnDisplay();

    document.getElementById('setup-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
}

function generateCards(set, count) {
    let pool = [];

    // Fill pool with pairs
    for (let i = 0; i < count; i++) {
        const pair = set.pairs[i % set.pairs.length];
        // Card A
        pool.push({
            id: i, // Match ID
            content: pair.a,
            type: pair.aType,
            state: 'hidden'
        });
        // Card B
        pool.push({
            id: i, // Same Match ID
            content: pair.b,
            type: pair.bType,
            state: 'hidden'
        });
    }

    // Shuffle
    gameState.cards = pool.sort(() => Math.random() - 0.5);
    gameState.flippedCards = [];
    gameState.isLocked = false;
}

function renderGrid() {
    const gridEl = document.getElementById('memory-grid');
    gridEl.innerHTML = '';

    // Set columns based on total size
    // 16 = 4x4
    // 20 = 4x5
    // 24 = 6x4 (wide) or 4x6
    // 36 = 6x6
    let cols = 4;
    if (gameState.gridSize === 24 || gameState.gridSize === 30 || gameState.gridSize === 36) {
        cols = 6;
    }

    gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    gameState.cards.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = `memory-card ${card.state}`;
        cardEl.onclick = () => handleCardClick(index);

        let visualContent = card.content;
        if (card.type === 'image') {
            visualContent = `<img src="${card.content}" class="card-image" alt="Memory Item">`;
        } else {
            visualContent = `<span class="card-content" style="${card.content.length > 8 ? 'font-size: 0.9em' : ''}">${card.content}</span>`;
        }

        cardEl.innerHTML = `
            <div class="memory-card-inner">
                <div class="memory-card-front">
                    <!-- Icon or Number? Just pattern usually. -->
                    <span style="font-size: 2rem;">❓</span>
                </div>
                <div class="memory-card-back">
                    ${visualContent}
                </div>
            </div>
        `;
        gridEl.appendChild(cardEl);
    });
}

function handleCardClick(index) {
    if (gameState.isLocked) return;
    if (gameState.cards[index].state !== 'hidden') return; // Ignore flipped/matched

    const card = gameState.cards[index];

    // Flip it
    card.state = 'flipped';
    gameState.flippedCards.push(index);

    // Update DOM (just that card to be efficient? or re-render? DOM update is cleaner)
    const cardEl = document.getElementById('memory-grid').children[index];
    cardEl.classList.add('flipped');

    window.audioManager.play('daily_double'); // Using a generic flip/select sound? Or just quiet?
    // Let's use a soft sound if we had one, for now maybe no sound on flip or 'timer' tick?
    // Actually, let's play nothing on flip to keep it chill, or a pop if we had it.

    if (gameState.flippedCards.length === 2) {
        gameState.isLocked = true;
        checkForMatch();
    }
}

function checkForMatch() {
    const idx1 = gameState.flippedCards[0];
    const idx2 = gameState.flippedCards[1];
    const card1 = gameState.cards[idx1];
    const card2 = gameState.cards[idx2];

    if (card1.id === card2.id) {
        // MATCH!
        setTimeout(() => {
            window.audioManager.play('correct');
            card1.state = 'matched';
            card2.state = 'matched';

            // Update DOM
            const children = document.getElementById('memory-grid').children;
            children[idx1].classList.add('matched');
            children[idx2].classList.add('matched');

            // Score
            gameState.teams[gameState.currentTeamIndex].score += 1; // +1 point for pair
            renderScores();

            // Check win
            if (gameState.cards.every(c => c.state === 'matched')) {
                setTimeout(() => {
                    window.audioManager.play('daily_double'); // Victory sound
                    showWinModal();
                }, 500);
            } else {
                // Keep turn? Usually yes in memory.
                gameState.flippedCards = [];
                gameState.isLocked = false;
                updateTurnDisplay(true); // "Go again!" logic?
            }
        }, 500);
    } else {
        // NO MATCH
        setTimeout(() => {
            window.audioManager.play('wrong');
            card1.state = 'hidden';
            card2.state = 'hidden';

            // Update DOM
            const children = document.getElementById('memory-grid').children;
            children[idx1].classList.remove('flipped');
            children[idx2].classList.remove('flipped');

            gameState.flippedCards = [];
            gameState.isLocked = false;

            nextTurn();
        }, 1200); // Longer delay to see what it was
    }
}

function nextTurn() {
    gameState.currentTeamIndex = (gameState.currentTeamIndex + 1) % gameState.numTeams;
    updateTurnDisplay();
    renderScores();
}

function updateTurnDisplay(goAgain = false) {
    const name = gameState.teams[gameState.currentTeamIndex].name;
    const text = goAgain ? `${name} found a match! Go again!` : `${name}'s Turn`;
    document.getElementById('current-team-display').textContent = text;
}

function renderScores() {
    const container = document.getElementById('score-board');
    container.innerHTML = gameState.teams.map((t, i) => `
        <div class="team-score ${i === gameState.currentTeamIndex ? 'active' : ''}">
            <div class="team-name">${t.name}</div>
            <div class="team-points">${t.score}</div>
        </div>
    `).join('');
}

function showWinModal() {
    const sorted = [...gameState.teams].sort((a, b) => b.score - a.score);
    const winner = sorted[0];

    let text = `${winner.name} Wins!`;
    if (sorted[0].score === sorted[1].score) text = "It's a Tie!";

    document.getElementById('winner-announcement').textContent = text;
    document.getElementById('final-scores').innerHTML = sorted.map(t =>
        `<div>${t.name}: ${t.score} pairs</div>`
    ).join('');

    document.getElementById('win-modal').classList.add('active');
}

document.addEventListener('DOMContentLoaded', initGame);
