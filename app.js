/**
 * Steelcase Reactive Marketing Budget Planner & Visualizer
 * - State-Driven Reactive Architecture with LocalStorage Persistence
 * - Dynamic Country & Channel Addition / Removal
 * - Real-Time Auto-Sum & Percentage Calculations
 * - Top Overview KPI Deck (Grand Total, Country Spends, Platform Spends)
 * - Proportional Multi-Segment Allocation Visualizers
 * - Interactive Inline Budget & Month Editing
 * - Dynamic Dropdowns with "+ Add new option..."
 * - Multi-Scenario Presets & CSV/JSON Export
 */

// Global Application State
const APP_STATE = {
  currentUser: null,
  isEditMode: true, // Active by default for immediate planning
  deckFilter: 'all', // 'all' | 'countries' | 'platforms'
  activeMarketFilter: 'all',
  activeDropdownTarget: null,
  activeDropdownGroup: null
};

// Preset 1: Default Steelcase APAC Media Plan (July 2026 Flight)
const DEFAULT_MEDIA_PLAN = {
  meta: {
    navPath: "go.steelcase.com/july2026_mediaplan",
    title: "Media Plan (ID,CN,SG) July 2026",
    description: "Integrated paid media proposal targeting Corporate Real Estate (CRE), Workplace Strategy Leaders, Architects, Designers, and Enterprise Decision-Makers to drive downloads and pipeline for the Work Better Magazine.",
    dateBadge: "July 2026 Flight",
    scopeBadge: "Regional: APAC",
    pinCallout: "Recommend reallocating Pinterest budget to LinkedIn until GTM access is granted and the Pinterest pixel is installed and validated, as Pinterest's value in this plan depends primarily on its ability to build measurable retargeting audiences rather than direct lead generation.",
    footerCplNote: "* Note on Expected CPL: Projections are based on benchmark engagement rates, typical B2B conversion metrics, and initial landing page optimization assumptions for Steelcase APAC. Final CPL may vary based on live creative performance, audience saturation, and landing page conversion efficiency."
  },
  markets: [
    {
      id: "mkt_india",
      name: "India",
      code: "in",
      channels: [
        {
          id: "ch_in_1",
          platform: "LinkedIn LeadGen",
          objective: "Lead Generation",
          audienceType: "CRE, Workplace Leaders, Architects, Designers, HR",
          offer: "Work Better Magazine",
          budgetUSD: 20350,
          months: { july: 3850, august: 8250, september: 8250, october: 0, november: 0 }
        },
        {
          id: "ch_in_2",
          platform: "Pinterest",
          objective: "Awareness",
          audienceType: "Interests targeting",
          offer: "Work Better Magazine",
          budgetUSD: 5550,
          months: { july: 1050, august: 2250, september: 2250, october: 0, november: 0 }
        },
        {
          id: "ch_in_3",
          platform: "Meta / IG",
          objective: "Lead Generation",
          audienceType: "Lookalikes, Interest Audiences",
          offer: "Work Better Magazine",
          budgetUSD: 11100,
          months: { july: 2100, august: 4500, september: 4500, october: 0, november: 0 }
        }
      ]
    },
    {
      id: "mkt_singapore",
      name: "Singapore",
      code: "sg",
      channels: [
        {
          id: "ch_sg_1",
          platform: "LinkedIn LeadGen",
          objective: "Lead Generation",
          audienceType: "Workplace Leaders, CRE, Architects",
          offer: "Work Better Magazine",
          budgetUSD: 9000,
          months: { july: 1800, august: 3600, september: 3600, october: 0, november: 0 }
        },
        {
          id: "ch_sg_2",
          platform: "Meta / IG",
          objective: "Lead Generation",
          audienceType: "Lookalikes, Interest Audiences",
          offer: "Work Better Magazine",
          budgetUSD: 6000,
          months: { july: 1200, august: 2400, september: 2400, october: 0, november: 0 }
        }
      ]
    },
    {
      id: "mkt_china",
      name: "China",
      code: "cn",
      channels: [
        {
          id: "ch_cn_1",
          platform: "WeChat",
          objective: "Prospecting / Lead Generation",
          audienceType: "Website Visitors, CRM",
          offer: "Work Better Magazine",
          budgetUSD: 67000,
          months: { july: 7000, august: 15000, september: 15000, october: 15000, november: 15000 }
        }
      ]
    }
  ],
  dropdownOptions: {
    markets: ["India", "Singapore", "China", "Australia", "Japan", "United States", "United Kingdom", "Germany", "Hong Kong", "South Korea", "UAE"],
    platforms: ["LinkedIn LeadGen", "Meta / IG", "Pinterest", "WeChat", "Google Ads", "TikTok", "YouTube", "Programmatic"],
    priorities: ["High", "Medium", "Low-med", "Low"],
    offers: [
      "Work Better Magazine",
      "Work Better Magazine download",
      "Work Better Magazine download or webinar invite",
      "Work Better Magazine Download",
      "Follow Official Account + Work Better Magazine",
      "Webinar Registration",
      "Consultation Request"
    ]
  },
  strategyTables: {
    linkedin: [
      { market: "India", audience: "CRE / Workplace Leaders", priority: "High", purpose: "Reach people closest to office transformation, workplace planning, and fit-out decisions", targeting: "Titles: Workplace Director, Head of CRE, Facilities Director, Real Estate Manager, Workplace Experience Manager", exclusions: "Residential real estate agents, junior admin roles, students, entry-level profiles, freelancers", offer: "Work Better Magazine download", cpc: "USD 4–8", cpl: "USD 45–85", split: "35–40%" },
      { market: "India", audience: "Enterprise Decision Makers", priority: "High", purpose: "Capture senior enterprise contacts in large organizations", targeting: "Seniority: Director+, VP+, CXO, Head of Dept. Company size: 500+, 1,000+, 5,000+. Functions: Operations, HR, Real Estate, Facilities", exclusions: "Small businesses under 200 employees, students, entry level, freelancers, retail buyers", offer: "Work Better Magazine download", cpc: "USD 5–9", cpl: "USD 50–95", split: "25–30%" },
      { market: "India", audience: "A&D / Design Influencers", priority: "Medium", purpose: "Reach architects and designers who influence workplace projects", targeting: "Titles: Architect, Interior Designer, Design Director, Principal, Partner, Studio Director. Industries: Architecture & Planning, Design Services", exclusions: "Students, junior-only designers if CPL is high, hobby/interior decor profiles", offer: "Work Better Magazine download", cpc: "USD 4–7", cpl: "USD 40–80", split: "15–20%" },
      { market: "India", audience: "HR / People Leaders", priority: "Low-med", purpose: "Test workplace experience and employee-experience narrative", targeting: "Job titles/functions: HR Director, CHRO, People Experience, Employee Experience, Workplace Culture, Talent / People Leaders", exclusions: "Recruiters, junior HR, HR vendors, training providers", offer: "Work Better Magazine download", cpc: "USD 4–8", cpl: "USD 50–95", split: "5–10%" },
      { market: "India", audience: "Warm Retargeting / Engaged Audiences", priority: "High", purpose: "Convert already-exposed audiences into contacts", targeting: "Website visitors, LinkedIn page engagers, video viewers, previous lead form openers, CRM lists, event/webinar registrants", exclusions: "Existing Steelcase employees, invalid CRM contacts, already-converted contacts if applicable", offer: "Work Better Magazine download or webinar invite", cpc: "USD 3–6", cpl: "USD 20–50", split: "10–15%" },
      { market: "Singapore", audience: "CRE / Workplace Leaders", priority: "High", purpose: "Reach strongest B2B workplace decision audience in a small market", targeting: "Titles: Workplace Director, Head of Real Estate, Facilities Director, Corporate Real Estate Manager, Workplace Strategy Director", exclusions: "Residential agents, junior admin, students, job seekers, unrelated property sales", offer: "Work Better Magazine download", cpc: "USD 7–12", cpl: "USD 60–110", split: "35–40%" },
      { market: "Singapore", audience: "Enterprise Decision Makers", priority: "High", purpose: "Capture senior contacts from enterprise organizations", targeting: "Seniority: Manager+, Director+, VP+, CXO. Company size: 200+, 500+, 1,000+. Functions: Operations, HR, Real Estate, Facilities, Business Admin", exclusions: "Small companies, entry-level profiles, freelancers, students, retail buyers", offer: "Work Better Magazine download", cpc: "USD 8–14", cpl: "USD 70–130", split: "30–35%" },
      { market: "Singapore", audience: "A&D / Design Influencers", priority: "Medium", purpose: "Reach architects, designers, and project specifiers", targeting: "Job titles: Architect, Interior Designer, Design Director, Principal, Partner, Studio Director. Industries: Architecture & Planning, Construction", exclusions: "Students, junior designers if CPL is inefficient, decor-only profiles", offer: "Work Better Magazine download", cpc: "USD 6–11", cpl: "USD 65–120", split: "15%" },
      { market: "Singapore", audience: "HR / People Leaders", priority: "Low-med", purpose: "Test Work Better relevance to people / workplace experience leaders", targeting: "Job titles: HR Director, CHRO, People Experience, Employee Experience, Workplace Culture, Talent / People Leaders", exclusions: "Recruiters, junior HR, training vendors, HR software sellers", offer: "Work Better Magazine download", cpc: "USD 7–13", cpl: "USD 80–150", split: "5%" },
      { market: "Singapore", audience: "Warm Retargeting / Engaged Audiences", priority: "High", purpose: "Maximize conversion from small existing pool", targeting: "Website visitors, LinkedIn page engagers, video viewers, previous campaign engagers, CRM lists", exclusions: "Employees, invalid contacts, already-converted contacts if applicable", offer: "Work Better Magazine download or event/webinar invite", cpc: "USD 5–9", cpl: "USD 45–90", split: "15%" }
    ],
    meta: [
      { market: "India", audience: "Website Visitors Retargeting (30/90 Days)", priority: "High", purpose: "Convert known visitors into contacts", targeting: "All website visitors, key content page visitors, Work Better page visitors", exclusions: "Existing leads, employees, recent converters", offer: "Work Better Magazine Download", cpc: "USD 0.50–1.50", cpl: "USD 8–20", split: "25%" },
      { market: "India", audience: "CRM Lookalike 1%", priority: "High", purpose: "Find similar users to existing contacts/customers", targeting: "CRM upload, HubSpot contact lists, MQL lists, webinar registrants", exclusions: "Existing CRM contacts", offer: "Work Better Magazine Download", cpc: "USD 0.80–2.00", cpl: "USD 12–25", split: "20%" },
      { market: "India", audience: "Video Viewers Retargeting", priority: "High", purpose: "Convert engaged content consumers", targeting: "50%+, 75%+, 95% video viewers across campaign creative", exclusions: "Existing leads", offer: "Work Better Magazine Download", cpc: "USD 0.60–1.60", cpl: "USD 10–25", split: "15%" },
      { market: "India", audience: "Workplace Transformation Interests", priority: "Medium", purpose: "Reach workplace-interested professionals", targeting: "Office design, workplace strategy, commercial interiors, hybrid work, employee experience", exclusions: "Generic furniture shoppers, residential decor only", offer: "Work Better Magazine Download", cpc: "USD 0.80–2.50", cpl: "USD 20–40", split: "15%" },
      { market: "India", audience: "Architecture & Design Community", priority: "Medium", purpose: "Reach designers and specifiers", targeting: "Interior design, architecture, workplace design, commercial design publications", exclusions: "Residential renovation interests", offer: "Work Better Magazine Download", cpc: "USD 0.70–2.20", cpl: "USD 15–35", split: "15%" },
      { market: "India", audience: "Broad AI + Future of Work", priority: "Low", purpose: "Scale audience pool cheaply", targeting: "AI, future of work, technology leadership, workplace innovation", exclusions: "Existing warm audiences", offer: "Work Better Magazine Download", cpc: "USD 0.60–2.00", cpl: "USD 25–50", split: "10%" },
      { market: "Singapore", audience: "Website Visitors Retargeting (30/90 Days)", priority: "High", purpose: "Convert limited traffic pool into contacts", targeting: "Website visitors, Work Better page visitors, campaign landing page visitors", exclusions: "Existing leads, employees", offer: "Work Better Magazine Download", cpc: "USD 1.00–2.50", cpl: "USD 18–40", split: "30%" },
      { market: "Singapore", audience: "CRM Lookalike 1%", priority: "High", purpose: "Extend reach using known-quality profiles", targeting: "CRM, event attendees, webinar registrants, MQL lists", exclusions: "Existing CRM contacts", offer: "Work Better Magazine Download", cpc: "USD 1.50–3.00", cpl: "USD 20–45", split: "20%" },
      { market: "Singapore", audience: "Video Viewers Retargeting", priority: "Medium", purpose: "Convert engaged audiences into contacts", targeting: "50%+, 75%+, 95% video viewers across active creatives", exclusions: "Existing leads", offer: "Work Better Magazine Download", cpc: "USD 1.20–2.50", cpl: "USD 20–40", split: "15%" },
      { market: "Singapore", audience: "Workplace Transformation Interests", priority: "Medium", purpose: "Reach potential workplace decision influencers", targeting: "Hybrid work, workplace strategy, office design, employee experience", exclusions: "Residential shoppers, students", offer: "Work Better Magazine Download", cpc: "USD 1.50–3.50", cpl: "USD 30–60", split: "15%" },
      { market: "Singapore", audience: "Architecture & Design Community", priority: "Medium", purpose: "Reach architects and designers", targeting: "Interior design, architecture firms, workplace design publications", exclusions: "Residential DIY and home improvement interests", offer: "Work Better Magazine Download", cpc: "USD 1.20–3.00", cpl: "USD 25–55", split: "10%" },
      { market: "Singapore", audience: "Broad AI + Future of Work", priority: "Low", purpose: "Build audience for future retargeting", targeting: "AI, technology, business innovation, digital transformation", exclusions: "Non-business users", offer: "Work Better Magazine Download", cpc: "USD 1.20–3.50", cpl: "USD 35–70", split: "10%" }
    ],
    pinterest: [
      { market: "India", audience: "Workplace Design Inspiration", priority: "Medium", purpose: "Build audience of workplace-focused professionals", targeting: "Commercial interiors, workplace design, office design, hybrid workplace, workspace planning, workplace trends", exclusions: "Residential renovation, DIY hobbies, home decor only", offer: "Work Better Magazine", cpc: "USD 0.20–0.60", cpl: "USD 25–60", split: "25%" },
      { market: "India", audience: "Architecture & Design Community", priority: "Medium", purpose: "Reach architects and interior designers who influence projects", targeting: "Architecture, workplace design, commercial interiors, architecture publications, design software interests", exclusions: "Students, hobby designers, residential-only design interests", offer: "Work Better Magazine", cpc: "USD 0.25–0.70", cpl: "USD 20–50", split: "25%" },
      { market: "India", audience: "Corporate Office Inspiration", priority: "Medium", purpose: "Reach professionals researching office environments", targeting: "Office furniture, office layouts, hybrid workspaces, workplace innovation", exclusions: "Consumer home-office shoppers", offer: "Work Better Magazine", cpc: "USD 0.30–0.80", cpl: "USD 30–70", split: "20%" },
      { market: "India", audience: "AI + Future of Work", priority: "Low", purpose: "Build audience around the campaign theme", targeting: "AI workplace, future of work, workplace technology, innovation, productivity", exclusions: "Consumer AI hobbyists, gaming, crypto interests", offer: "Work Better Magazine", cpc: "USD 0.30–0.90", cpl: "USD 35–80", split: "15%" },
      { market: "India", audience: "Lookalike Audience (Website/CRM)", priority: "High", purpose: "Scale beyond existing audience", targeting: "Pinterest actalikes from website visitors, CRM uploads, engaged users", exclusions: "Existing leads, employees", offer: "Work Better Magazine", cpc: "USD 0.25–0.65", cpl: "USD 25–55", split: "15%" }
    ],
    wechat: [
      { market: "China", audience: "Office Building Geo-Fence", priority: "High", purpose: "Reach workplace decision-makers around target buildings", targeting: "Building-level location targeting: Target users within a defined radius of premium office buildings, CBDs, technology parks, and Grade A office towers", exclusions: "Unrelated residential locations", offer: "Follow Official Account + Work Better Magazine", cpc: "USD 0.20–0.80", cpl: "USD 10–25", split: "30%" },
      { market: "China", audience: "Retargeting / CRM Matching", priority: "High", purpose: "Convert existing warm contacts in China", targeting: "Official Account followers, CRM phone/email upload matching, past event/webinar attendees", exclusions: "Existing active accounts", offer: "Follow Official Account + Work Better Magazine", cpc: "USD 0.15–0.60", cpl: "USD 8–20", split: "25%" },
      { market: "China", audience: "Industry & Title Targeting", priority: "Medium", purpose: "Engage enterprise procurement and workplace leaders", targeting: "Industries: Technology, Commercial Real Estate, Architecture & Design, MNCs; Roles: Management, Admin, Facilities, HR", exclusions: "Retail buyers", offer: "Work Better Magazine", cpc: "USD 0.25–0.90", cpl: "USD 12–30", split: "25%" },
      { market: "China", audience: "Lookalike Expansion Audience", priority: "Medium", purpose: "Scale beyond known audiences", targeting: "Lookalike modelling: Similar profiles to followers, CRM contacts, event attendees", exclusions: "Existing fans", offer: "Work Better Magazine", cpc: "USD 0.30–1.00", cpl: "USD 15–30", split: "20%" }
    ]
  }
};

