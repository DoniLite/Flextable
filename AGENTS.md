# AGENTS.md

Rules for anyone — human contributor or AI coding agent — making changes in this repository.
Claude Code also loads this file via the `@AGENTS.md` import at the top of [CLAUDE.md](CLAUDE.md),
which additionally carries a full Bun API cheatsheet.

## Project shape

FlexTable is a **Bun workspaces monorepo**: a framework-agnostic `@flextable/core` package plus
React and Vue render layers, default UI kits, and optional CRUD glue. See [README.md](README.md)
for the full package list.

```text
packages/*   the 7 published @flextable/* packages (core, react, react-ui, react-crud, vue, vue-ui, vue-crud)
apps/docs/   Astro Starlight docs site (donilite.github.io/Flextable) — private: true, never published to npm
```

## Tooling: Bun, always

Use Bun for everything in this repo — `bun install`, `bun run <script>`, `bun test`, `bun build`,
`bunx <pkg>`. Never reach for `npm`/`yarn`/`pnpm`/`node`/`ts-node`/`vitest`/`jest`/`webpack` here.
See [CLAUDE.md](CLAUDE.md) for the full Bun API reference (`Bun.serve`, `bun:sqlite`, etc.) —
most of it is generic guidance, not specific to this repo's runtime code.

Common commands, run from the repo root:

```sh
bun install
bun run build       # staged: core -> {react,vue,react-ui,vue-ui} -> {react-crud,vue-crud}
bun run typecheck    # per-package tsc / vue-tsc, via `bun run --filter '*'`
bun test
bun run lint         # biome check .
```

## Before committing

- `bun run lint` and `bun run typecheck` must pass; `bun test` for anything with coverage.
- Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/) —
  enforced by commitlint via a lefthook `commit-msg` hook. Biome also auto-fixes staged files via
  a lefthook `pre-commit` hook. Don't bypass either with `--no-verify` unless the user explicitly
  asks for it.
- Any change to a published package's runtime behavior needs a changeset: `bun run changeset`.
  Full workflow in [RELEASING.md](RELEASING.md#day-to-day-adding-a-changeset).

## Internal package dependencies: the `workspace:*` rule

Every `@flextable/*` package that depends on another one in this repo declares it as
`"workspace:*"` in `package.json`. **Never hand-write a real version number there** —
`workspace:*` is what lets local dev/build/test resolve siblings through the Bun workspace.

`changeset publish` (used by [`release.yml`](.github/workflows/release.yml)) only rewrites
`workspace:*` to a real version for `pnpm`; for every other package manager, including Bun, it
falls back to plain `npm publish`, which does **not** perform that rewrite — that shipped broken
`workspace:*` specifiers to npm consumers (see
[issue #3](https://github.com/DoniLite/Flextable/issues/3)).
[`scripts/rewrite-workspace-protocol.ts`](scripts/rewrite-workspace-protocol.ts) runs as part of
`bun run release`, right before `changeset publish`, to fix this up. If you touch the release
pipeline, don't remove that step without replacing what it does — and never "fix" a published
tarball by hand-editing the committed `workspace:*` values in `packages/*/package.json` instead.

## Releasing

Maintainer-only, two-step process: a Changesets "Version Packages" PR, then a tag-gated publish
that also cuts a GitHub Release. Full process in [RELEASING.md](RELEASING.md) — don't publish
packages any other way (no manual `npm publish` from a laptop except for the one-time bootstrap
documented there).

## Docs site

`apps/docs` is an Astro Starlight site, `private: true`, never published to npm.

- Pages under `apps/docs/src/content/docs/api/**` are generated at build time by
  `starlight-typedoc` from JSDoc in each package's `src/index.ts` entry point (see
  `apps/docs/astro.config.mjs`) and are gitignored. **Never hand-edit them** — edit the source
  JSDoc in `packages/*/src` instead and let the next build regenerate the page.
- Pages under `apps/docs/src/content/docs/guides/**` are hand-written Markdown/MDX and are the
  right place for prose documentation, tutorials, and the live demo.
