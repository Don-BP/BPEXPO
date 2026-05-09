# Legacy Iframe Communication Implementation Plan

## Goal Description

Implement secure communication between the BP-Planner-dev Super App and the legacy iframe-embedded applications (Teacher Tools and Classroom Games) to support the Teacher's Toolkit monetization model. This will enable subscription-based unlock coordination and feature gating without modifying the core functionality of the legacy apps.

**Background**: Teacher Tools (`Teacher_tools/`) and Classroom Games (`ALT_Classroom_Games/`) are standalone HTML/JS/CSS applications embedded in iframes. They need to receive unlock status from the parent Super App and request unlocks when needed, but must continue to function independently without breaking existing features.

---

## User Review Required

> [!IMPORTANT]
> **Non-Destructive Principle**: All changes to legacy apps are **additive only**. We add unlock coordination features but never modify existing game/tool logic. If communication fails, apps fall back to free-tier behavior.

> [!WARNING]
> **Testing Strategy**: Both apps must be tested in two modes:
> 1. **Standalone Mode**: Apps run directly (without Super App parent) → Should work as they do now (no unlock features)
> 2. **Embedded Mode**: Apps run in Super App iframe → Unlock features active

> [!CAUTION]
> **URL Parameter Security**: `isPro` parameter is client-side only. Real subscription validation happens in Firestore Security Rules. Never trust the URL param alone for data persistence.

---

## Proposed Changes

### Component 1: Core Communication Protocol

This section defines the shared message protocol and utilities used by both legacy apps.

---

#### [NEW] [public/shared/iframe-bridge.js](file:///e:/bp-labo/BP-Planner-dev/public/shared/iframe-bridge.js)

**Purpose**: Reusable iframe communication library for legacy apps.

**Features**:
- **Parent Detection**: Check if running inside iframe
- **Message Handling**: Send/receive typed messages
- **Unlock State Management**: Track unlock expiry times
- **Fallback Behavior**: Work standalone without parent

**Interface**:
```javascript
class IframeBridge {
  constructor() {
    this.isEmbedded = window.parent !== window;
    this.isPro = false;
    this.unlocks = new Map(); // featureId → expiryTimestamp
    this.listeners = new Map();
  }
  
  init() {
    // Parse URL params
    // Set up message listener
    // Request initial unlock state
  }
  
  requestUnlock(featureId, featureName) {
    // Send REQUEST_UNLOCK to parent
    return new Promise((resolve) => { /* ... */ });
  }
  
  isUnlocked(featureId) {
    if (this.isPro) return true;
    const expiry = this.unlocks.get(featureId);
    return expiry && Date.now() < expiry;
  }
  
  onUnlockGranted(callback) {
    // Register callback for UNLOCK_GRANTED messages
  }
}

// Singleton export
window.iframeBridge = new IframeBridge();
```

**Non-Destructive Guarantee**: If `window.parent` is missing or doesn't respond, all methods return safe defaults (free-tier behavior).

---

### Component 2: Teacher Tools Integration

---

#### [MODIFY] [Teacher_tools/index.html](file:///e:/bp-labo%20-%20Jan%2024th/Teacher_tools/index.html)

**Add Script Import** (before closing `</body>`):
```html
<!-- Monetization Bridge (optional, degrades gracefully) -->
<script src="../shared/iframe-bridge.js"></script>
<script src="js/monetization-adapter.js"></script>
```

**Rationale**: Scripts load after main app is initialized, so they can wrap existing functionality.

---

#### [NEW] [Teacher_tools/js/monetization-adapter.js](file:///e:/bp-labo%20-%20Jan%2024th/Teacher_tools/js/monetization-adapter.js)

**Purpose**: Wrap existing Teacher Tools with unlock gates.

**3 Free Tools** (Always Available):
1. `name_picker`
2. `whats_missing`
3. `bingo_picker`

