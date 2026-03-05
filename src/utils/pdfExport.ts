import jsPDF from 'jspdf';
import type { PortfolioProject } from '../types/portfolio';

const colors = {
  primary: { r: 79, g: 70, b: 229 }, // indigo-600
  success: { r: 34, g: 197, b: 94 }, // green-500
  warning: { r: 251, g: 146, b: 60 }, // orange-500
  danger: { r: 239, g: 68, b: 68 }, // red-500
  gray: { r: 107, g: 114, b: 128 }, // gray-500
  lightGray: { r: 229, g: 231, b: 235 }, // gray-200
  blue: { r: 59, g: 130, b: 246 }, // blue-500
  yellow: { r: 234, g: 179, b: 8 }, // yellow-500
  orange: { r: 249, g: 115, b: 22 }, // orange-500
  rose: { r: 244, g: 63, b: 94 }, // rose-500
  teal: { r: 20, g: 184, b: 166 }, // teal-500
};

// Calculator category types
type CalculatorCategory = 'investment' | 'financing' | 'budget' | 'tax' | 'risk' | 'npv';

// Get calculator category
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

// Get friendly calculator name
const getCalculatorDisplayName = (calculatorId: string): string => {
  const names: Record<string, string> = {
    'rental-roi': 'Rental ROI Calculator',
    'xirr': 'XIRR Calculator',
    'mortgage': 'Mortgage Calculator',
    'cashflow': 'Cash Flow Calculator',
    'dev-feasibility': 'Development Feasibility',
    'cap-rate': 'Cap Rate Calculator',
    'irr': 'IRR Calculator',
    'npv': 'NPV Calculator',
    'indonesia-tax': 'Indonesia Tax Optimizer',
    'rental-projection': 'Rental Income Projection',
    'financing': 'Financing Comparison',
    'dev-budget': 'Development Budget Tracker',
    'risk-assessment': 'Risk Assessment',
  };
  return names[calculatorId] || calculatorId?.replace('-', ' ') || 'Calculator';
};

// Get category accent color
const getCategoryColor = (category: CalculatorCategory) => {
  switch (category) {
    case 'financing': return colors.blue;
    case 'budget': return colors.yellow;
    case 'tax': return colors.orange;
    case 'risk': return colors.rose;
    case 'npv': return colors.teal;
    default: return colors.success;
  }
};

const setColorFill = (doc: jsPDF, color: { r: number; g: number; b: number }) => {
  doc.setFillColor(color.r, color.g, color.b);
};

interface PDFReportOptions {
  includeAnalysis?: boolean;
  includeBranding?: boolean;
}

