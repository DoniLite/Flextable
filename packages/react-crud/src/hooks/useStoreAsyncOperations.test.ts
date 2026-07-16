import { afterEach, describe, expect, test } from 'bun:test';
import type { ErrorCodeAdapter } from '@flextable/core';
import { act, cleanup, renderHook } from '@testing-library/react';
import { useStoreAsyncOperations } from './useStoreAsyncOperations';

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

type TestCode = 'NOT_FOUND' | 'SILENT' | 'UNKNOWN';

const errorAdapter: ErrorCodeAdapter<TestCode> = {
  resolve: (rawCode) =>
    rawCode === 'ENTITY_NOT_FOUND'
      ? 'NOT_FOUND'
      : rawCode === 'SILENT'
        ? 'SILENT'
        : 'UNKNOWN',
  messageKey: (code) => `errors.${code}.title`,
  descriptionKey: (code) => `errors.${code}.description`,
};

describe('useStoreAsyncOperations', () => {
  test('executeOperation tracks loading and returns the resolved value', async () => {
    const { result } = renderHook(() => useStoreAsyncOperations({ errorAdapter }));

    let value: string | undefined;
    await act(async () => {
      value = await result.current.executeOperation(() => Promise.resolve('ok'));
    });

    expect(value).toBe('ok');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('executeOperation captures a failed operation as an ApiError without throwing when throwOnError is false', async () => {
    const { result } = renderHook(() => useStoreAsyncOperations({ errorAdapter }));

    let value: string | undefined;
    await act(async () => {
      value = await result.current.executeOperation(
        () => Promise.reject(new Error('boom')),
        { throwOnError: false },
      );
    });

    expect(value).toBeUndefined();
    expect(result.current.error?.message).toBe('boom');
    expect(result.current.loading).toBe(false);
  });

  test('executeOperation rethrows by default', async () => {
    const { result } = renderHook(() => useStoreAsyncOperations({ errorAdapter }));

    let thrown: unknown;
    await act(async () => {
      try {
        await result.current.executeOperation(() => Promise.reject(new Error('boom')));
      } catch (err) {
        thrown = err;
      }
    });

    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).toBe('boom');
  });

  test('silentErrorCodes clear the error instead of surfacing it', async () => {
    const { result } = renderHook(() =>
      useStoreAsyncOperations({ errorAdapter, silentErrorCodes: ['SILENT'] }),
    );

    await act(async () => {
      await result.current.executeOperation(
        () => Promise.reject({ statusCode: 500, code: 'SILENT' }),
        { throwOnError: false },
      );
    });

    expect(result.current.error).toBeNull();
  });

  test('withAsyncOperation wraps a function with the same loading/error tracking', async () => {
    const { result } = renderHook(() => useStoreAsyncOperations({ errorAdapter }));
    const wrapped = result.current.withAsyncOperation((x: number) =>
      Promise.resolve(x * 2),
    );

    let value: number | undefined;
    await act(async () => {
      value = await wrapped(21);
    });

    expect(value).toBe(42);
  });

  test('fetchAllQuery merges filters and forces pageSize to -1', () => {
    const { result } = renderHook(() => useStoreAsyncOperations({ errorAdapter }));
    const merged = result.current.fetchAllQuery({
      page: 2,
      pageSize: 10,
      filters: { status: 'active' },
    });

    expect(merged).toEqual({ page: 2, pageSize: -1, status: 'active' });
    expect(merged.filters).toBeUndefined();
  });

  test('resetState clears loading and error', async () => {
    const { result } = renderHook(() => useStoreAsyncOperations({ errorAdapter }));

    await act(async () => {
      await result.current.executeOperation(() => Promise.reject(new Error('boom')), {
        throwOnError: false,
      });
    });
    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.resetState();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
