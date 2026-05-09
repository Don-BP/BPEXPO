# Directive: Refine Sentence Mixer

## 1. Objective & Context
- **Goal:**
    1.  Maximize screen usage (remove width constraints, increase sizes).
    2.  Add a "NEXT ROUND" button that appears after a correct answer.
- **Why:** User request for better visibility and flow.
- **Dependencies:** `src/games/SentenceScramble.jsx`

## 2. Inputs & Resources
- **Required Files:** `src/games/SentenceScramble.jsx`

## 3. Execution Plan (Layer 3)
*The following script will be created/run:*

### Script 1: `execution/refine_sentence_mixer.py`
- **Purpose:** 
    -   Rewrite `SentenceScramble.jsx`.
    -   **Layout**:
        -   Main Container: `h-screen w-full flex flex-col`.
        -   Game Area: `flex-1 w-full flex flex-col`.
        -   Answer Area: `flex-1` (top half), large font (`text-3xl+`), flex wrap centered.
        -   Word Bank: `flex-1` (bottom half), large font.
    -   **Logic**:
        -   Modify `checkAnswer`: Keep current logic.
        -   Render Logic: If `status === 'correct'`, show "NEXT SENTENCE" button instead of "CHECK".
        -   "NEXT SENTENCE" button maps to `initGame`.
- **Inputs:** None
- **Expected Output:** Modified `SentenceScramble.jsx`.

## 4. Verification Strategy
- **Method:** `verify_sentence_mixer.py`
- **Success Criteria:**
    -   `h-screen` container.
    -   `NEXT SENTENCE` button text exists in code.
    -   `text-3xl` (or larger) classes for words.

## 5. Self-Annealing Log
*(Agent will append execution errors and fixes here automatically during the run)*
