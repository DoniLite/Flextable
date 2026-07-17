# @flextable/react

[![npm version](https://img.shields.io/npm/v/@flextable/react.svg)](https://www.npmjs.com/package/@flextable/react)
[![npm downloads](https://img.shields.io/npm/dm/@flextable/react.svg)](https://www.npmjs.com/package/@flextable/react)
[![CI](https://github.com/DoniLite/Flextable/actions/workflows/ci.yml/badge.svg)](https://github.com/DoniLite/Flextable/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/npm/l/@flextable/react.svg)](https://github.com/DoniLite/Flextable/blob/main/LICENSE)

React data table built on [TanStack Table](https://tanstack.com/table): the `FlexTable` component,
hooks, and the React column-def render layer for
[`@flextable/core`](https://www.npmjs.com/package/@flextable/core)'s `ColumnFactory`. Container-query
responsive, fully overridable via slots and `classNames`, ships a precompiled stylesheet — no
Tailwind required in your app.

## Install

```sh
bun add @flextable/core @flextable/react @flextable/react-ui @tanstack/react-table
```

`@flextable/react-ui` is optional — it ships the default primitives used by `toReactColumnDef()`.
Bring your own by passing a `components` override instead.

```ts
import '@flextable/react-ui/styles.css';
import '@flextable/react/styles.css';
```

## Quick start

```tsx
import { ColumnFactory } from '@flextable/core';
import { FlexTable, toReactColumnDef } from '@flextable/react';
import { useMemo } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

const t = (key: string) => key;

function UsersTable({ users }: { users: Array<User> }) {
  const columns = useMemo(() => {
    const factory = new ColumnFactory<User>(t);
    return [
      factory.select(),
      factory.name({ accessorKey: 'name', getTitle: (u) => u.name, getDescription: (u) => u.email }),
      factory.actions({ onEdit: (u) => console.log('edit', u), onDelete: (ids) => console.log(ids) }),
    ].map((config) => toReactColumnDef<User>(config, { t }));
  }, []);

  return <FlexTable columns={columns} data={users} t={t} />;
}
```

That's sortable headers, client-side fuzzy search, pagination, and row selection out of the box.
Flip individual pieces (`serverSideSorting`, `serverSideFiltering`, `serverSidePagination`) to
server-side independently as your dataset grows.

## Docs

Full guides — theming, i18n, server-side pagination/filtering/sorting, the CRUD add-on package —
and the generated API reference live at
**[donilite.github.io/Flextable](https://donilite.github.io/Flextable)**.

## License

[Apache-2.0](https://github.com/DoniLite/Flextable/blob/main/LICENSE)
