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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      {/* Total Investment */}
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Total Investment</div>
            <div className="text-xl font-bold text-white mt-1">
              {formatCurrency(stats.totalInvestment)}
            </div>
          </div>
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-lg">📊</div>
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
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-lg">📈</div>
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
          <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center text-lg">💰</div>
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
          <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center text-lg">📅</div>
        </div>
      </div>
    </div>
  );
}
