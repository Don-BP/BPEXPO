# Art Asset Requirements

This document catalogues all placeholder graphics that need professional design assets.

## Global Assets

### Logo / Branding
- **Brain Power Logo** - Main company logo
  - Format: SVG preferred, PNG fallback
  - Usage: Header navigation, footer
  - Size: Scalable, display at ~150px width

## Game Hub (index.html)

### Game Card Icons
Currently using emojis as placeholders:
- 🌪️ **Tornado Game Icon** - Dynamic tornado graphic
- 🎯 **Jeopardy Icon** - Quiz/target themed icon  
- 🎴 **Karuta Icon** - Japanese card game aesthetic

### Hero Section
- **Background Pattern** - Animated dot grid (currently CSS)
  - Could be replaced with custom illustration
  - Suggestion: Classroom/school themed subtle pattern

## Tornado Game

### Game Elements
- **Tornado Animation** - Currently using emoji 🌪️
  - Need animated tornado sprite or Lottie animation
  - Should spin and look dramatic when revealed
  
- **Grid Square Backgrounds**
  - Current: Solid blue gradient
  - Suggestion: Themed variants (space, ocean, jungle, classroom)

### Buttons & UI
- **Team Score Badges** - Visual indicator for active team
- **Success/Fail Icons** - Currently using ✓ and ✗

## Jeopardy

### Board Design
- **Category Headers** - Professional TV game show style
  - Background graphics for category tiles
  - Border treatments

- **Point Value Display** - Classic gold dollar sign styling
  - Currently: Text-based "$100", "$200", etc.
  - Suggestion: Styled badges or cards

### Themes
- **Daily Double Graphic** (future feature)
- **Buzzer Animation** (future feature)

## Vocabulary Karuta

### Card Design
- **Card Backgrounds** - Currently using emojis
  - Need illustrated or photographic vocabulary cards
  - 12+ vocabulary items with matching images

- **Vocabulary Suggestions** (need custom art):
  - Apple 🍎
  - Book 📚
  - Cat 🐱
  - Dog 🐶
  - Elephant 🐘
  - Fish 🐟
  - Guitar 🎸
  - House 🏠
  - Ice Cream 🍦
  - Juice 🧃
  - Kite 🪁
  - Lemon 🍋

### Audio Button
- **Speaker Icon** - Current: emoji 🔊
  - Suggest: Custom animated speaker icon

## Button Designs

### Primary Actions
- **Play Button** - Large, clickable, vibrant
- **Edit/Teacher Mode Button** - Professional, trustworthy
- **Back Button** - Simple, clear navigation

### States
- Hover effects (currently CSS transform)
- Active/pressed states
- Disabled states

## Recommended Color Palette (For Designer Reference)

Already defined in `style.css`:
- Primary (Coral Red): #FF6B6B
- Secondary (Teal): #4ECDC4
- Accent (Yellow): #FFE66D
- Success (Mint): #95E1D3
- Background: #F7F9FC

## File Naming Convention

Please deliver assets with consistent naming:
- `logo_brainpower.svg`
- `icon_tornado_animated.json` (Lottie)
- `icon_jeopardy.svg`
- `vocab_apple.png`
- `btn_primary_normal.svg`
- etc.

## Asset Specifications

- **Icons/Logos**: SVG format, scalable
- **Animations**: Lottie JSON or GIF
- **Images**: PNG with transparency, 2x resolution for retina
- **Illustrations**: High-contrast, colorful, child-friendly

## Priority Order

1. **High Priority** (needed for MVP):
   - Game card icons (3 total)
   - Tornado animation
   - Karuta vocabulary card images (12 items)

2. **Medium Priority**:
   - Brain Power logo
   - Button state graphics
   - Theme variations for Tornado grid

3. **Low Priority** (future enhancements):
   - Daily Double graphics
   - Additional vocabulary sets
   - Mascot characters
