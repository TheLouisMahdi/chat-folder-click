# Security policy

## Scope and expectations

Chat Folder Click has no local daemon and cannot execute arbitrary shell commands. It uses the browser's folder permission model and requires a user to review and approve model-generated file operations. This is **not a security sandbox** for untrusted code, and the user-selected folder may contain secrets.

**Threat boundaries:** ChatGPT replies are untrusted input. Never approve a change you have not reviewed; a prompt injection in a project file may influence the model's next suggestion. The extension excludes `.git` and several large dependency folders, and blocks certain sensitive-looking names from automatic model reads, but filename checks do **not** guarantee that other secrets are safe. Do not rely on Undo as a backup.

The browser page integration and experimental attachment functionality may stop working when ChatGPT changes its UI. The extension cannot verify a ChatGPT backend upload; always check the composer before sending.

## Reporting vulnerabilities

Please do **not** include exploits, credential dumps, or other sensitive proof-of-concept data in a public issue. Contact the maintainer via [GitHub](https://github.com/TheLouisMahdi) to arrange a private disclosure route. If the repository enables GitHub private vulnerability reporting, prefer that channel. Avoid claiming a fix is deployed until a release is published.

## Supported versions

Only the current `2.1.x` release line is intended to receive fixes initially; maintenance is on a best-effort basis.
