/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <> */
import { useCallback, useEffect, useMemo } from 'react';
import type { ColumnFilter, SortingState } from '@tanstack/react-table';
import type { PaginationQuery } from '@/lib/interfaces/pagination';
import { SortOrder } from '@/lib/interfaces/pagination';
import { useTablePagination } from '@/helpers/TablePaginationProvider';

type FiltersType = Record<string, string | number | undefined>;

export interface TableCompatibleStore {
  loading: boolean;
  goToPage: (page: number) => Promise<void>;
  updatePageSize: (pageSize: number) => Promise<void>;
  updateFilters: (query: PaginationQuery) => Promise<void>;
  fetchData: () => Promise<void>;
  resetFilters: () => void;
}

export interface UseTableHandlersOptions {
  store: TableCompatibleStore;
  customFilters?: Record<string, (value: string) => FiltersType>;
  autoFetch?: boolean;
}

export function useTableServerFilters(options: UseTableHandlersOptions) {
  const { store, customFilters = {}, autoFetch = true } = options;
  const { setLoading } = useTablePagination();

  /**
   * 🔹 Mémorisation du loading pour éviter les ré-rendus inutiles
   * et synchronisation propre avec le contexte de pagination.
   */
  const loadingValue = useMemo(() => store.loading, [store.loading]);

  useEffect(() => {
    setLoading(loadingValue);
  }, [loadingValue]);

  /**
   * 🔹 Initialisation (fetch automatique à la création)
   */
  const initializeData = useCallback(async () => {
    store.resetFilters();
    if (autoFetch && typeof store.fetchData === 'function') {
      await store.fetchData();
    }
  }, [autoFetch, store]);

  /**
   * 🔹 Pagination
   */
  const handlePageUpdate = useCallback(
    async (page: number) => {
      await store.goToPage(page);
    },
    [store],
  );

  const handlePageSizeUpdate = useCallback(
    async (pageSize: number) => {
      await store.updatePageSize(pageSize);
    },
    [store],
  );

  /**
   * 🔹 Tri
   */
  const handleSortingUpdate = useCallback(
    async (sorting: SortingState) => {
      const sortParams: PaginationQuery = {};

      if (sorting.length > 0) {
        const sortItem = sorting[0];
        sortParams.sortBy = String(sortItem?.id);
        sortParams.sortOrder = sortItem?.desc ? SortOrder.DESC : SortOrder.ASC;
      } else {
        sortParams.sortBy = undefined;
        sortParams.sortOrder = undefined;
      }

      await store.updateFilters(sortParams);
    },
    [store],
  );

  /**
   * 🔹 Filtres
   */
  const handleFiltersUpdate = useCallback(
    async (filters: Array<ColumnFilter>) => {
      let filterParams: PaginationQuery = {};
      const filterObject: FiltersType = {};

      const assignFilterParams = (params: FiltersType) => {
        Object.entries(params).forEach(([key, value]) => {
          if (key === 'search') {
            filterParams[key] = value as string;
          } else if (value !== 'all') {
            filterObject[key] = value;
          } else {
            filterObject[key] = undefined;
          }
        });
      };

      const convertFilterValue = (value: unknown): string | number => {
        if (typeof value === 'string' || typeof value === 'number') {
          return value;
        }
        return String(value);
      };

      for (const filter of filters) {
        const { id: filterId, value: filterValue } = filter;
        if (filterValue === null || filterValue === undefined) continue;

        const customHandler = customFilters[filterId];
        if (customHandler) {
          try {
            const customParams = customHandler(String(filterValue));
            assignFilterParams(customParams);
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
    },
    [store, customFilters],
  );

  /**
   * 🔹 Initialisation au montage (SSR safe)
   */
  useEffect(() => {
    // Important: éviter le void sur SSR car il exécute quand même la promesse
    if (typeof window !== 'undefined') {
      initializeData().catch(() => {
        // silencieux pour éviter les erreurs côté SSR
      });
    }
  }, []);

  return useMemo(
    () => ({
      initializeData,
      handlePageUpdate,
      handlePageSizeUpdate,
      handleSortingUpdate,
      handleFiltersUpdate,
    }),
    [
      initializeData,
      handlePageUpdate,
      handlePageSizeUpdate,
      handleSortingUpdate,
      handleFiltersUpdate,
    ],
  );
}

/**
 * 🔹 Hook par défaut pour tables avec un simple champ `search`
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function useDefaultTableHandlers<S extends TableCompatibleStore>(
  store: S,
) {
  return useTableServerFilters({
    store,
    customFilters: useMemo(
      () => ({
        search: (value: string) => ({ search: value }),
      }),
      [],
    ),
  });
}