// Preset 2: Global Multi-Region Plan (US, UK, Germany, APAC)
const GLOBAL_MEDIA_PLAN = {
  meta: {
    navPath: "go.steelcase.com/global2026_expansion",
    title: "Global Enterprise Media Plan 2026",
    description: "Multi-market B2B demand generation across North America, EMEA, and Asia-Pacific driving enterprise workplace transformation pipeline.",
    dateBadge: "Q3–Q4 2026 Flight",
    scopeBadge: "Global: 5 Regions",
    pinCallout: "Focus paid media allocation heavily into LinkedIn InMail & Lead Gen forms in mature enterprise regions (US/UK) alongside search intent.",
    footerCplNote: "* Projected blended CPL varies from USD 35 in APAC to USD 110 in Tier-1 US enterprise metro markets."
  },
  markets: [
    {
      id: "mkt_us",
      name: "United States",
      code: "us",
      channels: [
        { id: "ch_us_1", platform: "LinkedIn LeadGen", objective: "Lead Generation", audienceType: "Fortune 500 CRE & Facilities VPs", offer: "Work Better Magazine", budgetUSD: 45000, months: { july: 9000, august: 12000, september: 12000, october: 6000, november: 6000 } },
        { id: "ch_us_2", platform: "Google Ads", objective: "High Intent Search", audienceType: "Office fitout & hybrid space keywords", offer: "Consultation Request", budgetUSD: 25000, months: { july: 5000, august: 5000, september: 5000, october: 5000, november: 5000 } },
        { id: "ch_us_3", platform: "Meta / IG", objective: "Retargeting", audienceType: "Website visitors 30d & CRM actalikes", offer: "Work Better Magazine", budgetUSD: 15000, months: { july: 3000, august: 4000, september: 4000, october: 2000, november: 2000 } }
      ]
    },
    {
      id: "mkt_uk",
      name: "United Kingdom",
      code: "uk",
      channels: [
        { id: "ch_uk_1", platform: "LinkedIn LeadGen", objective: "Lead Generation", audienceType: "London & Tech Hub Workplace Leaders", offer: "Work Better Magazine", budgetUSD: 20000, months: { july: 4000, august: 6000, september: 6000, october: 2000, november: 2000 } },
        { id: "ch_uk_2", platform: "Meta / IG", objective: "Awareness & Leads", audienceType: "Architects & Specifiers Community", offer: "Work Better Magazine", budgetUSD: 10000, months: { july: 2000, august: 3000, september: 3000, october: 1000, november: 1000 } }
      ]
    },
    {
      id: "mkt_in",
      name: "India",
      code: "in",
      channels: [
        { id: "ch_in_1", platform: "LinkedIn LeadGen", objective: "Lead Generation", audienceType: "CRE, Workplace Leaders, Architects", offer: "Work Better Magazine", budgetUSD: 20350, months: { july: 3850, august: 8250, september: 8250, october: 0, november: 0 } },
        { id: "ch_in_2", platform: "Meta / IG", objective: "Lead Generation", audienceType: "Lookalikes, Interest Audiences", offer: "Work Better Magazine", budgetUSD: 11100, months: { july: 2100, august: 4500, september: 4500, october: 0, november: 0 } }
      ]
    },
    {
      id: "mkt_cn",
      name: "China",
      code: "cn",
      channels: [
        { id: "ch_cn_1", platform: "WeChat", objective: "Prospecting / LeadGen", audienceType: "Grade A Office CBD Visitors", offer: "Work Better Magazine", budgetUSD: 50000, months: { july: 10000, august: 10000, september: 10000, october: 10000, november: 10000 } }
      ]
    }
  ],
  dropdownOptions: JSON.parse(JSON.stringify(DEFAULT_MEDIA_PLAN.dropdownOptions)),
  strategyTables: DEFAULT_MEDIA_PLAN.strategyTables
};

