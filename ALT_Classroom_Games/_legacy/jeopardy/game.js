// Jeopardy Game Logic
let gameState = {
    boards: {},
    currentBoardId: 'default',
    teams: [],
    currentTeamIndex: 0,
    currentQuestion: null,
    answeredQuestions: [],
    currentWager: 0,
    dailyDoubles: [] // "col-row" strings
};

const defaultBoards = {
    'default': {
        id: 'default',
        name: 'Mixed Review',
        categories: ['Vocabulary', 'Grammar', 'Verbs', 'Numbers', 'Culture'],
        questions: [
            ['What is a synonym of "happy"?', 'What does "noun" mean?', 'Past tense of "run"?', 'What is 15 + 23?', 'What is the capital of Japan?'],
            ['Spell: DICTIONARY', 'Is this correct: "He don\'t like"?', 'Past tense of "eat"?', 'What is 100 - 47?', 'Name a Japanese festival'],
            ['What\'s the opposite of "big"?', 'Plural of "child"?', 'Past tense of "swim"?', '12 × 5 = ?', 'What is sushi?'],
            ['Use "because" in a sentence', 'What is an adjective?', 'Past tense of "go"?', 'What is 50% of 80?', 'Name 3 Japanese cities'],
            ['What does "curious" mean?', 'Fix: "She go to school"', 'Past tense of "write"?', 'What is 7 × 8?', 'What are chopsticks?']
        ]
    },
    'grammar_review': {
        id: 'grammar_review',
        name: 'Grammar Review',
        categories: ['Be Verbs', 'Pronouns', 'Wh- Words', 'Plurals', 'Sentences'],
        questions: [
            ['I __ happy.', 'I / You / He - Which is different?', 'Who / What / Where - for time?', 'One dog, two ___', 'Make a sentence: like / I / pizza'],
            ['She __ tall.', 'Possessive of "I"?', 'Who / What / Where - for place?', 'One child, two ___', 'Fix: He like play soccer.'],
            ['We __ students.', 'Object pronoun of "She"?', 'Who / What / Where - for things?', 'One box, two ___', 'Fix: I am go to school.'],
            ['They __ running.', 'Possessive of "They"?', 'How / Why / When - for reason?', 'One mouse, two ___', 'Make a negative: I like cats.'],
            ['It __ sunny.', 'Reflexive of "You"?', 'How / Why / When - for manner?', 'One person, two ___', 'Make a question: You are hungry.']
        ]
    },
    'general_knowledge': {
        id: 'general_knowledge',
        name: 'General Knowledge',
        categories: ['Geography', 'Science', 'Math', 'Sports', 'Animals'],
        questions: [
            ['Which country is famous for bright red buses?', 'What planet is closest to the sun?', '10 + 10 = ?', 'What sport uses a racket?', 'King of the jungle?'],
            ['Capital of France?', 'H2O is water. What is CO2?', '30 - 15 = ?', 'What sport uses a bat?', 'Largest mammal?'],
            ['Longest river in the world?', 'How many bones in the body?', '5 x 6 = ?', 'How many players in soccer?', 'Fastest land animal?'],
            ['Largest ocean?', 'What gas do we breathe?', '18 / 3 = ?', 'National sport of Japan?', 'Bird that cannot fly?'],
            ['How many continents?', 'Freezing point of water?', 'Square root of 81?', 'Where were the 2020 Olympics?', 'Animal with a pouch?']
        ]
    }
};

function initGame() {
    loadBoards();
    setupGame();
    setupDailyDoubles();
    renderScores();
    renderBoard();

    // Resume audio context on first click if needed
    document.body.addEventListener('click', () => {
        if (window.audioManager.audioCtx.state === 'suspended') {
            window.audioManager.audioCtx.resume();
        }
    }, { once: true });
}

function loadBoards() {
    const saved = localStorage.getItem('jeopardy_boards');
    if (saved) {
        gameState.boards = JSON.parse(saved);
        // Merge defaults
        for (let key in defaultBoards) {
            if (!gameState.boards[key]) {
                gameState.boards[key] = defaultBoards[key];
            }
        }
    } else {
        gameState.boards = JSON.parse(JSON.stringify(defaultBoards));
    }

    // Save merged state
    localStorage.setItem('jeopardy_boards', JSON.stringify(gameState.boards));

    const urlParams = new URLSearchParams(window.location.search);
    const boardId = urlParams.get('board') || 'default';

    if (gameState.boards[boardId]) {
        gameState.currentBoardId = boardId;
    }
}

