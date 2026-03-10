import type { PortfolioProject } from '../types/portfolio';

interface PortfolioStatsProps {
  projects: PortfolioProject[];
}

export function PortfolioStats({ projects }: PortfolioStatsProps) {
  const formatCurrency = (value: number | undefined) => {
    if (!value || value === 0) return '$0';
    if (value >= 1_000_000) return '$' + (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return '$' + (value / 1_000).toFixed(0) + 'K';
    return '$' + value.toFixed(0);
  };

  // Calculate metrics
  const stats = {
    totalProjects: projects.length,
    totalInvestment: projects.reduce((sum, p) => sum + (Number(p.totalInvestment) || 0), 0),
    totalCashFlow: projects.reduce((sum, p) => sum + (Number(p.avgCashFlow) || 0), 0),
    blendedROI:
      projects.length > 0
        ? projects.reduce((sum, p) => {
            const investment = Number(p.totalInvestment) || 0;
            const roi = Number(p.roi) || 0;
            return sum + roi * (investment / (projects.reduce((s, pr) => s + (Number(pr.totalInvestment) || 0), 0) || 1));
          }, 0) || 0
        : 0,
    avgInvestmentScore:
      projects.length > 0
        ? projects.reduce((sum, p) => sum + (Number(p.investmentScore) || 0), 0) / projects.length
        : 0,
    bestPerformer:
      projects.length > 0
        ? projects.reduce((best, p) => (p.investmentScore > best.investmentScore ? p : best))
        : null,
    worstPerformer:
      projects.length > 0
        ? projects.reduce((worst, p) => (p.investmentScore < worst.investmentScore ? p : worst))
        : null,
    avgBreakEven:
      projects.length > 0
        ? projects.reduce((sum, p) => sum + (Number(p.breakEvenMonths) || 0), 0) / projects.length
        : 0,
  };

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-3">
      {/* Total Investment */}
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Total Investment</div>
            <div className="text-xl font-bold text-white mt-1">
              {formatCurrency(stats.totalInvestment)}
            </div>
          </div>
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Blended ROI */}
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Blended ROI</div>
            <div className={`text-xl font-bold mt-1 ${stats.blendedROI >= 20 ? 'text-emerald-400' : 'text-orange-400'}`}>
              {stats.blendedROI.toFixed(1)}%
            </div>
          </div>
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Combined Annual Cash Flow */}
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Annual Cash Flow</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {formatCurrency(stats.totalCashFlow)}
            </div>
          </div>
          <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Best Performer */}
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
        <div>
          <div className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Best Performer</div>
          {stats.bestPerformer ? (
            <>
              <div className="text-sm font-bold text-white mt-1 truncate">{stats.bestPerformer.projectName}</div>
              <div className="text-lg font-bold text-emerald-400">{Math.round(stats.bestPerformer.investmentScore)}/100</div>
            </>
          ) : (
            <div className="text-sm text-zinc-500 mt-1">No projects</div>
          )}
        </div>
      </div>

      {/* Worst Performer */}
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
        <div>
          <div className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Worst Performer</div>
          {stats.worstPerformer ? (
            <>
              <div className="text-sm font-bold text-white mt-1 truncate">{stats.worstPerformer.projectName}</div>
              <div className="text-lg font-bold text-red-400">{Math.round(stats.worstPerformer.investmentScore)}/100</div>
            </>
          ) : (
            <div className="text-sm text-zinc-500 mt-1">No projects</div>
          )}
        </div>
      </div>

      {/* Average Break-Even */}
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Avg Break-Even</div>
            <div className={`text-xl font-bold mt-1 ${stats.avgBreakEven <= 24 ? 'text-emerald-400' : 'text-orange-400'}`}>
              {Math.round(stats.avgBreakEven)} months
            </div>
          </div>
          <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
