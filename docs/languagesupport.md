# i18n / l10n Context (TR + EN + FR)

Goal
- App already supports Turkish (tr). We will add English (en) and French (fr).
- All UI text must be localized via i18n keys (no hardcoded user-facing strings).
- AI responses must follow the user’s selected language and must NOT randomly switch languages.
- Locale rules must also cover date/number formatting (l10n).

Supported Languages
- tr (default / existing)
- en
- fr

Non-negotiable Rules
1) No hardcoded UI text
   - Any user-facing string must be fetched via `t("key.path")`.
   - This includes: button labels, empty states, errors, toasts, paywall copy, onboarding copy, placeholders, permission prompts, etc.
2) Stable keys
   - Keys are English-based identifiers, NOT the translated text.
   - Example: `onboarding.step1.title` not `Hoş geldin`.
3) No missing keys in production
   - If a key is missing, fail fast in dev, and show a safe fallback in prod.
4) AI language lock
   - The language used in AI responses must match the app language setting (or explicit user override) and remain consistent across turns.
5) Formatting is locale-aware
   - Use Intl formatting for dates/numbers/currency.
   - Never manually format dates like "06/01/2026" unless using locale formatters.

Architecture Decisions
- Use an i18n library suitable for React Native (e.g., i18next + react-i18next) and store JSON dictionaries per language.
- Source of truth for language:
  - `settings.language`: "system" | "tr" | "en" | "fr"
  - If "system", detect device locale and map -> supported languages; else fallback to tr.
- Provide `useAppLanguage()` hook:
  - returns `lang`, `setLang`, and `resolvedLang` (system -> resolved).
- Provide `t()` function globally via prov
