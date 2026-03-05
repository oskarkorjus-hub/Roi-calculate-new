import jsPDF from 'jspdf';
import type { PortfolioProject } from '../types/portfolio';

// Enterprise color palette
const COLORS = {
  primary: { r: 16, g: 185, b: 129 },      // emerald-500
  primaryDark: { r: 5, g: 150, b: 105 },   // emerald-600
  secondary: { r: 6, g: 182, b: 212 },     // cyan-500
  accent: { r: 139, g: 92, b: 246 },       // violet-500
  success: { r: 34, g: 197, b: 94 },       // green-500
  warning: { r: 251, g: 146, b: 60 },      // orange-400
  danger: { r: 239, g: 68, b: 68 },        // red-500
  dark: { r: 24, g: 24, b: 27 },           // zinc-900
  gray: { r: 113, g: 113, b: 122 },        // zinc-500
  lightGray: { r: 244, g: 244, b: 245 },   // zinc-100
  white: { r: 255, g: 255, b: 255 },
  blue: { r: 59, g: 130, b: 246 },
  yellow: { r: 234, g: 179, b: 8 },
  orange: { r: 249, g: 115, b: 22 },
  rose: { r: 244, g: 63, b: 94 },
  teal: { r: 20, g: 184, b: 166 },
};

type CalculatorCategory = 'investment' | 'financing' | 'budget' | 'tax' | 'risk' | 'npv';

interface MetricItem {
  label: string;
  value: string;
  highlight?: 'positive' | 'negative' | 'neutral';
}

interface SectionConfig {
  title: string;
  color: { r: number; g: number; b: number };
  metrics: MetricItem[];
}

// Helper functions
const formatCurrency = (value: number, short = true): string => {
  if (!value || value === 0) return '$0';
  if (short) {
    if (Math.abs(value) >= 1_000_000_000) return '$' + (value / 1_000_000_000).toFixed(2) + 'B';
    if (Math.abs(value) >= 1_000_000) return '$' + (value / 1_000_000).toFixed(2) + 'M';
    if (Math.abs(value) >= 1_000) return '$' + (value / 1_000).toFixed(1) + 'K';
  }
  return '$' + value.toLocaleString();
};

const formatPercent = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

const getCalculatorCategory = (calculatorId: string): CalculatorCategory => {
  switch (calculatorId) {
    case 'mortgage':
    case 'financing':
      return 'financing';
    case 'dev-budget':
      return 'budget';
    case 'indonesia-tax':
      return 'tax';
    case 'risk-assessment':
      return 'risk';
    case 'npv':
      return 'npv';
    default:
      return 'investment';
  }
};

const getCalculatorDisplayName = (calculatorId: string): string => {
  const names: Record<string, string> = {
    'rental-roi': 'Rental ROI Analysis',
    'xirr': 'XIRR Investment Analysis',
    'mortgage': 'Mortgage Analysis',
    'cashflow': 'Cash Flow Analysis',
    'dev-feasibility': 'Development Feasibility Study',
    'cap-rate': 'Cap Rate Analysis',
    'irr': 'IRR Analysis',
    'npv': 'NPV Analysis',
    'indonesia-tax': 'Tax Optimization Report',
    'rental-projection': 'Rental Income Projection',
    'financing': 'Financing Comparison',
    'dev-budget': 'Development Budget Report',
    'risk-assessment': 'Risk Assessment Report',
  };
  return names[calculatorId] || 'Investment Analysis';
};

const getCategoryColor = (category: CalculatorCategory) => {
  switch (category) {
    case 'financing': return COLORS.blue;
    case 'budget': return COLORS.yellow;
    case 'tax': return COLORS.orange;
    case 'risk': return COLORS.rose;
    case 'npv': return COLORS.teal;
    default: return COLORS.primary;
  }
};

const getInvestmentGrade = (score: number): { grade: string; label: string; color: typeof COLORS.primary } => {
  if (score >= 85) return { grade: 'A+', label: 'Excellent Investment', color: COLORS.primary };
  if (score >= 75) return { grade: 'A', label: 'Very Strong Investment', color: COLORS.primary };
  if (score >= 65) return { grade: 'B+', label: 'Strong Investment', color: COLORS.success };
  if (score >= 55) return { grade: 'B', label: 'Good Investment', color: COLORS.secondary };
  if (score >= 45) return { grade: 'C+', label: 'Fair Investment', color: COLORS.warning };
  if (score >= 35) return { grade: 'C', label: 'Moderate Risk', color: COLORS.warning };
  return { grade: 'D', label: 'High Risk', color: COLORS.danger };
};

