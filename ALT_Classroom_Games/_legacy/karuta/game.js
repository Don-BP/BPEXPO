// Karuta Game Logic
let gameState = {
    sets: {},
    currentSetId: 'default',
    currentWord: null,
    players: [],
    currentPlayerIndex: 0,
    numTeams: 2, // Default, can be changed via simple UI or code
    teams: [], // { name, score }
    usedWords: []
};

// Default Vocabulary Sets
const defaultSets = {
    'default': {
        id: 'default',
        name: 'Animals & Food',
        items: [
            { word: 'apple', emoji: '🍎' },
            { word: 'book', emoji: '📚' },
            { word: 'cat', emoji: '🐱' },
            { word: 'dog', emoji: '🐶' },
            { word: 'elephant', emoji: '🐘' },
            { word: 'fish', emoji: '🐟' },
            { word: 'guitar', emoji: '🎸' },
            { word: 'house', emoji: '🏠' },
            { word: 'ice cream', emoji: '🍦' },
            { word: 'juice', emoji: '🧃' },
            { word: 'kite', emoji: '🪁' },
            { word: 'lemon', emoji: '🍋' }
        ]
    },
    'colors_shapes': {
        id: 'colors_shapes',
        name: 'Colors & Shapes',
        items: [
            { word: 'red', emoji: '🟥' },
            { word: 'blue', emoji: '🟦' },
            { word: 'green', emoji: '🟩' },
            { word: 'yellow', emoji: '🟨' },
            { word: 'orange', emoji: '🟧' },
            { word: 'purple', emoji: '🟪' },
            { word: 'circle', emoji: '⭕' },
            { word: 'square', emoji: '🔲' },
            { word: 'triangle', emoji: '🔺' },
            { word: 'star', emoji: '⭐' },
            { word: 'heart', emoji: '❤️' },
            { word: 'diamond', emoji: '💎' }
        ]
    },
    'school_supplies': {
        id: 'school_supplies',
        name: 'School Supplies',
        items: [
            { word: 'pencil', emoji: '✏️' },
            { word: 'eraser', emoji: '🧼' },
            { word: 'ruler', emoji: '📏' },
            { word: 'pen', emoji: '🖊️' },
            { word: 'notebook', emoji: '📓' },
            { word: 'bag', emoji: '🎒' },
            { word: 'desk', emoji: '🪑' },
            { word: 'scissors', emoji: '✂️' },
            { word: 'glue', emoji: '🧴' },
            { word: 'clock', emoji: '⏰' },
            { word: 'computer', emoji: '💻' },
            { word: 'map', emoji: '🗺️' }
        ]
    },
    'body_parts': {
        id: 'body_parts',
        name: 'Body Parts',
        items: [
            { word: 'eyes', emoji: '👀' },
            { word: 'ears', emoji: '👂' },
            { word: 'nose', emoji: '👃' },
            { word: 'mouth', emoji: '👄' },
            { word: 'hand', emoji: '✋' },
            { word: 'foot', emoji: '🦶' },
            { word: 'arm', emoji: '💪' },
            { word: 'leg', emoji: '🦵' },
            { word: 'brain', emoji: '🧠' },
            { word: 'heart', emoji: '🫀' },
            { word: 'bone', emoji: '🦴' },
            { word: 'tooth', emoji: '🦷' }
        ]
    }
};

function initGame() {
    loadSets();
    setupGame();
    renderScores();
    renderCards();

    // Resume audio on interaction
    document.body.addEventListener('click', () => {
        if (window.audioManager && window.audioManager.audioCtx && window.audioManager.audioCtx.state === 'suspended') {
            window.audioManager.audioCtx.resume();
        }
    }, { once: true });
}

function loadSets() {
    const saved = localStorage.getItem('karuta_sets');
    if (saved) {
        gameState.sets = JSON.parse(saved);
        // Ensure defaults exist
        for (let key in defaultSets) {
            if (!gameState.sets[key]) {
                gameState.sets[key] = defaultSets[key];
            }
        }
    } else {
        gameState.sets = JSON.parse(JSON.stringify(defaultSets));
    }
    localStorage.setItem('karuta_sets', JSON.stringify(gameState.sets));

    const urlParams = new URLSearchParams(window.location.search);
    const setId = urlParams.get('set') || 'default';
    if (gameState.sets[setId]) {
        gameState.currentSetId = setId;
    }
}

