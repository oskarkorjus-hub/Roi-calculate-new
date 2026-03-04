
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { YearlyData, Assumptions, CurrencyConfig } from '../types';
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

const AISummary: React.FC<Props> = ({ data, assumptions, currency }) => {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const avgNetYield = data.reduce((s, i) => s + i.roiAfterManagement, 0) / data.length;
        const totalProfit = data.reduce((s, i) => s + i.takeHomeProfit, 0);
        const y10Profit = data[9].takeHomeProfit;
        const initialInvestment = assumptions.initialInvestment;

        const prompt = `
          As a senior real estate investment analyst, provide a strategic deal summary for a 10-year rental property projection.
          
          KEY DATA:
          - Initial Capex: ${formatCurrency(initialInvestment, currency)}
          - Average Annualized Net Yield: ${avgNetYield.toFixed(2)}%
          - Total 10-Year Profit: ${formatCurrency(totalProfit, currency)}
          - Occupancy (Year 1): ${assumptions.y1Occupancy}%
          - ADR Growth p.a.: ${assumptions.adrGrowth}%
          - Property Management Fees: ${assumptions.y1BaseFee} base + ${assumptions.incentiveFeePct}% incentive.
          
          Based on this, generate a deal score (0-100), a professional summary, top pros, top cons, and a final verdict.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                dealScore: { type: Type.INTEGER },
                summary: { type: Type.STRING },
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                verdict: { type: Type.STRING },
              },
              required: ['dealScore', 'summary', 'pros', 'cons', 'verdict'],
            },
          },
        });

        const result = JSON.parse(response.text || '{}');
        setAnalysis(result);
      } catch (err) {
        console.error("AI Generation Error:", err);
        setError("Failed to generate AI insights. Check API configuration.");
      } finally {
        setLoading(false);
      }
    };

    generateAnalysis();
  }, [data, assumptions, currency]);

  if (loading) {
    return (
      <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-12 flex flex-col items-center justify-center animate-pulse min-h-[400px]">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h3 className="text-slate-400 font-black uppercase tracking-widest text-sm">Gemini AI is analyzing the deal...</h3>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-[2.5rem] p-12 text-center text-red-600 font-bold">
        {error || "Analysis unavailable."}
      </div>
    );
  }

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
