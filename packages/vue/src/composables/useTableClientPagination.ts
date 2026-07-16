import type { ServerSidePagination } from '@flextable/core';
import { PaginationController } from '@flextable/core';
import type { Table } from '@tanstack/vue-table';
import type { ComputedRef } from 'vue';
import { computed } from 'vue';

export interface UseTableClientPaginationOptions<TData> {
  table: Table<TData>;
  serverSidePagination?: ComputedRef<ServerSidePagination<TData> | undefined>;
}

export type UseTableClientPaginationEmit = (
  event: 'update:page' | 'update:pageSize',
  value: number,
) => void;

export function useTableClientPagination<TData>(
  options: UseTableClientPaginationOptions<TData>,
  emit: UseTableClientPaginationEmit,
) {
  const controller = computed(
    () => new PaginationController(options.table, options.serverSidePagination?.value),
  );

  const updatePageSize = (size: number) =>
    controller.value.updatePageSize(size, (s) => emit('update:pageSize', s));

  const goToPage = (page: number) =>
    controller.value.goToPage(page, (p) => emit('update:page', p));

  return {
    currentPagination: computed(() => controller.value.current),
    canPreviousPage: computed(() => controller.value.canPreviousPage),
    canNextPage: computed(() => controller.value.canNextPage),
    updatePageSize,
    goToPage,
  };
}
