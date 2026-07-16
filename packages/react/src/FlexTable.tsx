import type {
  FlexTableClassNames,
  FlexTableKeys,
  PaginatedResponse,
  TranslateFn,
} from '@flextable/core';
import { resolveFlexTableKeys } from '@flextable/core';
import { cn } from '@flextable/react-ui';
import type {
  ColumnDef,
  ColumnFilter,
  ColumnPinningPosition,
  SortingState,
  Table,
} from '@tanstack/react-table';
import type { ElementType } from 'react';
import { useCallback, useMemo } from 'react';
import type { SlotProps as TableContentSlotProps } from './components/TableContent';
import { TableContent } from './components/TableContent';
import { TablePagination } from './components/TablePagination';
import type { ToolbarSlotProps } from './components/TableToolbar';
import { TableToolbar } from './components/TableToolbar';
import { TablePaginationProvider } from './helpers/TablePaginationProvider';
import { useColumnPinning } from './hooks/useColumnPinning';
import { useDeviceType } from './hooks/useDeviceType';
import { useFlexTable } from './hooks/useFlexTable';
import { useTableClientPagination } from './hooks/useTableClientPagination';

export interface FlexTableSlotProps<TData> {
  table: Table<TData>;
  /** Calls `table.setGlobalFilter()` under the hood — the discoverable way for a custom `assets` component to drive the same search state as the built-in search box (and, in turn, `onSearchChange`). */
  handleSearchUpdate: (value: string) => void;
}

export interface FlexTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>;
  data: Array<TData>;
  t: TranslateFn;
  /** Overrides for the fixed translation keys used by the table's built-in chrome — see `FlexTableKeys`. */
  keys?: Partial<FlexTableKeys>;
  /** Additive className overrides for FlexTable's own structural layers — see `FlexTableClassNames`. */
  classNames?: FlexTableClassNames;
  pinnedColumnId?: string;
  pinOnMobile?: ColumnPinningPosition;
  pinOnDesktop?: ColumnPinningPosition;
  serverSideSorting?: boolean;
  serverSideFiltering?: boolean;
  serverSidePagination?: Pick<
    PaginatedResponse<TData>,
    'itemCount' | 'page' | 'pageSize' | 'pageCount'
  >;
  useFuzzySearch?: boolean;
  searchColumns?: Array<string>;
  onSortingChange?: (sorting: SortingState) => void;
  onFiltersChange?: (filters: Array<ColumnFilter>) => void;
  /** Fires on every search-input change, regardless of `serverSideFiltering` — the dedicated hook for driving a server-side search independently of the rest of the table's filtering mode. */
  onSearchChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  assets?: ElementType<FlexTableSlotProps<TData>>;
  tableFilters?: ElementType<ToolbarSlotProps<TData>>;
  tableContentComponent?: ElementType<TableContentSlotProps<TData>>;
}

function FlexTableInner<TData, TValue>(props: FlexTableProps<TData, TValue>) {
  const {
    data,
    columns,
    t,
    keys: keysOverride,
    classNames = {},
    pinnedColumnId = 'actions',
    pinOnMobile = 'right',
    pinOnDesktop = false,
    serverSideSorting = false,
    serverSideFiltering = true,
    serverSidePagination,
    useFuzzySearch = true,
    searchColumns = [],
    onSortingChange,
    onFiltersChange,
    onSearchChange,
    onPageChange,
    onPageSizeChange,
  } = props;
  const keys = useMemo(() => resolveFlexTableKeys(keysOverride), [keysOverride]);
  const { isMobile } = useDeviceType();

  const { table, handleFiltersUpdate } = useFlexTable<TData, TValue>(
    {
      columns,
      data: useMemo(() => data, [data]),
      serverSideSorting,
      serverSideFiltering,
      serverSidePagination: useMemo(() => serverSidePagination, [serverSidePagination]),
      useFuzzySearch,
      searchColumns,
    },
    (event, value) => {
      if (event === 'update:sorting') onSortingChange?.(value as SortingState);
      if (event === 'update:filters') onFiltersChange?.(value as Array<ColumnFilter>);
      if (event === 'update:search') onSearchChange?.(value as string);
    },
  );

  const { currentPagination, canPreviousPage, canNextPage, updatePageSize, goToPage } =
    useTableClientPagination(
      {
        table,
        serverSidePagination: useMemo(() => serverSidePagination, [serverSidePagination]),
      },
      (event, value) => {
        if (event === 'update:page') onPageChange?.(value);
        if (event === 'update:pageSize') onPageSizeChange?.(value);
      },
    );

  const { getPinnedItemClassDefinition } = useColumnPinning({
    table,
    pinnedColumnId,
    pinOnMobile,
    pinOnDesktop,
    isMobile,
  });

  const handleSearchUpdate = useCallback(
    (value: string) => table.setGlobalFilter(value),
    [table],
  );

  return (
    <div className={cn('@container container mx-auto', classNames.container)}>
      <div className={cn('mx-auto my-6 flex justify-between', classNames.assets)}>
        {props.assets && (
          <props.assets table={table} handleSearchUpdate={handleSearchUpdate} />
        )}
      </div>
      <div className={cn('mx-auto rounded-lg border', classNames.card)}>
        <TableToolbar
          table={table}
          t={t}
          keys={keys}
          className={classNames.toolbar}
          handleFiltersUpdate={handleFiltersUpdate}
          handleSearchUpdate={handleSearchUpdate}
          tableFilters={props.tableFilters}
        />

        <TableContent
          table={table}
          columns={columns}
          t={t}
          keys={keys}
          className={classNames.content}
          getPinnedItemClassDefinition={getPinnedItemClassDefinition}
          slotComponent={props.tableContentComponent}
        />

        <TablePagination
          t={t}
          currentPagination={currentPagination}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
          keys={keys}
          className={classNames.pagination}
          updatePageSize={updatePageSize}
          goToPage={goToPage}
        />
      </div>
    </div>
  );
}

export function FlexTable<TData, TValue>(props: FlexTableProps<TData, TValue>) {
  return (
    <TablePaginationProvider>
      <FlexTableInner {...props} />
    </TablePaginationProvider>
  );
}
