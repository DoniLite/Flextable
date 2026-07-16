---
title: Internationalization
description: The TranslateFn injection pattern, the full FlexTableKeys reference, and how to override or remap them.
---

FlexTable never imports an i18n library — every string goes through a `TranslateFn` you provide:

```ts
type TranslateFn = (key: string, options?: Record<string, unknown>) => string;
```

Pass `useTranslation().t` (react-i18next), `useI18n().t` (vue-i18n), or a plain lookup function —
FlexTable doesn't care, as long as it matches that shape.

## Two kinds of keys

**Column content** — the keys for what a column actually displays — are always keys *you* choose,
passed directly to `ColumnFactory`:

```ts
factory.text({ accessorKey: 'email', headerKey: 'user.email' });
factory.badge({ accessorKey: 'role', headerKey: 'user.role', /* ... */ });
```

Nothing about these is fixed — name your keys however your translation resources are already
organized.

**Chrome** — the table's own UI text (pagination buttons, the search placeholder, the "select all"
checkbox label, the column-visibility menu, …) — used to be ~18 keys hardcoded under a fixed
`common.*` namespace inherited from FlexTable's original source app, with no way to point them
anywhere else. That's now a configurable `FlexTableKeys` object: every chrome key has a default
under `common.*`, and you can override any subset without touching the rest.

## Overriding chrome keys

`FlexTableKeys` (from `@flextable/core`) is threaded through three entry points — override it
wherever you're already passing `t`:

```ts
import type { FlexTableKeys } from '@flextable/core';

const keys: Partial<FlexTableKeys> = {
  search: 'table.search.placeholder',
  noResult: 'table.empty',
  first: 'pagination.first',
  // ...only override what you need; everything else keeps its default.
};
```

- **`ColumnFactory`** — pass `keys` as part of the second constructor argument, alongside
  `fallbackValue`. This affects `select()`'s checkbox labels, `avatar()`/`name()`/`updated()`'s
  default header keys, and `expandRow()`'s header:

  ```ts
  const factory = new ColumnFactory(t, { keys });
  ```

- **`toReactColumnDef()` / `toVueColumnDef()`** — pass `keys` alongside `t`. This affects the
  `actions()` column's action/edit/delete labels and the `expandRow()` button text (these are
  rendered by the binding package, not by `core`, so they're configured separately):

  ```ts
  toReactColumnDef(config, { t, keys });
  ```

- **`<FlexTable>`** — pass `keys` as a prop. This affects the pagination bar, the search
  placeholder, the column-visibility menu, and the "no results" message:

  ```tsx
  <FlexTable columns={columns} data={data} t={t} keys={keys} />
  ```

If you use the same overrides everywhere, define `keys` once and pass it to all three — they all
merge your overrides on top of the same defaults, so partial, inconsistent overrides across the
three call sites just mean some chrome text keeps its default while the rest uses yours.

## Full key reference

| `FlexTableKeys` field | Default | Used by |
| --- | --- | --- |
| `selectAll` | `common.selectAll` | `ColumnFactory.select()` — checkbox header a11y label |
| `checkboxLabel` | `common.checkboxLabel` | `ColumnFactory.select()` — row checkbox a11y label |
| `avatar` | `common.avatar` | `ColumnFactory.avatar()` — default header |
| `name` | `common.name` | `ColumnFactory.name()` — default header |
| `modificationDate` | `common.modificationDate` | `ColumnFactory.updated()` — default header |
| `details` | `common.details` | `ColumnFactory.expandRow()` header; `GenericRowDetail`'s card title |
| `actions` | `common.actions` | Actions column — menu label |
| `edit` | `common.edit` | Actions column — edit label |
| `delete` | `common.delete` | Actions column — delete label |
| `expand` | `common.expand` | expandRow column — toggle button text |
| `columns` | `common.columns` | Column-visibility dropdown trigger |
| `first` | `common.first` | Pagination — first page |
| `last` | `common.last` | Pagination — last page |
| `next` | `common.next` | Pagination — next page |
| `previous` | `common.previous` | Pagination — previous page |
| `page` | `common.table.page` | Pagination — "Page" label |
| `linesPerPage` | `common.table.lines_per_page` | Pagination — rows-per-page selector |
| `linesToAll` | `common.table.lines_to_all` | Pagination — total row count |
| `search` | `common.search` | Search input placeholder |
| `showLess` | `common.showLess` | `GenericRowDetail` — collapse a long value |
| `showMore` | `common.showMore` | `GenericRowDetail` — expand a long value |
| `noResult` | `common.noResult` | Empty-state message |
| `of` | `common.table.of` | Pagination — "page X **of** Y" |

`DEFAULT_FLEXTABLE_KEYS` and `resolveFlexTableKeys(overrides?)` are also exported from
`@flextable/core` if you want the resolved defaults directly (e.g. to seed a translation file).

## CRUD packages

`@flextable/react-crud` and `@flextable/vue-crud` don't use `FlexTableKeys` — their keys are
already fully caller-controlled:

- `useEntityEditor`'s toast messages are built from `store.translationPath`
  (`${translationPath}.toast.create.success.title`, etc.) — set once per entity type.
- `NestJsErrorCodeAdapter`'s `messageKey()`/`descriptionKey()` build
  `common.toast.error.${code}.title` — it's a preset class implementing `ErrorCodeAdapter`, so
  extend or replace it if you want a different prefix. See [CRUD add-on
  packages](/guides/crud-packages/#the-errorcodeadapter-pattern).
