import { Link } from 'react-router-dom';
import { Search, Sun, Moon, Newspaper } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (term: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  bookmarksCount: number;
}

export function Header({
  searchQuery,
  setSearchQuery,
  isDarkMode,
  setIsDarkMode,
  bookmarksCount: _bookmarksCount
}: HeaderProps) {

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-850 sticky top-0 z-20 shadow-sm transition-colors duration-300">
      
      {/* Global Suite Switcher */}
      <div className="bg-gray-50 dark:bg-slate-950 border-b border-gray-200/80 dark:border-slate-800/80 py-2 text-xs font-semibold text-gray-500 dark:text-slate-400 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <a
            href="https://danieltibbing.github.io/"
            className="flex items-center gap-1.5 text-gray-700 dark:text-slate-300 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider font-extrabold text-[10px]"
          >
            <span>China Suite</span>
          </a>
          <div className="flex gap-4 overflow-x-auto select-none no-scrollbar">
            <a href="https://danieltibbing.github.io/china-jobs" className="hover:text-gray-700 dark:hover:text-slate-200 transition-colors pb-0.5">
              Jobs Board
            </a>
            <a href="https://danieltibbing.github.io/china-pods" className="hover:text-gray-700 dark:hover:text-slate-200 transition-colors pb-0.5">
              Podcast Hub
            </a>
            <a href="https://danieltibbing.github.io/chinese-practice/" className="hover:text-gray-700 dark:hover:text-slate-200 transition-colors pb-0.5">
              Language Study
            </a>
            <a href="https://danieltibbing.github.io/china-reader" className="hover:text-gray-700 dark:hover:text-slate-200 transition-colors pb-0.5">
              Reader Feed
            </a>
            <a href="https://danieltibbing.github.io/china-news" className="text-indigo-600 dark:text-indigo-400 font-bold border-b border-indigo-600 dark:border-indigo-400 pb-0.5">
              News Aggregator
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-tr from-indigo-600 to-emerald-600 p-1.5 rounded-lg group-hover:opacity-90 transition-opacity">
                <Newspaper className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                China News
              </h1>
            </Link>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all md:hidden border border-gray-200 dark:border-slate-700"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
          
          <div className="flex flex-1 max-w-md gap-2 items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-slate-500" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl leading-5 bg-gray-50 dark:bg-slate-800 dark:text-white placeholder-gray-500 dark:placeholder-slate-550 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out font-medium"
                placeholder="Search news headlines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="hidden md:flex p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all border border-gray-200 dark:border-slate-700"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      
    </header>
  );
}
