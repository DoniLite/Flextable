# @flextable/react-ui

[![npm version](https://img.shields.io/npm/v/@flextable/react-ui.svg)](https://www.npmjs.com/package/@flextable/react-ui)
[![npm downloads](https://img.shields.io/npm/dm/@flextable/react-ui.svg)](https://www.npmjs.com/package/@flextable/react-ui)
[![CI](https://github.com/DoniLite/Flextable/actions/workflows/ci.yml/badge.svg)](https://github.com/DoniLite/Flextable/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/npm/l/@flextable/react-ui.svg)](https://github.com/DoniLite/Flextable/blob/main/LICENSE)

Self-sufficient default React UI primitives for
[`@flextable/react`](https://www.npmjs.com/package/@flextable/react) — [Radix
UI](https://www.radix-ui.com)-based `Button`, `Badge`, `Checkbox`, `Avatar`, `DropdownMenu`, `Table`,
plus the `EntityAvatar`/`EntityTitle`/`EntityActionsMenu` entity components used by
`toReactColumnDef()`. Not a copy-paste shadcn setup — a real npm dependency, fully overridable via
`components` overrides on `toReactColumnDef()` if you'd rather bring your own design system.

## Install

```sh
bun add @flextable/react-ui
```

Installed automatically as a dependency of `@flextable/react` when you use its default primitives —
you don't need to add it separately unless you're importing components from here directly.

## Docs

Full guides and the generated API reference live at
**[donilite.github.io/Flextable](https://donilite.github.io/Flextable)**.

## License

[Apache-2.0](https://github.com/DoniLite/Flextable/blob/main/LICENSE)
