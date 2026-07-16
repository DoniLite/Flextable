import { Button } from '@flextable/react-ui';
import type { Column, SortDirection } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

export function sortableHeader<T = unknown>(
  column: Column<T, unknown>,
  columnName: string,
  center = false,
) {
  const sortingDirection = column.getIsSorted();

  if (center) {
    return (
      <div className="flex items-center justify-center">
        <SortButton
          sortingDirection={sortingDirection}
          column={column}
          columnName={columnName}
        />
      </div>
    );
  }
  return (
    <SortButton
      sortingDirection={sortingDirection}
      column={column}
      columnName={columnName}
    />
  );
}

function SortButton<T>({
  sortingDirection,
  columnName,
  column,
}: {
  sortingDirection: SortDirection | false;
  columnName: string;
  column: Column<T, unknown>;
}) {
  const iconClass = 'ml-2 h-4 w-4';
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {columnName}
      {sortingDirection === 'asc' ? (
        <ArrowUp className={iconClass} />
      ) : sortingDirection === 'desc' ? (
        <ArrowDown className={iconClass} />
      ) : (
        <ArrowUpDown className={iconClass} />
      )}
    </Button>
  );
}
