// Mystery Box Game Logic

let gameState = {
    sets: {},
    currentSetId: 'default',
    teams: [],
    numTeams: 2,
    currentTeamIndex: 0,
    gridSize: 16, // 9, 16, 25
    boxes: [], // { id, revealed: bool, reward: object }
    scoreHistory: [] // Undo stack (optional, keeping it simple first)
};

// Rewards System
const REWARD_TYPES = {
    POINTS: 'points',
    BOMB: 'bomb',
    ROBBER: 'robber',
    SWAP: 'swap',
    MULTIPLY: 'multiply'
};

const defaultSets = {
    'default': {
        name: 'Standard Mix',
        rewards: [
            // Standard Points
            { type: 'points', value: 100, weight: 5 },
            { type: 'points', value: 200, weight: 5 },
            { type: 'points', value: 500, weight: 4 },
            { type: 'points', value: 1000, weight: 2 },
            { type: 'points', value: -100, weight: 2 },
            // Special
            { type: 'bomb', value: 0, weight: 1 }, // Reset score
            { type: 'robber', value: 0, weight: 1 }, // Steal
            { type: 'swap', value: 0, weight: 1 }, // Swap with leader
            { type: 'multiply', value: 2, weight: 1 } // x2 Score
        ]
    },
    'high_risk': {
        name: 'High Risk / High Reward',
        rewards: [
            { type: 'points', value: 1000, weight: 5 },
            { type: 'points', value: 2000, weight: 2 },
            { type: 'points', value: -500, weight: 3 },
            { type: 'bomb', value: 0, weight: 3 },
            { type: 'robber', value: 0, weight: 2 }
        ]
    }
};

function initGame() {
    loadSets();
    populateSetSelect();
}

function loadSets() {
    const saved = localStorage.getItem('mystery_sets');
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
    localStorage.setItem('mystery_sets', JSON.stringify(gameState.sets));
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

    // Setup Teams
    gameState.teams = [];
    for (let i = 0; i < gameState.numTeams; i++) {
        gameState.teams.push({ name: `Team ${i + 1}`, score: 0 });
    }

    // Generate Boxes
    generateBoxes(set);

    // Setup Grid
    renderGrid();
    renderScores();
    updateTurnDisplay();

    document.getElementById('setup-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
}

function generateBoxes(set) {
    gameState.boxes = [];

    // Create pool based on weights
    let pool = [];
    set.rewards.forEach(r => {
        for (let i = 0; i < r.weight; i++) {
            pool.push(r);
        }
    });

    for (let i = 0; i < gameState.gridSize; i++) {
        // Pick random reward from pool
        const reward = pool[Math.floor(Math.random() * pool.length)];
        gameState.boxes.push({
            id: i,
            revealed: false,
            reward: JSON.parse(JSON.stringify(reward)) // copy
        });
    }
}

function renderGrid() {
    const gridEl = document.getElementById('box-grid');
    gridEl.innerHTML = '';

    // Cols: 9->3, 16->4, 25->5
    const cols = Math.sqrt(gameState.gridSize);
    gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    gameState.boxes.forEach((box, index) => {
        const boxEl = document.createElement('div');
        boxEl.className = `mystery-box ${box.revealed ? 'opened' : ''}`;
        boxEl.onclick = () => handleBoxClick(index);

        const visual = getRewardVisual(box.reward);

        boxEl.innerHTML = `
            <div class="box-inner">
                <div class="box-front">
                    <span style="font-size: 1rem; margin-top:5px;">${index + 1}</span>
                </div>
                <div class="box-back">
                    <div class="reward-icon">${visual.icon}</div>
                    <div class="reward-value">${visual.text}</div>
                </div>
            </div>
        `;
        gridEl.appendChild(boxEl);
    });
}

function getRewardVisual(reward) {
    switch (reward.type) {
        case 'points': return { icon: reward.value >= 0 ? '💰' : '💸', text: (reward.value > 0 ? '+' : '') + reward.value };
        case 'bomb': return { icon: '💣', text: 'Boom!' };
        case 'robber': return { icon: '🧙‍♂️', text: 'Steal!' }; // Using Wizard/Robber
        case 'swap': return { icon: '🔄', text: 'Swap!' };
        case 'multiply': return { icon: '✖️', text: 'x' + reward.value };
        default: return { icon: '❓', text: '?' };
    }
}

function handleBoxClick(index) {
    if (gameState.boxes[index].revealed) return;

    gameState.boxes[index].revealed = true;

    const boxEl = document.getElementById('box-grid').children[index];
    boxEl.classList.add('opened');

    // Play Sound
    const reward = gameState.boxes[index].reward;
    if (reward.type === 'bomb') window.audioManager.play('wrong'); // Explosion?
    else if (reward.value < 0) window.audioManager.play('wrong');
    else window.audioManager.play('correct'); // Cha-ching?

    setTimeout(() => {
        applyReward(reward);
        showRewardModal(reward);
        renderScores();

        // Next turn after modal closes
    }, 600);
}

function applyReward(reward) {
    const currentTeam = gameState.teams[gameState.currentTeamIndex];

    switch (reward.type) {
        case 'points':
            currentTeam.score += reward.value;
            break;
        case 'bomb':
            currentTeam.score = 0;
            break;
        case 'multiply':
            currentTeam.score *= reward.value;
            break;
        case 'swap':
            // Swap with highest score team (that isn't self)
            let leader = gameState.teams[0];
            gameState.teams.forEach(t => {
                if (t !== currentTeam && t.score > leader.score) leader = t;
            });
            if (leader !== currentTeam) {
                const temp = currentTeam.score;
                currentTeam.score = leader.score;
                leader.score = temp;
            }
            break;
        case 'robber':
            // Steal 500ish points from random other team or leader
            let target = gameState.teams[(gameState.currentTeamIndex + 1) % gameState.teams.length];
            // Simple: steal 300
            if (target.score > 0) {
                const stealAmt = Math.min(target.score, 500);
                target.score -= stealAmt;
                currentTeam.score += stealAmt;
            }
            break;
    }
}

function showRewardModal(reward) {
    const visual = getRewardVisual(reward);
    document.getElementById('reward-title').textContent = reward.type.toUpperCase() + '!';
    document.getElementById('reward-icon').textContent = visual.icon;

    let desc = '';
    if (reward.type === 'points') desc = `You got ${visual.text} points!`;
    if (reward.type === 'bomb') desc = "Oh no! Score reset to 0!";
    if (reward.type === 'robber') desc = "You stole points from the next team!";
    if (reward.type === 'swap') desc = "You swapped scores with the leader!";
    if (reward.type === 'multiply') desc = "Score multiplied!";

    document.getElementById('reward-description').textContent = desc;
    document.getElementById('reward-modal').classList.add('active');

    // Confetti for big wins?
    if (reward.value >= 500) {
        window.audioManager.play('daily_double');
    }
}

function closeRewardModal() {
    document.getElementById('reward-modal').classList.remove('active');
    nextTurn();
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
    const container = document.getElementById('score-board');
    container.innerHTML = gameState.teams.map((t, i) => `
        <div class="team-score ${i === gameState.currentTeamIndex ? 'active' : ''}">
            <div class="team-name">${t.name}</div>
            <div class="team-points">${t.score}</div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', initGame);
