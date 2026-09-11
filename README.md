# Reusable Reactive Marketing Budget Planner & Visualizer
*Based on the Steelcase Media Plan (ID, CN, SG) July 2026 Proposal*

A modern, client-side, reactive marketing budget planning application designed for marketing leaders, media strategists, and demand generation teams.

Live local preview: **`http://localhost:3000/`**

---

## 🌟 Key Features

### 1. Dynamic Market & Channel Planning
- **Add Country / Regional Market Block**: Click **`+ Add Country`** anywhere (top navigation, table header, or table bottom) to create new market sections (e.g. Australia, Japan, UK, USA) with starting budgets and flight distribution.
- **Add Channels Inside Any Country**: Click **`+ Channel`** directly inside any country block (e.g. India, Singapore, China) to append new placements.
- **Dynamic Platform & Offer Dropdowns**: Click any channel badge or offer pill to select from existing options or type custom platforms (e.g. Google Ads, TikTok, YouTube, Reddit) via **`+ Add new option...`**.

### 2. Live Top Overview Deck (Auto-Updating)
- **Total Campaign Budget**: Real-time program spend, market count, and channel placement counter.
- **Spend by Country Cards**: Real-time spend and percentage share for China ($67,000, 56.3%), India ($37,000, 31.1%), Singapore ($15,000, 12.6%), and any newly added country.
- **Spend by Platform / Channel Cards**: Dedicated overview cards showing total investment across all regions for:
  - **LinkedIn LeadGen** ($29,350, 24.7%)
  - **Meta / IG** ($17,100, 14.4%)
  - **WeChat** ($67,000, 56.3%)
  - **Pinterest** ($5,550, 4.7%)
  - Plus any newly added channels!
- **Deck Filter Tabs**: Switch between **All Summary Cards**, **By Country**, or **By Platform**.
- **Multi-Segment Proportional Visualizers**: Proportional multi-colored bars showing exact percentage distributions across markets, platforms, and monthly flight timelines.

### 3. Real-Time Auto-Sum & Auto-Percentage Calculations
- Click any monthly flight cell (July, August, September, October, November) to type numbers; the channel's **Budget (USD)** automatically sums!
- Click any **Budget (USD)** cell directly to edit; amounts automatically balance across active flight months.
- Channel **Budget %** within its country is automatically calculated (`channel / country_total * 100`).
- Country subtotals, grand totals, and the table footer's monthly flight sums update instantly without page reloads.

### 4. Reusability & Multi-Scenario Presets
- **Preset Switcher**:
  - `Steelcase APAC July 2026 Flight` (default proposal)
  - `Global Multi-Region Plan` (US, UK, APAC with LinkedIn, Meta, Google Ads)
  - `Start Blank Plan` (fresh canvas to build from scratch)
- **Data Export**:
  - **Export JSON**: Full structured state download.
  - **Export CSV**: Formatted spreadsheet ready for Excel or Google Sheets.
- **Reset to Default**: 1-click restoration of original proposal numbers.
- **Planning vs Presentation View**: Toggle between active editing and a clean executive presentation view.

---

## 🚀 How to Host on GitHub Pages (Public & Free in 2 Minutes)

Because this app uses a pure, reactive, zero-backend architecture persisted in `localStorage`, it deploys instantly to **GitHub Pages** for free.

### Option A: Using the Terminal / Git CLI

1. Open Terminal in this folder:
   ```bash
   cd "/Users/arden/Documents/- Ai Software builts/-MediaProposal"
   ```

2. Push to your GitHub repository:
   ```bash
   git remote add origin https://github.com/<YOUR-USERNAME>/marketing-budget-planner.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Go to your repository on GitHub: `https://github.com/<YOUR-USERNAME>/marketing-budget-planner`
   - Click **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` and `/ (root)`, then click **Save**.
   - Your live public URL will be ready in ~30 seconds:
     **`https://<YOUR-USERNAME>.github.io/marketing-budget-planner/`**

---

### Option B: 1-Click Drag-and-Drop
- Drag and drop this entire project folder into [app.netlify.com/drop](https://app.netlify.com/drop) to receive an instant public HTTPS link with zero configuration.
