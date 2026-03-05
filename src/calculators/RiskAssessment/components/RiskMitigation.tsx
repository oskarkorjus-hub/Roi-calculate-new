import type { RiskFactor } from '../index';

interface Props {
  factors: RiskFactor[];
  riskScore: number;
}

interface MitigationStrategy {
  factor: string;
  riskLevel: 'high' | 'moderate' | 'low';
  title: string;
  description: string;
  action: string;
  priority: 'immediate' | 'short-term' | 'long-term';
  potentialImpact: number;
}

const getMitigationStrategies = (factors: RiskFactor[]): MitigationStrategy[] => {
  const strategies: MitigationStrategy[] = [];

  factors.forEach(factor => {
    const percent = (factor.score / factor.maxScore) * 100;
    if (percent <= 20) return; // Skip low-risk factors

    const riskLevel = percent > 60 ? 'high' : percent > 30 ? 'moderate' : 'low';
    const priority = percent > 60 ? 'immediate' : percent > 40 ? 'short-term' : 'long-term';
    const potentialImpact = Math.round(factor.score * 0.6); // Potential reduction

    // Generate specific mitigation based on factor name
    let title = '';
    let description = '';
    let action = '';

    switch (factor.name) {
      case 'ROI Quality':
        title = 'Improve Return Profile';
        description = 'Low ROI increases investment risk. Consider value-add opportunities or negotiate better purchase price.';
        action = 'Review pricing strategy, identify value-add improvements, or renegotiate terms.';
        break;
      case 'Cash Flow Consistency':
        title = 'Stabilize Cash Flow';
        description = 'Volatile cash flow creates planning uncertainty and financing challenges.';
        action = 'Consider mixed rental strategy (STR + LTR) or secure long-term tenants for base income.';
        break;
      case 'Debt Service Coverage':
        title = 'Strengthen DSCR';
        description = 'Low DSCR means tight margins if income drops. Banks require DSCR > 1.25.';
        action = 'Increase down payment, refinance to lower rate, or reduce operating expenses.';
        break;
      case 'Leverage Ratio':
        title = 'Reduce Leverage';
        description = 'High debt-to-equity ratio amplifies both gains and losses.';
        action = 'Consider additional equity injection or accelerated debt paydown.';
        break;
      case 'Break-even Timeline':
        title = 'Accelerate Break-even';
        description = 'Long break-even period increases exposure to market changes.';
        action = 'Boost revenue through pricing optimization or reduce costs through efficiency.';
        break;
      case 'Market Stability':
        title = 'Hedge Market Exposure';
        description = 'Declining markets increase exit risk and potential losses.';
        action = 'Diversify property portfolio across markets or focus on cash flow over appreciation.';
        break;
      case 'Seasonal Volatility':
        title = 'Reduce Seasonality Impact';
        description = 'High seasonal variance in STR creates income unpredictability.';
        action = 'Add long-term rental component or target off-season markets (digital nomads, events).';
        break;
      case 'Occupancy Risk':
        title = 'Improve Occupancy';
        description = 'Low occupancy directly reduces income and increases per-unit costs.';
        action = 'Enhance marketing, improve property appeal, adjust pricing strategy, or add amenities.';
        break;
      case 'Price Volatility':
        title = 'Manage Price Risk';
        description = 'High price fluctuations make valuation and exit planning difficult.';
        action = 'Focus on yield over capital gains, maintain cash reserves for downturns.';
        break;
      case 'Demand Trend':
        title = 'Capitalize on Demand';
        description = 'Declining demand signals potential oversupply or market shift.';
        action = 'Research emerging areas, target underserved segments, or improve competitive positioning.';
        break;
      case 'STR Restrictions':
        title = 'Address Regulatory Risk';
        description = 'STR regulations are tightening in many markets including Bali.';
        action = 'Obtain proper permits, consider LTR backup strategy, or relocate to STR-friendly areas.';
        break;
      case 'Ownership Structure':
        title = 'Optimize Ownership';
        description = 'Complex or risky ownership structures create legal and operational challenges.';
        action = 'Consult legal expert on optimal structure, ensure proper documentation and compliance.';
        break;
      case 'Tax Law Changes':
        title = 'Tax Planning';
        description = 'Expiring tax incentives could significantly impact returns.';
        action = 'Accelerate deductions, consult tax advisor, model scenarios without incentives.';
        break;
      case 'Permit Requirements':
        title = 'Secure Permits Early';
        description = 'Difficult permitting can delay projects and add costs.';
        action = 'Engage experienced local consultants, start permit process early, budget for delays.';
        break;
      case 'Political Stability':
        title = 'Political Risk Management';
        description = 'Political instability affects property rights, regulations, and market confidence.';
        action = 'Maintain liquidity for quick exit if needed, avoid over-concentration in one market.';
        break;
      case 'Age & Condition':
        title = 'Property Maintenance';
        description = 'Older properties require more maintenance and may have hidden issues.';
        action = 'Budget for capex reserves (1-2% of value annually), conduct thorough inspections.';
        break;
      case 'Location Quality':
        title = 'Location Enhancement';
        description = 'Poor location quality limits appreciation and rental potential.';
        action = 'Focus marketing on unique property features, consider repositioning or eventual sale.';
        break;
      case 'Amenity Level':
        title = 'Upgrade Amenities';
        description = 'Basic amenities limit rental rates and guest satisfaction.';
        action = 'Prioritize high-ROI improvements: pool, AC, wifi, modern kitchen.';
        break;
      case 'Management Burden':
        title = 'Streamline Operations';
        description = 'High management burden increases costs and owner fatigue.';
        action = 'Hire property manager, automate processes, or convert to longer-term rentals.';
        break;
      case 'Exit Liquidity':
        title = 'Improve Exit Options';
        description = 'Low liquidity means difficulty selling when needed.';
        action = 'Build relationships with agents, maintain property well, have competitive pricing strategy.';
        break;
      default:
        title = `Address ${factor.name}`;
        description = factor.description;
        action = 'Review this risk factor and develop specific mitigation plan.';
    }

    strategies.push({
      factor: factor.name,
      riskLevel,
      title,
      description,
      action,
      priority,
      potentialImpact,
    });
  });

  // Sort by risk level and potential impact
  return strategies.sort((a, b) => {
    const levelOrder = { high: 0, moderate: 1, low: 2 };
    if (levelOrder[a.riskLevel] !== levelOrder[b.riskLevel]) {
      return levelOrder[a.riskLevel] - levelOrder[b.riskLevel];
    }
    return b.potentialImpact - a.potentialImpact;
  });
};

