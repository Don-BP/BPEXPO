// Vocabulary Pop Game Logic

// 1. Data Bank
const DATA = {
    "FRUIT": {
        items: ["Apple", "Banana", "Grape", "Melon", "Peach", "Lemon", "Kiwi", "Orange"],
        icon: "🍎"
    },
    "ANIMAL": {
        items: ["Bear", "Cat", "Dog", "Lion", "Tiger", "Bird", "Pig", "Rabbit", "Panda"],
        icon: "🦁"
    },
    "COLOR": {
        items: ["Red", "Blue", "Green", "Pink", "Black", "White", "Yellow", "Purple"],
        icon: "🎨"
    },
    "VERB": {
        items: ["Run", "Eat", "Sleep", "Play", "Swim", "Jump", "Walk", "Read", "Cook"],
        icon: "🏃"
    }
};

// Check for Custom Words
const customWhack = localStorage.getItem('whack_custom_words');
if (customWhack) {
    try {
        const words = JSON.parse(customWhack);
        if (Array.isArray(words) && words.length > 0) {
            DATA["CUSTOM"] = {
                items: words,
                icon: "⭐"
            };
        }
    } catch (e) { console.error(e); }
}

// Flatten all items for "Distractors"
const ALL_ITEMS = [];
Object.keys(DATA).forEach(cat => {
    DATA[cat].items.forEach(item => {
        ALL_ITEMS.push({ text: item, type: cat });
    });
});

// Game State
let score = 0;
let timeLeft = 60;
let targetCategory = "";
let timerId = null;
let spawnIntervalId = null;
let activeMoles = []; // Track active timeouts for cleanup
let gameSpeed = 1.0; // Multiplier (1.0 = Normal)

// Speed Config (Slider 1-3: Slow, Normal, Fast)
const SPEED_MAP = {
    1: 1.5,  // Slow (stay up longer)
    2: 1.0,  // Normal
    3: 0.7   // Fast (disappear quicker)
};

// DOM Elements
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time-left");
const holes = document.querySelectorAll(".hole");
const moles = document.querySelectorAll(".mole");
const setupScreen = document.getElementById("setup-screen");
const activeGame = document.getElementById("active-game");
const gameOverModal = document.getElementById("game-over-modal");
const targetDisplay = document.getElementById("target-display");
const targetCategoryEl = document.getElementById("target-category");
const startBtn = document.getElementById("start-btn");

// Initialize Setup
function init() {
    // Inject Custom Button if exists
    if (DATA.CUSTOM && !document.querySelector('button[data-cat="CUSTOM"]')) {
        const grid = document.querySelector('.category-grid');
        const btn = document.createElement('button');
        btn.className = "btn cat-btn";
        btn.setAttribute("data-cat", "CUSTOM");
        btn.textContent = "⭐ CUSTOM";
        grid.prepend(btn); // Add to top
    }

    // Category Selection Logic
    document.querySelectorAll(".cat-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove active class from all
            document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("selected"));
            // Add to clicked
            btn.classList.add("selected");
            // Set Category
            targetCategory = btn.getAttribute("data-cat");
            // Enable Start Button
            startBtn.disabled = false;
        });
    });

    // Speed Slider
    document.getElementById("speed-slider").addEventListener("input", (e) => {
        const val = parseInt(e.target.value);
        gameSpeed = SPEED_MAP[val];
    });

    // Start Button
    startBtn.addEventListener("click", () => {
        if (!targetCategory) return;
        startGame(targetCategory);
    });

    // Add click listeners to moles
    moles.forEach((mole, index) => {
        mole.addEventListener("click", () => handleMoleClick(mole));
    });
}

function startGame(cat) {
    score = 0;
    timeLeft = 60;
    scoreEl.textContent = score;
    timeEl.textContent = timeLeft;

    // UI Updates
    setupScreen.classList.add("hidden");
    activeGame.classList.remove("hidden");
    targetDisplay.classList.remove("hidden");

    const icon = DATA[cat].icon || "";
    targetCategoryEl.textContent = `${icon} ${cat}`;

    // Start Loops
    timerId = setInterval(countDown, 1000);
    // Adjust spawn rate based on speed too? 
    // Let's keep spawn rate constant (0.8s) but change "stay up" time.
    spawnIntervalId = setInterval(peep, 800);
    peep(); // Immediate start
}

function countDown() {
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 0) {
        endGame();
    }
}

function endGame() {
    clearInterval(timerId);
    clearInterval(spawnIntervalId);

    // Clear board
    activeMoles.forEach(timeout => clearTimeout(timeout));
    moles.forEach(mole => mole.classList.remove("up"));

    // Show End Screen
    targetDisplay.classList.add("hidden");
    document.getElementById("final-score").textContent = score;
    gameOverModal.classList.add("active");
}

function randomTime(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function randomHole(holes) {
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];
    if (hole.classList.contains("active-hole")) {
        return randomHole(holes); // Retry if busy
    }
    return hole;
}

function peep() {
    // Base time: 1000-2000ms. Apply multiplier.
    // Fast (0.7) -> 700-1400ms
    // Slow (1.5) -> 1500-3000ms
    const min = 1000 * gameSpeed;
    const max = 2000 * gameSpeed;
    const time = randomTime(min, max);
    const hole = randomHole(holes);
    const mole = hole.querySelector(".mole");

    // Determine content
    // 50% Chance of Target, 50% Chance of Distractor
    const isTarget = Math.random() > 0.5;
    let wordObj;

    if (isTarget) {
        // Pick random from target category
        const items = DATA[targetCategory].items;
        const text = items[Math.floor(Math.random() * items.length)];
        wordObj = { text: text, type: targetCategory };
    } else {
        // Pick random distractor (anything NOT target)
        const distractors = ALL_ITEMS.filter(item => item.type !== targetCategory);
        wordObj = distractors[Math.floor(Math.random() * distractors.length)];
    }

    // Set Content
    mole.textContent = wordObj.text;
    mole.setAttribute("data-type", wordObj.type);
    mole.classList.remove("correct", "wrong"); // Reset styles logic

    // Animation
    hole.classList.add("active-hole");
    mole.classList.add("up");

    const timeout = setTimeout(() => {
        mole.classList.remove("up");
        hole.classList.remove("active-hole");
    }, time);

    activeMoles.push(timeout);
}

function handleMoleClick(mole) {
    if (!mole.classList.contains("up")) return; // Can't click if hidden
    if (mole.classList.contains("clicked")) return; // Prevent double taps (custom flag)

    const type = mole.getAttribute("data-type");

    if (type === targetCategory) {
        score += 10;
        mole.classList.add("correct");
        scoreEl.textContent = score;
    } else {
        score -= 5;
        mole.classList.add("wrong");
        scoreEl.textContent = score;
        // Optional: Shake animation or sound
    }

    // Hide quickly after click
    mole.classList.remove("up");
    setTimeout(() => {
        mole.classList.remove("correct", "wrong");
        // Remove active state from parent hole
        mole.parentElement.classList.remove("active-hole");
    }, 200); // Allow animation to play briefly
}

init();
