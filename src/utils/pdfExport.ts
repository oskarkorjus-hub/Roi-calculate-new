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
  let yPosition = 20;

  // Header
  if (includeBranding) {
    doc.setFontSize(24);
    doc.setTextColor(categoryColor.r, categoryColor.g, categoryColor.b);
    doc.text('ROI Calculate', 20, yPosition);
    yPosition += 12;
  }

  // Project Title
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(project.projectName, 20, yPosition);
  yPosition += 8;

  // Project Details
  doc.setFontSize(11);
  doc.setTextColor(107, 114, 128); // Gray-500
  doc.text(`Location: ${project.location}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Date: ${new Date(project.createdAt).toLocaleDateString()}`, 20, yPosition);
  yPosition += 6;
  doc.setTextColor(categoryColor.r, categoryColor.g, categoryColor.b);
  doc.text(`Calculator: ${getCalculatorDisplayName(project.calculatorId)}`, 20, yPosition);
  doc.setTextColor(107, 114, 128);
  yPosition += 12;

  // Key Metrics Section - Calculator Specific
  addMetricsSection(doc, project, 20, yPosition, category, categoryColor);
  yPosition += 80;

  // Add new page if needed
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }

  // Analysis Section - Calculator Specific
  if (includeAnalysis) {
    addAnalysisSection(doc, project, 20, yPosition, category);
    yPosition += 60;
  }

  // Summary Section - Calculator Specific
  addSummarySection(doc, project, 20, yPosition, category);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  const pageCount = (doc as any).internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    (doc as any).setPage(i);
    doc.text(
      `Page ${i} of ${pageCount} | Generated ${new Date().toLocaleString()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save
  doc.save(`${project.projectName.replace(/\s+/g, '-')}-report.pdf`);
}

export function generatePortfolioComparisionPDF(
  projects: PortfolioProject[]
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Title
  doc.setFontSize(20);
  doc.setTextColor(79, 70, 229);
  doc.text('Portfolio Comparison Report', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition);
  yPosition += 10;

  // Summary Stats
  const totalInvestment = projects.reduce((sum, p) => sum + (p.totalInvestment || 0), 0);
  const avgROI = projects.length > 0
    ? projects.reduce((sum, p) => sum + (p.roi || 0), 0) / projects.length
    : 0;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total Projects: ${projects.length}`, 20, yPosition);
  doc.text(`Total Investment: ${formatCurrency(totalInvestment)}`, 80, yPosition);
  doc.text(`Average ROI: ${avgROI.toFixed(1)}%`, 140, yPosition);
  yPosition += 10;

  // Comparison Table
  const tableData = [
    ['Project Name', 'Location', 'Investment', 'ROI %', 'Cash Flow', 'Break-Even', 'Score'],
    ...projects.map(p => [
      (p.projectName || 'Unnamed').substring(0, 20),
      (p.location || 'N/A').substring(0, 15),
      formatCurrency(p.totalInvestment || 0),
      `${(p.roi || 0).toFixed(1)}%`,
      formatCurrency(p.avgCashFlow || 0),
      `${p.breakEvenMonths || 0}m`,
      `${Math.round(p.investmentScore || 0)}/100`,
    ]),
  ];

  addTable(doc, tableData, 20, yPosition, pageWidth - 40);

  doc.save('portfolio-comparison.pdf');
}

function getMetricsForCategory(
  project: PortfolioProject,
  category: CalculatorCategory,
  categoryColor: { r: number; g: number; b: number }
): Array<{ label: string; value: string; color: { r: number; g: number; b: number } }> {
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
          value: `${project.data?.loanTerm || 0} years`,
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

function getAnalysisForCategory(project: PortfolioProject, category: CalculatorCategory): string[] {
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
