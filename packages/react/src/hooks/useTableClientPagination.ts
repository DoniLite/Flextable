import type { PaginationSnapshot, ServerSidePagination } from '@flextable/core';
import { PaginationController } from '@flextable/core';
import type { Table } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';

export interface UseTableClientPaginationOptions<TData> {
  table: Table<TData>;
  serverSidePagination?: ServerSidePagination<TData>;
}

export type UseTableClientPaginationEmit = (
  event: 'update:page' | 'update:pageSize',
  value: number,
) => void;

export interface UseTableClientPaginationResult {
  currentPagination: PaginationSnapshot;
  canPreviousPage: boolean;
  canNextPage: boolean;
  updatePageSize: (size: number) => void;
  goToPage: (page: number) => void;
}

export function useTableClientPagination<TData>(
  options: UseTableClientPaginationOptions<TData>,
  emit: UseTableClientPaginationEmit,
): UseTableClientPaginationResult {
  const controller = useMemo(
    () => new PaginationController(options.table, options.serverSidePagination),
    [options.table, options.serverSidePagination],
  );

  const updatePageSize = useCallback(
    (size: number) => controller.updatePageSize(size, (s) => emit('update:pageSize', s)),
    [controller, emit],
  );

  const goToPage = useCallback(
    (page: number) => controller.goToPage(page, (p) => emit('update:page', p)),
    [controller, emit],
  );

  return {
    currentPagination: controller.current,
    canPreviousPage: controller.canPreviousPage,
    canNextPage: controller.canNextPage,
    updatePageSize,
    goToPage,
  };
}