**Implementation Strategy**:
```javascript
// Wait for DOM ready
document.addEventListener('DOMContentLoaded', () => {
  if (!window.iframeBridge || !window.iframeBridge.isEmbedded) {
    console.log('[Monetization] Running standalone, skip gating');
    return; // Exit gracefully
  }
  
  const bridge = window.iframeBridge;
  bridge.init();
  
  const FREE_TOOLS = ['name_picker', 'whats_missing', 'bingo_picker'];
  const toolButtons = document.querySelectorAll('[data-tool-id]');
  
  toolButtons.forEach(button => {
    const toolId = button.dataset.toolId;
    
    if (FREE_TOOLS.includes(toolId)) {
      return; // Skip free tools
    }
    
    // Add lock icon if not Pro and not unlocked
    if (!bridge.isPro && !bridge.isUnlocked(`tool_${toolId}`)) {
      addLockIcon(button);
      
      const originalClick = button.onclick;
      button.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const unlocked = await bridge.requestUnlock(`tool_${toolId}`, button.textContent);
        if (unlocked) {
          removeLockIcon(button);
          button.onclick = originalClick; // Restore original
          button.click(); // Execute original action
        }
      };
    }
  });
  
  // Banner ad placeholder (setup mode only)
  if (!bridge.isPro) {
    insertBannerAd();
  }
});

function addLockIcon(element) {
  const lock = document.createElement('span');
  lock.className = 'lock-icon';
  lock.textContent = '🔒';
  element.prepend(lock);
  element.classList.add('locked');
}

function removeLockIcon(element) {
  element.querySelector('.lock-icon')?.remove();
  element.classList.remove('locked');
}

function insertBannerAd() {
  const banner = document.createElement('div');
  banner.id = 'tt-banner-ad';
  banner.className = 'banner-ad-placeholder';
  banner.textContent = 'AD PLACEMENT';
  document.body.prepend(banner);
}
```

**Non-Destructive Guarantee**:
- Never modifies existing DOM structure until lock is triggered
- Original `onclick` handlers preserved and restored
- If `iframeBridge` missing, entire script exits early

---

#### [NEW] [Teacher_tools/css/monetization.css](file:///e:/bp-labo%20-%20Jan%2024th/Teacher_tools/css/monetization.css)

**Purpose**: Styles for lock icons and banner ads.

```css
.locked {
  opacity: 0.6;
  filter: grayscale(0.5);
  cursor: not-allowed;
}

.lock-icon {
  display: inline-block;
  margin-right: 8px;
  font-size: 1.2em;
}

.banner-ad-placeholder {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: sans-serif;
  color: #666;
  font-size: 14px;
  border-bottom: 1px solid #ccc;
  z-index: 1000;
}
```

**Import in** `index.html`:
```html
<link rel="stylesheet" href="css/monetization.css">
```

---

### Component 3: Classroom Games Integration

---

#### [MODIFY] [ALT_Classroom_Games/index.html](file:///e:/bp-labo%20-%20Jan%2024th/ALT_Classroom_Games/index.html)

**Add Script Import** (before closing `</body>`):
```html
<!-- Monetization Bridge (optional, degrades gracefully) -->
<script src="../shared/iframe-bridge.js"></script>
<script src="src/monetization-adapter.js"></script>
```

---

#### [NEW] [ALT_Classroom_Games/src/monetization-adapter.js](file:///e:/bp-labo%20-%20Jan%2024th/ALT_Classroom_Games/src/monetization-adapter.js)

**Purpose**: Wrap React app with unlock gates.

**5 Free Games** (Always Available):
1. `bingo`
2. `snakes_and_ladders`
3. `karuta`
4. `card_matching`
5. `mystery_word`