// Preset 3: Blank Canvas for Building Custom Plans
const BLANK_MEDIA_PLAN = {
  meta: {
    navPath: "go.steelcase.com/custom_planner",
    title: "New Marketing Budget Plan",
    description: "Custom multi-channel marketing budget allocation and flight schedule.",
    dateBadge: "Upcoming Flight",
    scopeBadge: "Multi-Market",
    pinCallout: "Configure your target regional markets, channel placements, and flight schedule.",
    footerCplNote: "* Set performance targets and benchmark metrics."
  },
  markets: [
    {
      id: "mkt_initial",
      name: "Primary Market",
      code: "pm",
      channels: [
        {
          id: "ch_init_1",
          platform: "LinkedIn LeadGen",
          objective: "Lead Generation",
          audienceType: "Enterprise Decision Makers",
          offer: "Work Better Magazine",
          budgetUSD: 10000,
          months: { july: 3000, august: 4000, september: 3000, october: 0, november: 0 }
        }
      ]
    }
  ],
  dropdownOptions: JSON.parse(JSON.stringify(DEFAULT_MEDIA_PLAN.dropdownOptions)),
  strategyTables: DEFAULT_MEDIA_PLAN.strategyTables
};

/* ==========================================================================
   Reactive Budget Store
   ========================================================================== */

const BudgetStore = {
  data: null,
  summary: {},

  init() {
    const saved = localStorage.getItem('steelcase_plan_state_v3');
    if (saved) {
      try {
        this.data = JSON.parse(saved);
      } catch (e) {
        this.data = JSON.parse(JSON.stringify(DEFAULT_MEDIA_PLAN));
      }
    } else {
      this.data = JSON.parse(JSON.stringify(DEFAULT_MEDIA_PLAN));
    }
    this.recalculate();
  },

  save() {
    this.recalculate();
    localStorage.setItem('steelcase_plan_state_v3', JSON.stringify(this.data));
  },

  reset() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_MEDIA_PLAN));
    localStorage.removeItem('steelcase_plan_state_v3');
    this.recalculate();
  },

  loadPreset(presetKey) {
    if (presetKey === 'global') {
      this.data = JSON.parse(JSON.stringify(GLOBAL_MEDIA_PLAN));
    } else if (presetKey === 'blank') {
      this.data = JSON.parse(JSON.stringify(BLANK_MEDIA_PLAN));
    } else {
      this.data = JSON.parse(JSON.stringify(DEFAULT_MEDIA_PLAN));
    }
    this.save();
    renderAll();
    showToast(`Loaded "${presetKey.toUpperCase()}" plan preset`);
  },

  recalculate() {
    let grandTotal = 0;
    const monthTotals = { july: 0, august: 0, september: 0, october: 0, november: 0 };
    const countryMap = {};
    const platformMap = {};

    this.data.markets.forEach(market => {
      let marketTotal = 0;

      market.channels.forEach(ch => {
        const b = Number(ch.budgetUSD) || 0;
        marketTotal += b;
        grandTotal += b;

        // Monthly totals
        if (ch.months) {
          Object.keys(monthTotals).forEach(m => {
            monthTotals[m] += Number(ch.months[m]) || 0;
          });
        }

        // Platform aggregation across all markets
        const plat = ch.platform || 'Unspecified';
        if (!platformMap[plat]) {
          platformMap[plat] = {
            total: 0,
            count: 0,
            marketNames: new Set()
          };
        }
        platformMap[plat].total += b;
        platformMap[plat].count += 1;
        platformMap[plat].marketNames.add(market.name);
      });

      market.totalBudget = marketTotal;

      // Channel % within its country
      market.channels.forEach(ch => {
        ch.budgetPercent = marketTotal > 0 ? ((Number(ch.budgetUSD) || 0) / marketTotal) * 100 : 0;
      });

      // Channel summary string (e.g. LinkedIn (55%) · Meta (30%))
      const channelSummaryParts = market.channels.map(ch => {
        const shortName = ch.platform.replace(' LeadGen', '').replace(' / IG', '');
        return `${shortName} (${ch.budgetPercent.toFixed(0)}%)`;
      });

      countryMap[market.name] = {
        name: market.name,
        code: market.code || market.name.toLowerCase().slice(0, 2),
        total: marketTotal,
        channelCount: market.channels.length,
        channelsSummary: channelSummaryParts.join(' · '),
        channels: market.channels
      };
    });

    this.summary = {
      grandTotal,
      monthTotals,
      totalChannelsCount: this.data.markets.reduce((acc, m) => acc + m.channels.length, 0),
      countryBreakdown: Object.values(countryMap).map(info => ({
        ...info,
        percent: grandTotal > 0 ? (info.total / grandTotal) * 100 : 0
      })).sort((a, b) => b.total - a.total),
      platformBreakdown: Object.entries(platformMap).map(([name, info]) => ({
        name,
        total: info.total,
        count: info.count,
        marketNames: Array.from(info.marketNames),
        percent: grandTotal > 0 ? (info.total / grandTotal) * 100 : 0
      })).sort((a, b) => b.total - a.total)
    };
  },

  // Market & Channel Mutations
  addCountry(name, initialPlatform = "LinkedIn LeadGen", initialBudget = 10000, flightMode = "3months") {
    const code = name.toLowerCase().slice(0, 2);
    const id = `mkt_${Date.now()}`;
    const budget = Number(initialBudget) || 10000;

    let months = { july: 0, august: 0, september: 0, october: 0, november: 0 };
    if (flightMode === "3months") {
      const split = Math.round(budget / 3);
      months.july = split;
      months.august = split;
      months.september = budget - (split * 2);
    } else if (flightMode === "5months") {
      const split = Math.round(budget / 5);
      months.july = split;
      months.august = split;
      months.september = split;
      months.october = split;
      months.november = budget - (split * 4);
    } else if (flightMode === "frontload") {
      months.july = Math.round(budget * 0.5);
      months.august = Math.round(budget * 0.25);
      months.september = budget - months.july - months.august;
    }

    const newMarket = {
      id,
      name,
      code,
      channels: [
        {
          id: `ch_${Date.now()}`,
          platform: initialPlatform,
          objective: "Lead Generation",
          audienceType: "Enterprise Decision Makers & Strategists",
          offer: "Work Better Magazine",
          budgetUSD: budget,
          months
        }
      ]
    };

    this.data.markets.push(newMarket);
    if (!this.data.dropdownOptions.markets.includes(name)) {
      this.data.dropdownOptions.markets.push(name);
    }

    this.save();
    renderAll();
    showToast(`Added ${name} with $${formatNumber(budget)} budget`);
  },

  deleteCountry(marketId) {
    const idx = this.data.markets.findIndex(m => m.id === marketId);
    if (idx !== -1) {
      const name = this.data.markets[idx].name;
      this.data.markets.splice(idx, 1);
      this.save();
      renderAll();
      showToast(`Removed country "${name}"`);
    }
  },

  addChannel(marketId, platform = "Meta / IG", budgetUSD = 5000) {
    const market = this.data.markets.find(m => m.id === marketId);
    if (!market) return;

    const b = Number(budgetUSD) || 5000;
    const split = Math.round(b / 3);

    const newChannel = {
      id: `ch_${Date.now()}`,
      platform,
      objective: "Lead Generation",
      audienceType: "Targeted Audience Segment",
      offer: "Work Better Magazine",
      budgetUSD: b,
      months: { july: split, august: split, september: b - (split * 2), october: 0, november: 0 }
    };

    market.channels.push(newChannel);
    this.save();
    renderAll();
    showToast(`Added ${platform} to ${market.name}`);
  },

  deleteChannel(marketId, channelId) {
    const market = this.data.markets.find(m => m.id === marketId);
    if (!market) return;

    if (market.channels.length <= 1) {
      if (confirm(`Deleting this last channel will also remove the market "${market.name}". Continue?`)) {
        this.deleteCountry(marketId);
      }
      return;
    }

    const idx = market.channels.findIndex(ch => ch.id === channelId);
    if (idx !== -1) {
      const chName = market.channels[idx].platform;
      market.channels.splice(idx, 1);
      this.save();
      renderAll();
      showToast(`Removed channel placement: ${chName}`);
    }
  },

  updateChannelField(marketId, channelId, fieldPath, rawValue) {
    const market = this.data.markets.find(m => m.id === marketId);
    if (!market) return;
    const channel = market.channels.find(ch => ch.id === channelId);
    if (!channel) return;

    if (fieldPath === 'budgetUSD') {
      const num = parseNumericInput(rawValue);
      const oldTotal = channel.budgetUSD || 1;
      channel.budgetUSD = num;

      // Proportionally adjust active months
      if (channel.months) {
        const ratio = oldTotal > 0 ? num / oldTotal : 1;
        let runningSum = 0;
        const keys = Object.keys(channel.months);
        keys.forEach((m, idx) => {
          if (idx === keys.length - 1) {
            channel.months[m] = Math.max(0, num - runningSum);
          } else {
            channel.months[m] = Math.round((channel.months[m] || 0) * ratio);
            runningSum += channel.months[m];
          }
        });
      }
    } else if (fieldPath.startsWith('months.')) {
      const monthKey = fieldPath.split('.')[1];
      const num = parseNumericInput(rawValue);
      if (!channel.months) channel.months = {};
      channel.months[monthKey] = num;

      // Auto-sum months to total channel budget
      let sum = 0;
      Object.keys(channel.months).forEach(m => {
        sum += Number(channel.months[m]) || 0;
      });
      channel.budgetUSD = sum;
    } else {
      channel[fieldPath] = rawValue;
    }

    this.save();
    renderAll();
  }
};

