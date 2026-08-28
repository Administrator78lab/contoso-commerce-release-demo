# Changelog

All notable changes to Contoso Commerce are documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
and the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.

## [Unreleased]

## [2.4.0] - 2026-09-11 (release candidate - NOT YET SHIPPED)

### Added
- **Checkout**: split-tender payments allowing a gift card plus one card in a single order (#101).
- **Checkout**: idempotency keys on `POST /v2/checkout/orders` to eliminate duplicate order creation on client retry (#104).
- **Catalog**: bulk price-override endpoint for merchandising campaigns (#112).
- **Cart**: server-side cart merge on sign-in, replacing the previous client-side merge (#118).
- **Payments**: support for the Adyen 3-D Secure 2.2 challenge flow in EU markets (#121).
- Release-gate GitHub Actions workflow that publishes a signed `release-manifest.json`.

### Changed
- **Payments**: retry policy for gateway timeouts moved from fixed 3x to exponential backoff with jitter (#127).
- **Checkout**: tax calculation now batched per-order instead of per-line-item, reducing Avalara calls by ~68%.
- Upgraded Node.js runtime from 18.x to 20.x across all services.
- Order confirmation emails moved to the new notification service.

### Fixed
- **Cart**: cart totals drifting by 1 cent on multi-currency orders due to premature rounding (#133).
- **Catalog**: stale inventory counts served from cache for up to 90s after a stock adjustment (#136).
- **Checkout**: guest checkout failing when the shipping country had no configured tax nexus (#139).

### Security
- Removed a hardcoded database credential from `config/database.js` (tracked in #147).
- Patched `axios` SSRF advisory GHSA-8hc4-vh64-cxmj (partially - see #145).

### Known issues
- Split-tender refunds are not yet supported; refunds against split-tender orders must be
  processed manually via the Payments admin console. Tracked in #142.
- Under sustained load above 1,200 rps the checkout service p99 latency exceeds the 800ms SLO.
  Tracked in #144 - **release blocker**.

## [2.3.2] - 2026-08-14

### Fixed
- **Payments**: gateway webhook signature validation rejecting valid Adyen notifications after a key rotation.
- **Catalog**: search facets returning duplicate brand entries.

## [2.3.1] - 2026-07-31

### Fixed
- **Checkout**: promo code stacking allowed two exclusive promotions to combine, causing over-discounting.

### Security
- Bumped `minimist` to 1.2.8 (prototype pollution, GHSA-xvch-5gv4-984h).

## [2.3.0] - 2026-07-17

### Added
- **Catalog**: multi-warehouse inventory allocation.
- **Storefront**: Apple Pay and Google Pay express checkout buttons.

### Changed
- Migrated the order datastore from PostgreSQL 13 to PostgreSQL 15.

## [2.2.0] - 2026-06-05

### Added
- **Cart**: saved carts and "buy it again" recommendations.
- **Payments**: partial capture support.
