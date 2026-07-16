import { describe, expect, test } from 'bun:test';
import type { Row } from '@tanstack/table-core';
import type { DateStampedEntity } from './dateFiltering';
import { filterInternDate, sortInternDate } from './dateFiltering';

function makeRow<T>(original: T): Row<T> {
  return { original } as Row<T>;
}

describe('filterInternDate', () => {
  test('rejects when the filter value is not a start/end Date range', () => {
    const row = makeRow<DateStampedEntity>({ createdAt: '2024-05-01' });
    expect(filterInternDate(row, 'x', { start: 'not-a-date', end: 'not-a-date' })).toBe(
      false,
    );
  });

  test('matches when updatedAt falls within the range', () => {
    const row = makeRow<DateStampedEntity>({
      createdAt: '2023-01-01',
      updatedAt: '2024-05-15',
    });
    const result = filterInternDate(row, 'x', {
      start: new Date('2024-05-01'),
      end: new Date('2024-06-01'),
    });
    expect(result).toBe(true);
  });

  test('falls back to createdAt when updatedAt is outside/missing', () => {
    const row = makeRow<DateStampedEntity>({ createdAt: '2024-05-15' });
    const result = filterInternDate(row, 'x', {
      start: new Date('2024-05-01'),
      end: new Date('2024-06-01'),
    });
    expect(result).toBe(true);
  });

  test('returns false when neither date falls in range', () => {
    const row = makeRow<DateStampedEntity>({ createdAt: '2020-01-01' });
    const result = filterInternDate(row, 'x', {
      start: new Date('2024-05-01'),
      end: new Date('2024-06-01'),
    });
    expect(result).toBe(false);
  });
});

describe('sortInternDate', () => {
  test('compares by updatedAt when both rows have it', () => {
    const rowA = makeRow<DateStampedEntity>({ updatedAt: '2024-01-01' });
    const rowB = makeRow<DateStampedEntity>({ updatedAt: '2024-06-01' });
    expect(sortInternDate(rowA, rowB, 'x')).toBeLessThan(0);
  });

  test('falls back to createdAt when either updatedAt is missing', () => {
    const rowA = makeRow<DateStampedEntity>({ createdAt: '2024-01-01' });
    const rowB = makeRow<DateStampedEntity>({
      createdAt: '2024-06-01',
      updatedAt: '2024-07-01',
    });
    expect(sortInternDate(rowA, rowB, 'x')).toBeLessThan(0);
  });

  test('treats a row with neither date as "now" rather than throwing', () => {
    const rowA = makeRow<DateStampedEntity>({});
    const rowB = makeRow<DateStampedEntity>({ createdAt: '2000-01-01' });
    expect(() => sortInternDate(rowA, rowB, 'x')).not.toThrow();
    expect(sortInternDate(rowA, rowB, 'x')).toBeGreaterThan(0);
  });
});
