import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import * as cheerio from 'cheerio';

const SOURCES_PATH = path.resolve('scripts/news_sources.json');
const DATABASE_PATH = path.resolve('public/news.json');

// Helper to sanitize HTML preview snippets
function sanitizeHtml(html) {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<img\s+[^>]*\bwidth=["']?1["']?\s+[^>]*\bheight=["']?1["']?[^>]*>/gi, '')
    .replace(/<img\s+[^>]*\bsrc=["']?https:\/\/api\.substack\.com\/feed\/pixel[^>]*>/gi, '')
    .replace(/\?utm_[a-z0-9_=&]+/gi, '')
    .trim();
}

// Parse date into standard YYYY-MM-DD
function parseCleanDate(dateStr) {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return d.toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

// Keyword-based automatic categorization engine
const CATEGORY_KEYWORDS = {
  Politics: [
    'politics', 'election', 'summit', 'biden', 'trump', 'xi jinping', 'diplomat', 
    'foreign policy', 'taiwan', 'military', 'sanctions', 'clash', 'border', 'nato', 
    'south china sea', 'government', 'state visit', 'political', 'congress', 'senate',
    'säkerhet', 'försvar', 'politik', '外交', '军事', '台湾', '南海', '政府', '政治', '民调'
  ],
  Economy: [
    'economy', 'trade', 'tariffs', 'tariff', 'finance', 'market', 'business', 'stock', 
    'investment', 'gdp', 'fiscal', 'inflation', 'bank', 'growth', 'industrial', 'economic', 
    'export', 'import', 'bonds', 'investor', 'corporate', 'merger', 'currency', 'handels',
    'ekonomi', 'valuta', 'marknad', '经济', '贸易', '商业', '投资', '股市', '金融', '财政'
  ],
  Technology: [
    'technology', 'chip', 'semiconductor', 'ai', 'artificial intelligence', 'software', 
    'hardware', 'huawei', 'nvidia', 'electric vehicle', 'ev', 'byd', 'tech', 'server', 
    'scientific', 'space', 'quantum', '5g', 'telecom', 'robotics', 'clean energy', 'patent',
    'teknik', 'vetenskap', 'dator', '科技', '芯片', '人工智能', '数码', '华为', '科技', '电动汽车'
  ],
  Society: [
    'society', 'culture', 'population', 'education', 'health', 'census', 'family', 
    'birth', 'marriage', 'social', 'labor', 'ordinary', 'city', 'life', 'travel', 
    'food', 'festival', 'slang', 'trend', 'demographics', 'migration', 'poverty',
    'kultur', 'historia', 'språk', 'samhälle', 'kinesisk', 'utbildning', 'hälsa',
    '社会', '文化', '教育', '生活', '人口', '健康', '旅游', '美食'
  ]
};

function determineCategory(title, description) {
  const combinedText = `${title} ${description || ''}`.toLowerCase();
  
  let bestCategory = 'Society'; // default fallback
  let maxMatches = 0;
  
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let matches = 0;
    for (const keyword of keywords) {
      if (combinedText.includes(keyword)) {
        matches++;
      }
    }
    
    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = cat;
    }
  }
  
  return bestCategory;
}

async function scrapeNews() {
  console.log('🏁 Starting China-News Scraper Pipeline...');

  // 1. Load Newsletter config
  if (!fs.existsSync(SOURCES_PATH)) {
    console.error(`❌ News sources file not found at: ${SOURCES_PATH}`);
    process.exit(1);
  }
  const sources = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf8'));

  // 2. Load existing cache to incrementally merge
  let database = {};
  if (fs.existsSync(DATABASE_PATH)) {
    try {
      database = JSON.parse(fs.readFileSync(DATABASE_PATH, 'utf8'));
      console.log(`📂 Loaded existing cache containing ${Object.keys(database).length} outlets.`);
    } catch (e) {
      console.warn('⚠️ Legacy news database was corrupted. Starting fresh.');
    }
  }

  const finalDatabase = {};

  // Ensure public folder exists
  const publicDir = path.dirname(DATABASE_PATH);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 3. Loop through news sources
  for (const src of sources) {
    console.log(`\n📚 Scrape Target: ${src.name} (${src.rssUrl})...`);

    const existingSrcData = database[src.id] || { ...src, articles: [] };
    const articleCache = new Map(existingSrcData.articles.map(a => [a.id, a]));

    try {
      const response = await axios.get(src.rssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/xml, text/xml, */*'
        },
        timeout: 15000
      });

      const parsed = await parseStringPromise(response.data);
      let items = [];

      // Handle standard XML RSS structures
      if (parsed.rss && parsed.rss.channel && parsed.rss.channel[0].item) {
        items = parsed.rss.channel[0].item;
      } else if (parsed.feed && parsed.feed.entry) {
        items = parsed.feed.entry;
      } else if (parsed.channel && parsed.channel[0] && parsed.channel[0].item) {
        items = parsed.channel[0].item;
      }

      console.log(`  Found ${items.length} items in feed.`);

      let parsedCount = 0;
      for (const item of items) {
        try {
          // Extract ID/GUID
          let rawId = '';
          if (item.guid && item.guid[0]) {
            rawId = typeof item.guid[0] === 'object' ? item.guid[0]._ || item.guid[0].id : item.guid[0];
          } else if (item.id && item.id[0]) {
            rawId = item.id[0];
          } else if (item.link && item.link[0]) {
            rawId = typeof item.link[0] === 'object' ? item.link[0].$.href : item.link[0];
          }
          
          if (!rawId) continue;
          
          const cleanId = `${src.id}-${rawId.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`.replace(/-+/g, '-').slice(0, 100);

          // Extract link
          let link = '';
          if (item.link && item.link[0]) {
            link = typeof item.link[0] === 'object' ? item.link[0].$.href : item.link[0];
          } else if (item.guid && item.guid[0] && typeof item.guid[0] === 'string' && item.guid[0].startsWith('http')) {
            link = item.guid[0];
          }

          if (typeof link === 'object' && link.$ && link.$.href) {
            link = link.$.href;
          }

          // Extract title
          let title = item.title && item.title[0] ? (typeof item.title[0] === 'object' ? item.title[0]._ || item.title[0] : item.title[0]).trim() : 'Untitled News';
          
          // Google News feed titles often append the source suffix like " - SCMP" or " - Reuters". Clean that up.
          title = title.replace(/\s+-\s+[^-\n]+$/, '');

          // Extract Date
          const rawDate = (item.pubDate && item.pubDate[0]) || (item.published && item.published[0]) || (item.updated && item.updated[0]) || '';
          const publishDate = parseCleanDate(rawDate);

          // Extract Content / Summary description
          let rawContent = '';
          if (item['content:encoded'] && item['content:encoded'][0]) {
            rawContent = item['content:encoded'][0];
          } else if (item.description && item.description[0]) {
            rawContent = item.description[0];
          } else if (item.content && item.content[0]) {
            rawContent = typeof item.content[0] === 'object' ? item.content[0]._ : item.content[0];
          } else if (item.summary && item.summary[0]) {
            rawContent = typeof item.summary[0] === 'object' ? item.summary[0]._ : item.summary[0];
          }

          // Check cache to preserve deep content if we already have it
          const cached = articleCache.get(cleanId);
          let cleanContent = sanitizeHtml(rawContent);

          // Parse and strip google news wrapper links if present in description
          if (cleanContent.includes('Google News') || cleanContent.length < 5) {
            // Strip tags to get clean snippet text
            const $ = cheerio.load(cleanContent);
            cleanContent = $.text().trim();
          }

          // Recategorize dynamically
          const category = determineCategory(title, cleanContent);

          const article = {
            id: cleanId,
            title,
            link,
            publishDate,
            description: cleanContent,
            category,
            language: src.language,
            languageCode: src.languageCode,
            flag: src.flag,
            stance: src.stance,
            sourceId: src.id,
            sourceName: src.name
          };

          // Cache or update
          articleCache.set(cleanId, article);
          parsedCount++;
        } catch (itemErr) {
          console.warn(`  ⚠️ Failed to parse news item: ${itemErr.message}`);
        }
      }

      console.log(`  Processed ${parsedCount} items successfully.`);

    } catch (netErr) {
      console.error(`  ❌ Failed to fetch news feed for ${src.name}: ${netErr.message}`);
      console.log('  ⚠️ Using cached articles for this publication.');
    }

    // Convert map back to sorted array (newest first)
    const sortedArticles = Array.from(articleCache.values())
      .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
      .slice(0, 100); // Keep max 100 entries

    finalDatabase[src.id] = {
      ...src,
      articles: sortedArticles
    };

    console.log(`  Consolidated total articles in database: ${sortedArticles.length}`);
  }

  // 4. Save consolidated database
  fs.writeFileSync(DATABASE_PATH, JSON.stringify(finalDatabase, null, 2), 'utf8');
  console.log(`\n🎉 Success! Consolidated news database written to: ${DATABASE_PATH}`);
}

scrapeNews();
