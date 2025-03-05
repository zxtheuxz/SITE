import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg transition-all duration-300 ease-in-out
                hover:scale-110 active:scale-95
                bg-gradient-to-br from-blue-100 to-blue-200 dark:from-slate-700 dark:to-slate-800
                shadow-md hover:shadow-lg dark:shadow-slate-900/50
                border border-blue-200 dark:border-slate-600"
      aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
    >
      <span className="sr-only">{theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}</span>
      <div className="relative w-6 h-6 transition-all duration-300">
        {theme === 'light' ? (
          <Moon className="w-6 h-6 text-slate-700 transition-all duration-300 rotate-0 scale-100" />
        ) : (
          <Sun className="w-6 h-6 text-yellow-400 transition-all duration-300 rotate-0 scale-100" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle; 