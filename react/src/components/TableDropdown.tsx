import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Column, Table } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props<TData extends Record<string, unknown>> {
  table: Table<TData>;
  open?: (value: boolean) => void;
}

export default function TableDropdown<TData extends Record<string, unknown>>({
  table,
  open,
}: Props<TData>) {
  const [isOpen, setOpen] = useState(false);
  const { t } = useTranslation();

  function getDropDownItemName(column: Column<TData, unknown>): string {
    if (t(`common.${column.id}`) !== `common.${column.id}`) {
      return t(`common.${column.id}`);
    }
    return column.id;
  }

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(v) => {
        setOpen(v);
        if (open) {
          open(v);
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <span className="flex gap-2 items-center ml-auto border cursor-pointer p-2 rounded-md w-full justify-between lg:w-auto hover:border-ring focus:border:ring hover:bg-transparent">
          {t('common.columns')}
          {isOpen ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="w-[var(--reka-dropdown-menu-trigger-width)] md:w-full"
      >
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
