import { useMemo } from 'react';
import type { YearlyData, Assumptions, CurrencyConfig } from '../types';
import { formatCurrency } from '../constants';

interface Props {
  data: YearlyData[];
  assumptions: Assumptions;
  currency: CurrencyConfig;
}

interface Analysis {
  dealScore: number;
  summary: string;
  pros: string[];
  cons: string[];
  verdict: string;
}

function generateLocalAnalysis(data: YearlyData[], assumptions: Assumptions, currency: CurrencyConfig): Analysis {
  const avgNetYield = data.reduce((s, i) => s + i.roiAfterManagement, 0) / data.length;
  const totalProfit = data.reduce((s, i) => s + i.takeHomeProfit, 0);
  const avgGopMargin = data.reduce((s, i) => s + i.gopMargin, 0) / data.length;
  const initialInvestment = assumptions.initialInvestment;
  const paybackYears = initialInvestment / (totalProfit / 10);

  // Calculate deal score based on metrics
  let score = 50;
  if (avgNetYield > 10) score += 20;
  else if (avgNetYield > 7) score += 10;
  else if (avgNetYield < 5) score -= 10;

  if (avgGopMargin > 50) score += 15;
  else if (avgGopMargin > 40) score += 10;
  else if (avgGopMargin < 30) score -= 10;

  if (paybackYears < 8) score += 10;
  else if (paybackYears > 12) score -= 10;

  score = Math.max(0, Math.min(100, score));

  const pros: string[] = [];
  const cons: string[] = [];

  if (avgNetYield > 8) pros.push(`Strong average net yield of ${avgNetYield.toFixed(1)}% p.a.`);
  else if (avgNetYield < 5) cons.push(`Below-average net yield of ${avgNetYield.toFixed(1)}% p.a.`);

  if (avgGopMargin > 45) pros.push(`Healthy GOP margin of ${avgGopMargin.toFixed(1)}% indicates operational efficiency`);
  else if (avgGopMargin < 35) cons.push(`GOP margin of ${avgGopMargin.toFixed(1)}% suggests room for operational improvement`);

  if (assumptions.y1Occupancy >= 70) pros.push(`Starting occupancy of ${assumptions.y1Occupancy}% provides solid foundation`);
  else cons.push(`Initial occupancy of ${assumptions.y1Occupancy}% may require marketing investment`);

  if (paybackYears < 10) pros.push(`Investment payback projected within ${paybackYears.toFixed(1)} years`);
  else cons.push(`Extended payback period of ${paybackYears.toFixed(1)} years`);

  if (assumptions.adrGrowth >= 4) pros.push(`ADR growth of ${assumptions.adrGrowth}% supports revenue expansion`);

  // Ensure we have at least 2 pros and 2 cons
  if (pros.length < 2) pros.push('Diversified revenue streams across rooms, F&B, and ancillary services');
  if (pros.length < 2) pros.push('10-year projection allows for market cycle adjustments');
  if (cons.length < 2) cons.push('Subject to local market conditions and tourism trends');
  if (cons.length < 2) cons.push('Management fee structure impacts net returns');

  let verdict = '';
  if (score >= 75) verdict = 'A compelling investment with strong fundamentals and attractive return profile.';
  else if (score >= 60) verdict = 'A solid investment opportunity with reasonable risk-adjusted returns.';
  else if (score >= 45) verdict = 'A moderate investment requiring careful consideration of market dynamics.';
  else verdict = 'Exercise caution - review assumptions and consider alternative scenarios.';

  const summary = `This ${assumptions.keys}-key property investment projects cumulative profits of ${formatCurrency(totalProfit, currency)} over a 10-year horizon, representing an average annual net yield of ${avgNetYield.toFixed(2)}%. With initial capital expenditure of ${formatCurrency(initialInvestment, currency)}, the investment demonstrates ${score >= 60 ? 'favorable' : 'moderate'} return characteristics based on current market assumptions.`;

  return { dealScore: score, summary, pros: pros.slice(0, 4), cons: cons.slice(0, 4), verdict };
}

const AISummary = ({ data, assumptions, currency }: Props) => {
  const analysis = useMemo(
    () => generateLocalAnalysis(data, assumptions, currency),
    [data, assumptions, currency]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Deal Score Dial */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col items-center justify-center shadow-2xl">
        <div className="relative w-48 h-48 mb-8">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="96" cy="96" r="88" fill="none" stroke="#1e293b" strokeWidth="16" />
            <circle
              cx="96" cy="96" r="88" fill="none" stroke="#6366f1" strokeWidth="16"
              strokeDasharray={552.92}
              strokeDashoffset={552.92 - (552.92 * analysis.dealScore) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-black tracking-tighter">{analysis.dealScore}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deal Score</span>
          </div>
        </div>
        <div className="text-center px-4">
          <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Investment Verdict</div>
          <p className="text-sm font-medium leading-relaxed italic">"{analysis.verdict}"</p>
        </div>
      </div>

      {/* Narrative & Lists */}
      <div className="lg:col-span-2 space-y-10">
        <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Strategic Summary</h3>
          </div>
          <p className="text-lg font-bold text-slate-800 leading-relaxed tracking-tight">
            {analysis.summary}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Key Upsides</div>
            <ul className="space-y-3">
              {analysis.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600 leading-tight">
                  <span className="text-emerald-500 mt-0.5">✓</span> {pro}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <div className="text-[10px] font-black text-red-500 uppercase tracking-widest">Risk Exposure</div>
            <ul className="space-y-3">
              {analysis.cons.map((con, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600 leading-tight">
                  <span className="text-red-400 mt-0.5">⚠</span> {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISummary;
