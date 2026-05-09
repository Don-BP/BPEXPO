# Directive: Refine Word Search Layout

## 1. Objective & Context
- **Goal:** Fix the layout so the sidebar is pinned to the left (removing `max-w-7xl` constraint) and the grid uses all available space (removing `aspect-square` auto-shrink issues).
- **Why:** User feedback: "board is stupidly small", "sidebar not on left edge".
- **Dependencies:** `src/games/WordSearch.jsx`

## 2. Inputs & Resources
- **Required Files:** `src/games/WordSearch.jsx`

## 3. Execution Plan (Layer 3)
*The following script will be created/run:*

### Script 1: `execution/refine_ws_layout.py`
- **Purpose:** 
    -   Rewrite the render method of `WordSearch.jsx` mostly to change the container classes.
    -   Container: Remove `max-w-7xl mx-auto p-4 lg:p-6`. Make it `w-full flex-row overflow-hidden`.
    -   Sidebar: Remove `rounded-3xl` and `margin`. Make it `w-64 h-full shrink-0 border-r`.
    -   Grid Container: `flex-1 relative p-4`.
    -   Grid: `h-full w-auto aspect-square max-w-full mx-auto`. (Prioritize height for landscape).
- **Inputs:** None
- **Expected Output:** Modified `WordSearch.jsx` with full-width split layout.

## 4. Verification Strategy
- **Method:** `verify_layout_refinement.py` checks for the absence of `max-w-7xl` and presence of sidebar specific classes.
- **Success Criteria:**
    -   `max-w-7xl` NOT found in main container.
    -   `w-64` found in sidebar.
    -   `h-full w-auto aspect-square` found in grid.

## 5. Self-Annealing Log
*(Agent will append execution errors and fixes here automatically during the run)*
