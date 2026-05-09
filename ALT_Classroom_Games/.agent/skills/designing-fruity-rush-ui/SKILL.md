---
name: designing-fruity-rush-ui
description: Creates "Fruity Rush", candy-crush style UI components. Use for match-3 games, casual mobile games, or high-energy kid interfaces. Features gold borders, heavy gloss, and vibrant fruit colors.
---

# Designing Fruity Rush UI

## When to use this skill
- When the user refers to "Candy Style", "Match-3 Style", or "Fruit Game" visuals.
- When the user wants "Gold Borders", "Green/Pink Gradients", or "Jelly" buttons.
- Primary aesthetic: Green/Pink/Orange, Gold Rims, High Gloss, Rounded/Chunky shapes.

## Core Principles
1.  **Gold Borders**: Almost every element has a `#FDD835` (Yellow/Gold) border or rim.
2.  **Juicy Gradients**: 
    - Green: `#8BC34A` -> `#33691E`
    - Pink: `#EC407A` -> `#880E4F`
3.  **Highlights**: Strong white highlights on the top 40% of elements to simulate glass/jelly.
4.  **Organic Shapes**: Prefer `rounded-full` or very soft `rounded-3xl`. Avoid sharp corners.

## Component Library (Templates)

You can find ready-to-use templates in the `resources/` directory of this skill.

### 1. Fruit Button
A jelly-like button with a gold rim and deep shadow.
**Path:** `.agent/skills/designing-fruity-rush-ui/resources/FruitButton.jsx`

### 2. Fruit Card
A heavy panel with a gold frame, often used with a blue ribbon header.
**Path:** `.agent/skills/designing-fruity-rush-ui/resources/FruitCard.jsx`

### 3. Fruit Progress Bar
A hollow track with a liquid fill, often paired with an icon badge.
**Path:** `.agent/skills/designing-fruity-rush-ui/resources/FruitProgressBar.jsx`

## Implementation Guide

To implement this style:

### Step 1: Defines Colors
Core Palette:
- **Gold (Border)**: `#FDD835`
- **Deep Shadow**: `#1B5E20` (Green) or `#880E4F` (Pink)
- **Shine**: White `opacity-70`

### Step 2: Apply the "Jelly" Gloss
```jsx
/* The Shine */
<div className="absolute top-1 left-1/2 -translate-x-1/2 w-[90%] h-[40%] bg-gradient-to-b from-white/70 to-transparent rounded-[inherit] pointer-events-none" />
```

### Step 3: Typography
Use `font-black` (800/900 weight).
Text always needs a **Drop Shadow** to pop against vibrant backgrounds.

## Example Usage

```jsx
import FruitButton from './FruitButton';
import FruitCard from './FruitCard';

<FruitCard title="LEVEL COMPLETE" stars={3}>
   <div className="flex justify-center gap-4 mt-8">
       <FruitButton variant="green" size="lg">NEXT</FruitButton>
       <FruitButton variant="pink" size="md">RETRY</FruitButton>
   </div>
</FruitCard>
```
