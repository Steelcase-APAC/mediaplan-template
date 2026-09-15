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

// All 12 Calendar Months Configuration
const ALL_MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

const MONTH_SHORT_LABELS = {
  january: 'Jan', february: 'Feb', march: 'Mar', april: 'Apr',
  may: 'May', june: 'Jun', july: 'Jul', august: 'Aug',
  september: 'Sep', october: 'Oct', november: 'Nov', december: 'Dec'
};

const MONTH_PRESETS = {
  all12: ALL_MONTHS,
  q1: ['january', 'february', 'march'],
  q2: ['april', 'may', 'june'],
  q3: ['july', 'august', 'september'],
  q4: ['october', 'november', 'december'],
  h1: ['january', 'february', 'march', 'april', 'may', 'june'],
  h2: ['july', 'august', 'september', 'october', 'november', 'december'],
  january: ['january'],
  february: ['february'],
  march: ['march'],
  april: ['april'],
  may: ['may'],
  june: ['june'],
  july: ['july'],
  august: ['august'],
  september: ['september'],
  october: ['october'],
  november: ['november'],
  december: ['december']
};

function getStratKey(platformName) {
  const p = String(platformName || '').toLowerCase();
  if (p.includes('linkedin')) return 'linkedin';
  if (p.includes('meta') || p.includes('ig') || p.includes('instagram')) return 'meta';
  if (p.includes('pinterest')) return 'pinterest';
  if (p.includes('wechat')) return 'wechat';
  if (p.includes('youtube')) return 'youtube';
  return p.replace(/[^a-z0-9]/g, '_');
}

