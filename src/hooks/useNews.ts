import { useState, useEffect, useMemo } from 'react';
import type { NewsArticle, NewsSource } from '../types';

export function useNews() {
  const [sources, setSources] = useState<Record<string, NewsSource>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedStance, setSelectedStance] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'feed' | 'bookmarks' | 'history'>('feed');
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);

  // Bookmarks & History
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('china-news-bookmarks');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [history, setHistory] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('china-news-history');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    setLoading(true);
    fetch('./news.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load news database.');
        return res.json();
      })
      .then((data: Record<string, NewsSource>) => {
        setSources(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to load news database:', err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Sync bookmarks
  useEffect(() => {
    localStorage.setItem('china-news-bookmarks', JSON.stringify(Array.from(bookmarks)));
  }, [bookmarks]);

  // Sync history
  useEffect(() => {
    localStorage.setItem('china-news-history', JSON.stringify(history));
  }, [history]);

  // Flatten all articles
  const allArticles = useMemo(() => {
    const list: NewsArticle[] = [];
    Object.values(sources).forEach((src) => {
      if (src.articles) {
        list.push(...src.articles);
      }
    });
    // Sort newest first
    return list.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  }, [sources]);

  // Bookmarked articles list
  const bookmarkedArticles = useMemo(() => {
    return allArticles.filter((art) => bookmarks.has(art.id));
  }, [allArticles, bookmarks]);

  // History articles list
  const historyArticles = useMemo(() => {
    return allArticles
      .filter((art) => !!history[art.id])
      .sort((a, b) => new Date(history[b.id]).getTime() - new Date(history[a.id]).getTime());
  }, [allArticles, history]);

  // Filtered articles list
  const filteredArticles = useMemo(() => {
    let list = allArticles;

    if (activeView === 'bookmarks') {
      list = bookmarkedArticles;
    } else if (activeView === 'history') {
      list = historyArticles;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (art) =>
          art.title.toLowerCase().includes(q) ||
          art.description.toLowerCase().includes(q) ||
          art.sourceName.toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCategory) {
      list = list.filter((art) => art.category === selectedCategory);
    }

    // Language
    if (selectedLanguage) {
      list = list.filter((art) => art.language === selectedLanguage);
    }

    // Stance
    if (selectedStance) {
      list = list.filter((art) => art.stance === selectedStance);
    }

    return list;
  }, [allArticles, activeView, bookmarkedArticles, historyArticles, searchQuery, selectedCategory, selectedLanguage, selectedStance]);

  // Star / Bookmark actions
  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const recordReading = (id: string) => {
    setHistory((prev) => ({
      ...prev,
      [id]: new Date().toISOString()
    }));
  };

  const clearHistory = () => {
    setHistory({});
  };

  const clearAllData = () => {
    setBookmarks(new Set());
    setHistory({});
    localStorage.removeItem('china-news-bookmarks');
    localStorage.removeItem('china-news-history');
  };

  return {
    sources: Object.values(sources),
    articles: allArticles,
    filteredArticles,
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
    activeArticle,
    setActiveArticle,
    bookmarks,
    history,

    // Actions
    toggleBookmark,
    recordReading,
    clearHistory,
    clearAllData
  };
}
