import { describe, expect, test } from 'bun:test';
import type { ColumnFilter, SortingState } from '@tanstack/vue-table';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import type { TableCompatibleStore } from './useTableServerFilters';
import { useDefaultTableHandlers, useTableServerFilters } from './useTableServerFilters';

function makeStore(overrides: Partial<TableCompatibleStore> = {}) {
  const calls: Array<{ name: string; args: unknown }> = [];
  const store: TableCompatibleStore = {
    loading: false,
    goToPage: async (page) => {
      calls.push({ name: 'goToPage', args: page });
    },
    updatePageSize: async (pageSize) => {
      calls.push({ name: 'updatePageSize', args: pageSize });
    },
    updateFilters: async (query) => {
      calls.push({ name: 'updateFilters', args: query });
    },
    fetchData: async () => {
      calls.push({ name: 'fetchData', args: undefined });
    },
    resetFilters: () => {
      calls.push({ name: 'resetFilters', args: undefined });
    },
    ...overrides,
  };
  return { store, calls };
}

/** useTableServerFilters calls provide()/onMounted(), which require a real component setup context. */
function mountWithComposable<T>(setup: () => T) {
  let exposed: T | undefined;
  const wrapper = mount(
    defineComponent({
      setup() {
        exposed = setup();
        return () => h('div');
      },
    }),
  );
  return { wrapper, get: () => exposed as T };
}

describe('useTableServerFilters', () => {
  test('auto-fetches on mount by default: resetFilters then fetchData', () => {
    const { store, calls } = makeStore();
    mountWithComposable(() => useTableServerFilters({ store }));

    expect(calls.map((c) => c.name)).toEqual(['resetFilters', 'fetchData']);
  });

  test('autoFetch: false skips the initial fetchData call', () => {
    const { store, calls } = makeStore();
    mountWithComposable(() => useTableServerFilters({ store, autoFetch: false }));

    expect(calls.map((c) => c.name)).toEqual(['resetFilters']);
  });

  test('handlePageUpdate/handlePageSizeUpdate delegate straight to the store', async () => {
    const { store, calls } = makeStore();
    const { get } = mountWithComposable(() => useTableServerFilters({ store }));

    await get().handlePageUpdate(3);
    await get().handlePageSizeUpdate(50);

    expect(calls).toContainEqual({ name: 'goToPage', args: 3 });
    expect(calls).toContainEqual({ name: 'updatePageSize', args: 50 });
  });

  test('handleSortingUpdate maps a SortingState into a sortBy/sortOrder query', async () => {
    const { store, calls } = makeStore();
    const { get } = mountWithComposable(() => useTableServerFilters({ store }));

    const sorting: SortingState = [{ id: 'name', desc: true }];
    await get().handleSortingUpdate(sorting);

    expect(calls.at(-1)).toEqual({
      name: 'updateFilters',
      args: { sortBy: 'name', sortOrder: 'desc' },
    });
  });

  test('handleSortingUpdate clears sortBy/sortOrder when sorting is empty', async () => {
    const { store, calls } = makeStore();
    const { get } = mountWithComposable(() => useTableServerFilters({ store }));

    await get().handleSortingUpdate([]);

    expect(calls.at(-1)).toEqual({
      name: 'updateFilters',
      args: { sortBy: undefined, sortOrder: undefined },
    });
  });

  test('handleFiltersUpdate routes "search" to the top-level query and others into a filters object', async () => {
    const { store, calls } = makeStore();
    const { get } = mountWithComposable(() => useTableServerFilters({ store }));

    const filters: Array<ColumnFilter> = [
      { id: 'search', value: 'ada' },
      { id: 'status', value: 'active' },
    ];
    await get().handleFiltersUpdate(filters);

    expect(calls.at(-1)).toEqual({
      name: 'updateFilters',
      args: { search: 'ada', status: 'active' },
    });
  });

  test('handleFiltersUpdate treats the "all" sentinel as clearing that filter', async () => {
    const { store, calls } = makeStore();
    const { get } = mountWithComposable(() => useTableServerFilters({ store }));

    await get().handleFiltersUpdate([{ id: 'status', value: 'all' }]);

    expect(calls.at(-1)).toEqual({ name: 'updateFilters', args: { status: undefined } });
  });

  test('a custom filter handler can override how a filter id maps into the query', async () => {
    const { store, calls } = makeStore();
    const { get } = mountWithComposable(() =>
      useTableServerFilters({
        store,
        customFilters: { category: (value) => ({ categoryId: `cat-${value}` }) },
      }),
    );

    await get().handleFiltersUpdate([{ id: 'category', value: 'books' }]);

    expect(calls.at(-1)).toEqual({
      name: 'updateFilters',
      args: { categoryId: 'cat-books' },
    });
  });

  test('useDefaultTableHandlers wires "search" through customFilters out of the box', async () => {
    const { store, calls } = makeStore();
    const { get } = mountWithComposable(() => useDefaultTableHandlers(store));

    await get().handleFiltersUpdate([{ id: 'search', value: 'ada' }]);

    expect(calls.at(-1)).toEqual({ name: 'updateFilters', args: { search: 'ada' } });
  });
});
