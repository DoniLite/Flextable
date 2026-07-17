<script setup lang="ts">
import type { FlexTableKeys, PaginationSnapshot, TranslateFn } from '@flextable/core';
import { PAGINATION_PAGE_SIZE_OPTIONS } from '@flextable/core';
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@flextable/vue-ui';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from '@lucide/vue';
import { computed, inject } from 'vue';
import { TABLE_LOADING_STATE_KEY } from '../composables/tableLoadingState';

interface Props {
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

const props = withDefaults(defineProps<Props>(), {
  pageSizeOptions: () => PAGINATION_PAGE_SIZE_OPTIONS as Array<number>,
});

const isLoading = inject(
  TABLE_LOADING_STATE_KEY,
  computed(() => false),
);

const wrapperClass = computed(() =>
  cn(
    'flex w-full flex-col items-center justify-between gap-2 border-t-2 p-4 @lg:flex-row',
    props.className,
  ),
);
</script>

<template>
  <div :class="wrapperClass">
    <div
      class="flex w-full items-center justify-between text-muted-foreground text-xs @lg:w-[38%] @lg:justify-normal @lg:gap-x-1 @lg:text-sm"
    >
      {{ t(keys.linesPerPage, { count: currentPagination.pageSize }) }}
      <div class="w-[30%] @lg:min-w-[10%]">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <span
              class="relative right-2 mx-2 flex h-8 w-full items-center gap-3 p-2"
              data-testid="pagination-page-size-button"
            >
              {{ currentPagination.pageSize }}
              <ChevronDown class="ml-auto h-4 w-4" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem
              v-for="size in pageSizeOptions"
              :key="size"
              class="flex justify-between"
              :data-testid="`pagination-size-${size}`"
              @select="updatePageSize(size)"
            >
              {{ size }}
              <Check v-if="currentPagination.pageSize === size" class="h-4 w-4 text-primary" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {{ t(keys.linesToAll, { count: currentPagination.itemCount }) }}
    </div>

    <div class="flex w-full items-center justify-between @lg:w-[60%]">
      <div
        class="my-3 flex items-center gap-1 text-muted-foreground text-xs @lg:my-0 @lg:gap-2 @lg:text-sm"
        data-testid="pagination-current-page"
      >
        <span>{{ t(keys.page) }}</span>
        <span>{{ currentPagination.page }}</span>
        <span>{{ t(keys.of) }}</span>
        <span>{{ currentPagination.pageCount }}</span>
      </div>
      <div class="mt-3 flex flex-wrap justify-center gap-2 text-xs @lg:mt-0 @3xl:text-lg">
        <Button
          variant="outline"
          size="sm"
          data-testid="pagination-first-button"
          :disabled="!canPreviousPage || isLoading"
          @click="goToPage(1)"
        >
          <ChevronsLeft class="h-4 w-4 @3xl:mr-1" />
          <span class="hidden @3xl:inline">{{ t(keys.first) }}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          data-testid="pagination-previous-button"
          :disabled="!canPreviousPage || isLoading"
          @click="goToPage(currentPagination.page - 1)"
        >
          <ChevronLeft class="h-4 w-4 @3xl:mr-1" />
          <span class="hidden @3xl:inline">{{ t(keys.previous) }}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          data-testid="pagination-next-button"
          :disabled="!canNextPage || isLoading"
          @click="goToPage(currentPagination.page + 1)"
        >
          <span class="hidden @3xl:inline">{{ t(keys.next) }}</span>
          <ChevronRight class="h-4 w-4 @3xl:ml-1" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          data-testid="pagination-last-button"
          :disabled="!canNextPage || isLoading"
          @click="goToPage(currentPagination.pageCount)"
        >
          <span class="hidden @3xl:inline">{{ t(keys.last) }}</span>
          <ChevronsRight class="h-4 w-4 @3xl:ml-1" />
        </Button>
      </div>
    </div>
  </div>
</template>
