import { describe, expect, test } from 'bun:test';
import type { PaginationQuery } from '@flextable/core';
import { useTableServerPaginationHandler } from './useTableServerPaginationHandler';

interface Widget {
  id: string;
  name: string;
}

function makePage(page: number, pageSize: number, itemCount: number): Array<Widget> {
  const start = (page - 1) * pageSize;
  return Array.from(
    { length: Math.min(pageSize, Math.max(0, itemCount - start)) },
    (_, i) => ({
      id: `w${start + i}`,
      name: `Widget ${start + i}`,
    }),
  );
}

function makeRefetch(itemCount = 25, pageSize = 10) {
  return async (query: { page?: number; pageSize?: number }) => {
    const page = query.page ?? 1;
    const size = query.pageSize ?? pageSize;
    return {
      items: makePage(page, size, itemCount),
      itemCount,
      page,
      pageSize: size,
      pageCount: Math.ceil(itemCount / size),
    };
  };
}

describe('useTableServerPaginationHandler', () => {
  test('fetchData populates items and pagination from the refetch function', async () => {
    const handler = useTableServerPaginationHandler<Widget>({
      refetchFunction: makeRefetch(),
    });
    await handler.fetchData();

    expect(handler.items.value).toHaveLength(10);
    expect(handler.pagination.value).toEqual({
      itemCount: 25,
      page: 1,
      pageSize: 10,
      pageCount: 3,
    });
  });

  test('goToPage / updatePageSize / updateFilters all refetch with merged query params', async () => {
    const seenQueries: Array<PaginationQuery> = [];
    const refetch = async (query: PaginationQuery) => {
      seenQueries.push(query);
      return makeRefetch()(query);
    };
    const handler = useTableServerPaginationHandler<Widget>({ refetchFunction: refetch });

    await handler.goToPage(2);
    expect(seenQueries.at(-1)).toMatchObject({ page: 2 });

    await handler.updatePageSize(5);
    expect(seenQueries.at(-1)).toMatchObject({ page: 1, pageSize: 5 });

    await handler.updateFilters({ search: 'widget' } as Partial<{ search: string }>);
    expect(seenQueries.at(-1)).toMatchObject({ page: 1, search: 'widget' });
  });

  test('handlePostCreate prepends the new item and bumps itemCount, trimming to pageSize', async () => {
    const handler = useTableServerPaginationHandler<Widget>({
      refetchFunction: makeRefetch(),
      initialPageSize: 2,
    });
    await handler.fetchData();
    expect(handler.items.value).toHaveLength(2);

    handler.handlePostCreate({ id: 'new', name: 'New Widget' });

    expect(handler.items.value[0]).toEqual({ id: 'new', name: 'New Widget' });
    expect(handler.items.value).toHaveLength(2);
    expect(handler.pagination.value.itemCount).toBe(26);
  });

  test('handlePostUpdate replaces the matching item in place', async () => {
    const handler = useTableServerPaginationHandler<Widget>({
      refetchFunction: makeRefetch(),
    });
    await handler.fetchData();

    handler.handlePostUpdate({ id: 'w0', name: 'Renamed' });
    expect(handler.items.value.find((item) => item.id === 'w0')?.name).toBe('Renamed');
  });

  test('handlePostUpdatePartial patches only the given fields', async () => {
    const handler = useTableServerPaginationHandler<Widget>({
      refetchFunction: makeRefetch(),
    });
    await handler.fetchData();

    const patch = handler.handlePostUpdatePartial('w0', { name: 'Patched' });
    expect(patch).toEqual({ name: 'Patched' });
    expect(handler.items.value.find((item) => item.id === 'w0')?.name).toBe('Patched');
  });

  test('removeItemsFromList removes the given ids from both items and allItems', async () => {
    const handler = useTableServerPaginationHandler<Widget>({
      refetchFunction: makeRefetch(),
    });
    await handler.fetchData();

    handler.removeItemsFromList(['w0', 'w1']);
    expect(handler.items.value.some((item) => item.id === 'w0' || item.id === 'w1')).toBe(
      false,
    );
  });

  test('handleBulkDelete removes items and refetches when the current page becomes empty', async () => {
    let fetchCount = 0;
    const refetch = async (query: { page?: number; pageSize?: number }) => {
      fetchCount += 1;
      return makeRefetch(1, 10)(query);
    };
    const handler = useTableServerPaginationHandler<Widget>({ refetchFunction: refetch });
    await handler.fetchData();
    expect(handler.items.value).toHaveLength(1);

    await handler.handleBulkDelete(['w0']);
    expect(fetchCount).toBe(2); // initial fetch + refetch after emptying the page
  });

  test('resetFilters clears items, pagination and query back to defaults', async () => {
    const handler = useTableServerPaginationHandler<Widget>({
      refetchFunction: makeRefetch(),
      initialPageSize: 10,
    });
    await handler.fetchData({ page: 2 });
    expect(handler.items.value.length).toBeGreaterThan(0);

    handler.resetFilters();
    expect(handler.items.value).toEqual([]);
    expect(handler.pagination.value).toEqual({
      itemCount: 0,
      page: 1,
      pageSize: 10,
      pageCount: 0,
    });
    expect(handler.query.value).toMatchObject({ page: 1, pageSize: 10 });
  });

  test('fetchAllData merges and de-duplicates results by id when fetchAll is provided', async () => {
    const fetchAll = async () => [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ];
    const handler = useTableServerPaginationHandler<Widget>({
      refetchFunction: makeRefetch(),
      fetchAll,
    });

    const first = await handler.fetchAllData();
    expect(first).toHaveLength(2);
    expect(handler.allItems.value).toHaveLength(2);

    await handler.fetchAllData();
    expect(handler.allItems.value).toHaveLength(2); // still de-duplicated, not doubled
  });

  test('fetchAllData without force returns the current allItems snapshot without calling fetchAll', async () => {
    const handler = useTableServerPaginationHandler<Widget>({
      refetchFunction: makeRefetch(),
    });
    const result = await handler.fetchAllData({}, { force: false });
    expect(result).toEqual([]);
  });
});
