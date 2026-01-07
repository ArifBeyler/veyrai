# Pricing & Usage Policy Context (Banana Pro cost-based)

Goal:
Build a simple, profitable pricing system for an AI outfit swap / virtual try-on app.
We use a credit (token) model to control variable costs (Banana Pro approx. $0.15 per generation).
We want a clean UX, predictable margins, and strong conversion from free → trial → paid.

Core Pricing Model (Credits)
- 1 credit = 1 standard generation (Banana Pro n=1).
- Credits are monthly for subscriptions; unused credits do not roll over (unless explicitly stated later).
- Prevent “unlimited” usage to avoid cost blow-ups.

Tiers

1) Free (default for all users)
- Give exactly 1 free credit once per device/account.
- Free generation should be full quality enough to “wow” the user.
- Optional: restrict advanced options on Free (HD, multi-variant, batch), but do NOT degrade the core result.

2) Trial (7 days)
- 7-day free trial is CREDIT-LIMITED to control costs.
- Trial grants: 1 credit per day (max 7 total) OR a hard cap of 5 credits total.
- Do not allow unlimited generations during trial.
- Show a small “credits remaining” indicator in a non-annoying way.

3) Pro Subscription — $9.99 / month
- Includes 40 credits per month.
- Rationale: safe margin vs Banana Pro cost and platform fees.
- When credits hit 0, user must buy add-on packs or wait for renewal.

4) Add-on Credit Packs (IAP)
- Offer packs to monetize heavy users without risking subscription margins.
- Default packs:
  - 10 credits = $3.99
  - 25 credits = $7.99
  - 60 credits = $14.99
- If user is subscribed, optionally show a small discount badge or “best value” tagging, but keep prices same for simplicity unless we decide otherwise.

5) Annual Plan (optional but recommended)
- Offer yearly to improve LTV.
- Suggest price range: $59.99–$79.99/year depending on positioning.
- Annual plan includes monthly credit refill equivalent (e.g., 40 credits/month) or a yearly pool (only if you implement pools safely).

Credit Consumption Rules (Very Important)
- Standard Generate (n=1) consumes 1 credit.
- HD / Upscale consumes +1 credit (optional feature but recommended for monetization).
- Multi-variant (n>1) is paid: each additional variant consumes +1 credit.
- Retry/regenerate consumes 1 credit each time.
- Preview / Confirm flow:
  - Never spend a credit automatically on a “preview”.
  - Only spend credit when user taps “Generate / Confirm”.
  - If generation fails due to server error, DO NOT charge a credit (refund automatically).

Anti-Waste UX Rules
- Add a “Confirm inputs” step before spending credits:
  - Selected person image is correct
  - Selected outfit image(s) are correct
  - Any options (HD, background, etc.) are clear
- If user changes selected outfit after generating, it’s a new generation and costs credits.
- If user simply opens/edits metadata (rename, save, share), no credits.

Abuse / Fraud Protection
- Free credit is one-time:
  - Tie to device ID + account ID (if logged in).
  - Block repeat free claims via reinstall / new accounts on same device.
- Rate limits:
  - Limit generations per minute (e.g., 3/min) to prevent automation spam.
- If suspicious behavior is detected, require login to continue.

Paywall Triggers
Show paywall at these moments:
1) After user uses their 1 free credit and tries to generate again.
2) When trial credits are exhausted and user attempts to generate.
3) When Pro monthly credits are exhausted and user attempts to generate.
4) When user tries to use premium-only options (HD, multi-variant, batch) without credits/subscription.

Paywall UX Requirements
- Minimal, premium, Apple-like.
- Clearly show:
  - Plan price ($9.99/month)
  - Included credits (40/month)
  - What counts as 1 credit
  - Trial rules (7 days, limited credits)
- Provide 2 main CTAs:
  - Start Free Trial (if eligible)
  - Subscribe Now
- Provide a secondary CTA:
  - Buy Credit Pack (only if user already subscribed OR if trial ended; optional)
- Always include “Restore Purchases”.

Data Model (Simple, implementable)
Tables/collections:
- user_entitlements
  - user_id
  - is_pro (bool)
  - trial_start_at (timestamp)
  - trial_end_at (timestamp)
  - trial_credits_granted_total (int)
  - trial_credits_used (int)
  - monthly_credits_total (int) default 40 for Pro
  - monthly_credits_used (int)
  - last_monthly_reset_at (timestamp)
  - free_credit_claimed (bool)
  - free_credit_used (bool)
- credit_ledger (optional but recommended for auditing)
  - id
  - user_id
  - type: "free" | "trial" | "subscription" | "pack" | "refund"
  - delta: +int / -int
  - reason: "generate" | "hd" | "variant" | "refund_error" | etc.
  - created_at
  - metadata (json): generation_id, model, etc.

Credit Deduction Logic
- Before generation:
  - Validate user has >= required credits across (free/trial/subscription/packs).
- When generation starts:
  - Reserve credits (pending state) to prevent double-spend.
- On success:
  - Finalize deduction.
- On fail (server/model error):
  - Auto-refund reserved credits.
- On user cancellation before request sent:
  - Do not deduct.

Eligibility Logic
- Free credit available if free_credit_claimed=false.
- Trial available if trial_start_at is null and user not previously subscribed (your choice).
- Subscription resets monthly credits at renewal date.

UI Surfaces That Must Show Credits
- Profile / Settings: show “Credits remaining” and plan status.
- Generate screen: subtle pill “X credits left”.
- Paywall: show plan + included credits + add-on packs.

Analytics (Must Track)
Track these events:
- free_credit_used
- trial_started
- trial_credit_used
- trial_exhausted
- subscribe_started
- subscribe_success
- credits_exhausted
- pack_purchase
- generation_success / generation_fail
- avg_credits_used_per_paid_user_per_month

Acceptance Criteria
- Users can always see remaining credits.
- No credit is consumed on failed generations.
- Trial is strictly limited (no unlimited trial).
- Pro $9.99 includes 40 credits/month.
- Add-on packs exist and are purchasable.
- Paywall triggers exactly when credits are exhausted or premium options are attempted.
- Abuse protection prevents repeated free-credit farming.

Implementation Notes (Engineering)
- Keep the system deterministic: credit spend must be transactional.
- Use server-side verification for entitlements and purchases (RevenueCat recommended).
- Never trust client-only credit counters.
