# Pricing and monetisation proposal

**Owner:** marketing · **Ticket:** MKT-002 (first version MKT-001) · **Last updated:** 2026-11-27 ·
**Valid for:** v0.5.4 on `main`
**Status:** proposal for the pm and the owner. Today Polyglow is free with no ads and no
payments (PRD §7), and that stays true until the prerequisites in §5 exist.

> **PM decision (PD-072, 2026-11-21):** free with no ads and no payments through v1.0.0;
> whether to charge is the owner's decision; **nothing that is free becomes paid** (covers goal
> date, smart review, the topic index and one streak freeze a week); the prices below are a
> **hypothesis, not approved**; no Plus copy appears in the app or in public. Smart review is
> free with **no daily cap** (PD-071 §2), which replaces our "1 session a day free" idea in §3.

Sources `[Sn]` refer to `market-research.md` §7 (accessed 2026-11-20). Prices of other
products are list prices found that day; they vary by country, store and promotion.

---

## 1. Recommendation in one paragraph

Keep **A1 and A2 free**, with today's kind hearts (correct answers earn hearts, Practice is
free) and **no ads**. Charge for **depth and certainty** with one subscription, **Polyglow
Plus**, at **€5.99 a month or €39.99 a year** in the EU/UK/US, with regional prices (India
**₹149 / month or ₹999 / year**). Add a one-off **Goal Pass** (€14.99 for 6 months of Plus,
no renewal) for learners with a deadline who do not want a subscription. Launch paid plans
**together with B1** (planned v1.1.0), because B1 is the level people need for settlement and
citizenship and is the strongest reason to pay. Until then, run a no-charge interest test.
Later, sell **B2B seats** to language schools and recruitment agencies at about €3 per
learner per month.

## 2. Benchmarks

| Product | Model | Price (EUR unless noted) | Source |
|---|---|---|---|
| Market-leading gamified app | Freemium; free tier limited by energy since 2025 | Super ~€10.25/mo billed yearly (€122.99/yr; other sources €71–90/yr, est.); Max €14.99/mo; India ~₹4,000–5,000/yr (est.) | [S12][S21][S30] |
| Structured course app | Subscription, lifetime option | 12 months ~€6.95–8.99/mo; lifetime ~€299 (est.) | [S13] |
| Course app with community | Freemium | ~€9.99/mo; 12 months ~$5.83/mo; AI tier ~$13.99/mo | [S14] |
| Free public courses (DW, vhs-Lernportal) | Free | €0 | [S19][S20] |
| Live group classes | Class packs | ~€10.49–15.99 per class | [S15] |
| Tutors | Per lesson | ~$5–40 per lesson | [S16] |
| Cultural institute self-study A1 | One-off | ~€695 (varies by country, verify) | [S17] |
| Integration course fee | Per lesson unit | €2.29 where a fee applies | [S3] |

**Why below the incumbents.** New brand, no reviews yet, A1–A2 already free elsewhere [S19][S20],
and only one language. €39.99 a year is about a third of the leader's yearly list price and
below the structured app's yearly plan, yet still far above zero. The monthly price is set so
the annual plan is clearly the better deal (about 44 % less per month).

**Regional pricing.** India's Plus price at ₹999 a year is about €10.50 (est., at ~₹95 = €1),
roughly a quarter of the EU price, in line with pm hypothesis H3 and the leader's regional
gap [S30]. Use the payment provider's localised price tiers for other countries (Nigeria,
Pakistan, Kenya, Philippines) rather than setting them by hand.

## 3. What's free and what's Plus

The rule: **nothing that is free today becomes paid.** Plus adds new things.

