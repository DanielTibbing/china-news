import { Star, Scale, BookOpen, Compass, Info } from 'lucide-react';
import type { NewsArticle } from '../../types';

interface NewsDashboardProps {
  articles: NewsArticle[];
  bookmarks: Set<string>;
  onToggleBookmark: (id: string) => void;
  onSelectArticle: (art: NewsArticle) => void;
  onCompareArticle: (art: NewsArticle) => void;

  // Filter bindings
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  selectedLanguage: string | null;
  setSelectedLanguage: (lang: string | null) => void;
  selectedStance: string | null;
  setSelectedStance: (st: string | null) => void;
  activeView: 'feed' | 'bookmarks' | 'history';
  setActiveView: (view: 'feed' | 'bookmarks' | 'history') => void;
}

const CATEGORIES = ['Politics', 'Economy', 'Technology', 'Society'];
const LANGUAGES = ['English', 'Swedish', 'Chinese'];
const STANCES = [
  'Official State Media',
  'Western Press',
  'Singaporean/Middle Ground',
  'Independent/Finance',
  'Swedish Perspectives'
];

export function NewsDashboard({
  articles,
  bookmarks,
  onToggleBookmark,
  onSelectArticle,
  onCompareArticle,

  selectedCategory,
  setSelectedCategory,
  selectedLanguage,
  setSelectedLanguage,
  selectedStance,
  setSelectedStance,
  activeView,
  setActiveView
}: NewsDashboardProps) {

  // Custom styling mappings for editorial stances
  const getStanceClasses = (stance: string) => {
    switch (stance) {
      case 'Official State Media':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-455 dark:border-red-900/30';
      case 'Western Press':
        return 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'Singaporean/Middle Ground':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'Independent/Finance':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
      case 'Swedish Perspectives':
        return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/30';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-805/20 dark:text-slate-400 dark:border-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* FILTER CONTROLS BAR */}
      <div className="glass-panel border border-gray-200 dark:border-slate-850 rounded-2xl p-5 shadow-sm space-y-4">
        
        {/* Upper row: Language, Stance & Category triggers */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-950/80 p-0.5 rounded-xl border border-gray-100 dark:border-slate-850">
            {(['feed', 'bookmarks', 'history'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black capitalize transition-all ${
                  activeView === view
                    ? 'bg-white dark:bg-slate-850 text-indigo-650 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-350'
                }`}
              >
                {view}
              </button>
            ))}
          </div>

          {/* Quick Stats banner */}
          <div className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Info className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
            <span>Showing {articles.length} stories</span>
          </div>
        </div>

        {/* Categories filters */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mr-2">
            Category:
          </span>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedCategory === null
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800 text-gray-500 hover:text-gray-700 dark:hover:text-slate-350'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedCategory === cat
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800 text-gray-500 hover:text-gray-700 dark:hover:text-slate-350'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Languages filters */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mr-2">
            Language:
          </span>
          <button
            onClick={() => setSelectedLanguage(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedLanguage === null
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800 text-gray-500 hover:text-gray-700 dark:hover:text-slate-350'
            }`}
          >
            All
          </button>
          {LANGUAGES.map(lang => {
            const flag = lang === 'English' ? '🇬🇧' : lang === 'Swedish' ? '🇸🇪' : '🇨🇳';
            return (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  selectedLanguage === lang
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800 text-gray-500 hover:text-gray-700 dark:hover:text-slate-350'
                }`}
              >
                <span>{flag}</span>
                <span>{lang}</span>
              </button>
            );
          })}
        </div>

        {/* Editorial Stance filters */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mr-2">
            Perspective Stance:
          </span>
          <button
            onClick={() => setSelectedStance(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedStance === null
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800 text-gray-500 hover:text-gray-700 dark:hover:text-slate-350'
            }`}
          >
            All
          </button>
          {STANCES.map(st => (
            <button
              key={st}
              onClick={() => setSelectedStance(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedStance === st
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800 text-gray-500 hover:text-gray-700 dark:hover:text-slate-350'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* ARTICLES GRID */}
      {articles.length === 0 ? (
        <div className="text-center py-24 glass-panel border border-gray-200 dark:border-slate-850 rounded-2xl">
          <Compass className="h-10 w-10 text-gray-300 dark:text-slate-750 mx-auto mb-3 animate-pulse" />
          <p className="text-sm font-bold text-gray-500 dark:text-slate-400">
            No news stories match your selections.
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
            Try adjusting your categories, editorial stance filters, or search terms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((art) => {
            const hasDescription = art.description && art.description.trim().length > 0;
            const previewSnippet = hasDescription
              ? art.description.replace(/<[^>]*>/g, '').slice(0, 140) + '...'
              : 'Click Open to view original report coverage.';

            return (
              <div 
                key={art.id}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850/80 rounded-2xl p-5 hover:shadow-xl hover:border-indigo-150 dark:hover:border-indigo-950/30 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                onClick={() => onSelectArticle(art)}
              >
                <div>
                  {/* Top metadata row */}
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="bg-gray-50 dark:bg-slate-950 px-2 py-0.5 rounded text-gray-650 dark:text-slate-450 uppercase text-[9px] font-black tracking-widest border border-gray-100 dark:border-slate-850">
                        {art.sourceName}
                      </span>
                      <span className="text-xs" title={`Language: ${art.language}`}>
                        {art.flag}
                      </span>
                      <span className={`text-[8px] font-black border uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${getStanceClasses(art.stance)}`}>
                        {art.stance}
                      </span>
                    </div>

                    {/* Bookmark triggers */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(art.id);
                      }}
                      className={`p-1.5 rounded-lg border transition-all hover:scale-105 shrink-0 ${
                        bookmarks.has(art.id)
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-650 dark:bg-indigo-950/20 dark:border-indigo-900/30'
                          : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-800 text-gray-400 hover:text-indigo-650'
                      }`}
                    >
                      <Star className={`h-3.5 w-3.5 ${bookmarks.has(art.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-md font-extrabold text-gray-900 dark:text-white group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                    {art.title}
                  </h3>

                  {/* Preview Description */}
                  <p className="text-xs text-gray-400 dark:text-slate-400 mt-2 font-medium leading-relaxed">
                    {previewSnippet}
                  </p>
                </div>

                {/* Footer action buttons */}
                <div className="mt-4 pt-3.5 border-t border-gray-100 dark:border-slate-850 flex items-center justify-between gap-4">
                  <span className="text-[10px] font-bold text-gray-400">
                    {art.publishDate}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Parallel Compare trigger */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompareArticle(art);
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-50 dark:border-indigo-900/30 dark:hover:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                      title="Compare Stances"
                    >
                      <Scale className="h-3 w-3 shrink-0" />
                      <span>Compare</span>
                    </button>

                    {/* Open Story */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectArticle(art);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                    >
                      <BookOpen className="h-3 w-3 shrink-0" />
                      <span>Open</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
