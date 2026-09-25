# Project Architecture & Domain Reference (`main.md`)

## 1. Project Overview
The **Steelcase Reactive Marketing Budget Planner & Visualizer** is a client-side, zero-backend single-page application (SPA). It allows demand generation teams and media strategists to plan, edit, calculate, visualize, and present regional marketing budgets (China, India, Singapore, and custom markets) across multi-month campaign flights.

---

## 2. File & Component Structure

| File | Purpose | Key Responsibilities |
| :--- | :--- | :--- |
| [`index.html`](file:///Users/arden/Documents/-%20Ai%20Software%20builts/-MediaProposal/index.html) | Markup & Layout | App header, executive KPI deck cards, proportional progress bars, market container tables, scenario presets modal, import/export buttons, inline edit popovers. |
| [`styles.css`](file:///Users/arden/Documents/-%20Ai%20Software%20builts/-MediaProposal/styles.css) | Styling & Design System | Dark/Light themes (`body.theme-light`), CSS custom properties/variables, glassmorphic cards, sticky table headers, responsive mobile layout, animation transitions. |
| [`app.js`](file:///Users/arden/Documents/-%20Ai%20Software%20builts/-MediaProposal/app.js) | Reactive Engine | State management (`APP_STATE`, `DATA`), bottom-up calculation engine, dynamic row/market addition & deletion, dropdown options, localStorage persistence, CSV/JSON export. |
| [`README.md`](file:///Users/arden/Documents/-%20Ai%20Software%20builts/-MediaProposal/README.md) | User Documentation | Feature runbook, mathematical calculation rules, and GitHub Pages / Netlify hosting guide. |

---

## 3. Data & State Model

### Core Data State (`DATA`)
* **`DATA.markets`**: Array of country market objects (e.g., China, India, Singapore).
  * `id`: Unique market slug (e.g. `china`, `india`).
  * `country`: Display name.
  * `channels`: Array of channel placement objects.
    * `id`: Unique channel ID.
    * `platform`: Media platform (e.g., `WeChat`, `LinkedIn LeadGen`, `Meta / IG`, `Pinterest`).
    * `offer`: Campaign offer/asset.
    * `months`: Dictionary of monthly flight allocations (e.g. `{ july: 10000, august: 10000, ... }`).
    * `budget`: Total channel budget (USD) — derived bottom-up or distributed top-down.
    * `cpc`: Cost per click (optional).
    * `cpl`: Cost per lead (optional).

### Application State (`APP_STATE`)
* `isEditMode`: Controls whether cells are directly editable vs. read-only presentation view.
* `deckFilter`: Active overview filter (`'all'`, `'countries'`, `'platforms'`).
* `activeMarketFilter`: Focus on a single country table or show all.
* `activeProposal`: Identifier for the currently selected scenario/proposal.

---

## 4. Calculation Rules & Invariants

1. **Bottom-Up Channel Budget**:
   $$\text{Channel Budget} = \sum_{\text{month}} \text{Monthly Allocation}$$
2. **Country Subtotal**:
   $$\text{Country Budget} = \sum_{\text{channel} \in \text{Country}} \text{Channel Budget}$$
3. **Grand Campaign Total**:
   $$\text{Grand Total} = \sum_{\text{country}} \text{Country Budget}$$
4. **Country Channel Share (%)**:
   $$\text{Channel Share} = \left(\frac{\text{Channel Budget}}{\text{Country Budget}}\right) \times 100$$
5. **Market Share (%)**:
   $$\text{Market Share} = \left(\frac{\text{Country Budget}}{\text{Grand Total}}\right) \times 100$$

---

## 5. Architectural Guardrails for Developers & Agents
* **Do Not Mutate DOM Directly for Calculated Values**: Always update the underlying state object and invoke `renderApp()` or targeted component re-renders to ensure totals, percentages, and overview cards stay in sync.
* **Preserve Cache Compatibility**: When changing `DATA` schema, provide backward-compatible defaults in `loadData()` so existing `localStorage` data does not trigger `NaN` or unhandled exceptions.
* **Zero Runtime Dependencies**: Keep all features in vanilla JavaScript. Do not import external CDN frameworks that break offline or zero-network usage.
