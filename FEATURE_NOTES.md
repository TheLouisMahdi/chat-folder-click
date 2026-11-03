# Chat Folder Click 2.1

A small, browser-only, local-folder workspace for Microsoft Edge and ChatGPT. No Node.js installation, local proxy, MCP server, CLI, API key, or cloud account is required for the **local explorer/editor**.

## Install in Edge (click-only)

1. Extract `chat-folder-click-v2.1.zip` using Windows File Explorer.
2. In Edge, open `edge://extensions`.
3. Turn on **Developer mode**, click **Load unpacked**, and choose the **extension** directory inside `chat-folder-click-v2.1`.
4. Click the **Chat Folder Click** extension's icon to open its side panel. Pin the extension if desired.
5. Choose a folder using **Choose folder**, grant access, and expand the folder icon in the file tree.

If version 1.1 is already installed, disable or remove it to avoid two almost-identical extensions. This v2 package does not modify the previous installation automatically.

## Themes and tree UI

- White, Black, Terminal themes, saved locally.
- Collapsible directory tree with warm orange branch connectors.
- Original folder icons with orange tabs and gray bodies, plus generic text, code and image-file icons.
- Lazy-loading directory branches to avoid scanning an entire large repository upfront.
- Filter loaded paths, or use **Search entire project** to index up to 2,200 entries (8 nested levels). Ignored: `.git`, `node_modules`, `build`, `dist`, `.next`, `.venv`, `venv`, `__pycache__`. Hidden entries can be shown separately except these protected/excluded directories.

## Files (local access)

- Choose/reconnect to a project directory and browse subdirectories.
- Create text files and directories.
- Read/edit/save UTF-8 text files up to 2 MiB, and review before/after snippets before writing.
- Rename/move individual files (up to 16 MiB) using a safe copy/verify/remove sequence. Folder rename/move is **not** implemented.
- Delete individual files and **empty** folders, with explicit confirmation.
- Undo last 5 supported changes **while the side panel remains open**. Undo history does not persist across restarts, and is not a full filesystem transaction log.
- Import individual files up to 16 MiB per file into the currently selected folder. Export the selected file with the browser download UI.
- Warn on unsaved changes and external changes detected during edits. Large/binary files cannot be opened in the text editor.

**Important:** Permissions cover the folder you deliberately select, so avoid sharing sensitive repositories or secrets with ChatGPT. The extension does not upload the whole directory by default.

## ChatGPT bridge (best-effort website integration)

1. Open `https://chatgpt.com` in Edge and click **Prepare ChatGPT** under **Chat link** in the extension.
2. Review the workspace instruction drafted in the ChatGPT composer, then click Send yourself.
3. The model can propose one JSON action per reply. The extension detects the reply and adds **Review in folder** when possible.
4. Open the extension **Activity** tab and approve the request. For write/edit/create, review the change preview before confirmation.
5. Use **Return to ChatGPT** to prepare a draft of the actual operation result, then press Send. If the website integration fails, the result is copied to the clipboard for manual paste.
6. If message detection fails because ChatGPT changed its webpage layout, paste the model's JSON directly into **Activity > Manual fallback**.

Supported structured model actions: `list`, `read`, `edit` (one exact unique match), `write` (replace entire existing UTF-8 text file), `create` (new text file), and `attach` (experimental staging). No model-initiated `delete`, directory delete, shell command or Git operation exists. Model actions are bounded by the chosen directory and require user approval; optional auto-queue does not auto-run.

### Example request

```json
{"bridge":"chat-folder-click","action":"read","path":"README.md"}
```

### Limits of the browser integration

- This extension **does not grant ChatGPT native tool or filesystem access**. It acts via a browser content script and a deliberately limited JSON message protocol.
- Inserting a draft into the ChatGPT composer is best-effort. It can break with ChatGPT UI updates; manual copy/paste is a fallback.
- Staging an attachment uses a browser input event and **cannot confirm the ChatGPT backend received it**. Verify the file appears in ChatGPT before pressing Send. Manual attachment may be necessary.
- Browser-only architecture cannot run PowerShell, compile a C++ project, run local tests or commit to Git.
- The extension supports file read/write, not automatic retrieval/download of arbitrary server-side ChatGPT attachments.
- Reading text from the workspace for the model is limited to 26,000 characters per request and files up to 2 MiB. Sensitive-looking paths (`.env`, `.pem`, etc.) are blocked from automatic model read actions, and require explicit consent for manual sharing.

## Permissions

Manifest V3 permissions: `sidePanel`, `storage`, and `tabs`. Host permissions are limited to `https://chatgpt.com/*` and `https://chat.openai.com/*`. The File System Access API requests access only to the folder chosen by the user. Folder handle is stored in the extension's own IndexedDB so it may be restored after a restart, subject to Edge permissions.

## Quality checks

- `node tests/test-core.cjs` runs pure protocol, path validation, and manifest tests (only needed for developers).
- JavaScript syntax checks and static HTML target checks performed before packaging.
- Automated Chromium interaction could not be completed in the packaging environment due to browser launch restrictions. **Actual Edge UI and ChatGPT integration must be validated on the user's Windows installation.**

## File layout

```text
chat-folder-click-v2.1/
  extension/
    manifest.json
    app.html
    app.css
    app.js
    core.js
    content.js
    background.js
  tests/
    test-core.cjs
  README.md
```
