import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { Column, SortDirection } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';

export default function SortableHeader<T = unknown>(
  column: Column<T, unknown>,
  columnName: string,
  center = false,
) {
  const sortingDirection = column.getIsSorted();

  if (center) {
    return (
      <div className="flex justify-center items-center">
        <Btn
          sortingDirection={sortingDirection}
          column={column}
          columnName={columnName}
        />
      </div>
    );
  }
  return (
    <Btn
      sortingDirection={sortingDirection}
      column={column}
      columnName={columnName}
    />
  );
}

function Btn<T>({
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
