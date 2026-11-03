# Contributing

Contributions, reproducible bug reports, accessibility fixes and documentation improvements are welcome.

1. Search existing issues before creating a new one. Include your Microsoft Edge version, extension version, expected behavior, actual behavior, and reproduction steps. **Redact local file contents, tokens and paths containing private information.**
2. Fork the repository and create a focused branch for one change.
3. Keep changes small; the extension intentionally avoids a heavy framework and runtime dependencies.
4. Run `npm run check` using Node.js 20+ before submitting a pull request. Test browser-only features manually in Edge when feasible.
5. Include an explanation of any new permissions, new network behavior or change to user confirmation. Update `PRIVACY.md` when data handling changes.
6. Open a PR against `main`, describing what was tested and which parts still need manual verification.

Do not add scripts that execute system commands on users' machines. No source file should include private API keys, credentials or personal data. Contributions are expected to be distributable under the repository's MIT license.
