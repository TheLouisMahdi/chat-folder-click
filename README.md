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

### From a release ZIP

1. Open [GitHub Releases](https://github.com/TheLouisMahdi/chat-folder-click/releases). Once v2.1.0 is published, download **`chat-folder-click-edge-v2.1.0.zip`** from its **Assets**. If no release is published yet, use the source ZIP steps below.
2. Use **Extract All** on the ZIP. Keep the extracted folder in a permanent location; Edge loads the extension from it.
3. In Edge, open `edge://extensions`, enable **Developer mode**, and select **Load unpacked**.
4. Select the extracted folder containing **`manifest.json`** directly. The release ZIP has no inner `extension` folder. Do not select the ZIP itself.
5. Open Edge's extensions menu and click **Chat Folder Click** to open the side panel. Pin its icon if desired.

### From the source ZIP

On the [repository page](https://github.com/TheLouisMahdi/chat-folder-click), choose **Code > Download ZIP** and **Extract All**. Follow steps 3–5 above, but select the **`extension` subfolder** inside the extracted repository. GitHub's **Source code (zip)** release download also uses this layout.

## First use: open and edit a local file

1. In the side panel, click **Choose folder**, select a local folder, and grant access. Start with a disposable folder containing a `notes.txt` file.
2. In **Explorer**, expand folders and select a UTF-8 text file. Edit its contents, click **Review & save**, inspect the preview, and choose **Apply changes** to save to disk.
3. Use **New file** / **New folder**, **Import files**, or **Download file** as needed. Use **Choose folder** again to switch workspaces, or **Grant access** if Edge asks to reopen a remembered folder.
4. Choose **White**, **Black**, or **Terminal** in the header. Keep a backup of important files; Undo is limited to recent changes while the panel stays open.

For more workflows and troubleshooting, see the [step-by-step user guide](docs/USAGE.md).

## Working with ChatGPT (optional)

1. Open `https://chatgpt.com` in Edge.
2. In the extension, open **Chat link** and select **Prepare ChatGPT**. Review the drafted instructions and press **Send** yourself.
3. ChatGPT can propose a single JSON file request such as:

```json
{"bridge":"chat-folder-click","action":"read","path":"README.md"}
```

4. Use a path that exists in your selected folder (for the example above, that folder must contain `README.md`). If **Review in folder** appears below the model reply, select it. Otherwise paste the JSON into **Activity > Manual fallback** and click **Queue JSON request**.
5. Open **Activity**, check the pending path and action, then click **Review & execute** and confirm the operation. Check **Last operation** for the actual result. Use **Return to ChatGPT** to draft it in the conversation, then press **Send** yourself.

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

See [docs/RELEASE.md](docs/RELEASE.md) for draft release preparation, manual Edge checks, and the Edge Add-ons submission checklist. [Maintainer handoff](docs/CODEX_REPOSITORY_SETUP.md) covers this existing repository. Real Edge smoke tests and Edge Add-ons approval are **not yet verified**; draft releases remain pending maintainer approval.

## License

MIT © 2026 Mahdi Ghahremani. See [LICENSE](LICENSE). Permission applies to the code and original project assets in this repository; third-party trademarks and services are not part of this project.
