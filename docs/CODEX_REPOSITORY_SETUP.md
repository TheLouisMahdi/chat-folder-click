# Codex handoff: create the GitHub repository

Copy the instruction below into Codex and point it at the extracted `chat-folder-click/` directory. This package includes the complete repository source. **Do not regenerate or replace extension functionality just to create the repository.**

---

## Task

Create a clean, public GitHub repository under the authenticated account `TheLouisMahdi` for the existing **Chat Folder Click** Microsoft Edge extension.

- Target repository name: `chat-folder-click`
- Default branch: `main`
- Description: `Local folder explorer and editor for Edge with optional user-approved ChatGPT integration.`
- Suggested topics: `microsoft-edge`, `browser-extension`, `manifest-v3`, `file-system-access-api`, `chatgpt`, `javascript`, `open-source`
- License: MIT, **already present in `LICENSE`**. Do not add a second license.
- Initial version: `2.1.0` (already in `extension/manifest.json` and `package.json`).

## Required steps

1. Inspect the extracted directory and ensure repository root contains `README.md`, `LICENSE`, `extension/`, `tests/`, `.github/`, and `docs/`.
2. Review `.gitignore` and scan all tracked files for accidental credentials, tokens and personal paths. Do not commit `dist/`, ZIP files, browser profiles or private keys. Treat unusual files as potential secrets.
3. Run `npm run check` (Node.js >= 20) and `python scripts/package_edge.py` (Python 3). Verify the Edge ZIP includes `manifest.json` at its root. Do not present unsupported Edge UI/manual tests as passed.
4. Check GitHub CLI authentication (`gh auth status`). If authentication or permission is missing, stop before remote operations and request user login. Do not embed tokens.
5. Determine whether `TheLouisMahdi/chat-folder-click` exists. If it **already exists**, do not overwrite history or push without reconciling existing changes with the user.
6. If it does not exist and permissions allow, initialize a new Git repository using `main`, commit the existing source/doc files with a clear message, and create the **public** GitHub repository. Push only the intended source branch. Do not force-push.
7. Set the repository description and topics. Confirm MIT is detected by GitHub and the README renders correctly. Check CI status.
8. Change `homepage_url` in `extension/manifest.json` to the new repository's verified HTTPS URL **only after the repository exists**. Re-run checks and commit/push the adjustment. Update documentation if needed; do not invent a repository URL in advance.
9. Do **not** tag `v2.1.0` or submit to Edge Add-ons until the user has confirmed real Edge smoke tests and reviewed the release. Prepare the release artifacts, summarize how to publish, and ask for the final release go-ahead.

## Final report

Report: exact repository URL, branch, commit hash, public visibility, detected license, topics, test results, CI status, packaging outcome, and remaining manual verification. Explicitly state any missing permissions or incomplete steps. Avoid edits unrelated to release preparation.
