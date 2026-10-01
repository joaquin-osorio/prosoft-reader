# CLAUDE.md

@AGENTS.md

## Language

- Everything that goes into the repo must be in English: code, identifiers, comments, JSDoc, tests, commit messages, `/docs`, and any user-facing text unless the task explicitly says otherwise.

## Workflow

- Don't run the full test suite after a change — only run tests relevant to what changed.
- Work autonomously. When something is unclear, use your own judgment, pick the most reasonable option, and state the assumption in your plan or summary. Only ask when it's truly essential: the ambiguity would change the outcome in a big way, the decision is hard to reverse, or it touches data loss or security.
- Keep changes focused. Don't touch unrelated files, refactor unrelated code, or "clean up" surrounding code unless it's necessary for the task.
- For significant architectural changes, project structure changes, or new patterns: explain the trade-offs in the plan and proceed. Only stop for approval if the change would be hard to undo.
- Follow the project's existing conventions and config. Don't override or bypass lint/format/TypeScript/test rules just to make something pass — if a rule is genuinely a problem, explain why and ask before changing it.
- Stop any dev/preview servers (e.g. `next dev`) started during a session before finishing — don't leave them running once the task is done.

## Planning and commits

- When planning a task, break it into small, committable milestones and list them in the plan. Each milestone is one coherent change that leaves the app in a working state (builds, typechecks, relevant tests pass).
- Commit each milestone as soon as it's done and verified, before starting the next one. Don't batch several milestones into one commit, and don't leave finished work uncommitted.
- Before each commit: run lint, typecheck, and the tests relevant to that milestone. If anything fails, fix it first. Never commit broken code and never skip hooks (`--no-verify`).
- Tests and `/docs` updates belong in the same commit as the change they cover.
- Stage with `git add .` so nothing is left unstaged. Because everything gets staged:
  - Secrets always go in `.env*` files, and `.env*` must be in `.gitignore` (except example files like `.env.example`, which hold placeholder values only). Check this before committing.
  - Review `git status` before each commit. If an untracked file shouldn't live in the repo (build output, logs, local artifacts), add it to `.gitignore` instead of committing it.
  - If a secret ever appears in the staged diff, stop, move it to `.env`, and don't commit until it's out.
- If the plan changes mid-task (a milestone needs splitting, reordering, or dropping), update the plan and say so before continuing.
- Use [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): description`.
  - Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `style`, `build`, `ci`, `chore`.
  - Subject: imperative mood, lowercase, no trailing period, ≤ 72 characters.
  - Add a body when the *why* isn't obvious from the subject.
  - Breaking changes: `type(scope)!:` plus a `BREAKING CHANGE:` footer.
- Work directly on `main`. Push after each commit.
- Don't rewrite history (amend of pushed commits, rebase, reset, force-push) unless the user asks.

## Code

- No giant files. A file pushing ~10k lines is treated as a mistake 9 times out of 10 — flag it and propose splitting it up.
- Prefer the simplest solution that correctly solves the problem. No unnecessary abstractions, patterns, or architectural complexity.
- Never hardcode secrets, API keys, credentials, or tokens. Always put them in a `.env` file and read them from environment variables.

## Next.js conventions

- App Router only — this project does not use the Pages Router.
- Server Components by default. Use Client Components only when a feature genuinely needs client interactivity (state, effects, browser APIs, event handlers).
- Push `"use client"` down to the smallest interactive leaf. Don't turn a page or layout into a Client Component just to host one interactive widget — pass server-rendered content in as `children` or props instead.
- Keep a hard server/client boundary:
  - Modules with server-only logic or secrets start with `import "server-only"` so an accidental client import fails at build time.
  - Only `NEXT_PUBLIC_*` env vars reach the browser. Never give a secret that prefix.
- Data flow:
  - Fetch data in Server Components, not with client-side fetching or `useEffect` synchronization.
  - Mutations go through Server Actions.
  - Route Handlers are for things that genuinely need an HTTP endpoint (webhooks, external consumers, non-React clients) — not for feeding your own Server Components.
- Server Actions are public HTTP endpoints. Validate input and check authentication/authorization inside every action; never trust that only your UI calls it.
- Caching and revalidation: be explicit about what is cached and how it gets invalidated after a mutation. Use the mechanism the installed Next.js version prescribes (see the bundled docs referenced in `AGENTS.md`), not patterns from memory.

## Documentation

- `/docs` is a persistent knowledge base for the coding agent. It can be as technical, detailed, and granular as needed. Its structure evolves organically as the app grows — don't force it into a predefined layout.
- Before implementing a feature or making a significant change, check the relevant parts of `/docs` to understand existing architecture and conventions.
- Only non-obvious changes need a `/docs` entry or update — skip it for changes that are self-evident from the code.
- JSDoc functions when there's non-obvious logic, a public/reusable API, important assumptions, side effects, or non-obvious params/return values. Don't add JSDoc that just restates the code.
- Use inline comments where they'll meaningfully help review — not everywhere.

## Testing

- Write tests for new features and bugfixes.
- Tests must verify meaningful behavior, not implementation details. Don't write tests just to inflate coverage.
- When fixing a bug, add a regression test whenever practical.

## Structure

- Single root `CLAUDE.md`. Don't create per-directory `CLAUDE.md` files unless there's a concrete reason later (e.g. genuinely different conventions per package, or a monorepo).
