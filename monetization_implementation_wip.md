# Monetization Implementation Plan (WIP)

## Goal Description
Implement the "Teacher's Toolkit" monetization model across the BP-Super App ecosystem, including:
- **PIPs** (Points for In-app Purchases) for AI generation (Planner only) - **ALREADY IMPLEMENTED**
- **Feature Gating** with ad-based temporary unlocks (Teacher Tools, Expo, Tango, Classroom Games)
- **Data Persistence** restrictions ("Amnesia" mode for free users)
- **Subscription Benefits** (no ads, permanent unlocks, cloud storage)

## Current State Analysis

### ✅ Already Implemented
- **Firebase Auth** with OAuth login
- **PIP System** (`UserProfile.pips`, `useWallet` hook)
- **Subscription Tiers** (FREE, PRO, TEACHER_PLUS)
- **Firestore User Profiles** (`users/{uid}`)

### 🔄 Needs Implementation
- Feature gating across all modules
- Ad integration (placeholder → real AdMob)
- Unlock timer system (2-hour temporary unlocks)
- Data persistence restrictions
- Banner ad placement

---

## User Review Required

> [!IMPORTANT]
> **Legacy App Communication**: Teacher Tools and Classroom Games are embedded in iframes. They must support `postMessage` or URL params for unlock coordination.

> [!WARNING]
> **Ad Integration Deferred**: Using placeholder `AdComponent` for now. Real ad network SDK (AdMob/Google Ad Manager) integration happens in Phase 2.

> [!NOTE]
> **PIP Currency**: The system already uses "PIPs" instead of "Brain Coins" for AI generation credits.

---

## Proposed Changes

### Phase 1: Core Subscription Context Enhancement

---

#### [MODIFY] [useWallet.ts](file:///e:/bp-labo/BP-Planner-dev/src/hooks/useWallet.ts)

**Add Unlock Tracking**:
```typescript
export const useWallet = () => {
    // ... existing code ...
    const [unlocks, setUnlocks] = useState<Map<string, number>>(new Map());
    
    // Add methods:
    // - unlockFeature(id, durationMs)
    // - isUnlocked(id)
    // - checkExpiry()
    
    return {
        pips: profile?.pips ?? 0,
        tier: profile?.subscriptionTier ?? 'FREE',
        isPro: profile?.subscriptionTier === 'PRO' || profile?.subscriptionTier === 'TEACHER_PLUS',
        unlocks,
        unlockFeature,
        isUnlocked,
        loading
    };
};
```

**Persistence**: Store unlocks in Firestore at `users/{uid}/unlocks` (map of featureId → expiryTimestamp).

---

#### [NEW] [AdComponent.tsx](file:///e:/bp-labo/BP-Planner-dev/src/components/monetization/AdComponent.tsx)

**Props**:
- `type: 'banner' | 'rewarded'`
- `placement: string` (for analytics)
- `onComplete?: () => void` (for rewarded ads)

**Behavior**:
- **Banner**: Sticky 300x50 gray placeholder "AD PLACEMENT"
- **Rewarded**: Modal with fake video player (30s countdown) → Calls `onComplete`

---

#### [NEW] [LockOverlay.tsx](file:///e:/bp-labo/BP-Planner-dev/src/components/monetization/LockOverlay.tsx)

Reusable UI component for locked items.

**Props**:
- `isLocked: boolean`
- `featureId: string`
- `featureName: string`
- `onUnlock: () => void`

**UI**: Semi-transparent overlay with lock icon + "Watch Ad to Unlock (2h)" button.

---

### Phase 2: Feature Gating - BP-Expo (Discovery Module)

---

#### [MODIFY] [WorldMap.tsx](file:///e:/bp-labo/BP-Planner-dev/src/modules/discovery/components/WorldMap.tsx)

**Starter 5 Countries** (Always Free):
1. Japan (`jp`)
2. USA (`us`)
3. Australia (`au`)
4. Canada (`ca`)
5. UK (`gb`)

**Implementation**:
```typescript
const STARTER_COUNTRIES = ['jp', 'us', 'au', 'ca', 'gb'];
const { isPro, isUnlocked, unlockFeature } = useWallet();

const handleCountryClick = (countryId: string) => {
  if (!isPro && !STARTER_COUNTRIES.includes(countryId) && !isUnlocked(`expo_${countryId}`)) {
    showUnlockModal(countryId);
    return;
  }
  // Navigate to country
};
```

**Ad Flow**:
1. User clicks locked country
2. `AdComponent` (rewarded) appears
3. On completion → `unlockFeature('expo_' + countryId, 2 * 3600000)` (2 hours)
4. Navigate to country page

---

### Phase 3: Feature Gating - BP-Tango

---

#### [MODIFY] [TangoApp.tsx](file:///e:/bp-labo/BP-Planner-dev/src/modules/tango/TangoApp.tsx)

