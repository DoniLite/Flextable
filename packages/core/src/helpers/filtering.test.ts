import { describe, expect, test } from 'bun:test';
import type { ColumnFilter, Row, Table } from '@tanstack/table-core';
import { applyClientFilterUpdates, createGlobalSearchFilter } from './filtering';

function makeRow<T>(original: T): Row<T> {
  return { original } as Row<T>;
}

describe('createGlobalSearchFilter', () => {
  test('matches with no configured search columns is a no-op pass-through', () => {
    const filter = createGlobalSearchFilter<{ name: string }>({ searchColumns: [] });
    expect(filter(makeRow({ name: 'Alice' }), 'search', 'alice')).toBe(true);
  });

  test('returns true for empty/blank search values without filtering', () => {
    const filter = createGlobalSearchFilter<{ name: string }>({
      searchColumns: ['name'],
    });
    expect(filter(makeRow({ name: 'Alice' }), 'search', '')).toBe(true);
    expect(filter(makeRow({ name: 'Alice' }), 'search', '   ')).toBe(true);
  });

  test('fuzzy-matches across the configured columns', () => {
    const filter = createGlobalSearchFilter<{ name: string; email: string }>({
      searchColumns: ['name', 'email'],
    });
    expect(
      filter(makeRow({ name: 'Alice Doe', email: 'a@x.com' }), 'search', 'alice'),
    ).toBe(true);
    expect(
      filter(makeRow({ name: 'Bob', email: 'alice@x.com' }), 'search', 'alice'),
    ).toBe(true);
    expect(filter(makeRow({ name: 'Bob', email: 'b@x.com' }), 'search', 'alice')).toBe(
      false,
    );
  });

  test('substring-matches when fuzzy search is disabled', () => {
    const filter = createGlobalSearchFilter<{ name: string }>({
      searchColumns: ['name'],
      useFuzzySearch: false,
    });
    expect(filter(makeRow({ name: 'Alice' }), 'search', 'lic')).toBe(true);
    expect(filter(makeRow({ name: 'Alice' }), 'search', 'xyz')).toBe(false);
  });

  test('skips columns absent from row data or holding nullish values', () => {
    const filter = createGlobalSearchFilter<Record<string, unknown>>({
      searchColumns: ['missing', 'nullable'],
    });
    expect(
      filter(makeRow<Record<string, unknown>>({ nullable: null }), 'search', 'anything'),
    ).toBe(false);
  });
});

describe('applyClientFilterUpdates', () => {
  function makeTable(): { table: Table<unknown>; calls: Array<string> } {
    const calls: Array<string> = [];
    const column = { setFilterValue: (v: unknown) => calls.push(`setFilterValue:${v}`) };
    const table = {
      setGlobalFilter: (v: unknown) => calls.push(`setGlobalFilter:${v}`),
      getColumn: () => column,
    } as unknown as Table<unknown>;
    return { table, calls };
  }

  test('routes the reserved "search" id to setGlobalFilter', () => {
    const { table, calls } = makeTable();
    const filters: Array<ColumnFilter> = [{ id: 'search', value: 'hello' }];
    applyClientFilterUpdates(filters, table);
    expect(calls).toEqual(['setGlobalFilter:hello']);
  });

  test('clears the column filter when value is the "all" sentinel', () => {
    const { table, calls } = makeTable();
    applyClientFilterUpdates([{ id: 'status', value: 'all' }], table);
    expect(calls).toEqual(['setFilterValue:undefined']);
  });

  test('sets a regular column filter otherwise', () => {
    const { table, calls } = makeTable();
    applyClientFilterUpdates([{ id: 'status', value: 'active' }], table);
    expect(calls).toEqual(['setFilterValue:active']);
  });
});
