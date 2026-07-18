---
"@flextable/react": patch
"@flextable/react-ui": patch
"@flextable/react-crud": patch
"@flextable/vue": patch
"@flextable/vue-ui": patch
"@flextable/vue-crud": patch
---

Fix `workspace:*` dependency specifiers leaking into published packages, which made `npm install` fail for consumers with errors like `Workspace dependency "@flextable/core" not found`. `changeset publish` falls back to plain `npm publish` for Bun workspaces (it only rewrites workspace ranges for pnpm), so the release workflow now resolves `workspace:*` to real versions before publishing.
