import { describe, expect, test } from 'bun:test';
import { paginatedArray } from './pagination';

describe('paginatedArray', () => {
  const data = Array.from({ length: 25 }, (_, i) => i + 1);

  test('slices the requested page', () => {
    const result = paginatedArray(data, 1, 10);
    expect(result.items).toEqual(data.slice(0, 10));
    expect(result.itemCount).toBe(25);
    expect(result.pageCount).toBe(3);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  test('slices the last (partial) page', () => {
    const result = paginatedArray(data, 3, 10);
    expect(result.items).toEqual([21, 22, 23, 24, 25]);
  });

  test('returns an empty slice for an out-of-range page', () => {
    const result = paginatedArray(data, 10, 10);
    expect(result.items).toEqual([]);
  });
});
