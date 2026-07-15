import { rankItem } from '@tanstack/match-sorter-utils';
import { useCallback } from 'react';
import type { ColumnFilter, Row, Table } from '@tanstack/react-table';

/**
 * Composable that provides client-side table filtering handlers
 * This is useful for tables that do not require server-side filtering and can handle all filtering logic in the client.
 * It allows for dynamic search across explicitly specified columns and custom filter handling.
 * It is designed to work with TanStack Table's ColumnFilter interface.
 */
export function useTableClientFilters<T>(options: {
  searchColumns: Array<string>;
  useFuzzySearch?: boolean;
}) {
  const { useFuzzySearch = true, searchColumns } = options;

  /**
   * Custom global filter function that searches across specified columns with OR logic
   * Searches raw data values only - simple and reliable
   */
  const globalSearchFilter = useCallback(
    (row: Row<T>, _columnId: string, value: string) => {
      // Empty value means no filtering
      if (!value || typeof value !== 'string') {
        return true;
      }

      const searchValue = value.toLowerCase().trim();
      if (!searchValue) {
        return true;
      }

      // If no search columns specified, don't filter (return true for all rows)
      if (searchColumns.length === 0) {
        return true;
      }

      // Helper function to check if a value matches the search
      const matchesSearch = (cellValue: unknown): boolean => {
        if (cellValue === null || cellValue === undefined) {
          return false;
        }

        const stringValue = String(cellValue).toLowerCase();

        if (useFuzzySearch) {
          const itemRank = rankItem(stringValue, searchValue);
          return itemRank.passed;
        } else {
          return stringValue.includes(searchValue);
        }
      };

      // Search across specified columns in raw data
      const rowData = row.original as Record<string, unknown>;
      for (const columnName of searchColumns) {
        if (columnName in rowData) {
          const cellValue = rowData[columnName];
          if (matchesSearch(cellValue)) {
            return true;
          }
        }
      }
      return false;
    },
    [searchColumns, useFuzzySearch],
  );

  /**
   * Handle filter updates with proper global vs column filtering
   */
  const handleFiltersUpdate = useCallback(
    (filters: Array<ColumnFilter>, table: Table<T>) => {
      for (const filter of filters) {
        const { id: filterId, value: filterValue } = filter;

        if (filterId === 'search') {
          // Use global filtering for search instead of column filtering
          table.setGlobalFilter(filterValue || undefined);
          continue;
        }

        // Handle regular column filters
        if (filterValue === 'all') {
          table.getColumn(filterId)?.setFilterValue(undefined);
        } else {
          table.getColumn(filterId)?.setFilterValue(filterValue);
        }
      }
    },
    [],
  );

  return {
    handleFiltersUpdate,
    globalSearchFilter,
  };
}