/* ==========================================================================
   Rendering Engines
   ========================================================================== */

function renderAll() {
  renderOverviewWidgets();
  renderMainBudgetTable();
  renderStrategyTables();
  renderMetaText();
}

/**
 * Top Executive Overview Deck:
 * 1. Grand Total Card
 * 2. Country Spend Cards (India, Singapore, China, + added countries)
 * 3. Platform Spend Cards (LinkedIn, Meta, WeChat, Pinterest, + added channels)
 * 4. Multi-Segment Distribution Bars
 */
function renderOverviewWidgets() {
  const { grandTotal, monthTotals, countryBreakdown, platformBreakdown, totalChannelsCount } = BudgetStore.summary;

  // 1. Update Global Header Badges
  const grandFormatted = `$${formatNumber(grandTotal)}`;
  const overviewGrandEl = document.getElementById('overviewGrandTotal');
  const sidebarSpendEl = document.getElementById('sidebarTotalSpend');
  const sideCountriesEl = document.getElementById('sidebarCountriesCount');
  const sideChannelsEl = document.getElementById('sidebarChannelsCount');
  const widgetCountryCountEl = document.getElementById('widgetCountryCount');
  const widgetPlatformCountEl = document.getElementById('widgetPlatformCount');

  if (overviewGrandEl) overviewGrandEl.textContent = grandFormatted;
  if (sidebarSpendEl) sidebarSpendEl.textContent = grandFormatted;
  if (sideCountriesEl) sideCountriesEl.textContent = `${countryBreakdown.length} Countries`;
  if (sideChannelsEl) sideChannelsEl.textContent = `${totalChannelsCount} Placements`;
  if (widgetCountryCountEl) widgetCountryCountEl.textContent = `${countryBreakdown.length} Markets`;
  if (widgetPlatformCountEl) widgetPlatformCountEl.textContent = `${platformBreakdown.length} Platforms`;

  // 2. Render Top KPI Cards Deck (Matching Screenshot Layout + Channel Spend)
  const kpiDeckEl = document.getElementById('overviewKpiDeck');
  if (kpiDeckEl) {
    kpiDeckEl.innerHTML = '';
    const filter = APP_STATE.deckFilter;

    // Card 1: Grand Total Budget Card
    if (filter === 'all' || filter === 'countries') {
      const totalCard = document.createElement('div');
      totalCard.className = 'kpi-card kpi-total-card';
      totalCard.innerHTML = `
        <div class="kpi-card-header">
          <span class="kpi-card-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            TOTAL CAMPAIGN BUDGET
          </span>
          <span class="kpi-card-type-badge">GLOBAL</span>
        </div>
        <div class="kpi-card-value">$${formatNumber(grandTotal)}</div>
        <div class="kpi-card-desc">Allocated across ${countryBreakdown.length} regional markets · ${totalChannelsCount} placements</div>
        <div class="kpi-card-bar-bg">
          <div class="kpi-card-bar-fill" style="width: 100%;"></div>
        </div>
      `;
      kpiDeckEl.appendChild(totalCard);
    }

    // Country Spend Cards
    if (filter === 'all' || filter === 'countries') {
      countryBreakdown.forEach(item => {
        const card = document.createElement('div');
        card.className = 'kpi-card';
        const codeClass = getCountryColorClass(item.code);

        card.innerHTML = `
          <div class="kpi-card-header">
            <span class="kpi-card-title">
              <span class="market-tag ${item.code} ${codeClass}" style="padding: 1px 6px; font-size: 10px;">${item.code.toUpperCase()}</span>
              ${item.name.toUpperCase()}
            </span>
            <span class="kpi-card-type-badge">${item.percent.toFixed(1)}%</span>
          </div>
          <div class="kpi-card-value">$${formatNumber(item.total)}</div>
          <div class="kpi-card-desc">${item.channelsSummary || `${item.channelCount} channel placement(s)`}</div>
          <div class="kpi-card-bar-bg">
            <div class="kpi-card-bar-fill ${codeClass}" style="width: ${Math.min(100, Math.max(3, item.percent))}%;"></div>
          </div>
        `;
        kpiDeckEl.appendChild(card);
      });
    }

    // Platform Spend Cards (LinkedIn, Meta, WeChat, Pinterest, Google, etc.)
    if (filter === 'all' || filter === 'platforms') {
      platformBreakdown.forEach(item => {
        const card = document.createElement('div');
        card.className = 'kpi-card';
        const platClass = getPlatformBadgeClass(item.name);
        const marketListStr = item.marketNames.slice(0, 3).join(', ');

        card.innerHTML = `
          <div class="kpi-card-header">
            <span class="kpi-card-title">
              <span class="platform-badge ${platClass}" style="padding: 1px 6px; font-size: 10px;">${item.name}</span>
            </span>
            <span class="kpi-card-type-badge">${item.percent.toFixed(1)}%</span>
          </div>
          <div class="kpi-card-value">$${formatNumber(item.total)}</div>
          <div class="kpi-card-desc">${item.percent.toFixed(1)}% of total · ${item.count} placement(s) in ${marketListStr}</div>
          <div class="kpi-card-bar-bg">
            <div class="kpi-card-bar-fill bar-${platClass}" style="width: ${Math.min(100, Math.max(3, item.percent))}%;"></div>
          </div>
        `;
        kpiDeckEl.appendChild(card);
      });
    }
  }

  // 3. Multi-Segment Continuous Proportional Bars
  renderMultiSegmentBar('countryMultiBar', countryBreakdown.map(c => ({
    name: c.name,
    percent: c.percent,
    className: getCountryColorClass(c.code)
  })));

  renderMultiSegmentBar('platformMultiBar', platformBreakdown.map(p => ({
    name: p.name,
    percent: p.percent,
    className: `bar-${getPlatformBadgeClass(p.name)}`
  })));

  const monthKeys = ['july', 'august', 'september', 'october', 'november'];
  renderMultiSegmentBar('monthlyMultiBar', monthKeys.map(m => ({
    name: m.charAt(0).toUpperCase() + m.slice(1),
    percent: grandTotal > 0 ? ((monthTotals[m] || 0) / grandTotal) * 100 : 0,
    className: 'bar-generic'
  })));

  // 4. Breakdown Lists
  // 4A. Country Breakdown List
  const countryListEl = document.getElementById('countryBreakdownList');
  if (countryListEl) {
    countryListEl.innerHTML = '';
    countryBreakdown.forEach(item => {
      const row = document.createElement('div');
      row.className = 'breakdown-row';
      const codeClass = getCountryColorClass(item.code);

      row.innerHTML = `
        <div class="breakdown-top-line">
          <div class="breakdown-entity">
            <span class="market-tag ${item.code} ${codeClass}">${item.name}</span>
            <span class="text-muted" style="font-size: 11px;">(${item.channelCount} placement${item.channelCount > 1 ? 's' : ''})</span>
          </div>
          <div class="breakdown-figures">
            <span class="breakdown-val">$${formatNumber(item.total)}</span>
            <span class="breakdown-pct">${item.percent.toFixed(1)}%</span>
          </div>
        </div>
        <div class="breakdown-bar-bg">
          <div class="breakdown-bar-fill ${codeClass}" style="width: ${Math.min(100, Math.max(2, item.percent))}%"></div>
        </div>
      `;
      countryListEl.appendChild(row);
    });
  }

  // 4B. Platform Breakdown List
  const platformListEl = document.getElementById('platformBreakdownList');
  if (platformListEl) {
    platformListEl.innerHTML = '';
    platformBreakdown.forEach(item => {
      const row = document.createElement('div');
      row.className = 'breakdown-row';
      const platClass = getPlatformBadgeClass(item.name);

      row.innerHTML = `
        <div class="breakdown-top-line">
          <div class="breakdown-entity">
            <span class="platform-badge ${platClass}">${item.name}</span>
          </div>
          <div class="breakdown-figures">
            <span class="breakdown-val">$${formatNumber(item.total)}</span>
            <span class="breakdown-pct">${item.percent.toFixed(1)}%</span>
          </div>
        </div>
        <div class="breakdown-bar-bg">
          <div class="breakdown-bar-fill bar-${platClass}" style="width: ${Math.min(100, Math.max(2, item.percent))}%"></div>
        </div>
      `;
      platformListEl.appendChild(row);
    });
  }

  // 4C. Monthly Flight Run-Rate
  const monthListEl = document.getElementById('monthlyBreakdownList');
  if (monthListEl) {
    monthListEl.innerHTML = '';
    monthKeys.forEach(m => {
      const val = monthTotals[m] || 0;
      const pct = grandTotal > 0 ? (val / grandTotal) * 100 : 0;
      const label = m.charAt(0).toUpperCase() + m.slice(1);

      const row = document.createElement('div');
      row.className = 'breakdown-row';
      row.innerHTML = `
        <div class="breakdown-top-line">
          <span style="font-weight: 600; font-size: 12.5px;">${label}</span>
          <div class="breakdown-figures">
            <span class="breakdown-val font-mono">$${formatNumber(val)}</span>
            <span class="breakdown-pct">${pct.toFixed(1)}%</span>
          </div>
        </div>
        <div class="breakdown-bar-bg">
          <div class="breakdown-bar-fill" style="background: var(--primary); width: ${Math.min(100, Math.max(val > 0 ? 3 : 0, pct))}%"></div>
        </div>
      `;
      monthListEl.appendChild(row);
    });
  }
}