**Implementation Strategy**:
```javascript
// Wait for React app to mount
window.addEventListener('load', () => {
  if (!window.iframeBridge || !window.iframeBridge.isEmbedded) {
    console.log('[Monetization] Running standalone, skip gating');
    return;
  }
  
  const bridge = window.iframeBridge;
  bridge.init();
  
  // Expose to React app
  window.monetization = {
    isPro: bridge.isPro,
    isUnlocked: (gameId) => bridge.isUnlocked(`game_${gameId}`),
    requestUnlock: (gameId, gameName) => bridge.requestUnlock(`game_${gameId}`, gameName)
  };
  
  // Dispatch event for React to listen
  window.dispatchEvent(new CustomEvent('monetizationReady', {
    detail: window.monetization
  }));
  
  // Banner ad (game selection only)
  if (!bridge.isPro) {
    insertBannerAd();
  }
});

function insertBannerAd() {
  // Find game menu container (adjust selector based on actual DOM)
  const menuContainer = document.querySelector('.game-menu') || document.querySelector('#root > div');
  
  if (menuContainer) {
    const banner = document.createElement('div');
    banner.className = 'cg-banner-ad';
    banner.textContent = 'AD PLACEMENT';
    menuContainer.prepend(banner);
  }
}
```

---

#### [MODIFY] [ALT_Classroom_Games/src/App.jsx](file:///e:/bp-labo%20-%20Jan%2024th/ALT_Classroom_Games/src/App.jsx)

**Add Unlock Gate Hook**:
```jsx
import { useState, useEffect } from 'react';

const FREE_GAMES = ['bingo', 'snakes_and_ladders', 'karuta', 'card_matching', 'mystery_word'];

function App() {
  const [monetization, setMonetization] = useState(null);
  
  useEffect(() => {
    // Listen for monetization bridge ready
    const handleMonetization = (e) => {
      setMonetization(e.detail);
    };
    
    window.addEventListener('monetizationReady', handleMonetization);
    
    // Check if already available
    if (window.monetization) {
      setMonetization(window.monetization);
    }
    
    return () => window.removeEventListener('monetizationReady', handleMonetization);
  }, []);
  
  // Pass monetization context to game components
  const isGameLocked = (gameId) => {
    if (!monetization) return false; // Standalone mode
    if (FREE_GAMES.includes(gameId)) return false;
    return !monetization.isPro && !monetization.isUnlocked(gameId);
  };
  
  const handleGameUnlock = async (gameId, gameName) => {
    if (monetization) {
      const unlocked = await monetization.requestUnlock(gameId, gameName);
      if (unlocked) {
        // Trigger re-render
        setMonetization({ ...monetization });
      }
    }
  };
  
  // ... rest of component
}
```

**Non-Destructive Guarantee**:
- If `window.monetization` is `null`, app behaves exactly as before
- No changes to game logic, only gate at selection level

---

#### [NEW] [ALT_Classroom_Games/src/components/GameLockOverlay.jsx](file:///e:/bp-labo%20-%20Jan%2024th/ALT_Classroom_Games/src/components/GameLockOverlay.jsx)

**Purpose**: Reusable lock UI for game cards.

```jsx
import React from 'react';
import './GameLockOverlay.css';

export default function GameLockOverlay({ gameName, onUnlock }) {
  return (
    <div className="game-lock-overlay">
      <div className="lock-content">
        <span className="lock-icon-large">🔒</span>
        <h3>{gameName}</h3>
        <button onClick={onUnlock} className="unlock-btn">
          Watch Ad to Unlock (2h)
        </button>
      </div>
    </div>
  );
}
```

---

### Component 4: Super App Parent Integration

---

#### [MODIFY] [BP-Planner-dev/src/modules/teacher_tools/TeacherToolsApp.tsx](file:///e:/bp-labo/BP-Planner-dev/src/modules/teacher_tools/TeacherToolsApp.tsx)

