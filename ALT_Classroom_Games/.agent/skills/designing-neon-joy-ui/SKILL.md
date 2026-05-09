---
name: designing-neon-joy-ui
description: Creates a "Candy/Neon" design system with vibrant gradients, glowing effects, and rounded pill shapes. Perfect for high-energy, modern game UIs.
---

# Designing NeonJoy UI

## When to use this skill
- When the user asks for "Neon", "Candy", "Pop", or "Vibrant" styles.
- When you need a modern, high-energy look distinct from the "Wood/Glossy" aesthetic.
- For games that require a "clean" but colorful interface with glows and rounded corners.

## Core Principles
1.  **Vibrant Gradients**: Use bright, high-saturation gradients (Blue/Cyan, Pink/Rose, Yellow/Orange).
2.  **Pill Shapes**: `rounded-full` or large `rounded-3xl` border radius.
3.  **Inner Glows**: Use white/transparent gradients overlaid on top of buttons/cards to create a "plastic" or "glass" shine.
4.  **Squishy Interaction**: Buttons should press down (`translate-y`) and lose their shadow when clicked.

## Component Library (Templates)

You can find ready-to-use templates in the `resources/` directory of this skill.

### 1. Neon Button
A pill-shaped button with a solid candy color, lighter border, and inner shine.
**Path:** `.agent/skills/designing-neon-joy-ui/resources/NeonButton.jsx`

### 2. Neon Card
A panel container (Blue, Purple, Dark) with a thick lighter border and shadow.
**Path:** `.agent/skills/designing-neon-joy-ui/resources/NeonCard.jsx`

### 3. Neon Icon
Circular or square containers for icons with gradient borders and fills.
**Path:** `.agent/skills/designing-neon-joy-ui/resources/NeonIcon.jsx`

### 4. Neon Progress Bar
Rounded progress bars with optional stripes and an "Add" button.
**Path:** `.agent/skills/designing-neon-joy-ui/resources/NeonProgressBar.jsx`

## Implementation Guide

To implement this style manually:

### Step 1: Candy Colors
Use specific hex codes for that "Candy" look:
- **Blue**: `bg-[#2885FF] border-[#8DC3FF]`
- **Pink**: `bg-[#E943D5] border-[#FF99F5]`
- **Yellow**: `bg-[#FBC02D] border-[#FFF59D]`

### Step 2: The Shine
Add a white gradient overlay to the top half of the element.
```jsx
<div className="absolute top-1 left-2 right-2 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-full pointer-events-none" />
```

### Step 3: The Shadow
Use a solid offset shadow for depth.
```css
shadow-[0_6px_0_#DARKER_SHADE]
```

## Example Usage

```jsx
import NeonButton from './NeonButton';
import NeonCard from './NeonCard';

<NeonCard variant="blue">
    <h1 className="text-white text-2xl font-black uppercase">Level Complete</h1>
    <NeonButton variant="orange" size="lg" onClick={handleNext}>Next Level</NeonButton>
</NeonCard>
```
