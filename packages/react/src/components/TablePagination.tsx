import type { FlexTableKeys, PaginationSnapshot, TranslateFn } from '@flextable/core';
import { PAGINATION_PAGE_SIZE_OPTIONS } from '@flextable/core';
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@flextable/react-ui';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useTablePagination } from '../helpers/TablePaginationProvider';

export interface TablePaginationProps {
  t: TranslateFn;
  currentPagination: PaginationSnapshot;
  canPreviousPage: boolean;
  canNextPage: boolean;
  keys: FlexTableKeys;
  className?: string;
  updatePageSize: (size: number) => void;
  goToPage: (page: number) => void;
  pageSizeOptions?: ReadonlyArray<number>;
}

export function TablePagination({
  t,
  currentPagination,
  canNextPage,
  canPreviousPage,
  keys,
  className,
  updatePageSize,
  goToPage,
  pageSizeOptions = PAGINATION_PAGE_SIZE_OPTIONS,
}: TablePaginationProps) {
  const { loading: isLoading } = useTablePagination();

  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-between gap-2 border-t-2 p-4 @lg:flex-row',
        className,
      )}
    >
      <div className="flex w-full items-center justify-between text-muted-foreground text-xs @lg:w-[38%] @lg:justify-normal @lg:gap-x-1 @lg:text-sm">
        {t(keys.linesPerPage, { count: currentPagination.pageSize })}
        <div className="w-[30%] @lg:min-w-[10%]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <span className="relative right-2 mx-2 flex h-8 w-full items-center gap-3 p-2">
                {currentPagination.pageSize}
                <ChevronDown className="ml-auto h-4 w-4" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {pageSizeOptions.map((size) => (
                <DropdownMenuItem
                  key={size}
                  className="flex justify-between"
                  onClick={() => updatePageSize(size)}
                >
                  {size}
                  {currentPagination.pageSize === size && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {t(keys.linesToAll, { count: currentPagination.itemCount })}
      </div>

      <div className="flex w-full items-center justify-between @lg:w-[60%]">
        <div className="my-3 flex items-center gap-1 text-muted-foreground text-xs @lg:my-0 @lg:gap-2 @lg:text-sm">
          <span>{t(keys.page)}</span>
          <span>{currentPagination.page}</span>
          <span>{t(keys.of)}</span>
          <span>{currentPagination.pageCount}</span>
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs @lg:mt-0 @3xl:text-lg">
          <Button
            variant="outline"
            size="sm"
            disabled={!canPreviousPage || isLoading}
            onClick={() => goToPage(1)}
          >
            <ChevronsLeft className="h-4 w-4 @3xl:mr-1" />
            <span className="hidden @3xl:inline">{t(keys.first)}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            data-testid="pagination-previous-button"
            disabled={!canPreviousPage || isLoading}
            onClick={() => goToPage(currentPagination.page - 1)}
          >
            <ChevronLeft className="h-4 w-4 @3xl:mr-1" />
            <span className="hidden @3xl:inline">{t(keys.previous)}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!canNextPage || isLoading}
            onClick={() => goToPage(currentPagination.page + 1)}
          >
            <span className="hidden @3xl:inline">{t(keys.next)}</span>
            <ChevronRight className="h-4 w-4 @3xl:ml-1" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!canNextPage || isLoading}
            onClick={() => goToPage(currentPagination.pageCount)}
          >
            <span className="hidden @3xl:inline">{t(keys.last)}</span>
            <ChevronsRight className="h-4 w-4 @3xl:ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
