---
title: Getting started — React
description: Install @flextable/react and render your first table.
---

## Install

```sh
bun add @flextable/core @flextable/react @flextable/react-ui @tanstack/react-table
```

`@flextable/react-ui` is optional — it ships the default Button/Badge/Avatar/DropdownMenu
primitives used by `toReactColumnDef()`. Bring your own by passing a `components` override instead
(see [Theming & slot overrides](/guides/theming/)).

## Define your entity

Any type with an `id` works — `ColumnFactory` only requires `EntityLike` (`{ id: string | number }`).

```ts
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  createdAt: string;
}
```

## Build columns with `ColumnFactory`

```tsx
import { ColumnFactory } from '@flextable/core';
import { toReactColumnDef } from '@flextable/react';
import { useMemo } from 'react';

// A minimal TranslateFn — swap in `useTranslation().t` from react-i18next if you have it.
const t = (key: string) => key;

function useUserColumns() {
  return useMemo(() => {
    const factory = new ColumnFactory<User>(t);

    return [
      factory.select(),
      factory.name({
        accessorKey: 'name',
        getTitle: (user) => user.name,
        getDescription: (user) => user.email,
      }),
      factory.badge({
        accessorKey: 'role',
        headerKey: 'user.role',
        getVariant: (user) => (user.role === 'admin' ? 'default' : 'secondary'),
      }),
      factory.date({
        accessorKey: 'createdAt',
        headerKey: 'user.createdAt',
        formatDate: (value) => new Date(value).toLocaleDateString(),
      }),
      factory.actions({
        onEdit: (user) => console.log('edit', user),
        onDelete: (ids) => console.log('delete', ids),
      }),
    ].map((config) => toReactColumnDef<User>(config, { t }));
  }, []);
}
```

`ColumnFactory` returns framework-agnostic `ColumnConfig` descriptors; `toReactColumnDef()` is what
turns each one into a real `@tanstack/react-table` `ColumnDef`, using `@flextable/react-ui`'s
components by default.

## Render the table

```tsx
import { FlexTable } from '@flextable/react';

function UsersTable({ users }: { users: Array<User> }) {
  const columns = useUserColumns();

  return <FlexTable columns={columns} data={users} t={t} />;
}
```

That's a fully interactive table: sortable headers, client-side fuzzy search, pagination and row
selection all work out of the box. From here:

- [Pagination, filtering & sorting](/guides/pagination-filtering-sorting/) to switch parts of this
  to server-side.
- [Theming & slot overrides](/guides/theming/) to swap in your own design system.
- [CRUD add-on packages](/guides/crud-packages/) for entity-editor and async-store glue.
- Try the fully working version on the [live demo](/guides/live-demo/) page.
