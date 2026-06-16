import { describe, it, expect } from 'vitest';
import { estimateCO2e, estimateBatch, generateChallenges } from '../server/services/carbonEstimator';

describe('Carbon Estimator Service', () => {
  it('estimates single activity correctly', () => {
    const result = estimateCO2e({ category: 'transport', subcategory: 'car', quantity: 10 });
    expect(result.co2eKg).toBe(2.1);
    expect(result.confidence).toBe('high');
  });

  it('handles unknown categories', () => {
    const result = estimateCO2e({ category: 'unknown', subcategory: 'car', quantity: 10 });
    expect(result.co2eKg).toBe(0);
    expect(result.confidence).toBe('low');
  });

  it('handles unknown subcategories', () => {
    const result = estimateCO2e({ category: 'transport', subcategory: 'spaceship', quantity: 10 });
    expect(result.co2eKg).toBe(0);
    expect(result.confidence).toBe('low');
  });

  it('estimates batch activities correctly', () => {
    const { results, totalCo2eKg } = estimateBatch([
      { category: 'transport', subcategory: 'car', quantity: 10 },
      { category: 'food', subcategory: 'meat_meal', quantity: 1 }
    ]);
    expect(results.length).toBe(2);
    expect(totalCo2eKg).toBe(5.4); // 2.1 + 3.3
  });

  it('generates challenges based on weakest category', () => {
    const challenges = generateChallenges({ transport: 10, food: 50, home: 5 });
    expect(challenges.length).toBeGreaterThan(0);
    expect(challenges[0].category).toBe('food');
  });
});
