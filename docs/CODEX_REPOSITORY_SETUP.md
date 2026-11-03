# Codex handoff: maintain the existing repository

The public repository already exists at [TheLouisMahdi/chat-folder-click](https://github.com/TheLouisMahdi/chat-folder-click), with source, documentation, an MIT license, and CI. This file replaces the original one-time repository creation instructions. Do not initialize or recreate the repository, replace its history, or add a second license.

## Review and update

1. Check GitHub authentication and repository permissions. Inspect the working tree, fetch `origin/main`, and reconcile any local or remote changes before editing. Use normal commits and pushes; never force-push.
2. Read the existing source, `package.json`, `extension/manifest.json`, tests, and CI. Preserve working functionality and avoid unrelated refactoring or dependencies. Both versions are currently `2.1.0`; the extension homepage already points to this repository.
3. Before changing files, run `npm run check` with Node.js 20+ and `python scripts/package_edge.py` with Python 3. No dependency installation is needed. Verify ZIP integrity, that `manifest.json` is at its root, and that its entries match `extension/` exactly.
4. Make only the requested source or documentation improvements. Keep English and Persian installation steps aligned, distinguishing the extension-only ZIP from GitHub's source ZIP.
5. Review the diff and tracked files for credentials, personal paths, private keys, browser profiles, and unintended files. Keep `dist/`, ZIP files, and duplicate unpacked release copies out of Git.
6. Run the relevant checks after changes, commit and push to `main` when authorized, and verify CI for the pushed commit.

## Prepare a release for approval

Follow [RELEASE.md](RELEASE.md). When asked to prepare a release, create or update a **draft** for the requested version, targeting the exact reviewed commit. Attach `dist/chat-folder-click-edge-v2.1.0.zip`, include installation instructions and verification results, and state which manual Edge checks remain.

Creating a draft is not approval to publish it. Keep the release unpublished and do not publish a version tag or submit to Edge Add-ons until the user confirms real Edge smoke tests and approves the release. Do not report automated checks as manual browser test results.

## Report

Report the pushed commit, CI status, draft release URL, attached package verification, and any remaining manual checks or missing permissions.
