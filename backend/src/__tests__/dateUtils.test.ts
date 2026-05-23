import { describe, it, expect } from 'vitest';
import { parseDateStart, parseDateEnd, getDateRangeFromParams, buildDateFilter, toDateString } from '../utils/dateUtils.js';

describe('parseDateStart', () => {
  it('should parse YYYY-MM-DD to start of day', () => {
    const d = parseDateStart('2024-03-15');
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(15);
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
  });
});

describe('parseDateEnd', () => {
  it('should parse YYYY-MM-DD to end of day', () => {
    const d = parseDateEnd('2024-03-15');
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(15);
    expect(d.getHours()).toBe(23);
    expect(d.getMinutes()).toBe(59);
    expect(d.getSeconds()).toBe(59);
  });
});

describe('getDateRangeFromParams', () => {
  it('should return nulls when no dates provided', () => {
    const result = getDateRangeFromParams({});
    expect(result.startDate).toBeNull();
    expect(result.endDate).toBeNull();
  });

  it('should return parsed dates when provided', () => {
    const result = getDateRangeFromParams({ startDate: '2024-01-01', endDate: '2024-12-31' });
    expect(result.startDate).toBeInstanceOf(Date);
    expect(result.endDate).toBeInstanceOf(Date);
    expect(result.startDate!.getFullYear()).toBe(2024);
    expect(result.startDate!.getMonth()).toBe(0);
    expect(result.startDate!.getDate()).toBe(1);
    expect(result.endDate!.getFullYear()).toBe(2024);
    expect(result.endDate!.getMonth()).toBe(11);
    expect(result.endDate!.getDate()).toBe(31);
  });
});

describe('buildDateFilter', () => {
  const start = new Date('2024-01-01T00:00:00');
  const end = new Date('2024-12-31T23:59:59');

  it('should return empty object when no dates', () => {
    expect(buildDateFilter(null, null)).toEqual({});
  });

  it('should return gte when only startDate', () => {
    expect(buildDateFilter(start, null)).toEqual({ createdAt: { gte: start } });
  });

  it('should return lte when only endDate', () => {
    expect(buildDateFilter(null, end)).toEqual({ createdAt: { lte: end } });
  });

  it('should return gte and lte when both dates', () => {
    expect(buildDateFilter(start, end)).toEqual({ createdAt: { gte: start, lte: end } });
  });

  it('should use updatedAt when specified', () => {
    expect(buildDateFilter(start, null, 'updatedAt')).toEqual({ updatedAt: { gte: start } });
  });
});

describe('toDateString', () => {
  it('should format Date to YYYY-MM-DD', () => {
    const d = new Date(2024, 2, 15);
    expect(toDateString(d)).toBe('2024-03-15');
  });

  it('should zero-pad month and day', () => {
    const d = new Date(2024, 0, 5);
    expect(toDateString(d)).toBe('2024-01-05');
  });
});
