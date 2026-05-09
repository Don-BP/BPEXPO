---
name: designing-juicy-ui
description: Creates "Juicy", high-energy, mobile-game style UI components using pure CSS/Tailwind. Use for games or apps needing a fun, polished, gloss-3D aesthetic.
---

# Designing Juicy UI

## When to use this skill
- When the user asks for "Mobile Game Style" or "Candy Match Style" visuals.
- When the user wants "Glossy" buttons, "Wood" panels, or "Ribbon" headers.
- When creating high-energy, kid-friendly interfaces.
- When you want 3D effects (pressable buttons) without using image assets.

## Core Principles
1.  **CSS > Images**: Use heavy `box-shadow` (inset and outset) and linear gradients to simulate depth and texture. Avoid loading heavy PNGs if possible.
2.  **Exaggerated Tactility**: Buttons must have a deep "bottom border" (`border-b-4`) to look 3D, and `active:translate-y` to physically press down.
3.  **Vibrant Palettes**: Use saturation > 80%. No dull grays. Shadows are darker versions of the main color, not black.
4.  **Rounded Everything**: `rounded-xl` or `rounded-2xl` is the standard. No sharp corners.

## Component Library (Templates)

You can find ready-to-use templates in the `resources/` directory of this skill.

### 1. Glossy Button
A 3D "pressable" button with inset shine and text shadow.
**Path:** `.agent/skills/designing-juicy-ui/resources/GlossyButton.jsx`

### 2. Glossy Card
A panel container (Wood or Beige) with an internal border to look like a game window.
**Path:** `.agent/skills/designing-juicy-ui/resources/GlossyCard.jsx`

### 3. Ribbon Header
A decorative, folded ribbon that sits on top of cards.
**Path:** `.agent/skills/designing-juicy-ui/resources/RibbonHeader.jsx`

## Implementation Guide

To implement this style in a new component:

### Step 1: Defines Colors
Always define a palette with at least 3 shades for each element:
1.  **Main/Light**: Top gradient color (e.g., `#88EB1F`)
2.  **Base/Mid**: Bottom gradient color (e.g., `#45C01A`)
3.  **Shadow/Dark**: Border and Shadow color (e.g., `#2D8512`)

### Step 2: Apply "Gloss"
Add an inset shadow or a pseudo-element gradient to create the plastic shine.
```css
/* Tailwind Arbitrary Value Example */
shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]
```

### Step 3: Add Interaction
Make it feel clicky.
```css
transition-all duration-75
active:translate-y-1 
active:border-b-0 
active:shadow-none
```

## Example Usage

```jsx
import GlossyButton from './GlossyButton';
import GlossyCard from './GlossyCard';

// A complete "Level Finished" popup
<GlossyCard>
  <RibbonHeader text="VICTORY!" color="yellow" />
  <div className="text-center p-4">
    <h1 className="text-3xl text-yellow-500 mb-4">Score: 1000</h1>
    <GlossyButton variant="green" onClick={nextLevel}>Next Level</GlossyButton>
  </div>
</GlossyCard>
```
