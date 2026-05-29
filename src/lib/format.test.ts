import { describe, it, expect } from 'vitest';
import { formatDate, sortByDateDesc, readingTime } from './format';

describe('formatDate', () => {
  it('formats an ISO date as "Mon D, YYYY"', () => {
    expect(formatDate(new Date('2026-05-29T00:00:00Z'))).toBe('May 29, 2026');
  });
});

describe('sortByDateDesc', () => {
  it('sorts newest first by the given key', () => {
    const items = [
      { d: new Date('2024-01-01') },
      { d: new Date('2026-01-01') },
      { d: new Date('2025-01-01') },
    ];
    const sorted = sortByDateDesc(items, (x) => x.d);
    expect(sorted.map((x) => x.d.getFullYear())).toEqual([2026, 2025, 2024]);
  });
});

describe('readingTime', () => {
  it('estimates minutes at ~200 wpm, min 1', () => {
    expect(readingTime('word '.repeat(400))).toBe('2 min read');
    expect(readingTime('short')).toBe('1 min read');
  });
});