function renderMultiSegmentBar(containerId, segments) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  segments.forEach(seg => {
    if (seg.percent <= 0) return;
    const span = document.createElement('div');
    span.className = `segment-item ${seg.className}`;
    span.style.width = `${seg.percent}%`;
    span.title = `${seg.name}: ${seg.percent.toFixed(1)}%`;
    container.appendChild(span);
  });
}

/**
 * Budget Breakdown V2 Main Table Rendering
 */
function renderMainBudgetTable() {
  const tbody = document.getElementById('mainBudgetTableBody');
  const tfoot = document.getElementById('mainBudgetTableFoot');
  if (!tbody || !tfoot) return;

  tbody.innerHTML = '';

  // Render Market Filter Pills
  renderMarketFilterPills();

  const filter = APP_STATE.activeMarketFilter;
  const filteredMarkets = BudgetStore.data.markets.filter(m => {
    if (filter === 'all') return true;
    return m.name.toLowerCase() === filter.toLowerCase();
  });

  filteredMarkets.forEach(market => {
    const rowCount = market.channels.length;
    const marketCodeClass = getCountryColorClass(market.code);

    market.channels.forEach((channel, idx) => {
      const tr = document.createElement('tr');
      const isFirstRow = idx === 0;
      const isLastRow = idx === rowCount - 1;
      if (isLastRow) tr.classList.add('border-group-end');

      let html = '';

      // Spanned Market Cell
      if (isFirstRow) {
        html += `
          <td rowspan="${rowCount}" class="cell-market font-bold">
            <div class="market-cell-content">
              <span class="market-tag ${market.code} ${marketCodeClass} dropdown-trigger" data-market-id="${market.id}" data-dropdown-group="markets" title="Click to rename or change market">
                ${market.name}
              </span>
              <span class="market-subtotal-badge">
                Subtotal: $${formatNumber(market.totalBudget)}
              </span>
              <div class="market-actions-wrap" style="display: flex; gap: 6px; align-items: center; margin-top: 6px;">
                <button type="button" class="btn-add-channel" data-action="add-channel" data-market-id="${market.id}" title="Add another channel placement to ${market.name}">
                  + Channel
                </button>
                <button type="button" class="btn-delete-market" data-action="delete-market" data-market-id="${market.id}" title="Delete entire ${market.name} market section">
                  Delete
                </button>
              </div>
            </div>
          </td>
        `;
      }

      // Channel details
      const platClass = getPlatformBadgeClass(channel.platform);

      html += `
        <td>
          <span class="platform-badge ${platClass} dropdown-trigger" data-market-id="${market.id}" data-channel-id="${channel.id}" data-field="platform" data-dropdown-group="platforms" title="Click to change platform">
            ${channel.platform}
          </span>
        </td>
        <td class="editable-field" data-market-id="${market.id}" data-channel-id="${channel.id}" data-field="objective" title="Click to edit campaign objective">
          ${channel.objective || 'Lead Generation'}
        </td>
        <td class="audience-desc editable-field" data-market-id="${market.id}" data-channel-id="${channel.id}" data-field="audienceType" title="Click to edit target audience criteria">
          ${channel.audienceType || 'Target Audience Segment'}
        </td>
        <td>
          <span class="offer-tag dropdown-trigger" data-market-id="${market.id}" data-channel-id="${channel.id}" data-field="offer" data-dropdown-group="offers" title="Click to change offer / CTA">
            ${channel.offer || 'Work Better Magazine'}
          </span>
        </td>
        <td class="text-right font-mono font-semibold" style="color: var(--primary);">
          ${channel.budgetPercent.toFixed(0)}%
        </td>
        <td class="text-right font-mono font-bold budget-input-cell" data-market-id="${market.id}" data-channel-id="${channel.id}" data-field="budgetUSD" title="Click to edit total channel budget">
          $${formatNumber(channel.budgetUSD)}
        </td>
        <td class="text-right font-mono budget-input-cell" data-market-id="${market.id}" data-channel-id="${channel.id}" data-field="months.july" title="Click to edit July flight budget">
          $${formatNumber(channel.months ? channel.months.july : 0)}
        </td>
        <td class="text-right font-mono budget-input-cell" data-market-id="${market.id}" data-channel-id="${channel.id}" data-field="months.august" title="Click to edit August flight budget">
          $${formatNumber(channel.months ? channel.months.august : 0)}
        </td>
        <td class="text-right font-mono budget-input-cell" data-market-id="${market.id}" data-channel-id="${channel.id}" data-field="months.september" title="Click to edit September flight budget">
          $${formatNumber(channel.months ? channel.months.september : 0)}
        </td>
        <td class="text-right font-mono budget-input-cell ${channel.months && channel.months.october > 0 ? '' : 'text-muted'}" data-market-id="${market.id}" data-channel-id="${channel.id}" data-field="months.october" title="Click to edit October flight budget">
          $${formatNumber(channel.months ? channel.months.october : 0)}
        </td>
        <td class="text-right font-mono budget-input-cell ${channel.months && channel.months.november > 0 ? '' : 'text-muted'}" data-market-id="${market.id}" data-channel-id="${channel.id}" data-field="months.november" title="Click to edit November flight budget">
          $${formatNumber(channel.months ? channel.months.november : 0)}
        </td>
        <td class="table-action-col text-center">
          <button type="button" class="btn-delete-row" data-action="delete-channel" data-market-id="${market.id}" data-channel-id="${channel.id}" title="Remove this placement row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      `;

      tr.innerHTML = html;
      tbody.appendChild(tr);
    });
  });

  // Table Footer: Program Totals
  const { grandTotal, monthTotals } = BudgetStore.summary;
  tfoot.innerHTML = `
    <tr class="total-row">
      <td colspan="5" class="font-bold">Total Program Spend</td>
      <td class="text-right font-mono font-bold">100%</td>
      <td class="text-right font-mono font-bold text-accent">$${formatNumber(grandTotal)}</td>
      <td class="text-right font-mono font-bold">$${formatNumber(monthTotals.july)}</td>
      <td class="text-right font-mono font-bold">$${formatNumber(monthTotals.august)}</td>
      <td class="text-right font-mono font-bold">$${formatNumber(monthTotals.september)}</td>
      <td class="text-right font-mono font-bold">$${formatNumber(monthTotals.october)}</td>
      <td class="text-right font-mono font-bold">$${formatNumber(monthTotals.november)}</td>
      <td class="table-action-col"></td>
    </tr>
  `;

  attachBudgetTableListeners();
}

