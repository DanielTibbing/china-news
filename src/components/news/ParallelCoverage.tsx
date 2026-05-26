import { useState, useMemo } from 'react';
import { ArrowLeft, BookOpen, Scale, Sparkles, Star, ExternalLink } from 'lucide-react';
import type { NewsArticle } from '../../types';

interface ParallelCoverageProps {
  article: NewsArticle;
  allArticles: NewsArticle[];
  bookmarks: Set<string>;
  onToggleBookmark: (id: string) => void;
  onClose: () => void;
  onPlayEpisode?: (ep: any) => void; // just in case
}

export function ParallelCoverage({
  article,
  allArticles,
  bookmarks,
  onToggleBookmark,
  onClose
}: ParallelCoverageProps) {
  const [comparedArticle, setComparedArticle] = useState<NewsArticle | null>(null);

  // Extract keywords to find matches
  const keywords = useMemo(() => {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'to', 'for', 'in', 
      'on', 'at', 'by', 'with', 'from', 'about', 'china', 'chinese', 'kina', 'kinesiska'
    ]);
    
    return article.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w));
  }, [article]);

  // Find related stories from other stances
  const relatedStories = useMemo(() => {
    if (keywords.length === 0) return [];

    return allArticles
      .filter(art => art.id !== article.id)
      .map(art => {
        const titleWords = art.title.toLowerCase();
        const descWords = (art.description || '').toLowerCase();
        
        let score = 0;
        keywords.forEach(kw => {
          if (titleWords.includes(kw)) score += 3; // weight title matches more
          if (descWords.includes(kw)) score += 1;
        });

        return { article: art, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.article)
      .slice(0, 8);
  }, [keywords, allArticles, article]);

  // Handle auto-select first related story from a contrasting stance
  useMemo(() => {
    if (relatedStories.length > 0 && !comparedArticle) {
      // Prefer story from a contrasting stance
      const contrast = relatedStories.find(art => art.stance !== article.stance);
      setComparedArticle(contrast || relatedStories[0]);
    }
  }, [relatedStories, article, comparedArticle]);

  // Custom colors for different stances
  const getStancePillColor = (stance: string) => {
    switch (stance) {
      case 'Official State Media':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
      case 'Western Press':
        return 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'Singaporean/Middle Ground':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'Independent/Finance':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-905/20 dark:text-slate-400 dark:border-slate-800';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-fade-in">
      
      {/* Compare Canvas Header */}
      <div className="border-b border-gray-200 dark:border-slate-850 pb-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 bg-gray-50 hover:bg-gray-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-xl transition-all text-gray-500 hover:text-indigo-650"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <span className="text-[10px] font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <Scale className="h-4 w-4" />
              Parallel Coverage split view
            </span>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
              Compare Diverse Narrative Perspectives
            </h2>
          </div>
        </div>

        {/* Suggest Matches list */}
        {relatedStories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto max-w-full md:max-w-md py-1 custom-scrollbar shrink-0">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Compare with:
            </span>
            {relatedStories.map((rel) => (
              <button
                key={rel.id}
                onClick={() => setComparedArticle(rel)}
                className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold shrink-0 transition-all ${
                  comparedArticle?.id === rel.id
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800 text-gray-500 hover:text-gray-700 dark:hover:text-slate-350'
                }`}
              >
                {rel.sourceName} ({rel.flag})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SPLIT PANEL GRID */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden min-h-0">
        
        {/* PANEL 1: Original news story (Left) */}
        <div className="flex flex-col h-full bg-white dark:bg-slate-900/40 border border-gray-200 dark:border-slate-850 rounded-2xl p-6 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                {article.sourceName}
              </span>
              <span className="text-[10px]">{article.flag}</span>
              <span className={`text-[9px] font-black border uppercase tracking-wider px-2 py-0.5 rounded ${getStancePillColor(article.stance)}`}>
                {article.stance}
              </span>
            </div>
            
            <button
              onClick={() => onToggleBookmark(article.id)}
              className={`p-1.5 rounded-lg border transition-all ${
                bookmarks.has(article.id)
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/30'
                  : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 hover:text-indigo-600'
              }`}
            >
              <Star className={`h-4 w-4 ${bookmarks.has(article.id) ? 'fill-current' : ''}`} />
            </button>
          </div>

          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white leading-snug mb-3">
            {article.title}
          </h3>
          
          <div className="text-xs font-bold text-gray-400 mb-6">
            Published on {article.publishDate} • Category: {article.category}
          </div>

          <div 
            className="prose prose-indigo dark:prose-invert max-w-none text-sm leading-relaxed text-gray-600 dark:text-slate-350 flex-1 font-serif"
            dangerouslySetInnerHTML={{ __html: article.description || '<p>No content summary provided.</p>' }}
          />

          <div className="mt-8 border-t border-gray-100 dark:border-slate-850 pt-4 text-center shrink-0">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black transition-all"
            >
              <ExternalLink className="h-4.5 w-4.5" />
              Open Original Outlet
            </a>
          </div>
        </div>

        {/* PANEL 2: Selected compared article (Right) */}
        {comparedArticle ? (
          <div className="flex flex-col h-full bg-white dark:bg-slate-900/40 border border-indigo-100 dark:border-slate-800/80 rounded-2xl p-6 overflow-y-auto custom-scrollbar shadow-lg dark:shadow-slate-950/40">
            
            {/* Compare Badge Banner */}
            <div className="bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/10 rounded-xl p-3.5 mb-4 text-[10px] font-semibold text-indigo-700/80 dark:text-indigo-400/80 flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-indigo-500" />
              <span>
                <strong>Perspective Mapping Match:</strong> Comparing similar narratives under distinct editorial stance filters.
              </span>
            </div>

            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  {comparedArticle.sourceName}
                </span>
                <span className="text-[10px]">{comparedArticle.flag}</span>
                <span className={`text-[9px] font-black border uppercase tracking-wider px-2 py-0.5 rounded ${getStancePillColor(comparedArticle.stance)}`}>
                  {comparedArticle.stance}
                </span>
              </div>
              
              <button
                onClick={() => onToggleBookmark(comparedArticle.id)}
                className={`p-1.5 rounded-lg border transition-all ${
                  bookmarks.has(comparedArticle.id)
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/30'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 hover:text-indigo-600'
                }`}
              >
                <Star className={`h-4 w-4 ${bookmarks.has(comparedArticle.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white leading-snug mb-3">
              {comparedArticle.title}
            </h3>
            
            <div className="text-xs font-bold text-gray-400 mb-6">
              Published on {comparedArticle.publishDate} • Category: {comparedArticle.category}
            </div>

            <div 
              className="prose prose-indigo dark:prose-invert max-w-none text-sm leading-relaxed text-gray-600 dark:text-slate-350 flex-1 font-serif"
              dangerouslySetInnerHTML={{ __html: comparedArticle.description || '<p>No content summary provided.</p>' }}
            />

            <div className="mt-8 border-t border-gray-100 dark:border-slate-850 pt-4 text-center shrink-0">
              <a
                href={comparedArticle.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black transition-all"
              >
                <ExternalLink className="h-4.5 w-4.5" />
                Open Original Outlet
              </a>
            </div>
          </div>
        ) : (
          /* Empty Compare State */
          <div className="flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-slate-850 rounded-2xl p-6 text-center text-gray-400 dark:text-slate-650">
            <BookOpen className="h-10 w-10 mb-3 text-gray-300 dark:text-slate-700" />
            <p className="text-sm font-bold">No other related stories found.</p>
            <p className="text-xs text-gray-400 mt-1">There are no other coverage segments sharing keyword patterns in the active database.</p>
          </div>
        )}

      </div>

    </div>
  );
}