**Add URL Params and Message Handler**:
```tsx
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import AdComponent from '@/components/monetization/AdComponent';

export default function TeacherToolsApp() {
  const { user } = useAuth();
  const { isPro, unlockFeature, isUnlocked } = useWallet();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [pendingUnlock, setPendingUnlock] = useState<{ featureId: string, featureName: string } | null>(null);
  
  const src = `/teacher_tools/index.html?isPro=${isPro}&uid=${user?.uid || 'guest'}`;
  
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin if needed
      if (event.data.type === 'REQUEST_UNLOCK') {
        const { featureId, featureName } = event.data;
        setPendingUnlock({ featureId, featureName });
        setShowAdModal(true);
      }
      
      if (event.data.type === 'REQUEST_UNLOCK_STATE') {
        // Send current unlock state to iframe
        sendUnlockState();
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isPro, isUnlocked]);
  
  const sendUnlockState = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;
    
    // Get all unlocks from useWallet
    const unlocks = {}; // Populate from wallet hook
    
    iframe.contentWindow.postMessage({
      type: 'UNLOCK_STATE',
      isPro,
      unlocks
    }, '*');
  };
  
  const handleAdComplete = () => {
    if (!pendingUnlock) return;
    
    const { featureId } = pendingUnlock;
    unlockFeature(featureId, 2 * 60 * 60 * 1000); // 2 hours
    
    // Notify iframe
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'UNLOCK_GRANTED',
        featureId,
        expiresAt: Date.now() + (2 * 60 * 60 * 1000)
      }, '*');
    }
    
    setShowAdModal(false);
    setPendingUnlock(null);
  };
  
  return (
    <>
      <iframe
        ref={iframeRef}
        src={src}
        className="w-full h-full border-0"
        title="Teacher Tools"
        onLoad={sendUnlockState} // Send state on load
      />
      
      {showAdModal && (
        <AdComponent
          type="rewarded"
          placement="teacher_tools_unlock"
          onComplete={handleAdComplete}
          onClose={() => setShowAdModal(false)}
        />
      )}
    </>
  );
}
```

---

#### [NEW] [BP-Planner-dev/src/modules/classroom_games/ClassroomGamesApp.tsx](file:///e:/bp-labo/BP-Planner-dev/src/modules/classroom_games/ClassroomGamesApp.tsx)

**Purpose**: Same pattern as `TeacherToolsApp.tsx` but for Classroom Games.

```tsx
// Identical structure to TeacherToolsApp.tsx
// Replace src path: `/classroom_games/index.html?isPro=${isPro}&uid=${user?.uid}`
```

---

#### [MODIFY] [BP-Planner-dev/src/App.tsx](file:///e:/bp-labo/BP-Planner-dev/src/App.tsx)

**Add Route for Classroom Games**:
```tsx
import ClassroomGamesApp from '@/modules/classroom_games/ClassroomGamesApp';

// In routes:
<Route path="/classroom-games/*" element={<ClassroomGamesApp />} />
```

---

### Component 5: Testing Utilities

---

#### [NEW] [BP-Planner-dev/public/shared/iframe-bridge-test.html](file:///e:/bp-labo/BP-Planner-dev/public/shared/iframe-bridge-test.html)

**Purpose**: Standalone test page for iframe bridge.

```html
<!DOCTYPE html>
<html>
<head>
  <title>Iframe Bridge Test</title>
</head>
<body>
  <h1>Iframe Bridge Tester</h1>
  <div id="status"></div>
  <button id="test-unlock">Test Unlock Request</button>
  
  <script src="iframe-bridge.js"></script>
  <script>
    const bridge = window.iframeBridge;
    bridge.init();
    
    document.getElementById('status').textContent = 
      `Embedded: ${bridge.isEmbedded}, Pro: ${bridge.isPro}`;
    
    document.getElementById('test-unlock').onclick = async () => {
      const result = await bridge.requestUnlock('test_feature', 'Test Feature');
      alert(`Unlock result: ${result}`);
    };
  </script>
</body>
</html>
```

---

## Verification Plan

### Automated Tests

**Unit Tests**: iframe-bridge.js
```bash
# Create Jest tests for:
npm test -- iframe-bridge.test.js
```
- [ ] `isUnlocked()` returns correct expiry status
- [ ] URL param parsing works
- [ ] Message serialization/deserialization
- [ ] Fallback behavior when not embedded

---

### Manual Verification

#### Standalone Mode (Teacher Tools)
- [ ] Open `Teacher_tools/index.html` directly in browser
- [ ] All tools are clickable (no locks)
- [ ] No console errors about missing parent
- [ ] Banner ad does not appear

