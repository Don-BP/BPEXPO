# Directive: Fix Word Search Layout Clipping

## 1. Objective & Context
- **Goal:** Resolve the issue where the right edge of the Word Search grid is cut off.
- **Why:** User reported UI bug.
- **Dependencies:** `src/games/WordSearch.jsx`

## 2. Inputs & Resources
- **Required Files:** `src/games/WordSearch.jsx`

## 3. Execution Plan (Layer 3)
*The following script will be created/run:*

### Script 1: `execution/fix_ws_layout.py`
- **Purpose:** 
    -   Locate the grid container in `WordSearch.jsx`.
    -   Replace the CSS classes causing overflow (`w-full h-full aspect-square max-h-full`) with a more robust safe-square set (`max-w-full max-h-full aspect-square mx-auto h-full`).
- **Inputs:** None
- **Expected Output:** Modified `WordSearch.jsx` with corrected CSS.

## 4. Verification Strategy
- **Method:** `verify_layout_classes.py` checks for the presence of the new classes and absence of the problematic combination.
- **Success Criteria:** File contains `max-w-full max-h-full aspect-square` and does NOT contain `w-full h-full aspect-square` (the specific overflow causing combo).
