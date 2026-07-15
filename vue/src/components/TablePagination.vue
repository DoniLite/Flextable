<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-vue-next'
import { PAGINATION_PAGE_SIZE_OPTIONS } from '~/lib/interfaces/pagination'

interface PaginationData {
  page: number
  pageSize: number
  pageCount: number
  itemCount: number
}

interface Props {
  currentPagination: PaginationData
  canPreviousPage: boolean
  canNextPage: boolean
  ofTextKey: string
  updatePageSize: (size: number) => void
  goToPage: (page: number) => void
  pageSizeOptions?: number[]
  perPageText?: string
  totalText?: string
}

withDefaults(defineProps<Props>(), {
  pageSizeOptions: () => PAGINATION_PAGE_SIZE_OPTIONS,
  perPageText: 'common.table.lines_per_page',
  totalText: 'common.table.lines_to_all'
})

const { t } = useI18n()

const isLoading = inject<ComputedRef<boolean>>(
  'TABLE_LOADING_STATE',
  computed(() => false)
)
</script>

<template>
  <div
    class="flex w-full flex-col items-center justify-between space-x-2 border-t-2 p-4 lg:flex-row"
  >
    <div
      class="text-muted-foreground flex w-full items-center justify-between text-xs lg:w-[38%] lg:justify-normal lg:gap-x-1 lg:text-sm"
    >
      {{ t(perPageText || 'common.table.lines_per_page', { count: currentPagination.pageSize }) }}
      <div class="w-[30%] lg:w-auto">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="outline"
              class="relative right-2 mx-2 h-8 w-full"
              data-testid="pagination-page-size-button"
            >
              {{ currentPagination.pageSize }}
              <ChevronDown class="ml-auto h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            class="w-[var(--reka-dropdown-menu-trigger-width)]"
          >
            <DropdownMenuItem
              v-for="size in pageSizeOptions"
              :key="size"
              class="flex justify-between"
              :data-testid="`pagination-size-${size}`"
              @click="updatePageSize(size)"
            >
              {{ size }}
              <Check
                v-if="currentPagination.pageSize === size"
                class="text-primary h-4 w-4"
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {{ t(totalText || 'common.table.lines_to_all', { count: currentPagination.itemCount }) }}
    </div>
    <div class="flex w-full items-center justify-between lg:w-[60%]">
      <div
        class="text-muted-foreground my-3 text-xs lg:my-0 lg:text-sm"
        data-testid="pagination-current-page"
      >
        {{ t('common.table.page') }}
        {{ currentPagination.page }}
        {{ t(ofTextKey || 'common.table.of') }}
        {{ currentPagination.pageCount }}
      </div>
      <div
        class="mt-3 flex flex-wrap justify-center space-y-2 space-x-2 text-xs lg:mt-0 lg:text-lg"
      >
        <Button
          variant="outline"
          size="sm"
          data-testid="pagination-first-button"
          :disabled="!canPreviousPage || isLoading"
          @click="goToPage(1)"
        >
          <ChevronsLeft class="h-4 w-4 lg:mr-1" />
          <span class="hidden lg:inline">
            {{ t('common.first') }}
          </span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          data-testid="pagination-previous-button"
          :disabled="!canPreviousPage || isLoading"
          @click="goToPage(currentPagination.page - 1)"
        >
          <ChevronLeft class="h-4 w-4 lg:mr-1" />
          <span class="hidden lg:inline">
            {{ t('common.previous') }}
          </span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          data-testid="pagination-next-button"
          :disabled="!canNextPage || isLoading"
          @click="goToPage(currentPagination.page + 1)"
        >
          <span class="hidden lg:inline">
            {{ t('common.next') }}
          </span>
          <ChevronRight class="h-4 w-4 lg:ml-1" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          data-testid="pagination-last-button"
          :disabled="!canNextPage || isLoading"
          @click="goToPage(currentPagination.pageCount)"
        >
          <span class="hidden lg:inline">
            {{ t('common.last') }}
          </span>
          <ChevronsRight class="h-4 w-4 lg:ml-1" />
        </Button>
      </div>
    </div>
  </div>
</template>
