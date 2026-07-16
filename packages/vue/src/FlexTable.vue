<script setup lang="ts" generic="TData, TValue">
import type {
  FlexTableClassNames,
  FlexTableKeys,
  PaginatedResponse,
  TranslateFn,
} from '@flextable/core';
import { resolveFlexTableKeys } from '@flextable/core';
import { cn } from '@flextable/vue-ui';
import type {
  ColumnDef,
  ColumnFilter,
  ColumnPinningPosition,
  SortingState,
  Table,
} from '@tanstack/vue-table';
import { computed, provide } from 'vue';
import TableContent from './components/TableContent.vue';
import TablePagination from './components/TablePagination.vue';
import TableToolbar from './components/TableToolbar.vue';
import { TABLE_LOADING_STATE_KEY } from './composables/tableLoadingState';
import { useColumnPinning } from './composables/useColumnPinning';
import { useDeviceType } from './composables/useDeviceType';
import { useFlexTable } from './composables/useFlexTable';
import { useTableClientPagination } from './composables/useTableClientPagination';

const props = withDefaults(
  defineProps<{
    columns: Array<ColumnDef<TData, TValue>>;
    data: Array<TData>;
    t: TranslateFn;
    keys?: Partial<FlexTableKeys>;
    classNames?: FlexTableClassNames;
    pinnedColumnId?: string;
    pinOnMobile?: ColumnPinningPosition;
    pinOnDesktop?: ColumnPinningPosition;
    serverSideSorting?: boolean;
    serverSideFiltering?: boolean;
    serverSidePagination?: Pick<
      PaginatedResponse<TData>,
      'itemCount' | 'page' | 'pageSize' | 'pageCount'
    >;
    useFuzzySearch?: boolean;
    searchColumns?: Array<string>;
    showSearch?: boolean;
    loading?: boolean;
  }>(),
  {
    keys: undefined,
    classNames: undefined,
    pinnedColumnId: 'actions',
    pinOnMobile: 'right',
    pinOnDesktop: false,
    serverSideSorting: false,
    serverSideFiltering: true,
    serverSidePagination: undefined,
    useFuzzySearch: true,
    searchColumns: () => [],
    showSearch: true,
    loading: false,
  },
);

const emit = defineEmits<{
  (e: 'update:sorting', sorting: SortingState): void;
  (e: 'update:filters', filters: Array<ColumnFilter>): void;
  (e: 'update:search', value: string): void;
  (e: 'update:page', value: number): void;
  (e: 'update:pageSize', value: number): void;
  (e: 'rowClick', row: TData): void;
}>();

provide(
  TABLE_LOADING_STATE_KEY,
  computed(() => props.loading),
);

const resolvedKeys = computed(() => resolveFlexTableKeys(props.keys));

const containerClass = computed(() => cn('@container', props.classNames?.container));
const assetsClass = computed(() =>
  cn('mx-auto my-6 flex justify-between', props.classNames?.assets),
);
const cardClass = computed(() => cn('mx-auto rounded-lg border', props.classNames?.card));

const { isMobile } = useDeviceType();

const { table, handleFiltersUpdate } = useFlexTable<TData, TValue>(
  {
    columns: props.columns,
    data: computed(() => props.data),
    serverSideSorting: props.serverSideSorting,
    serverSideFiltering: props.serverSideFiltering,
    serverSidePagination: computed(() => props.serverSidePagination),
    useFuzzySearch: props.useFuzzySearch,
    searchColumns: props.searchColumns,
  },
  (event, value) => {
    if (event === 'update:sorting') emit('update:sorting', value as SortingState);
    else if (event === 'update:search') emit('update:search', value as string);
    else emit('update:filters', value as Array<ColumnFilter>);
  },
);

const handleSearchUpdate = (value: string) => table.setGlobalFilter(value);

const { currentPagination, canPreviousPage, canNextPage, updatePageSize, goToPage } =
  useTableClientPagination(
    { table, serverSidePagination: computed(() => props.serverSidePagination) },
    (event, value) => {
      if (event === 'update:page') emit('update:page', value as number);
      else emit('update:pageSize', value as number);
    },
  );

const { getPinnedItemClassDefinition } = useColumnPinning({
  table,
  pinnedColumnId: props.pinnedColumnId,
  pinOnMobile: props.pinOnMobile,
  pinOnDesktop: props.pinOnDesktop,
  isMobile,
});

defineSlots<{
  asset?(props: {
    table: Table<TData>;
    handleSearchUpdate: (value: string) => void;
  }): unknown;
  tableFilters?(props: {
    table: Table<TData>;
    handleFiltersUpdate: (columnFilters: Array<ColumnFilter>) => void;
    handleSearchUpdate: (value: string) => void;
  }): unknown;
  expandedRowContent?(props: { row: unknown; table: Table<TData> }): unknown;
}>();

defineExpose({ table: () => table });
</script>

<template>
  <div :class="containerClass">
    <div :class="assetsClass">
      <slot name="asset" :table="table" :handle-search-update="handleSearchUpdate" />
    </div>
    <div :class="cardClass">
      <TableToolbar
        :table="table"
        :t="t"
        :keys="resolvedKeys"
        :class-name="classNames?.toolbar"
        :handle-filters-update="handleFiltersUpdate"
        :handle-search-update="handleSearchUpdate"
        :show-search="showSearch"
      >
        <template #tableFilters="{ table: slotTable, handleFiltersUpdate: slotHandleFiltersUpdate, handleSearchUpdate: slotHandleSearchUpdate }">
          <slot
            name="tableFilters"
            :table="slotTable"
            :handle-filters-update="slotHandleFiltersUpdate"
            :handle-search-update="slotHandleSearchUpdate"
          />
        </template>
      </TableToolbar>

      <TableContent
        :table="table"
        :columns="columns"
        :t="t"
        :keys="resolvedKeys"
        :class-name="classNames?.content"
        :get-pinned-item-class-definition="getPinnedItemClassDefinition"
        @row-click="(row: TData) => emit('rowClick', row)"
      >
        <template #expandedRowContent="{ row, table: slotTable }">
          <slot name="expandedRowContent" :row="row" :table="slotTable" />
        </template>
      </TableContent>

      <TablePagination
        :t="t"
        :current-pagination="currentPagination"
        :can-previous-page="canPreviousPage"
        :can-next-page="canNextPage"
        :keys="resolvedKeys"
        :class-name="classNames?.pagination"
        :update-page-size="updatePageSize"
        :go-to-page="goToPage"
      />
    </div>
  </div>
</template>