function renderMarketFilterPills() {
  const container = document.getElementById('marketFilterPills');
  if (!container) return;
  container.innerHTML = '';

  const markets = BudgetStore.data.markets;

  const allBtn = document.createElement('button');
  allBtn.className = `filter-pill ${APP_STATE.activeMarketFilter === 'all' ? 'active' : ''}`;
  allBtn.textContent = `All Markets (${markets.length})`;
  allBtn.addEventListener('click', () => {
    APP_STATE.activeMarketFilter = 'all';
    renderMainBudgetTable();
  });
  container.appendChild(allBtn);

  markets.forEach(m => {
    const btn = document.createElement('button');
    btn.className = `filter-pill ${APP_STATE.activeMarketFilter === m.name ? 'active' : ''}`;
    btn.textContent = `${m.name} ($${formatNumber(m.totalBudget)})`;
    btn.addEventListener('click', () => {
      APP_STATE.activeMarketFilter = m.name;
      renderMainBudgetTable();
    });
    container.appendChild(btn);
  });
}

function renderStrategyTables() {
  const tables = BudgetStore.data.strategyTables;
  if (!tables) return;

  renderSingleStrategyTable('strategyBodyLinkedIn', tables.linkedin, 'linkedin');
  renderSingleStrategyTable('strategyBodyMeta', tables.meta, 'meta');
  renderSingleStrategyTable('strategyBodyPinterest', tables.pinterest, 'pinterest');
  renderSingleStrategyTable('strategyBodyWeChat', tables.wechat, 'wechat');
}

function renderSingleStrategyTable(tbodyId, rows, tableKey) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody || !rows) return;

  tbody.innerHTML = '';
  rows.forEach((row, idx) => {
    const tr = document.createElement('tr');
    if (idx === rows.length - 1) tr.classList.add('border-group-end');

    const mktClass = getCountryColorClass(row.market ? row.market.toLowerCase().slice(0, 2) : 'in');
    const prioClass = (row.priority || 'medium').toLowerCase();

    tr.innerHTML = `
      <td class="cell-market font-bold">
        <span class="market-tag ${mktClass} dropdown-trigger" data-strategy-table="${tableKey}" data-strategy-idx="${idx}" data-field="market" data-dropdown-group="markets">
          ${row.market}
        </span>
      </td>
      <td class="font-semibold editable-field" data-strategy-table="${tableKey}" data-strategy-idx="${idx}" data-field="audience">
        ${row.audience}
      </td>
      <td>
        <span class="priority-badge ${prioClass} dropdown-trigger" data-strategy-table="${tableKey}" data-strategy-idx="${idx}" data-field="priority" data-dropdown-group="priorities">
          ${row.priority}
        </span>
      </td>
      <td class="editable-field" data-strategy-table="${tableKey}" data-strategy-idx="${idx}" data-field="purpose">
        ${row.purpose}
      </td>
      <td class="detail-cell editable-field" data-strategy-table="${tableKey}" data-strategy-idx="${idx}" data-field="targeting">
        ${row.targeting}
      </td>
      <td class="detail-cell text-muted editable-field" data-strategy-table="${tableKey}" data-strategy-idx="${idx}" data-field="exclusions">
        ${row.exclusions}
      </td>
      <td>
        <span class="offer-tag dropdown-trigger" data-strategy-table="${tableKey}" data-strategy-idx="${idx}" data-field="offer" data-dropdown-group="offers">
          ${row.offer}
        </span>
      </td>
      <td class="font-mono editable-field" data-strategy-table="${tableKey}" data-strategy-idx="${idx}" data-field="cpc">
        ${row.cpc}
      </td>
      <td class="font-mono font-bold text-accent editable-field" data-strategy-table="${tableKey}" data-strategy-idx="${idx}" data-field="cpl">
        ${row.cpl}
      </td>
      <td class="text-right font-mono font-semibold editable-field" data-strategy-table="${tableKey}" data-strategy-idx="${idx}" data-field="split">
        ${row.split}
      </td>
    `;

    tbody.appendChild(tr);
  });
}

function renderMetaText() {
  const meta = BudgetStore.data.meta;
  if (!meta) return;

  const titleEl = document.getElementById('documentTitle');
  const descEl = document.getElementById('documentDesc');
  const pathEl = document.getElementById('navPathDisplay');
  const pinCalloutEl = document.getElementById('pinStrategicCallout');
  const cplNoteEl = document.getElementById('footerCplNote');

  if (titleEl && meta.title) titleEl.textContent = meta.title;
  if (descEl && meta.description) descEl.textContent = meta.description;
  if (pathEl && meta.navPath) pathEl.textContent = meta.navPath;
  if (pinCalloutEl && meta.pinCallout) pinCalloutEl.textContent = meta.pinCallout;
  if (cplNoteEl && meta.footerCplNote) cplNoteEl.textContent = meta.footerCplNote;
}

/* ==========================================================================
   Interactive Event Listeners
   ========================================================================== */

function attachBudgetTableListeners() {
  // 1. Action buttons (+ Channel, Delete Market, Delete Channel)
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.getAttribute('data-action');
      const marketId = btn.getAttribute('data-market-id');
      const channelId = btn.getAttribute('data-channel-id');

      if (action === 'add-channel') {
        BudgetStore.addChannel(marketId);
      } else if (action === 'delete-market') {
        if (confirm('Delete this country and all its channels from the plan?')) {
          BudgetStore.deleteCountry(marketId);
        }
      } else if (action === 'delete-channel') {
        BudgetStore.deleteChannel(marketId, channelId);
      }
    });
  });

  // 2. Numeric Budget & Monthly Input Cells
  document.querySelectorAll('.budget-input-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      if (!APP_STATE.isEditMode) return;
      if (cell.isContentEditable) return;

      const marketId = cell.getAttribute('data-market-id');
      const channelId = cell.getAttribute('data-channel-id');
      const field = cell.getAttribute('data-field');

      cell.contentEditable = 'true';
      cell.focus();

      // Clean formatted currency for typing
      const rawText = cell.textContent.replace(/[$,]/g, '').trim();
      cell.textContent = rawText;

      const range = document.createRange();
      range.selectNodeContents(cell);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);

      function commit() {
        cell.contentEditable = 'false';
        const newVal = cell.textContent.trim();
        BudgetStore.updateChannelField(marketId, channelId, field, newVal);
        cell.removeEventListener('blur', commit);
        cell.removeEventListener('keydown', onKey);
      }

      function onKey(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          commit();
        } else if (e.key === 'Escape') {
          cell.contentEditable = 'false';
          renderMainBudgetTable();
        }
      }

      cell.addEventListener('blur', commit);
      cell.addEventListener('keydown', onKey);
    });
  });

  // 3. Text field edits (Objective, Audience)
  document.querySelectorAll('.editable-field[data-channel-id]').forEach(cell => {
    cell.addEventListener('click', () => {
      if (!APP_STATE.isEditMode) return;
      if (cell.isContentEditable) return;

      const marketId = cell.getAttribute('data-market-id');
      const channelId = cell.getAttribute('data-channel-id');
      const field = cell.getAttribute('data-field');

      cell.contentEditable = 'true';
      cell.focus();

      function commit() {
        cell.contentEditable = 'false';
        const newVal = cell.textContent.trim();
        BudgetStore.updateChannelField(marketId, channelId, field, newVal);
        cell.removeEventListener('blur', commit);
        cell.removeEventListener('keydown', onKey);
      }

      function onKey(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          commit();
        } else if (e.key === 'Escape') {
          cell.contentEditable = 'false';
          renderMainBudgetTable();
        }
      }

      cell.addEventListener('blur', commit);
      cell.addEventListener('keydown', onKey);
    });
  });

  // 4. Strategy table field edits
  document.querySelectorAll('.editable-field[data-strategy-table]').forEach(cell => {
    cell.addEventListener('click', () => {
      if (!APP_STATE.isEditMode) return;
      if (cell.isContentEditable) return;

      const tableKey = cell.getAttribute('data-strategy-table');
      const idx = parseInt(cell.getAttribute('data-strategy-idx'), 10);
      const field = cell.getAttribute('data-field');

      cell.contentEditable = 'true';
      cell.focus();

      function commit() {
        cell.contentEditable = 'false';
        const newVal = cell.textContent.trim();
        BudgetStore.data.strategyTables[tableKey][idx][field] = newVal;
        BudgetStore.save();
        renderStrategyTables();
        cell.removeEventListener('blur', commit);
      }

      cell.addEventListener('blur', commit);
      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          commit();
        }
      });
    });
  });

  // 5. Dropdown triggers
  document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      if (!APP_STATE.isEditMode) return;
      e.stopPropagation();
      openDropdownMenu(trigger);
    });
  });
}

