# Working on this repo

This file is the workflow guide for anyone — human or AI agent (Claude
Code included) — making changes to Confident Guide.

## Branching

- `main` is the default branch and is always deployable (it's what Vercel
  builds from). **Never commit directly to `main`.**
- Every change, no matter how small, gets its own branch off `main`:
  ```bash
  git checkout main
  git pull origin main
  git checkout -b <type>/<short-description>
  ```
- Branch name prefixes:
  - `feat/` — new functionality (e.g. `feat/pronunciation-scoring`)
  - `fix/` — bug fixes (e.g. `fix/mic-permission-error`)
  - `docs/` — documentation only (e.g. `docs/update-readme`)
  - `chore/` — tooling, deps, config (e.g. `chore/bump-anthropic-sdk`)

## Commits

- Write clear, imperative commit messages ("Add tone feedback field", not
  "added" or "adding").
- Keep commits focused — one logical change per commit.

## Pull requests

1. Push the branch: `git push -u origin <branch-name>`.
2. Open a PR into `main`. Use the PR template — fill in Summary, Changes,
   and Test plan; don't leave sections blank.
3. Before opening the PR, verify locally:
   - `node --check` on any changed `.js` files (no build step in this repo).
   - `npm start` boots without errors and `/api/health` responds.
   - For UI changes: actually load the page and click through the change.
4. Keep PRs small and scoped to one change — easier to review, easier to
   revert if something's wrong.
5. Merge only after review (or, for a solo project, after re-reading your
   own diff with fresh eyes). Squash-merge to keep `main`'s history clean.
6. Delete the branch after merging.

## Secrets

- Never commit `.env` or any API key. `ANTHROPIC_API_KEY` lives in your
  local `.env` (git-ignored) and in the Vercel project's environment
  variables — nowhere else.
