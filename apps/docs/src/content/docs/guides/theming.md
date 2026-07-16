---
title: Theming & styling
description: Installing styles, re-theming design tokens, and overriding column classes, structural layers, primitives, or custom column renderers.
---

FlexTable never hardcodes a design system, and it's responsive to *its own container*, not the
browser viewport — so it looks right whether it's the whole page or a card in a sidebar layout.
`@flextable/react-ui` / `@flextable/vue-ui` are the *default* primitives, and every layer of the
table can be styled or swapped, from "change a color" to "replace a whole table region."

## Installing styles

Every styled package (`@flextable/react-ui`, `@flextable/vue-ui`, `@flextable/react`,
`@flextable/vue`) ships a **fully self-contained, precompiled** `styles.css` — Tailwind is baked in
at each package's own build time, so **you don't need Tailwind installed in your app at all**. Just
import the stylesheet for every FlexTable package you use:

```ts
// React
import '@flextable/react-ui/styles.css';
import '@flextable/react/styles.css';
```

```ts
// Vue
import '@flextable/vue-ui/styles.css';
import '@flextable/vue/styles.css';
```

`@flextable/react-ui`/`vue-ui` cover the shared primitives (Button, Badge, Table, …);
`@flextable/react`/`vue` separately cover the handful of Tailwind classes used directly in
`FlexTable`'s own layout (toolbar spacing, borders, the default expanded-row JSON view). Import
both — order doesn't matter, they don't conflict.

## Re-theming design tokens

