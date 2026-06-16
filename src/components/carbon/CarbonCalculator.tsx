import { useState } from 'react';
import { Car, Utensils, Home, ShoppingBag, Leaf } from 'lucide-react';
import BorderGlow from '../BorderGlow';
import CountUp from '../CountUp';
import { EMISSION_FACTORS, DAILY_AVERAGE_CO2E, DAILY_TARGET_CO2E } from '../../utils/carbonConstants';

export default function CarbonCalculator() {
  const [transportKm, setTransportKm] = useState(10);
  const [foodMeals, setFoodMeals] = useState(1);
  const [foodType, setFoodType] = useState<'meat_meal' | 'fish_meal' | 'vegetarian_meal' | 'vegan_meal'>('meat_meal');
  const [acHours, setAcHours] = useState(2);
  const [shoppingItems, setShoppingItems] = useState(0);

  const calculateTotal = () => {
    let total = 0;
    total += transportKm * EMISSION_FACTORS.transport.car.co2ePerUnit;
    total += foodMeals * EMISSION_FACTORS.food[foodType].co2ePerUnit;
    total += acHours * EMISSION_FACTORS.home.ac_hour.co2ePerUnit;
    total += shoppingItems * EMISSION_FACTORS.goods.fast_fashion.co2ePerUnit;
    return total;
  };

  const totalCo2e = calculateTotal();

  const getImpactColor = (val: number) => {
    if (val <= DAILY_TARGET_CO2E) return 'text-primary';
    if (val <= DAILY_AVERAGE_CO2E) return 'text-gentle-warning';
    return 'text-error';
  };

  const getImpactMessage = (val: number) => {
    if (val <= DAILY_TARGET_CO2E) return 'Great job! You are below the 50% reduction target.';
    if (val <= DAILY_AVERAGE_CO2E) return 'You are below average, but can still improve.';
    return 'Your footprint is above average today.';
  };

  return (
    <BorderGlow backgroundColor="var(--color-surface-container-lowest)" borderRadius={12} className="w-full shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Leaf className="text-primary" size={24} />
          <h3 className="text-xl font-bold text-on-surface">Daily Footprint Estimator</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold flex items-center gap-2 text-on-surface">
                  <Car size={16} className="text-primary" /> Car Travel
                </label>
                <span className="text-sm font-bold text-primary">{transportKm} km</span>
              </div>
              <input 
                type="range" min="0" max="50" step="1" 
                value={transportKm} onChange={(e) => setTransportKm(Number(e.target.value))}
                className="w-full accent-primary"
                aria-label="Car travel distance in kilometers"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold flex items-center gap-2 text-on-surface">
                  <Utensils size={16} className="text-tertiary" /> Meals
                </label>
                <span className="text-sm font-bold text-tertiary">{foodMeals} meals</span>
              </div>
              <input 
                type="range" min="0" max="3" step="1" 
                value={foodMeals} onChange={(e) => setFoodMeals(Number(e.target.value))}
                className="w-full accent-tertiary"
                aria-label="Number of meals"
              />
              <div className="flex gap-2 mt-2">
                {(['meat_meal', 'fish_meal', 'vegetarian_meal', 'vegan_meal'] as const).map(type => (
                  <button 
                    key={type}
                    onClick={() => setFoodType(type)}
                    className={`text-[10px] px-2 py-1 rounded-full font-bold transition-colors ${
                      foodType === type ? 'bg-tertiary text-on-tertiary' : 'bg-surface-variant text-on-surface-variant'
                    }`}
                  >
                    {type.split('_')[0].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold flex items-center gap-2 text-on-surface">
                  <Home size={16} className="text-secondary" /> AC Usage
                </label>
                <span className="text-sm font-bold text-secondary">{acHours} hrs</span>
              </div>
              <input 
                type="range" min="0" max="24" step="1" 
                value={acHours} onChange={(e) => setAcHours(Number(e.target.value))}
                className="w-full accent-secondary"
                aria-label="Air conditioning usage in hours"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold flex items-center gap-2 text-on-surface">
                  <ShoppingBag size={16} className="text-on-surface-variant" /> New Items
                </label>
                <span className="text-sm font-bold text-on-surface-variant">{shoppingItems} items</span>
              </div>
              <input 
                type="range" min="0" max="5" step="1" 
                value={shoppingItems} onChange={(e) => setShoppingItems(Number(e.target.value))}
                className="w-full accent-outline"
                aria-label="Number of new items purchased"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center items-center p-6 bg-surface-container-low rounded-xl border border-surface-variant/50 text-center" aria-live="polite">
            <h4 className="text-sm uppercase tracking-widest text-on-surface-variant font-bold mb-2">Estimated Impact</h4>
            <div className={`text-5xl font-bold mb-2 ${getImpactColor(totalCo2e)}`}>
              <CountUp to={totalCo2e} duration={0.5} /> <span className="text-2xl">kg CO₂e</span>
            </div>
            <p className="text-sm font-medium text-on-surface-variant max-w-[250px]">
              {getImpactMessage(totalCo2e)}
            </p>
            
            <div className="w-full mt-8 space-y-2">
              <div className="flex justify-between text-xs text-on-surface-variant">
                <span>Target: {DAILY_TARGET_CO2E}kg</span>
                <span>Avg: {DAILY_AVERAGE_CO2E}kg</span>
              </div>
              <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden flex">
                <div className="h-full bg-primary" style={{ width: `${(DAILY_TARGET_CO2E / 20) * 100}%` }}></div>
                <div className="h-full bg-gentle-warning" style={{ width: `${((DAILY_AVERAGE_CO2E - DAILY_TARGET_CO2E) / 20) * 100}%` }}></div>
                <div className="h-full bg-error" style={{ width: `${((20 - DAILY_AVERAGE_CO2E) / 20) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BorderGlow>
  );
}