**Standard Categories** (Always Free):
- Numbers, Colors, Fruits, Animals, Body Parts

**Premium Categories** (Each has individual 2-hour unlock):
- Food (`tango_cat_food`)
- Clothes (`tango_cat_clothes`)
- Weather (`tango_cat_weather`)
- Sports (`tango_cat_sports`)
- Jobs (`tango_cat_jobs`)
- etc.

> [!IMPORTANT]
> Each category has its own 2-hour timer. Unlocking "Food" does NOT unlock "Clothes".

**Custom Sets** (QR Scanner):
- Free users: Disable "Get Set" button
- Show tooltip: "Custom Sets require Pro subscription"
- Pro users: Full access to scan, save, rename, delete

**Data Persistence (Amnesia)**:
```typescript
const saveSet = (set: any) => {
  if (!isPro) {
    console.warn('Save disabled for free users');
    // Keep in-memory only (lost on refresh)
    return;
  }
  // Save to Firestore
};
```

---

### Phase 4: Feature Gating - BP-Planner (AI Generation)

---

#### [MODIFY] [PlannerApp.tsx](file:///e:/bp-labo/BP-Planner-dev/src/modules/planner/PlannerApp.tsx)

**PIP Logic** (Already Implemented - Just Verify):
- Before AI generation, check `pips >= 1`
- If insufficient, show "Earn PIP" modal (watch ad)
- Deduct 1 PIP after generation

**Monthly Refresh** (PRO users):
- On first app launch each month, reset `pips = 250`
- Store `lastPipRefresh` in Firestore

**Export History**:
- Free users: Disable "View Past Exports" button
- Pro users: Full access to PDF history

---

### Phase 5: Feature Gating - Teacher Tools (Legacy Iframe)

---

#### [MODIFY] [TeacherToolsApp.tsx](file:///e:/bp-labo/BP-Planner-dev/src/modules/teacher_tools/TeacherToolsApp.tsx)

**URL Params**:
```typescript
const { isPro, user } = useAuth();
const src = `/teacher_tools/index.html?isPro=${isPro}&uid=${user?.uid}`;
```

**PostMessage Bridge**:
```typescript
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'REQUEST_UNLOCK') {
      // Show AdComponent (rewarded)
      // On complete → Send UNLOCK_GRANTED
    }
  };
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

---

#### [MODIFY] [public/teacher_tools/js/script.js](file:///e:/bp-labo/BP-Planner-dev/public/teacher_tools/js/script.js)

**3 Essential Tools** (Always Free):
1. **Name Picker**
2. **What's Missing**
3. **Bingo Picker**

**Premium Tools** (Lock for free users):
- Dice Roller, Coin Flip, Timer, Buzzer, Scoreboard, etc.

**Banner Ad Placement**:
- Show banner at top of setup screens (NOT during active tool use → "Classroom Safety")

**Implementation**:
```javascript
const urlParams = new URLSearchParams(window.location.search);
const isPro = urlParams.get('isPro') === 'true';
const ESSENTIAL_TOOLS = ['name_picker', 'whats_missing', 'bingo_picker'];

if (!isPro && !ESSENTIAL_TOOLS.includes(toolId)) {
  showLockIcon();
  toolButton.onclick = () => {
    parent.postMessage({ type: 'REQUEST_UNLOCK', featureId: toolId }, '*');
  };
}

window.addEventListener('message', (event) => {
  if (event.data.type === 'UNLOCK_GRANTED') {
    unlockTool(event.data.featureId, event.data.expiresAt);
  }
});
```

---

### Phase 6: Feature Gating - Classroom Games (Legacy Iframe)

---

#### [NEW] [ClassroomGamesApp.tsx](file:///e:/bp-labo/BP-Planner-dev/src/modules/classroom_games/ClassroomGamesApp.tsx)

Create wrapper component similar to `TeacherToolsApp.tsx`.

---

#### [MODIFY] [App.tsx](file:///e:/bp-labo/BP-Planner-dev/src/App.tsx)

Add route for Classroom Games:
```typescript
<Route path="/classroom-games/*" element={<ClassroomGamesApp />} />
```

---

#### [MODIFY] [public/classroom_games/src/App.jsx](file:///e:/bp-labo/BP-Planner-dev/public/classroom_games/...)

**5 Free Games** (Always Available):
1. **Bingo**
2. **Snakes and Ladders**
3. **Karuta**
4. **Card Matching**
5. **Mystery Word**

**Premium Games** (Individual 2-hour unlocks):
- Tornado Game, Monster Quiz, etc.

> [!NOTE]
> Each game has its own 2-hour timer. Unlocking "Tornado Game" does NOT unlock "Monster Quiz".

**Implementation**:
```javascript
const FREE_GAMES = ['bingo', 'snakes_and_ladders', 'karuta', 'card_matching', 'mystery_word'];

