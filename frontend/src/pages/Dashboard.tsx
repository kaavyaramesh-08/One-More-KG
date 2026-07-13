import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Flame, 
  Droplet, 
  Dumbbell, 
  Plus, 
  Apple, 
  Scale, 
  TrendingDown, 
  Calendar,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DailySummary {
  waterMl: number;
  caloriesIn: number;
  caloriesBurned: number;
  dailyCalorieTarget: number;
  foodEntries: any[];
  exerciseEntries: any[];
}

const CircularProgress: React.FC<{
  value: number;
  max: number;
  colorClass: string;
  icon: React.ReactNode;
  label: string;
  unit: string;
}> = ({ value, max, colorClass, icon, label, unit }) => {
  const percent = Math.min(Math.round((value / max) * 100), 200);
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center relative group hover:shadow-md transition-all">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          {/* Track circle */}
          <circle
            className="text-gray-100"
            strokeWidth={stroke}
            stroke="currentColor"
            fill="transparent"
            r={normalizedRadius}
            cx={radius + stroke}
            cy={radius + stroke}
          />
          {/* Animated Progress circle */}
          <circle
            className={`transition-all duration-500 ease-out ${colorClass}`}
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx={radius + stroke}
            cy={radius + stroke}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <div className="p-2 bg-gray-50 rounded-full group-hover:scale-110 transition-transform mb-1">
            {icon}
          </div>
          <span className="text-xl font-bold font-poppins">{value}</span>
          <span className="text-[10px] text-brandtext-secondary uppercase tracking-wider font-semibold">{unit}</span>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold text-sm text-brandtext-primary">{label}</h4>
        <p className="text-xs text-brandtext-secondary mt-0.5">
          {percent}% of {max} {unit}
        </p>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user, apiUrl, getHeaders, updateUser } = useAuth();
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals / Log states
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [logLoading, setLogLoading] = useState(false);

  const fetchDailySummary = async (targetDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/api/logs/daily?date=${targetDate}`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to load daily logs.');
      const data = await response.json();
      setSummary(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailySummary(date);
  }, [date]);

  const handleQuickWater = async (amountMl: number) => {
    try {
      const response = await fetch(`${apiUrl}/api/logs/water`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ waterMl: amountMl, logDate: date }),
      });
      if (!response.ok) throw new Error('Water logging failed.');
      fetchDailySummary(date);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightInput) return;
    setLogLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/logs/weight`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ weightKg: Number(weightInput), logDate: date }),
      });
      if (!response.ok) throw new Error('Weight logging failed.');
      
      // Update local storage user weight
      if (user) {
        const updated = { ...user, currentWeightKg: Number(weightInput) };
        updateUser(updated);
      }
      
      setWeightModalOpen(false);
      setWeightInput('');
      fetchDailySummary(date);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLogLoading(false);
    }
  };

  const handleLogExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName || !exerciseDuration) return;
    setLogLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/logs/exercise`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          activityType: exerciseName,
          durationMinutes: Number(exerciseDuration),
          logDate: date,
        }),
      });
      if (!response.ok) throw new Error('Exercise logging failed.');
      
      setExerciseModalOpen(false);
      setExerciseName('');
      setExerciseDuration('');
      fetchDailySummary(date);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLogLoading(false);
    }
  };

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const calorieTarget = summary?.dailyCalorieTarget || 2000;
  const calorieIn = summary?.caloriesIn || 0;
  const waterMl = summary?.waterMl || 0;
  const caloriesBurned = summary?.caloriesBurned || 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-brandtext-primary font-poppins">Hello, {user?.name}! 👋</h1>
            <span className="px-3 py-0.5 text-xs font-bold bg-primary/10 text-primary border border-primary/20 rounded-full">
              {user?.bmiCategory} (BMI: {user?.bmi})
            </span>
          </div>
          <p className="text-brandtext-secondary text-sm mt-1">Consistency is key! Keep tracking to reach your {user?.targetWeightKg} kg goal.</p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 self-start md:self-auto">
          <Calendar size={16} className="text-brandtext-secondary ml-2" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent text-sm font-semibold outline-none border-none text-brandtext-primary px-1 py-0.5"
          />
        </div>
      </div>

      {/* Progress Rings grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <CircularProgress
          value={calorieIn}
          max={calorieTarget}
          colorClass="text-accent"
          icon={<Flame size={20} className="text-accent" />}
          label="Calories In"
          unit="kcal"
        />

        <CircularProgress
          value={waterMl}
          max={2500}
          colorClass="text-blue-500"
          icon={<Droplet size={20} className="text-blue-500" />}
          label="Water Intake"
          unit="ml"
        />

        <CircularProgress
          value={caloriesBurned}
          max={300}
          colorClass="text-primary-light"
          icon={<Dumbbell size={20} className="text-primary" />}
          label="Exercise Burned"
          unit="kcal"
        />
      </div>

      {/* Action buttons / quick logging */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Log Water */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-poppins font-bold text-brandtext-primary flex items-center gap-2">
              <Droplet size={18} className="text-blue-500" />
              <span>Quick Log Water</span>
            </h3>
            <p className="text-xs text-brandtext-secondary mt-1">Easily hit your daily 2500ml water targets.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => handleQuickWater(250)}
              className="py-2.5 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/30 text-xs font-semibold text-blue-600 transition-all"
            >
              +250 ml
            </button>
            <button 
              onClick={() => handleQuickWater(500)}
              className="py-2.5 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/30 text-xs font-semibold text-blue-600 transition-all"
            >
              +500 ml
            </button>
            <button 
              onClick={() => handleQuickWater(750)}
              className="py-2.5 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/30 text-xs font-semibold text-blue-600 transition-all"
            >
              +750 ml
            </button>
          </div>
        </div>

        {/* Log Weight */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-poppins font-bold text-brandtext-primary flex items-center gap-2">
              <Scale size={18} className="text-primary" />
              <span>Weight Logger</span>
            </h3>
            <p className="text-xs text-brandtext-secondary mt-1">Current Weight: <span className="font-semibold">{user?.currentWeightKg} kg</span></p>
          </div>
          <button 
            onClick={() => setWeightModalOpen(true)}
            className="w-full py-2.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary font-semibold rounded-xl text-sm transition-all"
          >
            Update Weight Log
          </button>
        </div>

        {/* Quick Log Exercise */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-poppins font-bold text-brandtext-primary flex items-center gap-2">
              <Dumbbell size={18} className="text-accent" />
              <span>Log Activity</span>
            </h3>
            <p className="text-xs text-brandtext-secondary mt-1">Keep track of your active minutes and calories.</p>
          </div>
          <button 
            onClick={() => setExerciseModalOpen(true)}
            className="w-full py-2.5 bg-accent/5 hover:bg-accent/10 border border-accent/20 text-accent font-semibold rounded-xl text-sm transition-all"
          >
            Add Workout
          </button>
        </div>
      </div>

      {/* Lists of meals logged today */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Foods logged today */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-poppins font-bold text-brandtext-primary flex items-center gap-2">
              <Apple size={18} className="text-primary" />
              <span>Meals Logged Today</span>
            </h3>
            <Link to="/log-food" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
              <span>Go Log</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-gray-50 max-h-[250px] overflow-y-auto pr-1">
            {summary?.foodEntries && summary.foodEntries.length > 0 ? (
              summary.foodEntries.map((food, i) => (
                <div key={i} className="py-3 flex justify-between items-center text-sm">
                  <div>
                    <h5 className="font-semibold">{food.foodName}</h5>
                    <p className="text-xs text-brandtext-secondary">{food.quantityGrams}g • P: {food.proteinG}g C: {food.carbsG}g</p>
                  </div>
                  <span className="font-bold text-accent">+{food.calories} kcal</span>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-xs text-brandtext-secondary">No meals logged for today yet.</p>
            )}
          </div>
        </div>

        {/* Exercises logged today */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-poppins font-bold text-brandtext-primary flex items-center gap-2">
              <Dumbbell size={18} className="text-accent" />
              <span>Workouts Today</span>
            </h3>
          </div>

          <div className="divide-y divide-gray-50 max-h-[250px] overflow-y-auto pr-1">
            {summary?.exerciseEntries && summary.exerciseEntries.length > 0 ? (
              summary.exerciseEntries.map((ex, i) => (
                <div key={i} className="py-3 flex justify-between items-center text-sm">
                  <div>
                    <h5 className="font-semibold">{ex.activityType}</h5>
                    <p className="text-xs text-brandtext-secondary">{ex.durationMinutes} minutes</p>
                  </div>
                  <span className="font-bold text-primary">-{ex.caloriesBurned} kcal</span>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-xs text-brandtext-secondary">No workouts logged for today.</p>
            )}
          </div>
        </div>
      </div>

      {/* Weight Modal */}
      {weightModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl border border-gray-50 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold font-poppins text-primary mb-4 flex items-center gap-2">
              <Scale size={20} className="text-primary" />
              <span>Log Weight (kg)</span>
            </h3>
            <form onSubmit={handleLogWeight} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-brandtext-secondary block mb-1">Enter your weight</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  min="10"
                  max="300"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="e.g. 74.5"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm bg-gray-50/50"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setWeightModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-brandtext-secondary hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={logLoading}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white gradient-progress disabled:opacity-50"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exercise Modal */}
      {exerciseModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl border border-gray-50 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold font-poppins text-accent mb-4 flex items-center gap-2">
              <Dumbbell size={20} className="text-accent" />
              <span>Log Exercise</span>
            </h3>
            <form onSubmit={handleLogExercise} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-brandtext-secondary block mb-1">Activity Type</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Running, Yoga, Gym weights"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm bg-gray-50/50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-brandtext-secondary block mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 45"
                  value={exerciseDuration}
                  onChange={(e) => setExerciseDuration(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm bg-gray-50/50"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setExerciseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-brandtext-secondary hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={logLoading}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white gradient-coral disabled:opacity-50"
                >
                  Log Workout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
