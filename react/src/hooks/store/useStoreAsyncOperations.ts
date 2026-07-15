import { useCallback, useState } from 'react';
import type { PaginationQuery } from '@/lib/interfaces/pagination';
import { ApiError, UNEXPECTED_ERROR_CODE } from '@/lib/interfaces/errors';

/**
 * Composable for handling async operations in stores
 * Provides consistent loading states, error handling, and operation execution
 */
export function useStoreAsyncOperations() {
  // Reactive state - these refs maintain reactivity when exposed through stores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  /**
   * Handle API errors consistently across all stores
   */
  const handleApiError = useCallback((err: unknown, throwError = true) => {
    // Convert unknown to ApiError and store it in state. Do not read `error` from
    // closure (which would make this callback change when `error` changes).
    console.error('original error', err);
    let toSet: ApiError;
    if (err instanceof ApiError) {
      toSet = err;
    } else {
      toSet = new ApiError({
        statusCode: 500,
        code: UNEXPECTED_ERROR_CODE.UNKNOWN_STORE_ERROR,
        message:
          err instanceof Error
            ? err.message
            : 'An unknown error occurred processing the request.',
      });
    }

    if (toSet.code === UNEXPECTED_ERROR_CODE.SESSION_EXPIRED_HANDLED) {
      setError(null);
    } else {
      setError(toSet);
    }

    // Rethrow the error object we were given (or the normalized ApiError) so
    // callers get the original error rather than stale state.
    if (throwError) {
      throw err instanceof ApiError ? err : toSet;
    }
  }, []);

  /**
   * Prepare for async operation - reset error and set loading
   */
  const prepare = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  /**
   * Reset all state
   */
  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  /**
   * Execute an async operation with consistent error handling and loading state management
   */
  const executeOperation = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options: { throwOnError?: boolean } = {},
    ): Promise<T | undefined> => {
      const { throwOnError = true } = options;
      prepare();
      try {
        const result = await operation();
        return result;
      } catch (err) {
        handleApiError(err, throwOnError);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [handleApiError, prepare],
  );

  /**
   * Decorator function for cleaner store action syntax
   * Wraps an operation with consistent loading state and error handling
   */
  const withAsyncOperation = useCallback(
    <TArgs extends Array<unknown>, TReturn>(
      operation: (...args: TArgs) => Promise<TReturn>,
      options: { throwOnError?: boolean } = { throwOnError: true },
    ) => {
      return (...args: TArgs) =>
        executeOperation(() => operation(...args), options);
    },
    [executeOperation],
  );

  const fetchAllQuery = useCallback((newQuery: PaginationQuery) => {
    const simpleQuery = {
      ...(newQuery.filters as unknown as Record<string, unknown>),
      ...newQuery,
      pageSize: -1,
    };
    if ('filters' in simpleQuery) {
      delete simpleQuery.filters;
    }
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
