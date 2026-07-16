<script setup lang="ts" generic="TData">
import type { FlexTableKeys, TranslateFn } from '@flextable/core';
import { cn } from '@flextable/vue-ui';
import type { ColumnFilter, Table } from '@tanstack/vue-table';
import type { VNode } from 'vue';
import { computed, useSlots } from 'vue';
import { isVNodeEmpty } from '../helpers/vnodes';
import TableDropdown from './TableDropdown.vue';
import TableSearchWithButton from './TableSearchWithButton.vue';

export interface TableToolbarProps<TData> {
  table: Table<TData>;
  t: TranslateFn;
  keys: FlexTableKeys;
  className?: string;
  handleFiltersUpdate: (columnFilters: Array<ColumnFilter>, table: Table<TData>) => void;
  handleSearchUpdate: (value: string) => void;
  showSearch?: boolean;
}

const props = withDefaults(defineProps<TableToolbarProps<TData>>(), { showSearch: true });
const slots = useSlots();
const wrapperClass = computed(() => cn('border-b-2 px-4 py-3', props.className));

const hasTableFiltersSlotContent = computed(() => {
  if (!slots.tableFilters) return false;
  const vnodes: Array<VNode> =
    slots.tableFilters({
      table: props.table,
      handleFiltersUpdate: (columnFilters: Array<ColumnFilter>) =>
        props.handleFiltersUpdate(columnFilters, props.table),
      handleSearchUpdate: props.handleSearchUpdate,
    }) ?? [];
  if (vnodes.length === 0) return false;
  return !vnodes.every((v) => isVNodeEmpty(v, false));
});

defineSlots<{
  tableFilters(props: {
    table: Table<TData>;
    handleFiltersUpdate: (columnFilters: Array<ColumnFilter>) => void;
    handleSearchUpdate: (value: string) => void;
  }): unknown;
}>();
</script>

<template>
  <div :class="wrapperClass">
    <div class="flex flex-col items-center gap-2 @lg:flex-row">
      <div class="flex w-full flex-col items-center gap-3 @lg:w-[80%] @lg:flex-row">
        <TableSearchWithButton
          v-if="showSearch"
          :t="t"
          :keys="keys"
          :class-name="hasTableFiltersSlotContent ? '@lg:max-w-[35%]' : '@lg:max-w-[65%]'"
          @update="handleSearchUpdate"
        />
        <slot
          name="tableFilters"
          :table="table"
          :handle-filters-update="(columnFilters: ColumnFilter[]) => handleFiltersUpdate(columnFilters, table)"
          :handle-search-update="handleSearchUpdate"
        />
      </div>
      <TableDropdown :table="table" :t="t" :keys="keys" />
    </div>
  </div>
</template>
