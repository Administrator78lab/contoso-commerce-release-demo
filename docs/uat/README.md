# UAT evidence - v2.4.0

The authoritative UAT results workbook for this release lives in SharePoint:

`/sites/ContosoRelease/Shared Documents/Releases/v2.4/UAT-Results-v2.4.xlsx`

Summary as of 2026-09-09 18:00 UTC:

| Metric | Value | Threshold | Status |
|---|---|---|---|
| Test cases executed | 312 / 318 | 318 | Warning - 6 not run |
| Pass rate | 91.3% | >= 95% | Fail |
| Severity-1 defects open | 1 | 0 | Fail |
| Severity-2 defects open | 3 | <= 2 | Fail |
| Business sign-off | Pending | Signed | Fail |

Open defects:

| Defect | Area | Severity |
|---|---|---|
| UAT-2041 | Checkout performance under load | 1 |
| UAT-2047 | Split-tender refund cannot be completed | 2 |
| UAT-2052 | Stale inventory on PDP after stock adjustment | 2 |
| UAT-2058 | Order confirmation email missing gift-card line | 2 |
| UAT-2061 | Currency rounding on multi-currency cart | 3 |
