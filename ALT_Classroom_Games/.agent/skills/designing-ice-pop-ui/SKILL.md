---
name: designing-ice-pop-ui
description: Creates "Ice Pop", glossy, casual mobile-game style UI components using pure CSS/Tailwind. Use for games needing a fresh, blue, "frozen" or clean aesthetic.
---

# Designing Ice Pop UI

## When to use this skill
- When the user asks for "Glossy Blue", "Frozen", or "Casual Game" visuals.
- When the user wants "Ice" buttons, rounded icons, or polished progress bars.
- When creating clean, friendly interfaces (Educational games, Puzzle games).
- Primary aesthetic: Cyan/Sky Blue, Rounded Corners, Strong White Gloss.

## Core Principles
1.  **High Gloss**: Top half of every element has a white semi-transparent overlay (`bg-white/60`).
2.  **Light Rims**: Borders are often lighter than the fill (`border-cyan-200` on blue button) or white.
3.  **Deep Shadows**: Use solid offset shadows (`shadow-[0_6px_0_#...]`) to create thickness without realistic shading.
4.  **Cool Palette**: Dominant colors are Sky Blue, Cyan, Teal, with warm accents (Orange/Pink) for interaction.

## Component Library (Templates)

You can find ready-to-use templates in the `resources/` directory of this skill.

### 1. Ice Button
A glossy, rounded button with a thick "3D" bottom lip.
**Path:** `.agent/skills/designing-ice-pop-ui/resources/IceButton.jsx`

### 2. Ice Card
A panel container (Beige or Blue) with a thick blue border and inner glow.
**Path:** `.agent/skills/designing-ice-pop-ui/resources/IceCard.jsx`

### 3. Ice Progress Bar
A glossy pill-shaped progress bar with an icon badge on the left.
**Path:** `.agent/skills/designing-ice-pop-ui/resources/IceProgressBar.jsx`

## Implementation Guide

To implement this style in a new component:

### Step 1: Defines Colors
Core "Ice" Palette:
1.  **Main**: `#4FC3F7` (Sky Blue)
2.  **Shadow**: `#0288D1` (Dark Azure)
3.  **Highlight**: `#E1F5FE` (Light Blue)

### Step 2: Apply "Ice Gloss"
The signature "Ice Pop" look comes from the top-half shine:
```jsx
<div className="absolute top-0 left-0 w-full h-[45%] bg-gradient-to-b from-white/60 to-transparent rounded-t-[inherit] pointer-events-none" />
```

### Step 3: Typography
Use rounded, chunky fonts if possible.
Always apply a drop shadow or text stroke to white text on colored backgrounds.
```css
text-white drop-shadow-md
```

## Example Usage

```jsx
import IceButton from './IceButton';
import IceCard from './IceCard';

<IceCard title="LEVEL COMPLETE">
  <div className="flex flex-col items-center gap-4">
    <h2 className="text-3xl text-cyan-600 font-black">GREAT JOB!</h2>
    <div className="flex gap-4">
        <IceButton variant="blue">REPLAY</IceButton>
        <IceButton variant="green">NEXT</IceButton>
    </div>
  </div>
</IceCard>
```
