# CU₹₹€NC¥ — Global Currency & Crypto Intelligence

A high-performance, real-time web application for tracking global foreign exchange rates, cryptocurrencies, multi-asset performance comparisons, and currency strength analytics.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Lightweight Charts (WebGL)**, and **Framer Motion**.

---

## 🌟 Key Features

### 📈 Live Exchange Rates & Market Boards
- **Fiat Currency Intelligence**: Real-time European Central Bank (ECB) daily reference rates via the Frankfurter API.
- **Crypto Market Intelligence**: Top cryptocurrencies tracked in real-time via the CoinGecko API.
- **Interactive WebGL Sparklines**: GPU-accelerated 60fps price sparklines with gradient fill and hover inspect.
- **Market Movers Panel**: Live top gainers, top losers, and most active assets with magnitude ranking indicators.

### 🔄 Multi-Asset Converter & Historical Engine
- **Fiat ↔ Fiat, Crypto ↔ Fiat, Crypto ↔ Crypto**: Route conversions seamlessly with transparent USD cross-rate pricing.
- **Historical Rates Engine**: Calculate conversions for any specific date in past history.
- **1-Year Conversion Timeline**: Toggle 1-year historical rate trend charts directly within the converter interface.
- **Split-Flap Digit Animations**: Smooth value counter transitions with visual color flashes for appreciation/depreciation.

### 📊 Advanced Multi-Asset Normalized Comparison
- Compare up to 4 fiat currencies or cryptocurrencies side-by-side on a single GPU-accelerated canvas chart.
- Automatic baseline normalization (rebased to 100 on start date) for direct performance comparison across different asset classes.
- Interactive crosshair tooltips displaying exact normalized values and percentage change.

### 💪 Currency Strength Index & Analytics
- Visual ranking engine calculating relative currency strength against any chosen base currency (USD, EUR, GBP, INR, etc.).
- Color-coded magnitude bars highlighting the strongest and weakest currencies in the market.

### ⭐ Local Watchlist & Favorites
- Pin your favorite currencies and crypto assets to build a personal dashboard.
- Real-time event synchronization across tabs and pages via `localStorage`.

### ⚡ Performance & UX Features
- **TradingView WebGL Rendering**: Replaced heavy SVG charts with `lightweight-charts` for 60fps GPU rendering.
- **Zero-Latency Stale-While-Revalidate**: In-memory caching layer for instant tab navigation and silent background updates.
- **Self-Hosted Typography**: Zero external network roundtrips using `next/font/google` (`Fraunces`, `IBM Plex Sans`, `IBM Plex Mono`).
- **Live Ticker Tape Marquee**: 60fps auto-scrolling ticker bar highlighting top market movers.
- **Paper & Night Color Theme**: Carefully calibrated dual theme supporting warm paper parchment and deep dark mode.
- **Mobile Drawer & Keyboard Shortcuts**:
  - `⌘K` / `Ctrl+K`: Global search Command Palette.
  - `T`: Day/Night theme toggle.
  - `?`: Keyboard shortcuts modal overlay.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14.2 (App Router, Server Components) |
| **Language** | TypeScript 5.5 |
| **Styling** | Tailwind CSS 3.4, Custom Glassmorphism, CSS Variables |
| **Charts Engine** | TradingView `lightweight-charts` 5.2 (WebGL / Canvas) |
| **Animations** | Framer Motion (`LazyMotion` bundle optimized) |
| **Data Sources** | Frankfurter API (ECB reference rates), CoinGecko API |
| **State & Cache** | Stale-While-Revalidate custom hooks, In-memory TTL cache, `localStorage` |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or later
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://PS D:\Programming\CURRENCY.git
   cd CURRENCY
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open in your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📂 Project Structure

```text
currency-app/
├── app/
│   ├── analytics/        # Currency Strength Index page
│   ├── compare/          # Multi-asset normalized comparison page
│   ├── convert/          # Fiat/crypto converter page
│   ├── crypto/           # Crypto market listing & detail pages ([id])
│   ├── currencies/       # Fiat currency listing & detail pages ([code])
│   ├── watchlist/        # Local watchlist / favorites page
│   ├── globals.css       # Custom styles, glassmorphism, scrollbars
│   ├── layout.tsx        # Root layout with fonts, TickerTape, Header, Footer
│   └── page.tsx          # Main dashboard (Hero, Movers, Boards)
├── components/           # Reusable UI components
│   ├── AnimatedNumber.tsx    # Digit roll & price flash counter
│   ├── Board.tsx             # Table container layout
│   ├── BoardRow.tsx          # Memoized currency/crypto row
│   ├── CommandPalette.tsx    # ⌘K Search modal
│   ├── ComparisonChart.tsx   # Lightweight-charts multi-line canvas
│   ├── ConversionTimeline.tsx# 1-year rate history chart
│   ├── Converter.tsx         # Fiat/crypto conversion interface
│   ├── Header.tsx            # Sticky header with nav & mobile controls
│   ├── KeyboardShortcuts.tsx # ? Keyboard shortcut overlay
│   ├── LazySection.tsx       # IntersectionObserver lazy container
│   ├── MiniSparkline.tsx     # Zero-thrash SVG sparkline with gradient fill
│   ├── MobileDrawer.tsx      # Mobile navigation drawer
│   ├── PriceChart.tsx        # WebGL area price chart
│   ├── ProgressBar.tsx       # Top route navigation progress indicator
│   ├── RiskGauge.tsx         # Annualized volatility calculation gauge
│   ├── TickerTape.tsx        # Infinite marquee ticker bar
│   ├── WatchlistStar.tsx     # Favorite star toggle button
│   └── ...
├── hooks/
│   ├── useApi.ts         # Stale-while-revalidate data fetching hook
│   └── useWatchlist.ts   # LocalStorage watchlist sync hook
├── lib/
│   ├── cache.ts          # Server-side TTL caching
│   ├── convert.ts        # Currency conversion calculation engine
│   ├── format.ts         # Price, rate, & percentage formatters
│   ├── normalize.ts      # Multi-asset baseline normalization engine
│   └── volatility.ts     # Annualized daily log-returns volatility calculator
└── package.json
```

---

## 📜 Available Scripts

- **`npm run dev`**: Starts the development server.
- **`npm run build`**: Compiles and builds the production application.
- **`npm run start`**: Runs the built production application.
- **`npm run lint`**: Runs ESLint checks.

---

## 🔒 Data Freshness & Methodology

- **Fiat Exchange Rates**: Sourced from European Central Bank reference rates published once per business day around 16:00 CET via Frankfurter.
- **Cryptocurrency Rates**: Sourced from CoinGecko public API tier (~1-5 minute updates).
- **Volatility Calculations**: Annualized standard deviation of daily log-returns ($\text{stdDev} \times \sqrt{N}$), using $N=252$ for business-day fiat pairs and $N=365$ for 24/7 crypto markets.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
