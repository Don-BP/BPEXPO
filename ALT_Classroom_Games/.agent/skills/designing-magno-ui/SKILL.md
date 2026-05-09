---
name: designing-magno-ui
description: Creates "Magno", a royal/ancient theme with dark red backgrounds and ornate gold borders. Ideal for RPGs, card games, or premium game UIs.
---

# Designing Magno UI

## When to use this skill
- When the user asks for a "Royal", "Ancient", or "Premium" game look.
- When you want high-contrast UIs with deep reds and glowing gold elements.
- For games that need a sophisticated yet high-energy feel (Strategy, RPGs).

## Core Principles
1.  **Maroon & Gold**: Use deep red/maroon (`#2D0A0A`) for backgrounds and vibrant gold (`#FFB300`) for borders and highlights.
2.  **Double Borders**: Elements often look better with multiple nested borders to simulate ornate metal frames.
3.  **Vibrant Fills**: Use neon-like colors (Cyan, Magenta, Lime) for interactive elements like progress bars to make them pop against the dark backgrounds.
4.  **Blocky Typography**: Use chunky, uppercase fonts with drop shadows.

## Component Library (Templates)

### 1. Magno Button
Vibrant gradient buttons with gold rims and glossy highlights.
**Path:** `.agent/skills/designing-magno-ui/resources/MagnoButton.jsx`

### 2. Magno Card
Sophisticated panels with ornate floating headers.
**Path:** `.agent/skills/designing-magno-ui/resources/MagnoCard.jsx`

### 3. Magno Progress Bar
High-glow progress tracks with vibrant liquid fills. Supports `solid` and `pellet` variants.
**Path:** `.agent/skills/designing-magno-ui/resources/MagnoProgressBar.jsx`

## Implementation Guide

### Step 1: Backgrounds
Always use a very dark, slightly warm background to let the gold borders glow.
```css
bg-[#2D0A0A]
```

### Step 2: Borders
A simple gold border creates the premium feel.
```css
border-[3px] border-[#FFB300] shadow-[0_0_10px_rgba(255,179,0,0.3)]
```

### Step 3: Icons
Use circular buttons with simplified white icons for navigation/actions.

## Example Usage

```jsx
import MagnoButton from './MagnoButton';
import MagnoCard from './MagnoCard';
import MagnoProgressBar from './MagnoProgressBar';

<MagnoCard title="OPTIONS">
  <div className="space-y-6">
    <MagnoProgressBar color="purple" variant="pellet" value={75} pelletCount={20} />
    <div className="flex justify-center gap-4">
       <MagnoButton variant="orange">SAVE</MagnoButton>
       <MagnoButton variant="red">CANCEL</MagnoButton>
    </div>
  </div>
</MagnoCard>
```