if (!isPro && !FREE_GAMES.includes(gameId) && !isUnlocked(gameId)) {
  showLockOverlay();
  unlockButton.onclick = () => {
    parent.postMessage({ type: 'REQUEST_UNLOCK', featureId: `game_${gameId}` }, '*');
  };
}
```

---

### Phase 7: Banner Ad Placement Strategy

**Where Ads Appear (Free Users Only)**:

| Module | Placement | Type | Timing |
|--------|-----------|------|--------|
| **Teacher Tools** | Top of setup screen | Banner | Setup phase only |
| **Classroom Games** | Top of game selection | Banner | Menu only |
| **Tango** | Bottom of setup screen | Banner | Setup phase only |
| **Expo** | None (preserve immersion) | - | - |
| **Planner** | None (preserve focus) | - | - |

**Classroom Safety Rule**: Never show ads during active gameplay/tool usage. Only in setup/menu phases.

---

### Phase 8: Data Persistence ("Amnesia" Mode)

**Free User Restrictions**:
- Cannot save:
  - Tool configurations (class rosters, lucky draw lists)
  - Tango custom sets (in-memory only)
  - Game progress/settings

**Pro User Benefits**:
- Cloud storage via Firestore:
  - `users/{uid}/toolData`
  - `users/{uid}/tangoSets`
  - `users/{uid}/gameProgress`

**Implementation Pattern**:
```typescript
const saveData = async (key: string, data: any) => {
  if (!isPro) {
    console.warn('Save disabled for free users');
    return;
  }
  await setDoc(doc(db, `users/${uid}/${key}`), data);
};
```

---

## Verification Plan

### Manual Verification Checklist

#### Subscription State Toggle
- [ ] Toggle tier in Firestore Console (FREE → PRO)
- [ ] Verify all locks disappear across modules
- [ ] Verify banner ads disappear
- [ ] Verify data persistence enabled

#### Ad Flow - Expo
- [ ] Click locked country (e.g., France)
- [ ] "Watch Ad" modal appears
- [ ] Simulate ad completion
- [ ] Country unlocks, navigation succeeds
- [ ] Refresh page → Country remains unlocked
- [ ] Wait 2h → Verify re-locks

#### Ad Flow - Teacher Tools
- [ ] Click locked tool (e.g., Dice Roller)
- [ ] AdComponent appears in parent window
- [ ] Simulate ad → Tool unlocks
- [ ] Verify persistence across refresh
- [ ] Wait 2h → Verify re-locks

#### Ad Flow - Classroom Games
- [ ] Click locked game (e.g., Tornado Game)
- [ ] AdComponent appears
- [ ] Simulate ad → Game unlocks
- [ ] Verify individual unlock (other games still locked)
- [ ] Wait 2h → Verify re-locks

#### Tango Category Unlocks
- [ ] Click premium category (e.g., "Food")
- [ ] Watch ad → Category unlocks
- [ ] Verify "Clothes" still locked (individual timers)
- [ ] Refresh → Verify "Food" remains unlocked
- [ ] Wait 2h → Verify "Food" re-locks

#### PIPs
- [ ] Verify existing PIP system works
- [ ] Attempt AI generation with 0 PIPs
- [ ] Watch ad → PIP earned
- [ ] Generation proceeds

#### Data Persistence
- [ ] (FREE user) Enter class roster in Teacher Tools
- [ ] Refresh page → Data lost
- [ ] Toggle to PRO → Re-enter data
- [ ] Refresh page → Data persists

#### Banner Ads (Free Users)
- [ ] Verify banner appears in Teacher Tools menu
- [ ] Start tool → Banner disappears
- [ ] Return to menu → Banner reappears

---

## Project Structure Clarification

**Main Super App:** `BP-Planner-dev/` 

**Active Modules:**
- **React Modules** (in `src/modules/`):
  - `planner` - Lesson planning with AI (PIP-gated)
  - `tango` - Flashcard practice (category gating)
  - `discovery` - World exploration (country gating)
  
- **Legacy Iframe Apps** (in `public/`):
  - `teacher_tools` - Classroom utilities (tool gating)
  - `classroom_games` - Educational games (game gating)

**Removed/Ignore:**
- ❌ `public/tools` - Old version, replaced by `teacher_tools`
- ❌ Root folders (`bp-tools`, `bpecho-dev`, `bp-pay`, etc.) - Legacy source folders from before refactoring

---

## Outstanding Questions

1. **Classroom Games Built Files**: Verify the correct game list in the production build (`public/classroom_games/assets/`)
2. **Ad Network Choice**: AdMob vs Google Ad Manager? (AdMob recommended for mobile/cross-platform)
3. **Firestore Rules**: Need to define security rules for `users/{uid}/unlocks`, `toolData`, etc.
4. **Subscription Validation**: Apple/Google receipt validation backend needed?
5. **Monthly PIP Reset**: Should this be automatic (Cloud Function) or client-side check?
