// Tornado Game Logic
let gameState = {
    questionSets: {},
    currentSet: 'default',
    numTeams: 2,
    gridSize: 5,
    teams: [],
    currentTeamIndex: 0,
    grid: [],
    revealedSquares: 0
};

// Default question sets
const defaultQuestionSets = {
    'default': {
        name: 'Mixed Review',
        questions: [
            "What is the past tense of 'go'?",
            "Name three colors in English.",
            "How do you say 'thank you' in English?",
            "What day comes after Monday?",
            "Spell the word: FRIEND",
            "What is 5 + 7?",
            "Name an animal that can fly.",
            "What is the opposite of 'hot'?",
            "Count from 1 to 10 in English.",
            "What is your favorite food? (Answer in English)",
            "Name a fruit that is red.",
            "What time is it? (Look at the clock)",
            "How many months are in a year?",
            "What is the capital of Japan?",
            "Spell the word: SCHOOL",
            "What do you do on weekends?",
            "Name three classroom objects.",
            "What season comes after summer?",
            "How do you ask for permission to go to the bathroom?",
            "What is the plural of 'child'?",
            "Name a sport you can play with a ball.",
            "What is 10 - 3?",
            "How do you greet someone in the morning?",
            "What is your favorite subject?",
            "Name an animal that lives in the ocean.",
            "What comes before Thursday?",
            "Spell the word: HAPPY",
            "What is the weather like today?",
            "How many fingers do you have?",
            "Name a vegetable that is green.",
            "What do you say when you meet someone?",
            "What is the opposite of 'big'?",
            "Count backwards from 10 to 1.",
            "What is your teacher's name?",
            "Name three family members in English.",
            "What animal says 'meow'?"
        ],
        gridSize: 5,
        tornadoCount: 3
    },
    'grammar_quiz': {
        name: 'Grammar Quiz',
        questions: [
            "Past tense of 'eat'?",
            "Past tense of 'go'?",
            "Past tense of 'see'?",
            "Plural of 'foot'?",
            "Plural of 'mouse'?",
            "Opposite of 'big'?",
            "Opposite of 'happy'?",
            "Make a sentence with 'yesterday'.",
            "Make a sentence with 'tomorrow'.",
            "Is 'cat' a noun or verb?",
            "Is 'run' a noun or verb?",
            "Correct this: 'He don't like pizza.'",
            "Correct this: 'I am go to school.'",
            "What is the third day of the week?",
            "What is the eighth month?",
            "Past participle of 'do'?",
            "Past participle of 'be'?",
            "Superlative of 'good'?",
            "Superlative of 'bad'?",
            "Present continuous of 'swim'?",
            "Create a question starting with 'Where'.",
            "Create a question starting with 'When'.",
            "Create a question starting with 'How'.",
            "Which is correct: 'a apple' or 'an apple'?",
            "Which is correct: 'many water' or 'much water'?"
        ],
        gridSize: 5,
        tornadoCount: 3
    },
    'simple_math': {
        name: 'Simple Math',
        questions: [
            "5 + 5 = ?",
            "10 - 3 = ?",
            "2 x 6 = ?",
            "20 / 4 = ?",
            "100 + 50 = ?",
            "30 - 15 = ?",
            "9 x 9 = ?",
            "50 / 2 = ?",
            "Square root of 16?",
            "Square root of 64?",
            "12 + 12 = ?",
            "100 - 1 = ?",
            "11 x 2 = ?",
            "15 / 3 = ?",
            "How many sides does a triangle have?",
            "How many sides does a square have?",
            "What comes after 99?",
            "What comes before 1?",
            "Half of 50?",
            "Double 12?",
            "5 x 5 = ?",
            "40 - 20 = ?",
            "1000 + 100 = ?",
            "10 / 2 = ?",
            "1 + 2 + 3 = ?"
        ],
        gridSize: 5,
        tornadoCount: 3
    },
    'animal_facts': {
        name: 'Animal Facts',
        questions: [
            "What is the fastest land animal?",
            "What is the largest mammal?",
            "Which animal has a long neck?",
            "Which animal has a trunk?",
            "What bird cannot fly but swims well?",
            "What animal eats bamboo?",
            "What is a baby dog called?",
            "What is a baby cat called?",
            "Which animal is the King of the Jungle?",
            "Which animal says 'moo'?",
            "Which animal produces wool?",
            "Which animal has a pouch?",
            "Which animal changes color?",
            "How many legs does a spider have?",
            "How many legs does an insect have?",
            "What do butterflies come from?",
            "What animal sleeps hanging upside down?",
            "Which animal is famous for being slow?",
            "What is the tallest animal?",
            "What do pandas eat?",
            "Which animal can live in the desert for a long time without water?",
            "What animal says 'oink'?",
            "Name an animal that lives in the ocean.",
            "Name an animal that can fly.",
            "Name a pet you can keep at home."
        ],
        gridSize: 5,
        tornadoCount: 3
    }
};

