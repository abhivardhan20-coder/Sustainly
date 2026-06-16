import { logger } from '../utils/logger';

/** IPCC 2021 emission factors (kg CO₂e per unit) */
const EMISSION_FACTORS: Record<string, Record<string, { co2ePerUnit: number; unit: string }>> = {
  transport: {
    car: { co2ePerUnit: 0.21, unit: 'km' },
    bus: { co2ePerUnit: 0.089, unit: 'km' },
    train: { co2ePerUnit: 0.041, unit: 'km' },
    bike: { co2ePerUnit: 0, unit: 'km' },
    walk: { co2ePerUnit: 0, unit: 'km' },
    flight_short: { co2ePerUnit: 0.255, unit: 'km' },
    flight_long: { co2ePerUnit: 0.195, unit: 'km' },
  },
  food: {
    meat_meal: { co2ePerUnit: 3.3, unit: 'meal' },
    fish_meal: { co2ePerUnit: 1.34, unit: 'meal' },
    vegetarian_meal: { co2ePerUnit: 0.5, unit: 'meal' },
    vegan_meal: { co2ePerUnit: 0.3, unit: 'meal' },
  },
  home: {
    electricity_kwh: { co2ePerUnit: 0.233, unit: 'kWh' },
    natural_gas_kwh: { co2ePerUnit: 0.184, unit: 'kWh' },
    ac_hour: { co2ePerUnit: 0.95, unit: 'hour' },
  },
  goods: {
    fast_fashion: { co2ePerUnit: 10, unit: 'item' },
    secondhand: { co2ePerUnit: 0.5, unit: 'item' },
  },
};

export interface EstimateInput {
  category: string;
  subcategory: string;
  quantity: number;
}

export interface EstimateResult {
  co2eKg: number;
  category: string;
  subcategory: string;
  confidence: 'high' | 'medium' | 'low';
  description: string;
}

/**
 * Estimate CO₂e emissions for a single activity.
 * Uses IPCC 2021 emission factors as a rule-based fallback.
 */
export function estimateCO2e(input: EstimateInput): EstimateResult {
  const { category, subcategory, quantity } = input;
  
  const categoryFactors = EMISSION_FACTORS[category];
  if (!categoryFactors) {
    logger.warn(`[CarbonEstimator] Unknown category: ${category}`);
    return {
      co2eKg: 0,
      category,
      subcategory,
      confidence: 'low',
      description: `Unknown category: ${category}`,
    };
  }

  const factor = categoryFactors[subcategory];
  if (!factor) {
    logger.warn(`[CarbonEstimator] Unknown subcategory: ${category}/${subcategory}`);
    return {
      co2eKg: 0,
      category,
      subcategory,
      confidence: 'low',
      description: `Unknown subcategory: ${subcategory}`,
    };
  }

  const co2eKg = Math.round(factor.co2ePerUnit * quantity * 1000) / 1000;

  return {
    co2eKg,
    category,
    subcategory,
    confidence: 'high',
    description: `${quantity} ${factor.unit} of ${subcategory.replace(/_/g, ' ')} = ${co2eKg} kg CO₂e`,
  };
}

/**
 * Estimate CO₂e for multiple activities.
 */
export function estimateBatch(inputs: EstimateInput[]): { results: EstimateResult[]; totalCo2eKg: number } {
  const results = inputs.map(estimateCO2e);
  const totalCo2eKg = Math.round(results.reduce((sum, r) => sum + r.co2eKg, 0) * 1000) / 1000;
  return { results, totalCo2eKg };
}

/**
 * Generate adaptive weekly challenges based on the user's weakest category.
 */
export function generateChallenges(categoryBreakdown: Record<string, number>): Array<{
  id: string;
  title: string;
  description: string;
  category: string;
  targetCount: number;
}> {
  // Find weakest category (highest emissions)
  const sorted = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]);
  const weakest = sorted[0]?.[0] || 'transport';

  const challengeTemplates: Record<string, Array<{ title: string; description: string; targetCount: number }>> = {
    transport: [
      { title: 'Car-Free Days', description: 'Use public transit, bike, or walk instead of driving', targetCount: 3 },
      { title: 'Active Commute', description: 'Walk or bike for at least one commute trip', targetCount: 5 },
      { title: 'Carpool Champion', description: 'Share rides with colleagues or neighbors', targetCount: 2 },
    ],
    food: [
      { title: 'Meatless Meals', description: 'Replace meat with plant-based options', targetCount: 5 },
      { title: 'Local Eater', description: 'Choose locally-sourced food for meals', targetCount: 4 },
      { title: 'Zero Food Waste', description: 'Plan meals to avoid throwing away food', targetCount: 7 },
    ],
    home: [
      { title: 'Energy Saver', description: 'Reduce AC/heating usage by 1 hour daily', targetCount: 5 },
      { title: 'Lights Out', description: 'Turn off lights in empty rooms consistently', targetCount: 7 },
      { title: 'Unplug Challenge', description: 'Unplug devices when not in use', targetCount: 5 },
    ],
    goods: [
      { title: 'No New Stuff', description: 'Avoid buying new non-essential items', targetCount: 7 },
      { title: 'Secondhand First', description: 'Choose used/thrift items over new', targetCount: 2 },
      { title: 'Repair Don\'t Replace', description: 'Fix something instead of buying new', targetCount: 1 },
    ],
  };

  const templates = challengeTemplates[weakest] || challengeTemplates.transport;
  return templates.map((t, i) => ({
    id: `challenge_${weakest}_${i}_${Date.now()}`,
    ...t,
    category: weakest,
  }));
}