// Get calculator-specific sections
const getCalculatorSections = (project: PortfolioProject, category: CalculatorCategory): SectionConfig[] => {
  const data = project.data || {};
  const result = data.result || {};

  switch (category) {
    case 'financing':
      return [
        {
          title: 'LOAN OVERVIEW',
          color: COLORS.blue,
          metrics: [
            { label: 'Loan Amount', value: formatCurrency(data.loanAmount || project.totalInvestment) },
            { label: 'Interest Rate', value: `${(data.interestRate || 0).toFixed(2)}%`, highlight: (data.interestRate || 0) <= 5 ? 'positive' : 'neutral' },
            { label: 'Loan Term', value: `${data.loanTerm || 0} years` },
            { label: 'Payment Type', value: data.paymentType || 'Principal & Interest' },
          ],
        },
        {
          title: 'PAYMENT DETAILS',
          color: COLORS.secondary,
          metrics: [
            { label: 'Monthly Payment', value: formatCurrency(result.monthlyPayment || data.monthlyPayment || 0) },
            { label: 'Total Interest', value: formatCurrency(result.totalInterest || 0), highlight: 'negative' },
            { label: 'Total Payment', value: formatCurrency(result.totalPayment || 0) },
            { label: 'Interest Ratio', value: `${((result.totalInterest || 0) / (data.loanAmount || 1) * 100).toFixed(1)}%` },
          ],
        },
        {
          title: 'AFFORDABILITY ANALYSIS',
          color: COLORS.primary,
          metrics: [
            { label: 'Annual Payment', value: formatCurrency((result.monthlyPayment || 0) * 12) },
            { label: 'Payment per $100K', value: formatCurrency((result.monthlyPayment || 0) / ((data.loanAmount || 100000) / 100000)) },
            { label: 'Payoff Date', value: new Date(Date.now() + (data.loanTerm || 30) * 365 * 24 * 60 * 60 * 1000).getFullYear().toString() },
            { label: 'Effective Rate', value: `${((result.totalInterest || 0) / (data.loanAmount || 1) / (data.loanTerm || 1) * 100).toFixed(2)}%/yr` },
          ],
        },
      ];

    case 'budget':
      const totalBudget = data.calculations?.totalBudgeted || project.totalInvestment || 0;
      const totalSpent = data.calculations?.totalActual || 0;
      const variance = data.calculations?.variancePercent || 0;
      return [
        {
          title: 'BUDGET OVERVIEW',
          color: COLORS.yellow,
          metrics: [
            { label: 'Total Budget', value: formatCurrency(totalBudget) },
            { label: 'Spent to Date', value: formatCurrency(totalSpent) },
            { label: 'Remaining', value: formatCurrency(totalBudget - totalSpent), highlight: (totalBudget - totalSpent) >= 0 ? 'positive' : 'negative' },
            { label: 'Utilization', value: `${(totalSpent / totalBudget * 100).toFixed(1)}%` },
          ],
        },
        {
          title: 'VARIANCE ANALYSIS',
          color: variance > 0 ? COLORS.danger : COLORS.success,
          metrics: [
            { label: 'Budget Variance', value: `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`, highlight: variance > 0 ? 'negative' : 'positive' },
            { label: 'Project Health', value: `${(data.calculations?.healthScore || 0).toFixed(0)}%`, highlight: (data.calculations?.healthScore || 0) >= 70 ? 'positive' : 'negative' },
            { label: 'Completion', value: `${(data.calculations?.overallCompletion || 0).toFixed(0)}%` },
            { label: 'On Track', value: variance <= 5 ? 'Yes' : 'No', highlight: variance <= 5 ? 'positive' : 'negative' },
          ],
        },
      ];

    case 'tax':
      return [
        {
          title: 'PROPERTY VALUE',
          color: COLORS.orange,
          metrics: [
            { label: 'Purchase Price', value: formatCurrency(data.purchasePrice || project.totalInvestment) },
            { label: 'Sale Price', value: formatCurrency(data.salePrice || result.salePrice || 0) },
            { label: 'Capital Gain', value: formatCurrency((data.salePrice || 0) - (data.purchasePrice || 0)), highlight: 'positive' },
            { label: 'Holding Period', value: `${data.holdingPeriod || 0} years` },
          ],
        },
        {
          title: 'TAX LIABILITY',
          color: COLORS.danger,
          metrics: [
            { label: 'Total Tax', value: formatCurrency(result.totalTaxLiability || 0), highlight: 'negative' },
            { label: 'Capital Gains Tax', value: formatCurrency(result.capitalGainsTax || 0), highlight: 'negative' },
            { label: 'Effective Rate', value: `${(result.effectiveTaxRate || 0).toFixed(1)}%` },
            { label: 'Net Proceeds', value: formatCurrency(result.netProceeds || 0), highlight: 'positive' },
          ],
        },
        {
          title: 'NET RETURNS',
          color: COLORS.primary,
          metrics: [
            { label: 'Net Profit', value: formatCurrency(result.netProfit || 0), highlight: (result.netProfit || 0) >= 0 ? 'positive' : 'negative' },
            { label: 'After-Tax ROI', value: formatPercent((result.netProfit || 0) / (data.purchasePrice || 1) * 100) },
            { label: 'Annual Return', value: formatPercent((result.netProfit || 0) / (data.purchasePrice || 1) / (data.holdingPeriod || 1) * 100) },
            { label: 'Tax Efficiency', value: `${(100 - (result.effectiveTaxRate || 0)).toFixed(0)}%` },
          ],
        },
      ];

    case 'risk':
      const riskScore = result.riskScore || project.investmentScore || 0;
      return [
        {
          title: 'INVESTMENT OVERVIEW',
          color: COLORS.rose,
          metrics: [
            { label: 'Investment Amount', value: formatCurrency(project.totalInvestment) },
            { label: 'Expected Return', value: formatPercent(data.expectedReturn || project.roi || 0) },
            { label: 'Risk Tolerance', value: data.riskTolerance || 'Moderate' },
            { label: 'Investment Type', value: data.propertyType || 'Real Estate' },
          ],
        },
        {
          title: 'RISK ASSESSMENT',
          color: riskScore >= 60 ? COLORS.success : COLORS.warning,
          metrics: [
            { label: 'Risk Score', value: `${riskScore}/100`, highlight: riskScore >= 60 ? 'positive' : 'negative' },
            { label: 'Risk Level', value: result.riskLevel || 'Moderate' },
            { label: 'Volatility', value: result.volatility || 'Medium' },
            { label: 'Recommendation', value: riskScore >= 60 ? 'Proceed' : 'Caution', highlight: riskScore >= 60 ? 'positive' : 'negative' },
          ],
        },
      ];

    case 'npv':
      const npv = result.npv || 0;
      const pi = result.profitabilityIndex || 0;
      return [
        {
          title: 'INVESTMENT ANALYSIS',
          color: COLORS.teal,
          metrics: [
            { label: 'Initial Investment', value: formatCurrency(result.totalCashOutflows || project.totalInvestment) },
            { label: 'Discount Rate', value: `${(data.discountRate || 0).toFixed(1)}%` },
            { label: 'Project Length', value: `${data.projectLength || 0} years` },
            { label: 'Total Cash Flows', value: formatCurrency(result.totalCashInflows || 0) },
          ],
        },
        {
          title: 'NPV RESULTS',
          color: npv >= 0 ? COLORS.success : COLORS.danger,
          metrics: [
            { label: 'Net Present Value', value: formatCurrency(npv), highlight: npv >= 0 ? 'positive' : 'negative' },
            { label: 'Profitability Index', value: `${pi.toFixed(2)}x`, highlight: pi >= 1 ? 'positive' : 'negative' },
            { label: 'Decision', value: npv >= 0 && pi >= 1 ? 'ACCEPT' : 'REJECT', highlight: npv >= 0 ? 'positive' : 'negative' },
            { label: 'Value Created', value: formatCurrency(Math.max(0, npv)), highlight: 'positive' },
          ],
        },
      ];

    // Investment calculators (default)
    default:
      return [
        {
          title: 'INVESTMENT OVERVIEW',
          color: COLORS.primary,
          metrics: [
            { label: 'Total Investment', value: formatCurrency(project.totalInvestment) },
            { label: 'Annual ROI', value: formatPercent(project.roi || 0), highlight: (project.roi || 0) >= 10 ? 'positive' : 'neutral' },
            { label: 'Cash on Cash', value: formatPercent(result.cashOnCashReturn || project.roi || 0) },
            { label: 'Strategy', value: (project.strategy || 'Hold').charAt(0).toUpperCase() + (project.strategy || 'hold').slice(1) },
          ],
        },
        {
          title: 'CASH FLOW ANALYSIS',
          color: COLORS.secondary,
          metrics: [
            { label: 'Monthly Cash Flow', value: formatCurrency(project.avgCashFlow / 12), highlight: project.avgCashFlow > 0 ? 'positive' : 'negative' },
            { label: 'Annual Cash Flow', value: formatCurrency(project.avgCashFlow), highlight: project.avgCashFlow > 0 ? 'positive' : 'negative' },
            { label: 'Break-Even', value: `${project.breakEvenMonths || 0} months` },
            { label: 'Cash Flow Yield', value: formatPercent((project.avgCashFlow / project.totalInvestment) * 100) },
          ],
        },
        {
          title: 'PERFORMANCE METRICS',
          color: COLORS.accent,
          metrics: [
            { label: 'Investment Score', value: `${Math.round(project.investmentScore || 0)}/100`, highlight: (project.investmentScore || 0) >= 70 ? 'positive' : 'neutral' },
            { label: 'ROI Score', value: `${Math.round(((project.roi_score || 0) / 5) * 100)}%` },
            { label: 'Stability Score', value: `${Math.round(((project.stability_score || 0) / 2) * 100)}%` },
            { label: 'Location Score', value: `${Math.round((project.location_score || 0) * 100)}%` },
          ],
        },
      ];
  }
};

