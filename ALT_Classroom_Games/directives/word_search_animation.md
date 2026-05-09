# Directive: Word Search Start Animation

## 1. Objective & Context
- **Goal:** Implement a "Start" button that triggers a wave animation across the grid (top-left to bottom-right), visually randomizing letters, and *then* starts the timer.
- **Why:** User request for visual flair and specific timer behavior.
- **Dependencies:** `src/games/WordSearch.jsx`

## 2. Inputs & Resources
- **Required Files:** `src/games/WordSearch.jsx`

## 3. Execution Plan (Layer 3)
*The following script will be created/run:*

### Script 1: `execution/implement_ws_animation.py`
- **Purpose:** 
    -   Introduce `gameStatus` state: `'idle'`, `'animating'`, `'playing'`, `'won'`.
    -   On mount, generate grid but set status to `'idle'`.
    -   Add "START GAME" overlay (visible when `'idle'`).
    -   On Start Click:
        -   Set status `'animating'`.
        -   Regenerate the grid (to ensure randomization happens *now*).
        -   Trigger Frame Motion animation on cells.
    -   Animation Details:
        -   Wave effect using `custom={r + c}` delay.
        -   Cells pop (scale up) and flash color.
        -   Total duration ~1.5s.
    -   After Animation:
        -   Set status `'playing'`.
        -   Start Timer.
- **Inputs:** None
- **Expected Output:** Modified `WordSearch.jsx`.

## 4. Verification Strategy
- **Method:** `verify_ws_animation_code.py`
- **Success Criteria:**
    -   `gameStatus` checks for `'idle'` and `'animating'`.
    -   `framer-motion` variants present with `custom` delay logic.
    -   Timer logic wrapped in `status === 'playing'` check.
    -   Grid regeneration logic inside start handler.

## 5. Self-Annealing Log
*(Agent will append execution errors and fixes here automatically during the run)*
