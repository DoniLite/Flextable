import type { FlexTableKeys, TranslateFn } from '@flextable/core';
import {
  cn,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@flextable/react-ui';
import type {
  ColumnDef,
  ColumnPinningPosition,
  Row,
  Table as TableType,
} from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import type { ElementType } from 'react';

export interface SlotProps<TData> {
  row: Row<TData>;
  table: TableType<TData>;
}

export interface TableContentProps<TData, TValue> {
  table: TableType<TData>;
  columns: Array<ColumnDef<TData, TValue>>;
  t: TranslateFn;
  keys: FlexTableKeys;
  className?: string;
  getPinnedItemClassDefinition: (
    index: number,
    itemsLength: number,
    pinnedState: ColumnPinningPosition,
  ) => Record<string, boolean>;
  slotComponent?: ElementType<SlotProps<TData>>;
}

export function TableContent<TData, TValue>(props: TableContentProps<TData, TValue>) {
  const {
    table,
    columns,
    t,
    keys,
    className,
    getPinnedItemClassDefinition,
    slotComponent,
  } = props;

  return (
    <Table wrapperClassName={className}>
      <TableHeader className="h-13 border-b-2">
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header, index) => (
              <TableHead
                key={header.id}
                className={cn(
                  getPinnedItemClassDefinition(
                    index,
                    group.headers.length,
                    header.column.getIsPinned(),
                  ),
                )}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>

      <TableBody>
        {table.getRowModel().rows.length ? (
          table
            .getRowModel()
            .rows.map((row) => (
              <RowChild
                key={row.id}
                row={row}
                table={table}
                getPinnedItemClassDefinition={getPinnedItemClassDefinition}
                slotComponent={slotComponent}
              />
            ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              {t(keys.noResult)}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function DefaultSlot<TData>({ row }: SlotProps<TData>) {
  return (
    <pre className="rounded bg-muted p-2 text-xs">
      {JSON.stringify(row.original, null, 2)}
    </pre>
  );
}

function RowChild<TData>(props: {
  table: TableType<TData>;
  row: Row<TData>;
  slotComponent?: ElementType<SlotProps<TData>>;
  getPinnedItemClassDefinition: (
    index: number,
    itemsLength: number,
    pinnedState: ColumnPinningPosition,
  ) => Record<string, boolean>;
}) {
  const { row, table, getPinnedItemClassDefinition, slotComponent: Slot } = props;
  return (
    <>
      <TableRow className="px-4" aria-selected={row.getIsSelected()}>
        {row.getVisibleCells().map((cell, index) => (
          <TableCell
            key={cell.id}
            className={cn(
              getPinnedItemClassDefinition(
                index,
                row.getVisibleCells().length,
                cell.column.getIsPinned(),
              ),
            )}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
      {row.getIsExpanded() && (
        <TableRow aria-expanded>
          <TableCell colSpan={row.getAllCells().length}>
            {Slot ? (
              <Slot row={row} table={table} />
            ) : (
              <DefaultSlot row={row} table={table} />
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
