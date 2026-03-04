
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { YearlyData, CurrencyConfig } from '../types';
import { formatCurrency } from '../constants';

interface Props {
  data: YearlyData[];
  currency: CurrencyConfig;
}

const VisualsPanel: React.FC<Props> = ({ data, currency }) => {
  const axisFormatter = (val: number) => {
    const converted = val / currency.rate;
    if (converted >= 1e6) return `${currency.symbol}${(converted / 1e6).toFixed(1)}M`;
    if (converted >= 1e3) return `${currency.symbol}${(converted / 1e3).toFixed(0)}K`;
    return `${currency.symbol}${converted.toFixed(0)}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
          <h3 className="text-lg font-[800] text-slate-900 tracking-tight">Financial Trajectory</h3>
        </div>
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.12}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="calendarYear" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={axisFormatter} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} width={60} />
              <Tooltip 
                contentStyle={{borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px -5px rgb(0 0 0 / 0.08)', fontWeight: 800, padding: '12px', fontSize: '13px'}}
                formatter={(val: number) => formatCurrency(val, currency)}
              />
              <Legend verticalAlign="top" align="right" height={44} iconType="circle" wrapperStyle={{paddingBottom: '24px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b'}} />
              <Area name="Total Revenue" type="monotone" dataKey="totalRevenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              <Area name="Owner Profit" type="monotone" dataKey="takeHomeProfit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
          <h3 className="text-lg font-[800] text-slate-900 tracking-tight">Yield Efficiency</h3>
        </div>
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="calendarYear" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
              <Tooltip 
                 contentStyle={{borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px -5px rgb(0 0 0 / 0.08)', fontWeight: 800, padding: '12px', fontSize: '13px'}}
                 formatter={(val: number) => [`${val.toFixed(2)}%`]}
              />
              <Legend verticalAlign="top" align="right" height={44} iconType="circle" wrapperStyle={{paddingBottom: '24px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b'}} />
              <Line name="Net ROI p.a." type="monotone" dataKey="roiAfterManagement" stroke="#6366f1" strokeWidth={4} dot={{r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 7}} />
              <Line name="Occupancy %" type="monotone" dataKey="occupancy" stroke="#94a3b8" strokeDasharray="6 6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default VisualsPanel;