// Main PDF Generator Class
class EnterprisePDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private yPosition: number = 0;
  private pageNumber: number = 1;

  constructor() {
    this.doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  private setColor(color: { r: number; g: number; b: number }, type: 'fill' | 'text' | 'draw' = 'fill') {
    if (type === 'fill') this.doc.setFillColor(color.r, color.g, color.b);
    else if (type === 'text') this.doc.setTextColor(color.r, color.g, color.b);
    else this.doc.setDrawColor(color.r, color.g, color.b);
  }

  private checkPageBreak(neededHeight: number): boolean {
    if (this.yPosition + neededHeight > this.pageHeight - 25) {
      this.addPage();
      return true;
    }
    return false;
  }

  private addPage() {
    this.doc.addPage();
    this.pageNumber++;
    this.yPosition = this.margin;
    this.addPageHeader();
  }

  private addPageHeader() {
    // Subtle header line
    this.setColor(COLORS.lightGray, 'fill');
    this.doc.rect(0, 0, this.pageWidth, 12, 'F');

    this.doc.setFontSize(8);
    this.setColor(COLORS.gray, 'text');
    this.doc.text('ROI Calculate | Enterprise Report', this.margin, 8);
    this.doc.text(`Page ${this.pageNumber}`, this.pageWidth - this.margin, 8, { align: 'right' });

    this.yPosition = 20;
  }

  // Cover Page
  private addCoverPage(project: PortfolioProject, category: CalculatorCategory) {
    const categoryColor = getCategoryColor(category);

    // Full-width gradient header
    this.setColor(categoryColor, 'fill');
    this.doc.rect(0, 0, this.pageWidth, 100, 'F');

    // Overlay pattern (subtle)
    this.doc.setGState(new (this.doc as any).GState({ opacity: 0.1 }));
    for (let i = 0; i < 10; i++) {
      this.setColor(COLORS.white, 'fill');
      this.doc.circle(this.pageWidth - 30 + i * 5, 50 + i * 3, 40, 'F');
    }
    this.doc.setGState(new (this.doc as any).GState({ opacity: 1 }));

    // Logo/Brand
    this.yPosition = 35;
    this.doc.setFontSize(14);
    this.setColor(COLORS.white, 'text');
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ROI CALCULATE', this.margin, this.yPosition);

    // Report Type Badge
    this.yPosition += 20;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('ENTERPRISE INVESTMENT REPORT', this.margin, this.yPosition);

    // Main Title
    this.yPosition = 130;
    this.doc.setFontSize(28);
    this.setColor(COLORS.dark, 'text');
    this.doc.setFont('helvetica', 'bold');
    const title = project.projectName || 'Investment Analysis';
    this.doc.text(title, this.margin, this.yPosition);

    // Subtitle
    this.yPosition += 12;
    this.doc.setFontSize(14);
    this.setColor(COLORS.gray, 'text');
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(getCalculatorDisplayName(project.calculatorId), this.margin, this.yPosition);

    // Location
    this.yPosition += 8;
    this.doc.setFontSize(12);
    this.doc.text(project.location || 'Property Investment', this.margin, this.yPosition);

    // Key Stats Box
    this.yPosition = 180;
    this.setColor(COLORS.lightGray, 'fill');
    this.doc.roundedRect(this.margin, this.yPosition, this.pageWidth - 2 * this.margin, 50, 3, 3, 'F');

    // Stats inside box
    const statsY = this.yPosition + 20;
    const colWidth = (this.pageWidth - 2 * this.margin) / 4;

    const stats = [
      { label: 'INVESTMENT', value: formatCurrency(project.totalInvestment) },
      { label: 'ROI', value: `${(project.roi || 0).toFixed(1)}%` },
      { label: 'CASH FLOW', value: formatCurrency(project.avgCashFlow) },
      { label: 'SCORE', value: `${Math.round(project.investmentScore || 0)}/100` },
    ];

    stats.forEach((stat, i) => {
      const x = this.margin + i * colWidth + colWidth / 2;
      this.doc.setFontSize(8);
      this.setColor(COLORS.gray, 'text');
      this.doc.text(stat.label, x, statsY - 8, { align: 'center' });
      this.doc.setFontSize(16);
      this.setColor(COLORS.dark, 'text');
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(stat.value, x, statsY + 5, { align: 'center' });
      this.doc.setFont('helvetica', 'normal');
    });

    // Date
    this.yPosition = 260;
    this.doc.setFontSize(10);
    this.setColor(COLORS.gray, 'text');
    this.doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, this.margin, this.yPosition);

    // Footer disclaimer
    this.yPosition = this.pageHeight - 20;
    this.doc.setFontSize(8);
    this.doc.text('This report is for informational purposes only and does not constitute financial advice.', this.margin, this.yPosition);
  }

  // Executive Summary Page
  private addExecutiveSummary(project: PortfolioProject, category: CalculatorCategory) {
    this.addPage();
    const categoryColor = getCategoryColor(category);
    const grade = getInvestmentGrade(project.investmentScore || 0);

    // Section Header
    this.setColor(categoryColor, 'fill');
    this.doc.rect(this.margin, this.yPosition, 4, 20, 'F');

    this.doc.setFontSize(18);
    this.setColor(COLORS.dark, 'text');
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('EXECUTIVE SUMMARY', this.margin + 10, this.yPosition + 14);
    this.yPosition += 35;

    // Investment Grade Card
    this.setColor(grade.color, 'fill');
    this.doc.roundedRect(this.margin, this.yPosition, 60, 45, 3, 3, 'F');

    this.doc.setFontSize(36);
    this.setColor(COLORS.white, 'text');
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(grade.grade, this.margin + 30, this.yPosition + 28, { align: 'center' });

    this.doc.setFontSize(10);
    this.doc.text(grade.label, this.margin + 30, this.yPosition + 38, { align: 'center' });

    // Summary Text
    const summaryX = this.margin + 70;
    this.doc.setFontSize(11);
    this.setColor(COLORS.dark, 'text');
    this.doc.setFont('helvetica', 'normal');

    const summaryText = this.generateSummaryText(project, category, grade);
    const lines = this.doc.splitTextToSize(summaryText, this.pageWidth - summaryX - this.margin);
    this.doc.text(lines, summaryX, this.yPosition + 10);

    this.yPosition += 60;

    // Key Highlights
    this.yPosition += 10;
    this.doc.setFontSize(12);
    this.setColor(COLORS.dark, 'text');
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('KEY HIGHLIGHTS', this.margin, this.yPosition);
    this.yPosition += 10;

    const highlights = this.getKeyHighlights(project, category);
    highlights.forEach((highlight, i) => {
      this.checkPageBreak(10);
      this.doc.setFontSize(10);
      this.setColor(highlight.positive ? COLORS.success : COLORS.gray, 'text');
      this.doc.text(`${highlight.positive ? '✓' : '•'}`, this.margin, this.yPosition);
      this.setColor(COLORS.dark, 'text');
      this.doc.text(highlight.text, this.margin + 8, this.yPosition);
      this.yPosition += 8;
    });
  }

  private generateSummaryText(project: PortfolioProject, category: CalculatorCategory, grade: ReturnType<typeof getInvestmentGrade>): string {
    const roi = project.roi || 0;
    const investment = formatCurrency(project.totalInvestment);

    switch (category) {
      case 'financing':
        return `This financing analysis evaluates a loan of ${investment}. The loan structure has been assessed and rated ${grade.grade} (${grade.label}). Key factors include the interest rate, term length, and total cost of borrowing.`;
      case 'budget':
        return `This budget report tracks a development project with a total budget of ${investment}. The project is currently rated ${grade.grade} based on budget adherence and progress metrics.`;
      case 'tax':
        return `This tax optimization analysis examines the tax implications of a ${investment} property investment. The analysis considers capital gains, holding period, and ownership structure.`;
      case 'risk':
        return `This risk assessment evaluates a ${investment} investment opportunity. The risk profile is rated ${grade.grade} (${grade.label}) based on multiple risk factors and market conditions.`;
      case 'npv':
        return `This NPV analysis evaluates the present value of a ${investment} investment using discounted cash flow methodology. The investment has been rated ${grade.grade}.`;
      default:
        return `This investment analysis evaluates a ${investment} property opportunity with a projected ROI of ${roi.toFixed(1)}%. The investment has been rated ${grade.grade} (${grade.label}) based on comprehensive financial metrics including cash flow, break-even period, and market positioning.`;
    }
  }

  private getKeyHighlights(project: PortfolioProject, category: CalculatorCategory): Array<{ text: string; positive: boolean }> {
    const roi = project.roi || 0;
    const score = project.investmentScore || 0;
    const cashFlow = project.avgCashFlow || 0;
    const breakEven = project.breakEvenMonths || 0;

    const highlights: Array<{ text: string; positive: boolean }> = [];

    if (roi >= 10) {
      highlights.push({ text: `Strong ROI of ${roi.toFixed(1)}% exceeds market average`, positive: true });
    } else if (roi > 0) {
      highlights.push({ text: `Positive ROI of ${roi.toFixed(1)}%`, positive: true });
    }

    if (cashFlow > 0) {
      highlights.push({ text: `Positive annual cash flow of ${formatCurrency(cashFlow)}`, positive: true });
    }

    if (breakEven > 0 && breakEven <= 36) {
      highlights.push({ text: `Break-even achieved within ${breakEven} months`, positive: true });
    }

    if (score >= 70) {
      highlights.push({ text: `Investment score of ${Math.round(score)}/100 indicates strong opportunity`, positive: true });
    }

    if (highlights.length < 3) {
      highlights.push({ text: `Located in ${project.location || 'prime location'}`, positive: true });
    }

    return highlights.slice(0, 5);
  }

  // Detailed Metrics Pages
  private addDetailedMetrics(project: PortfolioProject, category: CalculatorCategory) {
    this.addPage();
    const categoryColor = getCategoryColor(category);
    const sections = getCalculatorSections(project, category);

    // Section Header
    this.setColor(categoryColor, 'fill');
    this.doc.rect(this.margin, this.yPosition, 4, 20, 'F');

    this.doc.setFontSize(18);
    this.setColor(COLORS.dark, 'text');
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('DETAILED ANALYSIS', this.margin + 10, this.yPosition + 14);
    this.yPosition += 35;

    // Render each section
    sections.forEach((section, idx) => {
      this.checkPageBreak(60);
      this.renderMetricSection(section);
      this.yPosition += 15;
    });
  }

  private renderMetricSection(section: SectionConfig) {
    // Section title with colored bar
    this.setColor(section.color, 'fill');
    this.doc.rect(this.margin, this.yPosition, 3, 12, 'F');

    this.doc.setFontSize(11);
    this.setColor(COLORS.dark, 'text');
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(section.title, this.margin + 8, this.yPosition + 8);
    this.yPosition += 18;

    // Metrics grid (2 columns)
    const colWidth = (this.pageWidth - 2 * this.margin) / 2;
    const metrics = section.metrics;

    for (let i = 0; i < metrics.length; i += 2) {
      this.checkPageBreak(20);

      // Left metric
      this.renderMetricItem(metrics[i], this.margin, this.yPosition, colWidth - 5);

      // Right metric (if exists)
      if (metrics[i + 1]) {
        this.renderMetricItem(metrics[i + 1], this.margin + colWidth, this.yPosition, colWidth - 5);
      }

      this.yPosition += 18;
    }
  }

  private renderMetricItem(metric: MetricItem, x: number, y: number, width: number) {
    // Background
    this.setColor(COLORS.lightGray, 'fill');
    this.doc.roundedRect(x, y, width, 14, 2, 2, 'F');

    // Label
    this.doc.setFontSize(8);
    this.setColor(COLORS.gray, 'text');
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(metric.label.toUpperCase(), x + 4, y + 5);

    // Value
    this.doc.setFontSize(11);
    if (metric.highlight === 'positive') {
      this.setColor(COLORS.success, 'text');
    } else if (metric.highlight === 'negative') {
      this.setColor(COLORS.danger, 'text');
    } else {
      this.setColor(COLORS.dark, 'text');
    }
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(metric.value, x + 4, y + 11);
  }

  // Footer on all pages
  private addFooters() {
    const totalPages = this.doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);

      // Footer line
      this.setColor(COLORS.lightGray, 'draw');
      this.doc.line(this.margin, this.pageHeight - 15, this.pageWidth - this.margin, this.pageHeight - 15);

      // Footer text
      this.doc.setFontSize(8);
      this.setColor(COLORS.gray, 'text');
      this.doc.text('ROI Calculate | roicalculate.com', this.margin, this.pageHeight - 10);
      this.doc.text(`Page ${i} of ${totalPages}`, this.pageWidth - this.margin, this.pageHeight - 10, { align: 'right' });
    }
  }

  // Public method to generate PDF
  public generate(project: PortfolioProject): jsPDF {
    const category = getCalculatorCategory(project.calculatorId);

    // Build document
    this.addCoverPage(project, category);
    this.addExecutiveSummary(project, category);
    this.addDetailedMetrics(project, category);
    this.addFooters();

    return this.doc;
  }
}

