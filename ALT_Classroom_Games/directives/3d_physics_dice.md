# Directive: 3D Physics Dice Implementation

## 1. Objective
- **Goal:** Replace the 2D dice in Snakes and Ladders with a high-quality 3D dice that uses physics (rolling, bouncing).
- **Why:** User request for "high quality and beautiful" visuals.
- **Dependencies:** `src/games/SnakesAndLadders.jsx`, `package.json`

## 2. Inputs
- **Files:** `src/games/SnakesAndLadders.jsx`
- **Context:** Project uses React/Vite. Need to add Three.js ecosystem.

## 3. Execution Plan (Layer 3)
*Scripts to be created in `execution/`*

### Script A: `execution/install_3d_deps.py`
- **Purpose:** Install necessary 3D libraries.
- **Inputs:** None
- **Command:** `npm install three @types/three @react-three/fiber @react-three/drei @react-three/cannon`

### Script B: `execution/implement_3d_dice.py`
- **Purpose:** 
    1. Create `src/components/ThreeDice.jsx`:
        - A Canvas component.
        - Physics world (gravity).
        - A Dice mesh with textures/materials (or procedural dots).
        - Logic to apply impulse/torque on "roll".
        - Callback when velocity ~= 0 to report result.
    2. Modify `src/games/SnakesAndLadders.jsx`:
        - Import `ThreeDice`.
        - Replace the button/2D display with the 3D canvas.
- **Inputs:** None

## 4. Verification (Mandatory)
- [ ] **Method:** `python execution/verify_browser.py` (Visual check required mostly, but can check for Canvas element).
- [ ] **Criteria:** Canvas element exists for dice.

## 5. Self-Annealing Log
*(Append errors here)*
