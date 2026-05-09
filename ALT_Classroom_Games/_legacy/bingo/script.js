// Digital Bingo Logic

// 1. Data Banks
const THEMES = {
    NUMBER: [], // Generated dynamically 1-75
    FRUIT: ["Apple", "Banana", "Grape", "Melon", "Peach", "Lemon", "Kiwi", "Orange", "Cherry", "Pear", "Berry", "Mango", "Pineapple", "Coco", "Plum", "Lime"],
    ANIMAL: ["Bear", "Cat", "Dog", "Lion", "Tiger", "Bird", "Pig", "Rabbit", "Panda", "Fox", "Wolf", "Fish", "Whale", "Duck", "Cow", "Sheep"]
};

// Check for Custom Words
const customBingo = localStorage.getItem('bingo_custom_words');
if (customBingo) {
    try {
        const words = JSON.parse(customBingo);
        if (Array.isArray(words) && words.length >= 16) {
            THEMES.CUSTOM = words;
        }
    } catch (e) { console.error(e); }
}

// Generate numbers
for (let i = 1; i <= 75; i++) THEMES.NUMBER.push(i);

// State
let currentCells = []; // Array of 16 objects { val: "Apple", stamped: false }
let winShown = false;

function init() {
    // Inject Custom Button if exists
    if (THEMES.CUSTOM) {
        const controls = document.querySelector('.controls');
        // Check if button already exists to avoid dupes
        if (!document.querySelector('button[onclick="generateCard(\'CUSTOM\')"]')) {
            const btn = document.createElement('button');
            btn.className = "btn btn-sm btn-accent";
            btn.textContent = "Custom Set";
            btn.onclick = () => generateCard('CUSTOM');
            controls.appendChild(btn);
        }
    }

    generateCard('NUMBER');
}

function generateCard(themeKey) {
    // Reset
    winShown = false;
    document.getElementById("win-modal").classList.remove("active");

    // UI Update
    const title = themeKey.charAt(0).toUpperCase() + themeKey.slice(1).toLowerCase() + "s";
    document.getElementById("card-theme").textContent = `Theme: ${title}`;

    // Get Items
    let pool = [...THEMES[themeKey]];

    // If pool is smaller than 16, duplicate to fill (shouldn't happen with our data, but safe-guard)
    while (pool.length < 16) {
        pool = pool.concat(THEMES[themeKey]);
    }

    // Shuffle and Pick 16
    pool.sort(() => Math.random() - 0.5);
    const items = pool.slice(0, 16);

    // Setup Grid State
    currentCells = items.map(val => ({ val, stamped: false }));

    renderGrid();
}

function renderGrid() {
    const grid = document.getElementById("bingo-grid");
    grid.innerHTML = "";

    currentCells.forEach((cell, index) => {
        const div = document.createElement("div");
        div.className = "bg-cell";
        if (cell.stamped) div.classList.add("stamped");
        div.textContent = cell.val;

        div.onclick = () => toggleCell(index);

        grid.appendChild(div);
    });
}

function toggleCell(index) {
    // Toggle State
    currentCells[index].stamped = !currentCells[index].stamped;

    // Update UI directly for performance
    const cellDiv = document.getElementById("bingo-grid").children[index];
    cellDiv.classList.toggle("stamped");

    // Check Win
    if (!winShown) checkWin();
}

function checkWin() {
    // 4x4 Grid Indices:
    // 0  1  2  3
    // 4  5  6  7
    // 8  9  10 11
    // 12 13 14 15

    const lines = [
        // Rows
        [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
        // Cols
        [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
        // Diagonals
        [0, 5, 10, 15], [3, 6, 9, 12]
    ];

    const isWin = lines.some(line => line.every(idx => currentCells[idx].stamped));

    if (isWin) {
        winShown = true;
        setTimeout(() => {
            document.getElementById("win-modal").classList.add("active");
            // Optional: Play sound
        }, 300);
    }
}

function resetGame() {
    // Determine current theme from UI text or default
    const currentThemeText = document.getElementById("card-theme").textContent;
    let theme = "NUMBER";
    if (currentThemeText.includes("Fruit")) theme = "FRUIT";
    if (currentThemeText.includes("Animal")) theme = "ANIMAL";
    if (currentThemeText.includes("Custom")) theme = "CUSTOM";

    generateCard(theme);
}

function closeModal() {
    document.getElementById("win-modal").classList.remove("active");
}

// Start
init();
