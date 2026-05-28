# 📰 China News (china-news) - `AGENTS.md`

This directory houses the Consolidated Diverse News Perspectives application of the **China Suite** ecosystem—an ultra-premium client-side dashboard consolidator allowing professionals to track cross-border headlines, compare global media coverages side-by-side, and inspect narrative stances on common topics.

---

## 🎯 Purpose & Capabilities
- **Diverse Perspectives Feed**: Aggregates news summaries covering economics, trade, technology, and geopolitics in China, capturing differences across mainland sources, Western reports, and regional coverages.
- **Parallel Coverage Comparison Canvas**: Allows side-by-side inspection of different articles reporting on the same underlying news event, breaking down how headlines, vocabulary, tone, and editorial stances vary by narrative publisher.
- **Search & Filter Panel**: Provides quick interactive selectors to filter news databases by categories, source languages (English, Chinese), and editorial stances (Mainland, Western, Neutral/Regional).
- **Workspace Linkage**: Depends on the shared `china-common` workspace package to supply core switching footers and tab-synchronized theme hooks.

---

## 🛠️ Technology Stack
- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4.0.0 (integrated via `@tailwindcss/vite` and standard `postcss`)
- **Key Packages:** `axios`, `cheerio`, `xml2js`, and `china-common`
- **Deployment Endpoint:** GitHub Pages subdirectory `/china-news/`

---

## 📂 Key Directory Structures
```text
china-news/
├── src/
│   ├── components/
│   │   ├── layout/            # Navigation switcher integrations & global Header
│   │   └── news/
│   │       ├── NewsDashboard.tsx  # Central dashboard grid, search arrays & stance filters
│   │       └── ParallelCoverage.tsx # Multi-source comparison canvas modal overlay
│   ├── hooks/
│   │   └── useNews.ts         # News feed data-fetch context, bookmarks & progress logs
│   ├── types/
│   │   └── index.ts           # Types representing NewsArticle, MediaSource, stance schemas
│   ├── App.tsx                # Assembly compiler and loading skeleton
│   └── main.tsx               # DOM entry point
```

---

## 🔑 Shared Design & Implementation Patterns

### 1. The Parallel Stance Comparison Engine (`ParallelCoverage.tsx`)
- Triggered when a developer or user clicks comparison buttons or expands inspection detail maps.
- Renders columns displaying articles written by different publishers side-by-side. 
- Formats highlight areas illustrating key vocabulary discrepancies, editorial stance classifications (e.g. *Mainland Editorial*, *Western Analysis*, *Regional Report*), and sentiment scoring tags.

### 2. Consolidated Build Scrapers (`scripts/`)
- Contains Node scraper tools to consolidate news feeds, parse RSS items, parse editorial pages using Axios and Cheerio, and save clean JSON databases inside build feeds.

### 3. Integrated Shared Theme Sync (`china-common`)
- Unlike old standalone frameworks, theme controls tie directly to the shared `useTheme` hooks supplied by `'china-common'`.

---

## 💻 Operations Reference
- **Local Dev Server:**
  ```bash
  npm install
  npm run dev
  ```
- **Compiling Production Build:**
  ```bash
  npm run build
  ```
  *(Performs strict type compiles `tsc -b` and triggers Vite compiler to bundle optimized production assets inside `dist/`)*
