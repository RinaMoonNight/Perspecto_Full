import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  const [message, setMessage] = useState("Analyzing context...");

  useEffect(() => {
    const messages = [
      "Analyzing project context...",
      "Identifying user needs and pains...",
      "Drafting detailed persona...",
      "Formulating Jobs-To-Be-Done...",
      "Finalizing UX artifacts..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setMessage(messages[i]);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] animate-fade-in text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-full shadow-lg relative z-10">
             <Loader2 className="w-12 h-12 text-primary-600 animate-spin dark:text-primary-400" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white animate-pulse">
        {message}
      </h3>
      <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        Our AI is crafting custom artifacts based on your input. This usually takes a few seconds.
      </p>
    </div>
  );
};

export default LoadingScreen;