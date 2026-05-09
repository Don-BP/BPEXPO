# Tango Set Management Implementation Plan

## Goal
Replace the "Send Set" QR-based workflow with a "Save Set" feature that allows users to name and save custom card sets locally, view them in a Sets menu, and optionally share them via QR code with other users.

---

## Current State Analysis

### Existing Implementation
- **TangoPracticeScreen.tsx**: Contains "Make Set" button that toggles selection mode
- **Selection Mode**: Users can select individual cards across all display modes
- **QR Generation**: Currently generates QR on "Send Set" click with date-based naming
- **Scanner**: TangoApp.tsx has QR scanner that imports sets via "Get Set" button
- **Storage**: Sets are saved in localStorage as `bp_tango_saved_sets`
- **Sets Menu**: Exists in TangoApp.tsx with Play, Rename, Delete actions

### Key Files
- `BP-Planner-dev/src/modules/tango/TangoApp.tsx` (270 lines)
- `BP-Planner-dev/src/modules/tango/components/TangoPracticeScreen.tsx` (452 lines)
- `BP-Planner-dev/src/modules/tango/components/TangoSetupScreen.tsx` (224 lines)

---

## Proposed Changes

### 1. Save Set Modal (NEW Component)
**File**: `BP-Planner-dev/src/modules/tango/components/SaveSetModal.tsx`

**Purpose**: Replace immediate QR generation with a naming dialog

**Features**:
- Input field for set name
- Display count of selected cards
- "Save" button to save to localStorage
- "Cancel" button to return to selection mode
- Simple, clean modal UI matching existing Tango design

**Data Flow**:
```
User clicks "Make Set" → Select cards → Click "Save Set" 
→ SaveSetModal opens → User enters name → Save to localStorage
→ Close modal → Exit selection mode → Show success feedback
```

---

### 2. Share Set Feature (MODIFY Practice Screen)

**Add "Share Set" button to Sets Menu** in TangoApp.tsx

**Location**: Inside saved sets list item actions

**Functionality**:
- Already-saved sets can be shared via QR
- Opens QR modal with set data
- Other users scan to import

**UI Update**:
```jsx
<div className="set-actions">
  <button onClick={() => loadSetForPractice(set)}>Play ▶</button>
  <button onClick={() => handleShareSet(set)}>Share 📤</button>
  <button onClick={() => handleRenameSet(set.id)}>✏️</button>
  <button onClick={() => handleDeleteSet(set.id)}>🗑</button>
</div>
```

---

### 3. Refactor Practice Screen Logic

**Current**: "Send Set" button generates QR immediately
**New**: "Save Set" button opens SaveSetModal

**Button Label Changes**:
- `isSelectionMode === false`: "Make Set"
- `isSelectionMode === true`: "Save Set" (was "Send Set 🚀")

**Remove**:
- Direct QR generation from Practice Screen
- `showQRModal` and `qrData` state from TangoPracticeScreen

**Add**:
- `showSaveModal` state
- `handleSaveSet` function to open modal

---

### 4. Update QR Modal Location

**Move QR Generation** from TangoPracticeScreen to TangoApp (Sets Menu)

**Reason**: QR sharing should only happen from saved sets, not during active practice

**New Flow**:
```
Sets Menu → Click "Share Set" → Generate QR with set data → Display modal
```

---

## Task Breakdown

### Phase 1: Create Save Set Modal Component
- [ ] **Task 1.1**: Create `SaveSetModal.tsx` component with name input and action buttons
  - **Verify**: Component renders with input field and buttons
  
- [ ] **Task 1.2**: Add modal styling to `BPTango.css` matching existing modal design
  - **Verify**: Modal appears centered with proper backdrop

- [ ] **Task 1.3**: Implement save logic that accepts selected word IDs and name
  - **Verify**: Console logs set object before saving

### Phase 2: Refactor Practice Screen
- [ ] **Task 2.1**: Replace "Send Set 🚀" button text with "Save Set"
  - **Verify**: Button text changes when in selection mode

- [ ] **Task 2.2**: Remove `showQRModal`, `qrData` state and QR modal JSX from TangoPracticeScreen
  - **Verify**: No TypeScript errors, file compiles

- [ ] **Task 2.3**: Add `showSaveModal` state and import SaveSetModal component
  - **Verify**: Component imports successfully

- [ ] **Task 2.4**: Update `handleToggleMakeSet` to open SaveSetModal instead of generating QR
  - **Verify**: Modal opens when "Save Set" clicked with selections

- [ ] **Task 2.5**: Create `handleSaveSet` callback that receives name, saves to parent state
  - **Verify**: `console.log` shows set being passed to TangoApp

### Phase 3: Update TangoApp Set Management
- [ ] **Task 3.1**: Modify `handleSaveSet` in TangoApp to accept set name and word IDs from Practice Screen
  - **Verify**: Sets save to localStorage with custom names

- [ ] **Task 3.2**: Add "Share Set" button to each saved set item in Sets Menu
  - **Verify**: Button appears in set actions row

- [ ] **Task 3.3**: Create `handleShareSet` function that generates QR data and shows modal
  - **Verify**: Clicking Share opens QR modal

- [ ] **Task 3.4**: Move QR modal JSX from Practice Screen to Sets Menu section in TangoApp
  - **Verify**: QR modal displays in Sets Menu context

