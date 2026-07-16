import type { Table } from '@tanstack/table-core';
import type { PaginatedResponse } from '../types/pagination';

export interface PaginationSnapshot {
  page: number;
  pageSize: number;
  pageCount: number;
  itemCount: number;
}

export type ServerSidePagination<T> = Pick<
  PaginatedResponse<T>,
  'itemCount' | 'page' | 'pageSize' | 'pageCount'
>;

/**
 * Client/server pagination math shared by `@flextable/react` and `@flextable/vue` —
 * wrap an instance in `useMemo`/`computed` at the call site for reactivity.
 */
export class PaginationController<T> {
  #table: Table<T>;
  #serverSidePagination: ServerSidePagination<T> | undefined;

  constructor(table: Table<T>, serverSidePagination?: ServerSidePagination<T>) {
    this.#table = table;
    this.#serverSidePagination = serverSidePagination;
  }

  get current(): PaginationSnapshot {
    if (this.#serverSidePagination) {
      return this.#serverSidePagination;
    }
    const { pageIndex, pageSize } = this.#table.getState().pagination;
    const filteredRowCount = this.#table.getFilteredRowModel().rows.length;
    return {
      page: pageIndex + 1,
      pageSize,
      pageCount: Math.ceil(filteredRowCount / pageSize),
      itemCount: filteredRowCount,
    };
  }

  get canPreviousPage(): boolean {
    return this.current.page > 1;
  }

  get canNextPage(): boolean {
    return this.current.page < this.current.pageCount;
  }

  updatePageSize(newSize: number, onServerUpdate?: (size: number) => void): void {
    if (this.#serverSidePagination) {
      onServerUpdate?.(newSize);
    } else {
      this.#table.setPageSize(newSize);
    }
  }

  goToPage(page: number, onServerUpdate?: (page: number) => void): void {
    if (this.#serverSidePagination) {
      onServerUpdate?.(page);
    } else {
      this.#table.setPageIndex(page - 1);
    }
  }
}