function setupGame() {
    gameState.teams = [
        { name: 'Team 1', score: 0 },
        { name: 'Team 2', score: 0 },
        { name: 'Team 3', score: 0 },
        { name: 'Team 4', score: 0 }
    ];
}

function setupDailyDoubles() {
    gameState.dailyDoubles = [];
    // Pick 2 random unique coordinates
    while (gameState.dailyDoubles.length < 2) {
        const col = Math.floor(Math.random() * 5);
        const row = Math.floor(Math.random() * 5);
        const id = `${col}-${row}`;
        if (!gameState.dailyDoubles.includes(id)) {
            gameState.dailyDoubles.push(id);
        }
    }
    console.log("Daily Doubles at:", gameState.dailyDoubles);
}

function renderScores() {
    const scores = document.getElementById('scores');
    scores.innerHTML = gameState.teams.map((team, index) => `
        <div class="team-score ${index === gameState.currentTeamIndex ? 'active' : ''}" onclick="setActiveTeam(${index})">
            <div class="team-name">${team.name}</div>
            <div class="team-points">$${team.score}</div>
        </div>
    `).join('');
}

function setActiveTeam(index) {
    gameState.currentTeamIndex = index;
    renderScores();
}

function renderBoard() {
    const board = gameState.boards[gameState.currentBoardId];
    const categoriesDiv = document.getElementById('categories');
    const questionsDiv = document.getElementById('questions-grid');

    categoriesDiv.innerHTML = board.categories.map(cat =>
        `<div class="category-header">${cat}</div>`
    ).join('');

    const points = [100, 200, 300, 400, 500];
    let html = '';

    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const questionId = `${col}-${row}`;
            const isAnswered = gameState.answeredQuestions.includes(questionId);
            html += `
                <div class="question-tile ${isAnswered ? 'answered' : ''}" 
                     onclick="showQuestion(${col}, ${row}, ${points[row]})">
                    ${isAnswered ? '' : '$' + points[row]}
                </div>
            `;
        }
    }

    questionsDiv.innerHTML = html;
}

function showQuestion(col, row, points) {
    const questionId = `${col}-${row}`;
    if (gameState.answeredQuestions.includes(questionId)) return;

    const board = gameState.boards[gameState.currentBoardId];
    const questionText = board.questions[row] && board.questions[row][col]
        ? board.questions[row][col]
        : 'Question not found';

    gameState.currentQuestion = {
        col, row, points, id: questionId,
        text: questionText
    };

    // Check Daily Double
    if (gameState.dailyDoubles.includes(questionId)) {
        window.audioManager.play('daily_double');
        showDailyDoubleModal();
    } else {
        openQuestionModal(points);
    }
}

function showDailyDoubleModal() {
    const currentScore = gameState.teams[gameState.currentTeamIndex].score;
    const maxWager = Math.max(currentScore, 1000); // Can always wager up to 1000

    document.getElementById('wager-max').textContent = `Max Wager: $${maxWager}`;
    document.getElementById('wager-input').value = '';
    document.getElementById('wager-input').max = maxWager;
    document.getElementById('daily-double-modal').classList.add('active');
}

function submitWager() {
    const input = document.getElementById('wager-input');
    let wager = parseInt(input.value);

    const currentScore = gameState.teams[gameState.currentTeamIndex].score;
    const maxWager = Math.max(currentScore, 1000);

    if (isNaN(wager) || wager < 5) {
        wager = 100; // Default minimum
    }
    if (wager > maxWager) wager = maxWager; // Cap it

    gameState.currentWager = wager;

    // Switch modal
    document.getElementById('daily-double-modal').classList.remove('active');

    // Use wagered points instead of tile points
    openQuestionModal(wager);
}

function openQuestionModal(points) {
    gameState.currentQuestion.points = points; // Update active points to wager amount if changed
    document.getElementById('point-value').textContent = '$' + points;
    document.getElementById('question-display').textContent = gameState.currentQuestion.text;
    document.getElementById('question-modal').classList.add('active');
}

function answerCorrect() {
    window.audioManager.play('correct');
    const team = gameState.teams[gameState.currentTeamIndex];
    team.score += gameState.currentQuestion.points;
    gameState.answeredQuestions.push(gameState.currentQuestion.id);
    closeModal();
    renderScores();
    renderBoard();
}

function answerWrong() {
    window.audioManager.play('wrong');
    // In Jeopardy, wrong answers deduct points!
    const team = gameState.teams[gameState.currentTeamIndex];
    team.score -= gameState.currentQuestion.points;

    gameState.answeredQuestions.push(gameState.currentQuestion.id);
    closeModal();
    renderScores();
    renderBoard();
}

function closeModal() {
    document.getElementById('question-modal').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', initGame);
