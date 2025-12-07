
import React from 'react';
import { ArrowRight } from 'lucide-react';
import Button from './Button';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-10 animate-fade-in max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl shadow-primary-500/20 ring-1 ring-gray-100 dark:ring-gray-700">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="w-20 h-20 text-primary-600 dark:text-primary-500">
            <path d="M12 3v18" />
            <path d="M3 12h18" />
            <path d="M5.64 5.64l12.72 12.72" />
            <path d="M18.36 5.64L5.64 18.36" />
        </svg>
      </div>
      
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Perspecto <br className="hidden sm:block" /> <span className="text-primary-600 dark:text-primary-400">AI Research Assistant</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Transform your project context into detailed User Personas and actionable Jobs-To-Be-Done statements in seconds.
        </p>
      </div>

      <div className="pt-4">
        <Button onClick={onStart} size="lg" className="group px-8 py-4 text-lg shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40">
          Start New Project
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
