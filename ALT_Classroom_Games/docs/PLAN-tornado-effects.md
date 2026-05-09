# PLAN-tornado-effects

**User Goal:** Improve visuals and effects of the Tornado game.
**Mode:** PLANNING

## 1. Context & Analysis
The current `Tornado.jsx` works functionally but visually it can be more "juicy".
- **Current State:** Framer motion simple fades/scales. Basic gradient backgrounds.
- **Goal:** Add "Game Juice" - smoother animations, particle effects, dramatic events (Tornado trigger), and 3D card flips.

## 2. Technical Approach
We will use **Framer Motion** for complex UI transitions and **canvas-confetti** for particles.

### Core Visual Upgrades
1.  **3D Card Flips**: Replace simple color change with a proper 3D rotation effect using `preserve-3d`.
2.  **Tornado Event**:
    -   Implement a "Screen Shake" effect.
    -   Add a full-screen swirling overlay (CSS or SVG animation) when a tornado hits.
    -   Sound sync (already present, but ensure timing matches visual).
3.  **Victory Effects**:
    -   Confetti blasts on "Bonus" and "Win".
    -   Score counting animation (count up instead of instant change).
4.  **UI Polish**:
    -   Glassmorphism consistency on modals.
    -   Better Team Scoreboard with "Active Turn" spotlight effect.

## 3. Task Breakdown

### Phase 1: Grid & Card Mechanics
- [ ] Refactor `Square` into a sub-component for cleaner code.
- [ ] Implement `Framer Motion` 3D variants for `initial`, `animate`, `exit`.
- [ ] Add "hover" tilt effect for unrevealed cards.

### Phase 2: Special Effects (The "Juice")
- [ ] **Tornado Trigger**: Create a `TornadoOverlay` component that spins and obscures the screen briefly.
- [ ] **Screen Shake**: Add a vibration variant to the main container during penalties/tornadoes.
- [ ] **Particles**: Add `confetti` bursts on specific coordinates (e.g., from the card center).

### Phase 3: UI & Typography
- [ ] Update Typography to use `Outfit` (assuming it's available in project) for a modern feel.
- [ ] Enhance Modal pop-ups with "Elastic" bounce entrances.
- [ ] Improve the "Scoreboard" to look more competitive (e.g., progress bars or larger numbers).

## 4. Verification
- **Visual Check**: Play through a 5x5 grid.
- **Event Check**: Trigger 'Tornado' and verify the dramatic effect.
- **Responsiveness**: Ensure animations work on mobile/tablet sizes.

## 5. Agent Assignment
- **Builder**: `games/Tornado.jsx`, `components/TornadoOverlay.jsx` aiming for "High Premium" feel.
