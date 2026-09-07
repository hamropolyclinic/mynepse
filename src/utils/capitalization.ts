export type CapitalizationTier = 'HIGH_CAP' | 'MID_CAP' | 'LOW_CAP';

export interface CapitalizationInfo {
  tier: CapitalizationTier;
  label: string; // e.g. "High Cap"
  fullLabel: string; // e.g. "High Cap (Large-Cap)"
  marketCapCr: number;
  marketCapArba: number;
  marketCapNpr: number;
  shortCapDisplay: string; // e.g. "14.6K Cr" or "312 Cr"
  threshold: string;
  badgeClass: string;
  dotColor: string;
  textColor: string;
  borderColor: string;
  bgSubtle: string;
  summary: string;
  characteristics: {
    volatility: string;
    liquidity: string;
    institutionalOwnership: string;
    riskProfile: string;
  };
}

export function getCapitalizationInfo(marketCapCr: number): CapitalizationInfo {
  const cap = Math.max(0, marketCapCr || 0);
  const arba = cap / 100;
  const totalNpr = cap * 10000000;

  const shortCapDisplay =
    cap >= 1000
      ? `${(cap / 1000).toFixed(1)}K Cr`
      : `${Math.round(cap)} Cr`;

  if (cap >= 3000) {
    return {
      tier: 'HIGH_CAP',
      label: 'High Cap',
      fullLabel: 'High Cap (Large-Cap)',
      marketCapCr: cap,
      marketCapArba: arba,
      marketCapNpr: totalNpr,
      shortCapDisplay,
      threshold: '≥ Rs. 3,000 Cr (Rs. 30 Arba+)',
      badgeClass:
        'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25 hover:border-indigo-500/50',
      dotColor: 'bg-indigo-400',
      textColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/30',
      bgSubtle: 'bg-indigo-950/40',
      summary:
        'Tier 1 NEPSE Heavyweight / Blue-Chip company. Dominates index movement with high institutional ownership and resilient market liquidity.',
      characteristics: {
        volatility: 'Low to Moderate (Resistant to abrupt price shocks)',
        liquidity: 'Very High (Substantial daily volume & market depth)',
        institutionalOwnership: 'Dominant (Mutual funds, EPF, CIT, pension funds)',
        riskProfile: 'Conservative wealth preservation & steady dividends',
      },
    };
  }

  if (cap >= 1000) {
    return {
      tier: 'MID_CAP',
      label: 'Mid Cap',
      fullLabel: 'Mid Cap (Middle-Tier)',
      marketCapCr: cap,
      marketCapArba: arba,
      marketCapNpr: totalNpr,
      shortCapDisplay,
      threshold: 'Rs. 1,000 Cr – 3,000 Cr (Rs. 10 – 30 Arba)',
      badgeClass:
        'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25 hover:border-amber-500/50',
      dotColor: 'bg-amber-400',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      bgSubtle: 'bg-amber-950/40',
      summary:
        'Established mid-sized enterprise with stable operational footprint. Offers balanced capital appreciation potential and moderate liquidity.',
      characteristics: {
        volatility: 'Moderate (Tracks broader market trends with healthy beta)',
        liquidity: 'Moderate to High (Steady trading volume across sessions)',
        institutionalOwnership: 'Moderate (Blend of retail & institutional participation)',
        riskProfile: 'Balanced growth with manageable operational risk',
      },
    };
  }

  return {
    tier: 'LOW_CAP',
    label: 'Low Cap',
    fullLabel: 'Low Cap (Small-Cap)',
    marketCapCr: cap,
    marketCapArba: arba,
    marketCapNpr: totalNpr,
    shortCapDisplay,
    threshold: '< Rs. 1,000 Cr (< Rs. 10 Arba)',
    badgeClass:
      'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25 hover:border-cyan-500/50',
    dotColor: 'bg-cyan-400',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    bgSubtle: 'bg-cyan-950/40',
    summary:
      'Lower market capitalization with tighter free-float supply. Highly agile and susceptible to rapid momentum swings and retail trading activity.',
    characteristics: {
      volatility: 'High (Prone to circuit-breaker limit moves & sharp swings)',
      liquidity: 'Low to Moderate (Thinner order books, higher bid-ask spread)',
      institutionalOwnership: 'Low (Predominantly retail investors & short-term traders)',
      riskProfile: 'High risk / Speculative upside potential',
    },
  };
}
