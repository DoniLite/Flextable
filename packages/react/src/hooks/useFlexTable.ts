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
} from '@tanstack/react-table';
import {
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';

export interface UseFlexTableOptions<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>;
  data: Array<TData>;
  serverSideSorting?: boolean;
  serverSideFiltering?: boolean;
  serverSidePagination?: Pick<
    PaginatedResponse<TData>,
    'itemCount' | 'page' | 'pageSize' | 'pageCount'
  >;
  useFuzzySearch?: boolean;
  searchColumns?: Array<string>;
}

export interface UseFlexTableEmits {
  (event: 'update:sorting', sorting: SortingState): void;
  (event: 'update:filters', filters: Array<ColumnFilter>): void;
  (event: 'update:search', value: string): void;
}

export interface UseFlexTableResult<TData> {
  table: Table<TData>;
  handleFiltersUpdate: (filters: Array<ColumnFilter>, table: Table<TData>) => void;
}

export function useFlexTable<TData, TValue>(
  options: UseFlexTableOptions<TData, TValue>,
  emit: UseFlexTableEmits,
): UseFlexTableResult<TData> {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<Array<ColumnFilter>>([]);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [pinning, setPinning] = useState<ColumnPinningState>({});

  const globalSearchFilter = useMemo(
    () =>
      createGlobalSearchFilter<TData>({
        searchColumns: options.searchColumns ?? [],
        useFuzzySearch: options.useFuzzySearch,
      }),
    [options.searchColumns, options.useFuzzySearch],
  );

  const handleFiltersUpdate = useCallback(
    (filters: Array<ColumnFilter>, table: Table<TData>) =>
      applyClientFilterUpdates(filters, table),
    [],
  );

  const table = useReactTable({
    data: options.data,
    columns: options.columns,
    manualPagination: !!options.serverSidePagination,
    manualSorting: options.serverSideSorting,
    manualFiltering: options.serverSideFiltering,
    pageCount: options.serverSidePagination?.pageCount ?? -1,

    globalFilterFn: !options.serverSideFiltering ? globalSearchFilter : undefined,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    onSortingChange: (updaterOrValue) => {
      setSorting((old) => {
        const next =
          updaterOrValue instanceof Function ? updaterOrValue(old) : updaterOrValue;
        if (options.serverSideSorting) emit('update:sorting', next);
        return next;
      });
    },
    onColumnFiltersChange: (updaterOrValue) => {
      setColumnFilters((old) => {
        const next =
          updaterOrValue instanceof Function ? updaterOrValue(old) : updaterOrValue;
        if (options.serverSideFiltering) emit('update:filters', next);
        return next;
      });
    },
    onGlobalFilterChange: (updaterOrValue) => {
      setGlobalFilter((old) => {
        const next =
          updaterOrValue instanceof Function ? updaterOrValue(old) : updaterOrValue;
        emit('update:search', next ?? '');
        if (options.serverSideFiltering)
          emit('update:filters', [{ id: 'search', value: next }]);
        return next;
      });
    },
    onColumnVisibilityChange: (updaterOrValue) =>
      setColumnVisibility((old) =>
        updaterOrValue instanceof Function ? updaterOrValue(old) : updaterOrValue,
      ),
    onRowSelectionChange: (updaterOrValue) =>
      setRowSelection((old) =>
        updaterOrValue instanceof Function ? updaterOrValue(old) : updaterOrValue,
      ),
    onExpandedChange: (updaterOrValue) =>
      setExpanded((old) =>
        updaterOrValue instanceof Function ? updaterOrValue(old) : updaterOrValue,
      ),
    onColumnPinningChange: (updaterOrValue) =>
      setPinning((old) =>
        updaterOrValue instanceof Function ? updaterOrValue(old) : updaterOrValue,
      ),

    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
      expanded,
      columnPinning: pinning,
      ...(options.serverSidePagination && {
        pagination: {
          pageIndex: options.serverSidePagination.page - 1,
          pageSize: options.serverSidePagination.pageSize,
        },
      }),
    },
  });

  return { table, handleFiltersUpdate };
}
