# Directive: Adjust Word Search Flow

## 1. Objective & Context
- **Goal:** Change game start to immediate random play. Remove initial setup popup.
- **Why:** User request: "I don't want the first thing the users sees is a popup window."
- **Dependencies:** `src/games/WordSearch.jsx`

## 2. Inputs & Resources
- **Required Files:** `src/games/WordSearch.jsx`

## 3. Execution Plan (Layer 3)
*The following script will be created/run:*

### Script 1: `execution/adjust_ws_flow.py`
- **Purpose:** 
    -   Change `isSetup` default state to `false`.
    -   Modify `initGame` to accept an optional `overrideCategory` argument (to handle async state updates).
    -   Add `useEffect` to trigger a random start on mount:
        -   Pick random category from `WORD_LISTS`.
        -   Call `initGame(randomCategory)`.
        -   Call `setCategory(randomCategory)` to sync UI state.
- **Inputs:** None
- **Expected Output:** Modified `WordSearch.jsx`.

## 4. Verification Strategy
- **Method:** `verify_ws_flow.py`
- **Success Criteria:**
    -   `useState(false)` for `isSetup`.
    -   `useEffect` with empty dependency array `[]` (mount trigger).
    -   `initGame` accepting arguments.

## 5. Self-Annealing Log
*(Agent will append execution errors and fixes here automatically during the run)*
