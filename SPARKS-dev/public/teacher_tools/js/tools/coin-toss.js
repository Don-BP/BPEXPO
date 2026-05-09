export function initCoinToss() {
    const coinElement = document.getElementById('coin-3d');
    const flipButton = document.getElementById('flip-coin-btn');
    const resultOverlay = document.getElementById('result-overlay');
    const headsCountElement = document.getElementById('heads-count');
    const tailsCountElement = document.getElementById('tails-count');
    const themeSelector = document.getElementById('coin-theme');
    const headsImage = document.getElementById('coin-heads-img');
    const tailsImage = document.getElementById('coin-tails-img');

    // Safety check - if elements don't exist, exit early
    if (!coinElement || !flipButton) return;

    let headsCount = 0;
    let tailsCount = 0;
    let isFlipping = false;
    let fadeTimeout = null;
    let currentTheme = '1';

    // Theme image mapping - Update paths for Teacher Tools if needed, but these look relative
    // NOTE: In BP-Tools paths are 'assets/...'. In Teacher Tools they are also 'assets/...'.
    const themeImages = {
        '1': { heads: 'assets/coin_face/coin_face_1_a.png', tails: 'assets/coin_face/coin_face_1_b.png' },
        '2': { heads: 'assets/coin_face/coin_face_2_a.png', tails: 'assets/coin_face/coin_face_2_b.png' },
        '3': { heads: 'assets/coin_face/coin_face_3_a.png', tails: 'assets/coin_face/coin_face_3_b.png' },
        '4': { heads: 'assets/coin_face/coin_face_4_a.png', tails: 'assets/coin_face/coin_face_4_b.png' }
    };

    // Update coin images when theme changes
    if (themeSelector) {
        themeSelector.addEventListener('change', () => {
            currentTheme = themeSelector.value;
            updateCoinImages();
        });
    }

    // Flip the coin
    flipButton.addEventListener('click', flipCoin);

    function updateCoinImages() {
        if (!themeImages[currentTheme]) return;

        headsImage.src = themeImages[currentTheme].heads;
        tailsImage.src = themeImages[currentTheme].tails;

        // Reset display of images and text
        headsImage.style.display = 'block';
        tailsImage.style.display = 'block';

        const headsText = headsImage.previousElementSibling;
        const tailsText = tailsImage.previousElementSibling;

        if (headsText && headsText.classList.contains('coin-text')) {
            headsText.style.display = 'none';
        }
        if (tailsText && tailsText.classList.contains('coin-text')) {
            tailsText.style.display = 'none';
        }

        // Set up error handlers for images
        headsImage.onerror = function () {
            this.style.display = 'none';
            const textElement = this.previousElementSibling;
            if (textElement && textElement.classList.contains('coin-text')) {
                textElement.style.display = 'block';
            }
        };

        tailsImage.onerror = function () {
            this.style.display = 'none';
            const textElement = this.previousElementSibling;
            if (textElement && textElement.classList.contains('coin-text')) {
                textElement.style.display = 'block';
            }
        };
    }

    function flipCoin() {
        if (isFlipping) return;

        isFlipping = true;
        flipButton.disabled = true;

        // Clear any previous result
        if (fadeTimeout) {
            clearTimeout(fadeTimeout);
            fadeTimeout = null;
        }
        resultOverlay.classList.remove('show');

        // Remove previous animation classes
        coinElement.classList.remove('flipping-heads', 'flipping-tails');

        // Force reflow to restart animation
        void coinElement.offsetWidth;

        // Play coin flip sound
        // In Teacher Tools, utils.js might handle sound differently, or we use the audio element directly
        const coinSound = document.getElementById('coin-flip-sound');
        if (coinSound) {
            coinSound.currentTime = 0;
            coinSound.play().catch(e => console.log("Audio play failed", e));
        }

        // Determine result (true = heads, false = tails)
        const isHeads = Math.random() >= 0.5;

        // Add the specific animation class for the result
        if (isHeads) {
            coinElement.classList.add('flipping-heads');
        } else {
            coinElement.classList.add('flipping-tails');
        }

        // Show result after animation completes
        setTimeout(() => {
            // Update counts and display result
            if (isHeads) {
                headsCount++;
                if (headsCountElement) headsCountElement.textContent = headsCount;
                resultOverlay.textContent = 'HEADS!';
                resultOverlay.style.color = '#d4af37'; // Gold color
            } else {
                tailsCount++;
                if (tailsCountElement) tailsCountElement.textContent = tailsCount;
                resultOverlay.textContent = 'TAILS!';
                resultOverlay.style.color = '#c0c0c0'; // Silver color
            }

            // Show result overlay
            resultOverlay.classList.add('show');

            // Set timeout to fade result
            fadeTimeout = setTimeout(() => {
                resultOverlay.classList.remove('show');
                fadeTimeout = null;
            }, 3000);

            isFlipping = false;
            flipButton.disabled = false;
        }, 1800); // 1.8s matches the 1s + logic delay approx? Wait, animation is 1s in CSS. 1.8s seems safe.
    }

    // Initialize with default theme
    updateCoinImages();
}
