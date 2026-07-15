import {
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import { useTableClientFilters } from './useTableClientFilters';
import type {
  ColumnDef,
  ColumnFilter,
  ColumnPinningState,
  ExpandedState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import type { PaginatedResponse } from '@/lib/interfaces/pagination';

interface UseFlexTableOptions<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>;
  data: Array<TData>;
  serverSideSorting?: boolean;
  serverSideFiltering?: boolean;
  serverSidePagination?:
    | Pick<
        PaginatedResponse<TData>,
        'itemCount' | 'page' | 'pageSize' | 'pageCount'
      >
    | undefined;

  useFuzzySearch?: boolean;
  searchColumns?: Array<string>;
}

interface UseFlexTableEmits {
  (e: 'update:sorting', sorting: SortingState): void;
  (e: 'update:filters', filters: Array<ColumnFilter>): void;
}

export function useFlexTable<TData extends Record<string, unknown>, TValue>(
  options: UseFlexTableOptions<TData, TValue>,
  emit: UseFlexTableEmits,
) {
  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<Array<ColumnFilter>>([]);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [pinning, setPinning] = useState<ColumnPinningState>({});

  // Client-side handlers
  const { handleFiltersUpdate, globalSearchFilter } =
    useTableClientFilters<TData>({
      searchColumns: options.searchColumns || [],
      useFuzzySearch: options.useFuzzySearch,
    });
  // Table configuration
  const table = useReactTable({
    get data() {
      return options.data;
    },
    get columns() {
      return options.columns;
    },
    manualPagination: !!options.serverSidePagination,
    manualSorting: options.serverSideSorting,
    manualFiltering: options.serverSideFiltering,
    pageCount: options.serverSidePagination?.pageCount ?? -1,

    globalFilterFn: !options.serverSideFiltering
      ? globalSearchFilter
      : undefined,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    onSortingChange: (updaterOrValue) => {
      setSorting((oldSorting) => {
        const sortingValue =
          updaterOrValue instanceof Function
            ? updaterOrValue(oldSorting)
            : updaterOrValue;
        if (options.serverSideSorting) {
          emit('update:sorting', sortingValue);
        }
        return sortingValue;
      });
    },
    onColumnFiltersChange: (updaterOrValue) => {
      setColumnFilters((oldFilters) => {
        const filtersValue =
          updaterOrValue instanceof Function
            ? updaterOrValue(oldFilters)
            : updaterOrValue;
        if (options.serverSideFiltering) {
          emit('update:filters', filtersValue);
        }
        return filtersValue;
      });
    },
    onGlobalFilterChange: (updaterOrValue) => {
      setGlobalFilter((oldFilter) => {
        const globalFilterValue =
          updaterOrValue instanceof Function
            ? updaterOrValue(oldFilter)
            : updaterOrValue;
        if (options.serverSideFiltering) {
          emit('update:filters', [{ id: 'search', value: globalFilterValue }]);
        }
        return globalFilterValue;
      });
    },
    onColumnVisibilityChange: (updaterOrValue) =>
      setColumnVisibility((oldVisibility) => {
        const visibilityValue =
          updaterOrValue instanceof Function
            ? updaterOrValue(oldVisibility)
            : updaterOrValue;
        return visibilityValue;
      }),
    onRowSelectionChange: (updaterOrValue) =>
      setRowSelection((oldSelection) => {
        const selectionValue =
          updaterOrValue instanceof Function
            ? updaterOrValue(oldSelection)
            : updaterOrValue;

        return selectionValue;
      }),
    onExpandedChange: (updaterOrValue) =>
      setExpanded((oldExpansion) => {
        const expansionValue =
          updaterOrValue instanceof Function
            ? updaterOrValue(oldExpansion)
            : updaterOrValue;

        return expansionValue;
      }),
    onColumnPinningChange: (updaterOrValue) =>
      setPinning((oldPinning) => {
        const pinningValue =
          updaterOrValue instanceof Function
            ? updaterOrValue(oldPinning)
            : updaterOrValue;

        return pinningValue;
      }),

    state: {
      get sorting() {
        return sorting;
      },
      get columnFilters() {
        return columnFilters;
      },
      get globalFilter() {
        return globalFilter;
      },
      get columnVisibility() {
        return columnVisibility;
      },
      get rowSelection() {
        return rowSelection;
      },
      get expanded() {
        return expanded;
      },
      get columnPinning() {
        return pinning;
      },
      ...(options.serverSidePagination && {
        pagination: {
          pageIndex: options.serverSidePagination.page - 1,
          pageSize: options.serverSidePagination.pageSize,
        },
      }),
    },
  });

  return {
    table,
    handleFiltersUpdate,
    // Expose state for external access if needed
    sorting: sorting,
    columnFilters: columnFilters,
    globalFilter: globalFilter,
    columnVisibility: columnVisibility,
    rowSelection: rowSelection,
    expanded: expanded,
    pinning: pinning,
  };
}
