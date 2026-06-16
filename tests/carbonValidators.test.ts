import { describe, it, expect } from 'vitest';
import { carbonEstimateSchema, challengeRequestSchema } from '../server/validators/carbonValidators';

describe('Carbon Validators', () => {
  it('validates correct carbon estimate request', () => {
    const req = {
      activities: [
        { category: 'transport', subcategory: 'car', quantity: 15 }
      ]
    };
    const result = carbonEstimateSchema.safeParse(req);
    expect(result.success).toBe(true);
  });

  it('rejects invalid categories', () => {
    const req = {
      activities: [
        { category: 'invalid_cat', subcategory: 'car', quantity: 15 }
      ]
    };
    const result = carbonEstimateSchema.safeParse(req);
    expect(result.success).toBe(false);
  });

  it('rejects negative quantities', () => {
    const req = {
      activities: [
        { category: 'transport', subcategory: 'car', quantity: -5 }
      ]
    };
    const result = carbonEstimateSchema.safeParse(req);
    expect(result.success).toBe(false);
  });

  it('validates empty challenge request (optional fields)', () => {
    const req = {};
    const result = challengeRequestSchema.safeParse(req);
    expect(result.success).toBe(true);
  });
});
