# Directive: Refine Hangman Layout

## 1. Objective & Context
- **Goal:** Overhaul the Hangman UI to use the full screen. Increase the size of the Snowman, Mistake Hearts, Word Blanks, and Keyboard.
- **Why:** User feedback: "not using all available screen space", "buttons too small", "snowman too small".
- **Dependencies:** `src/games/Hangman.jsx`

## 2. Inputs & Resources
- **Required Files:** `src/games/Hangman.jsx`

## 3. Execution Plan (Layer 3)
*The following script will be created/run:*

### Script 1: `execution/refine_hangman_layout.py`
- **Purpose:** 
    -   Rewrite `Hangman.jsx` render logic.
    -   Container: `h-screen w-full flex flex-col`.
    -   Split View (Desktop): Snowman (Left/Top), Word+Keyboard (Right/Bottom).
    -   Snowman: Increase SVG container size (e.g., `h-64` or `flex-1`).
    -   Word Blanks: Increase text size (`text-6xl`), padding, and border.
    -   Keyboard: Use `flex-wrap` with `flex-1` buttons or larger grid.
    -   Mistakes: Increase Heart icon size (`size={40}`).
- **Inputs:** None
- **Expected Output:** Modified `Hangman.jsx` with responsive full-screen layout.

## 4. Verification Strategy
- **Method:** `verify_hangman_layout.py`
- **Success Criteria:**
    -   `h-screen` in main container.
    -   Absence of `max-w-2xl` (previous constraint).
    -   Larger tailwind classes (e.g., `text-6xl`, `h-64`).

## 5. Self-Annealing Log
*(Agent will append execution errors and fixes here automatically during the run)*
