# Monetization Strategy: The "Teacher's Toolkit" Hybrid Model

**Goal:** Monetize "Prep Time" while ensuring "Classroom Safety" and perceived value.
**Price Point:** $4.99 / month
**Core Value Proposition:** One subscription for the entire Super App suite (Planner + Tools + Expo + Tango).

## 1. The Economy: "Brain Coins"
A dedicated currency for **BP-Planner AI generation tasks** (Brain Coins are not used in tools/expo/tango).

*   **Currency Name:** Brain Coins
*   **Cost Basis:**
    *   1 Full Lesson Plan = **1 Brain Coin**
    *   1 AI Game Idea / Activity Suggestion = **1 Brain Coin**
*   **Acquisition Channels:**
    *   **Free Level:** Watch 1 Rewarded Video Ad immediately before generation = **+1 Brain Coin**.
    *   **Subscriber Level:** **250 Brain Coins** deposited monthly (Roll-over: No).

## 2. Feature Gating Strategy

### A. BP-Planner (The Brain)
*   **Free User:**
    *   Manual Lesson Planning: **Unlimited**.
    *   AI Generation: **Pay-per-Ad** (Watch ad immediately before each generation request).
*   **Subscriber:**
    *   AI Generation: **Instant** (uses monthly 250 Coin allowance).
    *   Export History: Full access to past PDF exports.

### B. BP-Tools & BP-Expo (The Utilities)
*   **The "Freemium Core":**
    *   **BP-Tools:** **3 Essential Tools** are **ALWAYS FREE** and unlocked (Banner Ads present in setup menus only).
    *   **BP-Expo:** **5 Starter Countries** are **ALWAYS FREE** and unlocked.
*   **The "2-Hour Unlock" Mechanic (For Locked Items):**
    *   **Action:** Watch 1 Ad to unlock a specific premium tool or extra country.
    *   **Duration:** Content remains **UNLOCKED for 2 HOURS** (covers a full double-period class block).
    *   **Reset:** Locks again after timer expires or app restart.
*   **The "Amnesia" Mechanic (Data Persistence):**
    *   **Free User:** Cannot save local data (e.g., Class Rosters, lucky draw lists). Must re-enter data every session.
    *   **Subscriber:** Can save/load persistent class data (Unlimited "Save Slots").

### C. BP-Tango (Picture Card App)
*   **Content Gating:**
    *   **Standard Categories** (Numbers, Colors, Fruits, etc.): **Always Free**.
    *   **Premium Categories:** Locked via "2-Hour Unlock" (Ad-supported).
*   **Feature Gating:**
    *   **Custom Sets:** Free users **cannot** create or save custom flashcard sets (The "Amnesia" rule).
    *   **Subscribers:** Unlimited custom set creation and saving.

## 3. Subscription Tiers

| Feature | Free Tier | Pro Subscriber ($4.99/mo) |
| :--- | :--- | :--- |
| **Ads** | Present (Rewarded Video + Banners in Setup) | **Zero Ads** |
| **AI Allowance** | 0 (Watch Ad per Generation) | **250 Coins / Month** |
| **BP-Tools** | **3 Free** (others via "2-Hour Unlock") | **All Unlocked Forever** |
| **BP-Expo** | **5 Free** (others via "2-Hour Unlock") | **All Unlocked Forever** |
| **BP-Tango** | **Standard Cats Only** (others via "2-Hour Unlock") | **All Cats Unlocked** |
| **Data Saving** | None (Amnesia Mode) | **Cloud Save (Rosters/Sets)** |
| **Classroom Safety** | High (Once unlocked, safe for 2h) | **Guaranteed (Never an ad)** |

## 4. Technical Implementation Notes (Firebase)

### Database Structure
```json
users/{userId}
{
  "subscriptionStatus": "free" | "pro",
  "brainCoins": 250, // Only relevant for subscribers or temp holding
  "subscriptionRenews": "2026-02-19",
  "unlocks": {
    "tool_timer_id": 1735439000000, // Timestamp when unlock EXPIRES
    "expo_japan_id": 1735439000000
  }
}
```

### Security Logic
*   **Client-Side:** Checks `unlocked_timestamp > current_time`.
*   **Ad Network Callback:** Upon successful view, Cloud Function updates `unlocks[itemId] = now + 2 hours`.
*   **Planner Generation:** Free users must send a unique "Ad Completion Token" with their API request to authorize the one-time generation.
*   **Subscription Check:** On app launch, sync subscription status with Store (Apple/Google) and update Firebase `subscriptionStatus`.
