
import React from 'react';
import { YearlyData, CurrencyConfig } from '../types';
import { formatCurrency } from '../constants';

interface Props {
  data: YearlyData[];
  currency: CurrencyConfig;
}

const DashboardHeader: React.FC<Props> = ({ data, currency }) => {
  const avgProfit = data.reduce((s, i) => s + i.takeHomeProfit, 0) / data.length;
  const avgROI = data.reduce((s, i) => s + i.roiAfterManagement, 0) / data.length;
  const totalRevenue = data.reduce((s, i) => s + i.totalRevenue, 0);
  const totalProfit = data.reduce((s, i) => s + i.takeHomeProfit, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <Card 
        title="Avg Annual Cash Flow" 
        value={formatCurrency(avgProfit, currency)} 
        label="Expected Owner Profit" 
        icon="💎" 
        color="text-emerald-600" 
        bg="bg-emerald-50"
        border="border-emerald-100"
      />
      <Card 
        title="Annualized Net Yield" 
        value={`${avgROI.toFixed(2)}%`} 
        label="10 year average net ROI p.a." 
        icon="📈" 
        color="text-indigo-600" 
        bg="bg-indigo-50"
        border="border-indigo-100"
      />
      <Card 
        title="Total 10Y Earnings" 
        value={formatCurrency(totalProfit, currency)} 
        label="Cumulative Net Profit" 
        icon="💰" 
        color="text-blue-600" 
        bg="bg-blue-50"
        border="border-blue-100"
      />
      <Card 
        title="10Y Gross Potential" 
        value={formatCurrency(totalRevenue, currency)} 
        label="Total Revenue Projection" 
        icon="🏛️" 
        color="text-slate-700" 
        bg="bg-slate-100"
        border="border-slate-200"
      />
    </div>
  );
};

const Card: React.FC<{ title: string; value: string; label: string; icon: string; color: string; bg: string; border: string }> = ({ title, value, label, icon, color, bg, border }) => (
  <div className={`bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${border} transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 group cursor-default`}>
    <div className="flex items-start justify-between mb-6">
      <div className="flex-1">
        <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] block mb-2">{title}</span>
        <div className={`text-[1.75rem] font-[800] ${color} tracking-tight leading-none`}>{value}</div>
      </div>
      <div className={`w-14 h-14 ${bg} rounded-3xl flex items-center justify-center text-2xl shadow-inner transition-transform group-hover:scale-110 duration-300`}>
        {icon}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color.replace('text', 'bg')} opacity-60 animate-pulse`}></div>
      <span className="text-[11px] font-[700] text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
  </div>
);

export default DashboardHeader;
