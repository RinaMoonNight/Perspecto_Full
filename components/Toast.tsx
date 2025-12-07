
import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-24 right-8 z-[100] animate-slide-in-right">
      <div className="bg-white dark:bg-gray-800 border-l-4 border-green-500 shadow-xl rounded-r-lg p-4 flex items-center gap-3 pr-8 min-w-[300px]">
        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white text-sm">Success</h4>
          <p className="text-gray-600 dark:text-gray-300 text-xs">{message}</p>
        </div>
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
           <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
