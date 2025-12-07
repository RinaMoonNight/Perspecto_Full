
import React from 'react';
import { X, Clock, ChevronRight, User, Target, Layers, Trash2 } from 'lucide-react';
import { HistoryItem } from '../types';
import Button from './Button';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, history, onSelect, onClear }) => {
  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl border-l border-gray-200 dark:border-gray-800 animate-slide-in-right flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">History</h2>
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">
              {history.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 space-y-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 opacity-50" />
              </div>
              <p>No history yet.</p>
              <p className="text-sm opacity-70">Generate your first persona or JTBD to see it here.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelect(item)}
                className="group relative bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800 p-4 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                     {item.inputContext.type === 'persona' && <User className="w-4 h-4 text-primary-500" />}
                     {item.inputContext.type === 'jtbd' && <Target className="w-4 h-4 text-amber-500" />}
                     {item.inputContext.type === 'both' && <Layers className="w-4 h-4 text-primary-500" />}
                     <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {item.inputContext.type}
                     </span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    {formatDate(item.timestamp)}
                  </span>
                </div>
                
                <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-3">
                  {item.inputContext.context}
                </h4>

                <div className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  View Result <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
             <Button variant="ghost" fullWidth onClick={onClear} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
               <Trash2 className="w-4 h-4 mr-2" /> Clear History
             </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorySidebar;
