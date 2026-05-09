// Spin & Speak Logic

const canvas = document.getElementById("wheel-canvas");
const ctx = canvas.getContext("2d");

const spinBtn = document.getElementById("spin-btn");

// Segments (Default)
const DEFAULT_SEGMENTS = [
    "Speak 1 Min", "Free Point", "Lose Point", "Dance!",
    "Question?", "Double Pts", "Sing Song", "Group High-5"
];

let segments = [...DEFAULT_SEGMENTS];

// Check Custom Segments
const customWheel = localStorage.getItem('wheel_custom_words');
if (customWheel) {
    try {
        const parsed = JSON.parse(customWheel);
        if (Array.isArray(parsed) && parsed.length >= 2) {
            segments = parsed;
        }
    } catch (e) { }
}

const colors = ["#FF5733", "#33FF57", "#3357FF", "#F3FF33", "#FF33F3", "#33FFF3", "#FF8C33", "#8C33FF"];

let startAngle = 0;
let arc = Math.PI * 2 / segments.length;
let spinTimeout = null;
let spinAngleStart = 10;
let spinTime = 0;
let spinTimeTotal = 0;
let isSpinning = false;
let ctxWidth, ctxHeight; // Dynamic size

function init() {
    resizeCanvas();
    window.addEventListener("resize", () => {
        resizeCanvas();
        drawRouletteWheel();
    });

    // document.getElementById("close-modal").addEventListener("click", closeModal);
    drawRouletteWheel();
}

function resizeCanvas() {
    ctxWidth = canvas.width = window.innerWidth * 0.8;
    ctxHeight = canvas.height = window.innerHeight * 0.8;
    // Ensure the wheel is always a circle, limited by the smaller dimension
    const minDim = Math.min(ctxWidth, ctxHeight);
    canvas.width = minDim;
    canvas.height = minDim;
}

function drawRouletteWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.font = 'bold 24px Fredoka';

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = (Math.min(canvas.width, canvas.height) / 2) - 10; // Padding

    for (let i = 0; i < segments.length; i++) {
        const angle = startAngle + i * arc;

        // Slice
        // Use cyclic colors
        ctx.fillStyle = colors[i % colors.length];

        ctx.beginPath();
        ctx.arc(cx, cy, r, angle, angle + arc, false);
        ctx.arc(cx, cy, 0, angle + arc, angle, true);
        ctx.fill();
        ctx.stroke();

        // Text
        ctx.save();
        ctx.fillStyle = "white"; // White text looks better on dark/vibrant colors
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 4;

        ctx.translate(cx + Math.cos(angle + arc / 2) * (r - 70), cy + Math.sin(angle + arc / 2) * (r - 70));
        ctx.rotate(angle + arc / 2 + Math.PI / 2);

        const text = segments[i];
        // Truncate if too long (simple check)
        const displayText = text.length > 15 ? text.substring(0, 12) + "..." : text;

        ctx.fillText(displayText, -ctx.measureText(displayText).width / 2, 0);
        ctx.restore();
    }
}

function rotateWheel() {
    spinTime += 30;
    if (spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
    }
    const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    startAngle += (spinAngle * Math.PI / 180);
    drawRouletteWheel();
    spinTimeout = requestAnimationFrame(rotateWheel);
}

function stopRotateWheel() {
    cancelAnimationFrame(spinTimeout);
    isSpinning = false;
    document.getElementById("spin-btn").disabled = false;

    // Determine winner
    const degrees = startAngle * 180 / Math.PI + 90;
    const arcd = arc * 180 / Math.PI;
    const index = Math.floor((360 - degrees % 360) / arcd);

    showResult(segments[index]);
}

function easeOut(t, b, c, d) {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
}

function spin() {
    if (isSpinning) return;
    isSpinning = true;
    document.getElementById("spin-btn").disabled = true;

    // Calc new arc based on current segments length (in case it changed? no, it's static during game)
    arc = Math.PI * 2 / segments.length;

    spinAngleStart = Math.random() * 10 + 10;
    spinTime = 0;
    spinTimeTotal = Math.random() * 3000 + 4000 * 1; // 4-7 seconds
    rotateWheel();
}

function showResult(text) {
    const modal = document.getElementById("task-modal");
    const textEl = document.getElementById("task-text");
    const ptsEl = document.getElementById("task-points");

    textEl.textContent = text;
    ptsEl.textContent = "";
    // Could add simple logic: if text is number, show as points?
    // For now, simple is safe.

    modal.classList.add("active");

    // Confetti effect (optional but nice)
    // createConfetti(); 
}

function closeModal() {
    document.getElementById("task-modal").classList.remove("active");
}

document.getElementById("spin-btn").addEventListener("click", spin);

// Init
init();
