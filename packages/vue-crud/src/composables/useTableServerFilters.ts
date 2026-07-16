import type { PaginationQuery } from '@flextable/core';
import { SortOrder } from '@flextable/core';
import { TABLE_LOADING_STATE_KEY } from '@flextable/vue';
import type { ColumnFilter, SortingState } from '@tanstack/vue-table';
import { computed, onMounted, provide } from 'vue';

type FiltersType = Record<string, string | number | undefined>;

export interface TableCompatibleStore {
  loading: boolean;
  goToPage: (page: number) => Promise<void>;
  updatePageSize: (pageSize: number) => Promise<void>;
  updateFilters: (query: PaginationQuery) => Promise<void>;
  fetchData: () => Promise<void>;
  resetFilters: () => void;
}

export interface UseTableServerFiltersOptions {
  store: TableCompatibleStore;
  customFilters?: Record<string, (value: string) => FiltersType>;
  autoFetch?: boolean;
}

/**
 * Bridges a Pinia/store-shaped `TableCompatibleStore` to FlexTable's
 * sorting/filtering/pagination events. Generalized from the original app's
 * composable: no more Nuxt auto-imports, and the loading state is provided
 * through `@flextable/vue`'s typed `TABLE_LOADING_STATE_KEY` instead of a
 * magic string key.
 */
export function useTableServerFilters(options: UseTableServerFiltersOptions) {
  const { store, customFilters = {}, autoFetch = true } = options;

  provide(
    TABLE_LOADING_STATE_KEY,
    computed(() => store.loading),
  );

  async function initializeData() {
    store.resetFilters();
    if (autoFetch) {
      await store.fetchData();
    }
  }

  async function handlePageUpdate(page: number) {
    await store.goToPage(page);
  }

  async function handlePageSizeUpdate(pageSize: number) {
    await store.updatePageSize(pageSize);
  }

  async function handleSortingUpdate(sorting: SortingState) {
    const sortParams: PaginationQuery = {};
    const sortItem = sorting[0];
    if (sortItem) {
      sortParams.sortBy = String(sortItem.id);
      sortParams.sortOrder = sortItem.desc ? SortOrder.DESC : SortOrder.ASC;
    } else {
      sortParams.sortBy = undefined;
      sortParams.sortOrder = undefined;
    }
    await store.updateFilters(sortParams);
  }

  async function handleFiltersUpdate(filters: Array<ColumnFilter>) {
    let filterParams: PaginationQuery = {};
    const filterObject: FiltersType = {};

    const assignFilterParams = (params: FiltersType) => {
      for (const [key, value] of Object.entries(params)) {
        if (key === 'search') {
          filterParams[key] = value as string;
        } else if (value !== 'all') {
          filterObject[key] = value;
        } else {
          filterObject[key] = undefined;
        }
      }
    };

    const convertFilterValue = (value: unknown): string | number =>
      typeof value === 'string' || typeof value === 'number' ? value : String(value);

    for (const filter of filters) {
      const { id: filterId, value: filterValue } = filter;
      if (filterValue === null || filterValue === undefined) continue;

      const customHandler = customFilters[filterId];
      if (customHandler) {
        try {
          assignFilterParams(customHandler(String(filterValue)));
        } catch {
          assignFilterParams({ [filterId]: convertFilterValue(filterValue) });
        }
      } else {
        assignFilterParams({ [filterId]: convertFilterValue(filterValue) });
      }
    }

    if (Object.keys(filterObject).length > 0) {
      filterParams = { ...filterParams, ...filterObject };
    }

    await store.updateFilters(filterParams);
  }

  onMounted(() => {
    initializeData();
  });

  return {
    initializeData,
    handlePageUpdate,
    handlePageSizeUpdate,
    handleSortingUpdate,
    handleFiltersUpdate,
  };
}

/** Convenience preset for tables with a simple `search` filter only. */
export function useDefaultTableHandlers(store: TableCompatibleStore) {
  return useTableServerFilters({
    store,
    customFilters: { search: (value) => ({ search: value }) },
  });
}
