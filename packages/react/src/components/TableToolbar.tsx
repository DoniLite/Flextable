import type { FlexTableKeys, TranslateFn } from '@flextable/core';
import { cn } from '@flextable/react-ui';
import type { ColumnFilter, Table } from '@tanstack/react-table';
import type { ElementType } from 'react';
import { TableDropdown } from './TableDropdown';
import { TableSearchWithButton } from './TableSearchWithButton';

export interface ToolbarSlotProps<TData> {
  table: Table<TData>;
  handleFiltersUpdate: (columnFilters: Array<ColumnFilter>) => void;
  /** Calls `table.setGlobalFilter()` under the hood — the discoverable way for a custom `tableFilters` component to drive the same search state as the built-in search box. */
  handleSearchUpdate: (value: string) => void;
}

export interface TableToolbarProps<TData> {
  table: Table<TData>;
  t: TranslateFn;
  keys: FlexTableKeys;
  className?: string;
  handleFiltersUpdate: (columnFilters: Array<ColumnFilter>, table: Table<TData>) => void;
  handleSearchUpdate: (value: string) => void;
  tableFilters?: ElementType<ToolbarSlotProps<TData>>;
}

export function TableToolbar<TData>(props: TableToolbarProps<TData>) {
  const {
    table,
    t,
    keys,
    className,
    handleFiltersUpdate,
    handleSearchUpdate,
    tableFilters: FiltersSlot,
  } = props;

  return (
    <div className={cn('border-b-2 px-4 py-3', className)}>
      <div className="flex flex-col items-center gap-2 @lg:flex-row">
        <div className="flex w-full flex-col items-center gap-3 @lg:w-[80%] @lg:flex-row">
          <TableSearchWithButton
            t={t}
            keys={keys}
            className={FiltersSlot ? '@lg:max-w-[55%]' : '@lg:max-w-[65%]'}
            update={handleSearchUpdate}
          />
          {FiltersSlot && (
            <FiltersSlot
              table={table}
              handleFiltersUpdate={(columnFilters) =>
                handleFiltersUpdate(columnFilters, table)
              }
              handleSearchUpdate={handleSearchUpdate}
            />
          )}
        </div>
        <TableDropdown table={table} t={t} keys={keys} />
      </div>
    </div>
  );
}
