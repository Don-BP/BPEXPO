// Word Detect Game Logic

// 1. Word Bank (Elementary & Junior High Level)
const WORDS = [
    "APPLE", "BEACH", "BREAD", "BRUSH", "CHAIR", "CLASS", "CLOCK", "CLOUD", "COLOR", "DANCE",
    "DREAM", "DRINK", "DRIVE", "EARTH", "EVENT", "FIELD", "FRUIT", "GLASS", "GRASS", "GREEN",
    "GROUP", "HAPPY", "HEART", "HELLO", "HORSE", "HOUSE", "IMAGE", "JUICE", "LAUGH", "LEMON",
    "LIGHT", "LUNCH", "MELON", "MODEL", "MONEY", "MONTH", "MOUSE", "MOVIE", "MUSIC", "NIGHT",
    "NOISE", "NURSE", "OCEAN", "PAPER", "PARTY", "PHONE", "PHOTO", "PIANO", "PILOT", "PIZZA",
    "PLANE", "PLANT", "PLATE", "POINT", "POWER", "PRIZE", "QUIET", "QUICK", "RADIO", "RIVER",
    "ROBOT", "ROUND", "SALAD", "SHIRT", "SHOES", "SHORT", "SKIRT", "SLEEP", "SMILE", "SNAKE",
    "SOUND", "SPACE", "SPOON", "SPORT", "START", "STONE", "STORE", "STORM", "STORY", "STUDY",
    "SUGAR", "SWEET", "TABLE", "TASTE", "TEACH", "TIGER", "TOUCH", "TOWEL", "TRACK", "TRAIN",
    "TRUCK", "UNCLE", "VIDEO", "VISIT", "VOICE", "WATCH", "WATER", "WHALE", "WHITE", "WOMAN",
    "WORLD", "WRITE", "YOUNG", "ZEBRA"
];

// Game State
const state = {
    solution: "",
    grid: Array(6).fill().map(() => Array(5).fill("")),
    currentRow: 0,
    currentCol: 0,
    gameStatus: "playing", // playing, won, lost
    guessedLetters: {} // { 'A': 'correct', 'B': 'absent' }
};

// Initialize Game
function initGame() {
    // Check for custom words
    const custom = localStorage.getItem('wordle_custom_words');
    let pool = WORDS;

    if (custom) {
        try {
            const parsed = JSON.parse(custom);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // Filter for 5-letter words to prevent breaking grid
                // or just accept them and let them be weird? 
                // Let's filter to be safe for now, as grid is hardcoded 5x6
                const valid = parsed.filter(w => w.length === 5);
                if (valid.length > 0) {
                    pool = valid;
                    console.log("Using custom word list:", pool);
                } else {
                    console.warn("Custom words found but none were 5 letters. Using default.");
                }
            }
        } catch (e) {
            console.error("Error loading custom words", e);
        }
    }

    // Select Random Word
    state.solution = pool[Math.floor(Math.random() * pool.length)];
    // Allow cheat code for teachers in console
    console.log("Solution:", state.solution);

    // Draw Grid
    drawGrid();

    // Keyboard Listeners
    setupKeyboard();
}

function drawGrid() {
    const board = document.getElementById("board");
    board.innerHTML = ""; // Clear existing

    for (let r = 0; r < 6; r++) {
        const row = document.createElement("div");
        row.className = "row";
        for (let c = 0; c < 5; c++) {
            const tile = document.createElement("div");
            tile.className = "tile";
            tile.id = `tile-${r}-${c}`;

            // Fill content if exists
            const letter = state.grid[r][c];
            tile.textContent = letter;

            // Add active state styling for visual pop
            if (letter) {
                tile.setAttribute("data-state", "active");
            }

            row.appendChild(tile);
        }
        board.appendChild(row);
    }
}

function updatedGrid() {
    // Only update specific tiles for performance
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 5; c++) {
            const tile = document.getElementById(`tile-${r}-${c}`);
            if (tile) {
                const letter = state.grid[r][c];
                tile.textContent = letter;
                // Only add active state if it's the current row and has content
                if (r === state.currentRow && letter) {
                    tile.setAttribute("data-state", "active");
                } else if (!letter && !tile.classList.contains("flip")) {
                    tile.removeAttribute("data-state");
                }
            }
        }
    }
}

function handleInput(key) {
    if (state.gameStatus !== "playing") return;

    if (key === "Backspace") {
        removeLetter();
    } else if (key === "Enter") {
        submitGuess();
    } else if (isLetter(key)) {
        addLetter(key);
    }
}

function isLetter(key) {
    return /^[a-zA-Z]$/.test(key) && key.length === 1;
}

function addLetter(letter) {
    if (state.currentCol < 5) {
        state.grid[state.currentRow][state.currentCol] = letter.toUpperCase();
        state.currentCol++;
        updatedGrid();
    }
}

function removeLetter() {
    if (state.currentCol > 0) {
        state.currentCol--;
        state.grid[state.currentRow][state.currentCol] = "";
        updatedGrid();
    }
}

