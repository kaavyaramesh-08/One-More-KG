import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Camera, 
  UploadCloud, 
  Utensils, 
  Scale, 
  Plus, 
  Check, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FoodItem {
  id: number;
  foodName: string;
  cuisineTag: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

interface ServingOption {
  label: string;
  grams: number;
  calories: number;
}

interface ScanResult {
  predicted_food_name: string;
  confidence: number;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  suggested_serving_options: ServingOption[];
}

const LogFood: React.FC = () => {
  const { apiUrl, getHeaders } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Scan state
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // Selected food logging state
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantityGrams, setQuantityGrams] = useState<number>(150);
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [logging, setLogging] = useState(false);

  // Fetch search results
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setSearchLoading(true);
        try {
          const response = await fetch(`${apiUrl}/api/logs/food/search?query=${encodeURIComponent(searchQuery)}`, {
            headers: getHeaders(),
          });
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setScanResult(null); // clear scan if manual selection
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanLoading(true);
    setScanResult(null);
    setSelectedFood(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('onemorekg_token');
      const response = await fetch(`${apiUrl}/api/scan/food-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Image scan failed');
      const data: ScanResult = await response.json();
      setScanResult(data);
      
      // Auto populate logging target with predicted dish structure
      setSelectedFood({
        id: -1,
        foodName: data.predicted_food_name,
        cuisineTag: 'Scanned',
        caloriesPer100g: data.calories_per_100g,
        proteinPer100g: data.protein_per_100g,
        carbsPer100g: data.carbs_per_100g,
        fatPer100g: data.fat_per_100g,
      });
      // Default to regular serving size of 200g
      setQuantityGrams(200);
    } catch (err) {
      alert('Scanning failed. Please make sure the backend is online.');
    } finally {
      setScanLoading(false);
    }
  };

  const handleLogMeal = async () => {
    if (!selectedFood) return;
    setLogging(true);
    try {
      const response = await fetch(`${apiUrl}/api/logs/food`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          foodName: selectedFood.foodName,
          quantityGrams,
          logDate,
        }),
      });

      if (!response.ok) throw new Error('Meal logging failed');
      
      // Trigger canvas confetti celebration if they logged successfully!
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
      });

      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLogging(false);
    }
  };

  // Calculated macros based on slider scale
  const factor = quantityGrams / 100;
  const calculatedCal = selectedFood ? Math.round(selectedFood.caloriesPer100g * factor) : 0;
  const calculatedProtein = selectedFood ? Math.round((selectedFood.proteinPer100g * factor) * 10) / 10 : 0;
  const calculatedCarbs = selectedFood ? Math.round((selectedFood.carbsPer100g * factor) * 10) / 10 : 0;
  const calculatedFat = selectedFood ? Math.round((selectedFood.fatPer100g * factor) * 10) / 10 : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-poppins text-primary">Log Food Intake</h1>
        <p className="text-brandtext-secondary text-sm mt-1">Search the database or upload a photo to estimate dish calories instantly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column: Search / Scan Input */}
        <div className="space-y-6">
          {/* Search Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-poppins font-bold text-brandtext-primary flex items-center gap-2">
              <Search size={18} className="text-primary" />
              <span>Search Database</span>
            </h3>
            
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="e.g. Masala Dosa, Paneer, Rice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm"
              />
            </div>

            {/* Results autocomplete */}
            {searchLoading && (
              <div className="text-center py-4 text-xs text-brandtext-secondary">Searching database...</div>
            )}
            
            {searchResults.length > 0 && (
              <div className="border border-gray-50 rounded-2xl max-h-[220px] overflow-y-auto divide-y divide-gray-50 bg-gray-50/20">
                {searchResults.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-primary/5 flex justify-between items-center transition-all"
                  >
                    <div>
                      <h4 className="font-semibold text-brandtext-primary">{food.foodName}</h4>
                      <p className="text-xs text-brandtext-secondary">{food.cuisineTag} cuisine</p>
                    </div>
                    <span className="font-bold text-accent text-xs">{food.caloriesPer100g} kcal/100g</span>
                  </button>
                ))}
              </div>
            )}
            {searchQuery.trim().length > 1 && searchResults.length === 0 && !searchLoading && (
              <div className="text-center py-4 text-xs text-brandtext-secondary">
                No matching foods found. We will save it as a custom food log.
              </div>
            )}
          </div>

          {/* Food Scan Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-poppins font-bold text-brandtext-primary flex items-center gap-2">
              <Camera size={18} className="text-accent" />
              <span>Indian Food Image Recognition</span>
            </h3>
            
            <p className="text-xs text-brandtext-secondary">
              Upload a picture of your dish. Our pre-trained deep learning model will automatically estimate its portion and nutritional value.
            </p>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={scanLoading}
              className="w-full border-2 border-dashed border-gray-200 hover:border-primary/50 py-8 rounded-2xl flex flex-col items-center justify-center gap-2 group transition-all bg-gray-50/20"
            >
              {scanLoading ? (
                <>
                  <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-brandtext-secondary font-medium">Scanning food dish...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={32} className="text-gray-400 group-hover:text-primary transition-all" />
                  <span className="text-sm font-semibold text-brandtext-primary">Upload or Snap Photo</span>
                  <span className="text-xs text-brandtext-secondary">PNG, JPG up to 10MB</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right column: Slider / Log confirmation */}
        <div className="space-y-6">
          {selectedFood ? (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-start border-b border-gray-50 pb-4">
                <div>
                  {scanResult && (
                    <div className="flex items-center gap-1.5 text-xs text-accent font-bold mb-1.5">
                      <Sparkles size={12} />
                      <span>{scanResult.confidence}% match</span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold font-poppins text-primary">{selectedFood.foodName}</h3>
                  <p className="text-xs text-brandtext-secondary capitalize">{selectedFood.cuisineTag} cuisine</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-accent font-poppins">{calculatedCal}</span>
                  <span className="text-xs text-brandtext-secondary block font-semibold">kcal</span>
                </div>
              </div>

              {/* Serving options if scanned */}
              {scanResult && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-brandtext-secondary uppercase">Suggested Serving Options</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {scanResult.suggested_serving_options.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setQuantityGrams(opt.grams)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                          quantityGrams === opt.grams
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <span className="font-bold">{opt.label}</span>
                        <span className="text-brandtext-secondary text-[10px] mt-0.5">{opt.grams}g ({opt.calories} kcal)</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-semibold text-brandtext-primary">
                  <span className="flex items-center gap-1.5">
                    <Scale size={16} className="text-primary" />
                    <span>Serving Size</span>
                  </span>
                  <span className="text-primary font-bold text-base">{quantityGrams} grams</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="600"
                  step="5"
                  value={quantityGrams}
                  onChange={(e) => setQuantityGrams(Number(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Macros Panel */}
              <div className="bg-gray-50/50 rounded-2xl p-4 grid grid-cols-3 gap-2 text-center border border-gray-100">
                <div>
                  <span className="text-xs text-brandtext-secondary block">Protein</span>
                  <span className="text-base font-bold text-brandtext-primary font-poppins">{calculatedProtein}g</span>
                </div>
                <div>
                  <span className="text-xs text-brandtext-secondary block">Carbs</span>
                  <span className="text-base font-bold text-brandtext-primary font-poppins">{calculatedCarbs}g</span>
                </div>
                <div>
                  <span className="text-xs text-brandtext-secondary block">Fats</span>
                  <span className="text-base font-bold text-brandtext-primary font-poppins">{calculatedFat}g</span>
                </div>
              </div>

              {/* Date & Submit */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 justify-between">
                  <span className="text-sm font-semibold text-brandtext-secondary">Log Date</span>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm font-semibold text-brandtext-primary outline-none"
                  />
                </div>

                <button
                  onClick={handleLogMeal}
                  disabled={logging}
                  className="w-full py-3.5 rounded-2xl font-bold text-white gradient-progress shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  <span>{logging ? 'Logging...' : 'Confirm & Log Meal'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm text-center text-brandtext-secondary flex flex-col items-center justify-center h-full min-h-[300px]">
              <Utensils size={40} className="text-gray-300 mb-3 animate-pulse" />
              <h4 className="font-bold text-sm text-brandtext-primary">Log Confirmation</h4>
              <p className="text-xs mt-1 max-w-[250px] mx-auto">Select a food from the search results or upload an image to confirm serving size details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogFood;
