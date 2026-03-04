import type { ConstructionPhase } from '../index';

interface Props {
  phases: ConstructionPhase[];
  currentMonth: number;
  totalDuration: number;
  onPhaseChange: (phaseId: string, field: keyof ConstructionPhase, value: string | number) => void;
}

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  'not-started': { bg: 'bg-zinc-600', border: 'border-zinc-500', text: 'text-zinc-400' },
  'in-progress': { bg: 'bg-cyan-500', border: 'border-cyan-400', text: 'text-cyan-400' },
  'completed': { bg: 'bg-emerald-500', border: 'border-emerald-400', text: 'text-emerald-400' },
  'delayed': { bg: 'bg-red-500', border: 'border-red-400', text: 'text-red-400' },
};

export function TimelineGantt({ phases, currentMonth, totalDuration, onPhaseChange }: Props) {
  const months = Array.from({ length: totalDuration }, (_, i) => i + 1);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Project Timeline</h3>
          <div className="flex items-center gap-4 text-xs">
            {Object.entries(statusColors).map(([status, colors]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded ${colors.bg}`} />
                <span className="text-zinc-400 capitalize">{status.replace('-', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 overflow-x-auto">
        {/* Month Headers */}
        <div className="flex mb-4">
          <div className="w-40 flex-shrink-0" />
          <div className="flex-1 flex">
            {months.map(month => (
              <div
                key={month}
                className={`flex-1 text-center text-xs px-1 py-2 border-l border-zinc-800 ${
                  month === currentMonth ? 'bg-amber-500/10 text-amber-400 font-bold' : 'text-zinc-500'
                }`}
                style={{ minWidth: '50px' }}
              >
                M{month}
              </div>
            ))}
          </div>
        </div>

        {/* Gantt Bars */}
        <div className="space-y-3">
          {phases.map(phase => {
            const startPercent = ((phase.startMonth - 1) / totalDuration) * 100;
            const widthPercent = (phase.duration / totalDuration) * 100;
            const colors = statusColors[phase.status];

            return (
              <div key={phase.id} className="flex items-center">
                <div className="w-40 flex-shrink-0 pr-4">
                  <p className="text-sm font-medium text-white truncate">{phase.name}</p>
                  <p className="text-[10px] text-zinc-500">{phase.budgetPercent}% budget</p>
                </div>
                <div className="flex-1 relative h-10 bg-zinc-800/50 rounded">
                  {/* Current Month Indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-10"
                    style={{ left: `${((currentMonth - 0.5) / totalDuration) * 100}%` }}
                  />

                  {/* Phase Bar */}
                  <div
                    className={`absolute top-1 bottom-1 rounded ${colors.bg} transition-all`}
                    style={{
                      left: `${startPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  >
                    {/* Completion Progress */}
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-white/20 rounded-l"
                      style={{ width: `${phase.completionPercent}%` }}
                    />

                    {/* Label */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white drop-shadow">
                        {phase.completionPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Month Grid Lines */}
                  {months.map(month => (
                    <div
                      key={month}
                      className="absolute top-0 bottom-0 border-l border-zinc-700/50"
                      style={{ left: `${((month - 1) / totalDuration) * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline Summary */}
        <div className="mt-6 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase">Current Position</p>
                <p className="text-lg font-bold text-amber-400">Month {currentMonth}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase">Progress</p>
                <p className="text-lg font-bold text-white">
                  {((currentMonth / totalDuration) * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase">Remaining</p>
                <p className="text-lg font-bold text-zinc-400">
                  {totalDuration - currentMonth} months
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] text-emerald-500 uppercase">Completed</p>
                <p className="text-lg font-bold text-emerald-400">
                  {phases.filter(p => p.status === 'completed').length}/{phases.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-red-500 uppercase">Delayed</p>
                <p className="text-lg font-bold text-red-400">
                  {phases.filter(p => p.status === 'delayed').length}/{phases.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimelineGantt;
