# Chat Folder Click

**A local folder explorer and editor for Microsoft Edge, with optional, user-approved ChatGPT integration.**

[Read in Persian / راهنمای فارسی](README.fa.md) · [User guide](docs/USAGE.md) · [Privacy](PRIVACY.md) · [MIT license](LICENSE)

Created by **Mahdi Ghahremani** ([TheLouisMahdi](https://github.com/TheLouisMahdi)).

Chat Folder Click lets you choose a directory on your computer, navigate its tree, and edit supported files in an Edge side panel. If you choose to use its ChatGPT bridge, the extension can detect **structured file requests in ChatGPT messages**, let you review them, and return the real result to the chat. No OpenAI API key, proxy, Node.js installation, or terminal is needed **for normal extension use**.

> **Not affiliated with OpenAI or Microsoft.** This extension is not a native ChatGPT tool or a replacement for Codex. ChatGPT webpage integration is best-effort and may need manual copy/paste after website changes.

## Features

- **Folder tree:** expand/collapse directories, warm orange branch lines and file icons, project search, three themes (White, Black, Terminal).
- **Local file workspace:** open/edit UTF-8 text, review changes, save, create files/folders, rename/move individual files, import/export files, and remove supported entries with confirmation.
- **Change safeguards:** confirm destructive actions, detect external edits, and undo some recent changes while the panel is open.
- **Optional ChatGPT bridge:** review one structured `list`, `read`, `edit`, `write`, `create`, or experimental `attach` request at a time; file writes require approval.
- **Local-first:** files stay on your computer until you explicitly choose to share their contents with ChatGPT.

## Install on Microsoft Edge (no command line)

1. Download the project ZIP from [GitHub](https://github.com/TheLouisMahdi/chat-folder-click) via **Code > Download ZIP** and **Extract All**.
2. Navigate to `edge://extensions`, enable **Developer mode**, and select **Load unpacked**.
3. Select the **`extension` folder** (the folder containing `manifest.json`), not the repository root.
4. Click the Chat Folder Click icon to open the side panel. Click **Choose folder**, select a directory, and grant permission.
5. Switch between the **White**, **Black**, and **Terminal** themes as preferred.

For screenshots, workflows, re-opening a folder and troubleshooting, see the [step-by-step user guide](docs/USAGE.md).

## Working with ChatGPT (optional)

1. Open `https://chatgpt.com` in Edge.
2. In the extension, open **Chat link** and select **Prepare ChatGPT**. Review the drafted instructions and press **Send** yourself.
3. ChatGPT can propose a single JSON file request such as:

```json
{"bridge":"chat-folder-click","action":"read","path":"README.md"}
```

4. If a **Review in folder** button appears below the model reply, select it. Otherwise paste the JSON into **Activity > Manual fallback**.
5. Review and confirm the request. The extension reads or edits the selected folder. Use **Return to ChatGPT** to draft the actual result, then press **Send** yourself.

**Important:** The model does not directly access your disk. The extension performs approved operations and passes results through the webpage. Never assume a model-suggested change was applied until the extension confirms it.

## Capabilities and limits

| Area | Current behavior |
| --- | --- |
| Folder access | User-selected folder via Edge File System Access API; browser may ask permission again |
| Text files | UTF-8 editor up to 2 MiB per file |
| Rename/move | Individual files up to 16 MiB; folder move is not supported |
| Import | Individual files up to 16 MiB |
| Explorer search | Up to 2,200 entries, 8 levels deep; excluded directories include `.git` and `node_modules` |
| Model bridge | One structured request per reply; requires user approval |
| ChatGPT attachment | Experimental; verify upload in the composer before sending |
| Build, Git CLI, shell | **Not supported** by this browser-only extension |

The complete feature and security boundaries are documented in [Technical notes](docs/TECHNICAL_NOTES.md).

## Permissions and privacy

The extension requests `sidePanel`, `storage`, `tabs`, and site access to `chatgpt.com` / `chat.openai.com`. A folder is selected only through the browser's directory picker. There is **no developer-hosted backend, telemetry, or analytics** in this version. File contents can reach ChatGPT only through actions you approve; content you send to ChatGPT is subject to OpenAI's policies. See [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md).

## Development

No runtime dependencies. Node.js 20+ is only needed if you want to run the repository's tests:

```sh
npm run check
```

Source: [`extension/`](extension/) · Tests: [`tests/`](tests/) · Dev guide: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) · Contributions: [CONTRIBUTING.md](CONTRIBUTING.md)

## Publishing

See [docs/RELEASE.md](docs/RELEASE.md) for an Edge Add-ons submission checklist and [docs/CODEX_REPOSITORY_SETUP.md](docs/CODEX_REPOSITORY_SETUP.md) for Codex instructions to create the GitHub repository. The public storefront release and real Edge acceptance are **not yet verified**.

## License

MIT © 2026 Mahdi Ghahremani. See [LICENSE](LICENSE). Permission applies to the code and original project assets in this repository; third-party trademarks and services are not part of this project.
