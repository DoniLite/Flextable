<script setup lang="ts" generic="TData, TValue">
import {
  TableBody,
  TableCell,
  Table as TableComponent,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import type { ColumnDef, ColumnPinningPosition, Row, Table } from '@tanstack/vue-table'
import { FlexRender } from '@tanstack/vue-table'
import { cn } from '~/utils'

interface Props {
  table: Table<TData>
  columns: ColumnDef<TData, TValue>[]
  noResultsTextKey: string
  getPinnedItemClassDefinition: (
    index: number,
    itemsLength: number,
    pinnedState: ColumnPinningPosition
  ) => Record<string, boolean>
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'rowClick', row: TData): void
}>()

function handleRowClick(row: Row<TData>, event: MouseEvent) {
  const target = event.target as HTMLElement

  // Check if the click is within a table cell
  const tableCell = target.closest('td')
  if (!tableCell) {
    return
  }

  // Get the cell index to determine which column was clicked
  const cells = row.getVisibleCells()
  const cellIndex = Array.from(tableCell.parentElement?.children || []).indexOf(tableCell)
  const clickedCell = cells[cellIndex]

  // Don't trigger row click for select or actions columns
  if (clickedCell?.column.id === 'select' || clickedCell?.column.id === 'actions') {
    return
  }

  emit('rowClick', row.original)
}

defineSlots<{
  expandedRowContent(props: { row: Row<TData>; table: Table<TData> }): unknown
}>()
</script>

<template>
  <div>
    <TableComponent>
      <TableHeader class="h-13 border-b-2">
        <TableRow
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <TableHead
            v-for="(header, index) in headerGroup.headers"
            :key="header.id"
            :class="
              cn(
                getPinnedItemClassDefinition(
                  index,
                  headerGroup.headers.length,
                  header.column.getIsPinned()
                )
              )
            "
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
          <template
            v-for="row in table.getRowModel().rows"
            :key="row.id"
          >
            <TableRow
              class="px-4"
              :data-state="row.getIsSelected() && 'selected'"
              @click="(event: MouseEvent) => handleRowClick(row, event)"
            >
              <TableCell
                v-for="(cell, index) in row.getVisibleCells()"
                :key="cell.id"
                :class="
                  cn(
                    getPinnedItemClassDefinition(
                      index,
                      row.getVisibleCells().length,
                      cell.column.getIsPinned()
                    )
                  )
                "
              >
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
            <TableRow
              v-if="row.getIsExpanded()"
              :data-state="'expanded'"
            >
              <TableCell :colspan="row.getAllCells().length">
                <slot
                  name="expandedRowContent"
                  :row="row"
                  :table="table"
                >
                  <pre class="bg-muted rounded p-2 text-xs">{{
                    JSON.stringify(row.original, null, 2)
                  }}</pre>
                </slot>
              </TableCell>
            </TableRow>
          </template>
        </template>

        <TableRow v-else>
          <TableCell
            :colspan="columns.length"
            class="h-24 text-center"
          >
            {{ $t(noResultsTextKey || 'common.noResult') }}
          </TableCell>
        </TableRow>
      </TableBody>
    </TableComponent>
  </div>
</template>
