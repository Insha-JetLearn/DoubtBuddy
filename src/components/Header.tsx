import React from "react";
import { Star, Moon, Sun, Sparkles } from "lucide-react";

interface HeaderProps {
  stars: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  starGainedTrigger: number;
}

export const Header: React.FC<HeaderProps> = ({
  stars,
  isDarkMode,
  onToggleDarkMode,
  starGainedTrigger,
}) => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-amber-100 dark:border-slate-800 transition-colors duration-200 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* App Title & Mascot */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-400 flex items-center justify-center shadow-md shadow-amber-500/20 text-2xl select-none transform hover:scale-105 transition-transform">
            🦉
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800 dark:text-white font-heading">
                Doubt<span className="text-amber-500 dark:text-amber-400">Buddy</span>
              </h1>
              <span className="hidden xs:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                Class 6-8
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              Your patient & cheerful study companion ✨
            </p>
          </div>
        </div>

        {/* Right Controls: Star Counter & Dark Mode */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Star Counter */}
          <div
            key={starGainedTrigger}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-100 dark:from-slate-800 dark:to-amber-950/40 border border-amber-300/80 dark:border-amber-700/60 shadow-sm transition-all ${
              starGainedTrigger > 0 ? "animate-star-pop ring-2 ring-amber-400" : ""
            }`}
            title="Earn 1 star per question asked and 2 stars per correct quiz answer!"
          >
            <Star className="w-5 h-5 text-amber-500 fill-amber-400 drop-shadow-sm animate-pulse" />
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg font-black text-amber-800 dark:text-amber-300 font-heading leading-none">
                  {stars}
                </span>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hidden sm:inline">
                  {stars === 1 ? "Star" : "Stars"}
                </span>
              </div>
            </div>
            {starGainedTrigger > 0 && (
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 sm:p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700 hover:-rotate-12 transition-transform" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
