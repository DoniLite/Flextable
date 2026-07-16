<script setup lang="ts" generic="TData, TValue">
import type { FlexTableKeys, TranslateFn } from '@flextable/core';
import {
  cn,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@flextable/vue-ui';
import type {
  ColumnDef,
  ColumnPinningPosition,
  Row,
  Table as TableType,
} from '@tanstack/vue-table';
import { FlexRender } from '@tanstack/vue-table';

export interface TableContentProps<TData, TValue> {
  table: TableType<TData>;
  columns: Array<ColumnDef<TData, TValue>>;
  t: TranslateFn;
  keys: FlexTableKeys;
  className?: string;
  getPinnedItemClassDefinition: (
    index: number,
    itemsLength: number,
    pinnedState: ColumnPinningPosition,
  ) => Record<string, boolean>;
}

defineProps<TableContentProps<TData, TValue>>();

const emit = defineEmits<{ rowClick: [row: TData] }>();

function handleRowClick(row: Row<TData>, event: MouseEvent) {
  const target = event.target as HTMLElement;
  const cell = target.closest('td');
  if (!cell) return;

  const cells = row.getVisibleCells();
  const cellIndex = Array.from(cell.parentElement?.children ?? []).indexOf(cell);
  const clickedCell = cells[cellIndex];

  if (clickedCell?.column.id === 'select' || clickedCell?.column.id === 'actions') return;

  emit('rowClick', row.original);
}

defineSlots<{
  expandedRowContent(props: { row: Row<TData>; table: TableType<TData> }): unknown;
}>();
</script>

<template>
  <Table :wrapper-class-name="className">
    <TableHeader class="h-13 border-b-2">
      <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
        <TableHead
          v-for="(header, index) in headerGroup.headers"
          :key="header.id"
          :class-name="cn(getPinnedItemClassDefinition(index, headerGroup.headers.length, header.column.getIsPinned()))"
        >
          <FlexRender
            v-if="!header.isPlaceholder"
            :render="header.column.columnDef.header"
            :props="header.getContext()"
          />
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <template v-if="table.getRowModel().rows.length">
        <template v-for="row in table.getRowModel().rows" :key="row.id">
          <TableRow
            class="px-4"
            :data-state="row.getIsSelected() && 'selected'"
            @click="(event: MouseEvent) => handleRowClick(row, event)"
          >
            <TableCell
              v-for="(cell, index) in row.getVisibleCells()"
              :key="cell.id"
              :class-name="cn(getPinnedItemClassDefinition(index, row.getVisibleCells().length, cell.column.getIsPinned()))"
            >
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </TableCell>
          </TableRow>
          <TableRow v-if="row.getIsExpanded()" data-state="expanded">
            <TableCell :colspan="row.getAllCells().length">
              <slot name="expandedRowContent" :row="row" :table="table">
                <pre class="rounded bg-muted p-2 text-xs">{{ JSON.stringify(row.original, null, 2) }}</pre>
              </slot>
            </TableCell>
          </TableRow>
        </template>
      </template>
      <TableRow v-else>
        <TableCell :colspan="columns.length" class="h-24 text-center">
          {{ t(keys.noResult) }}
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
