# Privacy Policy - Chat Folder Click

Last updated: November 3, 2026  
Developer: Mahdi Ghahremani  
Contact: https://github.com/TheLouisMahdi

## What the extension accesses

Chat Folder Click uses Microsoft Edge's File System Access API to access **only a folder the user explicitly selects and authorizes**. It can list directories, read supported local files, and write changes after an action is approved. The selected directory handle is stored in the extension's own IndexedDB to attempt to restore the workspace. Edge may require permission again later.

## Data shared with ChatGPT

The extension does not automatically upload the whole directory. When the user chooses **Send text**, **Attach to ChatGPT**, **Share file tree**, or accepts a structured file request and returns its result to the chat, file names and/or contents may be staged in the ChatGPT page. The user controls sending the message or attachment. Once sent, that data is subject to OpenAI's privacy policies and account settings.

The content script observes ChatGPT assistant messages on the supported site in order to identify an optional structured request. Such requests do not execute automatically. Write operations require a review/approval step, and any automatic read/list queueing setting still requires manual execution.

## Data stored locally

- **Edge extension storage:** selected theme and other local preferences.
- **Extension IndexedDB:** a reference/handle to the previously selected folder.
- **Extension session storage:** pending action and latest result for the active session.

This version has no developer-operated backend, analytics SDK, advertising SDK, or telemetry endpoint. It does not intentionally send file contents to the developer. It interacts with ChatGPT only when the user chooses to do so.

## User controls

You may switch workspaces, stop using the ChatGPT bridge, revoke directory access through Edge permissions, remove the extension, or clear the extension's data. Review the content of messages and attachments before sending. Avoid transmitting confidential projects, passwords, API keys, certificates, or private keys.

## Changes and contact

We may revise this policy if features or data handling change. Questions or privacy concerns may be raised through the project's GitHub repository or the developer's profile: https://github.com/TheLouisMahdi.

Chat Folder Click is an independent project and is not operated or endorsed by OpenAI or Microsoft.
