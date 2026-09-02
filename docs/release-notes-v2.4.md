# Contoso Commerce v2.4.0 - Release Notes (DRAFT)

> **Status:** Draft - pending release-gate approval.
> **Planned deployment:** 2026-09-11 02:00 UTC
> **Release manager:** Priya Nandakumar
>
> _This file is intentionally editable. Release automation and agents may append
> a readiness summary to the "Release readiness" section below._

## Highlights

- **Split-tender payments.** Customers can now pay with a gift card plus a single
  credit or debit card in one order.
- **Idempotent checkout.** Duplicate orders caused by client retries are eliminated.
- **Faster tax calculation.** Avalara calls reduced by roughly 68% through per-order batching.
- **3-D Secure 2.2** challenge flow for EU markets, behind a feature flag.
- **Server-side cart merge** on sign-in, fixing long-standing cart-loss reports.

## Upgrade notes

1. Migration `20260905_order_idempotency_keys` is **not reversible**. Confirm the
   pre-deployment snapshot completed before applying it.
2. `notification-service` must be at 1.9.0 or later before deploying checkout 2.4.0.
3. The `checkout.splitTender` flag ships **off**. Do not enable it until the
   split-tender refund path is delivered.

## Known issues

| Summary | Severity | Status |
|---|---|---|
| Split-tender refunds must be processed manually | High | Deferred to 2.4.1 |
| Checkout p99 latency 912ms vs 800ms SLO above 1,200 rps | Critical | Open - release blocker |
| axios SSRF advisory only partially remediated | High | Open |
| Hardcoded database credential removed but not rotated | High | Open |

## Release readiness

_To be completed by the release-gate review._

- Engineering readiness: _pending_
- Security readiness: _pending_
- UAT sign-off: _pending_
- Business approval: _pending_
- **Recommendation:** _pending_

## Rollback

See [rollback runbook](rollback-runbook.md). Estimated RTO is 18 minutes for the
application tier; database rollback past `20260905_order_idempotency_keys` requires
a point-in-time restore with an RTO of approximately 95 minutes.