- [ ] **Task 3.5**: Update QR modal to display set name and card count
  - **Verify**: Modal shows "Share [Set Name] - X cards"

### Phase 4: Connect Practice Screen to App State
- [ ] **Task 4.1**: Pass `onSaveSet` callback from TangoApp to TangoPracticeScreen via props
  - **Verify**: TypeScript types updated, no errors

- [ ] **Task 4.2**: Call `onSaveSet` from SaveSetModal when user clicks Save
  - **Verify**: Set appears in Sets Menu after saving

- [ ] **Task 4.3**: Clear selection mode and selected cards after successful save
  - **Verify**: Selection highlights removed, "Make Set" button restored

- [ ] **Task 4.4**: Show success feedback (toast/alert) after save completion
  - **Verify**: User sees "Set '[name]' saved successfully" message

### Phase 5: Testing & Refinement
- [ ] **Task 5.1**: Test full workflow: Make Set → Select cards → Save Set → Name → Verify in Sets Menu
  - **Verify**: End-to-end flow works without errors

- [ ] **Task 5.2**: Test Share Set: Open saved set → Click Share → Scan QR → Verify import
  - **Verify**: QR code contains correct data, scanning works

- [ ] **Task 5.3**: Test edge cases: Save with no name, duplicate names, empty selections
  - **Verify**: Appropriate error messages shown

- [ ] **Task 5.4**: Verify localStorage persistence across page refreshes
  - **Verify**: Saved sets remain after browser refresh

- [ ] **Task 5.5**: Check responsive design on mobile viewport
  - **Verify**: Modals and buttons work on small screens

---

## Technical Details

### New Component Interface

```typescript
// SaveSetModal.tsx
interface SaveSetModalProps {
  isOpen: boolean;
  selectedWordIds: number[];
  onSave: (setName: string) => void;
  onCancel: () => void;
}
```

### TangoPracticeScreen Props Update

```typescript
interface TangoPracticeScreenProps {
  settings: {
    grade: number;
    categories: string[];
    words: any[];
  };
  onEndPractice: () => void;
  onSaveSet: (setName: string, wordIds: number[]) => void; // NEW
}
```

### LocalStorage Data Structure (No Change)

```json
{
  "bp_tango_saved_sets": [
    {
      "id": 1706234567890,
      "name": "Week 1 Vocabulary",
      "wordIds": [1, 5, 12, 34],
      "date": "1/28/2026"
    }
  ]
}
```

---

## Success Criteria

### Must Have
- [x] "Make Set" button toggles selection mode
- [ ] "Save Set" button opens naming modal (not QR)
- [ ] User can name their set before saving
- [ ] Sets appear in Sets Menu after saving
- [ ] "Share Set" button available for saved sets only
- [ ] QR code generated only when sharing from Sets Menu
- [ ] Other users can scan QR to import shared sets

### Nice to Have
- [ ] Default name suggestion based on selected categories
- [ ] Duplicate name validation
- [ ] Set preview before saving
- [ ] Edit set contents after saving

---

## Verification Checklist

### Before Implementation
- [ ] Read all 3 affected files completely
- [ ] Understand current state management flow
- [ ] Identify all props that need updating

### During Implementation
- [ ] TypeScript types updated for all new props
- [ ] No `any` types introduced
- [ ] Console.log statements for debugging added
- [ ] CSS classes follow existing naming conventions

### After Implementation
- [ ] Run `npm run dev` - no compile errors
- [ ] Test save workflow 3 times with different names
- [ ] Test share workflow - scan QR successfully
- [ ] Test edge cases (empty name, no selections)
- [ ] Check browser console - no errors
- [ ] Verify localStorage data structure correct

---

## Dependencies

### Component Dependencies
```
TangoApp (Parent)
  ├── TangoSetupScreen
  ├── TangoPracticeScreen
  │     └── SaveSetModal (NEW)
  └── Sets Menu (with Share QR Modal)
```

### Implementation Order
1. SaveSetModal (independent, can be built first)
2. TangoPracticeScreen refactor (uses SaveSetModal)
3. TangoApp updates (receives data from Practice Screen)
4. QR modal relocation (moves to Sets Menu)
5. Integration testing

---

## Rollback Strategy

### If Issues Arise
1. **Revert commits**: Use Git to revert to working state
2. **Fallback flow**: Keep old "Send Set" as secondary option
3. **Data safety**: localStorage structure unchanged - no migration needed

### Safe Points
- After Phase 1: SaveSetModal exists but not integrated
- After Phase 2: Practice screen updated but not connected to App
- After Phase 3: App ready to receive saves but not called yet
- After Phase 4: Full integration complete

---

## Notes

- **No breaking changes**: Existing QR scanner and saved sets continue working
- **Backward compatible**: Old QR codes (with date-based names) still scannable
- **State management**: All set data remains in TangoApp parent component
- **UI consistency**: Use existing modal patterns and CSS classes
- **Mobile-first**: Ensure touch targets are adequate (min 44px)

---

## Timeline Estimate

- **Phase 1**: ~15 minutes (create modal component)
- **Phase 2**: ~20 minutes (refactor practice screen)
- **Phase 3**: ~25 minutes (update app state management)
- **Phase 4**: ~15 minutes (connect components)
- **Phase 5**: ~25 minutes (testing and refinement)

**Total**: ~100 minutes (1.5-2 hours)
