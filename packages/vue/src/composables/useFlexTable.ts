import type { PaginatedResponse } from '@flextable/core';
import { applyClientFilterUpdates, createGlobalSearchFilter } from '@flextable/core';
import type {
  ColumnDef,
  ColumnFilter,
  ColumnPinningState,
  ExpandedState,
  SortingState,
  Table,
  VisibilityState,
} from '@tanstack/vue-table';
import {
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table';
import type { ComputedRef } from 'vue';
import { computed, ref } from 'vue';

export interface UseFlexTableOptions<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>;
  data: ComputedRef<Array<TData>>;
  serverSideSorting?: boolean;
  serverSideFiltering?: boolean;
  serverSidePagination?: ComputedRef<
    | Pick<PaginatedResponse<TData>, 'itemCount' | 'page' | 'pageSize' | 'pageCount'>
    | undefined
  >;
  useFuzzySearch?: boolean;
  searchColumns?: Array<string>;
}

export interface UseFlexTableEmits {
  (event: 'update:sorting', sorting: SortingState): void;
  (event: 'update:filters', filters: Array<ColumnFilter>): void;
  (event: 'update:search', value: string): void;
}

export function useFlexTable<TData, TValue>(
  options: UseFlexTableOptions<TData, TValue>,
  emit: UseFlexTableEmits,
) {
  const sorting = ref<SortingState>([]);
  const columnFilters = ref<Array<ColumnFilter>>([]);
  const globalFilter = ref<string>('');
  const columnVisibility = ref<VisibilityState>({});
  const rowSelection = ref({});
  const expanded = ref<ExpandedState>({});
  const pinning = ref<ColumnPinningState>({});

  const globalSearchFilter = createGlobalSearchFilter<TData>({
    searchColumns: options.searchColumns ?? [],
    useFuzzySearch: options.useFuzzySearch,
  });

  const handleFiltersUpdate = (filters: Array<ColumnFilter>, table: Table<TData>) =>
    applyClientFilterUpdates(filters, table);

  const table = useVueTable({
    get data() {
      return options.data.value;
    },
    get columns() {
      return options.columns;
    },
    manualPagination: !!options.serverSidePagination?.value,
    manualSorting: options.serverSideSorting,
    manualFiltering: options.serverSideFiltering,
    pageCount: options.serverSidePagination?.value?.pageCount ?? -1,

    globalFilterFn: !options.serverSideFiltering ? globalSearchFilter : undefined,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    onSortingChange: (updaterOrValue) => {
      const next =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(sorting.value)
          : updaterOrValue;
      sorting.value = next;
      if (options.serverSideSorting) emit('update:sorting', next);
    },
    onColumnFiltersChange: (updaterOrValue) => {
      const next =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(columnFilters.value)
          : updaterOrValue;
      columnFilters.value = next;
      if (options.serverSideFiltering) emit('update:filters', next);
    },
    onGlobalFilterChange: (updaterOrValue) => {
      const next =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(globalFilter.value)
          : updaterOrValue;
      globalFilter.value = next;
      emit('update:search', next ?? '');
      if (options.serverSideFiltering)
        emit('update:filters', [{ id: 'search', value: next }]);
    },
    onColumnVisibilityChange: (updaterOrValue) => {
      columnVisibility.value =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(columnVisibility.value)
          : updaterOrValue;
    },
    onRowSelectionChange: (updaterOrValue) => {
      rowSelection.value =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(rowSelection.value)
          : updaterOrValue;
    },
    onExpandedChange: (updaterOrValue) => {
      expanded.value =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(expanded.value)
          : updaterOrValue;
    },
    onColumnPinningChange: (updaterOrValue) => {
      pinning.value =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(pinning.value)
          : updaterOrValue;
    },

    state: {
      get sorting() {
        return sorting.value;
      },
      get columnFilters() {
        return columnFilters.value;
      },
      get globalFilter() {
        return globalFilter.value;
      },
      get columnVisibility() {
        return columnVisibility.value;
      },
      get rowSelection() {
        return rowSelection.value;
      },
      get expanded() {
        return expanded.value;
      },
      get columnPinning() {
        return pinning.value;
      },
      ...(options.serverSidePagination?.value && {
        pagination: {
          pageIndex: options.serverSidePagination.value.page - 1,
          pageSize: options.serverSidePagination.value.pageSize,
        },
      }),
    },
  });

  return {
    table,
    handleFiltersUpdate,
    sorting: computed(() => sorting.value),
    columnFilters: computed(() => columnFilters.value),
    globalFilter: computed(() => globalFilter.value),
    columnVisibility: computed(() => columnVisibility.value),
    rowSelection: computed(() => rowSelection.value),
    expanded: computed(() => expanded.value),
    pinning: computed(() => pinning.value),
  };
}
