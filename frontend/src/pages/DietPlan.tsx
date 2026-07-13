import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  HeartPulse, 
  Sparkles, 
  Flame, 
  Activity, 
  ChevronRight, 
  Coffee, 
  UtensilsCrossed, 
  Moon, 
  Cookie 
} from 'lucide-react';

interface Meal {
  mealTime: string;
  foodName: string;
  quantityGrams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

interface DietPlanData {
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  carbsPercent: number;
  proteinPercent: number;
  fatPercent: number;
  carbsGrams: number;
  proteinGrams: number;
  fatGrams: number;
  sampleMeals: Meal[];
}

const MealIcon: React.FC<{ time: string }> = ({ time }) => {
  switch (time.toLowerCase()) {
    case 'breakfast': return <Coffee size={18} className="text-amber-500" />;
    case 'lunch': return <UtensilsCrossed size={18} className="text-primary" />;
    case 'dinner': return <Moon size={18} className="text-indigo-500" />;
    default: return <Cookie size={18} className="text-orange-500" />;
  }
};

const DietPlan: React.FC = () => {
  const { apiUrl, getHeaders } = useAuth();
  const [plan, setPlan] = useState<DietPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/diet-plan`, {
          headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch diet plan.');
        const data = await response.json();
        setPlan(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <HeartPulse size={48} className="text-red-500 mx-auto" />
        <h3 className="text-lg font-bold">Error Loading Diet Plan</h3>
        <p className="text-sm text-brandtext-secondary">{error || 'Something went wrong'}</p>
      </div>
    );
  }

  // Draw macro donut chart using SVG stroke-dasharray properties
  const r = 36;
  const c = 2 * Math.PI * r; // circumference = 226.19
  
  // Splits: 40% carbs, 30% protein, 30% fat
  const carbsOffset = 0;
  const proteinOffset = (40 / 100) * c;
  const fatOffset = ((40 + 30) / 100) * c;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-poppins text-primary">Your Diet & Nutrition Plan</h1>
        <p className="text-brandtext-secondary text-sm mt-1">Calculated using the Mifflin-St Jeor equation and adjusted for your weight-loss goals.</p>
      </div>

      {/* Math Metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3.5 bg-indigo-50 rounded-2xl text-indigo-600">
            <Activity size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-brandtext-secondary uppercase">BMR (Basal Metabolic Rate)</span>
            <h4 className="text-2xl font-bold font-poppins mt-0.5">{plan.bmr} <span className="text-sm font-normal text-brandtext-secondary">kcal</span></h4>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3.5 bg-primary/5 rounded-2xl text-primary">
            <Sparkles size={24} className="text-primary-light" />
          </div>
          <div>
            <span className="text-xs font-semibold text-brandtext-secondary uppercase">TDEE (Daily Expenditure)</span>
            <h4 className="text-2xl font-bold font-poppins mt-0.5">{plan.tdee} <span className="text-sm font-normal text-brandtext-secondary">kcal</span></h4>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all relative overflow-hidden group">
          {/* Glowing accent border */}
          <div className="absolute top-0 bottom-0 left-0 w-1.5 gradient-coral"></div>
          <div className="p-3.5 bg-accent/5 rounded-2xl text-accent ml-1.5">
            <Flame size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-brandtext-secondary uppercase">Daily Calorie Target</span>
            <h4 className="text-2xl font-bold font-poppins text-accent mt-0.5">{plan.dailyCalorieTarget} <span className="text-sm font-normal text-brandtext-secondary">kcal</span></h4>
          </div>
        </div>
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Macros donut chart */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div>
            <h3 className="font-poppins font-bold text-brandtext-primary">Recommended Macro Split</h3>
            <p className="text-xs text-brandtext-secondary mt-0.5">Optimum balance for fat loss and muscle preservation.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
            {/* SVG Donut */}
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Carbs slice */}
                <circle
                  cx="50" cy="50" r={r}
                  fill="transparent"
                  stroke="#FF7043" // Accent
                  strokeWidth="10"
                  strokeDasharray={`${(40/100)*c} ${c}`}
                  strokeDashoffset={-carbsOffset}
                />
                {/* Protein slice */}
                <circle
                  cx="50" cy="50" r={r}
                  fill="transparent"
                  stroke="#2E7D32" // Primary
                  strokeWidth="10"
                  strokeDasharray={`${(30/100)*c} ${c}`}
                  strokeDashoffset={-proteinOffset}
                />
                {/* Fat slice */}
                <circle
                  cx="50" cy="50" r={r}
                  fill="transparent"
                  stroke="#FFD54F" // Yellow
                  strokeWidth="10"
                  strokeDasharray={`${(30/100)*c} ${c}`}
                  strokeDashoffset={-fatOffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] text-brandtext-secondary uppercase font-semibold">Deficit Target</span>
                <span className="text-xl font-extrabold text-brandtext-primary font-poppins">{plan.dailyCalorieTarget}</span>
                <span className="text-[9px] text-brandtext-secondary">kcal/day</span>
              </div>
            </div>

            {/* Legend info details */}
            <div className="space-y-4 text-sm w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-accent"></div>
                  <span className="font-semibold">Carbs (40%)</span>
                </div>
                <span className="font-bold font-poppins text-brandtext-primary">{plan.carbsGrams}g</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-primary"></div>
                  <span className="font-semibold">Protein (30%)</span>
                </div>
                <span className="font-bold font-poppins text-brandtext-primary">{plan.proteinGrams}g</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-amber-300"></div>
                  <span className="font-semibold">Fat (30%)</span>
                </div>
                <span className="font-bold font-poppins text-brandtext-primary">{plan.fatGrams}g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Meal timeline suggestions */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div>
            <h3 className="font-poppins font-bold text-brandtext-primary">Scaled Day's Meals</h3>
            <p className="text-xs text-brandtext-secondary mt-0.5">Dynamic suggested portions based on today's target.</p>
          </div>

          <div className="space-y-4">
            {plan.sampleMeals.map((meal, index) => (
              <div key={index} className="flex items-start gap-4 group">
                {/* Timeline connector circle */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:scale-105 transition-all shadow-sm">
                    <MealIcon time={meal.mealTime} />
                  </div>
                  {index < plan.sampleMeals.length - 1 && (
                    <div className="w-[1.5px] h-12 bg-gray-100 mt-2"></div>
                  )}
                </div>

                <div className="flex-1 bg-gray-50/30 border border-gray-100/50 p-4 rounded-2xl flex justify-between items-center hover:bg-gray-50 transition-all">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brandtext-secondary tracking-wider block">{meal.mealTime}</span>
                    <h5 className="font-semibold text-sm text-brandtext-primary mt-0.5">{meal.foodName}</h5>
                    <p className="text-[11px] text-brandtext-secondary mt-1">
                      {meal.quantityGrams}g • P: {meal.proteinG}g | C: {meal.carbsG}g | F: {meal.fatG}g
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-accent">{meal.calories} kcal</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietPlan;
