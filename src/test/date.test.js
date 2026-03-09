import { describe, it, expect } from 'vitest';
import { formatDate, getMonthDays, formatDisplayDate, generateId } from '../utils/date';

describe('date utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-03-15');
      expect(formatDate(date)).toBe('2024-03-15');
    });

    it('should pad single digit month and day', () => {
      const date = new Date('2024-01-05');
      expect(formatDate(date)).toBe('2024-01-05');
    });
  });

  describe('getMonthDays', () => {
    it('should return array with correct length for March 2024', () => {
      const days = getMonthDays(2024, 2); // March is 2 (0-indexed)
      // Array includes null padding at start + 31 days = 36 (March starts on Friday)
      expect(days.length).toBeGreaterThanOrEqual(31);
      expect(days.filter(d => d !== null).length).toBe(31);
    });

    it('should return correct days for February 2024 (leap year)', () => {
      const days = getMonthDays(2024, 1); // February
      expect(days.filter(d => d !== null).length).toBe(29);
    });

    it('should return correct days for February 2023 (non-leap year)', () => {
      const days = getMonthDays(2023, 1);
      expect(days.filter(d => d !== null).length).toBe(28);
    });

    it('should have null values for padding at start', () => {
      const days = getMonthDays(2024, 2);
      // March 2024 starts on Friday (index 5)
      expect(days[0]).toBeNull();
      expect(days[5]).not.toBeNull();
    });
  });

  describe('formatDisplayDate', () => {
    it('should format display date correctly', () => {
      const date = new Date('2024-03-15');
      expect(formatDisplayDate(date)).toBe('3月15日 星期五');
    });
  });

  describe('generateId', () => {
    it('should generate unique ids', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should generate string ids', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });
});
