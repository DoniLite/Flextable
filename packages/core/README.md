# @flextable/core

[![npm version](https://img.shields.io/npm/v/@flextable/core.svg)](https://www.npmjs.com/package/@flextable/core)
[![npm downloads](https://img.shields.io/npm/dm/@flextable/core.svg)](https://www.npmjs.com/package/@flextable/core)
[![CI](https://github.com/DoniLite/Flextable/actions/workflows/ci.yml/badge.svg)](https://github.com/DoniLite/Flextable/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/npm/l/@flextable/core.svg)](https://github.com/DoniLite/Flextable/blob/main/LICENSE)

Framework-agnostic core of [FlexTable](https://donilite.github.io/Flextable): the `ColumnFactory`
column registry, sorting/filtering/pinning/pagination helpers, and the `ApiError`/i18n adapters
shared by [`@flextable/react`](https://www.npmjs.com/package/@flextable/react) and
[`@flextable/vue`](https://www.npmjs.com/package/@flextable/vue). Zero framework dependencies —
this package never imports React or Vue.

## Install

```sh
bun add @flextable/core
```

You won't usually install this directly — it's a peer/dependency of `@flextable/react` and
`@flextable/vue`, which pull it in automatically.

## What's in here

- **`ColumnFactory`** — a typed column builder (`select`, `avatar`, `name`, `text`, `date`, `count`,
  `badge`, `actions`, `expandRow`, plus `registerColumnType`/`custom` for your own kinds) that
  produces framework-agnostic `ColumnConfig` descriptors. `@flextable/react`'s `toReactColumnDef()`
  and `@flextable/vue`'s `toVueColumnDef()` turn those into real TanStack Table column defs.
- **`PaginationController`** — shared client/server pagination math.
- **`ApiError`** — a base error class with an injectable `ErrorCodeAdapter`, decoupled from any
  specific backend contract.
- **Helpers** — `resolveClassName`, fuzzy-search filtering, date filtering, column-pinning math,
  sorting comparators.
- **Types** — `EntityLike`, `TranslateFn`, `FlexTableKeys`, `PaginatedResponse`/`PaginationQuery`.

## Docs

Full guides and the generated API reference live at
**[donilite.github.io/Flextable](https://donilite.github.io/Flextable)**.

## License

[Apache-2.0](https://github.com/DoniLite/Flextable/blob/main/LICENSE)
