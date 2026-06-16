/**
 * CO₂e Emission Factors & Carbon Constants
 *
 * Emission factors sourced from IPCC AR6 (2021) and supplementary lifecycle
 * assessment databases. Values represent cradle-to-gate CO₂-equivalent
 * emissions and are intentionally simplified for consumer-facing estimation.
 *
 * @module carbonConstants
 */

// ---------------------------------------------------------------------------
// Emission factor types
// ---------------------------------------------------------------------------

export interface EmissionFactor {
  /** kg of CO₂-equivalent per unit of activity */
  co2ePerUnit: number;
  /** Human-readable unit label (e.g. "km", "meal", "kWh") */
  unit: string;
  /** Short description of the activity */
  description: string;
}

export type EmissionCategory = 'transport' | 'food' | 'home' | 'goods' | 'other';

// ---------------------------------------------------------------------------
// EMISSION_FACTORS
// ---------------------------------------------------------------------------

/**
 * Nested lookup of emission factors organised by category → subcategory.
 *
 * Negative values (e.g. recycling, composting, tree planting) represent
 * avoided / sequestered emissions and act as carbon offsets.
 */
export const EMISSION_FACTORS: Record<EmissionCategory, Record<string, EmissionFactor>> = {
  transport: {
    car: {
      co2ePerUnit: 0.21,
      unit: 'km',
      description: 'Average passenger car (petrol/diesel)',
    },
    bus: {
      co2ePerUnit: 0.089,
      unit: 'km',
      description: 'Public bus transit',
    },
    train: {
      co2ePerUnit: 0.041,
      unit: 'km',
      description: 'Commuter / intercity rail',
    },
    bike: {
      co2ePerUnit: 0,
      unit: 'km',
      description: 'Bicycle (zero direct emissions)',
    },
    walk: {
      co2ePerUnit: 0,
      unit: 'km',
      description: 'Walking (zero direct emissions)',
    },
    flight_short: {
      co2ePerUnit: 0.255,
      unit: 'km',
      description: 'Short-haul flight (< 1 500 km)',
    },
    flight_long: {
      co2ePerUnit: 0.195,
      unit: 'km',
      description: 'Long-haul flight (≥ 1 500 km)',
    },
  },

  food: {
    meat_meal: {
      co2ePerUnit: 3.3,
      unit: 'meal',
      description: 'Meal containing red meat (beef / lamb)',
    },
    fish_meal: {
      co2ePerUnit: 1.34,
      unit: 'meal',
      description: 'Meal containing fish / seafood',
    },
    vegetarian_meal: {
      co2ePerUnit: 0.5,
      unit: 'meal',
      description: 'Vegetarian meal (may include dairy / eggs)',
    },
    vegan_meal: {
      co2ePerUnit: 0.3,
      unit: 'meal',
      description: 'Fully plant-based meal',
    },
    dairy: {
      co2ePerUnit: 0.8,
      unit: 'serving',
      description: 'Single serving of dairy product',
    },
    local_produce: {
      co2ePerUnit: 0.1,
      unit: 'serving',
      description: 'Locally-sourced fruit / vegetables',
    },
  },

  home: {
    electricity_kwh: {
      co2ePerUnit: 0.233,
      unit: 'kWh',
      description: 'Grid electricity (US average mix)',
    },
    natural_gas_kwh: {
      co2ePerUnit: 0.184,
      unit: 'kWh',
      description: 'Natural gas for heating / cooking',
    },
    heating_oil_l: {
      co2ePerUnit: 2.68,
      unit: 'L',
      description: 'Heating oil (per litre)',
    },
    water_l: {
      co2ePerUnit: 0.000344,
      unit: 'L',
      description: 'Treated municipal water supply',
    },
    ac_hour: {
      co2ePerUnit: 0.95,
      unit: 'hr',
      description: 'Air conditioning unit (avg residential)',
    },
  },

  goods: {
    fast_fashion_item: {
      co2ePerUnit: 10,
      unit: 'item',
      description: 'New fast-fashion garment',
    },
    secondhand_item: {
      co2ePerUnit: 0.5,
      unit: 'item',
      description: 'Secondhand / thrifted garment',
    },
    electronics_small: {
      co2ePerUnit: 25,
      unit: 'item',
      description: 'Small electronics (phone, earbuds, etc.)',
    },
    electronics_large: {
      co2ePerUnit: 100,
      unit: 'item',
      description: 'Large electronics (laptop, TV, etc.)',
    },
    plastic_bag: {
      co2ePerUnit: 0.033,
      unit: 'bag',
      description: 'Single-use plastic bag',
    },
  },

  other: {
    recycling_kg: {
      co2ePerUnit: -0.5,
      unit: 'kg',
      description: 'Recycling (negative = avoided emissions)',
    },
    composting_kg: {
      co2ePerUnit: -0.2,
      unit: 'kg',
      description: 'Composting organic waste (negative = offset)',
    },
    tree_planting: {
      co2ePerUnit: -22,
      unit: 'tree/year',
      description: 'Planting a tree (annual CO₂ sequestration)',
    },
  },
} as const;

// ---------------------------------------------------------------------------
// Category display metadata
// ---------------------------------------------------------------------------

export interface CategoryMeta {
  /** Human-readable label */
  label: string;
  /** Emoji icon for compact UI contexts */
  icon: string;
  /** Tailwind CSS text-color class (M3-inspired palette) */
  color: string;
}

/** Display metadata for each emission category */
export const CATEGORY_LABELS: Record<EmissionCategory, CategoryMeta> = {
  transport: { label: 'Transport', icon: '🚗', color: 'text-blue-600' },
  food: { label: 'Food', icon: '🍽️', color: 'text-green-600' },
  home: { label: 'Home', icon: '🏠', color: 'text-amber-600' },
  goods: { label: 'Goods', icon: '🛍️', color: 'text-purple-600' },
  other: { label: 'Other', icon: '♻️', color: 'text-teal-600' },
} as const;

// ---------------------------------------------------------------------------
// Reference benchmarks
// ---------------------------------------------------------------------------

/**
 * Average daily CO₂e footprint for a US resident (kg).
 * Derived from ~16 tonnes CO₂e / year ÷ 365 days ≈ 13.7 kg/day.
 * Source: EPA / Global Carbon Project 2023.
 */
export const DAILY_AVERAGE_CO2E = 13.7;

/**
 * Aspirational daily CO₂e target representing a 50 % reduction
 * from the US average — aligned with 2030 interim climate goals.
 */
export const DAILY_TARGET_CO2E = 6.8;
