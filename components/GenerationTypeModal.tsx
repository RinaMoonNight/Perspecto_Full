
import React from 'react';
import { User, Target, Layers, X } from 'lucide-react';
import { GeneratorType } from '../types';

interface GenerationTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: GeneratorType) => void;
}

const GenerationTypeModal: React.FC<GenerationTypeModalProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl p-8 border border-gray-200 dark:border-gray-700 animate-fade-in relative">
            <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
            <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select what you want to generate</h2>
                <p className="text-gray-500 dark:text-gray-400">Choose an artifact type to start your research based on your project context.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Persona Option */}
            <div 
                onClick={() => onSelect('persona')}
                className="group bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 cursor-pointer transition-all hover:shadow-lg hover:shadow-primary-500/10"
            >
                <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Design Persona</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Create detailed user profiles with goals, pains, and needs.</p>
            </div>

            {/* JTBD Option */}
            <div 
                onClick={() => onSelect('jtbd')}
                className="group bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 cursor-pointer transition-all hover:shadow-lg hover:shadow-primary-500/10"
            >
                <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Jobs-To-Be-Done</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Generate situational statements focusing on user motivation and outcomes.</p>
            </div>

            {/* Both Option */}
            <div 
                onClick={() => onSelect('both')}
                className="group bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 cursor-pointer transition-all hover:shadow-lg hover:shadow-primary-500/10"
            >
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Generate Both</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Create a comprehensive set including both a Persona and related JTBDs.</p>
            </div>
            </div>
        </div>
    </div>
  );
};

export default GenerationTypeModal;
