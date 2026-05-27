import { useState } from 'react';
import { useNews } from './hooks/useNews';
import { Header } from './components/layout/Header';
import { NewsDashboard } from './components/news/NewsDashboard';
import { ParallelCoverage } from './components/news/ParallelCoverage';
import { Newspaper } from 'lucide-react';
import { useTheme } from 'china-common';

export function App() {
  const {
    filteredArticles,
    articles,
    loading,
    error,

    // States
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedLanguage,
    setSelectedLanguage,
    selectedStance,
    setSelectedStance,
    activeView,
    setActiveView,
    setActiveArticle,
    bookmarks,

    // Actions
    toggleBookmark,
    recordReading
  } = useNews();

  const { isDarkMode, setIsDarkMode } = useTheme();

  const [compareArticle, setCompareArticle] = useState<any | null>(null);

  const handleSelectArticle = (art: any) => {
    setActiveArticle(art);
    recordReading(art.id);
    // Float the comparison modal or let the user click comparison
    setCompareArticle(art);
  };

  const handleCompareArticle = (art: any) => {
    setCompareArticle(art);
    recordReading(art.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        bookmarksCount={bookmarks.size}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          /* Loading State Skeleton */
          <div className="py-24 text-center space-y-4">
            <div className="h-10 w-10 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-bold text-gray-500 dark:text-slate-400 animate-pulse uppercase tracking-wider">
              Aggregating diverse news sources...
            </p>
          </div>
        ) : error ? (
          /* Error State Banner */
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 text-center max-w-md mx-auto mt-12 transition-colors">
            <p className="text-sm font-bold text-red-700 dark:text-red-400">
              Error: {error}
            </p>
            <p className="text-xs text-red-500 dark:text-red-400/80 mt-2">
              Failed to load consolidated news database. Please verify your scraper setup or build files.
            </p>
          </div>
        ) : compareArticle ? (
          /* High-Fidelity Side-by-Side Parallel Coverage View */
          <ParallelCoverage
            article={compareArticle}
            allArticles={articles}
            bookmarks={bookmarks}
            onToggleBookmark={toggleBookmark}
            onClose={() => setCompareArticle(null)}
          />
        ) : (
          /* News Feed dashboard Grid */
          <NewsDashboard
            articles={filteredArticles}
            bookmarks={bookmarks}
            onToggleBookmark={toggleBookmark}
            onSelectArticle={handleSelectArticle}
            onCompareArticle={handleCompareArticle}
            
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            selectedStance={selectedStance}
            setSelectedStance={setSelectedStance}
            activeView={activeView}
            setActiveView={setActiveView}
          />
        )}
      </main>

      {!compareArticle && (
        <footer className="border-t border-gray-200 dark:border-slate-900 py-8 text-center text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest transition-colors mt-12">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Newspaper className="h-4 w-4 text-indigo-500" />
              China News • Diverse Perspective Hub
            </span>
            <span>
              Updated hourly via build-time automation
            </span>
          </div>
        </footer>
      )}

    </div>
  );
}

export default App;