function submitGuess() {
    if (state.currentCol !== 5) {
        showMessage("Not enough letters");
        shakeRow();
        return;
    }

    const currentGuess = state.grid[state.currentRow].join("");

    // In a real full app, we would check if currentGuess is a valid English word here.
    // For this simple version, we'll accept any 5 letters to avoid frustration for kids 
    // or need a massive dictionary. But checking against WORDS list is robust if listed words are comprehensive.
    // Let's at least check against our WORDS list + maybe some commons.
    // For now: Allow any 5 letters to keep it simple for students who might guess random things.

    revealColors(currentGuess);
}

function revealColors(guess) {
    const row = state.currentRow;
    const solution = state.solution;
    const solutionChars = solution.split("");
    const guessChars = guess.split("");

    // First pass: Correct letters (Green)
    guessChars.forEach((char, i) => {
        if (char === solutionChars[i]) {
            updateTileState(row, i, "correct");
            solutionChars[i] = null; // Mark as handled
            guessChars[i] = null;
            updateKeyboardKey(char, "correct");
        }
    });

    // Second pass: Present letters (Yellow)
    guessChars.forEach((char, i) => {
        if (char && solutionChars.includes(char)) {
            updateTileState(row, i, "present");
            const index = solutionChars.indexOf(char);
            solutionChars[index] = null; // Mark as handled
            updateKeyboardKey(char, "present");
        } else if (char) {
            updateTileState(row, i, "absent");
            updateKeyboardKey(char, "absent");
        }
    });

    // Flip animation delay
    // We already applied classes, but let's add sequential flip delay
    for (let i = 0; i < 5; i++) {
        const tile = document.getElementById(`tile-${row}-${i}`);
        tile.classList.add("flip");
        tile.style.animationDelay = `${i * 100}ms`;
    }

    checkWinLose(guess);
}

function updateTileState(r, c, status) {
    // We set a timeout to match the flip animation visually
    setTimeout(() => {
        const tile = document.getElementById(`tile-${r}-${c}`);
        tile.setAttribute("data-state", status);
    }, c * 100 + 250); // Delay half way through flip
}

function updateKeyboardKey(char, status) {
    const key = document.querySelector(`button[data-key="${char.toLowerCase()}"]`);
    if (!key) return;

    // Correct overrides everything
    const currentStatus = key.getAttribute("data-state");
    if (currentStatus === "correct") return;
    if (status === "present" && currentStatus === "absent") return; // Should not happen usually

    key.setAttribute("style", getKeyStyle(status));
    key.setAttribute("data-state", status);
}

function getKeyStyle(status) {
    if (status === "correct") return "background-color: var(--color-correct); color: white; border-color: var(--color-correct);";
    if (status === "present") return "background-color: var(--color-present); color: white; border-color: var(--color-present);";
    return "background-color: var(--color-absent); color: white; border-color: var(--color-absent);";
}

function checkWinLose(guess) {
    if (guess === state.solution) {
        state.gameStatus = "won";
        setTimeout(() => {
            showMessage("🎉 Amazing! Splendid!", 2000);
            showPlayAgain(true);
        }, 1500);
    } else {
        state.currentRow++;
        state.currentCol = 0;

        if (state.currentRow === 6) {
            state.gameStatus = "lost";
            setTimeout(() => {
                showMessage(`The word was ${state.solution}`, 5000);
                showPlayAgain(false);
            }, 1000);
        }
    }
}

function showMessage(msg, duration = 1000) {
    const container = document.getElementById("message-container");
    const el = document.createElement("div");
    el.className = "message";
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => {
        el.remove();
    }, duration);
}

function shakeRow() {
    const row = document.getElementById("board").children[state.currentRow];
    row.classList.add("shake");
    setTimeout(() => row.classList.remove("shake"), 500);
}

// Play Again Button (Injects into header or modal)
function showPlayAgain(won) {
    const header = document.querySelector("header");
    // Check if button already exists
    if (document.getElementById("play-again")) return;

    const btn = document.createElement("button");
    btn.id = "play-again";
    btn.className = "btn-icon";
    btn.textContent = "🔄";
    btn.onclick = () => location.reload();
    btn.style.marginLeft = "10px";
    header.appendChild(btn);
    btn.classList.add("pulse");
}

function setupKeyboard() {
    // On-screen keys
    document.querySelectorAll(".keyboard-row button").forEach(btn => {
        btn.addEventListener("click", () => {
            const key = btn.getAttribute("data-key");
            handleInput(key);
        });
    });

    // Physical keyboard
    document.addEventListener("keydown", (e) => {
        handleInput(e.key);
    });
}

// Modal Logic
const modalOverlay = document.getElementById("modal-overlay");
const infoBtn = document.getElementById("info-btn");
const closeBtn = document.getElementById("close-modal");

infoBtn.addEventListener("click", () => modalOverlay.classList.add("active"));
closeBtn.addEventListener("click", () => modalOverlay.classList.remove("active"));
modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove("active");
});

// Start
initGame();
