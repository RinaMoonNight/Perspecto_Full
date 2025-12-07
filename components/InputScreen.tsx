
import React, { useState, useEffect } from 'react';
import { Sparkles, Users, Target, Layers, ArrowLeft } from 'lucide-react';
import Button from './Button';
import { GeneratorType, InputContext } from '../types';

interface InputScreenProps {
  onGenerate: (data: InputContext) => void;
  initialType?: GeneratorType;
  lockType?: boolean;
  onBack?: () => void;
}

const InputScreen: React.FC<InputScreenProps> = ({ 
  onGenerate, 
  initialType = 'both', 
  lockType = false,
  onBack
}) => {
  const [context, setContext] = useState('');
  const [type, setType] = useState<GeneratorType>(initialType);

  // When initialType prop changes (e.g., re-navigating to this screen), update state
  useEffect(() => {
    setType(initialType);
  }, [initialType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (context.trim()) {
      onGenerate({ context, type });
    }
  };

  const getButtonText = () => {
    if (type === 'persona') return 'Generate Persona';
    if (type === 'jtbd') return 'Generate JTBD';
    return 'Generate Assets';
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      {onBack && (
        <div className="mb-4">
            <button 
                onClick={onBack}
                className="flex items-center text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors font-medium text-sm group"
            >
                <div className="p-2 rounded-full bg-transparent group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-colors mr-2">
                    <ArrowLeft className="w-5 h-5" />
                </div>
                Back to {lockType ? 'Home' : 'Project'}
            </button>
        </div>
      )}

      <div className="text-center mb-10">
         <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Add a little bit details</h2>
         <p className="text-gray-600 dark:text-gray-400">Add description or details you have so we can help you create ready artifact in seconds</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-700 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-10 flex flex-col gap-8">
          
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                Description
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., We are building a mobile application for urban gardeners who struggle to keep their plants alive due to irregular watering schedules. The app should provide reminders, plant care tips, and a community for sharing advice..."
              className="w-full h-64 p-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white resize-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:focus:bg-gray-800 text-base leading-relaxed"
              required
            />
          </div>

          {!lockType && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Output Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setType('persona')}
                  className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    type === 'persona'
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-400'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600'
                  }`}
                >
                  <Users className="w-5 h-5 mr-3" />
                  <span className="font-medium">Persona</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('jtbd')}
                  className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    type === 'jtbd'
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-400'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600'
                  }`}
                >
                  <Target className="w-5 h-5 mr-3" />
                  <span className="font-medium">JTBD</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('both')}
                  className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    type === 'both'
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-400'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600'
                  }`}
                >
                  <Layers className="w-5 h-5 mr-3" />
                  <span className="font-medium">Both</span>
                </button>
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button 
                type="submit" 
                size="lg" 
                disabled={!context.trim()} 
                fullWidth
                className="h-14 text-lg shadow-lg shadow-primary-500/20"
            >
                <Sparkles className="w-5 h-5 mr-2" />
                {getButtonText()}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputScreen;
