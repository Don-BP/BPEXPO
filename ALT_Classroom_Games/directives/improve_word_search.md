# Directive: Improve Word Search Game

## 1. Objective & Context
- **Goal:** Update the Word Search game to use all available screen space and ensure letters remain lit when words are found.
- **Why:** User request for better visibility and gameplay feedback.
- **Dependencies:** `src/games/WordSearch.jsx`

## 2. Inputs & Resources
- **Required Files:**
    - `d:\ALT_Classroom_Games\src\games\WordSearch.jsx`

## 3. Execution Plan (Layer 3)
*The following scripts must be created in `execution/`*

### Script 1: `execution/improve_word_search.py`
- **Purpose:** 
    1.  Modifies `generateGrid` to store coordinates of placed words in `placedWords` state.
    2.  Updates `render` logic to check if a cell belongs to a found word (using the stored coords) and apply the specific word's color.
    3.  Refactors the CSS layout to be responsive and full-screen:
        -   Container: `h-screen`, `flex-col`.
        -   Game Area: `flex-1`, `w-full`.
        -   Grid: `h-full`, `w-full`, `grid-cols-10`, `grid-rows-10`.
        -   Cells: `w-full`, `h-full`, remove fixed `w-8 h-8`.
- **Inputs:** None
- **Expected Output:** Modified `src/games/WordSearch.jsx`

## 4. Verification Strategy (CRITICAL)
- **Method:** 
    -   Manual: Visual inspection logic via `execution/verify_word_search_structure.py` (checks for flex/grid classes, coordinate storage logic).
    -   Since I cannot physically look at the screen, I will verify the code structure ensures these properties.
- **Success Criteria:**
    -   `placedWords` objects contain a `coords` property.
    -   Grid rendering logic includes a check for `foundWords`.
    -   Grid container has `h-full` (or similar) and flexible sizing.

## 5. Self-Annealing Log
*(Agent will append execution errors and fixes here automatically during the run)*
