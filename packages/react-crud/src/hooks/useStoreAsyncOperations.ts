import type { ErrorCodeAdapter, PaginationQuery } from '@flextable/core';
import { ApiError } from '@flextable/core';
import { useCallback, useState } from 'react';

export interface UseStoreAsyncOperationsOptions<TCode extends string> {
  errorAdapter: ErrorCodeAdapter<TCode>;
  /** Codes that should clear the error state silently instead of surfacing it (e.g. an already-handled session expiry). */
  silentErrorCodes?: Array<TCode>;
}

/**
 * Composable for handling async operations in stores — consistent loading
 * states, error normalization via an injected `ErrorCodeAdapter`, and
 * operation execution. Generalized from the original app's hook, which
 * hardcoded a NestJS-shaped `ApiError`/error-code enum directly.
 */
export function useStoreAsyncOperations<TCode extends string>(
  options: UseStoreAsyncOperationsOptions<TCode>,
) {
  const { errorAdapter, silentErrorCodes = [] } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError<TCode> | null>(null);

  const handleApiError = useCallback(
    (err: unknown, throwError = true) => {
      const normalized = ApiError.from(err, errorAdapter);

      if (silentErrorCodes.includes(normalized.code)) {
        setError(null);
      } else {
        setError(normalized);
      }

      if (throwError) {
        throw err instanceof ApiError ? err : normalized;
      }
    },
    [errorAdapter, silentErrorCodes],
  );

  const prepare = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  const executeOperation = useCallback(
    async <T>(
      operation: () => Promise<T>,
      opts: { throwOnError?: boolean } = {},
    ): Promise<T | undefined> => {
      const { throwOnError = true } = opts;
      prepare();
      try {
        return await operation();
      } catch (err) {
        handleApiError(err, throwOnError);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [handleApiError, prepare],
  );

  const withAsyncOperation = useCallback(
    <TArgs extends Array<unknown>, TReturn>(
      operation: (...args: TArgs) => Promise<TReturn>,
      opts: { throwOnError?: boolean } = { throwOnError: true },
    ) => {
      return (...args: TArgs) => executeOperation(() => operation(...args), opts);
    },
    [executeOperation],
  );

  const fetchAllQuery = useCallback((newQuery: PaginationQuery) => {
    const simpleQuery: Record<string, unknown> = {
      ...(newQuery.filters as unknown as Record<string, unknown>),
      ...newQuery,
      pageSize: -1,
    };
    delete simpleQuery.filters;
    return simpleQuery;
  }, []);

  return {
    loading,
    error,
    executeOperation,
    withAsyncOperation,
    resetState,
    fetchAllQuery,
    prepare,
    handleApiError,
  };
}