// Pitch Deck Generator
class PitchDeckGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;

  constructor() {
    this.doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  private setColor(color: { r: number; g: number; b: number }, type: 'fill' | 'text' = 'fill') {
    if (type === 'fill') this.doc.setFillColor(color.r, color.g, color.b);
    else this.doc.setTextColor(color.r, color.g, color.b);
  }

  private addSlide() {
    this.doc.addPage();
  }

  // Title Slide
  private addTitleSlide(project: PortfolioProject) {
    const category = getCalculatorCategory(project.calculatorId);
    const color = getCategoryColor(category);

    // Background
    this.setColor(COLORS.dark, 'fill');
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, 'F');

    // Accent bar
    this.setColor(color, 'fill');
    this.doc.rect(0, this.pageHeight - 20, this.pageWidth, 20, 'F');

    // Main title
    this.doc.setFontSize(42);
    this.setColor(COLORS.white, 'text');
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(project.projectName || 'Investment Opportunity', this.pageWidth / 2, 70, { align: 'center' });

    // Subtitle
    this.doc.setFontSize(18);
    this.setColor(color, 'text');
    this.doc.text(getCalculatorDisplayName(project.calculatorId), this.pageWidth / 2, 90, { align: 'center' });

    // Location
    this.doc.setFontSize(14);
    this.setColor(COLORS.gray, 'text');
    this.doc.text(project.location || '', this.pageWidth / 2, 105, { align: 'center' });

    // Investment amount highlight
    this.doc.setFontSize(24);
    this.setColor(COLORS.white, 'text');
    this.doc.text(formatCurrency(project.totalInvestment), this.pageWidth / 2, 140, { align: 'center' });

    this.doc.setFontSize(12);
    this.setColor(COLORS.gray, 'text');
    this.doc.text('Total Investment', this.pageWidth / 2, 150, { align: 'center' });
  }

  // Key Metrics Slide
  private addMetricsSlide(project: PortfolioProject) {
    this.addSlide();
    const category = getCalculatorCategory(project.calculatorId);
    const color = getCategoryColor(category);

    // Background
    this.setColor(COLORS.white, 'fill');
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, 'F');

    // Header
    this.setColor(COLORS.dark, 'fill');
    this.doc.rect(0, 0, this.pageWidth, 35, 'F');

    this.doc.setFontSize(20);
    this.setColor(COLORS.white, 'text');
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('KEY INVESTMENT METRICS', 30, 23);

    // Metrics cards
    const metrics = [
      { label: 'TOTAL INVESTMENT', value: formatCurrency(project.totalInvestment), color: color },
      { label: 'ANNUAL ROI', value: `${(project.roi || 0).toFixed(1)}%`, color: (project.roi || 0) >= 10 ? COLORS.success : COLORS.warning },
      { label: 'ANNUAL CASH FLOW', value: formatCurrency(project.avgCashFlow), color: project.avgCashFlow > 0 ? COLORS.success : COLORS.danger },
      { label: 'BREAK-EVEN', value: `${project.breakEvenMonths || 0} months`, color: COLORS.secondary },
      { label: 'INVESTMENT SCORE', value: `${Math.round(project.investmentScore || 0)}/100`, color: (project.investmentScore || 0) >= 70 ? COLORS.success : COLORS.warning },
      { label: 'STRATEGY', value: (project.strategy || 'Hold').toUpperCase(), color: COLORS.accent },
    ];

    const cardWidth = 80;
    const cardHeight = 50;
    const startX = 30;
    const startY = 55;
    const gap = 15;

    metrics.forEach((metric, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = startX + col * (cardWidth + gap);
      const y = startY + row * (cardHeight + gap);

      // Card background
      this.setColor(metric.color, 'fill');
      this.doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');

      // Label
      this.doc.setFontSize(9);
      this.setColor(COLORS.white, 'text');
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(metric.label, x + cardWidth / 2, y + 15, { align: 'center' });

      // Value
      this.doc.setFontSize(20);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(metric.value, x + cardWidth / 2, y + 35, { align: 'center' });
    });
  }

  // Investment Grade Slide
  private addGradeSlide(project: PortfolioProject) {
    this.addSlide();
    const grade = getInvestmentGrade(project.investmentScore || 0);

    // Background
    this.setColor(grade.color, 'fill');
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, 'F');

    // Grade
    this.doc.setFontSize(120);
    this.setColor(COLORS.white, 'text');
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(grade.grade, this.pageWidth / 2, 90, { align: 'center' });

    // Label
    this.doc.setFontSize(24);
    this.doc.text(grade.label, this.pageWidth / 2, 120, { align: 'center' });

    // Score
    this.doc.setFontSize(16);
    this.doc.text(`Investment Score: ${Math.round(project.investmentScore || 0)}/100`, this.pageWidth / 2, 145, { align: 'center' });
  }

  // Call to Action Slide
  private addCTASlide(project: PortfolioProject) {
    this.addSlide();
    const category = getCalculatorCategory(project.calculatorId);
    const color = getCategoryColor(category);

    // Background
    this.setColor(COLORS.dark, 'fill');
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, 'F');

    // Accent
    this.setColor(color, 'fill');
    this.doc.rect(0, 0, 10, this.pageHeight, 'F');

    // Title
    this.doc.setFontSize(32);
    this.setColor(COLORS.white, 'text');
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('READY TO INVEST?', 40, 60);

    // Summary stats
    this.doc.setFontSize(18);
    this.setColor(COLORS.gray, 'text');
    this.doc.setFont('helvetica', 'normal');

    const lines = [
      `Investment Amount: ${formatCurrency(project.totalInvestment)}`,
      `Expected ROI: ${(project.roi || 0).toFixed(1)}%`,
      `Annual Cash Flow: ${formatCurrency(project.avgCashFlow)}`,
      `Location: ${project.location || 'Prime Location'}`,
    ];

    lines.forEach((line, i) => {
      this.doc.text(line, 40, 90 + i * 15);
    });

    // Contact box
    this.setColor(color, 'fill');
    this.doc.roundedRect(40, 150, 200, 30, 3, 3, 'F');

    this.doc.setFontSize(14);
    this.setColor(COLORS.white, 'text');
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Contact us to learn more about this opportunity', 140, 168, { align: 'center' });

    // Footer
    this.doc.setFontSize(10);
    this.setColor(COLORS.gray, 'text');
    this.doc.text('Generated by ROI Calculate | roicalculate.com', 40, this.pageHeight - 15);
  }

  public generate(project: PortfolioProject): jsPDF {
    this.addTitleSlide(project);
    this.addMetricsSlide(project);
    this.addGradeSlide(project);
    this.addCTASlide(project);

    return this.doc;
  }
}

// Export functions
export function generateEnterpriseReport(project: PortfolioProject): void {
  const generator = new EnterprisePDFGenerator();
  const doc = generator.generate(project);
  doc.save(`${project.projectName?.replace(/\s+/g, '-') || 'investment'}-enterprise-report.pdf`);
}

export function generatePitchDeck(project: PortfolioProject): void {
  const generator = new PitchDeckGenerator();
  const doc = generator.generate(project);
  doc.save(`${project.projectName?.replace(/\s+/g, '-') || 'investment'}-pitch-deck.pdf`);
}

export { EnterprisePDFGenerator, PitchDeckGenerator, getCalculatorCategory, getCalculatorDisplayName, getCategoryColor, formatCurrency, COLORS };
