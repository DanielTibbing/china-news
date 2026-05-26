export interface NewsArticle {
  id: string;
  title: string;
  link: string;
  publishDate: string;
  description: string;
  category: 'Politics' | 'Economy' | 'Technology' | 'Society';
  language: string;
  languageCode: string;
  flag: string;
  stance: string;
  sourceId: string;
  sourceName: string;
}

export interface NewsSource {
  id: string;
  name: string;
  language: string;
  languageCode: string;
  flag: string;
  stance: string;
  accentColor: string;
  rssUrl: string;
  categories: string[];
  icon: string;
  articles: NewsArticle[];
}