function setupGame() {
    gameState.teams = [];
    // Default to 2 teams, but supports up to 4 if we add UI selector
    const count = gameState.numTeams || 2;
    for (let i = 0; i < count; i++) {
        gameState.teams.push({ name: `Team ${i + 1}`, score: 0 });
    }
    gameState.usedWords = [];
}

function renderScores() {
    const scores = document.getElementById('scores');
    scores.innerHTML = gameState.teams.map((team, index) => `
        <div class="player-score" onclick="adjustScore(${index})">
            <div class="player-name">${team.name}</div>
            <div class="player-points">${team.score}</div>
        </div>
    `).join('');
}

function adjustScore(teamIndex) {
    // Manual adjustment enabled for flexibility
    gameState.teams[teamIndex].score++;
    renderScores();
}

function renderCards() {
    const set = gameState.sets[gameState.currentSetId];
    const grid = document.getElementById('cards-grid');

    grid.innerHTML = set.items.map((item, index) => `
        <div class="vocab-card ${gameState.usedWords.includes(item.word) ? 'used' : ''}" 
             onclick="selectCard('${item.word.replace(/'/g, "\\'")}', ${index})">
            <div class="card-image">${item.emoji}</div>
            <div class="card-word">${item.word}</div>
        </div>
    `).join('');
}

function playWord() {
    const set = gameState.sets[gameState.currentSetId];
    const available = set.items.filter(v => !gameState.usedWords.includes(v.word));

    if (available.length === 0) {
        alert('All words completed! Game over!');
        return;
    }

    const randomWord = available[Math.floor(Math.random() * available.length)];
    gameState.currentWord = randomWord.word;

    document.getElementById('word-display').textContent = `Find: ${randomWord.word}`;

    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(randomWord.word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    }
}

function selectCard(word, index) {
    if (!gameState.currentWord) {
        alert('Press the speaker button first!');
        return;
    }

    if (gameState.usedWords.includes(word)) {
        return;
    }

    const cards = document.querySelectorAll('.vocab-card');
    const card = cards[index];

    if (word === gameState.currentWord) {
        window.audioManager.play('correct');
        card.classList.add('correct');
        showWinnerSelectionModal();
        gameState.usedWords.push(word);
    } else {
        window.audioManager.play('wrong');
        card.classList.add('wrong');
        setTimeout(() => {
            card.classList.remove('wrong');
        }, 500);
    }
}

function showWinnerSelectionModal() {
    // Check if modal already exists
    let overlay = document.getElementById('winner-modal');
    if (overlay) overlay.remove();

    overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.id = 'winner-modal';

    const buttonsHtml = gameState.teams.map((team, index) => {
        let btnClass = 'btn-primary';
        if (index === 1) btnClass = 'btn-accent';
        if (index === 2) btnClass = 'btn-success';
        if (index === 3) btnClass = 'btn-secondary';

        return `<button class="btn ${btnClass}" onclick="awardPoint(${index})">${team.name}</button>`;
    }).join('');

    overlay.innerHTML = `
        <div class="modal text-center">
            <h2>Who got it?</h2>
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem; flex-wrap: wrap;">
                ${buttonsHtml}
            </div>
            <button class="btn btn-secondary" onclick="awardPoint(-1)" style="margin-top: 1rem; font-size: 0.8rem;">Nobody (Skip)</button>
        </div>
    `;

    document.body.appendChild(overlay);
}

function awardPoint(teamIndex) {
    if (teamIndex >= 0) {
        gameState.teams[teamIndex].score += 1;
    }

    const overlay = document.getElementById('winner-modal');
    if (overlay) overlay.remove();

    renderScores();
    renderCards();
    document.getElementById('word-display').textContent = 'Correct! Tap speaker for next word.';
    gameState.currentWord = null;
}

document.addEventListener('DOMContentLoaded', initGame);
