import { rankItem } from '@tanstack/match-sorter-utils';
import type { ColumnFilter, Row, Table } from '@tanstack/table-core';

export interface GlobalSearchFilterOptions {
  searchColumns: Array<string>;
  useFuzzySearch?: boolean;
}

/** Builds a TanStack `globalFilterFn` that searches raw row data across a fixed set of columns. */
export function createGlobalSearchFilter<T>(
  options: GlobalSearchFilterOptions,
): (row: Row<T>, columnId: string, value: string) => boolean {
  const { searchColumns, useFuzzySearch = true } = options;

  return (row, _columnId, value) => {
    if (!value || typeof value !== 'string') {
      return true;
    }
    const searchValue = value.toLowerCase().trim();
    if (!searchValue || searchColumns.length === 0) {
      return true;
    }

    const rowData = row.original as Record<string, unknown>;
    return searchColumns.some((columnName) => {
      if (!(columnName in rowData)) {
        return false;
      }
      const cellValue = rowData[columnName];
      if (cellValue === null || cellValue === undefined) {
        return false;
      }
      const stringValue = String(cellValue).toLowerCase();
      return useFuzzySearch
        ? rankItem(stringValue, searchValue).passed
        : stringValue.includes(searchValue);
    });
  };
}

/**
 * Applies a batch of TanStack `ColumnFilter`s to a table instance, routing the
 * reserved `search` filter id to the global filter instead of a column filter.
 */
export function applyClientFilterUpdates<T>(
  filters: Array<ColumnFilter>,
  table: Table<T>,
): void {
  for (const filter of filters) {
    const { id: filterId, value: filterValue } = filter;
    if (filterId === 'search') {
      table.setGlobalFilter(filterValue || undefined);
      continue;
    }
    if (filterValue === 'all') {
      table.getColumn(filterId)?.setFilterValue(undefined);
    } else {
      table.getColumn(filterId)?.setFilterValue(filterValue);
    }
  }
}
