# CONTEXT: Remove Login/Register, Implement Anonymous Device User + Weekly Subscription Flow (No Email)

## Goal
We currently show onboarding, then a Register/Login screen. Users drop off there.  
We want to **remove Register/Login completely** and run the whole app in **anonymous (guest) mode** using a **device-based user id stored in Keychain**.

No email, no account creation, no sign-in UI.  
Monetization is **weekly subscription** (with optional trial if already implemented).  
If user finishes weekly trial / free usage and wants to generate again -> show paywall.  
If user purchases -> they continue **anonymously** (still no accounts), premium is unlocked via StoreKit/RevenueCat entitlement.

## High-level UX Flow
1) App Launch
2) Onboarding screens
3) Enter main app immediately (NO auth screens)
4) User can generate 1 free output (or weekly trial logic as defined)
5) On next generation attempt (or after trial ends) -> show paywall
6) If purchased -> unlock unlimited / premium features
7) Settings screen includes **Restore Purchases** (mandatory)
8) All user data is device-based. If the app is deleted, local history may be lost, but purchases are restorable via Apple ID.

## Requirements
- Remove all UI and navigation related to:
  - Register
  - Login
  - Email verification
  - Password reset
  - Auth gating routes
- App must work fully without any account.
- Persist a stable `deviceUserId` in iOS Keychain:
  - Survives app reinstall if Keychain remains (usually yes)
  - Unique per device
- Use `deviceUserId` as the user identifier for:
  - Local data storage
  - Backend calls (if any)
  - Quota / free usage tracking (if server-based)
- Subscription entitlement check:
  - On app start
  - When returning from paywall
  - Before every “Generate” action (to decide paywall vs allow)

## Implementation Details

### 1) Device User ID (Keychain)
Create a small utility:
- `getOrCreateDeviceUserId(): string`
- On first run:
  - generate UUID v4
  - store to Keychain under a constant key, e.g. `com.myapp.deviceUserId`
- On next runs:
  - read from Keychain and return
- This runs ASAP during app bootstrap (before API calls).

Pseudo behavior:
- if keychain has id -> use it
- else -> create -> persist -> use

### 2) Local Storage (Device-based)
All “user data” is saved locally:
- history
- generated results metadata
- preferences
- usage counters (if local-only)

Use the `deviceUserId` to namespace local storage keys:
- `history:{deviceUserId}`
- `settings:{deviceUserId}`
- etc.

### 3) Subscription / Trial Logic (Weekly)
We sell a **weekly subscription**.
Trial/Free usage rules:
- Keep our existing “1 free generation” / “weekly trial” rule (choose whichever already exists).
- Gate generation:
  - If `isPremium === true` -> allow generate
  - Else if `hasFreeCredit === true` (or trial active) -> allow generate and decrement credit if applicable
  - Else -> show paywall

Important:
- Paywall should NOT appear on first app open.
- Paywall should appear only at the moment user tries to generate again without entitlement/free credit.

### 4) Restore Purchases
Add a Settings entry:
- Button: “Restore Purchases”
- Calls RevenueCat restore (or StoreKit restore)
- After restore, refresh entitlements and update UI.

### 5) Remove Auth Screens & Routing
- Delete/disable Auth stack navigator.
- After onboarding, route directly to main tabs/home.
- Any previous auth middleware / guards must be removed.
- Ensure deep links or navigation don’t depend on an authenticated state.

### 6) Backend (If We Have One)
If the backend expects user identity:
- Always send:
  - `deviceUserId`
  - `appVersion`, `platform`, `locale` (optional)
- If we previously used userId from auth, replace it with `deviceUserId`.

If you store usage limits server-side:
- Use `deviceUserId` as the key.
- Note: This is device-based, not person-based. This is intended.

## Acceptance Criteria
- User can install, open app, finish onboarding, and use core features without ever seeing Register/Login.
- `deviceUserId` is created once and reused across launches.
- Generate flow:
  - First allowed generation works (free credit or trial)
  - Next generation attempt without entitlement shows paywall
- After purchase:
  - user remains anonymous
  - premium unlock applies immediately
- Restore Purchases works and unlocks premium on new installs/devices with same Apple ID.

## Notes / UX Copy
Avoid mentioning “account” anywhere.
Suggested wording:
- “You’re using the app in guest mode.”
- “Your data is saved on this device.”
(Or don’t mention it unless needed.)

Add optional small info in Settings:
- “Data is stored on this device. Purchases can be restored via Apple ID.”

## Tasks Checklist
- [ ] Remove Login/Register UI screens
- [ ] Remove auth routing and state dependencies
- [ ] Add Keychain deviceUserId utility
- [ ] Initialize deviceUserId on app startup
- [ ] Namespace local storage by deviceUserId
- [ ] Ensure paywall gating only triggers on Generate action
- [ ] Add Restore Purchases button in Settings
- [ ] Verify subscription entitlement refresh on app start and after paywall/restore