// Initialize game
function initGame() {
    loadQuestionSets();
    populateQuestionSets();
    setupEventListeners();

    // Resume audio context on first click
    document.body.addEventListener('click', () => {
        if (window.audioManager && window.audioManager.audioCtx && window.audioManager.audioCtx.state === 'suspended') {
            window.audioManager.audioCtx.resume();
        }
    }, { once: true });
}

function loadQuestionSets() {
    const saved = localStorage.getItem('tornado_question_sets');
    if (saved) {
        gameState.questionSets = JSON.parse(saved);
        // Merge defaults
        for (let key in defaultQuestionSets) {
            if (!gameState.questionSets[key]) {
                gameState.questionSets[key] = defaultQuestionSets[key];
            }
        }
    } else {
        gameState.questionSets = JSON.parse(JSON.stringify(defaultQuestionSets));
    }

    // Save merged state to ensure defaults are editable/persistent
    localStorage.setItem('tornado_question_sets', JSON.stringify(gameState.questionSets));
}

function populateQuestionSets() {
    const select = document.getElementById('question-set-select');
    select.innerHTML = '';

    // Sort keys to keep default first, then alphabetical or by input order
    // But object keys order isn't guaranteed. Let's just iterate.
    // Ensure 'default' is selected if it's the current one.

    for (let key in gameState.questionSets) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = gameState.questionSets[key].name;
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
            gameState.gridSize = parseInt(this.dataset.size);
        });
    });
}

function startGame() {
    const setKey = document.getElementById('question-set-select').value;
    gameState.currentSet = setKey;

    gameState.teams = [];
    for (let i = 0; i < gameState.numTeams; i++) {
        gameState.teams.push({
            name: `Team ${i + 1}`,
            score: 0
        });
    }

    const totalSquares = gameState.gridSize * gameState.gridSize;
    gameState.grid = new Array(totalSquares).fill(null).map((_, i) => ({
        number: i + 1,
        revealed: false,
        specialType: null
    }));

    const specialSquares = [
        { type: 'tornado', count: Math.max(2, Math.floor(totalSquares / 8)) }, // Slightly more tornadoes
        { type: 'bonus5', count: Math.max(1, Math.floor(totalSquares / 10)) },
        { type: 'bonus2', count: Math.max(3, Math.floor(totalSquares / 6)) },
        { type: 'bonus1', count: Math.max(5, Math.floor(totalSquares / 3)) }, // Most common square
        { type: 'switch', count: Math.max(1, Math.floor(totalSquares / 15)) }
    ];

    // Calculate total assigned special squares
    let totalAssigned = specialSquares.reduce((sum, item) => sum + item.count, 0);

    // Fill remaining with bonus1 if any gaps (though logic below handles placement)
    // Actually, we should make sure we don't exceed totalSquares
    // But the improved logic simply places until counts are met.
    // If we want "regular" squares to be +1, we can just treat the "null" squares as +1 later? 
    // Or simpler: explicitly assign every square a type.

    // I'll make "bonus1" the filler.

    const placedPositions = [];

    // 1. Place high-value/special items first
    specialSquares.forEach(special => {
        if (special.type === 'bonus1') return; // Skip +1 for now, use it to fill rest

        let placed = 0;
        while (placed < special.count) {
            const pos = Math.floor(Math.random() * totalSquares);
            if (!placedPositions.includes(pos)) {
                placedPositions.push(pos);
                gameState.grid[pos].specialType = special.type;
                placed++;
            }
        }
    });

    // 2. Fill ALL remaining spots with bonus1 (or generic point square)
    for (let i = 0; i < totalSquares; i++) {
        if (!gameState.grid[i].specialType) {
            gameState.grid[i].specialType = 'bonus1'; // Default square value
        }
    }

    gameState.currentTeamIndex = 0;
    gameState.revealedSquares = 0;

    document.getElementById('setup-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');

    renderScores();
    renderGrid();
    updateTurnDisplay();
}

function renderScores() {
    const container = document.getElementById('teams-scores');
    container.innerHTML = '';

    gameState.teams.forEach((team, index) => {
        const teamDiv = document.createElement('div');
        teamDiv.className = 'team-score';
        if (index === gameState.currentTeamIndex) {
            teamDiv.classList.add('active');
        }
        teamDiv.innerHTML = `
            <div class="team-name">${team.name}</div>
            <div class="team-points">${team.score}</div>
        `;
        container.appendChild(teamDiv);
    });
}