| Feature | Free | Plus | Status |
|---|---|---|---|
| All A1 and A2 lessons, checkpoints, tips | ✓ | ✓ | On `main` |
| Hearts that refill and that correct answers earn back | ✓ | — (no hearts) | On `main` (Plus part not built) |
| Practice (replay finished lessons) | ✓ | ✓ | On `main` |
| Offline, installable app, no ads | ✓ | ✓ | On `main` |
| Account and sync | ✓ | ✓ | v0.6.0 (planned) |
| Goal date (level + date, lessons left, suggested daily goal) | ✓ | ✓ | **On `main` since v0.5.4, free (PD-072 §2)**. A paid "weekly plan" add-on would have to be new, never a limit on what is free |
| Smart review (exercises you answered, spaced 1–30 days) | ✓ **unlimited** | ✓ | v0.5.5, in progress. Free with no daily cap (PD-071 §2); our cap idea is withdrawn |
| Mock level checkpoint with can-do report (proposal #8) | — | ✓ | Deferred (PD-071); trigger B1 merged and a go on paid plans |
| **B1 and later levels** | Open (PD-072 §3) | Open | B1 written, merges after v1.0.0 (PD-063). The owner decides free or paid **before B1 merges** |
| Streak freeze | 1 a week | 2 a week (hypothesis) | v0.7.0 (planned), 1 free a week (PD-071) |
| Exam-prep courses on `main` (v0.5.4, TELC-001) | ✓ today | — | Not in this model. They can't be sold, or promoted, until the owner clears content licences and exam names (`waiting-on-owner.md` A7, A8) |

**Goal Pass** = Plus for 6 months, paid once, no renewal (€14.99; India ₹499). It answers the
subscription-trap complaints in reviews [S23] and fits learners with a date (Amara, Priya).

**Trial.** 7 days free on the annual plan, with an in-app and email reminder 2 days before
the first charge. Monthly plans have no trial.

## 4. Revenue scenarios (illustration only, all est.)

| Scenario | Monthly active learners | Paying share | Avg net revenue per payer per month | Monthly net revenue |
|---|---|---|---|---|
| Cautious | 5,000 | 2 % | €2.50 | €250 |
| Base | 20,000 | 3 % | €3.00 | €1,800 |
| Good | 50,000 | 5 % | €3.00 | €7,500 |

Assumptions: a mix of annual, monthly, India and Goal Pass; about 5 % + €0.50 provider fees
[S27]; VAT taken out. The market leader's paying share is about 9 % of monthly users [S11];
a new app should plan on less. These are not forecasts; use them to judge whether the work in
§5 is worth it.

**B2B (after proposal #10):** €3 per active learner per month, minimum 20 seats, invoiced
yearly. One agency cohort of 50 nurses ≈ €1,800 a year (est.).

## 5. What must be built first

In order. Owner items are marked **[owner]**.

| # | Item | Who | Notes |
|---|---|---|---|
| 1 | Public hosting, domain and trademark check for "Polyglow" | **[owner]**, then cto | Nothing launches without it (STATUS, PD-001) |
| 2 | Accounts and sync (v0.6.0) | cto, dev-platform | Purchases must belong to an account and be restorable |
| 3 | Entitlements in contracts (free / plus / pass, expiry) | cto | Contracts are the cto's; a contract request is needed |
| 4 | Payment provider integration and webhooks | cto, dev-platform | Recommend a **merchant of record** (e.g. Paddle, 5 % + 50¢ [S27]) so VAT in every country is handled for us |
| 5 | Paywall and plan screens, with a clear price, renewal date and a **"Verträge hier kündigen" / cancel** button | dev-platform; copy by marketing | The cancel button is a legal duty for online subscriptions in Germany [S28] |
| 6 | Renewal and trial reminders | dev-platform | Brand promise; needs email (with consent) or in-app notices |
| 7 | Plus features (at least B1 and one of #4/#8 proposals) | pm, devs | Plus must give real value on day one |
| 8 | Legal pages: Impressum, privacy policy, terms (AGB), withdrawal information for digital content | **[owner]** with a lawyer | German websites and online sales have specific duties; marketing does not draft legal text |

**Web first, stores later.** Sell on the web (the PWA) first. If the app goes to Google Play as
a Trusted Web Activity, Google requires Play Billing for digital goods in the app [S26], with
store fees and a second price list; decide that only after web payments work.

## 6. Owner items (non-blocking for the team, blocking for revenue)

1. **Choose a payment provider and open the account** (merchant of record recommended). Agents
   never sign up for services.
2. **Legal set-up:** who sells (person or company), Impressum, privacy policy, terms,
   withdrawal rules for digital content, cancellation button. Needs a lawyer.
3. **VAT:** a merchant of record collects and pays VAT for us. Without one: EU One-Stop-Shop
   registration once cross-border B2C sales pass €10,000 a year [S29], and German small-business
   rules to check with a tax adviser.
4. **Price approval:** confirm €5.99 / €39.99 / €14.99 and the India prices, or set others.
5. **Trademark and domain** for "Polyglow" (already in STATUS).
6. **Google Play developer account** ($25 one-time [S26]) only if and when a Play listing is
   wanted.

## 7. Test before charging (no money changes hands)

- **Deferred by the pm (PD-071)** until PLT-019 analytics are live and the owner puts charging
  on the table. If it comes back, the card must not list review (free, PD-071 §2).
- **Interest test after the A1 checkpoint:** a "Polyglow Plus is coming: B1, mock checkpoints"
  card with a "Tell me when it's ready" button that stores the click on the
  device only (or, after accounts and consent, on the account). Measure the click rate. No
  email collection without consent and a privacy note. Needs a pm ticket and a cto note on
  analytics.
- **Price check:** once there are users, a short in-app survey (Van Westendorp style, four
  questions) offered to learners who finish A1. Opt-in, anonymous.
- **Go / no-go:** build payments when at least 5 % of A1 finishers tap "Tell me" (est. target,
  to revisit).
