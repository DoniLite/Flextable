import { Button } from '@flextable/vue-ui';
import { ArrowDown, ArrowUp, ArrowUpDown } from '@lucide/vue';
import type { Column, SortDirection } from '@tanstack/vue-table';
import type { VNode } from 'vue';
import { h } from 'vue';

function sortIcon(direction: SortDirection | false): VNode {
  const iconClass = 'ml-2 h-4 w-4';
  if (direction === 'asc') return h(ArrowUp, { class: iconClass });
  if (direction === 'desc') return h(ArrowDown, { class: iconClass });
  return h(ArrowUpDown, { class: iconClass });
}

function sortButton<T>(column: Column<T, unknown>, columnName: string): VNode {
  const direction = column.getIsSorted();
  return h(
    Button,
    {
      variant: 'ghost',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    },
    () => [columnName, sortIcon(direction)],
  );
}

export function sortableHeader<T = unknown>(
  column: Column<T, unknown>,
  columnName: string,
  center = false,
): VNode {
  const button = sortButton(column, columnName);
  if (center) {
    return h('div', { class: 'flex items-center justify-center' }, [button]);
  }
  return button;
}
