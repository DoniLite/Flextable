import { useCallback, useMemo } from 'react';
import type { Table } from '@tanstack/react-table';
import type { PaginatedResponse } from '@/lib/interfaces/pagination';

interface UseTableClientPaginationOptions<TData> {
  table: Table<TData>;
  serverSidePagination?:
    | Pick<
        PaginatedResponse<TData>,
        'itemCount' | 'page' | 'pageSize' | 'pageCount'
      >
    | undefined;
}

type UseTableClientPaginationEmits = (
  evt: 'update:page' | 'update:pageSize',
  value: number,
) => void;

export function useTableClientPagination<TData>(
  options: UseTableClientPaginationOptions<TData>,
  emit: UseTableClientPaginationEmits,
) {
  // Client-side pagination calculations
  const clientSidePagination = useMemo(() => {
    const state = options.table.getState();
    const { pageIndex, pageSize } = state.pagination;
    const filteredRows = options.table.getFilteredRowModel().rows;
    const pageCount = Math.ceil(filteredRows.length / pageSize);
    return {
      page: pageIndex + 1,
      pageSize: pageSize,
      pageCount: pageCount,
      itemCount: options.table.getFilteredRowModel().rows.length,
    };
  }, [options.table]);

  // Current pagination state (server-side or client-side)
  const currentPagination = useMemo(
    () => options.serverSidePagination ?? clientSidePagination,
    [clientSidePagination, options.serverSidePagination],
  );

  // Navigation helpers
  const canPreviousPage = useMemo(
    () => currentPagination.page > 1,
    [currentPagination.page],
  );
  const canNextPage = useMemo(
    () => currentPagination.page < currentPagination.pageCount,
    [currentPagination.pageCount, currentPagination.page],
  );

  // Actions
  const updatePageSize = useCallback(
    (newSize: number) => {
      if (options.serverSidePagination) {
        emit('update:pageSize', newSize);
      } else {
        options.table.setPageSize(newSize);
      }
    },
    [emit, options.serverSidePagination, options.table.setPageSize],
  );

  const goToPage = useCallback(
    (page: number) => {
      if (options.serverSidePagination) {
        emit('update:page', page);
      } else {
        options.table.setPageIndex(page - 1); // Convert from 1-based to 0-based
      }
    },
    [emit, options.serverSidePagination, options.table.setPageIndex],
  );

  return {
    currentPagination: currentPagination,
    canPreviousPage: canPreviousPage,
    canNextPage: canNextPage,
    updatePageSize,
    goToPage,
  };
}