// Meta text fields (document title, description)
document.querySelectorAll('.editable-field[data-meta-field]').forEach(el => {
  el.addEventListener('click', () => {
    if (!APP_STATE.isEditMode) return;
    if (el.isContentEditable) return;

    const field = el.getAttribute('data-meta-field');
    el.contentEditable = 'true';
    el.focus();

    function commit() {
      el.contentEditable = 'false';
      BudgetStore.data.meta[field] = el.textContent.trim();
      BudgetStore.save();
      el.removeEventListener('blur', commit);
    }

    el.addEventListener('blur', commit);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && field !== 'description') {
        e.preventDefault();
        commit();
      }
    });
  });
});

/* ==========================================================================
   Custom Dropdown Popup Engine with "+ Add Item"
   ========================================================================== */

function openDropdownMenu(targetEl) {
  const popup = document.getElementById('customDropdownPopup');
  const titleEl = document.getElementById('dropdownGroupLabel');
  const container = document.getElementById('dropdownOptionsContainer');
  const addInput = document.getElementById('newDropdownOptionInput');

  const group = targetEl.getAttribute('data-dropdown-group');
  if (!group) return;

  APP_STATE.activeDropdownTarget = targetEl;
  APP_STATE.activeDropdownGroup = group;

  titleEl.textContent = `Select ${group.charAt(0).toUpperCase() + group.slice(1)}`;
  addInput.placeholder = `+ Add new ${group.slice(0, -1)}...`;
  addInput.value = '';

  const options = BudgetStore.data.dropdownOptions[group] || [];
  const currentValue = targetEl.textContent.trim().replace(/▾/g, '').trim();

  container.innerHTML = '';
  options.forEach(opt => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    if (opt.toLowerCase() === currentValue.toLowerCase()) {
      item.classList.add('selected');
    }

    item.innerHTML = `
      <span>${opt}</span>
      ${opt.toLowerCase() === currentValue.toLowerCase() ? '<span class="dropdown-item-check">✓</span>' : ''}
    `;

    item.addEventListener('click', () => {
      selectDropdownOption(opt);
      closeDropdownMenu();
    });

    container.appendChild(item);
  });

  // Positioning
  popup.style.display = 'flex';
  const rect = targetEl.getBoundingClientRect();
  const popupWidth = 290;
  const viewportWidth = window.innerWidth;

  let left = rect.left;
  if (left + popupWidth > viewportWidth - 20) {
    left = viewportWidth - popupWidth - 20;
  }

  let top = rect.bottom + 6;
  if (top + 300 > window.innerHeight) {
    top = Math.max(10, rect.top - 310);
  }

  popup.style.left = `${Math.max(10, left)}px`;
  popup.style.top = `${top}px`;
}

function selectDropdownOption(value) {
  const target = APP_STATE.activeDropdownTarget;
  if (!target) return;

  // 1. Budget Table Market Change
  const marketId = target.getAttribute('data-market-id');
  const channelId = target.getAttribute('data-channel-id');
  const field = target.getAttribute('data-field');

  if (marketId && !channelId) {
    const market = BudgetStore.data.markets.find(m => m.id === marketId);
    if (market) {
      market.name = value;
      market.code = value.toLowerCase().slice(0, 2);
      BudgetStore.save();
      renderAll();
      showToast(`Market updated to "${value}"`);
    }
    return;
  }

  // 2. Budget Table Channel Field Change (platform, offer)
  if (marketId && channelId && field) {
    BudgetStore.updateChannelField(marketId, channelId, field, value);
    return;
  }

  // 3. Strategy Table Field Change
  const stratTable = target.getAttribute('data-strategy-table');
  const stratIdx = target.getAttribute('data-strategy-idx');
  if (stratTable && stratIdx !== null && field) {
    const idx = parseInt(stratIdx, 10);
    BudgetStore.data.strategyTables[stratTable][idx][field] = value;
    BudgetStore.save();
    renderStrategyTables();
    showToast(`Updated to "${value}"`);
  }
}

function closeDropdownMenu() {
  const popup = document.getElementById('customDropdownPopup');
  if (popup) popup.style.display = 'none';
  APP_STATE.activeDropdownTarget = null;
  APP_STATE.activeDropdownGroup = null;
}

function initDropdownManager() {
  const closeBtn = document.getElementById('closeDropdownPopupBtn');
  const addBtn = document.getElementById('addDropdownOptionBtn');
  const addInput = document.getElementById('newDropdownOptionInput');
  const popup = document.getElementById('customDropdownPopup');

  if (closeBtn) closeBtn.addEventListener('click', closeDropdownMenu);

  document.addEventListener('click', (e) => {
    if (!popup || popup.style.display === 'none') return;
    if (popup.contains(e.target)) return;
    if (APP_STATE.activeDropdownTarget && APP_STATE.activeDropdownTarget.contains(e.target)) return;
    closeDropdownMenu();
  });

  function handleAddNew() {
    const val = addInput.value.trim();
    if (!val || !APP_STATE.activeDropdownGroup) return;

    if (!BudgetStore.data.dropdownOptions[APP_STATE.activeDropdownGroup].includes(val)) {
      BudgetStore.data.dropdownOptions[APP_STATE.activeDropdownGroup].push(val);
      BudgetStore.save();
    }

    selectDropdownOption(val);
    closeDropdownMenu();
    showToast(`Added option "${val}"`);
  }

  if (addBtn) addBtn.addEventListener('click', handleAddNew);
  if (addInput) {
    addInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddNew();
      }
    });
  }
}

/* ==========================================================================
   Add Country Modal Manager
   ========================================================================== */

