import type { FlexTableKeys, TranslateFn } from '@flextable/core';
import { cn, Input } from '@flextable/react-ui';
import { Search, X } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import { useTablePagination } from '../helpers/TablePaginationProvider';
import { useDebounceFn } from '../hooks/useDebounceFn';

export interface TableSearchWithButtonProps {
  t: TranslateFn;
  keys: FlexTableKeys;
  className?: string;
  update?: (value: string) => void;
}

export function TableSearchWithButton({
  t,
  keys,
  className,
  update,
}: TableSearchWithButtonProps) {
  const [searchValue, setSearchValue] = useState('');
  const { loading: isLoading } = useTablePagination();
  const canSearch = useMemo(() => searchValue.length > 0, [searchValue]);

  function handleSearch() {
    if (isLoading) return;
    update?.(searchValue);
  }

  function onClear() {
    setSearchValue('');
  }

  const debouncedSetFilter = useDebounceFn((value: string) => {
    if (!value) handleSearch();
  }, 200);

  // biome-ignore lint/correctness/useExhaustiveDependencies: debouncedSetFilter is recreated every render but only searchValue should retrigger this effect
  useEffect(() => {
    debouncedSetFilter(searchValue);
  }, [searchValue]);

  return (
    <div className={cn('relative w-full items-center rounded-lg border', className)}>
      <div className="relative flex-1">
        <Input
          id={useId()}
          value={searchValue}
          onChange={(e) => setSearchValue(e.currentTarget.value)}
          type="text"
          placeholder={t(keys.search)}
          className="w-full pr-15 pl-10 @md:pr-20"
          onKeyUp={() => searchValue && handleSearch()}
        />
        <span className="absolute inset-y-0 start-0 flex items-center justify-center px-2">
          {!canSearch ? (
            <Search className="h-4 w-4 text-muted-foreground" />
          ) : (
            <button type="button" className="focus:outline-none" onClick={onClear}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </span>
      </div>
    </div>
  );
}
