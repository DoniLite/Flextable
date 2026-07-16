import { describe, expect, test } from 'bun:test';
import {
  applySorting,
  sortAlphabetically,
  sortAlphabeticallyByProp,
  sortByDateProp,
  sortByNumericProp,
} from './sorting';

describe('sortAlphabetically', () => {
  test('orders case-insensitively', () => {
    expect(sortAlphabetically('banana', 'Apple')).toBe(1);
    expect(sortAlphabetically('Apple', 'banana')).toBe(-1);
    expect(sortAlphabetically('apple', 'apple')).toBe(0);
  });
});

describe('sortAlphabeticallyByProp', () => {
  interface Item {
    name: string;
    pinned?: boolean;
  }

  test('sorts ascending by default and descending on request', () => {
    const items: Array<Item> = [{ name: 'banana' }, { name: 'apple' }];
    expect(
      [...items].sort(sortAlphabeticallyByProp({ prop: 'name' })).map((i) => i.name),
    ).toEqual(['apple', 'banana']);
    expect(
      [...items]
        .sort(sortAlphabeticallyByProp({ prop: 'name', order: 'desc' }))
        .map((i) => i.name),
    ).toEqual(['banana', 'apple']);
  });

  test('puts priority-flagged rows first regardless of alphabetical order', () => {
    const items: Array<Item> = [
      { name: 'zebra', pinned: false },
      { name: 'apple', pinned: true },
    ];
    expect(
      [...items]
        .sort(sortAlphabeticallyByProp({ prop: 'name', priorityProp: 'pinned' }))
        .map((i) => i.name),
    ).toEqual(['apple', 'zebra']);
  });

  test('returns 0 when compared values are not strings', () => {
    const items = [{ name: 1 as unknown as string }, { name: 2 as unknown as string }];
    expect(
      sortAlphabeticallyByProp<{ name: string }>({ prop: 'name' })(items[0]!, items[1]!),
    ).toBe(0);
  });
});

describe('sortByNumericProp', () => {
  interface Item {
    score: number;
    pinned?: boolean;
  }

  test('sorts ascending and descending', () => {
    const items: Array<Item> = [{ score: 3 }, { score: 1 }, { score: 2 }];
    expect(
      [...items].sort(sortByNumericProp({ prop: 'score' })).map((i) => i.score),
    ).toEqual([1, 2, 3]);
    expect(
      [...items]
        .sort(sortByNumericProp({ prop: 'score', order: 'desc' }))
        .map((i) => i.score),
    ).toEqual([3, 2, 1]);
  });

  test('respects priority prop before falling back to numeric compare', () => {
    const items: Array<Item> = [
      { score: 1, pinned: false },
      { score: 99, pinned: true },
    ];
    expect(
      [...items]
        .sort(sortByNumericProp({ prop: 'score', priorityProp: 'pinned' }))
        .map((i) => i.score),
    ).toEqual([99, 1]);
  });

  test('returns 0 for non-numeric values', () => {
    const a = { score: 'x' as unknown as number };
    const b = { score: 'y' as unknown as number };
    expect(sortByNumericProp<{ score: number }>({ prop: 'score' })(a, b)).toBe(0);
  });
});

describe('sortByDateProp', () => {
  interface Item {
    when: string;
    pinned?: boolean;
  }

  test('sorts descending by default (most recent first)', () => {
    const items: Array<Item> = [{ when: '2024-01-01' }, { when: '2024-06-01' }];
    expect([...items].sort(sortByDateProp({ prop: 'when' })).map((i) => i.when)).toEqual([
      '2024-06-01',
      '2024-01-01',
    ]);
  });

  test('sorts ascending when requested', () => {
    const items: Array<Item> = [{ when: '2024-06-01' }, { when: '2024-01-01' }];
    expect(
      [...items].sort(sortByDateProp({ prop: 'when', order: 'asc' })).map((i) => i.when),
    ).toEqual(['2024-01-01', '2024-06-01']);
  });

  test('priority prop short-circuits the date compare', () => {
    const items: Array<Item> = [
      { when: '2024-01-01', pinned: true },
      { when: '2024-06-01', pinned: false },
    ];
    expect(
      [...items]
        .sort(sortByDateProp({ prop: 'when', priorityProp: 'pinned' }))
        .map((i) => i.when),
    ).toEqual(['2024-01-01', '2024-06-01']);
  });

  test('returns 0 for non-comparable or invalid date values', () => {
    const fn = sortByDateProp<{ when: unknown }>({ prop: 'when' });
    expect(fn({ when: true }, { when: false })).toBe(0);
    expect(fn({ when: 'not-a-date' }, { when: '2024-01-01' })).toBe(0);
  });
});

describe('applySorting', () => {
  test('returns a copy unchanged when there is no sorting state', () => {
    const data = [{ id: 1 }, { id: 2 }];
    expect(applySorting(data, [])).toEqual(data);
  });

  test('infers numeric sorting from the sampled value', () => {
    const data = [
      { id: 1, age: 30 },
      { id: 2, age: 20 },
    ];
    expect(applySorting(data, [{ id: 'age', desc: false }]).map((r) => r.age)).toEqual([
      20, 30,
    ]);
  });

  test('infers date sorting from a parseable date string', () => {
    const data = [
      { id: 1, joined: '2024-06-01' },
      { id: 2, joined: '2024-01-01' },
    ];
    expect(
      applySorting(data, [{ id: 'joined', desc: false }]).map((r) => r.joined),
    ).toEqual(['2024-01-01', '2024-06-01']);
  });

  test('falls back to alphabetical sorting for plain strings', () => {
    const data = [
      { id: 1, name: 'banana' },
      { id: 2, name: 'apple' },
    ];
    expect(applySorting(data, [{ id: 'name', desc: false }]).map((r) => r.name)).toEqual([
      'apple',
      'banana',
    ]);
  });
});
