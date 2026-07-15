import { flexRender } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import type {
  ColumnDef,
  ColumnPinningPosition,
  Row,
  Table as TableType,
} from '@tanstack/react-table';
import type { ElementType } from 'react';
import { cn } from '@/lib/utils';

interface Props<TData extends Record<string, unknown>, TValue> {
  table: TableType<TData>;
  columns: Array<ColumnDef<TData, TValue>>;
  noResultsTextKey: string;
  getPinnedItemClassDefinition: (
    index: number,
    itemsLength: number,
    pinnedState: ColumnPinningPosition,
  ) => Record<string, boolean>;
  slotComponent?: ElementType<SlotProps<TData>>;
}

export interface SlotProps<TData extends Record<string, unknown>> {
  row: Row<TData>;
  table: TableType<TData>;
}

export default function TableContent<
  TData extends Record<string, unknown>,
  TValue,
>(config: Props<TData, TValue>) {
  const {
    table,
    columns,
    noResultsTextKey,
    getPinnedItemClassDefinition,
    slotComponent,
  } = config;
  const { t } = useTranslation();
  return (
    <div>
      <Table>
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
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
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
                {t(noResultsTextKey || 'common.noResult')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function DefaultSlot<TData extends Record<string, unknown>>({
  row,
}: SlotProps<TData>) {
  return (
    <pre className="bg-muted rounded p-2 text-xs">
      {JSON.stringify(row.original, null, 2)}
    </pre>
  );
}

function RowChild<TData extends Record<string, unknown>>(config: {
  table: TableType<TData>;
  row: Row<TData>;
  slotComponent?: ElementType<SlotProps<TData>>;
  getPinnedItemClassDefinition: (
    index: number,
    itemsLength: number,
    pinnedState: ColumnPinningPosition,
  ) => Record<string, boolean>;
}) {
  const { row, table, getPinnedItemClassDefinition } = config;
  return (
    <>
      <TableRow
        key={row.id}
        className="px-4"
        aria-selected={row.getIsSelected()}
      >
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
        <TableRow aria-expanded key={row.id}>
          <TableCell colSpan={row.getAllCells().length}>
            {config.slotComponent ? (
              <config.slotComponent row={row} table={table} />
            ) : (
              <DefaultSlot row={row} table={table} />
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
