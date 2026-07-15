<script setup lang="ts" generic="TData extends Record<string, unknown>">
import type { ColumnFilter, Table } from '@tanstack/vue-table'
import { computed, useSlots, type VNode } from 'vue' // Import VNode for type safety
import TableDropdown from '~/components/forms/TableDropdown.vue'
import { isVNodeEmpty } from '~/utils/helpers/vnodes'
import TableSearchWithButton from '../forms/TableSearchWithButton.vue'

interface Props {
  table: Table<TData>
  handleFiltersUpdate: (columnFilters: ColumnFilter[], table: Table<TData>) => void
  showSearch?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSearch: true
})

const slots = useSlots()

const hasTableFiltersSlotContent = computed(() => {
  if (slots.tableFilters) {
    const slotProps = {
      table: props.table,
      handleFiltersUpdate: (columnFilters: ColumnFilter[]) =>
        props.handleFiltersUpdate(columnFilters, props.table)
    }
    const vnodes: VNode[] = slots.tableFilters(slotProps) ?? []

    if (vnodes.length === 0) {
      return false
    }

    return !vnodes.every((v) => isVNodeEmpty(v, false))
  }
  return false
})

defineSlots<{
  tableFilters(props: {
    table: Table<TData>
    handleFiltersUpdate: (columnFilters: ColumnFilter[]) => void
  }): unknown
}>()
</script>

<template>
  <div class="border-b-2 px-4 py-3">
    <div class="flex flex-col items-center gap-2 lg:flex-row">
      <div class="flex w-full flex-col items-center gap-3 lg:w-[80%] lg:flex-row">
        <TableSearchWithButton
          v-if="props.showSearch"
          data-testid="search-bar"
          :class-name="hasTableFiltersSlotContent ? 'lg:max-w-[35%]' : 'lg:max-w-[65%]'"
          @update="(value: string) => table.setGlobalFilter(value)"
        />
        <slot
          name="tableFilters"
          :table="table"
          :handle-filters-update="
            (columnFilters: ColumnFilter[]) => handleFiltersUpdate(columnFilters, table)
          "
        />
      </div>
      <TableDropdown :table="table" />
    </div>
  </div>
</template>
