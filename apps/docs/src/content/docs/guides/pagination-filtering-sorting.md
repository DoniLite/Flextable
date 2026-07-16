---
title: Pagination, filtering & sorting
description: Client-side by default, server-side when your dataset needs it.
---

`FlexTable` defaults to fully client-side sorting, filtering and pagination — pass `data` and it
handles the rest via `@tanstack/react-table` / `@tanstack/vue-table`. Flip individual pieces to
server-side independently as your dataset grows.

## Client-side (default)

```tsx
<FlexTable columns={columns} data={allUsers} t={t} />
```

- **Sorting** — click a `sortableHeader()`-wrapped header; `@flextable/core`'s `applySorting()` /
  `sortAlphabeticallyByProp()` / `sortByDateProp()` / `sortByNumericProp()` back the comparators.
- **Filtering** — `useFuzzySearch` (default `true`) runs `createGlobalSearchFilter()` from `core`
  (built on `@tanstack/match-sorter-utils`) across `searchColumns`, or every column if omitted.
- **Pagination** — driven by `PaginationController`'s client-side math internally; page size options
  come from `PAGINATION_PAGE_SIZE_OPTIONS` (`[10, 20, 50, 100]` by default).

## Server-side

Each concern is opt-in independently:

```tsx
<FlexTable
  columns={columns}
  data={page.items}
  t={t}
  serverSideSorting
  serverSideFiltering
  serverSidePagination={{
    itemCount: page.itemCount,
    page: page.page,
    pageSize: page.pageSize,
    pageCount: page.pageCount,
  }}
  onSortingChange={(sorting) => refetch({ sortBy: sorting[0]?.id, sortOrder: sorting[0]?.desc ? 'desc' : 'asc' })}
  onFiltersChange={(filters) => refetch({ filters })}
  onPageChange={(page) => refetch({ page })}
  onPageSizeChange={(pageSize) => refetch({ page: 1, pageSize })}
/>
```

- `serverSidePagination` being present is what tells `FlexTable` to trust your `itemCount`/`page`/
  `pageSize`/`pageCount` instead of computing them from `data.length`.
- `serverSideSorting` / `serverSideFiltering` stop TanStack from re-sorting/re-filtering `data`
  locally — you're expected to have already applied the requested sort/filter server-side before
  passing `data` in.
- The `on*Change` callbacks are your hook to refetch. `PaginationQuery` / `PaginatedResponse<T>`
  from `@flextable/core` are the shapes a typical REST-style backend would use for the request/response.

The Vue binding mirrors this exactly — the same props on `<FlexTable>`, and `emit('update:sorting'
| 'update:filters' | 'update:page' | 'update:pageSize', …)` instead of callback props.

## Search specifically

The search input's `searchColumns` prop only configures *client-side* fuzzy matching — it doesn't
by itself give you a way to drive a server-side search. For that, use `onSearchChange` (React) /
`@update:search` (Vue): it fires on every search-input change **regardless of
`serverSideFiltering`**, independently of sorting/column-filter/pagination mode:

```tsx
<FlexTable
  columns={columns}
  data={data}
  t={t}
  onSearchChange={(value) => refetchWithSearch(value)}
/>
```

```vue
<FlexTable :columns="columns" :data="data" :t="t" @update:search="refetchWithSearch" />
```

This is deliberately independent of `serverSideFiltering` (which also gates column filters) so you
can keep sorting/column-filters/pagination client-side while only search hits the server — a
common shape when the rest of a page's data is already in memory but the dataset is too large to
fuzzy-match client-side. If you *do* want search folded into the same `serverSideFiltering` +
`onFiltersChange` flow instead, that still works exactly as before — `onFiltersChange` receives a
synthetic `{ id: 'search', value }` entry alongside real column filters when `serverSideFiltering`
is on. Pick whichever shape matches your backend; `onSearchChange` is additive, not a replacement.

### Triggering search from a custom `assets` or `tableFilters` component

If you replace the toolbar or add your own search box in the `assets` slot (see [Overriding table
regions](/guides/theming/#overriding-table-regions)), you don't need to reach into TanStack Table
internals to wire it up — both slots receive a `handleSearchUpdate(value)` function that does the
right thing (updates the table's search state, which flows into `onSearchChange` exactly like the
built-in search box):

```tsx
function CustomAssets({ handleSearchUpdate }: { handleSearchUpdate: (value: string) => void }) {
  return <input onChange={(e) => handleSearchUpdate(e.target.value)} />;
}

<FlexTable columns={columns} data={data} t={t} assets={CustomAssets} />;
```

```vue
<FlexTable :columns="columns" :data="data" :t="t">
  <template #asset="{ handleSearchUpdate }">
    <input @input="(e) => handleSearchUpdate((e.target as HTMLInputElement).value)" />
  </template>
</FlexTable>
```

## Wiring a real backend: the CRUD packages

Wiring `serverSidePagination` + the four `on*Change` callbacks by hand for every table gets
repetitive fast. `@flextable/vue-crud`'s `useTableServerPaginationHandler()` /
`useTableServerFilters()` (and `@flextable/react-crud`'s `useStoreAsyncOperations()`) wrap exactly
this pattern against a `refetchFunction: (query) => Promise<PaginatedResponse<T>>`. See [CRUD
add-on packages](/guides/crud-packages/).