function renderGrid() {
    const grid = document.getElementById('game-grid');
    grid.className = `game-grid grid-size-${gameState.gridSize}`;
    grid.innerHTML = '';

    gameState.grid.forEach((square, index) => {
        const squareDiv = document.createElement('div');
        squareDiv.className = 'grid-square';
        squareDiv.textContent = square.number;
        squareDiv.dataset.index = index;

        if (square.revealed) {
            squareDiv.classList.add('revealed');
        } else {
            squareDiv.addEventListener('click', () => selectSquare(index));
        }

        grid.appendChild(squareDiv);
    });
}

function updateTurnDisplay() {
    const display = document.getElementById('current-team-display');
    const currentTeam = gameState.teams[gameState.currentTeamIndex];
    display.textContent = `${currentTeam.name}'s Turn`;
}

function selectSquare(index) {
    const square = gameState.grid[index];
    if (square.revealed) return;

    gameState.currentSquare = index;

    // Always show question first
    showQuestionModal();
}

function handleSpecialSquare(type, index) {
    square.revealed = true;
    gameState.revealedSquares++;

    const squareEl = document.querySelector(`[data-index="${index}"]`);
    squareEl.classList.add('revealed', 'special-square');

    switch (type) {
        case 'tornado':
            window.audioManager.play('tornado');
            squareEl.textContent = '🌪️';
            squareEl.classList.add('tornado-square');
            showTornadoModal();
            break;
        case 'bonus1':
            window.audioManager.play('correct');
            squareEl.textContent = '+1';
            squareEl.classList.add('bonus-square');
            showSpecialModal('Bonus!', `${gameState.teams[gameState.currentTeamIndex].name} found a +1 bonus!`, '+1', 'bonus');
            gameState.teams[gameState.currentTeamIndex].score += 1;
            break;
        case 'bonus2':
            window.audioManager.play('correct');
            squareEl.textContent = '+2';
            squareEl.classList.add('bonus-square');
            showSpecialModal('Bonus!', `${gameState.teams[gameState.currentTeamIndex].name} found a +2 bonus!`, '+2', 'bonus');
            gameState.teams[gameState.currentTeamIndex].score += 2;
            break;
        case 'bonus5':
            window.audioManager.play('daily_double'); // Special sound for big bonus
            squareEl.textContent = '+5';
            squareEl.classList.add('bonus-square');
            showSpecialModal('Big Bonus!', `${gameState.teams[gameState.currentTeamIndex].name} found a +5 bonus!`, '+5', 'bonus');
            gameState.teams[gameState.currentTeamIndex].score += 5;
            break;
        case 'penalty1':
            window.audioManager.play('wrong');
            squareEl.textContent = '-1';
            squareEl.classList.add('penalty-square');
            showSpecialModal('Penalty', `${gameState.teams[gameState.currentTeamIndex].name} hit a -1 penalty!`, '-1', 'penalty');
            gameState.teams[gameState.currentTeamIndex].score = Math.max(0, gameState.teams[gameState.currentTeamIndex].score - 1);
            break;
        case 'penalty2':
            window.audioManager.play('wrong');
            squareEl.textContent = '-2';
            squareEl.classList.add('penalty-square');
            showSpecialModal('Penalty', `${gameState.teams[gameState.currentTeamIndex].name} hit a -2 penalty!`, '-2', 'penalty');
            gameState.teams[gameState.currentTeamIndex].score = Math.max(0, gameState.teams[gameState.currentTeamIndex].score - 2);
            break;
        case 'penalty5':
            squareEl.textContent = '-5';
            squareEl.classList.add('penalty-square');
            showSpecialModal('Big Penalty!', `${gameState.teams[gameState.currentTeamIndex].name} hit a -5 penalty!`, '-5', 'penalty');
            gameState.teams[gameState.currentTeamIndex].score = Math.max(0, gameState.teams[gameState.currentTeamIndex].score - 5);
            break;
        case 'switch':
            squareEl.textContent = '🔄';
            squareEl.classList.add('switch-square');
            handleSwitchPoints();
            break;
    }

    renderScores();
}

function showQuestionModal() {
    const questionSet = gameState.questionSets[gameState.currentSet];
    const questions = questionSet.questions;
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

    document.getElementById('question-text').textContent = randomQuestion;
    document.getElementById('question-modal').classList.add('active');
}

function closeQuestionModal() {
    document.getElementById('question-modal').classList.remove('active');
}

