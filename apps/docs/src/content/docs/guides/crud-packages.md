---
title: CRUD add-on packages
description: Optional entity-editor and server-pagination glue for React and Vue, backend-agnostic by default.
---

`@flextable/react` and `@flextable/vue` only render tables — they don't know about your backend,
your toast library, or your store shape. `@flextable/react-crud` and `@flextable/vue-crud` are
**separate, optional** packages for the surrounding plumbing: entity-editor dialog state, async
operation/error bookkeeping, and server pagination/filter handlers.

Both packages are built the same way as the rest of the library: every backend- or app-specific
concern is injected, never imported directly.

## The `ErrorCodeAdapter` pattern

`@flextable/core`'s `ApiError` doesn't assume any particular backend error shape. You give it an
`ErrorCodeAdapter<TCode>` — a class implementing `resolve(rawCode, statusCode) => TCode`,
`messageKey(code) => string`, `descriptionKey(code) => string`:

```ts
import type { ErrorCodeAdapter } from '@flextable/core';

class MyBackendErrorAdapter implements ErrorCodeAdapter<'NOT_FOUND' | 'UNKNOWN'> {
  resolve(rawCode: string | undefined, statusCode: number | undefined) {
    if (statusCode === 404) return 'NOT_FOUND' as const;
    return 'UNKNOWN' as const;
  }
  messageKey(code: 'NOT_FOUND' | 'UNKNOWN') {
    return `errors.${code}.title`;
  }
  descriptionKey(code: 'NOT_FOUND' | 'UNKNOWN') {
    return `errors.${code}.description`;
  }
}
```

Both CRUD packages ship a ready-made `NestJsErrorCodeAdapter` class (plus its `BackendExceptionCode`
/ `UnexpectedErrorCode` enums) as an opt-in preset for NestJS-shaped backends — it's not baked into
`@flextable/core`, so swapping backends never means forking the library.

Adapters are always classes implementing the interface, not plain config objects — that keeps them
substitutable and lets you extend a preset with `extends` if you only need to override one method.

## React: `useStoreAsyncOperations` + `useEntityEditor`

```ts
import { NestJsErrorCodeAdapter, useStoreAsyncOperations } from '@flextable/react-crud';

const errorAdapter = new NestJsErrorCodeAdapter();

const { loading, error, handleApiError, executeOperation, withAsyncOperation } =
  useStoreAsyncOperations({
    errorAdapter,
    silentErrorCodes: ['SESSION_EXPIRED_HANDLED'],
  });

// executeOperation runs one async call with loading/error bookkeeping around it;
// withAsyncOperation wraps a function once so every call gets the same treatment.
const deleteUser = withAsyncOperation((id: string) => api.deleteUser(id));
```

`useEntityEditor(store, { t, errorAdapter, notify })` layers create/update/delete dialog state on
top: it expects a small `CrudCompatibleStore` (`create?`, `update?`, `deleteOne`, `deleteMultiple?`,
`resetState`, `defaultEntity`, `translationPath`) and drives success/error toasts through the
injected `notify: NotifyFn` (`{ success, error }`) — no `sonner` import inside the package itself.

## Vue: `useTableServerPaginationHandler` + `useTableServerFilters`

```ts
import { useTableServerPaginationHandler } from '@flextable/vue-crud';

const handler = useTableServerPaginationHandler<User>({
  refetchFunction: (query) => api.listUsers(query),
});

await handler.fetchData();
// handler.items, handler.pagination, handler.query are computed refs
```

`handler` exposes `fetchData`, `fetchAllData`, `goToPage`, `updatePageSize`, `updateFilters`,
`resetFilters`, plus optimistic list bookkeeping (`handlePostCreate`, `handlePostUpdate`,
`handlePostUpdatePartial`, `handleBulkDelete`, `removeItemsFromList`) so a store doesn't have to
refetch after every mutation.

`useTableServerFilters({ store, customFilters?, autoFetch? })` is the composable that wires
`FlexTable`'s `update:sorting` / `update:filters` / `update:page` / `update:pageSize` events into a
store shaped like the pagination handler above — call it once inside the component that owns the
table and pass its `handlePageUpdate` / `handleSortingUpdate` / `handleFiltersUpdate` straight
through to `<FlexTable>`. `useDefaultTableHandlers(store)` is a shorthand that also wires the
`search` filter id to the top-level query for you.

Both handlers work against `PaginationQuery` / `PaginatedResponse<T>` from `@flextable/core` — the
same shapes used in [Pagination, filtering & sorting](/guides/pagination-filtering-sorting/).