function getPlatformDisplayName(stratKey) {
  if (stratKey === 'linkedin') return 'LinkedIn';
  if (stratKey === 'meta') return 'Meta | Instagram';
  if (stratKey === 'pinterest') return 'Pinterest';
  if (stratKey === 'wechat') return 'WeChat';
  if (stratKey === 'youtube') return 'YouTube';
  if (stratKey === 'google_ads') return 'Google Ads';
  if (stratKey === 'tiktok') return 'TikTok';
  return String(stratKey).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getCountryCode(val) {
  if (!val) return 'generic';
  const str = String(val).toLowerCase().trim();
  if (str === 'in' || str.includes('india')) return 'in';
  if (str === 'sg' || str.includes('singapore')) return 'sg';
  if (str === 'my' || str.includes('malaysia')) return 'my';
  if (str === 'id' || str.includes('indonesia')) return 'id';
  if (str === 'th' || str.includes('thailand')) return 'th';
  if (str === 'vn' || str.includes('vietnam')) return 'vn';
  if (str === 'ph' || str.includes('philippine')) return 'ph';
  if (str === 'cn' || str.includes('china')) return 'cn';
  if (str === 'us' || str.includes('united states') || str.includes('usa') || str.includes('america')) return 'us';
  if (str === 'uk' || str.includes('united kingdom') || str.includes('britain') || str.includes('england')) return 'uk';
  if (str === 'au' || str.includes('australia')) return 'au';
  if (str === 'jp' || str.includes('japan')) return 'jp';
  if (str === 'de' || str.includes('germany')) return 'de';
  if (str === 'hk' || str.includes('hong kong')) return 'hk';
  if (str === 'kr' || str.includes('korea')) return 'kr';
  if (str === 'ae' || str.includes('uae') || str.includes('dubai')) return 'ae';
  return 'generic';
}

function getCountryColorClass(codeOrName) {
  return `bar-${getCountryCode(codeOrName)}`;
}

// Preset 1: Default Steelcase APAC Media Plan (July 2026 Flight)
const DEFAULT_MEDIA_PLAN = {
  meta: {
    navPath: "go.steelcase.com/july2026_mediaplan",
    title: "Media Plan (ID,CN,SG) July 2026",
    description: "Integrated paid media proposal targeting Corporate Real Estate (CRE), Workplace Strategy Leaders, Architects, Designers, and Enterprise Decision-Makers to drive downloads and pipeline for the Work Better Magazine.",
    heroBadgeStatus: "● Active Media Proposal",
    heroBadgeDate: "July 2026 Flight",
    heroBadgeScope: "Regional: APAC",
    dateBadge: "July 2026 Flight",
    scopeBadge: "Regional: APAC",
    stratTitle: "Channel Strategies & Tactical Audience Plans",
    stratDesc: "Configure targeting criteria, exclusions, audience priority, and expected CPL for each media platform. Add custom channels and audience line items at any time.",
    stratBadge1: "● Audience & CPL Strategy",
    stratBadge2: "Tactical Deep Dives",
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
    if (!this.data.deletedSections) this.data.deletedSections = [];
    if (!this.data.strategyTables) this.data.strategyTables = {};
    if (!this.data.markets) this.data.markets = [];
    if (!this.data.dropdownOptions) this.data.dropdownOptions = { markets: [], platforms: [], offers: [] };

    this.recalculate();
  },

  save() {
    this.recalculate();
    localStorage.setItem('steelcase_plan_state_v3', JSON.stringify(this.data));
    if (typeof FirestoreSyncManager !== 'undefined' && FirestoreSyncManager.pushUpdate) {
      FirestoreSyncManager.pushUpdate();
    }
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
    const monthTotals = {};
    ALL_MONTHS.forEach(m => { monthTotals[m] = 0; });
    const countryMap = {};
    const platformMap = {};

    this.data.markets.forEach(market => {
      let marketTotal = 0;

      market.channels.forEach(ch => {
        const b = Number(ch.budgetUSD) || 0;
        marketTotal += b;
        grandTotal += b;

        // Monthly totals across all 12 calendar months
        if (!ch.months) ch.months = {};
        ALL_MONTHS.forEach(m => {
          monthTotals[m] += Number(ch.months[m]) || 0;
        });

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
        code: getCountryCode(market.code || market.name),
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

  // Line Item & Market Mutations
  addLineItem({ country, channel, totalBudget, activeMonths, objective, audienceType, offer }) {
    const cleanCountry = (country || 'New Market').trim();
    const cleanChannel = (channel || 'LinkedIn LeadGen').trim();
    const totalB = Math.max(0, Math.round(Number(totalBudget) || 0));
    const cleanObjective = (objective || 'Lead Generation').trim();
    const cleanAudience = (audienceType || 'Enterprise Decision Makers & Strategists').trim();
    const cleanOffer = (offer || 'Work Better Magazine').trim();

    // 1. Resolve or create market
    let market = this.data.markets.find(m => m.name.toLowerCase() === cleanCountry.toLowerCase());
    if (!market) {
      const code = getCountryCode(cleanCountry);
      market = {
        id: `mkt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: cleanCountry,
        code,
        channels: []
      };
      this.data.markets.push(market);
    }

    // 2. Resolve active months across all 12 calendar months and evenly divide budget
    let validActiveMonths = (Array.isArray(activeMonths) && activeMonths.length > 0)
      ? activeMonths.filter(m => ALL_MONTHS.includes(m))
      : ['july', 'august', 'september'];

    if (validActiveMonths.length === 0) validActiveMonths = ['july', 'august', 'september'];

    const splitEach = Math.floor(totalB / validActiveMonths.length);
    const remainder = totalB - (splitEach * validActiveMonths.length);

    const months = {};
    ALL_MONTHS.forEach(m => { months[m] = 0; });
    validActiveMonths.forEach((m, idx) => {
      months[m] = splitEach + (idx === 0 ? remainder : 0);
    });

    // 3. Create channel placement
    const newChannel = {
      id: `ch_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      platform: cleanChannel,
      objective: cleanObjective,
      audienceType: cleanAudience,
      offer: cleanOffer,
      budgetUSD: totalB,
      activeMonths: [...validActiveMonths],
      months
    };

    market.channels.push(newChannel);

    // 4. Placeholder logic for bottom Channel Strategy section:
    // If the channel section does not exist yet at the bottom level, or if the country does not exist yet in that channel section, automatically add as a placeholder.
    // If the country or channel already exists, it will no longer add anything.
    const stratKey = getStratKey(cleanChannel);
    if (!this.data.strategyTables) this.data.strategyTables = {};
    if (this.data.deletedSections) {
      this.data.deletedSections = this.data.deletedSections.filter(k => k !== stratKey);
    }
    if (!this.data.strategyTables[stratKey]) {
      this.data.strategyTables[stratKey] = [];
    }

    const countryAlreadyExistsInStrategy = this.data.strategyTables[stratKey].some(
      r => (r.market || '').toLowerCase() === cleanCountry.toLowerCase()
    );

    if (!countryAlreadyExistsInStrategy) {
      const pLower = cleanChannel.toLowerCase();
      let cpcEstimate = "USD 4–8";
      let cplEstimate = "USD 45–85";
      if (pLower.includes('meta')) { cpcEstimate = "USD 0.80–2.00"; cplEstimate = "USD 12–25"; }
      else if (pLower.includes('pinterest')) { cpcEstimate = "USD 0.25–0.70"; cplEstimate = "USD 25–55"; }
      else if (pLower.includes('wechat')) { cpcEstimate = "USD 0.20–0.80"; cplEstimate = "USD 10–25"; }
      else if (pLower.includes('youtube')) { cpcEstimate = "CPV: USD 0.04–0.12"; cplEstimate = "USD 35–70"; }
      else if (pLower.includes('google')) { cpcEstimate = "USD 2.50–5.50"; cplEstimate = "USD 40–80"; }
      else if (pLower.includes('tiktok')) { cpcEstimate = "USD 0.50–1.20"; cplEstimate = "USD 20–45"; }

      this.data.strategyTables[stratKey].push({
        market: cleanCountry,
        audience: cleanAudience || `${cleanChannel} Target Audience`,
        priority: "High",
        purpose: cleanObjective ? `Drive ${cleanObjective} for ${cleanOffer || 'Work Better Magazine'}` : "Strategic audience engagement",
        targeting: cleanAudience || "Enterprise Decision Makers",
        exclusions: "Competitors, junior roles, non-business consumer queries",
        offer: cleanOffer || "Work Better Magazine download",
        cpc: cpcEstimate,
        cpl: cplEstimate,
        split: "100%"
      });
    }

    // 5. Ensure dropdown options have new country and platform
    if (!this.data.dropdownOptions.markets.includes(cleanCountry)) {
      this.data.dropdownOptions.markets.push(cleanCountry);
    }
    if (!this.data.dropdownOptions.platforms.includes(cleanChannel)) {
      this.data.dropdownOptions.platforms.push(cleanChannel);
    }

    this.save();
    renderAll();
    showToast(`Added line item: ${cleanCountry} · ${cleanChannel} ($${formatNumber(totalB)})`);
  },

  // Backwards compatibility wrappers
  addCountry(name, initialPlatform = "LinkedIn LeadGen", initialBudget = 10000, flightMode = "3months") {
    let activeMonths = ['july', 'august', 'september'];
    if (flightMode === "all12") activeMonths = [...ALL_MONTHS];
    this.addLineItem({
      country: name,
      channel: initialPlatform,
      totalBudget: initialBudget,
      activeMonths
    });
  },

  addChannel(marketId, platform = "Meta / IG", budgetUSD = 5000) {
    const market = this.data.markets.find(m => m.id === marketId);
    if (!market) return;
    this.addLineItem({
      country: market.name,
      channel: platform,
      totalBudget: budgetUSD,
      activeMonths: ['july', 'august', 'september']
    });
  },

  deleteCountry(marketId) {
    const idx = this.data.markets.findIndex(m => m.id === marketId);
    if (idx !== -1) {
      const name = this.data.markets[idx].name;
      // Clean strategy tables for this country
      if (this.data.strategyTables) {
        Object.keys(this.data.strategyTables).forEach(k => {
          if (Array.isArray(this.data.strategyTables[k])) {
            this.data.strategyTables[k] = this.data.strategyTables[k].filter(r => r.market !== name);
          }
        });
      }
      this.data.markets.splice(idx, 1);
      this.save();
      renderAll();
      showToast(`Removed country "${name}"`);
    }
  },

  executeDeleteChannel(marketId, channelId) {
    const market = this.data.markets.find(m => m.id === marketId);
    if (!market) return;

    if (market.channels.length <= 1) {
      this.deleteCountry(marketId);
      return;
    }

    const idx = market.channels.findIndex(ch => ch.id === channelId);
    if (idx !== -1) {
      const ch = market.channels[idx];
      const stratKey = getStratKey(ch.platform);

      // Clean up strategy table entry
      if (this.data.strategyTables && this.data.strategyTables[stratKey]) {
        this.data.strategyTables[stratKey] = this.data.strategyTables[stratKey].filter(
          r => r.channelId !== channelId && (r.market !== market.name || r.audience !== ch.audienceType)
        );
      }

      market.channels.splice(idx, 1);
      this.save();
      renderAll();
    }
  },

  deleteChannel(marketId, channelId) {
    const market = this.data.markets.find(m => m.id === marketId);
    if (!market) return;
    const channel = market.channels.find(ch => ch.id === channelId);
    if (!channel) return;

    const stratKey = getStratKey(channel.platform);
    const platformName = channel.platform;

    // Count how many placements of this platform remain across all markets
    let totalPlacements = 0;
    this.data.markets.forEach(m => {
      m.channels.forEach(c => {
        if (getStratKey(c.platform) === stratKey) {
          totalPlacements++;
        }
      });
    });

    const isLastPlacement = totalPlacements <= 1;

    if (isLastPlacement) {
      if (typeof openConfirmSectionDeleteModal === 'function') {
        openConfirmSectionDeleteModal({
          platformName,
          stratKey,
          marketId,
          channelId,
          marketName: market.name,
          isLastInMarket: market.channels.length <= 1,
          isDirectSectionDelete: false
        });
      } else {
        this.executeDeleteChannel(marketId, channelId);
        showToast(`Removed line item: ${platformName}`);
      }
    } else {
      this.executeDeleteChannel(marketId, channelId);
      showToast(`Removed line item: ${platformName}`);
    }
  },

  deleteChannelStrategySection(stratKey, platformName) {
    if (!this.data.deletedSections) this.data.deletedSections = [];
    if (!this.data.deletedSections.includes(stratKey)) {
      this.data.deletedSections.push(stratKey);
    }
    if (this.data.strategyTables && this.data.strategyTables[stratKey]) {
      this.data.strategyTables[stratKey] = [];
    }
    this.save();
    renderAll();
    showToast(`Removed strategy section for ${platformName || stratKey}`);
  },

  addStrategyLineItem(stratKey, rowData) {
    if (!this.data.strategyTables) this.data.strategyTables = {};
    if (!this.data.strategyTables[stratKey]) this.data.strategyTables[stratKey] = [];
    
    // Ensure section is not marked as deleted
    if (this.data.deletedSections) {
      this.data.deletedSections = this.data.deletedSections.filter(k => k !== stratKey);
    }

    const cleanMarket = (rowData.market || "India").trim();
    const cleanAudience = (rowData.audience || "New Audience Segment").trim();
    const cleanPurpose = (rowData.purpose || "Strategic audience engagement").trim();
    const cleanOffer = (rowData.offer || "Work Better Magazine download").trim();
    const cleanTargeting = (rowData.targeting || "Target criteria").trim();
    const cleanExclusions = (rowData.exclusions || "Negative exclusions").trim();
    const cleanPriority = rowData.priority || "High";
    const cleanSplit = rowData.split || "25%";
    const cleanCpc = rowData.cpc || "USD 4–8";
    const cleanCpl = rowData.cpl || "USD 45–85";
    const platName = getPlatformDisplayName(stratKey);

    // 1. Add planning row to Strategy Table
    this.data.strategyTables[stratKey].push({
      market: cleanMarket,
      audience: cleanAudience,
      priority: cleanPriority,
      purpose: cleanPurpose,
      targeting: cleanTargeting,
      exclusions: cleanExclusions,
      offer: cleanOffer,
      cpc: cleanCpc,
      cpl: cleanCpl,
      split: cleanSplit
    });

    // 2. Upper Budget Section Placeholder:
    // If no budget section available for this country, automatically add the country as a placeholder ($0 budget).
    // If country already existed and the channel also existed, it will not add a separate line item.
    let market = this.data.markets.find(m => m.name.toLowerCase() === cleanMarket.toLowerCase());
    if (!market) {
      const code = getCountryCode(cleanMarket);
      const emptyMonths = {};
      ALL_MONTHS.forEach(m => { emptyMonths[m] = 0; });
      market = {
        id: `mkt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: cleanMarket,
        code,
        channels: [
          {
            id: `ch_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            platform: platName,
            objective: cleanPurpose || "Lead Generation",
            audienceType: cleanAudience,
            offer: cleanOffer,
            budgetUSD: 0,
            activeMonths: [],
            months: emptyMonths
          }
        ]
      };
      this.data.markets.push(market);
    } else {
      const channelAlreadyExists = market.channels.some(c => 
        getStratKey(c.platform) === stratKey || c.platform.toLowerCase() === platName.toLowerCase()
      );
      if (!channelAlreadyExists) {
        const emptyMonths = {};
        ALL_MONTHS.forEach(m => { emptyMonths[m] = 0; });
        market.channels.push({
          id: `ch_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          platform: platName,
          objective: cleanPurpose || "Lead Generation",
          audienceType: cleanAudience,
          offer: cleanOffer,
          budgetUSD: 0,
          activeMonths: [],
          months: emptyMonths
        });
      }
    }

    // 3. Ensure dropdown options have new market and platform
    if (!this.data.dropdownOptions.markets.includes(cleanMarket)) {
      this.data.dropdownOptions.markets.push(cleanMarket);
    }
    if (!this.data.dropdownOptions.platforms.includes(platName)) {
      this.data.dropdownOptions.platforms.push(platName);
    }

    this.save();
    renderAll();
    showToast(`Added line item to ${platName}`);
  },

  deleteStrategyLineItem(stratKey, rowIdx) {
    if (!this.data.strategyTables || !this.data.strategyTables[stratKey]) return;
    const item = this.data.strategyTables[stratKey][rowIdx];
    const audName = item ? item.audience : 'Line item';

    this.data.strategyTables[stratKey].splice(rowIdx, 1);

    this.save();
    renderAll();
    showToast(`Removed: "${audName}"`);
  },

  addNewChannelSection({ name, subtitle, callout, initialRow }) {
    const cleanName = (name || 'New Channel').trim();
    const stratKey = getStratKey(cleanName);
    
    if (!this.data.strategyTables) this.data.strategyTables = {};
    if (!this.data.deletedSections) this.data.deletedSections = [];
    this.data.deletedSections = this.data.deletedSections.filter(k => k !== stratKey);
    
    if (!this.data.strategyTables[stratKey]) {
      this.data.strategyTables[stratKey] = [];
    }
    
    let targetRow = null;
    if (initialRow) {
      targetRow = {
        market: initialRow.market || "India",
        audience: initialRow.audience || `${cleanName} Target Audience`,
        priority: initialRow.priority || "High",
        purpose: initialRow.purpose || subtitle || `Drive B2B awareness and pipeline on ${cleanName}`,
        targeting: initialRow.targeting || "Enterprise decision makers, CRE, Facilities",
        exclusions: initialRow.exclusions || "Competitors, junior roles, non-business consumer queries",
        offer: initialRow.offer || "Work Better Magazine download",
        cpc: initialRow.cpc || "USD 2–5",
        cpl: initialRow.cpl || "USD 35–70",
        split: initialRow.split || "100%"
      };
    } else {
      targetRow = {
        market: "India",
        audience: `${cleanName} Target Audience`,
        priority: "High",
        purpose: subtitle || `Drive B2B awareness and lead generation on ${cleanName}`,
        targeting: "Enterprise Decision Makers, CRE, Facilities",
        exclusions: "Competitors, junior roles, non-business consumer queries",
        offer: "Work Better Magazine download",
        cpc: "USD 2–5",
        cpl: "USD 35–70",
        split: "100%"
      };
    }

    this.data.strategyTables[stratKey].push(targetRow);

    // Placeholder in budget section if country or channel not present
    let market = this.data.markets.find(m => m.name.toLowerCase() === targetRow.market.toLowerCase());
    if (!market) {
      const code = getCountryCode(targetRow.market);
      const emptyMonths = {};
      ALL_MONTHS.forEach(m => { emptyMonths[m] = 0; });
      market = {
        id: `mkt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: targetRow.market,
        code,
        channels: [
          {
            id: `ch_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            platform: cleanName,
            objective: targetRow.purpose || "Lead Generation",
            audienceType: targetRow.audience,
            offer: targetRow.offer,
            budgetUSD: 0,
            activeMonths: [],
            months: emptyMonths
          }
        ]
      };
      this.data.markets.push(market);
    } else {
      const channelExists = market.channels.some(c => 
        getStratKey(c.platform) === stratKey || c.platform.toLowerCase() === cleanName.toLowerCase()
      );
      if (!channelExists) {
        const emptyMonths = {};
        ALL_MONTHS.forEach(m => { emptyMonths[m] = 0; });
        market.channels.push({
          id: `ch_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          platform: cleanName,
          objective: targetRow.purpose || "Lead Generation",
          audienceType: targetRow.audience,
          offer: targetRow.offer,
          budgetUSD: 0,
          activeMonths: [],
          months: emptyMonths
        });
      }
    }
    
    // Ensure dropdown options have new platform
    if (!this.data.dropdownOptions.platforms.includes(cleanName)) {
      this.data.dropdownOptions.platforms.push(cleanName);
    }
    if (!this.data.dropdownOptions.markets.includes(targetRow.market)) {
      this.data.dropdownOptions.markets.push(targetRow.market);
    }
    
    this.save();
    renderAll();
    
    // Scroll to new channel section
    setTimeout(() => {
      const el = document.getElementById(`channel-${stratKey}`);
      if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    
    showToast(`Created channel strategy: ${cleanName}`);
  },

  updateChannelField(marketId, channelId, fieldPath, rawValue) {
    const market = this.data.markets.find(m => m.id === marketId);
    if (!market) return;
    const channel = market.channels.find(ch => ch.id === channelId);
    if (!channel) return;

    // Ensure activeMonths is defined across all 12 months
    if (!channel.activeMonths || !Array.isArray(channel.activeMonths) || channel.activeMonths.length === 0) {
      channel.activeMonths = ALL_MONTHS.filter(m => (channel.months && (Number(channel.months[m]) || 0) > 0));
      if (channel.activeMonths.length === 0) channel.activeMonths = ['july', 'august', 'september'];
    }

    if (fieldPath === 'budgetUSD') {
      // Direct total budget edit: re-divide evenly across active months
      const newTotal = parseNumericInput(rawValue);
      channel.budgetUSD = newTotal;
      const activeCount = channel.activeMonths.length;
      const split = Math.floor(newTotal / activeCount);
      const remainder = newTotal - (split * activeCount);

      if (!channel.months) channel.months = {};
      ALL_MONTHS.forEach(m => {
        if (channel.activeMonths.includes(m)) {
          const idx = channel.activeMonths.indexOf(m);
          channel.months[m] = split + (idx === 0 ? remainder : 0);
        } else {
          channel.months[m] = 0;
        }
      });
    } else if (fieldPath.startsWith('months.')) {
      // Fixed total budget: zero-sum auto-balancing across remaining active months
      const monthKey = fieldPath.split('.')[1];
      const newVal = Math.max(0, parseNumericInput(rawValue));

      if (!channel.months) {
        channel.months = {};
        ALL_MONTHS.forEach(m => { channel.months[m] = 0; });
      }

      if (!channel.activeMonths.includes(monthKey)) {
        channel.activeMonths.push(monthKey);
      }

      const otherActiveMonths = channel.activeMonths.filter(m => m !== monthKey);
      const total = Number(channel.budgetUSD) || 0;

      if (otherActiveMonths.length === 0) {
        channel.budgetUSD = newVal;
        channel.months[monthKey] = newVal;
      } else if (newVal >= total) {
        channel.months[monthKey] = newVal;
        otherActiveMonths.forEach(m => {
          channel.months[m] = 0;
        });
        if (newVal > total) {
          channel.budgetUSD = newVal;
        }
      } else {
        channel.months[monthKey] = newVal;
        const remaining = total - newVal;
        const split = Math.floor(remaining / otherActiveMonths.length);
        const remainder = remaining - (split * otherActiveMonths.length);

        otherActiveMonths.forEach((m, idx) => {
          channel.months[m] = split + (idx === 0 ? remainder : 0);
        });
      }

      // Inactive months remain 0
      ALL_MONTHS.forEach(m => {
        if (!channel.activeMonths.includes(m)) {
          channel.months[m] = 0;
        }
      });
    } else if (fieldPath === 'platform') {
      const oldStratKey = getStratKey(channel.platform);
      channel.platform = rawValue;
      const newStratKey = getStratKey(rawValue);

      // Clean old strategy entry if different
      if (oldStratKey !== newStratKey && this.data.strategyTables && this.data.strategyTables[oldStratKey]) {
        this.data.strategyTables[oldStratKey] = this.data.strategyTables[oldStratKey].filter(
          r => r.channelId !== channel.id && r.market !== market.name
        );
      }
      this.syncStrategyTableRow(market, channel);
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
  renderSidebarOutline();
  renderMetaText();
}

function getChannelKpiBarHtml(platformName) {
  const stratKey = getStratKey(platformName);
  const platData = (BudgetStore.summary.platformBreakdown || []).find(p => getStratKey(p.name) === stratKey);

  const total = platData ? platData.total : 0;
  const pct = platData ? platData.percent.toFixed(1) : '0.0';
  const placements = platData ? platData.count : 0;

  // Country breakdown e.g. "India ($5,000), China ($10,000)"
  const countryBreakdowns = [];
  (BudgetStore.data.markets || []).forEach(m => {
    const chs = m.channels.filter(c => getStratKey(c.platform) === stratKey);
    if (chs.length > 0) {
      const mTotal = chs.reduce((sum, c) => sum + (Number(c.budgetUSD) || 0), 0);
      countryBreakdowns.push(`${m.name} ($${formatNumber(mTotal)})`);
    }
  });
  const countriesStr = countryBreakdowns.length > 0 ? countryBreakdowns.join(', ') : 'Not Allocated';

  // Flight schedule across 12 months
  const activeMonthsSet = new Set();
  (BudgetStore.data.markets || []).forEach(m => {
    m.channels.filter(c => getStratKey(c.platform) === stratKey).forEach(c => {
      ALL_MONTHS.forEach(month => {
        if (c.months && Number(c.months[month]) > 0) {
          activeMonthsSet.add(MONTH_SHORT_LABELS[month]);
        }
      });
    });
  });
  const flightStr = activeMonthsSet.size > 0 ? Array.from(activeMonthsSet).join(', ') : 'Jul – Sep 2026';

  return `
    <div class="channel-kpi-bar">
      <div class="channel-kpi-item">
        <span class="channel-kpi-label">Allocated Budget</span>
        <span class="channel-kpi-value font-mono">$${formatNumber(total)} <span class="text-muted" style="font-size: 11px;">(${pct}% of Plan)</span></span>
      </div>
      <div class="channel-kpi-item">
        <span class="channel-kpi-label">Target Markets</span>
        <span class="channel-kpi-value">${countriesStr}</span>
      </div>
      <div class="channel-kpi-item">
        <span class="channel-kpi-label">Flight Schedule</span>
        <span class="channel-kpi-value">${flightStr}</span>
      </div>
      <div class="channel-kpi-item">
        <span class="channel-kpi-label">Placements</span>
        <span class="channel-kpi-value font-mono">${placements} Active Placement${placements !== 1 ? 's' : ''}</span>
      </div>
    </div>
  `;
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

  // 2. Render Top KPI Cards Deck (Grouped into Countries and Channels)
  const filter = APP_STATE.deckFilter;
  const sectionCountries = document.getElementById('kpiSectionCountries');
  const sectionChannels = document.getElementById('kpiSectionChannels');
  const countriesContainer = document.getElementById('overviewKpiCountries');
  const channelsContainer = document.getElementById('overviewKpiChannels');
  const countryBadge = document.getElementById('kpiCountryCountBadge');
  const channelBadge = document.getElementById('kpiChannelCountBadge');

  if (countryBadge) countryBadge.textContent = `${countryBreakdown.length} Markets`;
  if (channelBadge) channelBadge.textContent = `${platformBreakdown.length} Platforms`;

  if (sectionCountries) {
    sectionCountries.style.display = (filter === 'all' || filter === 'countries') ? 'block' : 'none';
  }
  if (sectionChannels) {
    sectionChannels.style.display = (filter === 'all' || filter === 'platforms') ? 'block' : 'none';
  }

  // Populate Countries Row
  if (countriesContainer) {
    countriesContainer.innerHTML = '';

    // Card 1: Total Budget Card
    const totalCard = document.createElement('div');
    totalCard.className = 'kpi-card kpi-total-card';
    totalCard.innerHTML = `
      <div class="kpi-card-header">
        <span class="kpi-card-title">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          TOTAL CAMPAIGN
        </span>
        <span class="kpi-card-type-badge">GLOBAL</span>
      </div>
      <div class="kpi-card-value">$${formatNumber(grandTotal)}</div>
      <div class="kpi-card-desc">${countryBreakdown.length} markets · ${totalChannelsCount} placements</div>
      <div class="kpi-card-bar-bg">
        <div class="kpi-card-bar-fill" style="width: 100%;"></div>
      </div>
    `;
    countriesContainer.appendChild(totalCard);

    // Country Spend Cards
    countryBreakdown.forEach(item => {
      const card = document.createElement('div');
      card.className = 'kpi-card';
      const code = getCountryCode(item.name || item.code);

      card.innerHTML = `
        <div class="kpi-card-header">
          <span class="kpi-card-title">
            <span class="market-tag tag-${code}" style="padding: 1px 5px; font-size: 9.5px;">${code.toUpperCase()}</span>
            ${item.name.toUpperCase()}
          </span>
          <span class="kpi-card-type-badge">${item.percent.toFixed(1)}%</span>
        </div>
        <div class="kpi-card-value">$${formatNumber(item.total)}</div>
        <div class="kpi-card-desc" title="${item.channelsSummary}">${item.channelsSummary || `${item.channelCount} channel placement(s)`}</div>
        <div class="kpi-card-bar-bg">
          <div class="kpi-card-bar-fill bar-${code}" style="width: ${Math.min(100, Math.max(3, item.percent))}%;"></div>
        </div>
      `;
      countriesContainer.appendChild(card);
    });
  }

  // Populate Channels Row
  if (channelsContainer) {
    channelsContainer.innerHTML = '';
    platformBreakdown.forEach(item => {
      const card = document.createElement('div');
      card.className = 'kpi-card';
      const platClass = getPlatformBadgeClass(item.name);
      const marketListStr = item.marketNames.join(', ');

      card.innerHTML = `
        <div class="kpi-card-header">
          <span class="kpi-card-title">
            <span class="platform-badge ${platClass}" style="padding: 1px 5px; font-size: 9.5px;">${item.name}</span>
          </span>
          <span class="kpi-card-type-badge">${item.percent.toFixed(1)}%</span>
        </div>
        <div class="kpi-card-value">$${formatNumber(item.total)}</div>
        <div class="kpi-card-desc" title="${item.percent.toFixed(1)}% in ${marketListStr}">${item.percent.toFixed(1)}% · ${marketListStr}</div>
        <div class="kpi-card-bar-bg">
          <div class="kpi-card-bar-fill bar-${platClass}" style="width: ${Math.min(100, Math.max(3, item.percent))}%;"></div>
        </div>
      `;
      channelsContainer.appendChild(card);
    });
  }

  // 3. Multi-Segment Continuous Proportional Bars
  renderMultiSegmentBar('countryMultiBar', countryBreakdown.map(c => ({
    name: c.name,
    percent: c.percent,
    className: `bar-${getCountryCode(c.name || c.code)}`
  })));

  renderMultiSegmentBar('platformMultiBar', platformBreakdown.map(p => ({
    name: p.name,
    percent: p.percent,
    className: `bar-${getPlatformBadgeClass(p.name)}`
  })));

  // Proportional 12-month run rate bar
  renderMultiSegmentBar('monthlyMultiBar', ALL_MONTHS.map(m => ({
    name: MONTH_SHORT_LABELS[m],
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
      const code = getCountryCode(item.name || item.code);

      row.innerHTML = `
        <div class="breakdown-top-line">
          <div class="breakdown-entity">
            <span class="market-tag tag-${code}">${item.name}</span>
            <span class="text-muted" style="font-size: 11px;">(${item.channelCount} placement${item.channelCount > 1 ? 's' : ''})</span>
          </div>
          <div class="breakdown-figures">
            <span class="breakdown-val">$${formatNumber(item.total)}</span>
            <span class="breakdown-pct">${item.percent.toFixed(1)}%</span>
          </div>
        </div>
        <div class="breakdown-bar-bg">
          <div class="breakdown-bar-fill bar-${code}" style="width: ${Math.min(100, Math.max(2, item.percent))}%"></div>
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
    const activeMonthsWithSpend = ALL_MONTHS.filter(m => (monthTotals[m] || 0) > 0);
    const monthsToShow = activeMonthsWithSpend.length > 0 ? activeMonthsWithSpend : ['july', 'august', 'september'];

    monthsToShow.forEach(m => {
      const val = monthTotals[m] || 0;
      const pct = grandTotal > 0 ? (val / grandTotal) * 100 : 0;
      const label = `${MONTH_SHORT_LABELS[m]} (${m.charAt(0).toUpperCase() + m.slice(1)})`;

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
 * Budget Breakdown Main Table Rendering (All 12 Calendar Months + Inline Delete)
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
    const countryCode = getCountryCode(market.name || market.code);

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
              <div class="market-cell-top">
                <div class="market-title-row">
                  <span class="market-tag tag-${countryCode} dropdown-trigger" data-market-id="${market.id}" data-dropdown-group="markets" title="Click to rename or change market">
                    ${market.name}
                  </span>
                  <button type="button" class="btn-delete-market edit-mode-only" data-action="delete-market" data-market-id="${market.id}" title="Delete entire ${market.name} country section">
                    Delete Country
                  </button>
                </div>
                <span class="market-subtotal-badge">
                  Subtotal: $${formatNumber(market.totalBudget)}
                </span>
              </div>
              <div class="market-cell-bottom">
                <button type="button" class="btn-add-line-square edit-mode-only" data-action="add-line-item-market" data-market-name="${market.name}" title="Add a line item to ${market.name}">
                  +
                </button>
              </div>
            </div>
          </td>
        `;
      }

      // Platforms Column with Inline Delete Action
      const platClass = getPlatformBadgeClass(channel.platform);

      html += `
        <td>
          <div class="platform-cell-row">
            <span class="platform-badge ${platClass} dropdown-trigger" data-market-id="${market.id}" data-channel-id="${channel.id}" data-field="platform" data-dropdown-group="platforms" title="Click to change platform">
              ${channel.platform}
            </span>
            <button type="button" class="btn-delete-row-inline edit-mode-only" data-action="delete-channel" data-market-id="${market.id}" data-channel-id="${channel.id}" title="Delete this line item">
              ✕
            </button>
          </div>
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
      `;

      // Render all 12 monthly columns (Jan through Dec)
      ALL_MONTHS.forEach(m => {
        const val = (channel.months && channel.months[m]) || 0;
        const isMuted = val === 0 ? 'text-muted' : '';
        html += `
          <td class="text-right font-mono budget-input-cell ${isMuted}" data-market-id="${market.id}" data-channel-id="${channel.id}" data-field="months.${m}" title="Click to edit ${MONTH_SHORT_LABELS[m]} flight budget">
            $${formatNumber(val)}
          </td>
        `;
      });

      // Rightmost Action Column
      html += `
        <td class="table-action-col edit-mode-only text-center">
          <button type="button" class="btn-delete-row edit-mode-only" data-action="delete-channel" data-market-id="${market.id}" data-channel-id="${channel.id}" title="Remove this placement row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      `;

      tr.innerHTML = html;
      tbody.appendChild(tr);
    });
  });

  // Table Footer: Program Totals across all 12 months
  const { grandTotal, monthTotals } = BudgetStore.summary;
  let monthFootCells = '';
  ALL_MONTHS.forEach(m => {
    monthFootCells += `<td class="text-right font-mono font-bold">$${formatNumber(monthTotals[m] || 0)}</td>`;
  });

  tfoot.innerHTML = `
    <tr class="total-row">
      <td colspan="5" class="font-bold">Total Program Spend</td>
      <td class="text-right font-mono font-bold">100%</td>
      <td class="text-right font-mono font-bold text-accent">$${formatNumber(grandTotal)}</td>
      ${monthFootCells}
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

/**
 * Dynamic Channel Strategy Tables Rendering
 * - Injects KPI summary bar into LinkedIn, Meta, Pinterest, WeChat
 * - Dynamically creates and renders YouTube Channel section when active
 */
function renderStrategyTables() {
  const tables = BudgetStore.data.strategyTables || {};
  const deletedSections = BudgetStore.data.deletedSections || [];

  const standardSections = [
    { key: 'linkedin', id: 'channel-linkedin', name: 'LinkedIn', bodyId: 'strategyBodyLinkedIn' },
    { key: 'meta', id: 'channel-meta', name: 'Meta | Instagram', bodyId: 'strategyBodyMeta' },
    { key: 'pinterest', id: 'channel-pinterest', name: 'Pinterest', bodyId: 'strategyBodyPinterest' },
    { key: 'wechat', id: 'channel-wechat', name: 'WeChat', bodyId: 'strategyBodyWeChat' }
  ];

  standardSections.forEach(def => {
    const sec = document.getElementById(def.id);
    if (!sec) return;

    const hasPlacements = (BudgetStore.summary.platformBreakdown || []).some(p => getStratKey(p.name) === def.key && p.total > 0);
    const hasRows = Array.isArray(tables[def.key]) && tables[def.key].length > 0;
    const isDeleted = deletedSections.includes(def.key);

    if (isDeleted || (!hasPlacements && !hasRows)) {
      sec.style.display = 'none';
    } else {
      sec.style.display = 'block';

      // Update KPI Bar, + Add Line Item, and Delete button in section header
      const header = sec.querySelector('.section-header');
      if (header) {
        let badgeHeader = header.querySelector('.channel-badge-header');
        if (badgeHeader) {
          if (!badgeHeader.querySelector('.btn-add-strategy-header')) {
            const addBtn = document.createElement('button');
            addBtn.type = 'button';
            addBtn.className = 'btn-add-strategy-header edit-mode-only';
            addBtn.setAttribute('data-action', 'add-strategy-line-item');
            addBtn.setAttribute('data-strat-key', def.key);
            addBtn.setAttribute('data-platform-name', def.name);
            addBtn.title = `Add strategy line item to ${def.name}`;
            addBtn.innerHTML = `+ Add Line Item`;
            badgeHeader.appendChild(addBtn);
          }
          if (!badgeHeader.querySelector('.btn-delete-section')) {
            const delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.className = 'btn-delete-section edit-mode-only';
            delBtn.setAttribute('data-action', 'delete-strategy-section');
            delBtn.setAttribute('data-strat-key', def.key);
            delBtn.setAttribute('data-platform-name', def.name);
            delBtn.title = `Delete ${def.name} strategy section`;
            delBtn.innerHTML = `✕ Delete Section`;
            badgeHeader.appendChild(delBtn);
          }
        }

        let kpiBar = header.querySelector('.channel-kpi-bar');
        if (!kpiBar) {
          kpiBar = document.createElement('div');
          header.appendChild(kpiBar);
        }
        kpiBar.outerHTML = getChannelKpiBarHtml(def.name);
      }

      renderSingleStrategyTable(def.bodyId, tables[def.key] || [], def.key);
    }
  });

  // Dynamic deep-dive sections container (YouTube, Google, TikTok, etc.)
  const dynamicContainer = document.getElementById('dynamicStrategySections');
  if (dynamicContainer) {
    dynamicContainer.innerHTML = '';
    const standardKeys = ['linkedin', 'meta', 'pinterest', 'wechat'];

    // Collect all platforms present across markets
    const allPlatformsInPlan = (BudgetStore.summary.platformBreakdown || []).map(p => p.name);

    // Ensure YouTube and any other active platform in plan have strategy rows
    allPlatformsInPlan.forEach(platName => {
      const key = getStratKey(platName);
      if (!standardKeys.includes(key) && !deletedSections.includes(key)) {
        if (!tables[key] || tables[key].length === 0) {
          tables[key] = [];
          BudgetStore.data.markets.forEach(m => {
            m.channels.filter(c => getStratKey(c.platform) === key).forEach(c => {
              BudgetStore.syncStrategyTableRow(m, c);
            });
          });
        }
      }
    });

    Object.keys(tables).forEach(key => {
      if (!standardKeys.includes(key) && !deletedSections.includes(key) && Array.isArray(tables[key]) && tables[key].length > 0) {
        const rows = tables[key];
        const rawName = key === 'youtube' ? 'YouTube' : key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const platClass = getPlatformBadgeClass(rawName);

        const section = document.createElement('section');
        section.id = `channel-${key}`;
        section.className = 'content-section';
        section.innerHTML = `
          <div class="section-header">
            <div class="channel-badge-header">
              <span class="platform-badge ${platClass} large">${rawName}</span>
              <button type="button" class="btn-add-strategy-header edit-mode-only" data-action="add-strategy-line-item" data-strat-key="${key}" data-platform-name="${rawName}" title="Add audience line item to ${rawName}">
                + Add Line Item
              </button>
              <button type="button" class="btn-delete-section edit-mode-only" data-action="delete-strategy-section" data-strat-key="${key}" data-platform-name="${rawName}" title="Delete ${rawName} strategy section">
                ✕ Delete Section
              </button>
            </div>
            <h2 class="section-title">Channel Strategy: ${rawName}</h2>
            <p class="section-subtitle">
              ${key === 'youtube'
                ? 'High-impact video storytelling, executive awareness, and precision workplace audience engagement on YouTube.'
                : `Tactical segmentation, targeting criteria, and lead acquisition strategy for ${rawName}.`}
            </p>
            ${getChannelKpiBarHtml(rawName)}
          </div>
          <div class="table-container">
            <table class="proposal-table" id="strategyTable_${key}">
              <thead>
                <tr>
                  <th style="width: 38px;" class="table-action-col text-center"></th>
                  <th style="min-width: 100px;">Market</th>
                  <th style="min-width: 105px;" class="text-right">Budget Split</th>
                  <th style="min-width: 180px;">Audience</th>
                  <th style="min-width: 95px;">Priority</th>
                  <th style="min-width: 210px;">Audience Purpose</th>
                  <th style="min-width: 260px;">Targeting</th>
                  <th style="min-width: 210px;">Exclusions</th>
                  <th style="min-width: 160px;">Offer / CTA</th>
                  <th style="min-width: 110px;">Expected CPC</th>
                  <th style="min-width: 115px;">Expected CPL*</th>
                </tr>
              </thead>
              <tbody id="strategyBody_${key}"></tbody>
            </table>
          </div>
        `;
        dynamicContainer.appendChild(section);
        renderSingleStrategyTable(`strategyBody_${key}`, rows, key);
      }
    });
  }

  attachStrategyTableListeners();
}

/**
 * Dynamic Sidebar Outline Navigation
 * Synchronizes with Executive Overview, Budget Breakdown, and all active Channel sections
 */
function renderSidebarOutline() {
  const nav = document.getElementById('sidebarOutlineNav');
  if (!nav) return;

  const baseItems = [
    { href: '#overview-deck', label: 'Executive Overview' },
    { href: '#budget-breakdown', label: 'Budget Breakdown' }
  ];

  const deletedSections = BudgetStore.data.deletedSections || [];
  const channelLinks = [];

  // Default standard keys
  const defaultKeys = [
    { key: 'linkedin', id: 'channel-linkedin', name: 'LinkedIn' },
    { key: 'meta', id: 'channel-meta', name: 'Meta | Instagram' },
    { key: 'pinterest', id: 'channel-pinterest', name: 'Pinterest' },
    { key: 'wechat', id: 'channel-wechat', name: 'WeChat' }
  ];

  defaultKeys.forEach(def => {
    const sec = document.getElementById(def.id);
    const isVisible = sec && sec.style.display !== 'none';
    if (isVisible && !deletedSections.includes(def.key)) {
      channelLinks.push({ href: `#${def.id}`, label: `Channel: ${def.name}` });
    }
  });

  // Dynamic keys (YouTube, Google, etc.)
  const tables = BudgetStore.data.strategyTables || {};
  Object.keys(tables).forEach(key => {
    if (!defaultKeys.some(d => d.key === key) && !deletedSections.includes(key) && Array.isArray(tables[key]) && tables[key].length > 0) {
      const sec = document.getElementById(`channel-${key}`);
      const isVisible = sec && sec.style.display !== 'none';
      if (isVisible) {
        const rawName = key === 'youtube' ? 'YouTube' : key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        channelLinks.push({ href: `#channel-${key}`, label: `Channel: ${rawName}` });
      }
    }
  });

  const allItems = [...baseItems, ...channelLinks];

  nav.innerHTML = allItems.map((item, idx) => `
    <a href="${item.href}" class="outline-link ${idx === 0 ? 'active' : ''}">${item.label}</a>
  `).join('');

  // Smooth scroll click handler
  nav.querySelectorAll('.outline-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        nav.querySelectorAll('.outline-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });
}

function renderSingleStrategyTable(tbodyId, rows, tableKey) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody || !rows) return;

  tbody.innerHTML = '';
  rows.forEach((row, idx) => {
    const tr = document.createElement('tr');
    if (idx === rows.length - 1) tr.classList.add('border-group-end');

    const countryCode = getCountryCode(row.market);
    const prioClass = (row.priority || 'medium').toLowerCase();

    tr.innerHTML = `
      <td class="text-center table-action-col" style="width: 38px;">
        <button type="button" class="btn-minus-strategy-line edit-mode-only" data-strategy-table="${tableKey}" data-strategy-idx="${idx}" title="Delete this line item">-</button>
      </td>
      <td class="cell-market font-bold">
        <span class="market-tag tag-${countryCode} dropdown-trigger" data-strategy-table="${tableKey}" data-strategy-idx="${idx}" data-field="market" data-dropdown-group="markets" title="Click to change market">
          ${row.market}
        </span>
      </td>
      <td class="text-right font-mono font-semibold editable-field" data-strategy-table="${tableKey}" data-strategy-idx="${idx}" data-field="split">
        ${row.split}
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
    `;

    tbody.appendChild(tr);
  });
}

function renderMetaText() {
  const meta = BudgetStore.data.meta;
  if (!meta) return;

  const titleEl = document.getElementById('documentTitle');
  const descEl = document.getElementById('documentDesc');
  const heroBadgeStatusEl = document.getElementById('heroBadgeStatus');
  const heroBadgeDateEl = document.getElementById('heroBadgeDate');
  const heroBadgeScopeEl = document.getElementById('heroBadgeScope');

  const stratTitleEl = document.getElementById('stratTitle');
  const stratDescEl = document.getElementById('stratDesc');
  const stratBadge1El = document.getElementById('stratBadge1');
  const stratBadge2El = document.getElementById('stratBadge2');

  const pathEl = document.getElementById('navPathDisplay');
  const pinCalloutEl = document.getElementById('pinStrategicCallout');
  const cplNoteEl = document.getElementById('footerCplNote');

  if (titleEl && meta.title) titleEl.textContent = meta.title;
  if (descEl && meta.description) descEl.textContent = meta.description;
  if (heroBadgeStatusEl && meta.heroBadgeStatus) heroBadgeStatusEl.textContent = meta.heroBadgeStatus;
  if (heroBadgeDateEl && (meta.heroBadgeDate || meta.dateBadge)) heroBadgeDateEl.textContent = meta.heroBadgeDate || meta.dateBadge;
  if (heroBadgeScopeEl && (meta.heroBadgeScope || meta.scopeBadge)) heroBadgeScopeEl.textContent = meta.heroBadgeScope || meta.scopeBadge;

  if (stratTitleEl && meta.stratTitle) stratTitleEl.textContent = meta.stratTitle;
  if (stratDescEl && meta.stratDesc) stratDescEl.textContent = meta.stratDesc;
  if (stratBadge1El && meta.stratBadge1) stratBadge1El.textContent = meta.stratBadge1;
  if (stratBadge2El && meta.stratBadge2) stratBadge2El.textContent = meta.stratBadge2;

  if (pathEl && meta.navPath) pathEl.textContent = meta.navPath;
  if (pinCalloutEl && meta.pinCallout) pinCalloutEl.textContent = meta.pinCallout;
  if (cplNoteEl && meta.footerCplNote) cplNoteEl.textContent = meta.footerCplNote;
}

/* ==========================================================================
   Interactive Event Listeners
   ========================================================================== */

function attachBudgetTableListeners() {
  // 1. Action buttons (+ Line Item, Delete Market, Delete Line Item)
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.getAttribute('data-action');
      const marketId = btn.getAttribute('data-market-id');
      const channelId = btn.getAttribute('data-channel-id');

      if (action === 'add-line-item-market') {
        const marketName = btn.getAttribute('data-market-name');
        if (window.openAddLineItemModal) {
          window.openAddLineItemModal(marketName);
        }
      } else if (action === 'add-channel') {
        const marketName = btn.getAttribute('data-market-name');
        if (window.openAddLineItemModal) {
          window.openAddLineItemModal(marketName);
        } else {
          BudgetStore.addChannel(marketId);
        }
      } else if (action === 'delete-market') {
        if (confirm('Delete this country and all its line items from the plan?')) {
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

  // 4. Dropdown triggers in Budget Table
  document.querySelectorAll('#mainBudgetTableBody .dropdown-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      if (!APP_STATE.isEditMode) return;
      e.stopPropagation();
      openDropdownMenu(trigger);
    });
  });
}

function attachStrategyTableListeners() {
  // Strategy table field edits
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
        if (BudgetStore.data.strategyTables[tableKey] && BudgetStore.data.strategyTables[tableKey][idx]) {
          BudgetStore.data.strategyTables[tableKey][idx][field] = newVal;
          BudgetStore.save();
          renderStrategyTables();
        }
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

  // Strategy table dropdown triggers
  document.querySelectorAll('.content-section .dropdown-trigger[data-strategy-table]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      if (!APP_STATE.isEditMode) return;
      e.stopPropagation();
      openDropdownMenu(trigger);
    });
  });

  // Strategy table minus '-' delete line item button (Just the sign)
  document.querySelectorAll('.btn-minus-strategy-line').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (!APP_STATE.isEditMode) return;
      e.stopPropagation();
      const tableKey = btn.getAttribute('data-strategy-table');
      const idx = parseInt(btn.getAttribute('data-strategy-idx'), 10);
      BudgetStore.deleteStrategyLineItem(tableKey, idx);
    });
  });

  // Strategy table add line item button in channel header
  document.querySelectorAll('.btn-add-strategy-header').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const stratKey = btn.getAttribute('data-strat-key');
      if (window.openAddStrategyLineItemModal) {
        window.openAddStrategyLineItemModal(stratKey);
      }
    });
  });

  // Strategy table delete section buttons
  document.querySelectorAll('.btn-delete-section').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const stratKey = btn.getAttribute('data-strat-key');
      const platformName = btn.getAttribute('data-platform-name');
      openConfirmSectionDeleteModal({
        platformName,
        stratKey,
        isDirectSectionDelete: true
      });
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

    let contentHtml = `<span>${opt}</span>`;
    if (group === 'markets') {
      const code = getCountryCode(opt);
      contentHtml = `<span class="market-tag tag-${code}">${opt}</span>`;
    } else if (group === 'platforms') {
      const platClass = getPlatformBadgeClass(opt);
      contentHtml = `<span class="platform-badge ${platClass}">${opt}</span>`;
    } else if (group === 'priorities') {
      const prioClass = (opt || 'medium').toLowerCase();
      contentHtml = `<span class="priority-badge ${prioClass}">${opt}</span>`;
    } else if (group === 'offers') {
      contentHtml = `<span class="offer-tag">${opt}</span>`;
    }

    item.innerHTML = `
      ${contentHtml}
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
      market.code = getCountryCode(value);
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
    if (BudgetStore.data.strategyTables[stratTable] && BudgetStore.data.strategyTables[stratTable][idx]) {
      BudgetStore.data.strategyTables[stratTable][idx][field] = value;
      BudgetStore.save();
      renderStrategyTables();
      showToast(`Updated to "${value}"`);
    }
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
   Add Line Item Modal Manager
   ========================================================================== */

function initAddLineItemModal() {
  const modal = document.getElementById('addLineItemModal');
  const openBtn1 = document.getElementById('openAddLineItemModalBtn');
  const openBtn2 = document.getElementById('addLineItemTableTopBtn');
  const openBtn3 = document.getElementById('addLineItemTableBottomBtn');
  const closeBtn = document.getElementById('closeAddLineItemModalBtn');
  const cancelBtn = document.getElementById('cancelAddLineItemBtn');
  const form = document.getElementById('addLineItemForm');

  const countryInput = document.getElementById('lineItemCountryInput');
  const channelSelect = document.getElementById('lineItemChannelSelect');
  const budgetInput = document.getElementById('lineItemBudgetInput');
  const previewText = document.getElementById('budgetCalcPreviewText');
  const objectiveInput = document.getElementById('lineItemObjectiveInput');
  const offerInput = document.getElementById('lineItemOfferInput');
  const audienceInput = document.getElementById('lineItemAudienceInput');
  const presetSelect = document.getElementById('monthFlightPresetSelect');

  // Default flight: Q3 (Jul, Aug, Sep)
  let activeMonths = ['july', 'august', 'september'];

  function updatePreview() {
    if (!previewText || !budgetInput) return;
    const b = Math.max(0, Number(budgetInput.value) || 0);
    const count = activeMonths.length;
    const perMonth = count > 0 ? Math.round(b / count) : 0;

    let monthSummary = 'None selected';
    if (count === 12) {
      monthSummary = 'All 12 Months';
    } else if (count > 0) {
      monthSummary = activeMonths.map(m => MONTH_SHORT_LABELS[m] || m).join(', ');
    }

    previewText.innerHTML = `Evenly divided: <strong>$${formatNumber(perMonth)} / month</strong> across ${count} selected month${count > 1 ? 's' : ''} (${monthSummary})`;
  }

  function syncPillElements() {
    document.querySelectorAll('#monthSelectorPills .month-pill').forEach(pill => {
      const m = pill.getAttribute('data-month');
      if (activeMonths.includes(m)) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  function openModal(prefillCountry = '') {
    if (!modal) return;
    modal.style.display = 'flex';
    if (prefillCountry && countryInput) {
      countryInput.value = prefillCountry;
      if (budgetInput) budgetInput.focus();
    } else {
      if (countryInput) {
        countryInput.value = '';
        countryInput.focus();
      }
    }
    syncPillElements();
    updatePreview();
  }

  function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
  }

  // Global window hook so table row buttons can trigger modal with prefill
  window.openAddLineItemModal = openModal;

  if (openBtn1) openBtn1.addEventListener('click', () => openModal());
  if (openBtn2) openBtn2.addEventListener('click', () => openModal());
  if (openBtn3) openBtn3.addEventListener('click', () => openModal());
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Flight Months Preset Dropdown
  if (presetSelect) {
    presetSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'custom') return;

      if (MONTH_PRESETS[val]) {
        activeMonths = [...MONTH_PRESETS[val]];
      } else if (ALL_MONTHS.includes(val)) {
        activeMonths = [val];
      }

      syncPillElements();
      updatePreview();
    });
  }

  // Month pills selection grid (Jan - Dec)
  document.querySelectorAll('#monthSelectorPills .month-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const month = pill.getAttribute('data-month');
      if (!month) return;

      if (pill.classList.contains('active')) {
        // Must have at least 1 month active
        if (activeMonths.length <= 1) {
          showToast('At least one flight month must be selected.');
          return;
        }
        pill.classList.remove('active');
        activeMonths = activeMonths.filter(m => m !== month);
      } else {
        pill.classList.add('active');
        if (!activeMonths.includes(month)) activeMonths.push(month);
      }

      // Check if current selection matches any known preset
      if (presetSelect) {
        let matchedPreset = 'custom';
        Object.entries(MONTH_PRESETS).forEach(([key, list]) => {
          if (list.length === activeMonths.length && list.every(m => activeMonths.includes(m))) {
            matchedPreset = key;
          }
        });
        presetSelect.value = matchedPreset;
      }

      updatePreview();
    });
  });

  if (budgetInput) {
    budgetInput.addEventListener('input', updatePreview);
  }

  // Quick suggestion chips
  document.querySelectorAll('#addLineItemModal .quick-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.getAttribute('data-val');
      if (val && countryInput) {
        countryInput.value = val;
        if (budgetInput) budgetInput.focus();
      }
    });
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const country = countryInput ? countryInput.value.trim() : '';
      const channel = channelSelect ? channelSelect.value : 'LinkedIn LeadGen';
      const totalBudget = budgetInput ? (Number(budgetInput.value) || 5000) : 5000;
      const objective = objectiveInput ? objectiveInput.value.trim() : 'Lead Generation';
      const audienceType = audienceInput ? audienceInput.value.trim() : 'Enterprise Decision Makers';
      const offer = offerInput ? offerInput.value.trim() : 'Work Better Magazine';

      if (!country) return;

      BudgetStore.addLineItem({
        country,
        channel,
        totalBudget,
        activeMonths: [...activeMonths],
        objective,
        audienceType,
        offer
      });

      closeModal();

      // Smooth scroll to table
      const tableEl = document.getElementById('budget-breakdown');
      if (tableEl) tableEl.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

/* ==========================================================================
   Confirm Delete Section Modal Controller
   ========================================================================== */

let pendingSectionDeletion = null;

function openConfirmSectionDeleteModal(options) {
  const modal = document.getElementById('confirmDeleteSectionModal');
  if (!modal) return;

  pendingSectionDeletion = options;
  const titleEl = document.getElementById('confirmDeleteSectionTitle');
  const subtitleEl = document.getElementById('confirmDeleteSectionSubtitle');
  const bodyEl = document.getElementById('confirmDeleteSectionBody');
  const keepBtn = document.getElementById('btnKeepSectionOnly');

  const { platformName, stratKey, marketName, isDirectSectionDelete } = options;

  if (isDirectSectionDelete) {
    if (titleEl) titleEl.textContent = `Delete Channel Strategy Section?`;
    if (subtitleEl) subtitleEl.textContent = `Channel Strategy: ${platformName}`;
    if (bodyEl) bodyEl.innerHTML = `Are you sure you want to remove the entire <strong>Channel Strategy: ${platformName}</strong> section and its targeting table from the document?`;
    if (keepBtn) keepBtn.style.display = 'none';
  } else {
    if (titleEl) titleEl.textContent = `Delete Channel Strategy Section?`;
    if (subtitleEl) subtitleEl.textContent = `Removed last ${platformName} placement (${marketName || 'Market'})`;
    if (bodyEl) bodyEl.innerHTML = `You removed the last <strong>${platformName}</strong> placement from the budget. Do you also want to remove the entire <strong>Channel Strategy: ${platformName}</strong> section from the plan?`;
    if (keepBtn) keepBtn.style.display = 'inline-flex';
  }

  modal.style.display = 'flex';
}

function closeConfirmSectionDeleteModal() {
  const modal = document.getElementById('confirmDeleteSectionModal');
  if (modal) modal.style.display = 'none';
  pendingSectionDeletion = null;
}

function initSectionDeleteConfirmModal() {
  const modal = document.getElementById('confirmDeleteSectionModal');
  const confirmBtn = document.getElementById('btnConfirmDeleteSection');
  const keepBtn = document.getElementById('btnKeepSectionOnly');
  const cancelBtn = document.getElementById('cancelDeleteSectionBtn');
  const closeBtn = document.getElementById('closeConfirmDeleteSectionModalBtn');

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (!pendingSectionDeletion) return;
      const { marketId, channelId, stratKey, platformName } = pendingSectionDeletion;

      if (marketId && channelId) {
        BudgetStore.executeDeleteChannel(marketId, channelId);
      }
      BudgetStore.deleteChannelStrategySection(stratKey, platformName);
      closeConfirmSectionDeleteModal();
    });
  }

  if (keepBtn) {
    keepBtn.addEventListener('click', () => {
      if (!pendingSectionDeletion) return;
      const { marketId, channelId, platformName } = pendingSectionDeletion;

      if (marketId && channelId) {
        BudgetStore.executeDeleteChannel(marketId, channelId);
        showToast(`Removed line item: ${platformName} (kept strategy section)`);
      }
      closeConfirmSectionDeleteModal();
    });
  }

  if (cancelBtn) cancelBtn.addEventListener('click', closeConfirmSectionDeleteModal);
  if (closeBtn) closeBtn.addEventListener('click', closeConfirmSectionDeleteModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeConfirmSectionDeleteModal();
    });
  }
}

/* ==========================================================================
   Add Channel Strategy Line Item Modal Controller
   ========================================================================== */

function initAddStrategyLineItemModal() {
  const modal = document.getElementById('addStrategyLineItemModal');
  const openTopBtn = document.getElementById('openAddStrategyLineItemTopBtn');
  const closeBtn = document.getElementById('closeAddStrategyLineItemModalBtn');
  const cancelBtn = document.getElementById('cancelAddStrategyLineItemBtn');
  const form = document.getElementById('addStrategyLineItemForm');

  const channelSelect = document.getElementById('stratLineChannelSelect');
  const marketInput = document.getElementById('stratLineMarketInput');
  const audienceInput = document.getElementById('stratLineAudienceInput');
  const prioritySelect = document.getElementById('stratLinePrioritySelect');
  const purposeInput = document.getElementById('stratLinePurposeInput');
  const targetingInput = document.getElementById('stratLineTargetingInput');
  const exclusionsInput = document.getElementById('stratLineExclusionsInput');
  const offerInput = document.getElementById('stratLineOfferInput');
  const splitInput = document.getElementById('stratLineSplitInput');
  const cpcInput = document.getElementById('stratLineCpcInput');
  const cplInput = document.getElementById('stratLineCplInput');

  function populateChannelOptions(selectedStratKey = '') {
    if (!channelSelect) return;
    const tables = BudgetStore.data.strategyTables || {};
    const platforms = BudgetStore.data.dropdownOptions.platforms || [];
    
    // Collect all channel keys
    const availableKeys = new Set(['linkedin', 'meta', 'pinterest', 'wechat', 'youtube']);
    Object.keys(tables).forEach(k => availableKeys.add(k));
    platforms.forEach(p => availableKeys.add(getStratKey(p)));

    channelSelect.innerHTML = Array.from(availableKeys).map(k => {
      const name = getPlatformDisplayName(k);
      const isSel = (k === selectedStratKey || (!selectedStratKey && k === 'linkedin')) ? 'selected' : '';
      return `<option value="${k}" ${isSel}>${name}</option>`;
    }).join('');
  }

  function openModal(prefillStratKey = '', prefillMarket = '') {
    if (!modal) return;
    populateChannelOptions(prefillStratKey);

    if (prefillMarket && marketInput) {
      marketInput.value = prefillMarket;
    } else if (marketInput && !marketInput.value) {
      marketInput.value = 'India';
    }

    if (audienceInput) audienceInput.value = '';
    if (purposeInput) purposeInput.value = '';
    if (targetingInput) targetingInput.value = '';
    if (exclusionsInput) exclusionsInput.value = '';

    modal.style.display = 'flex';
    if (audienceInput) audienceInput.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
  }

  window.openAddStrategyLineItemModal = openModal;

  if (openTopBtn) openTopBtn.addEventListener('click', () => openModal());
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Quick country suggestion chips inside strategy line item modal
  document.querySelectorAll('.strat-market-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.getAttribute('data-val');
      if (val && marketInput) {
        marketInput.value = val;
        if (audienceInput) audienceInput.focus();
      }
    });
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const stratKey = channelSelect ? channelSelect.value : 'linkedin';
      const market = marketInput ? marketInput.value.trim() : 'India';
      const audience = audienceInput ? audienceInput.value.trim() : 'Target Audience';
      const priority = prioritySelect ? prioritySelect.value : 'High';
      const purpose = purposeInput ? purposeInput.value.trim() : 'Strategic lead generation';
      const targeting = targetingInput ? targetingInput.value.trim() : 'Decision makers';
      const exclusions = exclusionsInput ? exclusionsInput.value.trim() : 'Negative criteria';
      const offer = offerInput ? offerInput.value.trim() : 'Work Better Magazine download';
      const split = splitInput ? splitInput.value.trim() : '25%';
      const cpc = cpcInput ? cpcInput.value.trim() : 'USD 4–8';
      const cpl = cplInput ? cplInput.value.trim() : 'USD 45–85';

      BudgetStore.addStrategyLineItem(stratKey, {
        market,
        audience,
        priority,
        purpose,
        targeting,
        exclusions,
        offer,
        split,
        cpc,
        cpl
      });

      closeModal();

      // Scroll to channel section
      setTimeout(() => {
        const sec = document.getElementById(`channel-${stratKey}`);
        if (sec && typeof sec.scrollIntoView === 'function') sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    });
  }
}

/* ==========================================================================
   Add New Channel Strategy Modal Controller
   ========================================================================== */

function initAddChannelModal() {
  const modal = document.getElementById('addChannelModal');
  const openTopBtn = document.getElementById('openAddChannelModalBtn');
  const closeBtn = document.getElementById('closeAddChannelModalBtn');
  const cancelBtn = document.getElementById('cancelAddChannelBtn');
  const form = document.getElementById('addChannelForm');

  const nameInput = document.getElementById('newChannelNameInput');
  const subtitleInput = document.getElementById('newChannelSubtitleInput');
  const calloutInput = document.getElementById('newChannelCalloutInput');
  const marketInput = document.getElementById('newChannelMarketInput');
  const audienceInput = document.getElementById('newChannelAudienceInput');
  const targetingInput = document.getElementById('newChannelTargetingInput');
  const offerInput = document.getElementById('newChannelOfferInput');

  function openModal() {
    if (!modal) return;
    if (nameInput) nameInput.value = '';
    modal.style.display = 'flex';
    if (nameInput) nameInput.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
  }

  window.openAddChannelModal = openModal;

  if (openTopBtn) openTopBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Quick suggestion chips
  document.querySelectorAll('.new-channel-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.getAttribute('data-val');
      if (val && nameInput) {
        nameInput.value = val;
        if (subtitleInput) {
          if (val === 'YouTube') subtitleInput.value = 'High-impact video storytelling, executive awareness, and precision workplace audience engagement.';
          else if (val === 'TikTok') subtitleInput.value = 'Short-form visual engagement, brand storytelling, and creator-led workplace innovation reach.';
          else if (val === 'Google Ads') subtitleInput.value = 'High-intent search capture for commercial furniture, workplace fitout, and office design.';
          else subtitleInput.value = `Tactical segmentation, targeting criteria, and lead acquisition strategy for ${val}.`;
        }
      }
    });
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = nameInput ? nameInput.value.trim() : '';
      if (!name) return;

      const subtitle = subtitleInput ? subtitleInput.value.trim() : '';
      const callout = calloutInput ? calloutInput.value.trim() : '';
      const market = marketInput ? marketInput.value.trim() : 'India';
      const audience = audienceInput ? audienceInput.value.trim() : `${name} Target Audience`;
      const targeting = targetingInput ? targetingInput.value.trim() : 'Enterprise decision makers';
      const offer = offerInput ? offerInput.value.trim() : 'Work Better Magazine download';

      const initialRow = {
        market,
        audience,
        priority: "High",
        purpose: subtitle || `Drive B2B awareness and pipeline on ${name}`,
        targeting,
        exclusions: "Competitors, junior roles, non-business consumer queries",
        offer,
        cpc: "USD 2–5",
        cpl: "USD 35–70",
        split: "100%"
      };

      BudgetStore.addNewChannelSection({
        name,
        subtitle,
        callout,
        initialRow
      });

      closeModal();
    });
  }
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

  // JSON Export (if present)
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

  // CSV Export with all 12 calendar months
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      const monthHeaders = ALL_MONTHS.map(m => MONTH_SHORT_LABELS[m]).join(',');
      let csv = `Market,Platform,Objective,Audience Type,Idea / Offer,Budget %,Budget (USD),${monthHeaders}\n`;

      BudgetStore.data.markets.forEach(m => {
        m.channels.forEach(ch => {
          const monthVals = ALL_MONTHS.map(m => (ch.months && ch.months[m]) || 0);
          const row = [
            `"${m.name}"`,
            `"${ch.platform}"`,
            `"${(ch.objective || '').replace(/"/g, '""')}"`,
            `"${(ch.audienceType || '').replace(/"/g, '""')}"`,
            `"${(ch.offer || '').replace(/"/g, '""')}"`,
            `"${ch.budgetPercent.toFixed(1)}%"`,
            ch.budgetUSD,
            ...monthVals
          ];
          csv += row.join(',') + '\n';
        });
      });

      const { grandTotal, monthTotals } = BudgetStore.summary;
      const totalMonthVals = ALL_MONTHS.map(m => monthTotals[m] || 0).join(',');
      csv += `\n"Total Program Spend","","","","",100%,${grandTotal},${totalMonthVals}\n`;

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
      updateHeaderControlsVisibility();
      renderMainBudgetTable();
      showToast('Planning Mode enabled: Edit cells, add channels & countries');
    });

    presentBtn.addEventListener('click', () => {
      presentBtn.classList.add('active');
      planBtn.classList.remove('active');
      APP_STATE.isEditMode = false;
      document.body.classList.remove('edit-mode-active');
      closeDropdownMenu();
      updateHeaderControlsVisibility();
      renderMainBudgetTable();
      showToast('Presentation View enabled (Clean view)');
    });
  }
}

