# Debug Session: turbopack-css-parse

- Status: OPEN
- Symptom: `next dev --turbopack` fails on `app/globals.css` with `Unexpected token Function("--spacing")`.
- Expected: Dev server compiles home page CSS without Turbopack panic.
- Evidence:
  - User log shows generated CSS rule `--card-spacing: var(--spacing(4));`
  - Failure is reported through `app/globals.css [Client Component Browser]`
  - Production build succeeds, but Turbopack dev fails during CSS parsing
- Hypotheses:
  1. A Tailwind v4-only utility/arbitrary value pattern is present in app code.
  2. An imported stylesheet contains Tailwind v4 variable syntax incompatible with current tooling.
  3. Turbopack is stricter than webpack on this CSS construct and exposes the incompatibility.
  4. The `.next/postcss.js` missing error is a downstream symptom after CSS parsing aborts.
- Plan:
  1. Search for the offending `--spacing(4)` or related arbitrary class usage.
  2. Replace the incompatible syntax with Tailwind v3-safe utilities.
  3. Re-run `npm run build`.
  4. Re-run `npm run dev` and confirm the page compiles cleanly.
