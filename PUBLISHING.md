# Publication checklist - Chat Folder Click 2.1.0

**Developer:** Mahdi Ghahremani  
**GitHub:** https://github.com/TheLouisMahdi/chat-folder-click

## GitHub

1. Work in the existing [TheLouisMahdi/chat-folder-click](https://github.com/TheLouisMahdi/chat-folder-click) repository. Follow the [maintainer handoff](docs/CODEX_REPOSITORY_SETUP.md); do not recreate it.
2. Commit the source and documentation from the repository root. Exclude `dist/`, ZIP files, and duplicate unpacked release copies.
3. Keep the existing [MIT license](LICENSE); do not add a second license.
4. Check for credentials and sensitive data before pushing. None are required by this extension.
5. Add screenshots and an accurate feature description. Do not claim native ChatGPT tool access or fully automatic file management.
6. Run `npm run check` and `python scripts/package_edge.py`, then review CI for the pushed commit. Prepare a **draft** v2.1.0 release targeting that commit and attach the extension ZIP. Publish the release and version tag only after the user confirms real Edge smoke tests and approves publication. See [docs/RELEASE.md](docs/RELEASE.md).

## Microsoft Edge Add-ons

1. Open https://developer.microsoft.com/en-us/microsoft-edge/extensions and sign into Partner Center with a registered developer account.
2. After real Edge smoke tests and final user approval, upload `dist/chat-folder-click-edge-v2.1.0.zip`; `manifest.json` is at the archive root.
3. Provide store listing metadata: **Chat Folder Click** and a full, accurate English description of at least 250 characters.
4. Upload `store-assets/logo-300.png` as the 1:1 extension logo (300 x 300). `store-assets/promo-440x280.png` is an optional tile.
5. Publish `PRIVACY.md` on a public, accessible HTTPS page in your repository and submit its URL in the privacy policy field as appropriate.
6. Explain `sidePanel`, `storage`, `tabs`, and the ChatGPT website host permissions in the form. Specify that the browser File System Access API asks the user to choose a directory.
7. Test unpacked loading, file read/write, project switch, permissions, and the ChatGPT integration on Microsoft Edge before submitting for store review.

Review Microsoft documentation: https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension

**Important:** This package is prepared for a submission attempt; it has not been submitted, approved, or tested against the Edge store certification process. Actual Edge execution and store acceptance must be verified by the developer.
