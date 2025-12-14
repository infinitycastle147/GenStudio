import React from 'react';
import { Bot, Sparkles, Sun, Moon } from 'lucide-react';

interface Props {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export default function Header({ isDarkMode, toggleTheme }: Props) {
  return (
    <header className="h-16 border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex items-center px-6 justify-between flex-shrink-0 z-40 relative transition-colors duration-200">
      
      {/* Brand Logo */}
      <div className="flex items-center gap-3 select-none">
        <div className="w-9 h-9 bg-gradient-to-tr from-teal-500 to-indigo-600 rounded-xl shadow-lg shadow-teal-500/20 flex items-center justify-center text-white ring-1 ring-white/10">
          <Bot size={20} strokeWidth={2} />
        </div>
        <div className="flex flex-col justify-center">
           <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight leading-none">
             Aura AI
           </h1>
           <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase mt-0.5 opacity-80">Design Companion</span>
        </div>
      </div>
      
      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-95"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-full border border-gray-200 dark:border-white/5 shadow-sm">
            <Sparkles size={12} className="text-teal-500 dark:text-teal-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium font-mono">v1.0</span>
        </div>
      </div>
    </header>
  );
}