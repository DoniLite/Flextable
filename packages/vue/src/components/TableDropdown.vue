<script setup lang="ts" generic="TData">
import type { FlexTableKeys, TranslateFn } from '@flextable/core';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@flextable/vue-ui';
import { ChevronDown, ChevronUp } from '@lucide/vue';
import type { Column, Table } from '@tanstack/vue-table';
import { ref } from 'vue';

export interface TableDropdownProps<TData> {
  table: Table<TData>;
  t: TranslateFn;
  keys: FlexTableKeys;
}

const props = defineProps<TableDropdownProps<TData>>();
const emit = defineEmits<{ open: [value: boolean] }>();
const isOpen = ref(false);

function getDropDownItemName(column: Column<TData, unknown>): string {
  const translated = props.t(`common.${column.id}`);
  return translated !== `common.${column.id}` ? translated : column.id;
}

function onOpenChange(value: boolean) {
  isOpen.value = value;
  emit('open', value);
}
</script>

<template>
  <DropdownMenu :open="isOpen" @update:open="onOpenChange">
    <DropdownMenuTrigger as-child>
      <span
        class="ml-auto flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border p-2 hover:border-ring hover:bg-transparent @lg:w-auto"
      >
        {{ t(keys.columns) }}
        <ChevronUp v-if="isOpen" class="ml-2 h-4 w-4" />
        <ChevronDown v-else class="ml-2 h-4 w-4" />
      </span>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="center">
      <DropdownMenuCheckboxItem
        v-for="column in table.getAllColumns().filter((c) => c.getCanHide())"
        :key="column.id"
        class="capitalize"
        :checked="column.getIsVisible()"
        @update:checked="(value) => column.toggleVisibility(value)"
      >
        {{ getDropDownItemName(column) }}
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
