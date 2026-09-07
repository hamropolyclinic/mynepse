import { StockFundamental, FinancialFactor, StockFinancialHealthProfile } from '../types/nepse';

interface CuratedStrengthsRisks {
  strengths: FinancialFactor[];
  risks: FinancialFactor[];
  keyTakeaway: string;
}

export const CURATED_FINANCIAL_PROFILES: Record<string, CuratedStrengthsRisks> = {
  LEC: {
    strengths: [
      {
        id: 'lec-s1',
        title: 'Commercial Generation Milestone',
        description: 'Achieved commercial operation for the 25 MW Upper Dordi "A" Hydroelectric Project in Lamjung, transitioning the company from gestation to operational revenue generation.',
        category: 'Operational & Industry Moat',
        impact: 'High',
        metricHighlight: '25 MW Grid Connected'
      },
      {
        id: 'lec-s2',
        title: 'Guaranteed Long-Term PPA Off-Take',
        description: 'Secured a 30-year sovereign Power Purchase Agreement with Nepal Electricity Authority (NEA) featuring fixed escalation tariffs that shield top-line revenue from market price volatility.',
        category: 'Regulatory & Policy',
        impact: 'High',
        metricHighlight: '30-Yr Sovereign PPA'
      },
      {
        id: 'lec-s3',
        title: 'Promoter Lock-In Overhang Cleared',
        description: 'Mandatory 3-year promoter share lock-in period has officially expired with SEBON clearance, eliminating uncertainty around sudden institutional supply overhang.',
        category: 'Market & Liquidity',
        impact: 'Moderate',
        metricHighlight: '100% Tradable Units'
      },
      {
        id: 'lec-s4',
        title: 'Clean Energy Pipeline Potential',
        description: 'Experienced board and engineering team possessing rights and early-stage studies for downstream cascade projects in the Dordi river corridor.',
        category: 'Profitability & Earnings',
        impact: 'Moderate',
        metricHighlight: 'Cascade Expansion'
      }
    ],
    risks: [
      {
        id: 'lec-r1',
        title: 'Debt Servicing & Leverage Burden',
        description: 'High project construction debt with consortium banks requires substantial debt servicing cash flows, which limits distributable dividend capacity in initial operational years.',
        category: 'Solvency & Leverage',
        impact: 'High',
        metricHighlight: 'Debt Service Priority'
      },
      {
        id: 'lec-r2',
        title: 'Dry-Season Hydrology Fluctuations',
        description: 'Run-of-the-river (RoR) design exposes electricity generation to significant drops during winter/dry months (Poush-Chaitra) compared to peak monsoon output.',
        category: 'Operational & Industry Moat',
        impact: 'High',
        metricHighlight: 'Dry Season Dip ~60%'
      },
      {
        id: 'lec-r3',
        title: 'Geological & Monsoon Flood Perils',
        description: 'The Himalayan Dordi river corridor has historical vulnerability to flash floods, landslides, and silt sedimentation requiring periodic desanding and maintenance downtime.',
        category: 'Operational & Industry Moat',
        impact: 'Moderate',
        metricHighlight: 'Himalayan Flood Zone'
      },
      {
        id: 'lec-r4',
        title: 'Elevated Beta & Speculative Swings',
        description: 'With a market beta of 1.24, the stock experiences above-average price swings compared to the benchmark NEPSE Hydro Sub-index.',
        category: 'Market & Liquidity',
        impact: 'Moderate',
        metricHighlight: 'Beta: 1.24'
      }
    ],
    keyTakeaway: 'Operational 25 MW generation backed by sovereign PPA provides steady baseline cash flows; primary medium-term focus remains deleveraging debt to unlock shareholder dividend distribution.'
  },

  CHCL: {
    strengths: [
      {
        id: 'chcl-s1',
        title: 'Debt-Free Flagship Mother Plant',
        description: 'The primary 22.1 MW Chilime hydropower plant is fully depreciated and completely debt-free, translating gross electricity sales into superior net operating margins.',
        category: 'Solvency & Leverage',
        impact: 'High',
        metricHighlight: 'Zero Debt Mother Plant'
      },
      {
        id: 'chcl-s2',
        title: 'Massive 500+ MW Subsidiary Pipeline',
        description: 'Holds substantial equity stakes in mega subsidiary projects including Rasuwagadhi (111 MW), Sanjen (57 MW), and Middle Bhotekoshi (102 MW), positioning CHCL for multi-fold future dividend inflows.',
        category: 'Operational & Industry Moat',
        impact: 'High',
        metricHighlight: '500+ MW Equity Pipeline'
      },
      {
        id: 'chcl-s3',
        title: 'NEA Institutional Sponsorship',
        description: 'Backed by Nepal Electricity Authority (51% shareholding), ensuring seamless grid evacuation, preferred dispatch priority, and robust sovereign technical expertise.',
        category: 'Regulatory & Policy',
        impact: 'High',
        metricHighlight: '51% NEA Backed'
      },
      {
        id: 'chcl-s4',
        title: 'Consistent Dividend Track Record',
        description: 'One of the most reliable dividend payers in NEPSE hydro history, maintaining steady cash and bonus distributions over two decades.',
        category: 'Dividend & Cash Flow',
        impact: 'Moderate',
        metricHighlight: '15%+ Historic Payout'
      }
    ],
    risks: [
      {
        id: 'chcl-r1',
        title: 'Gestation Delays in Subsidiary Hydro Projects',
        description: 'Protracted construction delays and cost escalations in Middle Bhotekoshi and Rasuwagadhi have postponed anticipated equity dividend yields.',
        category: 'Profitability & Earnings',
        impact: 'High',
        metricHighlight: 'Delayed Subsidiary Yields'
      },
      {
        id: 'chcl-r2',
        title: 'Transmission Corridor Bottlenecks',
        description: 'Delays in completion of key Trishuli Basin 220kV transmission line segments periodically constrain full power evacuation during peak monsoon generation.',
        category: 'Operational & Industry Moat',
        impact: 'Moderate',
        metricHighlight: 'Trishuli Basin Grid Risk'
      },
      {
        id: 'chcl-r3',
        title: 'Valuation Premium to Par',
        description: 'Market consistently assigns a holding company valuation premium, pricing in high expectations from future subsidiary commercialization.',
        category: 'Valuation & Multiples',
        impact: 'Moderate',
        metricHighlight: 'Holding Co. Premium'
      }
    ],
    keyTakeaway: 'The gold standard of Nepali hydro with zero parent debt and NEA backing; medium-term valuation upside is directly tethered to subsidiary plant commissioning and dividend flow realization.'
  },

  NABIL: {
    strengths: [
      {
        id: 'nabil-s1',
        title: 'Unrivaled Banking Moat & Scale',
        description: 'Nepal’s flagship private sector commercial bank with the highest balance sheet size, deposit mobilization, and nationwide brand equity.',
        category: 'Operational & Industry Moat',
        impact: 'High',
        metricHighlight: 'Nepal\'s #1 Brand Equity'
      },
      {
        id: 'nabil-s2',
        title: 'Robust Capital Adequacy & Provision Buffers',
        description: 'Capital Adequacy Ratio (CAR) comfortably above NRB regulatory minimums, backed by solid counter-cyclical capital buffers and strong provisioning coverage.',
        category: 'Solvency & Leverage',
        impact: 'High',
        metricHighlight: 'CAR > 12.5%'
      },
      {
        id: 'nabil-s3',
        title: 'Diversified Non-Fund Income Stream',
        description: 'Market-leading non-interest income from Letters of Credit (LC), bank guarantees, trade finance, and remittance fee income.',
        category: 'Profitability & Earnings',
        impact: 'Moderate',
        metricHighlight: 'Top Tier Fee/FX Income'
      },
      {
        id: 'nabil-s4',
        title: 'Foreign Institutional Pedigree',
        description: 'Significant promoter shareholding by NB International Ltd (Ireland), providing global governance standards and operational sophistication.',
        category: 'Regulatory & Policy',
        impact: 'Moderate',
        metricHighlight: 'NB International Backing'
      }
    ],
    risks: [
      {
        id: 'nabil-r1',
        title: 'Systemic Asset Quality & NPL Headwinds',
        description: 'Broad macroeconomic slowdown and stress in real estate and construction contractor loans exert upward pressure on non-performing loans across the sector.',
        category: 'Asset Quality & Credit',
        impact: 'High',
        metricHighlight: 'Rising Industry NPLs'
      },
      {
        id: 'nabil-r2',
        title: 'Net Interest Margin (NIM) Compression',
        description: 'NRB regulatory caps on base rates and interest rate spread ceilings (capped at 4.00%) limit aggressive net interest spread expansion.',
        category: 'Profitability & Earnings',
        impact: 'Moderate',
        metricHighlight: 'Spread Ceiling 4.0%'
      },
      {
        id: 'nabil-r3',
        title: 'Post-Merger Integration Inefficiencies',
        description: 'Integration of former Nepal Bangladesh Bank (NBB) legacy loan books and redundant branch overheads still requires disciplined rationalization.',
        category: 'Operational & Industry Moat',
        impact: 'Low',
        metricHighlight: 'NBB Legacy Loan Cleanup'
      }
    ],
    keyTakeaway: 'Pristine Tier-1 commercial banking powerhouse with industry-leading ROE and fortress balance sheet; key watch-item is managing credit costs amidst macroeconomic credit recovery cycles.'
  },

  NICA: {
    strengths: [
      {
        id: 'nica-s1',
        title: 'Aggressive Retail Footprint & Branch Density',
        description: 'Largest branch footprint in Nepal (360+ branches) and market-leading retail deposit base with deep rural and semi-urban penetration.',
        category: 'Operational & Industry Moat',
        impact: 'High',
        metricHighlight: '360+ Branch Network'
      },
      {
        id: 'nica-s2',
        title: 'Digital Banking Leadership',
        description: 'Pioneer in paperless digital lending, QR merchant ecosystem, and iServe self-service platforms, yielding high transaction-based digital fees.',
        category: 'Profitability & Earnings',
        impact: 'High',
        metricHighlight: 'MoBank Digital Lead'
      },
      {
        id: 'nica-s3',
        title: 'Granular Retail Loan Focus',
        description: 'Strategic shift from lumpy corporate exposures to diversified retail, SME, and micro-business credit lines, reducing single-borrower default risks.',
        category: 'Asset Quality & Credit',
        impact: 'Moderate',
        metricHighlight: 'Granular SME Portfolio'
      }
    ],
    risks: [
      {
        id: 'nica-r1',
        title: 'Regulatory Scrutiny on Rapid Credit Expansion',
        description: 'Past aggressive credit growth resulted in strict monitoring by Nepal Rastra Bank (NRB) regarding capital adequacy compliance and risk-weighted assets.',
        category: 'Regulatory & Policy',
        impact: 'High',
        metricHighlight: 'NRB CAR Surveillance'
      },
      {
        id: 'nica-r2',
        title: 'Asset Quality Deterioration & Elevated Provisions',
        description: 'Macroeconomic slowdown among small retail and SME borrowers has driven higher loan impairment charges and provisioning burdens.',
        category: 'Asset Quality & Credit',
        impact: 'High',
        metricHighlight: 'Loan Impairment Costs'
      },
      {
        id: 'nica-r3',
        title: 'Dividend Distribution Suspension Risk',
        description: 'NRB regulatory directives on Tier-1 capital conservation have restricted cash and bonus dividend distributions until CAR thresholds are reinforced.',
        category: 'Dividend & Cash Flow',
        impact: 'High',
        metricHighlight: 'Dividend Payout Capped'
      }
    ],
    keyTakeaway: 'Industry titan in retail distribution and digital banking; stock re-rating hinges on completing balance sheet consolidation and restoring full NRB capital adequacy clearances.'
  },

  UPPER: {
    strengths: [
      {
        id: 'upper-s1',
        title: 'Nepal\'s Largest Peaking Hydropower Plant',
        description: 'At 456 MW, Upper Tamakoshi is the undisputed crown jewel of Nepal\'s national grid, providing vital peaking energy during peak morning and evening load hours.',
        category: 'Operational & Industry Moat',
        impact: 'High',
        metricHighlight: '456 MW Peaking Energy'
      },
      {
        id: 'upper-s2',
        title: 'Sovereign Institutional Backing',
        description: 'Over 51% owned by public institutions (NEA, Nepal Telecom, Citizen Investment Trust, RBS), ensuring absolute state operational backing and priority grid dispatch.',
        category: 'Regulatory & Policy',
        impact: 'High',
        metricHighlight: 'NEA & Public Sector Float'
      },
      {
        id: 'upper-s3',
        title: 'Cross-Border Regional Power Export Potential',
        description: 'Surplus monsoon power from Tamakoshi is prime electricity exported to India via the Dhalkebar-Muzaffarpur cross-border transmission corridor.',
        category: 'Operational & Industry Moat',
        impact: 'Moderate',
        metricHighlight: 'India Cross-Border Export'
      }
    ],
    risks: [
      {
        id: 'upper-r1',
        title: 'Severe Debt Overhang & Financing Costs',
        description: 'Cost escalations resulting from 2015 earthquake damage and construction delays resulted in massive debt servicing liabilities that compress net profits.',
        category: 'Solvency & Leverage',
        impact: 'High',
        metricHighlight: 'High Finance Costs'
      },
      {
        id: 'upper-r2',
        title: 'Capital Dilution from Mega Rights Offering',
        description: 'Completion of 1:1 rights share issue doubled the equity capital to over 21.19 Crore shares, heavily diluting future per-share earnings (EPS).',
        category: 'Valuation & Multiples',
        impact: 'High',
        metricHighlight: '21.19 Cr Total Shares'
      },
      {
        id: 'upper-r3',
        title: 'Severe Dry-Season Generation Drop',
        description: 'During winter months, lower glacial melt reduces river discharge, curtailing daily output to dedicated 4-hour peak windows.',
        category: 'Profitability & Earnings',
        impact: 'Moderate',
        metricHighlight: 'Winter Hydrology Deficit'
      }
    ],
    keyTakeaway: 'Unmatched physical infrastructure asset with strategic national importance; financial performance is heavily burdened by debt interest payments and high equity share dilution.'
  },

  SHIVM: {
    strengths: [
      {
        id: 'shivm-s1',
        title: 'Top Brand Equity in OPC Cement',
        description: 'Shivam is one of Nepal\'s most recognized premium OPC (Ordinary Portland Cement) brands, preferred for major infrastructure and commercial construction.',
        category: 'Operational & Industry Moat',
        impact: 'High',
        metricHighlight: '#1 OPC Market Brand'
      },
      {
        id: 'shivm-s2',
        title: 'Captive Limestone Quarry in Makwanpur',
        description: 'Owns high-grade captive limestone mines with decades of verified reserves, insulating the firm from clinker sourcing bottlenecks and external raw material spikes.',
        category: 'Solvency & Leverage',
        impact: 'High',
        metricHighlight: 'Captive High-Grade Mines'
      },
      {
        id: 'shivm-s3',
        title: 'Integrated Production Capacity',
        description: 'State-of-the-art clinkerization and grinding facility with captive waste-heat recovery power, optimizing operational energy efficiencies.',
        category: 'Profitability & Earnings',
        impact: 'Moderate',
        metricHighlight: 'Waste Heat Power Recovery'
      }
    ],
    risks: [
      {
        id: 'shivm-r1',
        title: 'Subdued Government Infrastructure Capital Expenditure',
        description: 'Sluggish public capital expenditure (Puji-gat Kharcha) and real estate slowdown have suppressed domestic cement consumption volume.',
        category: 'Operational & Industry Moat',
        impact: 'High',
        metricHighlight: 'Sluggish Capex Spending'
      },
      {
        id: 'shivm-r2',
        title: 'Industry Clinker Overcapacity & Price Wars',
        description: 'Over 20 clinker plants operating across Nepal have created domestic oversupply, sparking aggressive price discounting and margin compression.',
        category: 'Profitability & Earnings',
        impact: 'High',
        metricHighlight: 'Severe Price Competition'
      },
      {
        id: 'shivm-r3',
        title: 'Imported Coal & Fuel Price Exposure',
        description: 'Reliance on imported thermal coal from South Africa/India and diesel makes operating costs vulnerable to international energy and FX volatility.',
        category: 'Solvency & Leverage',
        impact: 'Moderate',
        metricHighlight: 'Imported Coal Exposure'
      }
    ],
    keyTakeaway: 'Premier brand with captive limestone mines providing strong operational moat; earnings recovery requires a revival in domestic capital expenditure and infrastructure budgets.'
  },

  HDL: {
    strengths: [
      {
        id: 'hdl-s1',
        title: 'Dominant Market Share in Branded Spirits',
        description: 'Undisputed leader in Nepal\'s popular branded spirit market with household brands like Golden Oak, Black Oak, and Royal Treasure commanding unmatched shelf space.',
        category: 'Operational & Industry Moat',
        impact: 'High',
        metricHighlight: 'Market Dominance in Spirits'
      },
      {
        id: 'hdl-s2',
        title: 'Exceptional Capital Efficiency (High ROE/ROA)',
        description: 'Consistently delivers industry-leading Return on Equity (>25%) and Return on Assets due to rapid inventory turnover and strong operating leverage.',
        category: 'Profitability & Earnings',
        impact: 'High',
        metricHighlight: 'ROE: 26.5%+'
      },
      {
        id: 'hdl-s3',
        title: 'Virtually Debt-Free Balance Sheet',
        description: 'Robust free cash flow generation enables the company to operate virtually debt-free, insulating it from rising interest rate cycles.',
        category: 'Solvency & Leverage',
        impact: 'High',
        metricHighlight: 'Near Zero Long-Term Debt'
      }
    ],
    risks: [
      {
        id: 'hdl-r1',
        title: 'Aggressive Government Excise Duty Escalation',
        description: 'Annual budget hikes on alcohol excise duties and sticker fees squeeze operating gross margins or require retail price hikes that test consumer elasticity.',
        category: 'Regulatory & Policy',
        impact: 'High',
        metricHighlight: 'Excise Duty Increases'
      },
      {
        id: 'hdl-r2',
        title: 'Counterfeiting & Illicit Border Infiltration',
        description: 'Proximity of open southern border with India facilitates illicit smuggling of untaxed liquor, presenting unauthorized pricing competition.',
        category: 'Operational & Industry Moat',
        impact: 'Moderate',
        metricHighlight: 'Smuggled Competitor Peril'
      },
      {
        id: 'hdl-r3',
        title: 'Raw Material Grain Price Inflation',
        description: 'Volatility in prices of extra neutral alcohol (ENA), broken rice, and corn imports directly impacts blending cost structures.',
        category: 'Profitability & Earnings',
        impact: 'Moderate',
        metricHighlight: 'ENA Grain Price Volatility'
      }
    ],
    keyTakeaway: 'Outstanding financial health with exceptional ROE and negligible leverage; primary operational vulnerability stems from sovereign excise duty escalation and consumer purchasing power shifts.'
  },

  NTC: {
    strengths: [
      {
        id: 'ntc-s1',
        title: 'State-Owned Infrastructure Monopoly',
        description: 'Owns Nepal\'s most extensive optical fiber backbone, sovereign satellite gateways, and ubiquitous 4G/LTE mobile coverage reaching remote border districts.',
        category: 'Operational & Industry Moat',
        impact: 'High',
        metricHighlight: 'Nationwide Fiber Monopoly'
      },
      {
        id: 'ntc-s2',
        title: 'Massive Cash Balances & Zero Bank Debt',
        description: 'Generates tremendous operational cash flow and holds billions of rupees in liquid fixed deposits with commercial banks, yielding significant interest income.',
        category: 'Solvency & Leverage',
        impact: 'High',
        metricHighlight: 'Zero Bank Debt'
      },
      {
        id: 'ntc-s3',
        title: 'Consistent High Cash Dividend Policy',
        description: 'Historically distributes attractive cash dividends to shareholders (30%–40%+ annually), backed by Government of Nepal treasury dividend targets.',
        category: 'Dividend & Cash Flow',
        impact: 'High',
        metricHighlight: '30-40% Cash Dividend'
      }
    ],
    risks: [
      {
        id: 'ntc-r1',
        title: 'Cannibalization from OTT Platforms (Voice Deficit)',
        description: 'Rapid consumer shift to free VoIP services (WhatsApp, Viber, Messenger) continues to erode high-margin international and domestic voice call revenues.',
        category: 'Profitability & Earnings',
        impact: 'High',
        metricHighlight: 'Voice Revenue Cannibalization'
      },
      {
        id: 'ntc-r2',
        title: 'Fierce Private ISP Price Wars in FTTH',
        description: 'Aggressive private Internet Service Providers (WorldLink, Vianet, DishHome) wage intense price competition for residential fiber-to-the-home connections.',
        category: 'Operational & Industry Moat',
        impact: 'Moderate',
        metricHighlight: 'FTTH Bandwidth Price War'
      },
      {
        id: 'ntc-r3',
        title: 'State Enterprise Procurement Red-Tape',
        description: 'Public Procurement Act compliance often delays critical 5G hardware rollouts and software upgrades relative to nimbler private competitors.',
        category: 'Regulatory & Policy',
        impact: 'Moderate',
        metricHighlight: 'Public Procurement Delays'
      }
    ],
    keyTakeaway: 'Unassailable physical infrastructure moat with fortress liquidity and high dividend yield; structural growth is constrained by voice revenue erosion and private broadband price wars.'
  },

  CIT: {
    strengths: [
      {
        id: 'cit-s1',
        title: 'Statutory Inflow Monopoly of National Savings',
        description: 'Statutory mandate to manage civil service retirement savings, employee provident funds, and corporate gratuity funds creates guaranteed monthly capital inflows.',
        category: 'Operational & Industry Moat',
        impact: 'High',
        metricHighlight: 'Guaranteed Monthly Inflows'
      },
      {
        id: 'cit-s2',
        title: 'Diversified Multi-Asset Portfolio',
        description: 'Large allocation across sovereign treasury bills, bank fixed deposits, term loans for national projects (e.g. Upper Tamakoshi), and listed blue-chip equities.',
        category: 'Solvency & Leverage',
        impact: 'High',
        metricHighlight: 'Rs. 200+ Arab Assets'
      },
      {
        id: 'cit-s3',
        title: 'Superior ROE & Steady Dividend History',
        description: 'Regularly rewards shareholders with high bonus and cash payouts supported by steady statutory management fee commissions.',
        category: 'Dividend & Cash Flow',
        impact: 'Moderate',
        metricHighlight: 'Consistent Bonus Payout'
      }
    ],
    risks: [
      {
        id: 'cit-r1',
        title: 'Capital Market Exposure & Mark-to-Market Swings',
        description: 'Significant portfolio investment in NEPSE listed equities exposes earnings to broader capital market pullbacks and impairment provisions.',
        category: 'Market & Liquidity',
        impact: 'High',
        metricHighlight: 'NEPSE Index Volatility'
      },
      {
        id: 'cit-r2',
        title: 'Interest Rate Spread Contraction',
        description: 'Plunging interbank interest rates compress returns on vast commercial bank fixed deposit placements, dampening investment income.',
        category: 'Profitability & Earnings',
        impact: 'Moderate',
        metricHighlight: 'Lower FD Yields'
      }
    ],
    keyTakeaway: 'Premier institutional asset manager with captive retirement savings inflows; earnings are cyclically leveraged to domestic interest rates and NEPSE secondary market performance.'
  },

  SCB: {
    strengths: [
      {
        id: 'scb-s1',
        title: 'Industry-Best Asset Quality & Lowest NPL',
        description: 'Consistently maintains the lowest Non-Performing Loan ratio (<2.0%) in the entire Nepali banking industry, reflecting world-class risk underwriting.',
        category: 'Asset Quality & Credit',
        impact: 'High',
        metricHighlight: 'NPL < 2.0%'
      },
      {
        id: 'scb-s2',
        title: 'Standard Chartered Global Risk Governance',
        description: 'Backed by Standard Chartered Grindlays (70.21%), deploying multinational compliance, anti-money laundering, and conservative capital standards.',
        category: 'Regulatory & Policy',
        impact: 'High',
        metricHighlight: 'Global SCB Governance'
      },
      {
        id: 'scb-s3',
        title: 'High Dividend Payout Reliability',
        description: 'History of generous cash dividend distributions without relying on excessive equity dilution, protecting minority shareholder earnings per share.',
        category: 'Dividend & Cash Flow',
        impact: 'High',
        metricHighlight: 'Top Cash Dividend Payout'
      }
    ],
    risks: [
      {
        id: 'scb-r1',
        title: 'Conservative Loan Book Growth',
        description: 'Rigid multi-national risk filters result in slower loan book growth compared to aggressive domestic competitors, surrendering market share.',
        category: 'Operational & Industry Moat',
        impact: 'Moderate',
        metricHighlight: 'Subdued Credit Growth'
      },
      {
        id: 'scb-r2',
        title: 'Margin Compression in Low-Yield Regime',
        description: 'High liquidity and low loan-to-deposit ratio mean bank margins suffer when interbank rates fall sharply.',
        category: 'Profitability & Earnings',
        impact: 'Moderate',
        metricHighlight: 'Surplus Liquidity Drag'
      }
    ],
    keyTakeaway: 'The highest quality bank in Nepal by credit metrics and governance; offers safe, high-quality cash dividends with conservative balance sheet growth.'
  },

  EBL: {
    strengths: [
      {
        id: 'ebl-s1',
        title: 'Dominant Indo-Nepal Remittance Corridor',
        description: 'Strategic technical collaboration with Punjab National Bank (India) gives Everest Bank an uncontested competitive moat in channeling worker remittances from India.',
        category: 'Operational & Industry Moat',
        impact: 'High',
        metricHighlight: 'PNB Indo-Nepal Remittance'
      },
      {
        id: 'ebl-s2',
        title: 'Consistently High Return on Equity (ROE)',
        description: 'Maintains industry-beating ROE (15%+) through disciplined expense controls, prudent credit selection, and high low-cost CASA deposit ratios.',
        category: 'Profitability & Earnings',
        impact: 'High',
        metricHighlight: 'ROE: 16.5%+'
      },
      {
        id: 'ebl-s3',
        title: 'Robust Asset Quality Standards',
        description: 'Prudent risk management has kept NPL levels comfortably below industry averages throughout varying macroeconomic cycles.',
        category: 'Asset Quality & Credit',
        impact: 'Moderate',
        metricHighlight: 'Low Credit Default Rate'
      }
    ],
    risks: [
      {
        id: 'ebl-r1',
        title: 'Competition in Digital Remittance Channels',
        description: 'Rapid growth of digital wallet remittance corridors and private fintech platforms poses long-term threats to traditional banking remittance margins.',
        category: 'Operational & Industry Moat',
        impact: 'Moderate',
        metricHighlight: 'Fintech Remittance Threat'
      },
      {
        id: 'ebl-r2',
        title: 'Systemic Economic Slowdown in Construction & SME',
        description: 'Exposures to domestic commercial transport and small business segments face periodic cash flow strain during slow economic cycles.',
        category: 'Asset Quality & Credit',
        impact: 'Moderate',
        metricHighlight: 'SME Sector Exposure'
      }
    ],
    keyTakeaway: 'Exceptional retail remittance moat and disciplined management delivering dependable, market-beating ROE and consistent shareholder dividends.'
  },

  HRL: {
    strengths: [
      {
        id: 'hrl-s1',
        title: 'Duopoly Market Position in Nepal Reinsurance',
        description: 'Only one of two licensed reinsurance companies in Nepal, benefiting from mandatory domestic direct cession quotas enacted by Nepal Insurance Authority.',
        category: 'Operational & Industry Moat',
        impact: 'High',
        metricHighlight: 'Domestic Reinsurance Duopoly'
      },
      {
        id: 'hrl-s2',
        title: 'Premier Institutional Sponsor Consortium',
        description: 'Promoted by Nepal\'s leading commercial banks, non-life insurance companies, and prominent industrial houses, ensuring immediate treaty pipeline access.',
        category: 'Regulatory & Policy',
        impact: 'High',
        metricHighlight: 'Top Tier BFI Promoters'
      },
      {
        id: 'hrl-s3',
        title: 'Rapid International Treaty Expansion',
        description: 'Successfully expanding facultative and treaty underwriting across SAARC, Middle East, and Southeast Asian markets to diversify geographical risk.',
        category: 'Profitability & Earnings',
        impact: 'Moderate',
        metricHighlight: 'Global Treaty Expansion'
      }
    ],
    risks: [
      {
        id: 'hrl-r1',
        title: 'Catastrophe & Natural Hazard Claim Vulnerability',
        description: 'Nepal\'s high seismic vulnerability and heavy monsoon flooding expose reinsurers to severe single-event peak claim payouts.',
        category: 'Operational & Industry Moat',
        impact: 'High',
        metricHighlight: 'Seismic & Flood Cat Risk'
      },
      {
        id: 'hrl-r2',
        title: 'Rising Global Retrocession Costs',
        description: 'Hardening global reinsurance markets have driven up retrocession costs required to transfer catastrophic risk outside Nepal.',
        category: 'Solvency & Leverage',
        impact: 'Moderate',
        metricHighlight: 'Global Retrocession Cost'
      }
    ],
    keyTakeaway: 'Dominant market share protected by mandatory local cession quotas; core risks center on catastrophic monsoon flooding/earthquake exposure and retrocession pricing.'
  }
};

