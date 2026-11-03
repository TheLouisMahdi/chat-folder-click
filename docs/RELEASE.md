# Release and publication checklist

## GitHub

1. Use the existing [TheLouisMahdi/chat-folder-click](https://github.com/TheLouisMahdi/chat-folder-click) repository on `main`; do not recreate it. Retain the existing MIT license.
2. Review the intended diff and tracked files for secrets, copyrighted third-party assets, and project-specific data. Do not commit ZIPs, `dist/`, or duplicate unpacked release copies.
3. Run `npm run check`, generate and verify the extension ZIP below, then commit and push the intended improvements. Confirm CI passes for the exact pushed commit.
4. Create or update a **draft** release titled `Chat Folder Click v2.1.0`, with tag name `v2.1.0` and the exact reviewed commit as its target. Attach `chat-folder-click-edge-v2.1.0.zip` and its SHA-256 checksum. Include installation steps, automated verification, and pending manual checks in the release notes.
5. Complete the real Edge smoke tests below and add actual screenshots if available (do not use unverified mockups as product screenshots).
6. Leave the release in draft until the user approves publication. Only then publish the release and version tag. Edge Add-ons submission requires separate approval.

## Package Edge ZIP

Generate the extension-only ZIP via `python scripts/package_edge.py` or GitHub Actions. Confirm `manifest.json` is **at the ZIP root**, alongside the HTML, JS, CSS and icons. Do not package repository docs or secrets in the store ZIP.

Verify archive integrity, version `2.1.0`, all manifest-referenced files, and that every ZIP entry matches `extension/`. Record the ZIP's SHA-256 checksum. The [README installation steps](../README.md#install-on-microsoft-edge-no-command-line) explain how to extract and load this package; GitHub's source ZIP instead requires selecting its `extension/` subfolder.

## Manual Edge checks before publication

Use a disposable folder and non-confidential files. Automated syntax and protocol checks do not establish that these browser workflows pass.

- Load the extracted extension ZIP in Edge and confirm that the side panel opens.
- Choose a folder, grant permission, browse and edit a text file, review/save it, and verify the change on disk. Check create, rename/move, import/download, and confirmed deletion of disposable entries.
- Check White / Black / Terminal themes, switching folders, and reopening the panel after browser restart, granting access again if prompted.
- In ChatGPT, test Prepare ChatGPT, a reviewed read/edit request, Manual fallback, and Return to ChatGPT with the user pressing Send.
- If using experimental attachments, verify that the attachment appears in the composer before sending.

## Edge Add-ons

1. Register or sign in at https://developer.microsoft.com/en-us/microsoft-edge/extensions.
2. Submit the extension ZIP in Partner Center.
3. Confirm name, short description and manifest permissions accurately describe the extension.
4. Provide a product description, actual screenshots, and the available `store-assets/logo-300.png` icon. Other promotional assets may be used if they match the released UI.
5. Verify the public [privacy policy](https://github.com/TheLouisMahdi/chat-folder-click/blob/main/PRIVACY.md) is accessible and provide that URL in Partner Center as applicable.
6. Disclose the purpose of `sidePanel`, `storage`, `tabs`, ChatGPT host permissions, and user-selected directory access. Do not claim a native ChatGPT filesystem tool or automatic background uploads.
7. Test all major operations in Edge, including manual JSON fallback and explicit consent; verify store submission requirements and privacy details before publishing.

Store approval and ChatGPT website compatibility are **not guaranteed**.

Official documentation:
- https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension
- https://learn.microsoft.com/en-us/legal/microsoft-edge/extensions/developer-policies

## Suggested store listing text

**Short:** Explore and edit a chosen local folder in Edge, with optional, user-approved ChatGPT file requests.

**Full:** Chat Folder Click is a lightweight local workspace for Microsoft Edge. Choose a folder using the browser's file picker, navigate its directory tree, and open, edit, create, move, import, or export supported files. Review edits before saving and switch between White, Black, and Terminal themes. If you opt in, a ChatGPT webpage bridge can recognize structured file requests and help you review local reads and edits before they run. The extension does not provide ChatGPT with native filesystem access or execute terminal commands. File sharing and experimental attachments require your attention and confirmation; the website integration may be affected by ChatGPT updates. No API key or local proxy is required for normal use.
