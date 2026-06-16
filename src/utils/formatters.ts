/**
 * Centralized Formatting Utilities
 *
 * Pure functions for consistent display of CO₂e values, points, dates,
 * and percentages across the Sustainly UI.
 *
 * @module formatters
 */

import {
  format,
  isToday,
  isYesterday,
  differenceInDays,
  parseISO,
} from 'date-fns';

// ---------------------------------------------------------------------------
// CO₂e
// ---------------------------------------------------------------------------

/**
 * Format a CO₂e value (given in **kg**) with the most readable unit.
 *
 * | Range          | Output example |
 * |----------------|----------------|
 * | < 1 kg         | `"500 g"`      |
 * | 1 – 999.9 kg   | `"2.3 kg"`     |
 * | ≥ 1 000 kg     | `"1.2 tonnes"` |
 *
 * @param kg - CO₂e mass in kilograms (may be negative for offsets)
 */
export function formatCO2e(kg: number): string {
  const abs = Math.abs(kg);
  const sign = kg < 0 ? '-' : '';

  if (abs < 1) {
    const grams = Math.round(abs * 1000);
    return `${sign}${grams} g`;
  }

  if (abs < 1000) {
    // Show 1 decimal unless it's a whole number
    const formatted = abs % 1 === 0 ? abs.toString() : abs.toFixed(1);
    return `${sign}${formatted} kg`;
  }

  const tonnes = abs / 1000;
  const formatted = tonnes % 1 === 0 ? tonnes.toString() : tonnes.toFixed(1);
  return `${sign}${formatted} tonnes`;
}

// ---------------------------------------------------------------------------
// Points
// ---------------------------------------------------------------------------

/**
 * Format a point value with an explicit sign prefix.
 *
 * - Positive → `"+15 pts"`
 * - Zero     → `"0 pts"`
 * - Negative → `"-5 pts"`
 *
 * @param pts - Integer point value
 */
export function formatPoints(pts: number): string {
  if (pts > 0) return `+${pts} pts`;
  if (pts < 0) return `${pts} pts`;
  return '0 pts';
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

/**
 * Format a date string or `Date` object in one of three styles.
 *
 * | Style        | Example output          |
 * |--------------|-------------------------|
 * | `"short"`    | `"Jun 13"`              |
 * | `"long"`     | `"June 13, 2026"`       |
 * | `"relative"` | `"Today"` / `"3 days ago"` |
 *
 * @param date  - ISO-8601 string or Date instance
 * @param style - Display style (default: `"short"`)
 */
export function formatDate(
  date: string | Date,
  style: 'short' | 'long' | 'relative' = 'short',
): string {
  const d = typeof date === 'string' ? parseISO(date) : date;

  switch (style) {
    case 'short':
      return format(d, 'MMM d');

    case 'long':
      return format(d, 'MMMM d, yyyy');

    case 'relative': {
      if (isToday(d)) return 'Today';
      if (isYesterday(d)) return 'Yesterday';

      const days = differenceInDays(new Date(), d);

      if (days > 0 && days <= 30) return `${days} day${days === 1 ? '' : 's'} ago`;
      if (days < 0) {
        const absDays = Math.abs(days);
        return `in ${absDays} day${absDays === 1 ? '' : 's'}`;
      }

      // Fallback for dates > 30 days ago
      return format(d, 'MMM d, yyyy');
    }

    default:
      return format(d, 'MMM d');
  }
}

// ---------------------------------------------------------------------------
// Percentages
// ---------------------------------------------------------------------------

/**
 * Format a ratio as a percentage string with one decimal place.
 *
 * Returns `"0.0%"` when `total` is zero to avoid division-by-zero.
 *
 * @param value - Numerator
 * @param total - Denominator
 */
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0.0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}
