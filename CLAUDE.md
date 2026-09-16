# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

Playwright UI test suite for the "Oda Admin Dashboard" (a Next.js admin app), driven against a **shared UAT environment** (`UAT_BASE_URL` in `.env`) — there is no local app server and no mocking. All tests exercise the real deployed app with a real admin account.

## About Me

I am mostly a manual QA tester with limited automation focus. I prefer simple, easy-to-understand code and solutions without unnecessary complexity.

## Communication Style

- All outputs should prioritize usefulness and clarity.
- Write in clear, conversational English.
- Use simple language whenever possible.
- Avoid buzzwords, corporate jargon, and vague statements.
- Focus on practical examples and actionable insights.
- Prioritize clarity over sophistication.
- Explain concepts as if speaking to an intelligent beginner.
- Use short paragraphs and strong structure.

## Rules

- Always ask at least three clarifying questions before starting any complex task.
- Always present a plan before execution.
- Never make assumptions when important information is missing.
- Keep outputs concise and relevant.
- Stay within requested formats.
- When multiple approaches exist, explain the tradeoffs.
- If uncertain, ask before proceeding.
- Review outputs before final delivery.
- Do not merge anything automatically to git and always ask permission

## Commands

```bash
npx playwright test                          # run the full suite
npx playwright test tests/PageLoad.spec.js   # run one file
npx playwright test -g "Region North"        # run tests matching a title
npx playwright test --headed                 # watch it run in a browser
npx playwright test --ui                     # interactive UI mode
npx playwright show-report                   # open the HTML report from the last run
```

There is no lint/typecheck/build step configured (`package.json` has no `scripts` block yet — the commands above go through the `playwright` CLI directly via `npx`).

Requires a `.env` file (gitignored) with `UAT_BASE_URL`, `Admin_USERNAME`, `Admin_PASSWORD` — these are the credentials for the one shared admin account every test authenticates as.

## Architecture

### Auth: one shared session, not per-test login

`tests/auth.setup.js` is a Playwright `setup` project (see `playwright.config.js`) that logs in **once** and saves the session to `playwright/.auth/user.json`. Every other test (`chromium` project) declares `dependencies: ['setup']` and loads that `storageState`, so tests start already authenticated — they never see the login form.

This matters for how the two login helpers in `utils/userlogin.js` are used:
- `login(page)` — drives the actual sign-in form. Only used by `auth.setup.js`. **Never call this from a regular spec** — with a session already loaded, hitting `/login` redirects straight to `/home` and the "Sign in" heading assertion times out.
- `goToHome(page)` — just navigates to `/home`, relying on the already-authenticated session. This is what every spec file's setup step should use.

### Concurrency: `workers: 1` is load-bearing, not a default

`playwright.config.js` pins `workers: 1` for both local and CI runs. This is not a stylistic choice — the shared UAT backend returns intermittent 503s and Next.js "Server Components render" crashes under concurrent load, since every worker would otherwise hit the server simultaneously as the *same* authenticated session. Do not raise `workers` or re-introduce `fullyParallel`-driven concurrency without expecting flaky failures that have nothing to do with the test code.

Relatedly, avoid `test.describe.configure({ mode: 'serial' })` as a substitute for this: in serial mode, one test failure skips every remaining test in that file for the rest of the run, which silently reduces coverage. Global `workers: 1` gives full sequential execution across the whole suite without that skip-cascade downside.

### Page navigation: `utils/navigationMenu.js`

`sideMenu(page, mainMenu, subMenu)` is the standard way specs navigate the app's sidebar:
- Opens the sidebar via the hamburger icon if present.
- If `subMenu` is omitted, treats `mainMenu` as a direct top-level link (e.g. "Home", "Order Management" render as plain links in the sidebar, not expandable sections).
- Otherwise clicks the `mainMenu` heading to expand it, then clicks the `subMenu` link.
- After clicking, waits for the URL to actually match the link's `href` (`navigateAndWait`) before returning — don't rely on the next assertion in the test to catch a slow SPA route change; `sideMenu` already guarantees navigation completed.

### Shared helpers (`utils/`)

- `userlogin.js` — `login` / `goToHome` (see Auth section above).
- `navigationMenu.js` — `sideMenu`, `openDashboardMenu` (see above).
- `filters.js` — `selectDropdownOption(page, labelText, optionName, { exact })`: generic labeled-combobox selector. Locates the combobox as a sibling of text matching `labelText`, selects `optionName`, and waits for the dropdown to reflect the new value. Use this for any filter dropdown instead of writing a one-off selector.
- `pagination.js` — `paginationForwardButton` / `paginationLastPageButton` / `paginationBackButton` / `paginationFirstPageButton`. All wait for the table's first row content to actually change (`waitForTableToChange`) rather than a fixed sleep — pass a custom `rowLocator` if a page's table isn't `tbody tr`.
- `logout.js` — `logout(page)`.

### Selector conventions used throughout specs

- Filter dropdowns are commonly found via `page.getByText(labelText).locator('..').getByRole('combobox')` — the combobox is a sibling of its visible label, not directly associated by `<label for>`/ARIA. `filters.js`'s `selectDropdownOption` already encapsulates this; prefer it over repeating the pattern inline.
- Test titles are numbered (`'1. Home Page load after login'`, `'5.2 Daily Loadout Manager - Verify ...'`) purely for human readability in the HTML report — this has no effect on execution order (`workers: 1` already gives deterministic sequential order via file/declaration order).

### Known data-dependent flakiness

Some specs (`categoryManagement.spec.js`, `productManagement.spec.js`) hardcode specific category/product names or codes and assume they exist on a given page after pagination or filtering. Since the UAT dataset is shared and changes over time, these can fail from data drift rather than an actual app bug — check the failure snapshot before assuming a regression.
