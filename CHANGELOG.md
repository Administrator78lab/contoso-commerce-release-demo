# Changelog

All notable changes to Contoso Commerce are documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
and the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.

## [Unreleased]

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
