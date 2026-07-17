# FlexTable

[![CI](https://github.com/DoniLite/Flextable/actions/workflows/ci.yml/badge.svg)](https://github.com/DoniLite/Flextable/actions/workflows/ci.yml)
[![Docs](https://github.com/DoniLite/Flextable/actions/workflows/docs.yml/badge.svg)](https://github.com/DoniLite/Flextable/actions/workflows/docs.yml)
[![License: Apache-2.0](https://img.shields.io/npm/l/@flextable/core.svg)](https://github.com/DoniLite/Flextable/blob/main/LICENSE)

A framework-agnostic data table: a shared, typed `ColumnFactory` core, idiomatic React and Vue
render layers on top of [TanStack Table](https://tanstack.com/table), self-sufficient default UI
primitives, and optional CRUD-dialog add-ons. Container-query responsive, ships precompiled
stylesheets, fully overridable at every layer.

**Docs, guides, and live demos: [donilite.github.io/Flextable](https://donilite.github.io/Flextable)**

## Packages

| Package | Version | Description |
| --- | --- | --- |
| [`@flextable/core`](packages/core) | [![npm](https://img.shields.io/npm/v/@flextable/core.svg)](https://www.npmjs.com/package/@flextable/core) | Framework-agnostic `ColumnFactory`, pagination, error, and i18n classes |
| [`@flextable/react`](packages/react) | [![npm](https://img.shields.io/npm/v/@flextable/react.svg)](https://www.npmjs.com/package/@flextable/react) | `FlexTable` component and hooks for React |
| [`@flextable/react-ui`](packages/react-ui) | [![npm](https://img.shields.io/npm/v/@flextable/react-ui.svg)](https://www.npmjs.com/package/@flextable/react-ui) | Default Radix-based primitives for `@flextable/react` |
| [`@flextable/react-crud`](packages/react-crud) | [![npm](https://img.shields.io/npm/v/@flextable/react-crud.svg)](https://www.npmjs.com/package/@flextable/react-crud) | Entity editor and async-store glue for React |
| [`@flextable/vue`](packages/vue) | [![npm](https://img.shields.io/npm/v/@flextable/vue.svg)](https://www.npmjs.com/package/@flextable/vue) | `FlexTable.vue` and composables for Vue 3 |
| [`@flextable/vue-ui`](packages/vue-ui) | [![npm](https://img.shields.io/npm/v/@flextable/vue-ui.svg)](https://www.npmjs.com/package/@flextable/vue-ui) | Default reka-ui-based primitives for `@flextable/vue` |
| [`@flextable/vue-crud`](packages/vue-crud) | [![npm](https://img.shields.io/npm/v/@flextable/vue-crud.svg)](https://www.npmjs.com/package/@flextable/vue-crud) | Server pagination/filter handlers for Vue |

## Quick start

```sh
# React
bun add @flextable/core @flextable/react @flextable/react-ui @tanstack/react-table

# Vue
bun add @flextable/core @flextable/vue @flextable/vue-ui @tanstack/vue-table
```

See the [Getting started — React](https://donilite.github.io/Flextable/guides/getting-started-react/)
and [Getting started — Vue](https://donilite.github.io/Flextable/guides/getting-started-vue/) guides,
or the [live demo](https://donilite.github.io/Flextable/guides/live-demo/) for both frameworks
side by side.

## Repository layout

This is a Bun workspaces monorepo:

```text
packages/   the 7 published packages listed above
apps/docs/  the Astro Starlight documentation site (donilite.github.io/Flextable)
```

## Developing

```sh
bun install
bun run build       # staged build: core -> react/vue/*-ui -> *-crud
bun run typecheck
bun test
bun run lint
```

Releasing a version is a maintainer-only, two-step process (Changesets + a tag-gated publish
workflow) — see [RELEASING.md](RELEASING.md).

## License

[Apache-2.0](LICENSE)
