import { useTranslation } from 'react-i18next';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useTablePagination } from '../helpers/TablePaginationProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Button } from '../../../components/ui/button';
import { PAGINATION_PAGE_SIZE_OPTIONS } from '@/lib/interfaces/pagination';

interface PaginationData {
  page: number;
  pageSize: number;
  pageCount: number;
  itemCount: number;
}

interface Props {
  currentPagination: PaginationData;
  canPreviousPage: boolean;
  canNextPage: boolean;
  ofTextKey: string;
  updatePageSize: (size: number) => void;
  goToPage: (page: number) => void;
}

export default function TablePagination({
  currentPagination,
  canNextPage,
  canPreviousPage,
  ofTextKey,
  updatePageSize,
  goToPage,
}: Props) {
  const { loading: isLoading } = useTablePagination();
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col items-center justify-between space-x-2 border-t-2 p-4 lg:flex-row">
      <div className="text-muted-foreground flex w-full items-center justify-between text-xs lg:w-[38%] lg:justify-normal lg:gap-x-1 lg:text-sm">
        {t('common.table.lines_per_page', {
          count: currentPagination.pageSize,
        })}
        <div className="w-[30%] lg:min-w-[10%]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <span className="relative p-2 flex items-center gap-3 right-2 mx-2 h-8 w-full">
                {currentPagination.pageSize}
                <ChevronDown className="ml-auto h-4 w-4" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className="w-(--reka-dropdown-menu-trigger-width)"
            >
              {PAGINATION_PAGE_SIZE_OPTIONS.map((size) => (
                <DropdownMenuItem
                  key={size}
                  className="flex justify-between"
                  onClick={() => updatePageSize(size)}
                >
                  {size}
                  {currentPagination.pageSize === size && (
                    <Check className="text-primary h-4 w-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {t('common.table.lines_to_all', { count: currentPagination.itemCount })}
      </div>

      <div className="flex w-full items-center justify-between lg:w-[60%]">
        <div className="text-muted-foreground flex gap-1 items-center lg:gap-2 my-3 text-xs lg:my-0 lg:text-sm">
          <span>{t('common.table.page')}</span>
          <span>{currentPagination.page}</span>
          <span>{t(ofTextKey || 'common.table.of')}</span>
          <span>{currentPagination.pageCount}</span>
        </div>
        <div className="mt-3 flex flex-wrap justify-center space-y-2 space-x-2 text-xs lg:mt-0 lg:text-lg">
          <Button
            variant="outline"
            size="sm"
            disabled={!canPreviousPage || isLoading}
            onClick={() => goToPage(1)}
          >
            <ChevronsLeft className="h-4 w-4 lg:mr-1" />
            <span className="hidden lg:inline">{t('common.first')}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            data-testid="pagination-previous-button"
            disabled={!canPreviousPage || isLoading}
            onClick={() => goToPage(currentPagination.page - 1)}
          >
            <ChevronLeft className="h-4 w-4 lg:mr-1" />
            <span className="hidden lg:inline">{t('common.previous')}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!canNextPage || isLoading}
            onClick={() => goToPage(currentPagination.page + 1)}
          >
            <span className="hidden lg:inline">{t('common.next')}</span>
            <ChevronRight className="h-4 w-4 lg:ml-1" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!canNextPage || isLoading}
            onClick={() => goToPage(currentPagination.pageCount)}
          >
            <span className="hidden lg:inline">{t('common.last')}</span>
            <ChevronsRight className="h-4 w-4 lg:ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
