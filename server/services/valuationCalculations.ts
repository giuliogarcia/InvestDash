/**
 * Valuation Calculations Service
 * Implements Graham's Fair Price and Bazin's Ceiling Price formulas
 */

export interface GrahamCalculation {
  currentPrice: number;
  fairPrice: number;
  upside: number;
  upsidePercent: number;
  isUndervalued: boolean;
  lpa: number;
  vpa: number;
}

export interface BazinCalculation {
  currentPrice: number;
  ceilingPrice: number;
  upside: number;
  upsidePercent: number;
  isUndervalued: boolean;
  averageDividend: number;
  targetYield: number;
}

export interface DividendAnalysis {
  totalPaid: number;
  averageYield: number;
  consistency: number; // 0-100 score
  growth: number; // percentage
  payoutRatio: number;
  isHealthy: boolean;
}

/**
 * Calculate Graham's Fair Price
 * Formula: Fair Price = √(22.5 × LPA × VPA)
 * 
 * Where:
 * - LPA = Lucro por Ação (Earnings Per Share)
 * - VPA = Valor Patrimonial por Ação (Book Value Per Share)
 * - 22.5 = Graham's magic number (15 × 1.5)
 */
export function calculateGrahamPrice(
  lpa: number,
  vpa: number,
  currentPrice: number
): GrahamCalculation {
  // Validate inputs
  if (lpa <= 0 || vpa <= 0) {
    return {
      currentPrice,
      fairPrice: 0,
      upside: 0,
      upsidePercent: 0,
      isUndervalued: false,
      lpa,
      vpa,
    };
  }

  // Calculate fair price using Graham's formula
  const fairPrice = Math.sqrt(22.5 * lpa * vpa);
  
  // Calculate upside
  const upside = fairPrice - currentPrice;
  const upsidePercent = (upside / currentPrice) * 100;
  
  // Determine if undervalued (fair price is at least 10% higher than current)
  const isUndervalued = upsidePercent >= 10;

  return {
    currentPrice,
    fairPrice: Number(fairPrice.toFixed(2)),
    upside: Number(upside.toFixed(2)),
    upsidePercent: Number(upsidePercent.toFixed(2)),
    isUndervalued,
    lpa,
    vpa,
  };
}

/**
 * Calculate Bazin's Ceiling Price
 * Formula: Ceiling Price = Average Dividend / Target Yield
 * 
 * Where:
 * - Average Dividend = Average of dividends paid in last 5 years
 * - Target Yield = Minimum desired dividend yield (default 6% or 0.06)
 * 
 * The idea is to never pay more than the ceiling price to ensure
 * a minimum dividend yield of 6% per year.
 */
export function calculateBazinPrice(
  averageDividend: number,
  currentPrice: number,
  targetYield: number = 0.06
): BazinCalculation {
  // Validate inputs
  if (averageDividend <= 0) {
    return {
      currentPrice,
      ceilingPrice: 0,
      upside: 0,
      upsidePercent: 0,
      isUndervalued: false,
      averageDividend,
      targetYield,
    };
  }

  // Calculate ceiling price using Bazin's formula
  const ceilingPrice = averageDividend / targetYield;
  
  // Calculate upside
  const upside = ceilingPrice - currentPrice;
  const upsidePercent = (upside / currentPrice) * 100;
  
  // Determine if undervalued (current price is below ceiling price)
  const isUndervalued = currentPrice < ceilingPrice;

  return {
    currentPrice,
    ceilingPrice: Number(ceilingPrice.toFixed(2)),
    upside: Number(upside.toFixed(2)),
    upsidePercent: Number(upsidePercent.toFixed(2)),
    isUndervalued,
    averageDividend,
    targetYield,
  };
}

/**
 * Calculate average dividend from historical data
 * Uses last 5 years or all available data if less than 5 years
 */
export function calculateAverageDividend(
  dividends: Array<{ date: string; value: number }>,
  years: number = 5
): number {
  if (!dividends || dividends.length === 0) return 0;

  // Sort dividends by date (most recent first)
  const sortedDividends = [...dividends].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get dividends from last N years
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - years);

  const recentDividends = sortedDividends.filter(
    (d) => new Date(d.date) >= cutoffDate
  );

  if (recentDividends.length === 0) return 0;

  // Calculate total dividends per year
  const dividendsByYear = new Map<number, number>();
  
  recentDividends.forEach((dividend) => {
    const year = new Date(dividend.date).getFullYear();
    const current = dividendsByYear.get(year) || 0;
    dividendsByYear.set(year, current + dividend.value);
  });

  // Calculate average
  const yearlyTotals = Array.from(dividendsByYear.values());
  const average = yearlyTotals.reduce((sum, val) => sum + val, 0) / yearlyTotals.length;

  return Number(average.toFixed(4));
}

/**
 * Analyze dividend history for consistency and growth
 */
