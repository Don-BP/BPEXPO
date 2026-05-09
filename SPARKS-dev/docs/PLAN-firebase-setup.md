# Plan: Firebase Infrastructure Setup

## Goal
Establish a robust Firebase backend infrastructure to support User Identity (Auth) and Data Persistence (Firestore) for the BP-Planner Super App. This is a prerequisite for the Monetization strategy.

## Context
- **Project Type**: React (Web) + Capacitor (Mobile iOS/Android)
- **Current State**: No Firebase project exists.
- **Requirements**:
    - **Auth**: Email/Password, Google Sign-In, Apple Sign-In.
    - **Platforms**: Web, Android, iOS.
    - **Data**: Firestore (User profiles, Brain Coins, Unlocks).

## Agents & Skills
- **Agent**: `backend-specialist` (Primary), `mobile-developer` (for Capacitor config)
- **Skills**: `app-builder`, `mobile-design`

---

## Phase 1: Firebase Console Setup (Manual)
> **Status**: [ ] Pending
> **User Action Required**: Manual creation in Firebase Console.

1.  [ ] **Create Project**:
    - Go to [Firebase Console](https://console.firebase.google.com/).
    - Create new project: `bp-labo-superapp` (or similar).
    - Disable Google Analytics (optional, cleaner for now).
2.  [ ] **Enable Authentication**:
    - Enable **Email/Password**.
    - Enable **Google**:
        - SHA-1 fingerprint will be required later for Android.
    - Enable **Apple**:
        - Service ID and Team ID will be required.
3.  [ ] **Create App Platforms**:
    - **Web App**: Register app, copy `firebaseConfig`.
    - **Android App**: Register package name (check `android/app/build.gradle` - likely `com.bplabo.app` or similar). Download `google-services.json`.
    - **iOS App**: Register Bundle ID. Download `GoogleService-Info.plist`.
4.  [ ] **Enable Firestore**:
    - Create Database (Production Mode).
    - Location: Choose nearest to target audience (e.g., `asia-northeast1` for Japan).

## Phase 2: Web Integration (Foundation)
> **Status**: [ ] Pending

1.  [ ] **Install Dependencies**:
    ```bash
    npm install firebase
    ```
2.  [ ] **Configuration**:
    - Create `src/config/firebase.ts`.
    - Initialize Firebase app with environment variables (`VITE_FIREBASE_API_KEY`, etc.).
3.  [ ] **Auth Context**:
    - Create `src/contexts/AuthContext.tsx`.
    - Implement `AuthProvider` using `onAuthStateChanged`.
    - Expose `user`, `loading`, `signIn`, `signOut`.

## Phase 3: Native Mobile Integration (Capacitor)
> **Status**: [ ] Pending

We will use the official Community plugin: `@capacitor-firebase/authentication`.

1.  [ ] **Install Native Plugins**:
    ```bash
    npm install @capacitor-firebase/authentication
    npx cap update
    ```
2.  [ ] **Android Configuration**:
    - Place `google-services.json` in `android/app/`.
    - Add SHA-1 fingerprint to Firebase Console (run `./gradlew signingReport`).
3.  [ ] **iOS Configuration**:
    - Place `GoogleService-Info.plist` in `ios/App/App/`.
    - Configure URL Schemes for Google Sign-In.
    - Configure Sign in with Apple capabilities.

## Phase 4: Implementation - Login Features
> **Status**: [ ] Pending

1.  [ ] **Login UI**:
    - Create `src/modules/auth/LoginPage.tsx`.
    - Add "Sign in with Google", "Sign in with Apple", and Email forms.
2.  [ ] **Unified Auth Logic**:
    - Update `AuthContext` to handle platform-specific login flows.
    - **Web**: Use `signInWithPopup`.
    - **Native**: Use `FirebaseAuthentication.signInWithGoogle()`.
3.  [ ] **User Profile Sync**:
    - Create trigger (or client-side logic) to create a user document in `users/{userId}` upon first login.
    - Initialize default fields (`brainCoins: 0`, `subscriptionStatus: 'free'`).

## Phase 5: Verification Checklist
> **Status**: [ ] Pending

1.  [ ] **Web Test**: Login with Email works.
2.  [ ] **Web Test**: Login with Google works (Popup).
3.  [ ] **Firestore Verify**: User document created in DB matching User ID.
4.  [ ] **Build Check**: `npx cap sync` runs without errors.
5.  [ ] **(Optional)**: Run on Android Emulator to verify Native Google Login (requires keystore setup).

---

## Next Steps
1.  **User**: Perform Phase 1 (Console Setup).
2.  **AI**: Begin Phase 2 (Web Integration) once config is valid.
