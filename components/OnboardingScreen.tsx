import React, { useState } from 'react';
import { ArrowRight, Sparkles, Target, Layers } from 'lucide-react';
import Button from './Button';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Describe Context",
      description: "Simply input your project description, target audience details, or problem statement into the text area.",
      icon: <Layers className="w-16 h-16 text-primary-500 dark:text-primary-400" />,
    },
    {
      title: "Select Output",
      description: "Choose whether you need a detailed User Persona, a Jobs-To-Be-Done statement, or generate both simultaneously.",
      icon: <Target className="w-16 h-16 text-primary-500 dark:text-primary-400" />,
    },
    {
      title: "Generate & Export",
      description: "Our AI instantly creates professional UX artifacts. Copy them as JSON or prepare them for your design tools.",
      icon: <Sparkles className="w-16 h-16 text-primary-500 dark:text-primary-400" />,
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full py-8 sm:py-12 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 p-8 sm:p-12 rounded-3xl shadow-2xl shadow-primary-900/10 dark:shadow-black/40 border border-gray-100 dark:border-gray-700 w-full text-center relative overflow-hidden transition-all duration-300">
        
        {/* Decorative background blob */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-400 to-primary-600"></div>

        <div className="mb-8 flex justify-center">
            <div className="p-6 bg-primary-50 dark:bg-primary-900/30 rounded-full mb-4 ring-1 ring-primary-100 dark:ring-primary-700/50 transition-all duration-500">
                {steps[step].icon}
            </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-all duration-300 min-h-[2.5rem]">
          {steps[step].title}
        </h2>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 min-h-[5rem] leading-relaxed">
          {steps[step].description}
        </p>

        <div className="flex flex-col items-center gap-8">
            <div className="flex space-x-2">
                {steps.map((_, i) => (
                <div 
                    key={i} 
                    className={`h-2 rounded-full transition-all duration-500 ease-out ${i === step ? 'w-8 bg-primary-600 dark:bg-primary-500' : 'w-2 bg-gray-200 dark:bg-gray-700'}`}
                />
                ))}
            </div>

            <div className="flex gap-4 w-full">
                <Button variant="ghost" onClick={onComplete} className="flex-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Skip
                </Button>
                <Button onClick={handleNext} className="flex-1 group shadow-lg shadow-primary-500/25">
                    {step === steps.length - 1 ? "Get Started" : "Next"}
                    {step !== steps.length - 1 && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;