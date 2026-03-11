
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { YearlyData, CurrencyConfig } from '../types';
import { formatCurrency } from '../constants';

interface Props {
  data: YearlyData[];
  avg: Partial<YearlyData>;
  currency: CurrencyConfig;
}

interface RowConfig {
  label: string;
  key: keyof YearlyData;
  type: 'curr' | 'pct' | 'num';
  indent?: boolean;
  bold?: boolean;
  color?: string; // Optional text color
}

interface SectionConfig {
  title: string;
  rows: RowConfig[];
  isExpandedByDefault?: boolean;
}

const ProjectionsTable: React.FC<Props> = ({ data, avg, currency }) => {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener('scroll', checkScrollPosition);
    window.addEventListener('resize', checkScrollPosition);

    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [checkScrollPosition]);

  const scrollTo = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const toggleSection = (title: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const sections: SectionConfig[] = [
    {
      title: 'Operational Metrics',
      isExpandedByDefault: true,
      rows: [
        { label: '# of Keys (Daily Inventory)', key: 'keys', type: 'num' },
        { label: 'Occupancy (%)', key: 'occupancy', type: 'pct' },
        { label: 'Occ. Increase (% pts.)', key: 'occupancyIncrease', type: 'pct', indent: true },
        { label: 'Average Daily Rate (ADR)', key: 'adr', type: 'curr' },
        { label: 'ADR Growth (%)', key: 'adrGrowth', type: 'pct', indent: true },
      ]
    },
    {
      title: 'Total Revenue',
      isExpandedByDefault: true,
      rows: [
        { label: 'Total Revenue', key: 'totalRevenue', type: 'curr', bold: true },
        { label: 'Growth (%)', key: 'revenueGrowth', type: 'pct', indent: true },
        { label: 'Rooms', key: 'revenueRooms', type: 'curr', indent: true },
        { label: 'Food and Beverage (F&B)', key: 'revenueFB', type: 'curr', indent: true },
        { label: 'Wellness/Sports/Health', key: 'revenueSpa', type: 'curr', indent: true },
      ]
    },
    {
      title: 'Total Operating Cost',
      rows: [
        { label: 'Total Operating Cost', key: 'totalOperatingCost', type: 'curr', bold: true, color: 'text-red-400' },
        { label: 'Rooms Cost', key: 'costRooms', type: 'curr', indent: true },
        { label: 'Food & Beverage Cost', key: 'costFB', type: 'curr', indent: true },
        { label: 'Wellness/Sports/Health', key: 'costSpa', type: 'curr', indent: true },
        { label: 'Utilities', key: 'costUtilities', type: 'curr', indent: true },
      ]
    },
    {
      title: 'Undistributed Expenses',
      rows: [
        { label: 'Total Undistributed', key: 'totalUndistributedCost', type: 'curr', bold: true, color: 'text-red-400' },
        { label: 'Admin & General', key: 'undistributedAdmin', type: 'curr', indent: true },
        { label: 'Sales & Marketing', key: 'undistributedSales', type: 'curr', indent: true },
        { label: 'Property Ops & Maintenance', key: 'undistributedMaintenance', type: 'curr', indent: true },
      ]
    },
    {
      title: 'Gross Operating Profit (GOP)',
      isExpandedByDefault: true,
      rows: [
        { label: 'GOP', key: 'gop', type: 'curr', bold: true, color: 'text-emerald-400' },
        { label: 'GOP Margin (%)', key: 'gopMargin', type: 'pct', indent: true },
      ]
    },
    {
      title: 'Management Fees',
      isExpandedByDefault: true,
      rows: [
        { label: 'Total Management Fees', key: 'totalManagementFees', type: 'curr', bold: true, color: 'text-red-400' },
        { label: 'CAM Fee', key: 'feeCAM', type: 'curr', indent: true },
        { label: 'Base Management Fee', key: 'feeBase', type: 'curr', indent: true },
        { label: 'Technology Fee', key: 'feeTech', type: 'curr', indent: true },
        { label: 'Incentive Fee', key: 'feeIncentive', type: 'curr', indent: true },
      ]
    },
    {
      title: 'Net Profit & Returns',
      isExpandedByDefault: true,
      rows: [
        { label: 'Take Home Profit', key: 'takeHomeProfit', type: 'curr', bold: true, color: 'text-emerald-400' },
        { label: 'Net Profit Margin (%)', key: 'profitMargin', type: 'pct', indent: true },
        { label: 'ROI - Net Yield (%)', key: 'roiAfterManagement', type: 'pct', bold: true, color: 'text-cyan-400' },
      ]
    }
  ];

  const renderCellValue = (val: number, type: string, color?: string) => {
    if (val === undefined || val === null) return <span className="text-zinc-500">-</span>;
    const isNegative = val < 0;
    const finalColor = color || (isNegative ? 'text-red-400' : 'text-zinc-200');

    if (type === 'curr') {
      return (
        <span className={`tabular-nums font-semibold tracking-tight ${finalColor}`}>
          {formatCurrency(val, currency)}
        </span>
      );
    }
    if (type === 'pct') return <span className={`font-bold tabular-nums tracking-tight ${finalColor}`}>{val.toFixed(2)}%</span>;
    return <span className={`font-semibold tabular-nums tracking-tight ${finalColor}`}>{val.toLocaleString()}</span>;
  };

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden relative">
      {/* Left scroll button */}
      {canScrollLeft && (
        <button
          onClick={() => scrollTo('left')}
          className="absolute left-[340px] top-1/2 -translate-y-1/2 z-50 w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-full shadow-md flex items-center justify-center hover:bg-zinc-700 hover:scale-110 transition-all duration-200 group"
          aria-label="Scroll left"
        >
          <svg className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Right scroll button */}
      {canScrollRight && (
        <button
          onClick={() => scrollTo('right')}
          className="absolute right-[180px] top-1/2 -translate-y-1/2 z-50 w-8 h-8 bg-emerald-600 border border-emerald-700 rounded-full shadow-md flex items-center justify-center hover:bg-emerald-700 hover:scale-110 transition-all duration-200 group"
          aria-label="Scroll right"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}


      <div ref={scrollContainerRef} className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-[13px] border-separate border-spacing-0 min-w-[1900px] table-fixed">
          <colgroup>
            <col className="w-[320px]" />
            {data.map((_, i) => <col key={i} className="w-[130px]" />)}
            <col className="w-[160px]" />
          </colgroup>
          <thead>
            <tr className="border-b-2 border-zinc-700 bg-zinc-800">
              <th className="p-4 text-sm font-semibold text-zinc-300 uppercase tracking-wide sticky left-0 bg-zinc-800 z-[30] border-r border-zinc-700 shadow-[4px_0_8px_rgba(0,0,0,0.2)]">
                Line Item Detail
              </th>
              {data.map(y => (
                <th key={y.year} className="p-4 text-sm font-semibold text-center text-zinc-300 bg-zinc-800">
                  {y.calendarYear}
                </th>
              ))}
              <th className="p-4 text-sm font-semibold text-center text-emerald-400 bg-zinc-800 sticky right-0 z-[30] border-l-2 border-emerald-500/30 shadow-[-4px_0_8px_rgba(0,0,0,0.2)]">
                Average
              </th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section, sIdx) => {
              const isCollapsed = collapsedSections[section.title] ?? true;
              return (
                <React.Fragment key={sIdx}>
                  <tr
                    className="bg-zinc-800 hover:bg-zinc-700/70 transition-colors cursor-pointer border-b border-zinc-700"
                    onClick={() => toggleSection(section.title)}
                  >
                    <td className="sticky left-0 bg-zinc-800 hover:bg-zinc-700/70 z-[25] p-4 border-r border-zinc-700 shadow-[4px_0_8px_rgba(0,0,0,0.2)]">
                      <div className="flex items-center gap-3">
                        <svg
                          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                        <span className="font-bold text-zinc-200 uppercase tracking-wide text-sm">{section.title}</span>
                      </div>
                    </td>
                    {data.map(y => (
                      <td key={y.year} className="p-4 text-right bg-zinc-800"></td>
                    ))}
                    <td className="sticky right-0 bg-zinc-800 p-4 border-l-2 border-emerald-500/30 z-[25] shadow-[-4px_0_8px_rgba(0,0,0,0.2)]"></td>
                  </tr>

                  {!isCollapsed && section.rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={`group hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50`}
                    >
                      <td className={`sticky left-0 p-3 pl-10 z-[20] bg-zinc-900 border-r border-zinc-700 shadow-[4px_0_8px_rgba(0,0,0,0.2)] group-hover:bg-zinc-800/50
                        ${row.indent ? 'pl-14 text-zinc-500' : 'text-zinc-300'}
                        ${row.bold ? 'font-bold text-white' : 'font-medium'}`}>
                        <div className="flex items-center gap-2">
                          {row.label}
                        </div>
                      </td>
                      {data.map(y => (
                        <td key={y.year} className="p-3 text-right border-r border-zinc-800/30 bg-zinc-900 group-hover:bg-zinc-800/50">
                          {renderCellValue((y as any)[row.key], row.type, row.color)}
                        </td>
                      ))}
                      <td className={`sticky right-0 p-3 text-right z-[20] bg-zinc-900 border-l-2 border-emerald-500/30 shadow-[-4px_0_8px_rgba(0,0,0,0.2)] group-hover:bg-zinc-800 transition-colors
                        ${row.bold ? 'font-bold' : ''}`}>
                        {avg[row.key as keyof YearlyData] !== undefined ? renderCellValue(avg[row.key as keyof YearlyData] as number, row.type, row.color) : <span className="text-zinc-500">-</span>}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #27272a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #52525b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #71717a; }
      `}</style>
    </div>
  );
};

export default ProjectionsTable;
