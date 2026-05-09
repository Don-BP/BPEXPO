# Tango Set Management Walkthrough

## Overview
Replaced the "Send Set" (immediate QR) workflow with a "Save Set" workflow (local save first, share later). This allows users to curate and name their custom sets before sharing them.

## Changes

### 1. New Component: SaveSetModal
- **Location**: `src/modules/tango/components/SaveSetModal.tsx`
- **Purpose**: Provides a UI for naming custom card sets.
- **Features**: Input field validation (must have name), card count display, Cancel/Save actions.

### 2. Refactored TangoPracticeScreen
- **Location**: `src/modules/tango/components/TangoPracticeScreen.tsx`
- **Change**: Replaced `QRCodeCanvas` and "Send Set" logic with `SaveSetModal`.
- **New Flow**:
  1. User clicks "Make Set" → enters Selection Mode.
  2. Users selects cards.
  3. User clicks "Save Set" (was "Send Set").
  4. `SaveSetModal` appears.
  5. On save, data is passed up to `TangoApp`.

### 3. Updated TangoApp
- **Location**: `src/modules/tango/TangoApp.tsx`
- **Additions**:
  - `handleSaveSet`: Saves named sets to `savedSets` state (and localStorage).
  - `handleShareSet`: Generates QR code for *saved* sets only.
  - **Sets Menu**: Added "Share 📤" button to each list item.
  - **QR Modal**: Moved from Practice Screen to App level (Sets Menu context).

### 4. Styling
- **Location**: `src/modules/tango/BPTango.css`
- **Additions**: Styles for `.save-set-modal-content` and related form elements.

## Verification

### User Flow 1: Creating a Set
1. Go to Tango > Start Practice.
2. Click "Make Set".
3. Select 3 cards.
4. Click "Save Set".
5. Enter "My Test Set" in modal.
6. Click Save.
7. Verify alert "Set 'My Test Set' saved successfully!".

### User Flow 2: Sharing a Set
1. Click "Sets" (folder icon) in header.
2. Find "My Test Set".
3. Click "Share 📤".
4. Verify QR modal appears with "My Test Set (3 cards)".
5. Close modal.

### User Flow 3: Import (Existing)
1. Click "Get Set" (camera icon).
2. Scan valid QR.
3. Verify set loads immediately.

## Rollback
To revert, restore `TangoPracticeScreen.tsx` to use internal QR state and remove `onSaveSet` prop usage.
