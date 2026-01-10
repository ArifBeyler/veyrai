# Release / Build & Push Context (iOS)

Goal:
- App’i App Store Connect’e bağla
- iOS build al, sign et
- TestFlight’a gönder (ilk internal test)
- Release-ready pipeline kur (manual + opsiyonel CI)

## 0) Assumptions
- Proje bir iOS app (Swift/SwiftUI veya React Native/Expo olabilir).
- Apple Developer hesabım aktif (paid membership).
- App Store Connect erişimim var.

## 1) Required inputs (ask me if missing)
- App Name (display name):
- Bundle Identifier (reverse domain, e.g. com.company.app):
- Team ID (Apple Developer Team):
- Apple ID email (only for local login; DO NOT hardcode in code):
- App Store Connect “App” created? (yes/no)
- Minimum iOS version:
- Version + Build scheme (e.g. 1.0.0 (1)):
- Signing method preference:
  - Automatic signing (preferred)
  - Manual signing (only if needed)
- Distribution target:
  - TestFlight Internal
  - TestFlight External
  - App Store release

## 2) Apple Developer / App Store Connect setup
Do:
- If app not created in App Store Connect:
  - Create new app with the exact Bundle ID
  - Set primary language, SKU, and user access
- In Apple Developer:
  - Ensure “Identifiers” has the Bundle ID
  - Ensure “Capabilities” match (Push, Sign in with Apple, iCloud, etc.)
- In Xcode project:
  - Set PRODUCT_BUNDLE_IDENTIFIER to the Bundle ID
  - Set Team to my Team
  - Enable “Automatically manage signing”
  - Set Signing Certificate: Apple Distribution (for Release)
  - Provisioning: managed automatically

## 3) Capabilities checklist (enable only what app uses)
- Push Notifications:
  - Turn on capability in Apple Developer (Identifier)
  - Add “Push Notifications” capability in Xcode
  - Add “Background Modes > Remote notifications” if needed
- Associated Domains (universal links):
  - Add capability + applinks domain list
- Sign in with Apple:
  - Enable capability + configure in project
- iCloud / Keychain / HealthKit etc. only if used.

## 4) Build configurations
- Ensure Debug vs Release are correct
- Set app icons, launch screen, display name
- Ensure Info.plist keys are set (Camera/Photos perms etc.)
- Ensure crash-free startup (no missing env vars)

If project uses env vars / secrets:
- Provide a secure local mechanism (xcconfig, .env ignored by git, or CI secrets).
- Never commit API keys.

## 5) Versioning rules
- CFBundleShortVersionString = marketing version (e.g. 1.0.0)
- CFBundleVersion = build number (increment each upload)
- Cursor should implement auto-increment in CI if we use CI.

## 6) Archive & upload (manual)
Steps:
- Open Xcode
- Select “Any iOS Device (arm64)” / generic device
- Product > Archive
- Distribute App > App Store Connect > Upload
- Use “TestFlight” after processing to add internal testers

## 7) CI option (recommended): fastlane OR xcodebuild
If we use CI:
- Create a lane to:
  - increment_build_number
  - build_app (Release)
  - upload_to_testflight
- Use App Store Connect API key (Issuer ID, Key ID, p8) stored as CI secret.
- Never store credentials in repo.

## 8) Output I expect from Cursor
- A “Release.md” checklist customized to this repo
- Exact Xcode signing settings applied
- Any missing entitlements/plist permissions fixed
- A repeatable command (fastlane or xcodebuild) that produces an .ipa
- TestFlight upload working with build number increment

## 9) Guardrails
- Do NOT change bundle id after App Store Connect app exists.
- Do NOT enable capabilities we don’t use.
- Do NOT commit secrets.
- Keep build reproducible; log exact steps.
