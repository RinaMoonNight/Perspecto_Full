import React from 'react';
import { ArrowRight } from 'lucide-react';
import Button from './Button';

interface LandingScreenProps {
  onStart: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onStart }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in px-4">
      
      {/* Icon Container */}
      <div className="mb-8 relative group">
        <div className="absolute inset-0 bg-primary-600 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 rounded-full"></div>
        <div className="relative bg-[#1e1b4b] border border-gray-800 p-8 rounded-[2rem] shadow-2xl">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-primary-500">
                <path d="M12 3v18" />
                <path d="M3 12h18" />
                <path d="M5.64 5.64l12.72 12.72" />
                <path d="M18.36 5.64L5.64 18.36" />
            </svg>
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-2 mb-8 max-w-2xl">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
          Perspecto
        </h1>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-500">
          AI Research Assistant
        </h2>
        <p className="text-lg text-gray-400 max-w-xl mx-auto mt-6 leading-relaxed">
          Transform your project context into detailed User Personas and actionable
          Jobs-To-Be-Done statements in seconds.
        </p>
      </div>

      {/* CTA Button */}
      <div className="mt-4">
        <Button 
            onClick={onStart} 
            className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 text-lg rounded-xl font-semibold shadow-lg shadow-primary-900/50 hover:shadow-primary-600/30 transition-all transform hover:-translate-y-1"
        >
          Start New Project <ArrowRight className="ml-2 w-5 h-5 inline" />
        </Button>
      </div>
    </div>
  );
};

export default LandingScreen;