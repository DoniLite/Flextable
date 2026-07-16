import type { FlexTableKeys, TranslateFn } from '@flextable/core';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@flextable/react-ui';
import type { Column, Table } from '@tanstack/react-table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export interface TableDropdownProps<TData> {
  table: Table<TData>;
  t: TranslateFn;
  keys: FlexTableKeys;
  onOpenChange?: (open: boolean) => void;
}

export function TableDropdown<TData>({
  table,
  t,
  keys,
  onOpenChange,
}: TableDropdownProps<TData>) {
  const [isOpen, setOpen] = useState(false);

  function getDropDownItemName(column: Column<TData, unknown>): string {
    const translated = t(`common.${column.id}`);
    return translated !== `common.${column.id}` ? translated : column.id;
  }

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(open) => {
        setOpen(open);
        onOpenChange?.(open);
      }}
    >
      <DropdownMenuTrigger asChild>
        <span className="ml-auto flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border p-2 hover:border-ring hover:bg-transparent @lg:w-auto">
          {t(keys.columns)}
          {isOpen ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-full @md:w-full">
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {getDropDownItemName(column)}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
