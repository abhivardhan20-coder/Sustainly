import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatCO2e, formatPoints, formatPercentage, formatDate } from './formatters';

describe('Formatters', () => {
  beforeEach(() => {
    // Mock date to ensure consistent relative formatting
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 13, 12, 0, 0)); // June 13, 2026
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatCO2e', () => {
    it('formats grams correctly', () => {
      expect(formatCO2e(0.5)).toBe('500 g');
    });
    it('formats kilograms correctly', () => {
      expect(formatCO2e(2.5)).toBe('2.5 kg');
    });
    it('formats tonnes correctly', () => {
      expect(formatCO2e(1500)).toBe('1.5 tonnes');
    });
  });

  describe('formatPoints', () => {
    it('formats positive points', () => {
      expect(formatPoints(15)).toBe('+15 pts');
    });
    it('formats negative points', () => {
      expect(formatPoints(-5)).toBe('-5 pts');
    });
    it('formats zero points', () => {
      expect(formatPoints(0)).toBe('0 pts');
    });
  });

  describe('formatPercentage', () => {
    it('calculates correct percentage', () => {
      expect(formatPercentage(1, 4)).toBe('25.0%');
    });
    it('handles zero total safely', () => {
      expect(formatPercentage(5, 0)).toBe('0.0%');
    });
  });

  describe('formatDate', () => {
    it('formats short style', () => {
      expect(formatDate(new Date(), 'short')).toBe('Jun 13');
    });
    it('formats relative style (today)', () => {
      expect(formatDate(new Date(), 'relative')).toBe('Today');
    });
  });
});