function updateHeaderControlsVisibility() {
  const controlsGroup = document.getElementById('headerControlsGroup');
  const adminBtn = document.getElementById('openAdminSettingsBtn');
  const exportGroup = document.querySelector('.export-btn-group');
  if (!controlsGroup) return;

  if (!APP_STATE.currentUser) {
    controlsGroup.style.display = 'none';
    return;
  }
  controlsGroup.style.display = 'flex';

  if (APP_STATE.isEditMode) {
    if (adminBtn) adminBtn.style.display = 'inline-flex';
    if (exportGroup) exportGroup.style.display = 'inline-flex';
  } else {
    if (adminBtn) adminBtn.style.display = 'none';
    if (exportGroup) exportGroup.style.display = 'none';
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
  // Ensure ardentcentury@gmail.com is seeded with 332323
  const ardentHash = await hashPassword('332323');
  users['ardentcentury@gmail.com'] = {
    email: 'ardentcentury@gmail.com',
    passwordHash: ardentHash,
    role: 'Admin',
    createdAt: users['ardentcentury@gmail.com']?.createdAt || new Date().toISOString()
  };
  if (!users['admin@steelcase.com']) {
    const adminHash = await hashPassword('admin123');
    users['admin@steelcase.com'] = {
      email: 'admin@steelcase.com',
      passwordHash: adminHash,
      role: 'Editor',
      createdAt: new Date().toISOString()
    };
  }
  saveUsers(users);
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

      const role = (email === 'ardentcentury@gmail.com') ? 'Admin' : 'Editor';
      users[email] = { email, passwordHash: hash, role, createdAt: new Date().toISOString() };
      saveUsers(users);
      APP_STATE.currentUser = { email };
      localStorage.setItem('steelcase_auth_session', JSON.stringify({ email }));
      closeModal();
      updateAuthUI();
      if (typeof FirestoreSyncManager !== 'undefined' && FirestoreSyncManager.registerUser) {
        FirestoreSyncManager.registerUser(email, role);
      }
      showToast(`Welcome, ${email}! Account created.`);
    } else {
      const user = users[email];
      if (!user || user.passwordHash !== hash) {
        showAuthError('Invalid email or password. Please try again.');
        return;
      }

      APP_STATE.currentUser = { email };
      localStorage.setItem('steelcase_auth_session', JSON.stringify({ email }));
      closeModal();
      updateAuthUI();
      if (typeof FirestoreSyncManager !== 'undefined' && FirestoreSyncManager.registerUser) {
        FirestoreSyncManager.registerUser(email, user.role || 'Editor');
      }
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
    updateHeaderControlsVisibility();
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
  const body = document.body;
  
  // Enforce clean light (black & white) mode always and remove any dark theme persistence
  localStorage.removeItem('steelcase_theme');
  body.classList.remove('theme-night');
  body.classList.add('theme-light');

  const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', async () => {
      const originalHtml = printBtn.innerHTML;
      printBtn.disabled = true;
      printBtn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>
        <span>Downloading...</span>
      `;

      showToast('Preparing clean executive PDF proposal...', 'info');

      try {
        if (typeof html2pdf !== 'undefined') {
          const element = document.querySelector('.main-content');
          const opt = {
            margin: [6, 8, 6, 8],
            filename: 'Steelcase_Media_Proposal_July_2026.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
              scale: 2, 
              useCORS: true, 
              logging: false,
              scrollY: 0
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
            pagebreak: { mode: ['css', 'legacy'] }
          };

          await html2pdf().set(opt).from(element).save();
          showToast('PDF proposal downloaded successfully!', 'success');
        } else {
          window.print();
        }
      } catch (err) {
        console.warn('Direct PDF download fallback to print engine:', err);
        window.print();
      } finally {
        printBtn.disabled = false;
        printBtn.innerHTML = originalHtml;
      }
    });
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

/* ==========================================================================
   Theme & Color Customizer Manager
   ========================================================================== */

const THEME_PRESETS = {
  steelcase: {
    name: 'Steelcase Teal',
    '--header-bg': '#ffffff',
    '--header-text': '#0f172a',
    '--hero-bg': '#ffffff',
    '--hero-text': '#0f172a',
    '--bg-strategy-header': '#ffffff',
    '--primary': '#0096a7',
    '--bg-body': '#f8fafc',
    '--bg-surface': '#ffffff',
    '--table-header-bg': '#f8fafc',
    '--text-primary': '#0f172a',
    '--text-secondary': '#475569',
    '--border-subtle': '#e2e8f0'
  },
  monochrome: {
    name: 'Black & White Clean',
    '--header-bg': '#ffffff',
    '--header-text': '#0f172a',
    '--hero-bg': '#ffffff',
    '--hero-text': '#0f172a',
    '--bg-strategy-header': '#f8fafc',
    '--primary': '#0f172a',
    '--bg-body': '#ffffff',
    '--bg-surface': '#ffffff',
    '--table-header-bg': '#f8fafc',
    '--text-primary': '#0f172a',
    '--text-secondary': '#475569',
    '--border-subtle': '#e2e8f0'
  },
  nordic: {
    name: 'Nordic Slate',
    '--header-bg': '#f1f5f9',
    '--header-text': '#0f172a',
    '--hero-bg': '#e2e8f0',
    '--hero-text': '#0f172a',
    '--bg-strategy-header': '#e2e8f0',
    '--primary': '#2563eb',
    '--bg-body': '#f8fafc',
    '--bg-surface': '#ffffff',
    '--table-header-bg': '#f1f5f9',
    '--text-primary': '#0f172a',
    '--text-secondary': '#475569',
    '--border-subtle': '#cbd5e1'
  },
  emerald: {
    name: 'Emerald Mint',
    '--header-bg': '#064e3b',
    '--header-text': '#ffffff',
    '--hero-bg': '#065f46',
    '--hero-text': '#ffffff',
    '--bg-strategy-header': '#065f46',
    '--primary': '#059669',
    '--bg-body': '#f0fdf4',
    '--bg-surface': '#ffffff',
    '--table-header-bg': '#e6f4ea',
    '--text-primary': '#064e3b',
    '--text-secondary': '#047857',
    '--border-subtle': '#a7f3d0'
  },
  royal: {
    name: 'Royal Sapphire',
    '--header-bg': '#1e3a8a',
    '--header-text': '#ffffff',
    '--hero-bg': '#172554',
    '--hero-text': '#ffffff',
    '--bg-strategy-header': '#172554',
    '--primary': '#2563eb',
    '--bg-body': '#f8fafc',
    '--bg-surface': '#ffffff',
    '--table-header-bg': '#dbeafe',
    '--text-primary': '#0f172a',
    '--text-secondary': '#3b82f6',
    '--border-subtle': '#bfdbfe'
  },
  terracotta: {
    name: 'Terracotta',
    '--header-bg': '#431407',
    '--header-text': '#fef3c7',
    '--hero-bg': '#7c2d12',
    '--hero-text': '#ffffff',
    '--bg-strategy-header': '#7c2d12',
    '--primary': '#ea580c',
    '--bg-body': '#fafaf9',
    '--bg-surface': '#ffffff',
    '--table-header-bg': '#ffedd5',
    '--text-primary': '#292524',
    '--text-secondary': '#78716c',
    '--border-subtle': '#fed7aa'
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

/* ==========================================================================
   Firestore Real-Time Sync Engine (Google Sheets Style)
   ========================================================================== */

const FirestoreSyncManager = {
  db: null,
  activeDocRef: null,
  unsubscribeDoc: null,
  unsubscribeUsers: null,
  isRemoteUpdating: false,
  debounceTimer: null,
  activeProposalId: 'steelcase_july_2026',
  status: 'offline', // 'connected', 'connecting', 'offline'

  getDefaultConfig() {
    const custom = localStorage.getItem('steelcase_firebase_config');
    if (custom) {
      try { return JSON.parse(custom); } catch (e) {}
    }
    return {
      apiKey: "AIzaSyDemoPlaceholderKey1234567890",
      authDomain: "steelcase-media-plan.firebaseapp.com",
      projectId: "steelcase-media-plan",
      storageBucket: "steelcase-media-plan.appspot.com",
      messagingSenderId: "123456789012",
      appId: "1:123456789012:web:abcdef1234567890"
    };
  },

  init() {
    this.updateStatusUI();
    if (window.FirebaseSDK) {
      this.setupConnection();
    } else {
      window.addEventListener('firebase-sdk-ready', () => this.setupConnection(), { once: true });
    }
  },

  setupConnection() {
    if (!window.FirebaseSDK) return;
    try {
      const config = this.getDefaultConfig();
      this.status = 'connecting';
      this.updateStatusUI();

      const app = window.FirebaseSDK.initializeApp(config);
      this.db = window.FirebaseSDK.getFirestore(app);
      this.activeDocRef = window.FirebaseSDK.doc(this.db, "proposals", this.activeProposalId);

      this.startListening();
      this.listenToUsers();

      this.status = 'connected';
      this.updateStatusUI();
    } catch (err) {
      console.warn('Firestore fallback mode:', err.message);
      this.status = 'offline';
      this.updateStatusUI();
    }
  },

  startListening() {
    if (!this.db || !this.activeDocRef || !window.FirebaseSDK) return;
    if (this.unsubscribeDoc) this.unsubscribeDoc();

    try {
      this.unsubscribeDoc = window.FirebaseSDK.onSnapshot(this.activeDocRef, (docSnap) => {
        if (this.isRemoteUpdating) return;
        if (docSnap.exists()) {
          const remoteData = docSnap.data();
          if (remoteData && remoteData.planData) {
            const remoteUpdated = remoteData.updatedAt || 0;
            const localUpdated = BudgetStore.data?._lastUpdated || 0;

            if (remoteUpdated > localUpdated) {
              this.isRemoteUpdating = true;
              BudgetStore.data = remoteData.planData;
              BudgetStore.data._lastUpdated = remoteUpdated;
              BudgetStore.recalculate();
              renderAll();

              if (remoteData.customColors) {
                applyRemoteColors(remoteData.customColors);
              }

              if (remoteData.updatedBy && remoteData.updatedBy !== APP_STATE.currentUser?.email) {
                showToast(`Live update from ${remoteData.updatedBy}`);
              }
              setTimeout(() => { this.isRemoteUpdating = false; }, 300);
            }
          }
        } else {
          this.pushUpdate(true);
        }
      }, (error) => {
        console.warn("Firestore snapshot notice:", error.message);
        this.status = 'offline';
        this.updateStatusUI();
      });
    } catch (e) {
      console.warn("Snapshot start error:", e);
    }
  },

  pushUpdate(immediate = false) {
    if (!this.db || !this.activeDocRef || !window.FirebaseSDK) return;
    if (this.isRemoteUpdating) return;

    clearTimeout(this.debounceTimer);
    const doWrite = async () => {
      try {
        const now = Date.now();
        if (BudgetStore.data) BudgetStore.data._lastUpdated = now;
        const payload = {
          planData: BudgetStore.data,
          customColors: getStoredCustomColors(),
          updatedAt: now,
          updatedBy: APP_STATE.currentUser?.email || 'Anonymous Planner'
        };
        await window.FirebaseSDK.setDoc(this.activeDocRef, payload, { merge: true });
      } catch (err) {
        console.warn("Firestore write notice:", err.message);
      }
    };

    if (immediate) {
      doWrite();
    } else {
      this.debounceTimer = setTimeout(doWrite, 250);
    }
  },

  async registerUser(email, role = 'Editor') {
    if (!email) return;
    const userObj = {
      email,
      role: email === 'ardentcentury@gmail.com' ? 'Admin' : role,
      lastLogin: new Date().toISOString(),
      status: 'Active'
    };

    const users = getUsers();
    if (!users[email]) {
      users[email] = { ...userObj, createdAt: new Date().toISOString() };
    } else {
      users[email].lastLogin = userObj.lastLogin;
      users[email].role = userObj.role;
    }
    saveUsers(users);

    if (this.db && window.FirebaseSDK) {
      try {
        const userDocId = email.replace(/[@.]/g, '_');
        await window.FirebaseSDK.setDoc(window.FirebaseSDK.doc(this.db, "users", userDocId), users[email], { merge: true });
      } catch (e) {
        console.warn("User sync notice:", e.message);
      }
    }
    renderAdminUsers();
  },

  listenToUsers() {
    if (!this.db || !window.FirebaseSDK) return;
    try {
      const usersCol = window.FirebaseSDK.collection(this.db, "users");
      window.FirebaseSDK.onSnapshot(usersCol, (snapshot) => {
        const users = getUsers();
        snapshot.forEach(docSnap => {
          const u = docSnap.data();
          if (u && u.email) {
            users[u.email] = { ...users[u.email], ...u };
          }
        });
        saveUsers(users);
        renderAdminUsers();
      });
    } catch (e) {
      console.warn("Users listen error:", e);
    }
  },

  updateStatusUI() {
    const dot = document.getElementById('firestoreStatusDot');
    const title = document.getElementById('firestoreStatusTitle');
    const desc = document.getElementById('firestoreStatusDesc');
    if (!dot || !title) return;

    if (this.status === 'connected') {
      dot.className = 'live-dot-pulse';
      dot.style.backgroundColor = '#10b981';
      title.textContent = 'Connected to Cloud Firestore (Real-Time Live)';
      if (desc) desc.textContent = 'Multiplayer live sync active: all budget & strategy edits sync instantly across browsers (Google Sheets style).';
    } else if (this.status === 'connecting') {
      dot.className = 'live-dot-pulse';
      dot.style.backgroundColor = '#f59e0b';
      title.textContent = 'Connecting to Cloud Firestore...';
      if (desc) desc.textContent = 'Establishing live sync connection to your Firestore database.';
    } else {
      dot.className = 'live-dot-pulse offline';
      title.textContent = 'Offline / Local Storage Active';
      if (desc) desc.textContent = 'Changes are saved locally. Connect your Firebase credentials in the tab below to enable live multiplayer sync.';
    }
  }
};

function applyRemoteColors(colorsObj) {
  if (!colorsObj) return;
  Object.keys(colorsObj).forEach(k => {
    document.documentElement.style.setProperty(k, colorsObj[k]);
  });
  localStorage.setItem('steelcase_theme_custom_colors', JSON.stringify(colorsObj));
  syncThemeInputs(colorsObj);
}

function getStoredCustomColors() {
  try {
    const raw = localStorage.getItem('steelcase_theme_custom_colors');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveCustomColors(colorsObj) {
  try {
    localStorage.setItem('steelcase_theme_custom_colors', JSON.stringify(colorsObj));
    if (typeof FirestoreSyncManager !== 'undefined' && FirestoreSyncManager.pushUpdate) {
      FirestoreSyncManager.pushUpdate();
    }
  } catch (e) {}
}

function syncThemeInputs(colorsObj) {
  document.querySelectorAll('.color-swatch-input').forEach(picker => {
    const varName = picker.getAttribute('data-var');
    if (colorsObj && colorsObj[varName]) {
      picker.value = colorsObj[varName];
    }
  });

  document.querySelectorAll('.color-hex-text').forEach(textInput => {
    const varName = textInput.getAttribute('data-var');
    if (colorsObj && colorsObj[varName]) {
      textInput.value = colorsObj[varName];
    }
  });
}

function renderAdminUsers() {
  const tbody = document.getElementById('adminUsersTableBody');
  const countBadge = document.getElementById('adminUserCountBadge');
  if (!tbody) return;

  const users = getUsers();
  if (!users['ardentcentury@gmail.com']) {
    users['ardentcentury@gmail.com'] = {
      email: 'ardentcentury@gmail.com',
      role: 'Admin',
      createdAt: new Date().toISOString(),
      status: 'Active'
    };
  }

  const userList = Object.values(users);
  if (countBadge) countBadge.textContent = userList.length;

  tbody.innerHTML = userList.map(u => {
    const isCurrent = APP_STATE.currentUser && APP_STATE.currentUser.email === u.email;
    const roleBadge = u.role === 'Admin'
      ? '<span class="status-badge" style="background: rgba(0, 150, 167, 0.15); color: var(--primary); font-weight: 700;">Admin</span>'
      : '<span class="status-badge" style="background: rgba(100, 116, 139, 0.15); color: #475569;">Editor</span>';
    const dateStr = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active';
    const statusBadge = isCurrent
      ? '<span class="status-badge" style="background: rgba(16, 185, 129, 0.15); color: #059669;">● Online</span>'
      : '<span class="status-badge" style="background: rgba(148, 163, 184, 0.15); color: #64748b;">Offline</span>';

    return `
      <tr style="border-bottom: 1px solid var(--border-subtle);">
        <td style="padding: 10px 12px; font-weight: 600; color: var(--text-primary);">
          ${escapeHtml(u.email)} ${isCurrent ? '<span style="font-size: 11px; opacity: 0.7;">(You)</span>' : ''}
        </td>
        <td style="padding: 10px 12px;">${roleBadge}</td>
        <td style="padding: 10px 12px; font-size: 12.5px; color: var(--text-secondary);">${dateStr}</td>
        <td style="padding: 10px 12px;">${statusBadge}</td>
      </tr>
    `;
  }).join('');
}

function loadFirebaseConfigInput() {
  const textarea = document.getElementById('firebaseConfigInput');
  if (!textarea) return;
  const cfg = FirestoreSyncManager.getDefaultConfig();
  textarea.value = JSON.stringify(cfg, null, 2);
}

function initFirebaseConfigHandlers() {
  const saveBtn = document.getElementById('saveFirebaseConfigBtn');
  const resetBtn = document.getElementById('resetFirebaseConfigBtn');
  const statusEl = document.getElementById('firebaseSaveStatus');
  const forceSyncBtn = document.getElementById('forceSyncFirestoreBtn');
  const refreshUsersBtn = document.getElementById('refreshUsersListBtn');

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const textarea = document.getElementById('firebaseConfigInput');
      if (!textarea) return;
      try {
        const parsed = JSON.parse(textarea.value.trim());
        localStorage.setItem('steelcase_firebase_config', JSON.stringify(parsed));
        FirestoreSyncManager.setupConnection();
        if (statusEl) {
          statusEl.textContent = '✓ Config saved! Connecting...';
          statusEl.style.color = '#10b981';
          setTimeout(() => { statusEl.textContent = ''; }, 3000);
        }
        showToast('Firebase credentials saved & connecting');
      } catch (err) {
        alert('Invalid JSON format for Firebase configuration. Please verify.');
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem('steelcase_firebase_config');
      loadFirebaseConfigInput();
      FirestoreSyncManager.setupConnection();
      showToast('Firebase configuration reset to default');
    });
  }

  if (forceSyncBtn) {
    forceSyncBtn.addEventListener('click', () => {
      FirestoreSyncManager.pushUpdate(true);
      showToast('Pushed all latest plan data to Firestore');
    });
  }

  if (refreshUsersBtn) {
    refreshUsersBtn.addEventListener('click', () => {
      renderAdminUsers();
      showToast('Refreshed user directory');
    });
  }
}

/* ==========================================================================
   Admin Portal & Theme Customizer Initialization
   ========================================================================== */

function initThemeCustomizer() {
  const modal = document.getElementById('adminPortalModal');
  const openBtn = document.getElementById('openAdminSettingsBtn');
  const closeBtn = document.getElementById('closeAdminPortalModalBtn');
  const doneBtn = document.getElementById('closeAdminModalDoneBtn');
  const resetBtn = document.getElementById('resetThemeDefaultBtn');
  const presetsContainer = document.getElementById('themePresetsContainer');
  const adminLockForm = document.getElementById('adminLockForm');
  const lockView = document.getElementById('adminAuthLockView');
  const mainView = document.getElementById('adminPortalMainView');

  function applyColor(cssVar, colorVal) {
    if (!cssVar || !colorVal) return;
    document.documentElement.style.setProperty(cssVar, colorVal);
    if (cssVar === '--hero-bg') {
      document.documentElement.style.setProperty('--bg-strategy-header', colorVal);
    }
    if (cssVar === '--primary') {
      document.documentElement.style.setProperty('--primary-hover', colorVal);
      document.documentElement.style.setProperty('--primary-light', `${colorVal}15`);
      document.documentElement.style.setProperty('--primary-border', `${colorVal}40`);
    }
  }

  function applyPreset(presetKey) {
    const preset = THEME_PRESETS[presetKey];
    if (!preset) return;

    const colorsToSave = {};
    Object.keys(preset).forEach(k => {
      if (k.startsWith('--')) {
        applyColor(k, preset[k]);
        colorsToSave[k] = preset[k];
      }
    });

    saveCustomColors(colorsToSave);
    syncThemeInputs(colorsToSave);

    if (presetsContainer) {
      presetsContainer.querySelectorAll('.theme-preset-card').forEach(c => {
        if (c.getAttribute('data-preset') === presetKey) {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });
    }

    if (window.showToast) {
      showToast(`Applied ${preset.name} theme palette`);
    }
  }

  // Initial load of custom colors
  const savedColors = getStoredCustomColors();
  if (savedColors) {
    Object.keys(savedColors).forEach(k => {
      applyColor(k, savedColors[k]);
    });
    syncThemeInputs(savedColors);
  }

  // Connect color swatch inputs
  document.querySelectorAll('.color-swatch-input').forEach(picker => {
    picker.addEventListener('input', (e) => {
      const varName = picker.getAttribute('data-var');
      const val = e.target.value;
      applyColor(varName, val);

      const textInput = document.querySelector(`.color-hex-text[data-var="${varName}"]`);
      if (textInput) textInput.value = val;

      const current = getStoredCustomColors() || { ...THEME_PRESETS.steelcase };
      current[varName] = val;
      saveCustomColors(current);

      if (presetsContainer) {
        presetsContainer.querySelectorAll('.theme-preset-card').forEach(c => c.classList.remove('active'));
      }
    });
  });

  // Connect hex text inputs
  document.querySelectorAll('.color-hex-text').forEach(textInput => {
    textInput.addEventListener('input', (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith('#')) val = `#${val}`;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        const varName = textInput.getAttribute('data-var');
        applyColor(varName, val);

        const picker = document.querySelector(`.color-swatch-input[data-var="${varName}"]`);
        if (picker) picker.value = val;

        const current = getStoredCustomColors() || { ...THEME_PRESETS.steelcase };
        current[varName] = val;
        saveCustomColors(current);

        if (presetsContainer) {
          presetsContainer.querySelectorAll('.theme-preset-card').forEach(c => c.classList.remove('active'));
        }
      }
    });
  });

  // Connect preset buttons
  if (presetsContainer) {
    presetsContainer.querySelectorAll('.theme-preset-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const presetKey = btn.getAttribute('data-preset');
        applyPreset(presetKey);
      });
    });
  }

  // Reset Button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem('steelcase_theme_custom_colors');
      const defaultPreset = THEME_PRESETS.steelcase;
      Object.keys(defaultPreset).forEach(k => {
        if (k.startsWith('--')) {
          document.documentElement.style.removeProperty(k);
        }
      });
      syncThemeInputs(defaultPreset);
      if (presetsContainer) {
        presetsContainer.querySelectorAll('.theme-preset-card').forEach(c => {
          if (c.getAttribute('data-preset') === 'steelcase') c.classList.add('active');
          else c.classList.remove('active');
        });
      }
      if (window.showToast) showToast('Reset theme to default Steelcase palette');
    });
  }

  // Admin Tab Navigation
  const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
  adminTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabKey = btn.getAttribute('data-admin-tab');
      adminTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.admin-tab-content').forEach(p => p.style.display = 'none');
      if (tabKey === 'theme') {
        const p = document.getElementById('adminTabThemeContent');
        if (p) p.style.display = 'block';
      } else if (tabKey === 'users') {
        const p = document.getElementById('adminTabUsersContent');
        if (p) {
          p.style.display = 'block';
          renderAdminUsers();
        }
      } else if (tabKey === 'firestore') {
        const p = document.getElementById('adminTabFirestoreContent');
        if (p) {
          p.style.display = 'block';
          loadFirebaseConfigInput();
        }
      }
    });
  });

  // Admin Lock Form Authentication
  if (adminLockForm) {
    adminLockForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pwdInput = document.getElementById('adminLockPassword');
      const lockErr = document.getElementById('adminLockError');

      if (pwdInput && pwdInput.value.trim() === '332323') {
        APP_STATE.currentUser = { email: 'ardentcentury@gmail.com' };
        localStorage.setItem('steelcase_auth_session', JSON.stringify({ email: 'ardentcentury@gmail.com' }));
        updateAuthUI();
        if (lockView) lockView.style.display = 'none';
        if (mainView) mainView.style.display = 'block';
        renderAdminUsers();
        loadFirebaseConfigInput();
        showToast('Admin Portal unlocked');
      } else {
        if (lockErr) {
          lockErr.textContent = 'Incorrect admin password. Access denied.';
          lockErr.style.display = 'block';
        }
      }
    });
  }

  // Open / Close Admin Modal Handlers
  function openModal() {
    if (!modal) return;
    const isAuthedAdmin = APP_STATE.currentUser && APP_STATE.currentUser.email === 'ardentcentury@gmail.com';

    if (isAuthedAdmin) {
      if (lockView) lockView.style.display = 'none';
      if (mainView) mainView.style.display = 'block';
      renderAdminUsers();
      loadFirebaseConfigInput();
    } else {
      if (lockView) lockView.style.display = 'block';
      if (mainView) mainView.style.display = 'none';
      const pwdInput = document.getElementById('adminLockPassword');
      if (pwdInput) {
        pwdInput.value = '';
        setTimeout(() => pwdInput.focus(), 150);
      }
      const lockErr = document.getElementById('adminLockError');
      if (lockErr) lockErr.style.display = 'none';
    }

    const current = getStoredCustomColors() || THEME_PRESETS.steelcase;
    syncThemeInputs(current);
    modal.style.display = 'flex';
  }

  function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
  }

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (doneBtn) doneBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

// Global Application Startup
document.addEventListener('DOMContentLoaded', () => {
  initThemeAndNav();
  initThemeCustomizer();
  BudgetStore.init();
  renderAll();
  initDropdownManager();
  initAddLineItemModal();
  initAddStrategyLineItemModal();
  initAddChannelModal();
  initSectionDeleteConfirmModal();
  initPresetsAndExport();
  initDeckFilterTabs();
  initAuthManager();
  FirestoreSyncManager.init();
  initFirebaseConfigHandlers();
  updateHeaderControlsVisibility();
});
