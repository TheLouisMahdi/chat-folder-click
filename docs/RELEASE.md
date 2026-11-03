# Release and publication checklist

## GitHub

1. Review all files for secrets, copyrighted third-party assets and project-specific data before making the repository public.
2. Use repository name `chat-folder-click`, description and topic suggestions from `docs/CODEX_REPOSITORY_SETUP.md`.
3. Commit the files from this package, with `README.md`, `LICENSE`, `.gitignore` and `.github/workflows/ci.yml` at the repository root. Do not commit any nested ZIP or `dist/` directory.
4. Run `npm run check` and review the CI result.
5. Add real screenshots of the current v2.1 UI once verified in Edge (do not use unverified mockups as product screenshots).
6. After smoke testing on Edge, create release tag `v2.1.0` and attach the packaged Edge ZIP.

## Package Edge ZIP

Generate the extension-only ZIP via `python scripts/package_edge.py` or GitHub Actions. Confirm `manifest.json` is **at the ZIP root**, alongside the HTML, JS, CSS and icons. Do not package repository docs or secrets in the store ZIP.

## Edge Add-ons

1. Register or sign in at https://developer.microsoft.com/en-us/microsoft-edge/extensions.
2. Submit the extension ZIP in Partner Center.
3. Confirm name, short description and manifest permissions accurately describe the extension.
4. Provide a product description, actual screenshots, and the available `store-assets/logo-300.png` icon. Other promotional assets may be used if they match the released UI.
5. Publish an accessible privacy policy at the repository's `PRIVACY.md` page and provide that URL in Partner Center as applicable. The link must be verified after repository creation.
6. Disclose the purpose of `sidePanel`, `storage`, `tabs`, ChatGPT host permissions, and user-selected directory access. Do not claim a native ChatGPT filesystem tool or automatic background uploads.
7. Test all major operations in Edge, including manual JSON fallback and explicit consent; verify store submission requirements and privacy details before publishing.

Store approval and ChatGPT website compatibility are **not guaranteed**.

Official documentation:
- https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension
- https://learn.microsoft.com/en-us/legal/microsoft-edge/extensions/developer-policies

## Suggested store listing text

**Short:** Explore and edit a chosen local folder in Edge, with optional, user-approved ChatGPT file requests.

**Full:** Chat Folder Click is a lightweight local workspace for Microsoft Edge. Choose a folder using the browser's file picker, navigate its directory tree, and open, edit, create, move, import, or export supported files. Review edits before saving and switch between White, Black, and Terminal themes. If you opt in, a ChatGPT webpage bridge can recognize structured file requests and help you review local reads and edits before they run. The extension does not provide ChatGPT with native filesystem access or execute terminal commands. File sharing and experimental attachments require your attention and confirmation; the website integration may be affected by ChatGPT updates. No API key or local proxy is required for normal use.