export function RiskMitigation({ factors, riskScore }: Props) {
  const strategies = getMitigationStrategies(factors);
  const highRiskStrategies = strategies.filter(s => s.riskLevel === 'high');
  const moderateRiskStrategies = strategies.filter(s => s.riskLevel === 'moderate');

  const totalPotentialReduction = strategies
    .slice(0, 5)
    .reduce((sum, s) => sum + s.potentialImpact, 0);

  const potentialNewScore = Math.max(0, riskScore - totalPotentialReduction);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Risk Mitigation Potential</h3>
            <p className="text-xs text-zinc-500">
              Addressing top 5 risks could reduce your overall score significantly
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-zinc-500">Current</p>
              <p className={`text-2xl font-bold ${
                riskScore <= 30 ? 'text-emerald-400' : riskScore <= 60 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {riskScore}
              </p>
            </div>
            <div className="text-2xl text-zinc-600">→</div>
            <div className="text-center">
              <p className="text-xs text-zinc-500">Potential</p>
              <p className={`text-2xl font-bold ${
                potentialNewScore <= 30 ? 'text-emerald-400' : potentialNewScore <= 60 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {potentialNewScore}
              </p>
            </div>
            <div className="bg-emerald-500/20 px-3 py-1 rounded-full">
              <span className="text-emerald-400 font-bold">-{totalPotentialReduction} pts</span>
            </div>
          </div>
        </div>

        {/* Progress toward safer score */}
        <div className="h-4 bg-zinc-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-emerald-500/30"
            style={{ width: `${Math.min(30, 100 - riskScore)}%` }}
          />
          <div
            className="h-full bg-amber-500/30"
            style={{ width: `${Math.max(0, Math.min(30, 60 - Math.max(30, riskScore)))}%` }}
          />
          <div
            className={`h-full ${riskScore <= 30 ? 'bg-emerald-500' : riskScore <= 60 ? 'bg-amber-500' : 'bg-red-500'} transition-all`}
            style={{ width: `${riskScore}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-zinc-500">
          <span>Low Risk (0-30)</span>
          <span>Moderate (30-60)</span>
          <span>High Risk (60-100)</span>
        </div>
      </div>

      {/* High Priority Actions */}
      {highRiskStrategies.length > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
          <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
            <span>🚨</span> Immediate Action Required
          </h3>
          <div className="space-y-4">
            {highRiskStrategies.map((strategy, index) => (
              <MitigationCard key={index} strategy={strategy} />
            ))}
          </div>
        </div>
      )}

      {/* Moderate Priority Actions */}
      {moderateRiskStrategies.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
          <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Short-term Improvements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {moderateRiskStrategies.slice(0, 6).map((strategy, index) => (
              <MitigationCard key={index} strategy={strategy} compact />
            ))}
          </div>
        </div>
      )}

      {/* Risk Mitigation Checklist */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>✅</span> Risk Mitigation Checklist
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChecklistSection
            title="Before Purchase"
            items={[
              'Complete due diligence on property',
              'Verify ownership/title status',
              'Review all permits and regulations',
              'Get independent property inspection',
              'Model conservative scenarios',
            ]}
          />
          <ChecklistSection
            title="Financial Protection"
            items={[
              'Maintain 6+ month cash reserve',
              'Keep DSCR above 1.25x',
              'Consider fixed-rate financing',
              'Get comprehensive insurance',
              'Have backup exit strategy',
            ]}
          />
          <ChecklistSection
            title="Operational Risk"
            items={[
              'Hire experienced property manager',
              'Build reliable contractor network',
              'Document all agreements in writing',
              'Regular property inspections',
              'Maintain competitive positioning',
            ]}
          />
          <ChecklistSection
            title="Market Protection"
            items={[
              'Diversify rental strategy (STR/LTR)',
              'Build repeat guest database',
              'Monitor market trends regularly',
              'Stay informed on regulations',
              'Network with local investors',
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function MitigationCard({ strategy, compact }: { strategy: MitigationStrategy; compact?: boolean }) {
  const levelColors = {
    high: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    moderate: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
    low: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  };

  const colors = levelColors[strategy.riskLevel];

  if (compact) {
    return (
      <div className="bg-zinc-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-white text-sm">{strategy.title}</h4>
          <span className={`text-xs ${colors.text}`}>-{strategy.potentialImpact} pts</span>
        </div>
        <p className="text-xs text-zinc-400">{strategy.action}</p>
      </div>
    );
  }

  return (
    <div className={`bg-zinc-800/50 rounded-lg p-4 border ${colors.border}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>
            {strategy.priority}
          </span>
          <h4 className="font-medium text-white mt-2">{strategy.title}</h4>
          <p className="text-xs text-zinc-500">{strategy.factor}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">Potential Impact</p>
          <p className={`text-lg font-bold ${colors.text}`}>-{strategy.potentialImpact} pts</p>
        </div>
      </div>
      <p className="text-sm text-zinc-300 mb-3">{strategy.description}</p>
      <div className="bg-zinc-700/50 rounded-lg p-3">
        <p className="text-xs text-zinc-400 uppercase mb-1">Recommended Action</p>
        <p className="text-sm text-white">{strategy.action}</p>
      </div>
    </div>
  );
}

function ChecklistSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-zinc-800/50 rounded-lg p-4">
      <h4 className="font-medium text-white mb-3">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-zinc-300">
            <span className="w-4 h-4 rounded border border-zinc-600 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RiskMitigation;
