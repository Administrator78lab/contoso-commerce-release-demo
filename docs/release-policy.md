# Contoso Release Policy (RP-004, rev 7)

**Owner:** Release Engineering | **Effective:** 2026-04-01 | **Review:** annual

## 1. Purpose

Defines the mandatory gates every production release of Contoso Commerce must pass.

## 2. Release classes

| Class | Definition | Approvals required |
|---|---|---|
| Standard | Planned release from an active release train | RM, EM, QA, Security, Business Owner |
| Expedited | Time-boxed business-critical change | RM, EM, Security |
| Hotfix | Sev-1/Sev-2 production defect | RM + on-call EM (retrospective review within 48h) |

## 3. Mandatory quality gates

A **Standard** release may not deploy unless **all** of the following are true:

- **G1 - Build integrity.** All required GitHub Actions checks pass on the release branch head.
- **G2 - Code review.** No open pull requests targeting the release branch. Every merged PR has at least one approving review from a CODEOWNER.
- **G3 - Test coverage.** Unit test line coverage >= 80%.
- **G4 - Integration tests.** Full integration suite green.
- **G5 - Performance.** p99 latency within SLO under the certified load profile (1,500 rps).
- **G6 - UAT.** Pass rate >= 95% with zero open Severity-1 defects.
- **G7 - Security.** Zero open Critical vulnerabilities. High vulnerabilities require a documented, time-bound exception. Zero unresolved secret-scanning alerts.
- **G8 - Rollback.** A rehearsed rollback path within the last 90 days.
- **G9 - Change record.** Approved change request in ServiceNow, with the freeze window observed.

## 4. Exceptions

Any gate may be waived only by a **written exception** recorded in the release-gate pack,
countersigned by the Release Manager and the accountable VP. Exceptions expire at the
next release and may not be rolled forward more than once.

## 5. Readiness scoring

Release readiness is scored out of 100:

| Dimension | Weight |
|---|---|
| Build and checks (G1) | 15 |
| Code review state (G2) | 10 |
| Test coverage and integration (G3, G4) | 15 |
| Performance (G5) | 15 |
| UAT (G6) | 20 |
| Security (G7) | 20 |
| Rollback readiness (G8) | 5 |

**Decision thresholds:** `>= 90` GO / `75-89` CONDITIONAL-GO (documented exceptions required) / `< 75` NO-GO.

## 6. Freeze windows

No production deployment between 18:00 UTC Friday and 06:00 UTC Monday, during
quarter-end close, or during the Black Friday / Cyber Monday peak freeze (Nov 20 - Dec 2).
