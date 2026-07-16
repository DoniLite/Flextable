---
title: ColumnFactory & column kinds
description: Every built-in column kind, and how to add your own with registerColumnType().
---

`ColumnFactory<TEntity>` is the single place columns get described. It's constructed once with a
`TranslateFn` and optional defaults, then every method returns a framework-agnostic `ColumnConfig`
descriptor — not a `ColumnDef`. `toReactColumnDef()` / `toVueColumnDef()` (from `@flextable/react`
/ `@flextable/vue`) turn each descriptor into the real thing for their framework.

```ts
import { ColumnFactory } from '@flextable/core';

const factory = new ColumnFactory<User>(t, { fallbackValue: '—' });
```

`TEntity` only has to satisfy `EntityLike` — `{ id: string | number }`. There's no dependency on
any particular schema library or base entity shape.

## Built-in column kinds

| Method | Purpose |
| --- | --- |
| `select(options?)` | Checkbox column for row selection, with `selectAll`/`selectRow` a11y labels from `t`. |
| `avatar(options)` | Image or initials avatar, `getImage` + `getName` accessors. |
| `name(options)` | Title + optional description, with an optional `onTitleClick` handler. |
| `text(options)` | Plain text with a `fallbackValue` when the accessor is empty. |
| `date(options)` | Formatted date via a `formatDate` callback you control. |
| `updated(options)` | `date()` preconfigured for an `updatedAt` accessor and a "last modified" header. |
| `count(options)` | Numeric column. |
| `badge(options)` | Colored badge, generic over the variant type (`getVariant` returns your own union). |
| `actions(options)` | Edit/delete/custom-actions dropdown, with `canEdit`/`canDelete` guards. |
| `expandRow(options?)` | Chevron toggle column for expandable row details. |

Every builder accepts `className` (a `string` or `(entity) => string`, resolved consistently by
`core`'s `resolveClassName()`) and an optional `testId`.

```ts
const columns = [
  factory.select(),
  factory.avatar({
    accessorKey: 'avatarUrl',
    getName: (user) => user.name,
  }),
  factory.name({
    accessorKey: 'name',
    getTitle: (user) => user.name,
    getDescription: (user) => user.email,
  }),
  factory.badge<'default' | 'secondary' | 'destructive'>({
    accessorKey: 'role',
    headerKey: 'user.role',
    getVariant: (user) => (user.role === 'admin' ? 'destructive' : 'secondary'),
  }),
  factory.updated({}),
  factory.actions({
    onEdit: (user) => openEditor(user),
    onDelete: (ids) => deleteUsers(ids),
    canDelete: (user) => user.role !== 'admin',
  }),
];
```

## Adding a column kind: `registerColumnType`

The nine built-ins won't cover everything — a currency column, a link column, a progress bar. Call
`registerColumnType(kind, builder)` once per custom kind, then build instances with `custom()`:

```ts
interface CurrencyOptions {
  accessorKey: keyof Invoice;
  currency: string;
}

interface CurrencyResolved {
  accessorKey: keyof Invoice;
  currency: string;
  headerLabel: string;
}

factory.registerColumnType<CurrencyOptions, CurrencyResolved>('currency', (t, options) => ({
  ...options,
  headerLabel: t('invoice.amount'),
}));

const amountColumn = factory.custom<CurrencyResolved, CurrencyOptions>('currency', {
  accessorKey: 'amountCents',
  currency: 'EUR',
});
```

On the render-layer side, pass a matching `customRenderers` entry to `toReactColumnDef()` /
`toVueColumnDef()` so the binding package knows how to render the `"currency"` kind — see
[Theming & slot overrides](/guides/theming/#custom-column-kinds).

`registerColumnType()` throws if `custom()` is called for a kind that was never registered, so
mismatches fail fast instead of silently rendering nothing.
