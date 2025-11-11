# Contributing

Thanks for helping keep the DIKPIK Bazaar tooling stable. This repository follows a conventional, test-first workflow with automated quality gates. Please read the sections below before opening a pull request.

## Getting started

1. Install the tooling (Codespaces is the fastest path):
   - Node 20+
   - Python 3.11 (for `pre-commit`)
   - Cairo libs (already provided inside the devcontainer)
2. Run `npm install`.
3. Install and enable `pre-commit`:
   ```bash
   python -m pip install pre-commit
   pre-commit install
   pre-commit install --hook-type commit-msg
   ```
4. Copy `.env.example` to `.env` when you need to run Wix-auth helpers locally.

## Development workflow

- **Tests & linting**: use `npm run check` before pushing (`lint`, `typecheck`, `test`).
- **Formatting**: `npm run format:fix`.
- **Pre-commit hooks** run lint + typecheck + prettier automatically. Re-run manually with `pre-commit run --all-files` if needed.
- **Commit messages**: follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, etc.). `commitlint` will block invalid messages.
- **PRs**:
  - Target `main`.
  - Fill out the template (tests, screenshots, preview link).
  - Ensure CI is green.

## Reporting issues

File issues with:

- What you expected vs. what happened.
- Reproduction steps (commands, sample layer config, etc.).
- Logs or stack traces (redact secrets).

Security-sensitive reports should be emailed to the maintainers instead of filing a public issue.
