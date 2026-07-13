import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingDown, 
  Award, 
  Sparkles, 
  Activity, 
  Calendar,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface TrajectoryPoint {
  date: string;
  weight: number;
  type: 'ACTUAL' | 'PREDICTED';
}

interface TrajectoryResponse {
  currentWeight: number;
  targetWeight: number;
  predictedWeight7Days: number | null;
  predictedWeight30Days: number | null;
  methodUsed: string;
  points: TrajectoryPoint[];
}

interface Badge {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

const Progress: React.FC = () => {
  const { user, apiUrl, getHeaders } = useAuth();
  const [trajectory, setTrajectory] = useState<TrajectoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrajectory = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/predict/weight-trajectory`, {
          headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch weight forecast details.');
        const data = await response.json();
        setTrajectory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTrajectory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !trajectory) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <TrendingDown size={48} className="text-red-500 mx-auto" />
        <h3 className="text-lg font-bold">Error Loading Progress</h3>
        <p className="text-sm text-brandtext-secondary">{error || 'Something went wrong'}</p>
      </div>
    );
  }

  // Format Recharts data
  const chartData = trajectory.points.map((pt) => ({
    date: new Date(pt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    Actual: pt.type === 'ACTUAL' ? pt.weight : null,
    Predicted: pt.type === 'PREDICTED' ? pt.weight : null,
  }));

  // Seamless connection: find the last ACTUAL point and duplicate it as start of PREDICTED
  let lastActualIdx = -1;
  for (let i = chartData.length - 1; i >= 0; i--) {
    if (chartData[i].Actual !== null) {
      lastActualIdx = i;
      break;
    }
  }
  if (lastActualIdx !== -1) {
    chartData[lastActualIdx].Predicted = chartData[lastActualIdx].Actual;
  }

  // Calculate dynamic milestones / badges
  const actualPointsCount = trajectory.points.filter(p => p.type === 'ACTUAL').length;
  const startingWeight = trajectory.points.length > 0 ? trajectory.points[0].weight : (user?.currentWeightKg || 0);
  const currentWeight = user?.currentWeightKg || 0;
  const targetWeight = user?.targetWeightKg || 0;
  const weightLost = startingWeight - currentWeight;

  const badges: Badge[] = [
    {
      id: 'first_step',
      title: 'First Step',
      description: 'Logged your starting weight',
      unlocked: actualPointsCount >= 1,
      icon: '👣',
    },
    {
      id: 'on_track',
      title: 'Deficit Warrior',
      description: 'Maintained a net calorie deficit',
      unlocked: actualPointsCount >= 2,
      icon: '🔥',
    },
    {
      id: 'weight_loss_1kg',
      title: '1KG Melted',
      description: 'Lost at least 1 kilogram of weight',
      unlocked: weightLost >= 1.0,
      icon: '💧',
    },
    {
      id: 'halfway',
      title: 'Halfway Hero',
      description: 'Completed 50% of your weight loss target',
      unlocked: startingWeight > targetWeight && ((startingWeight - currentWeight) / (startingWeight - targetWeight)) >= 0.5,
      icon: '⭐',
    },
    {
      id: 'weka_master',
      title: 'ML Master',
      description: 'Logged 14 days to unlock Weka AI forecasting',
      unlocked: trajectory.methodUsed === 'WEKA_REGRESSION',
      icon: '🧠',
    },
    {
      id: 'goal_reached',
      title: 'Champion',
      description: 'Fully reached your target weight!',
      unlocked: currentWeight <= targetWeight,
      icon: '🏆',
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-poppins text-primary">Progress & AI Forecast</h1>
        <p className="text-brandtext-secondary text-sm mt-1">
          Review weight trend charts and future forecasting built with Weka regression modeling.
        </p>
      </div>

      {/* Grid Forecast Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm text-center">
          <span className="text-xs font-semibold text-brandtext-secondary uppercase">Starting Weight</span>
          <h4 className="text-2xl font-bold font-poppins mt-1">{startingWeight} kg</h4>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm text-center">
          <span className="text-xs font-semibold text-brandtext-secondary uppercase">Current Weight</span>
          <h4 className="text-2xl font-bold font-poppins mt-1 text-primary">{currentWeight} kg</h4>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm text-center">
          <span className="text-xs font-semibold text-brandtext-secondary uppercase">Target Weight</span>
          <h4 className="text-2xl font-bold font-poppins mt-1 text-accent">{targetWeight} kg</h4>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm text-center bg-primary/5 border-primary/10">
          <span className="text-xs font-semibold text-primary uppercase font-bold">Estimated Loss</span>
          <h4 className="text-2xl font-bold font-poppins mt-1 text-primary">
            {weightLost > 0 ? `${Math.round(weightLost * 10) / 10} kg` : '0 kg'}
          </h4>
        </div>
      </div>

      {/* Trajectory Forecast Chart */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-poppins font-bold text-brandtext-primary flex items-center gap-2">
              <TrendingDown size={18} className="text-primary" />
              <span>Weight Trajectory Chart</span>
            </h3>
            <p className="text-xs text-brandtext-secondary mt-0.5">Seamless transition from logged history to future predictions.</p>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 px-3.5 py-1.5 rounded-xl border border-gray-100 self-start sm:self-auto">
            <span className="text-xs text-brandtext-secondary font-medium">Model:</span>
            <span className="text-xs font-bold text-primary flex items-center gap-1">
              <Sparkles size={12} />
              <span>{trajectory.methodUsed === 'WEKA_REGRESSION' ? 'Weka Linear Regression' : 'Metabolic Deficit Rate'}</span>
            </span>
          </div>
        </div>

        {/* Recharts container */}
        <div className="h-[300px] w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" stroke="#94A3B8" />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#94A3B8" />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(255,255,255,0.95)', 
                  border: 'none', 
                  borderRadius: '16px', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)' 
                }} 
              />
              <Legend verticalAlign="top" height={36} />
              <Line 
                name="Logged Weight"
                type="monotone" 
                dataKey="Actual" 
                stroke="#2E7D32" 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 0, fill: '#2E7D32' }}
                activeDot={{ r: 6 }} 
              />
              <Line 
                name="AI Prediction"
                type="monotone" 
                dataKey="Predicted" 
                stroke="#FF7043" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Prediction projections alert */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-50">
          <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
            <span className="text-xs font-semibold text-brandtext-secondary">Predicted weight (7 days)</span>
            <span className="font-bold text-brandtext-primary font-poppins">
              {trajectory.predictedWeight7Days ? `${trajectory.predictedWeight7Days} kg` : 'Calculating...'}
            </span>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
            <span className="text-xs font-semibold text-brandtext-secondary">Predicted weight (30 days)</span>
            <span className="font-bold text-accent font-poppins">
              {trajectory.predictedWeight30Days ? `${trajectory.predictedWeight30Days} kg` : 'Calculating...'}
            </span>
          </div>
        </div>
      </div>

      {/* Badges and Milestones */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
        <div>
          <h3 className="font-poppins font-bold text-brandtext-primary flex items-center gap-2">
            <Award size={18} className="text-primary" />
            <span>Milestone Badges</span>
          </h3>
          <p className="text-xs text-brandtext-secondary mt-0.5">Complete tracking goals to unlock unique progress medals.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {badges.map((badge) => (
            <div 
              key={badge.id}
              className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between gap-2 transition-all ${
                badge.unlocked 
                  ? 'bg-primary/5 border-primary/20 scale-[1.02]' 
                  : 'bg-gray-50/50 border-gray-100 opacity-60'
              }`}
            >
              <span className="text-3xl filter saturate-[0.85]">{badge.icon}</span>
              <h5 className="font-bold text-xs text-brandtext-primary leading-tight">{badge.title}</h5>
              <p className="text-[10px] text-brandtext-secondary leading-tight">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Progress;