function answerCorrect() {
    // Points are now determined by the square type (Bonus +1, +2, +5)
    // BUT, we need to know what to do if it's a Tornado or Switch.
    // Also, usually "Standard" squares have a value.
    // In our new logic, "Standard" squares are bonus1 (+1).
    // So we don't award "100" points anymore.Points come from the square.

    // However, we must reveal the square first.

    const square = gameState.grid[gameState.currentSquare];

    // Note: handleSpecialSquare will handle revealing, adding classes, and scoring/modals.
    // So we just need to close the question modal and trigger the special handler.

    closeQuestionModal();

    // Trigger special effect
    if (square.specialType) {
        handleSpecialSquare(square.specialType, gameState.currentSquare);
    } else {
        // Should not happen with new logic (all squares have type), but fallback:
        gameState.teams[gameState.currentTeamIndex].score += 1;
        square.revealed = true;
        gameState.revealedSquares++;
        const squareEl = document.querySelector(`[data-index="${gameState.currentSquare}"]`);
        squareEl.classList.add('revealed');
        squareEl.textContent = '+1';
        renderScores();
        if (gameState.revealedSquares >= gameState.grid.length) {
            setTimeout(endGame, 500);
        } else {
            nextTurn();
        }
    }
}

function answerWrong() {
    const square = gameState.grid[gameState.currentSquare];
    square.revealed = true;
    gameState.revealedSquares++;

    const squareEl = document.querySelector(`[data-index="${gameState.currentSquare}"]`);
    squareEl.classList.add('revealed');
    squareEl.textContent = '✗';

    closeQuestionModal();

    if (gameState.revealedSquares >= gameState.grid.length) {
        setTimeout(endGame, 500);
    } else {
        nextTurn();
    }
}

function showSpecialModal(title, message, icon, type) {
    document.getElementById('special-title').textContent = title;
    document.getElementById('special-icon').textContent = icon;
    document.getElementById('special-message').textContent = message;

    const modal = document.getElementById('special-modal');
    modal.className = `modal-overlay ${type}-modal`;
    modal.classList.add('active');

    renderScores();
}

function closeSpecialModal() {
    document.getElementById('special-modal').classList.remove('active');

    if (gameState.revealedSquares >= gameState.grid.length) {
        setTimeout(endGame, 500);
    } else {
        nextTurn();
    }
}

function handleSwitchPoints() {
    if (gameState.teams.length < 2) {
        showSpecialModal('Switch!', 'Not enough teams to switch points!', '🔄', 'switch');
        return;
    }

    // Build message showing all score swaps
    let message = 'Points switched!\n\n';
    const scores = gameState.teams.map(t => t.score);

    // Rotate scores: last team gets first team's score, everyone else shifts
    for (let i = gameState.teams.length - 1; i > 0; i--) {
        gameState.teams[i].score = scores[i - 1];
    }
    gameState.teams[0].score = scores[scores.length - 1];

    gameState.teams.forEach((team, i) => {
        message += `${team.name}: ${scores[i]} → ${team.score}\n`;
    });

    showSpecialModal('Switch Points!', message, '🔄', 'switch');
}

function showTornadoModal() {
    const currentTeam = gameState.teams[gameState.currentTeamIndex];
    const lostPoints = currentTeam.score;

    currentTeam.score = 0;

    const message = lostPoints > 0
        ? `${currentTeam.name} hit a tornado and lost ${lostPoints} points!`
        : `${currentTeam.name} hit a tornado! Lucky they had 0 points!`;

    document.getElementById('tornado-message').textContent = message;
    document.getElementById('tornado-modal').classList.add('active');

    renderScores();
}

function closeTornadoModal() {
    document.getElementById('tornado-modal').classList.remove('active');

    if (gameState.revealedSquares >= gameState.grid.length) {
        setTimeout(endGame, 500);
    } else {
        nextTurn();
    }
}

function nextTurn() {
    gameState.currentTeamIndex = (gameState.currentTeamIndex + 1) % gameState.numTeams;
    updateTurnDisplay();
    renderScores();
}

function endGame() {
    let maxScore = -1;
    let winners = [];

    gameState.teams.forEach(team => {
        if (team.score > maxScore) {
            maxScore = team.score;
            winners = [team];
        } else if (team.score === maxScore) {
            winners.push(team);
        }
    });

    const winnerText = winners.length > 1
        ? `It's a tie between ${winners.map(t => t.name).join(' and ')}!`
        : `${winners[0].name} wins!`;

    document.getElementById('winner-announcement').textContent = winnerText;

    const scoresDiv = document.getElementById('final-scores');
    scoresDiv.innerHTML = '';

    const sortedTeams = [...gameState.teams].sort((a, b) => b.score - a.score);

    sortedTeams.forEach(team => {
        const item = document.createElement('div');
        item.className = 'final-score-item';
        if (winners.includes(team)) {
            item.classList.add('winner');
        }
        item.innerHTML = `
            <span>${team.name}</span>
            <span>${team.score} points</span>
        `;
        scoresDiv.appendChild(item);
    });

    document.getElementById('gameover-modal').classList.add('active');
}

document.addEventListener('DOMContentLoaded', initGame);
