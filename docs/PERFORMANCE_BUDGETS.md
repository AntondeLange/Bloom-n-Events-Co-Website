# Performance Budgets

These budgets are enforced by `node scripts/perf-budget.mjs` using the local build audit (`docs/perf-audit-local.json`).

## Thresholds (Local, Uncompressed)

| Page | Total Bytes | Image Bytes | JS Bytes |
| --- | ---: | ---: | ---: |
| `/` | 2.00 MB | 1.60 MB | 0.29 MB |
| `/about/` | 15.00 MB | 14.00 MB | 0.29 MB |
| `/capabilities/` | 6.00 MB | 5.50 MB | 0.29 MB |
| `/events/` | 6.00 MB | 5.50 MB | 0.29 MB |
| `/gallery/` | 12.00 MB | 11.00 MB | 0.29 MB |
| `/contact/` | 3.00 MB | 2.50 MB | 0.29 MB |

## How To Run

```bash
npm run build
npm run perf:audit
npm run perf:budget
```

## Notes
- This audit ignores `srcset` variants and external resources by design. Use Lighthouse for real transfer sizes and CWV.
- If a budget fails, reduce images, defer JS, or split heavy islands.