All four stylesheets are compiled from the same source of truth
(`@flextable/core`'s `tokens.css`) — a set of CSS custom properties
(`--primary`, `--secondary`, `--destructive`, `--border`, `--radius`, …) that every component reads
through Tailwind's `@theme inline` mapping. Override any of them in your own stylesheet, loaded
*after* the FlexTable ones:

```css
:root {
  --primary: oklch(0.55 0.2 260);
  --radius: 0.375rem;
}
```

Dark mode is supported two ways out of the box: `prefers-color-scheme: dark`, or an explicit
`data-theme="dark"` / `data-theme="light"` attribute on `<html>`/`<body>` if you manage the toggle
yourself.

## Container-responsive by default

`FlexTable`'s root element is a Tailwind v4 [container query](https://tailwindcss.com/docs/responsive-design#container-queries)
root (`@container`), and its own layout (toolbar wrapping, pagination button labels, the search
bar width split) responds to `@md:`/`@lg:`/`@3xl:` — the width of *the table's own container* —
rather than the browser viewport. Drop `<FlexTable>` into a full-width page, a narrow sidebar
panel, or a modal, and it adapts to the space it's actually given instead of assuming it owns the
whole screen.

## Overriding column classes

Every `ColumnFactory` builder — including `select()`, `actions()`, and `expandRow()`, which have no
other options — accepts `className` (a string or `(entity) => string`, resolved via `core`'s
`resolveClassName()`) and `testId`. It's additive: merged onto the built-in classes via
`cn()`/tailwind-merge, so the column keeps its default appearance unless you specifically override
it:

```ts
factory.select({ className: 'sticky left-0 bg-background' });
factory.actions({ onEdit, onDelete, className: 'sticky right-0 bg-background' });
factory.badge({ accessorKey: 'status', headerKey: 'user.status', className: 'font-mono' });
```

## Overriding column-level primitives

`toReactColumnDef()` / `toVueColumnDef()` accept a `components` option — a partial override of the
`Checkbox` / `Badge` / `Button` / `EntityAvatar` / `EntityTitle` / `EntityActionsMenu` used inside
generated cells:

```tsx
import { toReactColumnDef } from '@flextable/react';
import { MyBadge } from './my-design-system';

const columnDef = toReactColumnDef(config, {
  t,
  components: { Badge: MyBadge },
});
```

Only the components you pass are overridden — everything else still falls back to
`@flextable/react-ui` / `@flextable/vue-ui`. `MyBadge` needs to accept the same prop shape as
`@flextable/react-ui`'s `BadgeProps` (`variant`, `className`, children).

## Custom column kinds

Columns built with `ColumnFactory.custom()` (see [ColumnFactory & column
kinds](/guides/column-factory/#adding-a-column-kind-registercolumntype)) need their own renderer,
supplied via `customRenderers`:

```tsx
const columnDef = toReactColumnDef(amountColumn, {
  t,
  customRenderers: {
    currency: (options, t) => ({ row }) => {
      const { accessorKey, currency } = options as CurrencyResolved;
      const cents = row.original[accessorKey] as number;
      return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(cents / 100);
    },
  },
});
```

The Vue equivalent is identical in shape — `toVueColumnDef(config, { t, customRenderers })` — except
the renderer returns a Vue render function (`h(...)`) instead of JSX.

## Overriding structural layers

`FlexTable` accepts a `classNames` prop (`FlexTableClassNames` from `@flextable/core`) — additive
overrides for the "order layers" wrapping the table itself, merged the same way as column
`className`:

| Field | What it targets |
| --- | --- |
| `container` | The outermost wrapper. |
| `assets` | The row above the table reserved for the `assets`/`asset` slot. |
| `card` | The bordered card wrapping the toolbar, table and pagination. |
| `toolbar` | `TableToolbar`'s wrapper (search + column-visibility menu). |
| `content` | The table's scroll wrapper (`overflow-x-auto`), not the `<table>` element itself. |
| `pagination` | `TablePagination`'s wrapper. |

```tsx
<FlexTable
  columns={columns}
  data={data}
  t={t}
  classNames={{ card: 'shadow-lg', pagination: 'bg-muted/50' }}
/>
```

```vue
<FlexTable :columns="columns" :data="data" :t="t" :class-names="{ card: 'shadow-lg' }" />
```

## Row and header density

`@flextable/react-ui`'s/`vue-ui`'s `TableHead` (`h-12 px-4`) and `TableCell` (`px-4 py-3`) ship with
comfortable default padding — no configuration needed for a normal, readable table. If you want a
denser or looser table specifically, there's no dedicated prop for it today; override via your own
CSS targeting the `data-slot` attributes every table primitive carries:

```css
[data-slot='table-head'],
[data-slot='table-cell'] {
  padding-block: 0.5rem; /* denser */
}
```

## Overriding table regions

`FlexTable` also exposes slot props for regions that aren't styling, but content:

**React** (`FlexTableProps`):

- `assets?: ElementType<{ table, handleSearchUpdate }>` — content above the table (e.g. a header
  illustration or a "create" button row). Also gets `handleSearchUpdate` in case you want a custom
  search box up here instead of in the toolbar — see [Search
  specifically](/guides/pagination-filtering-sorting/#search-specifically).
- `tableFilters?: ElementType<ToolbarSlotProps<TData>>` — replace the search/filter toolbar. Receives
  `table`, `handleFiltersUpdate`, and `handleSearchUpdate`.
- `tableContentComponent?: ElementType<{ row, table }>` — replace the content shown inside an
  *expanded row* (defaults to a pretty-printed JSON dump of the row). Pair with the `expandRow()`
  column kind; see [`createGenericRowDetail`](/api/react/functions/creategenericrowdetail/) for a
  ready-made card-based renderer instead of writing your own.

**Vue** — the same three regions as scoped slots on `<FlexTable>`:

- `#asset="{ table, handleSearchUpdate }"` — same role as React's `assets`.
- `#tableFilters="{ table, handleFiltersUpdate, handleSearchUpdate }"` — same role as React's
  `tableFilters`.
- `#expandedRowContent="{ row, table }"` — same role as React's `tableContentComponent`.

Reach for slots when the change is structural content, `classNames`/column `className` when it's
styling, and `components`/`customRenderers` when it's about swapping *which* primitive renders a
single cell.

## Current limitations

`TablePagination` and the table shell (`@flextable/react-ui`'s/`vue-ui`'s `Table` primitives) can
be *styled* via `classNames`/`wrapperClassName`, but not *replaced* with a different component —
there's no slot for a fundamentally different pagination UI or a virtualized table shell today.
That's a fork, not a config option — flagged here rather than left for you to discover the hard
way.
