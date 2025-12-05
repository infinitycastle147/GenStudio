import React from 'react';
import { Palette } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 border-b border-gray-800 bg-gray-900 flex items-center px-6 justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
          <Palette size={20} />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          GenStudio
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Documentation</a>
        <div className="w-px h-4 bg-gray-700"></div>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-xs text-gray-400 font-mono">System Ready</span>
        </div>
      </div>
    </header>
  );
}