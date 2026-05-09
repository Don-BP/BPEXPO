// Hangman Logic

const DEFAULT_WORDS = [
    "APPLE", "BANANA", "CHERRY", "DRAGON", "ELEPHANT", "FLOWER", "GIRAFFE", "HOUSE", "IGLOO",
    "JUNGLE", "KANGAROO", "LEMON", "MONKEY", "NATURE", "ORANGE", "PENCIL", "QUEEN", "RABBIT",
    "SCHOOL", "TIGER", "UMBRELLA", "VIOLIN", "WATER", "XYLOPHONE", "YELLOW", "ZEBRA",
    "COMPUTER", "LIBRARY", "HOSPITAL", "STATION", "RESTAURANT", "SUPERMARKET"
];

// State
let solution = "";
let guessedLetters = new Set();
let wrongs = 0;
let wins = 0;
const MAX_WRONGS = 6;

// Elements
const wordDisplay = document.getElementById("word-display");
const keyboard = document.getElementById("keyboard");
const resultModal = document.getElementById("result-modal"); // Keep using existing modal ID from HTML
const winCountEl = document.getElementById("win-count");

function initGame() {
    let pool = DEFAULT_WORDS;

    // Check Custom Words
    const custom = localStorage.getItem('hangman_custom_words');
    if (custom) {
        try {
            const parsed = JSON.parse(custom);
            if (Array.isArray(parsed) && parsed.length > 0) pool = parsed;
        } catch (e) { }
    }

    solution = pool[Math.floor(Math.random() * pool.length)];
    // Handle spaces if user entered phrases, ensure uppercase
    solution = solution.toUpperCase();

    guessedLetters.clear();
    wrongs = 0;

    // UI Reset
    for (let i = 0; i < 6; i++) {
        const part = document.getElementById(`part-${i}`);
        if (part) part.classList.add("hidden");
    }

    renderWord();
    renderKeyboard();

    if (resultModal) resultModal.classList.remove("active");
}

function renderWord() {
    wordDisplay.innerHTML = "";
    const chars = solution.split("");

    chars.forEach(char => {
        const slot = document.createElement("div");

        if (char === " ") {
            slot.className = "letter-slot space";
            slot.innerHTML = "&nbsp;";
        } else {
            slot.className = "letter-slot";
            // Show if guessed
            if (guessedLetters.has(char)) {
                slot.textContent = char;
            } else {
                slot.textContent = "";
            }
        }
        wordDisplay.appendChild(slot);
    });
}

function renderKeyboard() {
    keyboard.innerHTML = "";
    for (let i = 65; i <= 90; i++) {
        const char = String.fromCharCode(i);
        const btn = document.createElement("button");
        btn.className = "key-btn";
        btn.textContent = char;

        // Disable if already guessed
        if (guessedLetters.has(char)) {
            btn.disabled = true;
            if (solution.includes(char)) {
                btn.classList.add("correct");
            } else {
                btn.classList.add("wrong");
            }
        }

        btn.onclick = () => handleGuess(char);
        keyboard.appendChild(btn);
    }
}

function handleGuess(char) {
    if (guessedLetters.has(char) || wrongs >= MAX_WRONGS) return;

    guessedLetters.add(char);

    if (solution.includes(char)) {
        // Correct
        checkWin();
    } else {
        // Wrong
        wrongs++;
        showBodyPart(wrongs - 1);
        checkLoss();
    }

    renderWord();
    renderKeyboard();
}

function showBodyPart(index) {
    const part = document.getElementById(`part-${index}`);
    if (part) part.classList.remove("hidden");
}

function checkWin() {
    // Check if all non-space characters are guessed
    const letters = solution.replace(/ /g, "").split("");
    const allGuessed = letters.every(l => guessedLetters.has(l));

    if (allGuessed) {
        wins++;
        if (winCountEl) winCountEl.textContent = wins;

        setTimeout(() => {
            const title = document.getElementById("result-title");
            const msg = document.getElementById("result-msg");
            const reveal = document.getElementById("word-reveal");

            if (title) title.textContent = "You Win! 🎉";
            if (msg) msg.textContent = "Great job!";
            if (reveal) reveal.textContent = solution;
            if (resultModal) resultModal.classList.add("active");
        }, 500);
    }
}

function checkLoss() {
    if (wrongs >= MAX_WRONGS) {
        setTimeout(() => {
            const title = document.getElementById("result-title");
            const msg = document.getElementById("result-msg");
            const reveal = document.getElementById("word-reveal");

            if (title) title.textContent = "Game Over 🕸️";
            if (msg) msg.textContent = "The word was:";
            if (reveal) reveal.textContent = solution;
            if (resultModal) resultModal.classList.add("active");
        }, 500);
    }
}

// Init
initGame();