function initAddCountryModal() {
  const modal = document.getElementById('addCountryModal');
  const openBtn1 = document.getElementById('openAddCountryModalBtn');
  const openBtn2 = document.getElementById('addCountryTableTopBtn');
  const openBtn3 = document.getElementById('addCountryTableBottomBtn');
  const closeBtn = document.getElementById('closeAddCountryModalBtn');
  const cancelBtn = document.getElementById('cancelAddCountryBtn');
  const form = document.getElementById('addCountryForm');
  const countryInput = document.getElementById('countryNameInput');
  const platformSelect = document.getElementById('initialPlatformSelect');
  const budgetInput = document.getElementById('initialBudgetInput');
  const flightSelect = document.getElementById('initialFlightSelect');

  function openModal() {
    modal.style.display = 'flex';
    countryInput.value = '';
    countryInput.focus();
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  if (openBtn1) openBtn1.addEventListener('click', openModal);
  if (openBtn2) openBtn2.addEventListener('click', openModal);
  if (openBtn3) openBtn3.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Quick suggestion chips
  document.querySelectorAll('.quick-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.getAttribute('data-val');
      if (val) {
        countryInput.value = val;
        budgetInput.focus();
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = countryInput.value.trim();
    const platform = platformSelect.value;
    const budget = Number(budgetInput.value) || 10000;
    const flightMode = flightSelect.value;

    if (!name) return;

    BudgetStore.addCountry(name, platform, budget, flightMode);
    closeModal();

    // Smooth scroll to table
    const tableEl = document.getElementById('budget-v2');
    if (tableEl) tableEl.scrollIntoView({ behavior: 'smooth' });
  });
}

/* ==========================================================================
   Preset Selector & Export Functions
   ========================================================================== */

function initPresetsAndExport() {
  // Preset selector
  const presetSelect = document.getElementById('presetPlanSelect');
  if (presetSelect) {
    presetSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (confirm(`Switch to preset: "${val.toUpperCase()}"? This will load a new plan configuration.`)) {
        BudgetStore.loadPreset(val);
      }
    });
  }

  // Reset button
  const resetBtn = document.getElementById('resetDataBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset entire media plan back to original Steelcase proposal numbers?')) {
        BudgetStore.reset();
        renderAll();
        if (presetSelect) presetSelect.value = 'steelcase';
        showToast('Restored default Steelcase media plan');
      }
    });
  }

  // JSON Export
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => {
      const payload = {
        exportedAt: new Date().toISOString(),
        exportedBy: APP_STATE.currentUser ? APP_STATE.currentUser.email : 'guest',
        plan: BudgetStore.data,
        summary: BudgetStore.summary
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `steelcase_budget_plan_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Plan exported as JSON');
    });
  }

  // CSV Export
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      let csv = "Market,Platform,Objective,Audience Type,Idea / Offer,Budget %,Budget (USD),July,August,September,October,November\n";

      BudgetStore.data.markets.forEach(m => {
        m.channels.forEach(ch => {
          const row = [
            `"${m.name}"`,
            `"${ch.platform}"`,
            `"${(ch.objective || '').replace(/"/g, '""')}"`,
            `"${(ch.audienceType || '').replace(/"/g, '""')}"`,
            `"${(ch.offer || '').replace(/"/g, '""')}"`,
            `"${ch.budgetPercent.toFixed(0)}%"`,
            ch.budgetUSD,
            ch.months.july || 0,
            ch.months.august || 0,
            ch.months.september || 0,
            ch.months.october || 0,
            ch.months.november || 0
          ];
          csv += row.join(",") + "\n";
        });
      });

      const { grandTotal, monthTotals } = BudgetStore.summary;
      csv += `\n"Total Program Spend","","","","",100%,${grandTotal},${monthTotals.july},${monthTotals.august},${monthTotals.september},${monthTotals.october},${monthTotals.november}\n`;

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `steelcase_budget_spreadsheet_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Spreadsheet exported as CSV');
    });
  }
}

/* ==========================================================================
   Deck Filter & Planning Mode Switches
   ========================================================================== */

function initDeckFilterTabs() {
  document.querySelectorAll('.deck-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.deck-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      APP_STATE.deckFilter = tab.getAttribute('data-deck-filter') || 'all';
      renderOverviewWidgets();
    });
  });

  // Mode switcher (Plan Mode vs Present View)
  const planBtn = document.getElementById('modePlanBtn');
  const presentBtn = document.getElementById('modePresentBtn');

  if (planBtn && presentBtn) {
    planBtn.addEventListener('click', () => {
      planBtn.classList.add('active');
      presentBtn.classList.remove('active');
      APP_STATE.isEditMode = true;
      document.body.classList.add('edit-mode-active');
      renderMainBudgetTable();
      showToast('Planning Mode enabled: Edit cells, add channels & countries');
    });

    presentBtn.addEventListener('click', () => {
      presentBtn.classList.add('active');
      planBtn.classList.remove('active');
      APP_STATE.isEditMode = false;
      document.body.classList.remove('edit-mode-active');
      closeDropdownMenu();
      renderMainBudgetTable();
      showToast('Presentation View enabled (Clean view)');
    });
  }
}

/* ==========================================================================
   Authentication System
   ========================================================================== */

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getUsers() {
  const users = localStorage.getItem('steelcase_auth_users');
  return users ? JSON.parse(users) : {};
}

function saveUsers(users) {
  localStorage.setItem('steelcase_auth_users', JSON.stringify(users));
}

async function seedDefaultUserIfEmpty() {
  const users = getUsers();
  if (Object.keys(users).length === 0) {
    const adminHash = await hashPassword('admin123');
    users['admin@steelcase.com'] = {
      email: 'admin@steelcase.com',
      passwordHash: adminHash,
      createdAt: new Date().toISOString()
    };
    saveUsers(users);
  }
}

function initAuthManager() {
  seedDefaultUserIfEmpty();

  const authModal = document.getElementById('authModal');
  const openAuthModalBtn = document.getElementById('openAuthModalBtn');
  const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
  const authForm = document.getElementById('authForm');
  const authEmail = document.getElementById('authEmail');
  const authPassword = document.getElementById('authPassword');
  const tabSignIn = document.getElementById('tabSignIn');
  const tabRegister = document.getElementById('tabRegister');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const authErrorMsg = document.getElementById('authErrorMsg');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const passwordHint = document.getElementById('passwordHint');
  const authBar = document.getElementById('authBar');
  const userEmailDisplay = document.getElementById('userEmailDisplay');
  const logoutBtn = document.getElementById('logoutBtn');

  let authMode = 'signin';

  // Restore saved session if exists
  const savedSession = localStorage.getItem('steelcase_auth_session');
  if (savedSession) {
    try {
      APP_STATE.currentUser = JSON.parse(savedSession);
      updateAuthUI();
    } catch (e) {
      APP_STATE.currentUser = null;
    }
  }

  function openModal() {
    authModal.style.display = 'flex';
    authErrorMsg.style.display = 'none';
    authEmail.focus();
  }

  function closeModal() {
    authModal.style.display = 'none';
  }

  if (openAuthModalBtn) openAuthModalBtn.addEventListener('click', openModal);
  if (closeAuthModalBtn) closeAuthModalBtn.addEventListener('click', closeModal);

  if (tabSignIn && tabRegister) {
    tabSignIn.addEventListener('click', () => {
      authMode = 'signin';
      tabSignIn.classList.add('active');
      tabRegister.classList.remove('active');
      authSubmitBtn.textContent = 'Sign In';
      modalSubtitle.textContent = 'Sign in to save and manage multiple plan variations.';
      if (passwordHint) passwordHint.style.display = 'none';
      authErrorMsg.style.display = 'none';
    });

    tabRegister.addEventListener('click', () => {
      authMode = 'register';
      tabRegister.classList.add('active');
      tabSignIn.classList.remove('active');
      authSubmitBtn.textContent = 'Create Account';
      modalSubtitle.textContent = 'Create an account to save custom budget scenarios.';
      if (passwordHint) passwordHint.style.display = 'block';
      authErrorMsg.style.display = 'none';
    });
  }

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = authEmail.value.trim().toLowerCase();
    const password = authPassword.value;

    if (!email || !password) {
      showAuthError('Please enter both email and password.');
      return;
    }

    const users = getUsers();
    const hash = await hashPassword(password);

    if (authMode === 'register') {
      if (password.length < 6) {
        showAuthError('Password must be at least 6 characters long.');
        return;
      }
      if (users[email]) {
        showAuthError('An account with this email already exists. Please sign in.');
        return;
      }

      users[email] = { email, passwordHash: hash, createdAt: new Date().toISOString() };
      saveUsers(users);
      APP_STATE.currentUser = { email };
      localStorage.setItem('steelcase_auth_session', JSON.stringify({ email }));
      closeModal();
      updateAuthUI();
      showToast(`Welcome, ${email}! Account created.`);
    } else {
      const user = users[email];
      if (!user || user.passwordHash !== hash) {
        showAuthError('Invalid email or password. Default: admin@steelcase.com / admin123');
        return;
      }

      APP_STATE.currentUser = { email };
      localStorage.setItem('steelcase_auth_session', JSON.stringify({ email }));
      closeModal();
      updateAuthUI();
      showToast(`Signed in as ${email}`);
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      APP_STATE.currentUser = null;
      localStorage.removeItem('steelcase_auth_session');
      updateAuthUI();
      showToast('Signed out');
    });
  }

  function showAuthError(msg) {
    if (!authErrorMsg) return;
    authErrorMsg.textContent = msg;
    authErrorMsg.style.display = 'block';
  }

  function updateAuthUI() {
    if (APP_STATE.currentUser) {
      if (openAuthModalBtn) openAuthModalBtn.style.display = 'none';
      if (authBar) authBar.style.display = 'inline-flex';
      if (userEmailDisplay) userEmailDisplay.textContent = APP_STATE.currentUser.email;
    } else {
      if (openAuthModalBtn) openAuthModalBtn.style.display = 'inline-flex';
      if (authBar) authBar.style.display = 'none';
    }
  }
}

/* ==========================================================================
   Utilities
   ========================================================================== */

function formatNumber(num) {
  const n = Number(num) || 0;
  return n.toLocaleString('en-US');
}

function parseNumericInput(val) {
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : Math.round(n);
}

function getCountryColorClass(code) {
  const c = String(code).toLowerCase();
  if (c === 'in') return 'bar-in';
  if (c === 'sg') return 'bar-sg';
  if (c === 'cn') return 'bar-cn';
  if (c === 'us') return 'bar-linkedin';
  if (c === 'uk') return 'bar-meta';
  return 'bar-generic';
}

function getPlatformBadgeClass(name) {
  const n = String(name).toLowerCase();
  if (n.includes('linkedin')) return 'linkedin';
  if (n.includes('meta') || n.includes('ig') || n.includes('instagram')) return 'meta';
  if (n.includes('pinterest')) return 'pinterest';
  if (n.includes('wechat')) return 'wechat';
  if (n.includes('google')) return 'google';
  if (n.includes('tiktok')) return 'tiktok';
  if (n.includes('youtube')) return 'youtube';
  if (n.includes('programmatic')) return 'programmatic';
  return 'generic';
}

function showToast(message) {
  const toast = document.getElementById('saveToast');
  const textEl = document.getElementById('saveToastText');
  if (!toast || !textEl) return;

  textEl.textContent = message;
  toast.style.display = 'flex';

  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.style.display = 'none';
  }, 2400);
}

function initThemeAndNav() {
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  const savedTheme = localStorage.getItem('steelcase_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'night' || (!savedTheme && prefersDark)) {
    body.classList.remove('theme-light');
    body.classList.add('theme-night');
  } else {
    body.classList.remove('theme-night');
    body.classList.add('theme-light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      if (body.classList.contains('theme-night')) {
        body.classList.remove('theme-night');
        body.classList.add('theme-light');
        localStorage.setItem('steelcase_theme', 'light');
      } else {
        body.classList.remove('theme-light');
        body.classList.add('theme-night');
        localStorage.setItem('steelcase_theme', 'night');
      }
    });
  }

  const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }

  // Outline scroll spy
  const sections = document.querySelectorAll('section[id]');
  const outlineLinks = document.querySelectorAll('.outline-link');
  if (sections.length && outlineLinks.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          outlineLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
    sections.forEach(sec => observer.observe(sec));
  }
}

// Global Application Startup
document.addEventListener('DOMContentLoaded', () => {
  initThemeAndNav();
  BudgetStore.init();
  renderAll();
  initDropdownManager();
  initAddCountryModal();
  initPresetsAndExport();
  initDeckFilterTabs();
  initAuthManager();
});