export function generateProjectPDF(
  project: PortfolioProject,
  options: PDFReportOptions = {}
) {
  const {
    includeAnalysis = true,
    includeBranding = true,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const category = getCalculatorCategory(project.calculatorId);
  const categoryColor = getCategoryColor(category);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Enterprise color palette
  const COLORS = {
    primary: { r: 16, g: 185, b: 129 },      // emerald-500
    primaryDark: { r: 5, g: 150, b: 105 },   // emerald-600
    dark: { r: 24, g: 24, b: 27 },           // zinc-900
    gray: { r: 113, g: 113, b: 122 },        // zinc-500
    lightGray: { r: 244, g: 244, b: 245 },   // zinc-100
    white: { r: 255, g: 255, b: 255 },
  };

  let y = 0;

  // Helper: Draw gradient header
  const drawHeader = () => {
    const headerHeight = 35;
    for (let i = 0; i < headerHeight; i++) {
      const ratio = i / headerHeight;
      const r = Math.round(COLORS.primary.r + (COLORS.primaryDark.r - COLORS.primary.r) * ratio);
      const g = Math.round(COLORS.primary.g + (COLORS.primaryDark.g - COLORS.primary.g) * ratio);
      const b = Math.round(COLORS.primary.b + (COLORS.primaryDark.b - COLORS.primary.b) * ratio);
      doc.setFillColor(r, g, b);
      doc.rect(0, i, pageWidth, 1, 'F');
    }

    // Logo text
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
    doc.text('ROI CALCULATE', margin, 22);

    // Report type badge
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth - margin - 40, 12, 40, 12, 2, 2, 'F');
    doc.setTextColor(COLORS.primaryDark.r, COLORS.primaryDark.g, COLORS.primaryDark.b);
    doc.text('Project Report', pageWidth - margin - 36, 20);

    return headerHeight + 10;
  };

  // Helper: Add footer to all pages
  const addFooters = () => {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      doc.setFontSize(8);
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      doc.text('ROI Calculate | roicalculate.com', margin, pageHeight - 10);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }
  };

  // Get project rating
  const getProjectRating = (project: PortfolioProject, category: CalculatorCategory) => {
    if (category === 'financing') {
      const rate = project.data?.interestRate || 0;
      if (rate <= 4) return { grade: 'A+', label: 'Excellent Rate', color: colors.success };
      if (rate <= 5) return { grade: 'A', label: 'Great Rate', color: colors.success };
      if (rate <= 6) return { grade: 'B+', label: 'Good Rate', color: colors.blue };
      if (rate <= 7) return { grade: 'B', label: 'Fair Rate', color: colors.warning };
      return { grade: 'C', label: 'High Rate', color: colors.danger };
    }
    if (category === 'budget') {
      const health = project.data?.calculations?.healthScore || 0;
      if (health >= 90) return { grade: 'A+', label: 'On Track', color: colors.success };
      if (health >= 75) return { grade: 'A', label: 'Good Health', color: colors.success };
      if (health >= 60) return { grade: 'B', label: 'Moderate', color: colors.warning };
      return { grade: 'C', label: 'At Risk', color: colors.danger };
    }
    const score = project.investmentScore || 0;
    if (score >= 85) return { grade: 'A+', label: 'Excellent', color: colors.success };
    if (score >= 75) return { grade: 'A', label: 'Very Good', color: colors.success };
    if (score >= 65) return { grade: 'B+', label: 'Good', color: colors.blue };
    if (score >= 55) return { grade: 'B', label: 'Above Avg', color: colors.warning };
    if (score >= 45) return { grade: 'C', label: 'Average', color: colors.warning };
    return { grade: 'D', label: 'Review', color: colors.danger };
  };

  const rating = getProjectRating(project, category);

  // === PAGE 1 ===
  if (includeBranding) {
    y = drawHeader();
  } else {
    y = 20;
  }

  // Title section
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text(project.projectName, margin, y + 8);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
  doc.text(`${project.location} | ${new Date(project.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, margin, y + 16);

  // Calculator type badge
  doc.setFillColor(categoryColor.r, categoryColor.g, categoryColor.b);
  const calcName = getCalculatorDisplayName(project.calculatorId);
  const calcNameWidth = doc.getTextWidth(calcName) + 8;
  doc.roundedRect(margin, y + 20, calcNameWidth, 7, 1, 1, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(calcName, margin + 4, y + 25);

  y += 38;

  // Rating Card
  const ratingCardX = margin;
  const ratingCardY = y;
  const ratingCardWidth = 50;
  const ratingCardHeight = 40;

  doc.setFillColor(rating.color.r, rating.color.g, rating.color.b);
  doc.roundedRect(ratingCardX, ratingCardY, ratingCardWidth, ratingCardHeight, 3, 3, 'F');

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
  doc.text(rating.grade, ratingCardX + ratingCardWidth / 2, ratingCardY + 20, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(rating.label.toUpperCase(), ratingCardX + ratingCardWidth / 2, ratingCardY + 30, { align: 'center' });

  // Key Metrics Grid (beside rating card)
  const metrics = getMetricsForCategory(project, category, categoryColor);
  const metricsX = ratingCardX + ratingCardWidth + 10;
  const metricWidth = (contentWidth - ratingCardWidth - 10) / 3 - 3;
  const metricHeight = 18;

  metrics.slice(0, 6).forEach((metric, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const mx = metricsX + col * (metricWidth + 3);
    const my = ratingCardY + row * (metricHeight + 4);

    doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
    doc.roundedRect(mx, my, metricWidth, metricHeight, 2, 2, 'F');

    // Colored left accent
    doc.setFillColor(metric.color.r, metric.color.g, metric.color.b);
    doc.rect(mx, my, 2, metricHeight, 'F');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
    doc.text(String(metric.label).toUpperCase(), mx + 5, my + 6);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.text(String(metric.value), mx + 5, my + 14);
  });

  y = ratingCardY + ratingCardHeight + 15;

  // Analysis Section
  if (includeAnalysis) {
    // Section header with colored bar
    doc.setFillColor(categoryColor.r, categoryColor.g, categoryColor.b);
    doc.rect(margin, y, 3, 10, 'F');

    const analysisTitles: Record<CalculatorCategory, string> = {
      investment: 'Investment Analysis',
      financing: 'Loan Analysis',
      budget: 'Budget Analysis',
      tax: 'Tax Analysis',
      risk: 'Risk Analysis',
      npv: 'NPV Analysis',
    };

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.text(analysisTitles[category], margin + 8, y + 7);

    y += 18;

    // Analysis points
    const analysisText = getAnalysisForCategory(project, category);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);

    analysisText.forEach((text, idx) => {
      doc.setFillColor(categoryColor.r, categoryColor.g, categoryColor.b);
      doc.circle(margin + 3, y + 2, 1.5, 'F');
      doc.text(text, margin + 10, y + 4);
      y += 8;
    });

    y += 10;
  }

  // Summary Section
  // Section header with colored bar
  doc.setFillColor(categoryColor.r, categoryColor.g, categoryColor.b);
  doc.rect(margin, y, 3, 10, 'F');

  const summaryTitles: Record<CalculatorCategory, string> = {
    investment: 'Investment Summary',
    financing: 'Loan Summary',
    budget: 'Budget Summary',
    tax: 'Tax Summary',
    risk: 'Risk Summary',
    npv: 'NPV Summary',
  };

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text(summaryTitles[category], margin + 8, y + 7);

  y += 15;

  // Summary text
  const summaryText = getSummaryForCategory(project, category);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);

  const summaryLines = doc.splitTextToSize(summaryText, contentWidth);
  doc.text(summaryLines, margin, y + 4);

  y += summaryLines.length * 5 + 15;

  // Disclaimer
  if (y + 25 < pageHeight - 25) {
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
    doc.text('Disclaimer: This report is for informational purposes only and does not constitute financial advice.', margin + 5, y + 7);
    doc.text('Past performance does not guarantee future results. Consult a financial advisor before making investment decisions.', margin + 5, y + 13);
  }

  // Add footers
  addFooters();

  // Save
  doc.save(`${project.projectName.replace(/\s+/g, '-')}-report.pdf`);
}

export function generatePortfolioComparisionPDF(
  projects: PortfolioProject[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Enterprise color palette
  const COLORS = {
    primary: { r: 16, g: 185, b: 129 },      // emerald-500
    primaryDark: { r: 5, g: 150, b: 105 },   // emerald-600
    dark: { r: 24, g: 24, b: 27 },           // zinc-900
    gray: { r: 113, g: 113, b: 122 },        // zinc-500
    lightGray: { r: 244, g: 244, b: 245 },   // zinc-100
    white: { r: 255, g: 255, b: 255 },
    success: { r: 22, g: 163, b: 74 },       // green-600
    warning: { r: 217, g: 119, b: 6 },       // amber-600
    danger: { r: 220, g: 38, b: 38 },        // red-600
  };

  let currentPage = 1;
  let y = 0;

  // Helper: Draw gradient header
  const drawHeader = () => {
    // Header background with gradient effect (simulate with rectangles)
    const headerHeight = 35;
    for (let i = 0; i < headerHeight; i++) {
      const ratio = i / headerHeight;
      const r = Math.round(COLORS.primary.r + (COLORS.primaryDark.r - COLORS.primary.r) * ratio);
      const g = Math.round(COLORS.primary.g + (COLORS.primaryDark.g - COLORS.primary.g) * ratio);
      const b = Math.round(COLORS.primary.b + (COLORS.primaryDark.b - COLORS.primary.b) * ratio);
      doc.setFillColor(r, g, b);
      doc.rect(0, i, pageWidth, 1, 'F');
    }

    // Logo text
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
    doc.text('ROI CALCULATE', margin, 22);

    // Report type badge
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth - margin - 45, 12, 45, 12, 2, 2, 'F');
    doc.setTextColor(COLORS.primaryDark.r, COLORS.primaryDark.g, COLORS.primaryDark.b);
    doc.text('Portfolio Report', pageWidth - margin - 40, 20);

    return headerHeight + 10;
  };

  // Helper: Add footer to all pages
  const addFooters = () => {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      doc.setFontSize(8);
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      doc.text('ROI Calculate | roicalculate.com', margin, pageHeight - 10);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }
  };

  // Calculate portfolio stats
  const totalInvestment = projects.reduce((sum, p) => sum + (p.totalInvestment || 0), 0);
  const totalCashFlow = projects.reduce((sum, p) => sum + (p.avgCashFlow || 0), 0);
  const avgROI = projects.length > 0
    ? projects.reduce((sum, p) => sum + (p.roi || 0), 0) / projects.length
    : 0;
  const avgScore = projects.length > 0
    ? projects.reduce((sum, p) => sum + (p.investmentScore || 0), 0) / projects.length
    : 0;

  // Get portfolio grade
  const getPortfolioGrade = (score: number) => {
    if (score >= 85) return { grade: 'A+', label: 'Excellent', color: COLORS.success };
    if (score >= 75) return { grade: 'A', label: 'Very Good', color: COLORS.success };
    if (score >= 65) return { grade: 'B+', label: 'Good', color: COLORS.primary };
    if (score >= 55) return { grade: 'B', label: 'Above Average', color: COLORS.warning };
    if (score >= 45) return { grade: 'C', label: 'Average', color: COLORS.warning };
    return { grade: 'D', label: 'Needs Review', color: COLORS.danger };
  };

  const portfolioGrade = getPortfolioGrade(avgScore);

  // === PAGE 1: Cover & Summary ===
  y = drawHeader();

  // Title section
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('Investment Portfolio Analysis', margin, y + 10);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
  doc.text(`${projects.length} Projects | Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, margin, y + 20);

  y += 35;

  // Portfolio Grade Card
  const gradeCardX = margin;
  const gradeCardY = y;
  const gradeCardWidth = 60;
  const gradeCardHeight = 50;

  doc.setFillColor(portfolioGrade.color.r, portfolioGrade.color.g, portfolioGrade.color.b);
  doc.roundedRect(gradeCardX, gradeCardY, gradeCardWidth, gradeCardHeight, 3, 3, 'F');

  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
  doc.text(portfolioGrade.grade, gradeCardX + gradeCardWidth / 2, gradeCardY + 25, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('PORTFOLIO GRADE', gradeCardX + gradeCardWidth / 2, gradeCardY + 35, { align: 'center' });
  doc.text(portfolioGrade.label, gradeCardX + gradeCardWidth / 2, gradeCardY + 43, { align: 'center' });

  // Key Metrics (beside grade card)
  const metricsX = gradeCardX + gradeCardWidth + 15;
  const metricWidth = (contentWidth - gradeCardWidth - 15) / 2 - 5;
  const metricHeight = 22;

  const keyMetrics = [
    { label: 'TOTAL INVESTMENT', value: formatCurrency(totalInvestment), color: COLORS.dark },
    { label: 'AVERAGE ROI', value: `${avgROI.toFixed(1)}%`, color: avgROI >= 15 ? COLORS.success : avgROI >= 8 ? COLORS.warning : COLORS.danger },
    { label: 'ANNUAL CASH FLOW', value: formatCurrency(totalCashFlow), color: totalCashFlow >= 0 ? COLORS.success : COLORS.danger },
    { label: 'AVG SCORE', value: `${Math.round(avgScore)}/100`, color: portfolioGrade.color },
  ];

  keyMetrics.forEach((metric, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const mx = metricsX + col * (metricWidth + 10);
    const my = gradeCardY + row * (metricHeight + 6);

    doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
    doc.roundedRect(mx, my, metricWidth, metricHeight, 2, 2, 'F');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
    doc.text(metric.label, mx + 5, my + 8);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(metric.color.r, metric.color.g, metric.color.b);
    doc.text(metric.value, mx + 5, my + 17);
  });

  y = gradeCardY + gradeCardHeight + 20;

  // Projects Table Section
  doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.rect(margin, y, 3, 12, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('Project Overview', margin + 8, y + 8);

  y += 20;

  // Table header
  const columns = [
    { label: 'Project', width: 45 },
    { label: 'Location', width: 30 },
    { label: 'Type', width: 30 },
    { label: 'Investment', width: 25 },
    { label: 'ROI', width: 18 },
    { label: 'Cash Flow', width: 22 },
    { label: 'Score', width: 20 },
  ];

  doc.setFillColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.rect(margin, y, contentWidth, 10, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);

  let colX = margin + 3;
  columns.forEach(col => {
    doc.text(col.label.toUpperCase(), colX, y + 7);
    colX += col.width;
  });

  y += 10;

  // Table rows
  const rowHeight = 12;
  projects.forEach((project, idx) => {
    // Check if we need a new page
    if (y + rowHeight > pageHeight - 25) {
      doc.addPage();
      currentPage++;
      y = 20;

      // Repeat table header on new page
      doc.setFillColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
      doc.rect(margin, y, contentWidth, 10, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
      colX = margin + 3;
      columns.forEach(col => {
        doc.text(col.label.toUpperCase(), colX, y + 7);
        colX += col.width;
      });
      y += 10;
    }

    // Alternating row background
    if (idx % 2 === 0) {
      doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);

    colX = margin + 3;

    // Project name
    doc.setFont('helvetica', 'bold');
    doc.text((project.projectName || 'Unnamed').substring(0, 22), colX, y + 8);
    colX += columns[0].width;
    doc.setFont('helvetica', 'normal');

    // Location
    doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
    doc.text((project.location || 'N/A').substring(0, 15), colX, y + 8);
    colX += columns[1].width;

    // Type
    doc.text(getCalculatorDisplayName(project.calculatorId).substring(0, 15), colX, y + 8);
    colX += columns[2].width;

    // Investment
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.text(formatCurrency(project.totalInvestment || 0), colX, y + 8);
    colX += columns[3].width;

    // ROI (colored)
    const roi = project.roi || 0;
    const roiColor = roi >= 15 ? COLORS.success : roi >= 8 ? COLORS.warning : COLORS.danger;
    doc.setTextColor(roiColor.r, roiColor.g, roiColor.b);
    doc.setFont('helvetica', 'bold');
    doc.text(`${roi.toFixed(1)}%`, colX, y + 8);
    colX += columns[4].width;
    doc.setFont('helvetica', 'normal');

    // Cash Flow
    const cf = project.avgCashFlow || 0;
    doc.setTextColor(cf >= 0 ? COLORS.success.r : COLORS.danger.r, cf >= 0 ? COLORS.success.g : COLORS.danger.g, cf >= 0 ? COLORS.success.b : COLORS.danger.b);
    doc.text(formatCurrency(cf), colX, y + 8);
    colX += columns[5].width;

    // Score
    const score = project.investmentScore || 0;
    const scoreColor = score >= 70 ? COLORS.success : score >= 50 ? COLORS.warning : COLORS.danger;
    doc.setTextColor(scoreColor.r, scoreColor.g, scoreColor.b);
    doc.setFont('helvetica', 'bold');
    doc.text(`${Math.round(score)}`, colX, y + 8);

    y += rowHeight;
  });

  y += 15;

  // Portfolio Analysis Section
  if (y + 60 > pageHeight - 25) {
    doc.addPage();
    currentPage++;
    y = 20;
  }

  doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.rect(margin, y, 3, 12, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('Portfolio Analysis', margin + 8, y + 8);

  y += 20;

  // Analysis text
  const topPerformers = [...projects].sort((a, b) => (b.investmentScore || 0) - (a.investmentScore || 0)).slice(0, 3);
  const highestROI = [...projects].sort((a, b) => (b.roi || 0) - (a.roi || 0))[0];
  const strategies = [...new Set(projects.map(p => p.strategy).filter(Boolean))];

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);

  const analysisPoints = [
    `Portfolio Grade: ${portfolioGrade.grade} (${portfolioGrade.label}) - Based on weighted average of all project scores`,
    `Top Performer: ${topPerformers[0]?.projectName || 'N/A'} with a score of ${Math.round(topPerformers[0]?.investmentScore || 0)}/100`,
    `Highest ROI: ${highestROI?.projectName || 'N/A'} at ${(highestROI?.roi || 0).toFixed(1)}%`,
    `Investment Strategies: ${strategies.length > 0 ? strategies.map(s => s?.charAt(0).toUpperCase() + s?.slice(1)).join(', ') : 'Various'}`,
    `Average Break-Even: ${Math.round(projects.reduce((sum, p) => sum + (p.breakEvenMonths || 0), 0) / (projects.length || 1))} months`,
  ];

  analysisPoints.forEach((point, idx) => {
    doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
    doc.circle(margin + 3, y + 3, 1.5, 'F');
    doc.text(point, margin + 10, y + 5);
    y += 10;
  });

  // Disclaimer
  y += 10;
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
  doc.text('Disclaimer: This report is for informational purposes only and does not constitute financial advice.', margin + 5, y + 8);
  doc.text('Past performance does not guarantee future results. Please consult a financial advisor before making investment decisions.', margin + 5, y + 15);

  // Add footers to all pages
  addFooters();

  doc.save('portfolio-analysis-report.pdf');
}

// Short strategy labels for metrics grid
const getShortStrategyLabel = (strategy?: string): string => {
  if (!strategy) return '';
  const labels: Record<string, string> = {
    'flip': 'Flip',
    'hold': 'Hold',
    'rental': 'Rental',
    'development': 'Development',
  };
  return labels[strategy] || strategy.charAt(0).toUpperCase() + strategy.slice(1);
};

function getMetricsForCategory(
  project: PortfolioProject,
  category: CalculatorCategory,
  categoryColor: { r: number; g: number; b: number }
): Array<{ label: string; value: string; color: { r: number; g: number; b: number } }> {
  // First check for specific calculator types
  const calculatorId = project.calculatorId;
  const strategy = project.strategy;

  // Strategy metric to optionally include
  const strategyMetric = strategy ? {
    label: 'Strategy',
    value: getShortStrategyLabel(strategy),
    color: colors.primary,
  } : null;

  switch (calculatorId) {
    // ===== RENTAL PROJECTION =====
    case 'rental-projection': {
      const metrics = [
        {
          label: 'Nightly Rate',
          value: formatCurrency(project.data?.nightlyRate || project.data?.result?.averageNightlyRate || 0),
          color: categoryColor,
        },
        {
          label: 'Occupancy Rate',
          value: `${(project.data?.baseOccupancyRate || project.data?.result?.averageOccupancy || 0).toFixed(0)}%`,
          color: (project.data?.baseOccupancyRate || 0) >= 70 ? colors.success : colors.warning,
        },
        {
          label: 'Annual Revenue',
          value: formatCurrency(project.data?.result?.annualRevenue || 0),
          color: colors.success,
        },
        {
          label: 'Annual Net Income',
          value: formatCurrency(project.data?.result?.annualNetIncome || project.avgCashFlow || 0),
          color: (project.data?.result?.annualNetIncome || project.avgCashFlow || 0) > 0 ? colors.success : colors.danger,
        },
        {
          label: 'Break-Even',
          value: `${project.data?.result?.breakEvenMonths || project.breakEvenMonths || 0} months`,
          color: (project.breakEvenMonths || 0) <= 36 ? colors.success : colors.warning,
        },
      ];
      if (strategyMetric) metrics.push(strategyMetric);
      else metrics.push({
        label: 'Platform Fee',
        value: `${(project.data?.platformFeePercent || 0).toFixed(0)}%`,
        color: colors.gray,
      });
      return metrics;
    }

    // ===== RENTAL ROI =====
    case 'rental-roi': {
      const metrics = [
        {
          label: 'Initial Investment',
          value: formatCurrency(project.data?.initialInvestment || project.totalInvestment || 0),
          color: categoryColor,
        },
        {
          label: 'ADR (Y1)',
          value: formatCurrency(project.data?.y1ADR || 0),
          color: colors.primary,
        },
        {
          label: 'Occupancy (Y1)',
          value: `${(project.data?.y1Occupancy || 0).toFixed(0)}%`,
          color: (project.data?.y1Occupancy || 0) >= 70 ? colors.success : colors.warning,
        },
        {
          label: 'ROI After Mgmt',
          value: `${(project.data?.averages?.roiAfterManagement || project.roi || 0).toFixed(1)}%`,
          color: (project.roi || 0) >= 10 ? colors.success : colors.warning,
        },
        {
          label: 'Annual Profit',
          value: formatCurrency(project.data?.averages?.takeHomeProfit || project.avgCashFlow || 0),
          color: colors.success,
        },
      ];
      if (strategyMetric) metrics.push(strategyMetric);
      else metrics.push({
        label: 'GOP Margin',
        value: `${(project.data?.averages?.gopMargin || 0).toFixed(1)}%`,
        color: colors.gray,
      });
      return metrics;
    }

    // ===== XIRR =====
    case 'xirr': {
      const metrics = [
        {
          label: 'Total Investment',
          value: formatCurrency(project.data?.result?.totalInvested || project.data?.property?.totalPrice || project.totalInvestment || 0),
          color: categoryColor,
        },
        {
          label: 'XIRR',
          value: `${((project.data?.result?.rate || 0) * 100).toFixed(1)}%`,
          color: ((project.data?.result?.rate || 0) * 100) >= 12 ? colors.success : colors.warning,
        },
        {
          label: 'Net Profit',
          value: formatCurrency(project.data?.result?.netProfit || 0),
          color: (project.data?.result?.netProfit || 0) > 0 ? colors.success : colors.danger,
        },
        {
          label: 'Exit Price',
          value: formatCurrency(project.data?.exit?.exitPrice || project.data?.result?.exitValue || 0),
          color: colors.primary,
        },
        {
          label: 'Hold Period',
          value: `${project.data?.result?.holdPeriodMonths || (project.data?.exit?.holdPeriodYears || 0) * 12 || 0} months`,
          color: colors.gray,
        },
      ];
      if (strategyMetric) metrics.push(strategyMetric);
      else metrics.push({
        label: 'Total Return',
        value: formatCurrency(project.data?.result?.totalReturn || 0),
        color: colors.success,
      });
      return metrics;
    }

    // ===== CAP RATE =====
    case 'cap-rate': {
      const metrics = [
        {
          label: 'Property Value',
          value: formatCurrency(project.data?.propertyValue || project.totalInvestment || 0),
          color: categoryColor,
        },
        {
          label: 'Cap Rate',
          value: `${(project.data?.result?.capRate || project.data?.result?.adjustedCapRate || project.roi || 0).toFixed(2)}%`,
          color: (project.roi || 0) >= 6 ? colors.success : colors.warning,
        },
        {
          label: 'Yearly NOI',
          value: formatCurrency(project.data?.result?.yearlyNOI || 0),
          color: colors.success,
        },
        {
          label: 'Monthly NOI',
          value: formatCurrency(project.data?.result?.monthlyNOI || project.data?.result?.adjustedMonthlyNOI || 0),
          color: colors.primary,
        },
        {
          label: 'Gross Revenue',
          value: formatCurrency((project.data?.monthlyRent || 0) * 12 || project.data?.result?.grossRevenue || 0),
          color: colors.blue,
        },
      ];
      if (strategyMetric) metrics.push(strategyMetric);
      else metrics.push({
        label: 'Expense Ratio',
        value: `${(project.data?.result?.expenseRatio || 0).toFixed(1)}%`,
        color: colors.gray,
      });
      return metrics;
    }

    // ===== IRR =====
    case 'irr': {
      const metrics = [
        {
          label: 'Total Investment',
          value: formatCurrency(project.data?.result?.totalInvested || project.totalInvestment || 0),
          color: categoryColor,
        },
        {
          label: 'IRR',
          value: `${(project.data?.result?.irr || project.roi || 0).toFixed(1)}%`,
          color: (project.roi || 0) >= 15 ? colors.success : colors.warning,
        },
        {
          label: 'Total Cash Flow',
          value: formatCurrency(project.data?.result?.totalCashFlow || 0),
          color: (project.data?.result?.totalCashFlow || 0) > 0 ? colors.success : colors.danger,
        },
        {
          label: 'Payback Period',
          value: `${(project.data?.result?.paybackPeriod || 0).toFixed(1)} years`,
          color: colors.primary,
        },
        {
          label: 'Total Return',
          value: formatCurrency(project.data?.result?.totalReturn || 0),
          color: colors.success,
        },
      ];
      if (strategyMetric) metrics.push(strategyMetric);
      else metrics.push({
        label: 'ROI Multiple',
        value: `${(project.data?.result?.roiMultiple || 0).toFixed(2)}x`,
        color: (project.data?.result?.roiMultiple || 0) >= 1.5 ? colors.success : colors.warning,
      });
      return metrics;
    }

    // ===== DEV FEASIBILITY =====
    case 'dev-feasibility': {
      const metrics = [
        {
          label: 'Total Project Cost',
          value: formatCurrency(project.data?.scenarios?.[0]?.totalProjectCost || project.data?.totalProjectCost || project.totalInvestment || 0),
          color: categoryColor,
        },
        {
          label: 'ROI (Flip)',
          value: `${(project.data?.scenarios?.[0]?.roiFlip || project.roi || 0).toFixed(1)}%`,
          color: (project.roi || 0) >= 20 ? colors.success : colors.warning,
        },
        {
          label: 'Gross Profit',
          value: formatCurrency(project.data?.scenarios?.[0]?.grossProfit || 0),
          color: (project.data?.scenarios?.[0]?.grossProfit || 0) > 0 ? colors.success : colors.danger,
        },
        {
          label: 'Sale Price',
          value: formatCurrency(project.data?.scenarios?.[0]?.projectedSalePrice || project.data?.salePrice || 0),
          color: colors.primary,
        },
        {
          label: 'Profit Margin',
          value: `${(project.data?.scenarios?.[0]?.profitMargin || 0).toFixed(1)}%`,
          color: colors.blue,
        },
      ];
      if (strategyMetric) metrics.push(strategyMetric);
      else metrics.push({
        label: 'Land Cost',
        value: formatCurrency(project.data?.landCost || project.data?.scenarios?.[0]?.landCost || 0),
        color: colors.gray,
      });
      return metrics;
    }

    // ===== CASHFLOW =====
    case 'cashflow': {
      const income = project.data?.monthlyRentalIncome || 0;
      const expenses = (project.data?.monthlyMortgage || 0) + (project.data?.monthlyMaintenance || 0) +
                      (project.data?.monthlyPropertyTax || 0) + (project.data?.monthlyInsurance || 0);
      const netMonthly = income - expenses;
      const metrics = [
        {
          label: 'Monthly Rental',
          value: formatCurrency(project.data?.monthlyRentalIncome || 0),
          color: categoryColor,
        },
        {
          label: 'Monthly Mortgage',
          value: formatCurrency(project.data?.monthlyMortgage || 0),
          color: colors.warning,
        },
        {
          label: 'Net Monthly',
          value: formatCurrency(netMonthly),
          color: netMonthly > 0 ? colors.success : colors.danger,
        },
        {
          label: 'Annual Cash Flow',
          value: formatCurrency((project.avgCashFlow || 0) * 12),
          color: (project.avgCashFlow || 0) > 0 ? colors.success : colors.danger,
        },
      ];
      if (strategyMetric) metrics.push(strategyMetric);
      else metrics.push({
        label: 'Maintenance',
        value: formatCurrency(project.data?.monthlyMaintenance || 0),
        color: colors.gray,
      });
      return metrics;
    }
  }

  // Fall back to category-based metrics
  switch (category) {
    case 'financing':
      return [
        {
          label: 'Loan Amount',
          value: formatCurrency(project.data?.loanAmount || project.totalInvestment || 0),
          color: categoryColor,
        },
        {
          label: 'Monthly Payment',
          value: formatCurrency(project.data?.result?.monthlyPayment || project.data?.monthlyPayment || 0),
          color: colors.primary,
        },
        {
          label: 'Interest Rate',
          value: `${(project.data?.interestRate || 0).toFixed(2)}%`,
          color: (project.data?.interestRate || 0) <= 5 ? colors.success : colors.warning,
        },
        {
          label: 'Total Interest',
          value: formatCurrency(project.data?.result?.totalInterest || 0),
          color: colors.warning,
        },
        {
          label: 'Loan Term',
          value: `${project.data?.loanTerm || project.data?.loanTermYears || 0} years`,
          color: colors.gray,
        },
        {
          label: 'Total Payment',
          value: formatCurrency(project.data?.result?.totalPayment || (project.data?.loanAmount || 0) + (project.data?.result?.totalInterest || 0)),
          color: colors.primary,
        },
      ];

    case 'budget':
      const budgetUsed = ((project.data?.calculations?.totalActual || 0) / (project.data?.calculations?.totalBudgeted || 1) * 100);
      return [
        {
          label: 'Total Budget',
          value: formatCurrency(project.data?.calculations?.totalBudgeted || project.totalInvestment || 0),
          color: categoryColor,
        },
        {
          label: 'Spent to Date',
          value: formatCurrency(project.data?.calculations?.totalActual || 0),
          color: colors.primary,
        },
        {
          label: 'Remaining',
          value: formatCurrency((project.data?.calculations?.totalBudgeted || 0) - (project.data?.calculations?.totalActual || 0)),
          color: ((project.data?.calculations?.totalBudgeted || 0) - (project.data?.calculations?.totalActual || 0)) >= 0 ? colors.success : colors.danger,
        },
        {
          label: 'Variance',
          value: `${(project.data?.calculations?.variancePercent || 0) > 0 ? '+' : ''}${(project.data?.calculations?.variancePercent || 0).toFixed(1)}%`,
          color: (project.data?.calculations?.variancePercent || 0) > 0 ? colors.danger : colors.success,
        },
        {
          label: 'Project Health',
          value: `${(project.data?.calculations?.healthScore || 0).toFixed(0)}%`,
          color: (project.data?.calculations?.healthScore || 0) >= 80 ? colors.success : (project.data?.calculations?.healthScore || 0) >= 60 ? colors.warning : colors.danger,
        },
        {
          label: 'Progress',
          value: `${budgetUsed.toFixed(0)}%`,
          color: colors.gray,
        },
      ];

    case 'tax':
      return [
        {
          label: 'Property Value',
          value: formatCurrency(project.data?.purchasePrice || project.totalInvestment || 0),
          color: categoryColor,
        },
        {
          label: 'Total Tax',
          value: formatCurrency(project.data?.result?.totalTaxLiability || 0),
          color: colors.warning,
        },
        {
          label: 'Effective Rate',
          value: `${(project.data?.result?.effectiveTaxRate || 0).toFixed(1)}%`,
          color: colors.primary,
        },
        {
          label: 'Capital Gains',
          value: formatCurrency(project.data?.result?.capitalGainsTax || 0),
          color: colors.warning,
        },
        {
          label: 'Net Proceeds',
          value: formatCurrency(project.data?.result?.netProceeds || 0),
          color: (project.data?.result?.netProceeds || 0) >= 0 ? colors.success : colors.danger,
        },
        {
          label: 'Net Profit',
          value: formatCurrency(project.data?.result?.netProfit || 0),
          color: (project.data?.result?.netProfit || 0) >= 0 ? colors.success : colors.danger,
        },
      ];

    case 'risk':
      const riskScore = project.data?.result?.riskScore || project.investmentScore || 0;
      return [
        {
          label: 'Investment',
          value: formatCurrency(project.totalInvestment || 0),
          color: categoryColor,
        },
        {
          label: 'Risk Score',
          value: `${riskScore}/100`,
          color: riskScore >= 70 ? colors.success : riskScore >= 50 ? colors.warning : colors.danger,
        },
        {
          label: 'Risk Level',
          value: project.data?.result?.riskLevel || 'Unknown',
          color: colors.primary,
        },
        {
          label: 'Expected Return',
          value: `${(project.data?.expectedReturn || project.roi || 0).toFixed(1)}%`,
          color: (project.data?.expectedReturn || project.roi || 0) >= 15 ? colors.success : colors.warning,
        },
        {
          label: 'Risk Tolerance',
          value: project.data?.riskTolerance || 'N/A',
          color: colors.gray,
        },
        {
          label: 'Status',
          value: (project.status || 'Active').charAt(0).toUpperCase() + (project.status || 'active').slice(1),
          color: colors.gray,
        },
      ];

    case 'npv':
      return [
        {
          label: 'Initial Investment',
          value: formatCurrency(project.data?.result?.totalCashOutflows || project.totalInvestment || 0),
          color: categoryColor,
        },
        {
          label: 'Net Present Value',
          value: formatCurrency(project.data?.result?.npv || 0),
          color: (project.data?.result?.npv || 0) >= 0 ? colors.success : colors.danger,
        },
        {
          label: 'Discount Rate',
          value: `${(project.data?.discountRate || 0).toFixed(1)}%`,
          color: colors.primary,
        },
        {
          label: 'Profitability Index',
          value: `${(project.data?.result?.profitabilityIndex || 0).toFixed(2)}x`,
          color: (project.data?.result?.profitabilityIndex || 0) >= 1 ? colors.success : colors.danger,
        },
        {
          label: 'Project Length',
          value: `${project.data?.projectLength || 0} years`,
          color: colors.gray,
        },
        {
          label: 'Investment Score',
          value: `${Math.round(project.investmentScore || 0)}/100`,
          color: colors.primary,
        },
      ];

    // Investment calculators (default)
    default:
      return [
        {
          label: 'Total Investment',
          value: formatCurrency(project.totalInvestment || 0),
          color: categoryColor,
        },
        {
          label: 'ROI',
          value: `${(project.roi || 0).toFixed(1)}%`,
          color: (project.roi || 0) >= 15 ? colors.success : colors.warning,
        },
        {
          label: 'Annual Cash Flow',
          value: formatCurrency(project.avgCashFlow || 0),
          color: colors.success,
        },
        {
          label: 'Break-Even',
          value: `${project.breakEvenMonths || 0} months`,
          color: (project.breakEvenMonths || 0) <= 24 ? colors.success : colors.warning,
        },
        {
          label: 'Investment Score',
          value: `${Math.round(project.investmentScore || 0)}/100`,
          color: (project.investmentScore || 0) >= 70 ? colors.success : colors.warning,
        },
        {
          label: 'Status',
          value: (project.status || 'Active').charAt(0).toUpperCase() + (project.status || 'active').slice(1),
          color: colors.gray,
        },
      ];
  }
}

function addMetricsSection(
  doc: jsPDF,
  project: PortfolioProject,
  x: number,
  y: number,
  category: CalculatorCategory,
  categoryColor: { r: number; g: number; b: number }
) {
  const cardWidth = 55;
  const cardHeight = 22;
  const spacing = 3;

  const metrics = getMetricsForCategory(project, category, categoryColor);

  const perRow = 3;
  const cardHeightWithSpacing = cardHeight + spacing;

  metrics.forEach((metric, idx) => {
    const row = Math.floor(idx / perRow);
    const col = idx % perRow;
    const cardX = x + col * (cardWidth + spacing);
    const cardY = y + row * cardHeightWithSpacing;

    // Card background
    setColorFill(doc, metric.color);
    doc.rect(cardX, cardY, cardWidth, cardHeight, 'F');

    // Label
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(String(metric.label), cardX + 3, cardY + 5, { maxWidth: cardWidth - 6 });

    // Value
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(String(metric.value), cardX + 3, cardY + 15, { maxWidth: cardWidth - 6 });
    doc.setFont('helvetica', 'normal');
  });
}

// Helper to format strategy for display
const formatStrategy = (strategy?: string): string => {
  if (!strategy) return '';
  const strategyLabels: Record<string, string> = {
    'flip': 'Flip (Short-term Buy & Sell)',
    'hold': 'Hold (Long-term Appreciation)',
    'rental': 'Rental (Cash Flow Focus)',
    'development': 'Development (Renovation/Build)',
  };
  return strategyLabels[strategy] || strategy.charAt(0).toUpperCase() + strategy.slice(1);
};

function getAnalysisForCategory(project: PortfolioProject, category: CalculatorCategory): string[] {
  const calculatorId = project.calculatorId;
  const strategy = project.strategy;

  // Calculator-specific analysis
  switch (calculatorId) {
    // ===== RENTAL PROJECTION =====
    case 'rental-projection': {
      const occupancy = project.data?.baseOccupancyRate || project.data?.result?.averageOccupancy || 0;
      const nightlyRate = project.data?.nightlyRate || project.data?.result?.averageNightlyRate || 0;
      const annualRevenue = project.data?.result?.annualRevenue || 0;
      const annualNet = project.data?.result?.annualNetIncome || project.avgCashFlow || 0;
      const occupancyRating = occupancy >= 80 ? 'Excellent' : occupancy >= 65 ? 'Good' : occupancy >= 50 ? 'Moderate' : 'Low';
      const platformFee = project.data?.platformFeePercent || 0;
      const analysis = [
        `Occupancy Assessment: ${occupancyRating} (${occupancy.toFixed(0)}% projected)`,
        `Average Daily Rate: ${formatCurrency(nightlyRate)}/night`,
        `Gross Annual Revenue: ${formatCurrency(annualRevenue)}`,
        `Net Operating Income: ${formatCurrency(annualNet)} annually`,
      ];
      if (strategy) analysis.push(`Investment Strategy: ${formatStrategy(strategy)}`);
      else analysis.push(`Platform & Booking Fees: ${platformFee.toFixed(0)}% of gross revenue`);
      return analysis;
    }

    // ===== RENTAL ROI =====
    case 'rental-roi': {
      const investment = project.data?.initialInvestment || project.totalInvestment || 0;
      const y1ADR = project.data?.y1ADR || 0;
      const y1Occupancy = project.data?.y1Occupancy || 0;
      const roiAfterMgmt = project.data?.averages?.roiAfterManagement || project.roi || 0;
      const gopMargin = project.data?.averages?.gopMargin || 0;
      const roiRating = roiAfterMgmt >= 15 ? 'Excellent' : roiAfterMgmt >= 10 ? 'Good' : roiAfterMgmt >= 5 ? 'Moderate' : 'Low';
      const analysis = [
        `10-Year ROI Performance: ${roiRating} (${roiAfterMgmt.toFixed(1)}% avg annual)`,
        `Year 1 Average Daily Rate: ${formatCurrency(y1ADR)}`,
        `Year 1 Occupancy Target: ${y1Occupancy.toFixed(0)}%`,
        `Gross Operating Profit Margin: ${gopMargin.toFixed(1)}%`,
      ];
      if (strategy) analysis.push(`Investment Strategy: ${formatStrategy(strategy)}`);
      else analysis.push(`Total Capital Deployed: ${formatCurrency(investment)}`);
      return analysis;
    }

    // ===== XIRR =====
    case 'xirr': {
      const xirr = (project.data?.result?.rate || 0) * 100;
      const netProfit = project.data?.result?.netProfit || 0;
      const holdPeriod = project.data?.result?.holdPeriodMonths || (project.data?.exit?.holdPeriodYears || 0) * 12;
      const exitPrice = project.data?.exit?.exitPrice || project.data?.result?.exitValue || 0;
      const totalInvested = project.data?.result?.totalInvested || project.data?.property?.totalPrice || project.totalInvestment || 0;
      const xirrRating = xirr >= 20 ? 'Excellent' : xirr >= 15 ? 'Very Good' : xirr >= 10 ? 'Good' : xirr >= 5 ? 'Moderate' : 'Below Target';
      const analysis = [
        `XIRR Performance: ${xirrRating} (${xirr.toFixed(1)}% annualized)`,
        `Total Capital Invested: ${formatCurrency(totalInvested)}`,
        `Projected Exit Value: ${formatCurrency(exitPrice)}`,
        `Net Profit on Exit: ${formatCurrency(netProfit)}`,
      ];
      if (strategy) analysis.push(`Investment Strategy: ${formatStrategy(strategy)}`);
      else analysis.push(`Investment Hold Period: ${holdPeriod} months (${(holdPeriod / 12).toFixed(1)} years)`);
      return analysis;
    }

    // ===== CAP RATE =====
    case 'cap-rate': {
      const capRate = project.data?.result?.capRate || project.data?.result?.adjustedCapRate || project.roi || 0;
      const yearlyNOI = project.data?.result?.yearlyNOI || 0;
      const propertyValue = project.data?.propertyValue || project.totalInvestment || 0;
      const expenseRatio = project.data?.result?.expenseRatio || 0;
      const capRateRating = capRate >= 8 ? 'Strong' : capRate >= 6 ? 'Good' : capRate >= 4 ? 'Moderate' : 'Low';
      const analysis = [
        `Capitalization Rate: ${capRateRating} (${capRate.toFixed(2)}%)`,
        `Property Valuation: ${formatCurrency(propertyValue)}`,
        `Annual Net Operating Income: ${formatCurrency(yearlyNOI)}`,
        `Operating Expense Ratio: ${expenseRatio.toFixed(1)}%`,
      ];
      if (strategy) analysis.push(`Investment Strategy: ${formatStrategy(strategy)}`);
      else analysis.push(`Monthly NOI: ${formatCurrency((project.data?.result?.monthlyNOI || project.data?.result?.adjustedMonthlyNOI || 0))}`);
      return analysis;
    }

    // ===== IRR =====
    case 'irr': {
      const irr = project.data?.result?.irr || project.roi || 0;
      const totalCashFlow = project.data?.result?.totalCashFlow || 0;
      const paybackPeriod = project.data?.result?.paybackPeriod || 0;
      const roiMultiple = project.data?.result?.roiMultiple || 0;
      const irrRating = irr >= 25 ? 'Exceptional' : irr >= 18 ? 'Excellent' : irr >= 12 ? 'Good' : irr >= 8 ? 'Moderate' : 'Below Target';
      const analysis = [
        `Internal Rate of Return: ${irrRating} (${irr.toFixed(1)}%)`,
        `Total Cash Flow Generated: ${formatCurrency(totalCashFlow)}`,
        `Payback Period: ${paybackPeriod.toFixed(1)} years`,
        `Return on Investment Multiple: ${roiMultiple.toFixed(2)}x`,
      ];
      if (strategy) analysis.push(`Investment Strategy: ${formatStrategy(strategy)}`);
      else analysis.push(`Investment Classification: ${irr >= 15 ? 'High Growth' : irr >= 10 ? 'Stable Return' : 'Income Focus'}`);
      return analysis;
    }

    // ===== DEV FEASIBILITY =====
    case 'dev-feasibility': {
      const totalCost = project.data?.scenarios?.[0]?.totalProjectCost || project.data?.totalProjectCost || project.totalInvestment || 0;
      const grossProfit = project.data?.scenarios?.[0]?.grossProfit || 0;
      const roiFlip = project.data?.scenarios?.[0]?.roiFlip || project.roi || 0;
      const profitMargin = project.data?.scenarios?.[0]?.profitMargin || 0;
      const salePrice = project.data?.scenarios?.[0]?.projectedSalePrice || project.data?.salePrice || 0;
      const feasibilityRating = roiFlip >= 30 ? 'Highly Feasible' : roiFlip >= 20 ? 'Feasible' : roiFlip >= 10 ? 'Marginal' : 'Not Recommended';
      const analysis = [
        `Development Feasibility: ${feasibilityRating} (${roiFlip.toFixed(1)}% ROI)`,
        `Total Project Cost: ${formatCurrency(totalCost)}`,
        `Projected Sale Price: ${formatCurrency(salePrice)}`,
        `Gross Development Profit: ${formatCurrency(grossProfit)}`,
      ];
      if (strategy) analysis.push(`Investment Strategy: ${formatStrategy(strategy)}`);
      else analysis.push(`Profit Margin on Cost: ${profitMargin.toFixed(1)}%`);
      return analysis;
    }

    // ===== CASHFLOW =====
    case 'cashflow': {
      const monthlyRental = project.data?.monthlyRentalIncome || 0;
      const monthlyMortgage = project.data?.monthlyMortgage || 0;
      const monthlyMaintenance = project.data?.monthlyMaintenance || 0;
      const netMonthly = monthlyRental - monthlyMortgage - monthlyMaintenance - (project.data?.monthlyPropertyTax || 0) - (project.data?.monthlyInsurance || 0);
      const cashOnCash = project.roi || 0;
      const cashflowRating = netMonthly > 0 ? (cashOnCash >= 10 ? 'Excellent' : cashOnCash >= 6 ? 'Good' : 'Moderate') : 'Negative';
      const analysis = [
        `Cash Flow Assessment: ${cashflowRating} (${formatCurrency(netMonthly)}/month)`,
        `Monthly Rental Income: ${formatCurrency(monthlyRental)}`,
        `Monthly Debt Service: ${formatCurrency(monthlyMortgage)}`,
        `Monthly Operating Costs: ${formatCurrency(monthlyMaintenance + (project.data?.monthlyPropertyTax || 0) + (project.data?.monthlyInsurance || 0))}`,
      ];
      if (strategy) analysis.push(`Investment Strategy: ${formatStrategy(strategy)}`);
      else analysis.push(`Cash-on-Cash Return: ${cashOnCash.toFixed(1)}%`);
      return analysis;
    }
  }

  // Fall back to category-based analysis
  switch (category) {
    case 'financing': {
      const monthlyPayment = project.data?.result?.monthlyPayment || project.data?.monthlyPayment || 0;
      const totalInterest = project.data?.result?.totalInterest || 0;
      const loanAmount = project.data?.loanAmount || project.totalInvestment || 0;
      const interestRate = project.data?.interestRate || 0;
      const interestRating = interestRate <= 4 ? 'Excellent' : interestRate <= 6 ? 'Good' : interestRate <= 8 ? 'Fair' : 'High';
      return [
        `Interest Rate Assessment: ${interestRating} (${interestRate.toFixed(2)}%)`,
        `Monthly Payment: ${formatCurrency(monthlyPayment)}/month`,
        `Total Interest Over Loan: ${formatCurrency(totalInterest)}`,
        `Interest as % of Principal: ${loanAmount > 0 ? ((totalInterest / loanAmount) * 100).toFixed(1) : 0}%`,
        `Loan Term: ${project.data?.loanTerm || 0} years (${(project.data?.loanTerm || 0) * 12} payments)`,
      ];
    }

    case 'budget': {
      const totalBudget = project.data?.calculations?.totalBudgeted || project.totalInvestment || 0;
      const spent = project.data?.calculations?.totalActual || 0;
      const variance = project.data?.calculations?.variancePercent || 0;
      const health = project.data?.calculations?.healthScore || 0;
      const healthRating = health >= 90 ? 'Excellent' : health >= 75 ? 'Good' : health >= 60 ? 'Fair' : 'At Risk';
      return [
        `Budget Health: ${healthRating} (${health.toFixed(0)}%)`,
        `Total Budget: ${formatCurrency(totalBudget)}`,
        `Spent to Date: ${formatCurrency(spent)} (${totalBudget > 0 ? ((spent / totalBudget) * 100).toFixed(1) : 0}%)`,
        `Budget Variance: ${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`,
        `Remaining Budget: ${formatCurrency(totalBudget - spent)}`,
      ];
    }

    case 'tax': {
      const totalTax = project.data?.result?.totalTaxLiability || 0;
      const effectiveRate = project.data?.result?.effectiveTaxRate || 0;
      const netProfit = project.data?.result?.netProfit || 0;
      const taxRating = effectiveRate <= 10 ? 'Favorable' : effectiveRate <= 20 ? 'Moderate' : 'High';
      return [
        `Tax Efficiency: ${taxRating} (${effectiveRate.toFixed(1)}% effective rate)`,
        `Total Tax Liability: ${formatCurrency(totalTax)}`,
        `Capital Gains Tax: ${formatCurrency(project.data?.result?.capitalGainsTax || 0)}`,
        `Net Proceeds: ${formatCurrency(project.data?.result?.netProceeds || 0)}`,
        `Net Profit After Tax: ${formatCurrency(netProfit)}`,
      ];
    }

    case 'risk': {
      const riskScore = project.data?.result?.riskScore || project.investmentScore || 0;
      const riskLevel = project.data?.result?.riskLevel || 'Unknown';
      const expectedReturn = project.data?.expectedReturn || project.roi || 0;
      const riskRating = riskScore >= 80 ? 'Low Risk' : riskScore >= 60 ? 'Moderate Risk' : riskScore >= 40 ? 'Elevated Risk' : 'High Risk';
      return [
        `Risk Assessment: ${riskRating} (Score: ${riskScore}/100)`,
        `Risk Level: ${riskLevel}`,
        `Expected Return: ${expectedReturn.toFixed(1)}%`,
        `Risk-Adjusted Analysis: ${expectedReturn / Math.max(100 - riskScore, 1) > 0.5 ? 'Favorable' : 'Caution advised'}`,
        `Risk Tolerance: ${project.data?.riskTolerance || 'Not specified'}`,
      ];
    }

    case 'npv': {
      const npv = project.data?.result?.npv || 0;
      const pi = project.data?.result?.profitabilityIndex || 0;
      const discountRate = project.data?.discountRate || 0;
      const npvRating = npv > 0 && pi > 1 ? 'Acceptable' : 'Not Recommended';
      return [
        `NPV Decision: ${npvRating}`,
        `Net Present Value: ${formatCurrency(npv)}`,
        `Profitability Index: ${pi.toFixed(2)}x ${pi >= 1 ? '(Profitable)' : '(Not profitable)'}`,
        `Discount Rate Used: ${discountRate.toFixed(1)}%`,
        `Project Length: ${project.data?.projectLength || 0} years`,
      ];
    }

    // Investment (default)
    default: {
      const roi = project.roi || 0;
      const roiRating = roi >= 20 ? 'Excellent' : roi >= 15 ? 'Very Good' : roi >= 10 ? 'Good' : roi >= 5 ? 'Moderate' : 'Poor';
      const score = project.investmentScore || 0;
      const scoreRating = score >= 85 ? 'Excellent' : score >= 70 ? 'Very Good' : score >= 60 ? 'Good' : score >= 50 ? 'Moderate' : 'High Risk';
      return [
        `ROI Rating: ${roiRating} (${roi.toFixed(1)}%)`,
        `Investment Score: ${scoreRating} (${Math.round(score)}/100)`,
        `Break-even Period: ${project.breakEvenMonths || 0} months`,
        `Annual Cash Flow: ${formatCurrency(project.avgCashFlow || 0)}`,
        `Strategy: ${(project.strategy || 'Not specified').charAt(0).toUpperCase() + (project.strategy || 'not specified').slice(1)}`,
      ];
    }
  }
}

function addAnalysisSection(
  doc: jsPDF,
  project: PortfolioProject,
  x: number,
  y: number,
  category: CalculatorCategory
) {
  const titles: Record<CalculatorCategory, string> = {
    investment: 'Investment Analysis',
    financing: 'Loan Analysis',
    budget: 'Budget Analysis',
    tax: 'Tax Analysis',
    risk: 'Risk Analysis',
    npv: 'NPV Analysis',
  };

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(titles[category], x, y);
  doc.setFont('helvetica', 'normal');

  y += 8;

  const analysisText = getAnalysisForCategory(project, category);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  analysisText.forEach((text, idx) => {
    doc.text(`• ${text}`, x + 5, y + idx * 6);
  });
}

function getSummaryForCategory(project: PortfolioProject, category: CalculatorCategory): string {
  const calculatorId = project.calculatorId;

  // Calculator-specific summaries
  switch (calculatorId) {
    // ===== RENTAL PROJECTION =====
    case 'rental-projection': {
      const occupancy = project.data?.baseOccupancyRate || project.data?.result?.averageOccupancy || 0;
      const nightlyRate = project.data?.nightlyRate || project.data?.result?.averageNightlyRate || 0;
      const annualRevenue = project.data?.result?.annualRevenue || 0;
      const annualNet = project.data?.result?.annualNetIncome || project.avgCashFlow || 0;
      const breakEven = project.data?.result?.breakEvenMonths || project.breakEvenMonths || 0;
      return `This rental income projection estimates ${formatCurrency(annualRevenue)} in annual gross revenue based on a ${formatCurrency(nightlyRate)} nightly rate and ${occupancy.toFixed(0)}% occupancy. After operating expenses and platform fees, net operating income is projected at ${formatCurrency(annualNet)} annually. ${breakEven > 0 ? `The investment is expected to break even in ${breakEven} months.` : ''} ${occupancy >= 70 ? 'The occupancy assumptions are realistic for vacation rental markets.' : 'Consider adjusting occupancy estimates based on local market data.'}`;
    }

    // ===== RENTAL ROI =====
    case 'rental-roi': {
      const investment = project.data?.initialInvestment || project.totalInvestment || 0;
      const roiAfterMgmt = project.data?.averages?.roiAfterManagement || project.roi || 0;
      const gopMargin = project.data?.averages?.gopMargin || 0;
      const avgProfit = project.data?.averages?.takeHomeProfit || project.avgCashFlow || 0;
      return `This 10-year rental ROI analysis projects an average annual return of ${roiAfterMgmt.toFixed(1)}% after management fees on an initial investment of ${formatCurrency(investment)}. The average annual take-home profit is ${formatCurrency(avgProfit)} with a gross operating profit margin of ${gopMargin.toFixed(1)}%. ${roiAfterMgmt >= 12 ? 'This represents an excellent long-term rental investment opportunity.' : roiAfterMgmt >= 8 ? 'Returns are solid and consistent with well-managed rental properties.' : 'Consider strategies to improve occupancy or rates to enhance returns.'}`;
    }

    // ===== XIRR =====
    case 'xirr': {
      const xirr = (project.data?.result?.rate || 0) * 100;
      const netProfit = project.data?.result?.netProfit || 0;
      const holdPeriod = project.data?.result?.holdPeriodMonths || (project.data?.exit?.holdPeriodYears || 0) * 12;
      const exitPrice = project.data?.exit?.exitPrice || project.data?.result?.exitValue || 0;
      return `The XIRR analysis yields an annualized return of ${xirr.toFixed(1)}% over a ${(holdPeriod / 12).toFixed(1)}-year hold period, with a projected exit value of ${formatCurrency(exitPrice)} and net profit of ${formatCurrency(netProfit)}. ${xirr >= 15 ? 'This exceeds typical market returns and represents a strong investment.' : xirr >= 10 ? 'Returns are competitive with alternative investment options.' : 'Consider extending the hold period or optimizing exit timing to improve returns.'}`;
    }

    // ===== CAP RATE =====
    case 'cap-rate': {
      const capRate = project.data?.result?.capRate || project.data?.result?.adjustedCapRate || project.roi || 0;
      const yearlyNOI = project.data?.result?.yearlyNOI || 0;
      const propertyValue = project.data?.propertyValue || project.totalInvestment || 0;
      const expenseRatio = project.data?.result?.expenseRatio || 0;
      return `This property has a capitalization rate of ${capRate.toFixed(2)}%, generating ${formatCurrency(yearlyNOI)} in annual NOI on a ${formatCurrency(propertyValue)} property value. The operating expense ratio of ${expenseRatio.toFixed(1)}% ${expenseRatio <= 40 ? 'indicates efficient operations' : expenseRatio <= 50 ? 'is within normal ranges' : 'may warrant expense optimization'}. ${capRate >= 7 ? 'This cap rate is attractive for income-focused investors.' : capRate >= 5 ? 'The cap rate reflects a stable, lower-risk profile.' : 'The lower cap rate suggests premium property or growth potential.'}`;
    }

    // ===== IRR =====
    case 'irr': {
      const irr = project.data?.result?.irr || project.roi || 0;
      const totalCashFlow = project.data?.result?.totalCashFlow || 0;
      const paybackPeriod = project.data?.result?.paybackPeriod || 0;
      const roiMultiple = project.data?.result?.roiMultiple || 0;
      return `The Internal Rate of Return for this investment is ${irr.toFixed(1)}%, with a total cash flow of ${formatCurrency(totalCashFlow)} and a ${roiMultiple.toFixed(2)}x return multiple. The payback period of ${paybackPeriod.toFixed(1)} years ${paybackPeriod <= 5 ? 'indicates rapid capital recovery' : paybackPeriod <= 8 ? 'is within acceptable ranges for this asset class' : 'suggests a longer-term investment horizon'}. ${irr >= 18 ? 'This IRR significantly outperforms market benchmarks.' : irr >= 12 ? 'Returns are competitive and justify the investment.' : 'Consider risk factors carefully at this return level.'}`;
    }

    // ===== DEV FEASIBILITY =====
    case 'dev-feasibility': {
      const totalCost = project.data?.scenarios?.[0]?.totalProjectCost || project.data?.totalProjectCost || project.totalInvestment || 0;
      const grossProfit = project.data?.scenarios?.[0]?.grossProfit || 0;
      const roiFlip = project.data?.scenarios?.[0]?.roiFlip || project.roi || 0;
      const profitMargin = project.data?.scenarios?.[0]?.profitMargin || 0;
      const salePrice = project.data?.scenarios?.[0]?.projectedSalePrice || project.data?.salePrice || 0;
      return `This development feasibility analysis projects a gross profit of ${formatCurrency(grossProfit)} on a total project cost of ${formatCurrency(totalCost)}, yielding a ${roiFlip.toFixed(1)}% ROI and ${profitMargin.toFixed(1)}% profit margin. The projected sale price is ${formatCurrency(salePrice)}. ${roiFlip >= 25 ? 'The development shows strong feasibility with healthy margins for risk mitigation.' : roiFlip >= 15 ? 'Feasibility is acceptable but margins should be monitored closely.' : 'Consider value engineering or alternative exit strategies to improve feasibility.'}`;
    }

    // ===== CASHFLOW =====
    case 'cashflow': {
      const monthlyRental = project.data?.monthlyRentalIncome || 0;
      const monthlyMortgage = project.data?.monthlyMortgage || 0;
      const totalExpenses = monthlyMortgage + (project.data?.monthlyMaintenance || 0) + (project.data?.monthlyPropertyTax || 0) + (project.data?.monthlyInsurance || 0);
      const netMonthly = monthlyRental - totalExpenses;
      const cashOnCash = project.roi || 0;
      const annualCashFlow = netMonthly * 12;
      return `This cash flow analysis shows monthly rental income of ${formatCurrency(monthlyRental)} against total monthly expenses of ${formatCurrency(totalExpenses)}, resulting in ${netMonthly >= 0 ? 'positive' : 'negative'} net cash flow of ${formatCurrency(netMonthly)}/month (${formatCurrency(annualCashFlow)}/year). The cash-on-cash return is ${cashOnCash.toFixed(1)}%. ${netMonthly > 0 && cashOnCash >= 8 ? 'This property generates strong positive cash flow.' : netMonthly > 0 ? 'Cash flow is positive but consider strategies to improve returns.' : 'Evaluate rent increases or expense reductions to achieve positive cash flow.'}`;
    }
  }

  // Fall back to category-based summaries
  switch (category) {
    case 'financing': {
      const interestRate = project.data?.interestRate || 0;
      const monthlyPayment = project.data?.result?.monthlyPayment || project.data?.monthlyPayment || 0;
      const totalInterest = project.data?.result?.totalInterest || 0;
      const loanAmount = project.data?.loanAmount || project.totalInvestment || 0;
      return `This mortgage analysis shows a ${interestRate <= 5 ? 'favorable' : interestRate <= 7 ? 'standard' : 'elevated'} interest rate of ${interestRate.toFixed(2)}%. With a loan amount of ${formatCurrency(loanAmount)}, the monthly payment will be ${formatCurrency(monthlyPayment)}. Over the loan term, total interest paid will be ${formatCurrency(totalInterest)}, representing ${loanAmount > 0 ? ((totalInterest / loanAmount) * 100).toFixed(1) : 0}% of the principal.`;
    }

    case 'budget': {
      const health = project.data?.calculations?.healthScore || 0;
      const variance = project.data?.calculations?.variancePercent || 0;
      const completion = project.data?.calculations?.overallCompletion || 0;
      return `This development project has a budget health score of ${health.toFixed(0)}%, indicating ${health >= 80 ? 'excellent' : health >= 60 ? 'adequate' : 'concerning'} financial management. The project is currently ${completion.toFixed(0)}% complete with a budget variance of ${variance > 0 ? '+' : ''}${variance.toFixed(1)}%. ${variance > 10 ? 'Cost overruns require immediate attention.' : variance > 0 ? 'Minor cost overruns should be monitored.' : 'The project is tracking within or under budget.'}`;
    }

    case 'tax': {
      const effectiveRate = project.data?.result?.effectiveTaxRate || 0;
      const netProfit = project.data?.result?.netProfit || 0;
      const totalTax = project.data?.result?.totalTaxLiability || 0;
      return `This tax analysis reveals an effective tax rate of ${effectiveRate.toFixed(1)}%, which is ${effectiveRate <= 15 ? 'favorable' : effectiveRate <= 25 ? 'moderate' : 'significant'}. The total tax liability is ${formatCurrency(totalTax)}, resulting in a net profit of ${formatCurrency(netProfit)}. ${netProfit > 0 ? 'The investment remains profitable after tax obligations.' : 'Consider tax optimization strategies to improve returns.'}`;
    }

    case 'risk': {
      const riskScore = project.data?.result?.riskScore || project.investmentScore || 0;
      const riskLevel = project.data?.result?.riskLevel || 'Unknown';
      const expectedReturn = project.data?.expectedReturn || project.roi || 0;
      return `This risk assessment indicates a ${riskLevel.toLowerCase()} risk profile with a score of ${riskScore}/100. The expected return of ${expectedReturn.toFixed(1)}% ${riskScore >= 60 && expectedReturn >= 10 ? 'provides an attractive risk-reward balance' : riskScore >= 60 ? 'is modest relative to the risk level' : 'should be carefully weighed against the elevated risk'}. ${riskScore >= 70 ? 'This investment aligns with conservative strategies.' : riskScore >= 50 ? 'Suitable for moderate risk tolerance.' : 'Only appropriate for high-risk tolerance investors.'}`;
    }

    case 'npv': {
      const npv = project.data?.result?.npv || 0;
      const pi = project.data?.result?.profitabilityIndex || 0;
      const discountRate = project.data?.discountRate || 0;
      return `The NPV analysis using a ${discountRate.toFixed(1)}% discount rate yields a Net Present Value of ${formatCurrency(npv)} and a Profitability Index of ${pi.toFixed(2)}x. ${npv > 0 && pi > 1 ? 'The positive NPV and PI > 1 indicate this project should create value and is recommended for investment.' : 'The negative NPV suggests this project may not meet the required rate of return and should be reconsidered or restructured.'}`;
    }

    // Investment (default)
    default: {
      const roi = project.roi || 0;
      const score = project.investmentScore || 0;
      return `This project presents a ${roi >= 15 ? 'strong' : roi >= 8 ? 'moderate' : 'modest'} investment opportunity with an ROI of ${roi.toFixed(1)}% and a break-even period of ${project.breakEvenMonths || 0} months. The investment score of ${Math.round(score)}/100 reflects ${score >= 70 ? 'excellent' : score >= 50 ? 'acceptable' : 'elevated risk in'} the overall quality and risk-adjusted return profile. ${project.strategy ? `The ${project.strategy} strategy is ${roi >= 12 ? 'performing well' : 'showing moderate results'}.` : ''}`;
    }
  }
}

function addSummarySection(
  doc: jsPDF,
  project: PortfolioProject,
  x: number,
  y: number,
  category: CalculatorCategory
) {
  const titles: Record<CalculatorCategory, string> = {
    investment: 'Investment Summary',
    financing: 'Loan Summary',
    budget: 'Budget Summary',
    tax: 'Tax Summary',
    risk: 'Risk Summary',
    npv: 'NPV Summary',
  };

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(titles[category], x, y);
  doc.setFont('helvetica', 'normal');

  y += 8;

  const summaryText = getSummaryForCategory(project, category);

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);

  const lines = doc.splitTextToSize(summaryText, 170);
  doc.text(lines, x, y);
}

function addTable(
  doc: jsPDF,
  data: string[][],
  x: number,
  y: number,
  width: number
) {
  const colCount = data[0].length;
  const colWidth = width / colCount;
  const rowHeight = 8;

  // Header row
  setColorFill(doc, colors.primary);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');

  data[0].forEach((cell, idx) => {
    doc.text(String(cell), x + idx * colWidth + 2, y + 6, { maxWidth: colWidth - 4 });
  });

  y += rowHeight;

  // Data rows
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);

  data.slice(1).forEach((row, rowIdx) => {
    if (rowIdx % 2 === 0) {
      setColorFill(doc, colors.lightGray);
      doc.rect(x, y, width, rowHeight, 'F');
    }

    row.forEach((cell, colIdx) => {
      doc.text(String(cell), x + colIdx * colWidth + 2, y + 6, { maxWidth: colWidth - 4 });
    });

    y += rowHeight;
  });
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}
