# Directive: Word Search V2 Features

## 1. Objective & Context
- **Goal:** Upgrade Word Search with a Timer, Word Count Selector (Max 15), and Expanded Categories with random selection logic.
- **Why:** User request to make the game more customizable and challenging.
- **Dependencies:** `src/games/WordSearch.jsx`

## 2. Inputs & Resources
- **Required Files:** `src/games/WordSearch.jsx`
- **New Categories:**
    - Animals
    - Fruit
    - Colors & Shapes (Merged)
    - Stationery (School)
    - Food
    - Sports
    - Instruments
    - Verbs

## 3. Execution Plan (Layer 3)
*The following script will be created/run:*

### Script 1: `execution/upgrade_word_search.py`
- **Purpose:** 
    -   Replace `WORD_LISTS` with a huge dictionary (~20+ words per category).
    -   Add State: `timer` (elapsed seconds), `wordCount` (default 5, max 15), `isSetup` (bool, default true).
    -   Logic:
        -   `initGame`: Selects `wordCount` random words from `WORD_LISTS[category]`. Sets `startTime`. Starts `setInterval`.
        -   `useEffect` for Timer: Updates every second if game is active.
        -   `checkSelection`: usage of `clearInterval` on win.
    -   UI:
        -   Add "Setup/Pause" Overlay or Panel:
            -   Category Dropdown.
            -   Word Count Slider/Input (1-15).
            -   Big "START" button.
        -   Add Timer Display (e.g., "00:45") in the Header or Sidebar.
- **Inputs:** None
- **Expected Output:** Significantly updated `WordSearch.jsx`.

## 4. Verification Strategy
- **Method:** `verify_word_search_features.py`
- **Success Criteria:**
    -   `WORD_LISTS` contains "ANIMALS", "SPORTS", "VERBS".
    -   `timer` state exists.
    -   `wordCount` state exists.
    -   `initGame` logic includes sampling (e.g., `sort(() => 0.5 - Math.random())`).

## 5. Self-Annealing Log
*(Agent will append execution errors and fixes here automatically during the run)*
