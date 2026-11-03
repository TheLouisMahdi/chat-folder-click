# User guide

## Install and select a workspace

1. Download and extract the repository archive.
2. Open Microsoft Edge's `edge://extensions` page.
3. Enable **Developer mode**, then choose **Load unpacked**.
4. Select the `extension/` directory containing `manifest.json`.
5. Click the extension icon to open the side panel. If needed, pin the icon from Edge's extension menu.
6. Select **Choose folder**, pick a local directory, and grant access in the browser prompt.

**Tip:** A folder handle may be remembered, but browser permissions can expire. Choose **Grant access** when prompted. Changing the folder does not copy its files anywhere.

## UI tour

- **Explorer:** directory tree, file search, text editor, create/rename/move/delete, Import and Download.
- **Chat link:** opt-in ChatGPT instructions and preferences for queueing or drafting responses.
- **Activity:** pending JSON request, preview and approval, last result, limited Undo and manual JSON fallback.
- **Themes:** White / Black / Terminal in the header.

### Editing safely

1. Open a UTF-8 file (maximum 2 MiB) in Explorer.
2. Edit in the text area. Review & save opens a change preview.
3. Confirm only after checking the target path and preview. If the file changed externally, reopen it before saving.
4. Consider keeping your own backup or Git commit before large edits; Undo is limited to some recent changes while the panel remains open.

### Import/export and file operations

Use **Import files** to copy user-selected files into the current folder, and **Download file** to export a selected file via the browser's download UI. Rename/Move applies to **individual files**, not folders. Folder deletion only supports empty folders. Some operations require confirmation.

## ChatGPT bridge: read a file

1. Open `https://chatgpt.com` in Edge.
2. In the side panel, choose **Chat link > Prepare ChatGPT**. Review the instructions that are drafted in ChatGPT and send them yourself.
3. Ask the model for a structured request, e.g.:

```json
{"bridge":"chat-folder-click","action":"read","path":"README.md"}
```

4. Select **Review in folder** beside the reply, if visible. If absent, paste the JSON into **Activity > Manual fallback** and queue it.
5. Review the pending action in Activity and approve. The extension reads the real file and displays the result.
6. Choose **Return to ChatGPT** to prepare a draft containing that result. **Press Send yourself.**

## ChatGPT bridge: propose an edit

For a small exact-match change the model may suggest:

```json
{
  "bridge": "chat-folder-click",
  "action": "edit",
  "path": "notes.txt",
  "find": "original exact line",
  "replace": "replacement line"
}
```

Approve only after verifying the target and content. `edit` works when `find` matches **exactly once**. `write` replaces an entire existing text file and `create` makes a new one. The bridge cannot run `git`, build commands or shell scripts.

## Sharing files with ChatGPT

Use **Send text** to draft supported text in ChatGPT. **Attach to ChatGPT** is experimental: staging a file in the page is not proof that the backend received it. Verify that it appears as an attachment before sending, or use ChatGPT's normal attachment button instead. Large or binary files may need to be attached manually.

## Troubleshooting

| Symptom | What to try |
| --- | --- |
| Extension does not load | Select the folder with `manifest.json`, not the ZIP or repository root |
| File access denied after Edge restart | Reopen the panel and click **Grant access** for the selected folder |
| No ChatGPT review button | Check that ChatGPT was opened in Edge; use **Activity > Manual fallback** |
| Model says it changed a file, but nothing changed | Check **Activity** for a real approved operation and success result |
| Attachment does not appear | Attach manually using ChatGPT's normal upload control |
| File too large or binary | Use Download or another application rather than the UTF-8 editor |
| File was modified elsewhere | Reopen it and verify its latest content before saving |

Never paste a local secret merely to test the bridge. Start with a disposable folder and non-confidential text.
