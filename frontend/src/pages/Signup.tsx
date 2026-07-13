import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Mail, KeyRound, Accessibility, Sparkles, Scale, Heart } from 'lucide-react';

const Signup: React.FC = () => {
  const { login, apiUrl } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [heightCm, setHeightCm] = useState<number>(170);
  const [currentWeightKg, setCurrentWeightKg] = useState<number>(75);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(68);
  const [activityLevel, setActivityLevel] = useState<string>('MODERATE');
  
  const [bmi, setBmi] = useState<number>(0);
  const [bmiCategory, setBmiCategory] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Recalculate BMI dynamically
  useEffect(() => {
    if (heightCm > 0 && currentWeightKg > 0) {
      const heightM = heightCm / 100;
      const calculatedBmi = currentWeightKg / (heightM * heightM);
      setBmi(Math.round(calculatedBmi * 10) / 10);

      if (calculatedBmi < 18.5) {
        setBmiCategory('Underweight');
      } else if (calculatedBmi < 25.0) {
        setBmiCategory('Normal');
      } else if (calculatedBmi < 30.0) {
        setBmiCategory('Overweight');
      } else {
        setBmiCategory('Obese');
      }
    } else {
      setBmi(0);
      setBmiCategory('');
    }
  }, [heightCm, currentWeightKg]);

  const getBmiBadgeColor = (category: string) => {
    switch (category) {
      case 'Normal': return 'bg-green-100 text-green-800 border-green-200';
      case 'Underweight': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Overweight': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Obese': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      name,
      email,
      password,
      age: Number(age),
      gender,
      heightCm: Number(heightCm),
      currentWeightKg: Number(currentWeightKg),
      targetWeightKg: Number(targetWeightKg),
      activityLevel
    };

    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Registration failed. Try a different email.');
      }

      const data = await response.json();
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-brandbg relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-3xl bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-10 border border-gray-100 shadow-xl shadow-primary/5 flex flex-col md:flex-row gap-8">
        
        {/* Left side: Form */}
        <div className="flex-1 space-y-6">
          <div>
            <span className="text-3xl">⚖️</span>
            <h2 className="text-2xl font-bold font-poppins text-primary mt-1">Get Started</h2>
            <p className="text-brandtext-secondary text-sm">Create your profile to start tracking weight loss.</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brandtext-primary">Name</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-brandtext-primary">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-brandtext-primary">Password</label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••• (6+ chars)"
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-brandtext-primary">Age</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-brandtext-primary">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm bg-white"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-brandtext-primary">Height (cm)</label>
                <input
                  type="number"
                  required
                  min="30"
                  max="250"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-brandtext-primary">Current Weight (kg)</label>
                <input
                  type="number"
                  required
                  min="10"
                  max="300"
                  step="0.1"
                  value={currentWeightKg}
                  onChange={(e) => setCurrentWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-brandtext-primary">Target Weight (kg)</label>
                <input
                  type="number"
                  required
                  min="10"
                  max="300"
                  step="0.1"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-brandtext-primary">Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm bg-white"
              >
                <option value="SEDENTARY">Sedentary (desk job, little exercise)</option>
                <option value="LIGHT">Lightly Active (light exercise 1-3 days/week)</option>
                <option value="MODERATE">Moderately Active (exercise 3-5 days/week)</option>
                <option value="ACTIVE">Very Active (heavy exercise 6-7 days/week)</option>
                <option value="VERY_ACTIVE">Extremely Active (physical job & heavy exercise)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl font-semibold text-white gradient-progress shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-55 mt-2"
            >
              {loading ? 'Creating Account...' : 'Complete Signup'}
            </button>
          </form>
        </div>

        {/* Right side: Real-time BMI display */}
        <div className="w-full md:w-64 bg-primary/5 rounded-3xl p-6 flex flex-col justify-between border border-primary/10 select-none">
          <div className="space-y-4">
            <h3 className="font-poppins font-bold text-lg text-primary flex items-center gap-2">
              <Sparkles size={18} className="text-accent" />
              <span>Live Calculation</span>
            </h3>

            {bmi > 0 ? (
              <div className="space-y-6 text-center py-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-brandtext-secondary uppercase tracking-wider block">Your Calculated BMI</span>
                  <span className="text-5xl font-extrabold text-primary block tracking-tight font-poppins">{bmi}</span>
                </div>

                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold border ${getBmiBadgeColor(bmiCategory)}`}>
                  {bmiCategory}
                </span>

                <div className="text-left text-xs text-brandtext-secondary space-y-2 bg-white/60 p-4 rounded-2xl border border-white">
                  <p className="flex justify-between"><span>Underweight</span> <span className="font-semibold">&lt; 18.5</span></p>
                  <p className="flex justify-between text-green-700"><span>Normal</span> <span className="font-semibold">18.5 – 24.9</span></p>
                  <p className="flex justify-between text-orange-700"><span>Overweight</span> <span className="font-semibold">25 – 29.9</span></p>
                  <p className="flex justify-between text-red-700"><span>Obese</span> <span className="font-semibold">30+</span></p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-sm text-brandtext-secondary">
                Enter your height and weight to view your real-time BMI classification.
              </div>
            )}
          </div>

          <div className="border-t border-primary/10 pt-4 mt-6 text-center">
            <p className="text-xs text-brandtext-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
