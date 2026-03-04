import jsPDF from 'jspdf';
import type { PortfolioProject } from '../types/portfolio';

const colors = {
  primary: { r: 79, g: 70, b: 229 }, // indigo-600
  success: { r: 34, g: 197, b: 94 }, // green-500
  warning: { r: 251, g: 146, b: 60 }, // orange-500
  danger: { r: 239, g: 68, b: 68 }, // red-500
  gray: { r: 107, g: 114, b: 128 }, // gray-500
  lightGray: { r: 229, g: 231, b: 235 }, // gray-200
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

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  if (includeBranding) {
    doc.setFontSize(24);
    doc.setTextColor(79, 70, 229); // Indigo
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
  doc.text(`Calculator: ${project.calculatorId}`, 20, yPosition);
  yPosition += 12;

  // Key Metrics Section
  addMetricsSection(doc, project, 20, yPosition);
  yPosition += 80;

  // Add new page if needed
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }

  // Analysis Section
  if (includeAnalysis) {
    addAnalysisSection(doc, project, 20, yPosition);
    yPosition += 50;
  }

  // Summary Section
  addSummarySection(doc, project, 20, yPosition);

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

function addMetricsSection(doc: jsPDF, project: PortfolioProject, x: number, y: number) {
  const cardWidth = 40;
  const cardHeight = 30;
  const spacing = 2;

  const metrics = [
    {
      label: 'Total Investment',
      value: formatCurrency(project.totalInvestment || 0),
      color: colors.primary,
    },
    {
      label: 'ROI',
      value: `${(project.roi || 0).toFixed(1)}%`,
      color: (project.roi || 0) >= 15 ? colors.success : colors.warning,
    },
    {
      label: 'Cash Flow',
      value: formatCurrency(project.avgCashFlow || 0),
      color: colors.success,
    },
    {
      label: 'Break-Even',
      value: `${project.breakEvenMonths || 0} months`,
      color: colors.gray,
    },
  ];

  const perRow = 2;
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
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(String(metric.label), cardX + 3, cardY + 5, { maxWidth: cardWidth - 6 });

    // Value
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(String(metric.value), cardX + 3, cardY + 18, { maxWidth: cardWidth - 6 });
    doc.setFont('helvetica', 'normal');
  });
}

function addAnalysisSection(doc: jsPDF, project: PortfolioProject, x: number, y: number) {
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Investment Analysis', x, y);
  doc.setFont('helvetica', 'normal');

  y += 8;

  const roi = project.roi || 0;
  const roiRating = roi >= 20 ? 'Excellent'
    : roi >= 15 ? 'Very Good'
    : roi >= 10 ? 'Good'
    : roi >= 5 ? 'Moderate'
    : 'Poor';

  const analysisText = [
    `ROI Rating: ${roiRating} (${roi.toFixed(1)}%)`,
    `Investment Score: ${Math.round(project.investmentScore || 0)}/100`,
    `Break-even Period: ${project.breakEvenMonths || 0} months`,
    `Annual Cash Flow: ${formatCurrency(project.avgCashFlow || 0)}`,
  ];

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  analysisText.forEach((text, idx) => {
    doc.text(`• ${text}`, x + 5, y + idx * 6);
  });
}

function addSummarySection(doc: jsPDF, project: PortfolioProject, x: number, y: number) {
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Investment Summary', x, y);
  doc.setFont('helvetica', 'normal');

  y += 8;

  const summaryText = `This project presents a ${(project.roi || 0) >= 15 ? 'strong' : 'moderate'} investment opportunity with an ROI of ${(project.roi || 0).toFixed(1)}% and a break-even period of ${project.breakEvenMonths || 0} months. The investment score of ${Math.round(project.investmentScore || 0)}/100 reflects the overall quality and risk-adjusted return profile of this investment.`;

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
