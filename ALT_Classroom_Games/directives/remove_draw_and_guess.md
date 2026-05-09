# Directive: Remove Draw and Guess Game

## 1. Objective & Context
- **Goal:** Remove the "Draw and Guess" game from the application.
- **Why:** User request.
- **Dependencies:** `src/App.jsx`, `src/pages/Home.jsx`, `src/games/DrawAndGuess.jsx`

## 2. Inputs & Resources
- **Required Files:**
    - `d:\ALT_Classroom_Games\src\games\DrawAndGuess.jsx`
    - `d:\ALT_Classroom_Games\src\App.jsx`
    - `d:\ALT_Classroom_Games\src\pages\Home.jsx`
- **Required Secrets:** None

## 3. Execution Plan (Layer 3)
*The following scripts must be created in `execution/`*

### Script 1: `execution/remove_draw_game_v2.py`
- **Purpose:** Deletes the game file and removes references from `App.jsx` and `Home.jsx`.
- **Inputs:** None
- **Expected Output:**
    - Deletion of `src/games/DrawAndGuess.jsx`
    - Modified `src/App.jsx` (removed import and route)
    - Modified `src/pages/Home.jsx` (removed from GAMES array)

## 4. Verification Strategy (CRITICAL)
- **Method:** Run `execution/verify_removal.py`.
- **Success Criteria:**
    - `DrawAndGuess.jsx` does not exist.
    - `App.jsx` does not contain "DrawAndGuess".
    - `Home.jsx` does not contain "Draw & Guess" or "pictionary" config.