#### Embedded Mode (Teacher Tools) - FREE user
- [ ] Open Super App, navigate to Teacher Tools
- [ ] Verify 3 free tools (Name Picker, What's Missing, Bingo) are unlocked
- [ ] Click locked tool (e.g., Dice Roller)
- [ ] Ad modal appears in parent window
- [ ] Complete ad → Tool unlocks
- [ ] Refresh iframe → Tool remains unlocked (2h timer)
- [ ] Banner ad appears at top

#### Embedded Mode (Teacher Tools) - PRO user
- [ ] Toggle tier to PRO in Firestore
- [ ] Reload Super App
- [ ] Verify all tools unlocked immediately
- [ ] No banner ads
- [ ] No lock icons

#### Standalone Mode (Classroom Games)
- [ ] Open `ALT_Classroom_Games/dist/index.html` directly
- [ ] All games are playable
- [ ] No console errors
- [ ] Banner ad does not appear

#### Embedded Mode (Classroom Games) - FREE user
- [ ] Open Super App, navigate to Classroom Games
- [ ] Verify 5 free games are unlocked
- [ ] Click locked game (e.g., Tornado Game)
- [ ] Ad modal appears
- [ ] Complete ad → Game unlocks for 2h
- [ ] Verify other games still locked (individual timers)
- [ ] Banner ad appears on game selection screen

#### Embedded Mode (Classroom Games) - PRO user
- [ ] Toggle tier to PRO
- [ ] All games unlocked
- [ ] No banner ads
- [ ] No lock overlays

#### Cross-Module State Sync
- [ ] Unlock a tool in Teacher Tools
- [ ] Navigate to Classroom Games
- [ ] Unlock a game
- [ ] Navigate back to Teacher Tools
- [ ] Verify tool is still unlocked (state persists in useWallet)

#### Error Handling
- [ ] Parent window closes unexpectedly → App continues working (standalone fallback)
- [ ] Invalid message format → Logged and ignored, no crash
- [ ] Ad completion fails → User can retry unlock

---

## Implementation Priority Order

| Priority | Component | Agent | Estimated Time |
|----------|-----------|-------|----------------|
| **P0** | Shared iframe-bridge.js | `backend-specialist` | 1-2 hours |
| **P1** | Teacher Tools adapter | `frontend-specialist` | 2-3 hours |
| **P2** | Classroom Games adapter | `frontend-specialist` | 2-3 hours |
| **P3** | Super App parent handlers | `frontend-specialist` | 1-2 hours |
| **P4** | Testing utilities | `test-engineer` | 1 hour |
| **P5** | Manual verification | `qa-engineer` | 2-3 hours |

**Total Estimated Time**: 9-14 hours

---

## Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Breaking existing tools/games** | HIGH | Non-destructive adapter pattern, early exit if standalone |
| **Message origin spoofing** | MEDIUM | Verify `event.origin` in production, enforce Firestore rules |
| **Timer drift (client-side)** | LOW | Sync with server timestamp on critical actions |
| **URL param tampering** | LOW | Never trust `isPro` param for data writes, only UI hints |
| **Legacy code conflicts** | MEDIUM | Namespace all new code (`iframeBridge`, `monetization` globals) |

---

## Task Breakdown

### Task 1: Create Shared Bridge
**Agent**: `backend-specialist`  
**Skill**: `clean-code`  
**Dependencies**: None  
**INPUT**: None  
**OUTPUT**: `public/shared/iframe-bridge.js` with IframeBridge class  
**VERIFY**: Run `iframe-bridge-test.html` in browser console, no errors

---

### Task 2: Teacher Tools Adapter
**Agent**: `frontend-specialist`  
**Skill**: `frontend-design`  
**Dependencies**: Task 1  
**INPUT**: Existing `Teacher_tools/index.html` and `js/script.js`  
**OUTPUT**: `monetization-adapter.js` and `monetization.css`  
**VERIFY**: Open standalone → No locks. Open in mock parent → Locks appear.

---

### Task 3: Classroom Games Adapter
**Agent**: `frontend-specialist`  
**Skill**: `react-patterns`  
**Dependencies**: Task 1  
**INPUT**: Existing `ALT_Classroom_Games/src/App.jsx`  
**OUTPUT**: `monetization-adapter.js`, `GameLockOverlay.jsx`  
**VERIFY**: Free games unlocked, premium games show overlay

---

### Task 4: Super App Integration
**Agent**: `frontend-specialist`  
**Skill**: `react-patterns`  
**Dependencies**: Task 1, 2, 3  
**INPUT**: Existing `useWallet.ts` hook  
**OUTPUT**: Updated `TeacherToolsApp.tsx`, new `ClassroomGamesApp.tsx`  
**VERIFY**: Message flow works: iframe → parent → AdComponent → unlock granted

---

### Task 5: End-to-End Testing
**Agent**: `test-engineer`  
**Skill**: `webapp-testing`  
**Dependencies**: Task 4  
**INPUT**: All implemented components  
**OUTPUT**: Passing manual verification checklist  
**VERIFY**: All checklist items marked ✅

---

## Definition of Done

- [ ] `iframe-bridge.js` works in both embedded and standalone modes
- [ ] Teacher Tools: 3 free tools accessible, others lockable
- [ ] Classroom Games: 5 free games accessible, others lockable
- [ ] Super App sends unlock state via postMessage
- [ ] Ad completion unlocks features for 2 hours
- [ ] PRO users see no locks or ads
- [ ] No regressions in existing tool/game functionality
- [ ] All manual verification checklist items pass
- [ ] No console errors in standalone or embedded modes

---

## ✅ Resolved Questions

### 1. Tool ID Mapping (Teacher Tools)

**Solution**: Use existing `id` attributes on `.tool-card` elements.

Each tool card has an ID like `id="lesson-menu-tool"`, `id="name-picker-tool"`, etc. We'll:
- Extract tool ID from the card ID (e.g., `lesson-menu-tool` → `lesson_menu`)
- Store IDs as `tool_{toolId}` in Firestore (e.g., `tool_lesson_menu`)
- No need to add new `data-tool-id` attributes

**Core Tool IDs** (3 Free Tools):
1. `name_picker` (from `name-picker-tool`)
2. `whats_missing` (from `whats-missing-tool`)
3. `bingo` (from `bingo-tool`)

---

### 2. Game ID Mapping (Classroom Games)

**Solution**: Use React Router path segments.

Games are routed as `/game/{gameId}` (e.g., `/game/tornado`, `/game/karuta`). We'll:
- Match route paths to game IDs
- Store as `game_{gameId}` in Firestore (e.g., `game_tornado`)

**Free Game IDs** (5 Games):
1. `bingo` (route: `/game/bingo`)
2. `snakes-ladders` (route: `/game/snakes-ladders`)
3. `karuta` (route: `/game/karuta`)
4. `memory-match` (route: `/game/memory-match`)
5. `hangman` (route: `/game/hangman`)

---

### 3. Build Process

**Confirmed**: Yes, changes to `ALT_Classroom_Games/src/` require rebuild.

**Workflow**:
1. Edit files in `ALT_Classroom_Games/src/`
2. Run `npm run build` in `ALT_Classroom_Games/`
3. Built files copy to `BP-Planner-dev/public/classroom_games/`
4. Refresh Super App to see changes

---

### 4. Ad Integration

**Decision**: Use AdMob.

We'll integrate Google AdMob SDK for both rewarded and banner ads. Implementation follows React Native pattern with Web fallback for development.

---

### 5. Firestore Security Rules & PIP Reset

**Decision**: Server-side storage + automatic PIP reset.

- **Unlock State**: Store in `users/{uid}/unlocks` with expiry timestamps
- **Security Rules**: Client can only write to own user doc, verify subscription tier
- **Monthly PIP Reset**: Automatic via Cloud Function triggered on subscription renewal

---
