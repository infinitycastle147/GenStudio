import React from 'react';
import { Palette, Sparkles, Sun, Moon } from 'lucide-react';

interface Props {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export default function Header({ isDarkMode, toggleTheme }: Props) {
  return (
    <header className="h-16 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex items-center px-6 justify-between flex-shrink-0 z-40 relative transition-colors duration-200">
      <div className="flex items-center gap-3 group cursor-default">
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/20 flex items-center justify-center text-white transition-transform group-hover:scale-105 duration-300">
          <Palette size={20} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col justify-center">
           <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight leading-none">
             GenStudio
           </h1>
           <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase mt-1">AI Design Suite</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-full border border-gray-200 dark:border-white/5 shadow-inner">
            <Sparkles size={12} className="text-emerald-500 dark:text-emerald-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium font-mono">System Ready</span>
        </div>
      </div>
    </header>
  );
}