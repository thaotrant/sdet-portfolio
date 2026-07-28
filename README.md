# SDET Portfolio — automationexercise.com

An automation framework covering API and E2E UI layers for [automationexercise.com](https://automationexercise.com), a public e-commerce site built for test automation practice. Built with **Playwright + TypeScript**.

## Why this app

- Public, stable, documented site — safe to reference in interviews
- Has a **documented API** ([`/api_list`](https://automationexercise.com/api_list)) alongside the UI, so the same domain can be tested at both layers
- Has **26 official test scenarios** documented at [`/test_cases`](https://automationexercise.com/test_cases), which this suite's E2E tests are scoped from

## Test strategy (this is the part interviewers actually probe)

**Pyramid split:** ~60% API, ~35% E2E critical paths, ~5% reserved for a future mobile smoke layer (see Roadmap).

**Why API-heavy:** API tests here run in milliseconds, have zero UI flakiness, and validate the actual data contract (status codes, response shape, error messages). UI tests are reserved for journeys where the *browser experience itself* is the risk — not for re-verifying logic already covered at the API layer.

**Why these specific E2E journeys:** Login/signup was chosen first because it's a shared dependency gating every other journey (cart, checkout, account) — a failure here blocks the whole user funnel, so it's the highest-risk single point of failure in the app. Product search + add-to-cart was chosen second because it's the core revenue-path journey. Both negative and positive cases are included at each layer (e.g., invalid login, missing search param, unsupported HTTP method) — negative-path coverage is intentionally not an afterthought.

**Data lifecycle:** The account API test creates a unique user per run (timestamp-suffixed email) and deletes it at the end, so the suite is idempotent and safe to run repeatedly/in parallel without manual cleanup.

## Structure

```
tests/
  api/           # Fast, stateless — bottom of the pyramid
  e2e/           # Critical user journeys only, via Page Object Model
pages/           # Page Object Model — selectors isolated from test logic
config/env.ts    # Typed, validated environment config — single source of truth
test-data/       # Non-secret fixtures, kept out of test files
.env.example     # Template for local config (.env itself is gitignored)
.github/workflows/tests.yml   # CI: runs on push/PR + nightly regression cron
```

## Configuration

Config is layered by sensitivity and rate of change, rather than hardcoded:

| Layer | Holds | Committed |
|---|---|---|
| `.env` | Real values for the local machine/environment | No |
| `.env.example` | Template listing every supported variable | Yes |
| `config/env.ts` | Reads + validates env, applies typed defaults | Yes |
| `test-data/` | Non-secret fixtures (names, addresses) | Yes |
| GitHub Secrets | CI values, injected via the workflow `env:` block | n/a |

**Test code never reads `process.env` directly** — everything goes through `config/env.ts`, which validates once at startup. A malformed value fails the run immediately with a readable message (`Invalid TEST_ENV: "stagingg". Expected one of: production, staging, local.`) instead of surfacing later as an opaque `navigate to "undefined/login"`.

Every variable has a working default, so `npm test` runs green straight after clone. To target a different host:

```bash
cp .env.example .env       # then edit
BASE_URL=https://staging.example.com npm test    # or override per-run
```

## Running locally

```bash
npm install
npx playwright install
npm test              # everything
npm run test:api      # API layer only
npm run test:e2e      # E2E layer only
npm run report        # open the last HTML report
```

## CI/CD

GitHub Actions runs the full suite on every push/PR to `main`, plus a nightly scheduled regression run, and uploads the HTML report as a build artifact.

## Roadmap (documents deliberate scope, not gaps found by accident)

- [ ] Appium mobile smoke test against a public sample app (login + one core flow)
- [ ] Contract testing on the API layer (e.g. Pact or JSON schema validation)
- [ ] Basic load test on `/api/productsList` with k6
- [ ] Allure reporting for richer historical trend data
