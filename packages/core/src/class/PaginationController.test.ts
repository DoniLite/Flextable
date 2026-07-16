import { describe, expect, test } from 'bun:test';
import type { Table } from '@tanstack/table-core';
import { PaginationController } from './PaginationController';

function makeTable(
  overrides: { pageIndex?: number; pageSize?: number; filteredRowCount?: number } = {},
): { table: Table<unknown>; calls: Array<string> } {
  const { pageIndex = 0, pageSize = 10, filteredRowCount = 25 } = overrides;
  const calls: Array<string> = [];
  const table = {
    getState: () => ({ pagination: { pageIndex, pageSize } }),
    getFilteredRowModel: () => ({
      rows: Array.from({ length: filteredRowCount }, (_, i) => ({ id: i })),
    }),
    setPageSize: (size: number) => calls.push(`setPageSize:${size}`),
    setPageIndex: (index: number) => calls.push(`setPageIndex:${index}`),
  } as unknown as Table<unknown>;
  return { table, calls };
}

describe('PaginationController — client-side', () => {
  test('derives the current page snapshot from table state', () => {
    const { table } = makeTable({ pageIndex: 1, pageSize: 10, filteredRowCount: 25 });
    const controller = new PaginationController(table);
    expect(controller.current).toEqual({
      page: 2,
      pageSize: 10,
      pageCount: 3,
      itemCount: 25,
    });
  });

  test('canPreviousPage/canNextPage reflect the boundaries', () => {
    const first = new PaginationController(
      makeTable({ pageIndex: 0, filteredRowCount: 25 }).table,
    );
    expect(first.canPreviousPage).toBe(false);
    expect(first.canNextPage).toBe(true);

    const last = new PaginationController(
      makeTable({ pageIndex: 2, filteredRowCount: 25 }).table,
    );
    expect(last.canPreviousPage).toBe(true);
    expect(last.canNextPage).toBe(false);
  });

  test('updatePageSize/goToPage delegate directly to the table instance', () => {
    const { table, calls } = makeTable();
    const controller = new PaginationController(table);
    controller.updatePageSize(50);
    controller.goToPage(3);
    expect(calls).toEqual(['setPageSize:50', 'setPageIndex:2']);
  });
});

describe('PaginationController — server-side', () => {
  const serverSidePagination = { page: 2, pageSize: 20, pageCount: 5, itemCount: 100 };

  test('uses the server-supplied snapshot verbatim', () => {
    const { table } = makeTable();
    const controller = new PaginationController(table, serverSidePagination);
    expect(controller.current).toEqual(serverSidePagination);
    expect(controller.canPreviousPage).toBe(true);
    expect(controller.canNextPage).toBe(true);
  });

  test('updatePageSize/goToPage call the server callback instead of the table', () => {
    const { table, calls } = makeTable();
    const controller = new PaginationController(table, serverSidePagination);
    let serverSize: number | undefined;
    let serverPage: number | undefined;
    controller.updatePageSize(30, (size) => {
      serverSize = size;
    });
    controller.goToPage(4, (page) => {
      serverPage = page;
    });
    expect(serverSize).toBe(30);
    expect(serverPage).toBe(4);
    expect(calls).toEqual([]);
  });
});