export function analyzeDividends(
  dividends: Array<{ date: string; value: number }>,
  years: number = 5
): DividendAnalysis {
  if (!dividends || dividends.length === 0) {
    return {
      totalPaid: 0,
      averageYield: 0,
      consistency: 0,
      growth: 0,
      payoutRatio: 0,
      isHealthy: false,
    };
  }

  // Sort dividends by date
  const sortedDividends = [...dividends].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Get dividends from last N years
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - years);

  const recentDividends = sortedDividends.filter(
    (d) => new Date(d.date) >= cutoffDate
  );

  // Calculate total paid
  const totalPaid = recentDividends.reduce((sum, d) => sum + d.value, 0);

  // Calculate dividends by year
  const dividendsByYear = new Map<number, number>();
  
  recentDividends.forEach((dividend) => {
    const year = new Date(dividend.date).getFullYear();
    const current = dividendsByYear.get(year) || 0;
    dividendsByYear.set(year, current + dividend.value);
  });

  const yearlyTotals = Array.from(dividendsByYear.values());
  
  // Calculate consistency (percentage of years with dividends)
  const yearsWithDividends = dividendsByYear.size;
  const consistency = (yearsWithDividends / years) * 100;

  // Calculate growth rate (CAGR)
  let growth = 0;
  if (yearlyTotals.length >= 2) {
    const firstYear = yearlyTotals[0];
    const lastYear = yearlyTotals[yearlyTotals.length - 1];
    const numYears = yearlyTotals.length - 1;
    
    if (firstYear > 0) {
      growth = (Math.pow(lastYear / firstYear, 1 / numYears) - 1) * 100;
    }
  }

  // Calculate average yield (would need current price)
  const averageYield = totalPaid / years;

  // Determine if dividend policy is healthy
  const isHealthy = consistency >= 80 && growth >= 0;

  return {
    totalPaid: Number(totalPaid.toFixed(2)),
    averageYield: Number(averageYield.toFixed(4)),
    consistency: Number(consistency.toFixed(0)),
    growth: Number(growth.toFixed(2)),
    payoutRatio: 0, // Would need earnings data
    isHealthy,
  };
}

/**
 * Calculate dividend yield
 */
export function calculateDividendYield(
  annualDividend: number,
  currentPrice: number
): number {
  if (currentPrice <= 0) return 0;
  return (annualDividend / currentPrice) * 100;
}

/**
 * Calculate Yield on Cost (YOC)
 */
export function calculateYieldOnCost(
  annualDividend: number,
  purchasePrice: number
): number {
  if (purchasePrice <= 0) return 0;
  return (annualDividend / purchasePrice) * 100;
}

/**
 * Project future dividends based on historical growth
 */
export function projectDividends(
  currentDividend: number,
  growthRate: number,
  years: number
): Array<{ year: number; dividend: number }> {
  const projections: Array<{ year: number; dividend: number }> = [];
  
  for (let i = 1; i <= years; i++) {
    const projectedDividend = currentDividend * Math.pow(1 + growthRate / 100, i);
    projections.push({
      year: i,
      dividend: Number(projectedDividend.toFixed(4)),
    });
  }
  
  return projections;
}

/**
 * Calculate payout ratio
 */
export function calculatePayoutRatio(
  dividendPerShare: number,
  earningsPerShare: number
): number {
  if (earningsPerShare <= 0) return 0;
  return (dividendPerShare / earningsPerShare) * 100;
}

/**
 * Determine if payout ratio is sustainable
 */
export function isPayoutSustainable(payoutRatio: number): {
  isSustainable: boolean;
  risk: 'low' | 'medium' | 'high';
  message: string;
} {
  if (payoutRatio < 0) {
    return {
      isSustainable: false,
      risk: 'high',
      message: 'Empresa está pagando dividendos mesmo com prejuízo',
    };
  }
  
  if (payoutRatio <= 50) {
    return {
      isSustainable: true,
      risk: 'low',
      message: 'Payout conservador, empresa retém boa parte dos lucros',
    };
  }
  
  if (payoutRatio <= 75) {
    return {
      isSustainable: true,
      risk: 'medium',
      message: 'Payout moderado, dividendos sustentáveis',
    };
  }
  
  if (payoutRatio <= 100) {
    return {
      isSustainable: true,
      risk: 'medium',
      message: 'Payout alto, empresa distribui quase todo o lucro',
    };
  }
  
  return {
    isSustainable: false,
    risk: 'high',
    message: 'Payout acima de 100%, não é sustentável no longo prazo',
  };
}

/**
 * Calculate Magic Formula score (Joel Greenblatt)
 * Combines earnings yield and return on capital
 */
export function calculateMagicFormulaScore(
  earningsYield: number, // Inverse of P/E
  returnOnCapital: number // ROIC
): number {
  // Both metrics should be ranked, but for simplicity we'll use a weighted average
  // Higher is better
  const normalizedEY = Math.min(earningsYield * 100, 100);
  const normalizedROC = Math.min(returnOnCapital * 100, 100);
  
  return (normalizedEY + normalizedROC) / 2;
}

/**
 * Calculate intrinsic value using DCF (simplified)
 */
export function calculateDCF(
  freeCashFlow: number,
  growthRate: number,
  discountRate: number,
  years: number = 10
): number {
  let presentValue = 0;
  
  for (let i = 1; i <= years; i++) {
    const futureCashFlow = freeCashFlow * Math.pow(1 + growthRate, i);
    const discountedCashFlow = futureCashFlow / Math.pow(1 + discountRate, i);
    presentValue += discountedCashFlow;
  }
  
  // Terminal value (perpetuity growth model)
  const terminalCashFlow = freeCashFlow * Math.pow(1 + growthRate, years + 1);
  const terminalValue = terminalCashFlow / (discountRate - growthRate);
  const discountedTerminalValue = terminalValue / Math.pow(1 + discountRate, years);
  
  return presentValue + discountedTerminalValue;
}

export default {
  calculateGrahamPrice,
  calculateBazinPrice,
  calculateAverageDividend,
  analyzeDividends,
  calculateDividendYield,
  calculateYieldOnCost,
  projectDividends,
  calculatePayoutRatio,
  isPayoutSustainable,
  calculateMagicFormulaScore,
  calculateDCF,
};
