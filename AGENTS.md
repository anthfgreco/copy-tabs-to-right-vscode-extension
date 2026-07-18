# Repo instructions

- Use pnpm.
- This VS Code extension copies the active tab and tabs to its right into one Markdown payload. Visual tab order is preserved.
- Core implementation is `src/extension.ts`.
- Tests are in `src/test/extension.test.ts`.
- Before handoff, run `pnpm fmt`, `pnpm lint:fix`, `pnpm test`, and `git diff --check`. `pnpm test` compiles and launches the VS Code host.
- Do not bump versions, create tags, or publish unless explicitly requested. Release command: `vsce publish patch`.
- Update `CHANGELOG.md` with concise, user-facing changes. Omit tooling and internal implementation details.
