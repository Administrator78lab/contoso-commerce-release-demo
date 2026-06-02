# contoso-commerce

Contoso Commerce is the storefront and order-orchestration platform powering contoso.com.
This repository contains the checkout, payments, catalog and cart services plus the
release tooling used by the Release Engineering team.

## Services

| Service | Path | Owner | On-call rota |
|---|---|---|---|
| Checkout API | `src/services/checkout` | Payments Platform | `#oncall-payments` |
| Payments Gateway | `src/services/payments` | Payments Platform | `#oncall-payments` |
| Catalog API | `src/services/catalog` | Catalog & Search | `#oncall-catalog` |
| Cart Service | `src/services/cart` | Storefront | `#oncall-storefront` |

## Branching model

- `main` - production. Protected. Only release managers may merge.
- `release/v2.4` - current release train, cut 2026-08-28. Hardening only.
- `feature/*` - feature work, merged into the active release branch.
- `hotfix/*` - cut from `main`, merged to `main` and back-merged to the release branch.

## Release process

Releases follow the [Contoso Release Policy](docs/release-policy.md). Every release
requires a completed release-gate review, a signed `release-manifest.json`, a UAT sign-off
and a validated rollback path (see [rollback runbook](docs/rollback-runbook.md)).

## Local development

```bash
npm install
npm run build
npm test
```

## Support

- Release Manager: Priya Nandakumar (`priya.nandakumar@contoso.com`)
- Engineering Manager: Daniel Okafor (`daniel.okafor@contoso.com`)
- Security Champion: Mei Tanaka (`mei.tanaka@contoso.com`)
