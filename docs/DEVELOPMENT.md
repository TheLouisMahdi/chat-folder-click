# Development notes

## Architecture

This is a browser-only Microsoft Edge **Manifest V3** extension using vanilla JavaScript and CSS. There is no runtime build step, external package dependency, local process or developer-hosted service.

```text
extension/
  manifest.json     Extension metadata and permissions
  background.js     Side panel setup and queued-action message handling
  core.js           Protocol parser, validator and path helpers
  content.js        Optional ChatGPT message detection and composer bridge
  app.html          Side-panel markup
  app.css           Three themes and responsive layout
  app.js            Folder picker, explorer, editing, permissions and action review
  icons/            Extension icons
```

The browser File System Access API provides handles for the directory explicitly chosen by the user. A handle can be stored in IndexedDB, but access remains subject to browser permission prompts. Extension preferences use `chrome.storage.local`; pending action state uses `chrome.storage.session`.

## Model-request protocol

Accepted `bridge` value: `chat-folder-click`. Supported actions: `list`, `read`, `edit`, `write`, `create`, `attach` (experimental). Paths are relative to the selected directory. JSON requests are untrusted content and must be validated, previewed, and approved. At most one queued model action is supported at a time. No model-requested delete, Git operation, executable launch or shell command exists.

The code includes basic rejection of path traversal and protected `.git` path segments. This is **not** a substitute for an independent security audit. Do not broaden filesystem permissions or automatically run untrusted requests.

## Setup and testing

Install unpacked from the `extension/` directory in Edge. No `npm install` step is required for normal use or tests. For developers with Node.js 20+:

```sh
npm run check
```

This runs JavaScript syntax checks and protocol/manifest tests. It does **not** perform interactive Edge UI tests or prove successful ChatGPT uploads. For real-world testing, use a disposable directory and verify permission prompts, read/edit/save, browser restart, UI themes, manual JSON fallback and attachments separately.

## Packaging for Edge Add-ons

With Python 3 available for maintainer workflows (not normal users):

```sh
python scripts/package_edge.py
```

The script packages `extension/` contents with `manifest.json` at the root, in `dist/chat-folder-click-edge-v2.1.0.zip`. GitHub Actions also runs checks and produces the artifact. `dist/` is ignored by Git.

## Release discipline

Do not claim the extension is a native ChatGPT tool. Check privacy disclosures whenever permissions, transfers, storage or third-party integrations change. Keep `package.json` and `extension/manifest.json` versions aligned. Update the changelog and user docs when behavior changes.
