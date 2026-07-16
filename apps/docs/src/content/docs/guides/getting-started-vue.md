---
title: Getting started — Vue
description: Install @flextable/vue and render your first table.
---

## Install

```sh
bun add @flextable/core @flextable/vue @flextable/vue-ui @tanstack/vue-table
```

`@flextable/vue-ui` is optional — it ships the default Button/Badge/Avatar/DropdownMenu primitives
(built on [reka-ui](https://reka-ui.com)) used by `toVueColumnDef()`. Bring your own by passing a
`components` override instead (see [Theming & slot overrides](/guides/theming/)).

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

```vue
<script setup lang="ts">
import { ColumnFactory } from '@flextable/core';
import { FlexTable, toVueColumnDef } from '@flextable/vue';
import { computed } from 'vue';

const props = defineProps<{ users: Array<User> }>();

// A minimal TranslateFn — swap in `useI18n().t` from vue-i18n if you have it.
const t = (key: string) => key;

const columns = computed(() => {
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
  ].map((config) => toVueColumnDef<User>(config, { t }));
});
</script>

<template>
  <FlexTable :columns="columns" :data="props.users" :t="t" />
</template>
```

`ColumnFactory` returns framework-agnostic `ColumnConfig` descriptors; `toVueColumnDef()` is what
turns each one into a real `@tanstack/vue-table` `ColumnDef`, using `@flextable/vue-ui`'s
components by default.

That's a fully interactive table: sortable headers, client-side fuzzy search, pagination and row
selection all work out of the box. From here:

- [Pagination, filtering & sorting](/guides/pagination-filtering-sorting/) to switch parts of this
  to server-side.
- [Theming & slot overrides](/guides/theming/) to swap in your own design system.
- [CRUD add-on packages](/guides/crud-packages/) for server pagination/filter handler composables.
- Try the fully working version on the [live demo](/guides/live-demo/) page.
