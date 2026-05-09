// Draw & Guess Logic

const canvas = document.getElementById("draw-canvas");
const ctx = canvas.getContext("2d");
const wordEl = document.getElementById("secret-word"); // Renamed from secretWordEl

// Word Bank
const DEFAULT_WORDS = [ // Renamed to DEFAULT_WORDS
    "Apple", "Ball", "Cat", "Dog", "Egg", "Fish", "Ghost", "House", "Ice", "Juice",
    "Kite", "Lion", "Moon", "Nose", "Orange", "Pig", "Queen", "Robot", "Sun", "Tree",
    "Umbrella", "Van", "Water", "Box", "Yo-yo", "Zebra", "Book", "Car", "Door", "Eye"
];

let wordPool = [...DEFAULT_WORDS]; // Initialize wordPool with default words

// Check for Custom Words
const customPictionary = localStorage.getItem('pictionary_custom_words');
if (customPictionary) {
    try {
        const parsed = JSON.parse(customPictionary);
        if (Array.isArray(parsed) && parsed.length > 0) {
            wordPool = parsed; // Use custom words if found and valid
        }
    } catch (e) {
        console.error("Error parsing custom pictionary words from localStorage:", e);
    }
}

// State
let currentWord = ""; // New state variable
let isDrawing = false;
let brushColor = "black"; // Renamed from currentColor
let brushSize = 5; // Renamed from lineWidth
let lastX = 0;
let lastY = 0;

function init() {
    setupCanvas(); // Renamed from resizeCanvas
    window.addEventListener("resize", setupCanvas); // Renamed from resizeCanvas

    // Mouse Events
    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDraw);
    canvas.addEventListener("mouseout", stopDraw);

    // Touch Events
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", stopDraw);

    // Colors
    document.querySelectorAll(".color-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            // UI
            document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            // Logic
            currentColor = btn.getAttribute("data-color");
            lineWidth = 5; // Reset eraser size
        });
    });

    newWord();
}

function resizeCanvas() {
    // Make canvas buffer match display size for sharp rendering
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Retain settings
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

// Mouse Handlers
function startDraw(e) {
    isDrawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
}

function draw(e) {
    if (!isDrawing) return;
    const pos = getPos(e);

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastX = pos.x;
    lastY = pos.y;
}

function stopDraw() {
    isDrawing = false;
}

// Touch Handlers
function handleTouchStart(e) {
    if (e.touches.length > 1) return; // Allow pinch zoom etc if needed, but usually prevented
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function handleTouchMove(e) {
    if (e.touches.length > 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

// Game Logic
function nextWord() {
    let pool = DEFAULT_WORDS; // Changed from WORDS to DEFAULT_WORDS

    // Check Custom Words at runtime
    const custom = localStorage.getItem('pictionary_custom_words');
    if (custom) {
        try {
            const parsed = JSON.parse(custom);
            if (Array.isArray(parsed) && parsed.length > 0) pool = parsed;
        } catch (e) { }
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    currentWord = pool[randomIndex];

    // UI
    wordEl.classList.add("blur");
    wordEl.textContent = currentWord;

    // Clear canvas for new round
    clearCanvas();
}

function toggleWord() {
    wordEl.classList.toggle("blur"); // Changed from secretWordEl to wordEl
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function setEraser() {
    currentColor = "white"; // Or match bg color
    lineWidth = 20; // Bigger for eraser

    document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
}

init();
