<script setup lang="ts">
import { ColumnFactory } from '@flextable/core';
import { FlexTable, toVueColumnDef } from '@flextable/vue';
import { computed } from 'vue';
import { demoT } from './demoTranslations';
import { createMockUsers, type DemoUser } from './mockUsers';

const users = createMockUsers();

const formatDate = (value: string | Date) => new Date(value).toLocaleDateString();

const columns = computed(() => {
  const factory = new ColumnFactory<DemoUser>(demoT);

  return [
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
    factory.badge<'default' | 'secondary' | 'outline'>({
      accessorKey: 'role',
      headerKey: 'user.role',
      getVariant: (user) =>
        user.role === 'admin'
          ? 'default'
          : user.role === 'member'
            ? 'secondary'
            : 'outline',
    }),
    factory.badge<'default' | 'destructive'>({
      accessorKey: 'status',
      headerKey: 'user.status',
      getVariant: (user) => (user.status === 'active' ? 'default' : 'destructive'),
    }),
    factory.count({
      accessorKey: 'loginCount',
      headerKey: 'user.logins',
    }),
    factory.date({
      accessorKey: 'createdAt',
      headerKey: 'user.createdAt',
      formatDate,
    }),
    factory.updated({ formatDate }),
    factory.expandRow(),
    factory.actions({
      onEdit: (user) => window.alert(`Edit ${user.name}`),
      onDelete: (ids) => window.alert(`Delete ${ids.join(', ')}`),
      canDelete: (user) => user.role !== 'admin',
    }),
  ].map((config) => toVueColumnDef<DemoUser>(config, { t: demoT }));
});
</script>

<template>
  <FlexTable :columns="columns" :data="users" :t="demoT" />
</template>