/**
 * Intelligent Dynamic Analysis Engine:
 * Evaluates any stock (curated or dynamic from NEPSE API) to produce:
 * - 3-5 Financial Strengths
 * - 3-5 Financial Risks
 * - Composite Health Score (0-100)
 * - Letter Grade (A+, A, B+, B, C+, C)
 * - Financial Outlook
 * - Executive takeaway
 */
export function getFinancialHealthProfile(stock: StockFundamental): StockFinancialHealthProfile {
  const symbol = stock.symbol.toUpperCase();
  const curated = CURATED_FINANCIAL_PROFILES[symbol];

  const strengths: FinancialFactor[] = [];
  const risks: FinancialFactor[] = [];

  // 1. If curated data is available, populate it
  if (curated) {
    strengths.push(...curated.strengths);
    risks.push(...curated.risks);
  } else {
    // 2. Dynamic generation based on real financial metrics
    // --- STRENGTHS ---
    // A. Valuation & P/E
    if (stock.peRatio > 0 && stock.peRatio < stock.industryPe) {
      const discount = (stock.industryPe - stock.peRatio).toFixed(1);
      strengths.push({
        id: `${symbol}-dyn-s1`,
        title: 'Attractive Sector Valuation Discount',
        description: `Trading at a P/E multiple of ${stock.peRatio.toFixed(1)}x, which is ${discount}x cheaper than the industry average of ${stock.industryPe.toFixed(1)}x.`,
        category: 'Valuation & Multiples',
        impact: 'High',
        metricHighlight: `${stock.peRatio.toFixed(1)}x vs ${stock.industryPe.toFixed(1)}x Ind.`
      });
    }

    // B. Profitability & ROE
    if (stock.roe >= 14) {
      strengths.push({
        id: `${symbol}-dyn-s2`,
        title: 'Strong Capital Efficiency (ROE)',
        description: `Delivers a robust Return on Equity of ${stock.roe.toFixed(1)}%, outpacing benchmark risk-free treasury returns and demonstrating disciplined capital allocation.`,
        category: 'Profitability & Earnings',
        impact: 'High',
        metricHighlight: `ROE: ${stock.roe.toFixed(1)}%`
      });
    } else if (stock.roe > 8) {
      strengths.push({
        id: `${symbol}-dyn-s2b`,
        title: 'Positive Net Profitability',
        description: `Generates positive Return on Equity of ${stock.roe.toFixed(1)}% with an annual EPS of Rs. ${stock.eps.toFixed(1)}.`,
        category: 'Profitability & Earnings',
        impact: 'Moderate',
        metricHighlight: `EPS: Rs. ${stock.eps.toFixed(1)}`
      });
    }

    // C. Asset backing (P/B & Book Value)
    if (stock.pbRatio > 0 && stock.pbRatio <= 2.2) {
      strengths.push({
        id: `${symbol}-dyn-s3`,
        title: 'Favorable Tangible Asset Backing',
        description: `Price-to-Book ratio of ${stock.pbRatio.toFixed(2)}x indicates reasonable asset backing with Net Worth (BVPS) recorded at Rs. ${stock.bvps.toFixed(1)}.`,
        category: 'Valuation & Multiples',
        impact: 'Moderate',
        metricHighlight: `P/B: ${stock.pbRatio.toFixed(2)}x | BVPS: Rs. ${stock.bvps.toFixed(0)}`
      });
    }

    // D. Dividend track record
    if (stock.dividendYield >= 3.0) {
      strengths.push({
        id: `${symbol}-dyn-s4`,
        title: 'Healthy Direct Dividend Yield',
        description: `Current dividend yield of ${stock.dividendYield.toFixed(2)}% offers steady cash and bonus distribution for long-term income investors.`,
        category: 'Dividend & Cash Flow',
        impact: 'High',
        metricHighlight: `Yield: ${stock.dividendYield.toFixed(2)}%`
      });
    }

    // E. Beta / Volatility
    if (stock.beta <= 0.95) {
      strengths.push({
        id: `${symbol}-dyn-s5`,
        title: 'Defensive Low-Beta Profile',
        description: `A market beta of ${stock.beta.toFixed(2)} indicates lower systemic sensitivity and capital protection during broader NEPSE downturns.`,
        category: 'Market & Liquidity',
        impact: 'Moderate',
        metricHighlight: `Beta: ${stock.beta.toFixed(2)}`
      });
    }

    // F. Float Liquidity
    if (stock.publicHolding >= 35) {
      strengths.push({
        id: `${symbol}-dyn-s6`,
        title: 'Deep Secondary Float Liquidity',
        description: `Public share float of ${stock.publicHolding.toFixed(1)}% allows smooth trade execution and minimizes bid-ask liquidity slippage on NEPSE.`,
        category: 'Market & Liquidity',
        impact: 'Moderate',
        metricHighlight: `Public Float: ${stock.publicHolding.toFixed(1)}%`
      });
    }

    // Sector specific strengths fallback
    if (stock.sector === 'Commercial Banks' || stock.sector === 'Development Banks') {
      strengths.push({
        id: `${symbol}-dyn-s7`,
        title: 'NRB Regulatory Compliance & Capital Cushion',
        description: 'Maintains required statutory liquidity ratio (SLR), cash reserve ratio (CRR), and countercyclical capital buffer as mandated by Nepal Rastra Bank.',
        category: 'Regulatory & Policy',
        impact: 'Moderate',
        metricHighlight: 'NRB Tier-1 Compliant'
      });
    } else if (stock.sector === 'Hydropower') {
      strengths.push({
        id: `${symbol}-dyn-s8`,
        title: 'Long-Term PPA with Take-or-Pay Protection',
        description: 'Beneficiary of standard NEA long-term Power Purchase Agreement with guaranteed grid off-take tariffs and structured dry/wet seasonal rates.',
        category: 'Regulatory & Policy',
        impact: 'High',
        metricHighlight: 'Long-Term NEA PPA'
      });
    }

    // --- RISKS ---
    // A. Valuation risk
    if (stock.peRatio > stock.industryPe * 1.25) {
      const premium = (stock.peRatio - stock.industryPe).toFixed(1);
      risks.push({
        id: `${symbol}-dyn-r1`,
        title: 'High Valuation Premium Over Peers',
        description: `Trading at a P/E multiple of ${stock.peRatio.toFixed(1)}x, commanding a ${premium}x premium over sector peers (${stock.industryPe.toFixed(1)}x), demanding elevated future earnings growth.`,
        category: 'Valuation & Multiples',
        impact: 'High',
        metricHighlight: `${stock.peRatio.toFixed(1)}x vs ${stock.industryPe.toFixed(1)}x`
      });
    }

    // B. Subdued earnings / profitability
    if (stock.roe < 7.0 && stock.roe > 0) {
      risks.push({
        id: `${symbol}-dyn-r2`,
        title: 'Subdued Capital Productivity (Low ROE)',
        description: `Return on Equity of ${stock.roe.toFixed(1)}% remains below commercial banking fixed deposit rates, indicating potential capital under-utilization.`,
        category: 'Profitability & Earnings',
        impact: 'Moderate',
        metricHighlight: `ROE: ${stock.roe.toFixed(1)}%`
      });
    } else if (stock.roe <= 0 || stock.eps <= 0) {
      risks.push({
        id: `${symbol}-dyn-r2b`,
        title: 'Negative / Constrained Net Margins',
        description: `Reported negative or minimal annualized EPS (Rs. ${stock.eps.toFixed(2)}) due to elevated interest obligations or operational cost pressures.`,
        category: 'Profitability & Earnings',
        impact: 'High',
        metricHighlight: `EPS: Rs. ${stock.eps.toFixed(2)}`
      });
    }

    // C. Beta / High Volatility
    if (stock.beta >= 1.2) {
      risks.push({
        id: `${symbol}-dyn-r3`,
        title: 'Elevated Beta & Systemic Volatility',
        description: `Market beta of ${stock.beta.toFixed(2)} signifies sharp price movements during broader NEPSE corrections, increasing portfolio drawdowns.`,
        category: 'Market & Liquidity',
        impact: 'Moderate',
        metricHighlight: `Beta: ${stock.beta.toFixed(2)}`
      });
    }

    // D. Zero dividend
    if (stock.dividendYield === 0) {
      risks.push({
        id: `${symbol}-dyn-r4`,
        title: 'No Direct Cash Dividend Yield',
        description: 'Did not distribute cash or bonus dividend in the recent fiscal period, reinvesting cash flows into debt service or capital reserves.',
        category: 'Dividend & Cash Flow',
        impact: 'Moderate',
        metricHighlight: '0.0% Dividend'
      });
    }

    // E. Sector specific risks
    if (stock.sector === 'Hydropower') {
      risks.push({
        id: `${symbol}-dyn-r5`,
        title: 'Seasonal Hydrology & Winter Generation Deficit',
        description: 'Run-of-the-river hydropower output drops significantly during low-discharge winter months, causing seasonality in quarterly operating cash flows.',
        category: 'Operational & Industry Moat',
        impact: 'High',
        metricHighlight: 'Dry Season Hydrology'
      });
    } else if (stock.sector === 'Commercial Banks' || stock.sector === 'Development Banks' || stock.sector === 'Finance') {
      risks.push({
        id: `${symbol}-dyn-r6`,
        title: 'Macroeconomic Asset Quality & NPL Surveillance',
        description: 'Sluggish construction and commercial credit recovery exert upward pressure on loan provisions, requiring prudent credit monitoring.',
        category: 'Asset Quality & Credit',
        impact: 'High',
        metricHighlight: 'Credit Impairment Risk'
      });
    } else if (stock.sector === 'Manufacturing & Processing') {
      risks.push({
        id: `${symbol}-dyn-r7`,
        title: 'Raw Material Cost Inflation & Demand Cycles',
        description: 'Operating margins are vulnerable to imported fuel, raw material logistics pricing, and domestic construction demand cycles.',
        category: 'Operational & Industry Moat',
        impact: 'Moderate',
        metricHighlight: 'Import Cost Exposure'
      });
    }
  }

  // Ensure at least 3 strengths and 3 risks
  if (strengths.length < 3) {
    strengths.push({
      id: `${symbol}-fallback-s`,
      title: 'Established Market Standing',
      description: `Active listing on the Nepal Stock Exchange with registered paid-up capital of Rs. ${stock.paidUpCapitalCr.toFixed(1)} Cr and established institutional presence.`,
      category: 'Market & Liquidity',
      impact: 'Low',
      metricHighlight: `Capital: Rs. ${stock.paidUpCapitalCr.toFixed(1)} Cr`
    });
  }

  if (risks.length < 3) {
    risks.push({
      id: `${symbol}-fallback-r`,
      title: 'Macro & Regulatory Policy Sensitivity',
      description: 'Subject to broad macroeconomic shifts, NRB monetary policy adjustments, and general capital market sentiment across NEPSE.',
      category: 'Regulatory & Policy',
      impact: 'Low',
      metricHighlight: 'Systemic Policy Risk'
    });
  }

  // 3. Compute Composite Financial Health Score (0-100)
  let score = 50;

  // ROE contribution (+/- 15)
  if (stock.roe >= 20) score += 15;
  else if (stock.roe >= 14) score += 10;
  else if (stock.roe >= 8) score += 5;
  else if (stock.roe <= 0) score -= 12;
  else score -= 4;

  // P/E valuation relative to industry (+/- 12)
  if (stock.peRatio > 0 && stock.peRatio < stock.industryPe) score += 10;
  else if (stock.peRatio > stock.industryPe * 1.4) score -= 10;
  else if (stock.peRatio <= 0) score -= 8;

  // P/B ratio (+/- 8)
  if (stock.pbRatio > 0 && stock.pbRatio <= 2.0) score += 8;
  else if (stock.pbRatio > 4.5) score -= 6;

  // Dividend yield (+/- 8)
  if (stock.dividendYield >= 4.0) score += 8;
  else if (stock.dividendYield >= 1.5) score += 4;
  else score -= 2;

  // Beta (+/- 7)
  if (stock.beta <= 0.9) score += 7;
  else if (stock.beta >= 1.3) score -= 6;

  // Public Float (+/- 5)
  if (stock.publicHolding >= 30 && stock.publicHolding <= 65) score += 5;

  // Clamp score between 20 and 95
  score = Math.max(25, Math.min(96, Math.round(score)));

  // Determine Grade
  let grade: StockFinancialHealthProfile['grade'] = 'B';
  let outlook: StockFinancialHealthProfile['outlook'] = 'Stable / Resilient';

  if (score >= 85) {
    grade = 'A+';
    outlook = 'Strong / Robust';
  } else if (score >= 75) {
    grade = 'A';
    outlook = 'Strong / Robust';
  } else if (score >= 65) {
    grade = 'B+';
    outlook = 'Stable / Resilient';
  } else if (score >= 52) {
    grade = 'B';
    outlook = 'Moderate';
  } else if (score >= 42) {
    grade = 'C+';
    outlook = 'Moderate';
  } else {
    grade = 'C';
    outlook = 'Cautious / High Risk';
  }

  const keyTakeaway = curated?.keyTakeaway || (
    score >= 70
      ? `Solid fundamental balance sheet with favorable capital returns (${stock.roe.toFixed(1)}% ROE) and defensive positioning in ${stock.sector}.`
      : `Moderate financial profile; monitor upcoming quarterly filings for improvements in profitability and capital productivity.`
  );

  return {
    healthScore: score,
    grade,
    outlook,
    strengthsCount: strengths.length,
    risksCount: risks.length,
    strengths,
    risks,
    keyTakeaway
  };
}
