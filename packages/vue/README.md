# @flextable/vue

[![npm version](https://img.shields.io/npm/v/@flextable/vue.svg)](https://www.npmjs.com/package/@flextable/vue)
[![npm downloads](https://img.shields.io/npm/dm/@flextable/vue.svg)](https://www.npmjs.com/package/@flextable/vue)
[![CI](https://github.com/DoniLite/Flextable/actions/workflows/ci.yml/badge.svg)](https://github.com/DoniLite/Flextable/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/npm/l/@flextable/vue.svg)](https://github.com/DoniLite/Flextable/blob/main/LICENSE)

Vue 3 data table built on [TanStack Vue Table](https://tanstack.com/table): `FlexTable.vue`,
composables, and the Vue column-def render layer for
[`@flextable/core`](https://www.npmjs.com/package/@flextable/core)'s `ColumnFactory`. Container-query
responsive, fully overridable via scoped slots and `classNames`, ships a precompiled stylesheet —
no Tailwind required in your app.

## Install

```sh
bun add @flextable/core @flextable/vue @flextable/vue-ui @tanstack/vue-table
```

`@flextable/vue-ui` is optional — it ships the default [reka-ui](https://reka-ui.com)-based
primitives used by `toVueColumnDef()`. Bring your own by passing a `components` override instead.

```ts
import '@flextable/vue-ui/styles.css';
import '@flextable/vue/styles.css';
```

## Quick start

```vue
<script setup lang="ts">
import { ColumnFactory } from '@flextable/core';
import { FlexTable, toVueColumnDef } from '@flextable/vue';
import { computed } from 'vue';

interface User {
  id: string;
  name: string;
  email: string;
}

const props = defineProps<{ users: Array<User> }>();
const t = (key: string) => key;

const columns = computed(() => {
  const factory = new ColumnFactory<User>(t);
  return [
    factory.select(),
    factory.name({ accessorKey: 'name', getTitle: (u) => u.name, getDescription: (u) => u.email }),
    factory.actions({ onEdit: (u) => console.log('edit', u), onDelete: (ids) => console.log(ids) }),
  ].map((config) => toVueColumnDef<User>(config, { t }));
});
</script>

<template>
  <FlexTable :columns="columns" :data="props.users" :t="t" />
</template>
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
