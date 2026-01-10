# Context: Add “Sign in with Apple” to our iOS app (Swift + Supabase)
Goal: Implement Apple login end-to-end in a clean, review-safe way. Keep UX frictionless (one-tap), store user identity properly, and ensure backend verification is correct. This feature must be production-ready and App Store review compliant.

---

## 0) Current assumptions
- iOS app is written in Swift (SwiftUI preferred, UIKit OK).
- Backend/auth uses Supabase (Supabase Auth + DB).
- We already have email/password and/or other providers OR we plan to add Apple as the primary login.
- App has a “Profile / Settings” screen where we can place “Delete Account”.

If any of these assumptions are wrong, adjust implementation accordingly but keep the same security principles.

---

## 1) Apple Developer setup (required checklist)
We must confirm these exist in Apple Developer account:

A) App ID
- Bundle ID: `com.<company>.<app>`
- Capability: “Sign In with Apple” enabled

B) Service ID (used as OAuth client id in many backends)
- Create a Service ID, e.g. `com.<company>.<app>.auth`
- Enable “Sign In with Apple”
- Configure Return URL / Redirect URI for Supabase:
  - Use Supabase callback URL pattern (provided in Supabase Apple provider settings)
  - Example format (verify in our Supabase project):
    `https://<PROJECT_REF>.supabase.co/auth/v1/callback`

C) Key (.p8)
- Create a Sign In with Apple key
- Save: Key ID, Team ID, and the `.p8` file securely (never commit)

Deliverable from this step (store in secrets manager / env):
- APPLE_TEAM_ID
- APPLE_KEY_ID
- APPLE_PRIVATE_KEY_P8 (contents)
- APPLE_CLIENT_ID (Service ID OR Bundle ID depending on Supabase config)
- APPLE_REDIRECT_URL (Supabase callback)

---

## 2) Supabase configuration (Apple provider)
In Supabase Dashboard:
Authentication → Providers → Apple
- Enable Apple
- Fill:
  - Client ID: (Service ID recommended)
  - Secret: generate JWT client secret using:
    - Team ID
    - Key ID
    - Private key (.p8)
    - Client ID
  - Redirect URL is the supabase callback URL; ensure it matches Apple Service ID return URL

Important:
- The Apple “email” and “fullName” are only provided on first consent. We must store them on first login.
- Subsequent logins may not include email/name.

---

## 3) iOS implementation requirements
### UX
- Provide “Continue with Apple” as a primary button on auth screen.
- Use Apple-provided button style:
  - `ASAuthorizationAppleIDButton`
  - Respect Apple HIG sizes and spacing.
- Keep it one-tap; do not ask for extra steps unless needed.

### Technical flow (Supabase)
We will use the native Apple auth to obtain:
- `identityToken` (JWT)
- `authorizationCode`

Then sign in to Supabase using ID token (preferred approach):
- Use Supabase Swift client method for Apple:
  - If SDK supports: `signInWithIdToken(provider: .apple, idToken: ..., nonce: ...)`
  - Otherwise implement per current Supabase Swift docs.

Nonce:
- Generate cryptographically secure random nonce
- Hash nonce with SHA256
- Pass hashed nonce to Apple request
- Send raw nonce alongside token to Supabase if required

Scopes:
- Request `.email` and `.fullName` (only first time; still request to capture if available)

### Data handling
- If Apple returns fullName/email on first login:
  - Update `profiles` table with:
    - `email` (if not already)
    - `full_name` (compose given/family)
- Use Apple stable identifier:
  - The user’s stable Apple id is in the token claim `sub`.
  - Supabase will map to its own `user.id`. Use Supabase user id as primary.

---

## 4) Database expectations (Supabase)
We should have a `profiles` table linked to `auth.users`:
- `id` uuid primary key references `auth.users(id)`
- `full_name` text nullable
- `email` text nullable
- `avatar_url` text nullable
- timestamps

RLS:
- Allow user to select/update only their own profile row.

On first login:
- Ensure a profile row exists (via:
  - trigger/function on `auth.users` insert OR
  - app-side upsert after login)

---

## 5) Security + Verification rules (non-negotiable)
- Never trust client-only verification.
- Supabase should validate Apple token server-side.
- Ensure redirect URLs match exactly between:
  - Apple Service ID return URL
  - Supabase provider callback
- Never ship `.p8` in the app bundle.
- Keep Apple secret generation on backend or secure server environment only (or create once in dashboard and store securely).

---

## 6) App Store Review compliance
- If we offer Google/Facebook/email login, we must also offer “Sign in with Apple”.
- “Delete Account” must be available in-app (Settings/Profile):
  - Must delete user data and auth account (Supabase user).
- Don’t show custom Apple button that violates guidelines.

---

## 7) Implementation tasks for Cursor (do in order)
1) Add Apple sign-in UI on Auth screen:
   - SwiftUI view with `SignInWithAppleButton` wrapper
   - Handles nonce generation and ASAuthorization callbacks
2) Implement Supabase sign-in with Apple token:
   - Exchange token with Supabase auth
   - Create session and store securely
3) Profile bootstrap:
   - After login, upsert `profiles` row
   - Save fullName/email if provided
4) Add Settings “Delete Account”:
   - Calls Supabase function/endpoint to delete:
     - profile row + related data
     - auth user (admin deletion requires server-side)
   - If we don’t have an admin backend, create an Edge Function for deletion
5) Add error handling:
   - Cancelled auth, network errors, invalid nonce, provider disabled, etc.
6) QA checklist:
   - First-time login captures email/name
   - Second login works without email/name
   - Works on real device (not only simulator)
   - Works after reinstall (Apple may not resend email/name)
   - RLS correctness
   - App review readiness (button + deletion)

---

## 8) Output expected from Cursor
- SwiftUI components:
  - `AppleSignInButtonView.swift` (or similar)
  - Nonce + SHA256 helpers
- Auth service:
  - `AuthManager` integrating Supabase sign-in
- Profile service:
  - `ProfileRepository` upsert logic
- Settings screen:
  - “Delete account” flow with confirmations
- If needed:
  - Supabase Edge Function for account deletion (server-side admin)

Keep code clean, modular, and easy to test.
