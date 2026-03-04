import jsPDF from 'jspdf';
import type { RentalROIComparisonData, XIRRComparisonData } from './comparison-types';

// Enterprise theme colors
const COLORS = {
  white: [255, 255, 255] as [number, number, number],
  background: [250, 251, 252] as [number, number, number],
  cardBg: [255, 255, 255] as [number, number, number],
  headerBg: [17, 24, 39] as [number, number, number],
  border: [229, 231, 235] as [number, number, number],
  borderLight: [243, 244, 246] as [number, number, number],

  textDark: [17, 24, 39] as [number, number, number],
  textMedium: [75, 85, 99] as [number, number, number],
  textLight: [156, 163, 175] as [number, number, number],

  primary: [79, 70, 229] as [number, number, number], // indigo
  primaryLight: [238, 242, 255] as [number, number, number],

  emerald: [16, 185, 129] as [number, number, number],
  emeraldLight: [209, 250, 229] as [number, number, number],

  red: [239, 68, 68] as [number, number, number],
  redLight: [254, 226, 226] as [number, number, number],

  blue: [59, 130, 246] as [number, number, number],
  blueLight: [219, 234, 254] as [number, number, number],

  amber: [245, 158, 11] as [number, number, number],
  amberLight: [254, 243, 199] as [number, number, number],
};

const FONT = {
  xs: 7,
  sm: 8,
  base: 9,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 20,
};

async function loadLogoAsBase64(): Promise<string> {
  try {
    const response = await fetch('/logo.png');
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}

const formatCurrency = (value: number, currency: string): string => {
  const symbols: Record<string, string> = {
    USD: '$', EUR: '€', AUD: 'A$', GBP: '£', INR: '₹', CNY: '¥', AED: 'د.إ', RUB: '₽', IDR: 'Rp',
  };
  const symbol = symbols[currency] || currency;
  return `${symbol} ${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getRatingColor = (grade: string): [number, number, number] => {
  if (grade.startsWith('A')) return COLORS.emerald;
  if (grade.startsWith('B')) return COLORS.blue;
  if (grade.startsWith('C')) return COLORS.amber;
  return COLORS.red;
};

const getRatingBgColor = (grade: string): [number, number, number] => {
  if (grade.startsWith('A')) return COLORS.emeraldLight;
  if (grade.startsWith('B')) return COLORS.blueLight;
  if (grade.startsWith('C')) return COLORS.amberLight;
  return COLORS.redLight;
};

export async function generateRentalROIComparisonPDF(
  items: RentalROIComparisonData[]
): Promise<void> {
  const logoBase64 = await loadLogoAsBase64();
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for better comparison view
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  // Background
  doc.setFillColor(...COLORS.background);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // ========================================
  // HEADER
  // ========================================
  const logoSize = 12;
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', margin, yPos, logoSize, logoSize);
  } else {
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(margin, yPos, logoSize, logoSize, 2, 2, 'F');
  }

  doc.setTextColor(...COLORS.textDark);
  doc.setFontSize(FONT.xl);
  doc.setFont('helvetica', 'bold');
  doc.text('Investment Comparison Report', margin + logoSize + 5, yPos + 5);

  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(FONT.sm);
  doc.setFont('helvetica', 'normal');
  doc.text('10-Year Rental ROI Analysis', margin + logoSize + 5, yPos + 10);

  // Right side - metadata
  doc.setTextColor(...COLORS.textLight);
  doc.setFontSize(FONT.xs);
  doc.text('GENERATED', pageWidth - margin, yPos + 2, { align: 'right' });
  doc.setTextColor(...COLORS.textDark);
  doc.setFontSize(FONT.sm);
  doc.setFont('helvetica', 'bold');
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  doc.text(dateStr, pageWidth - margin, yPos + 7, { align: 'right' });
  doc.setTextColor(...COLORS.textLight);
  doc.setFontSize(FONT.xs);
  doc.setFont('helvetica', 'normal');
  doc.text(`${items.length} Calculations Compared`, pageWidth - margin, yPos + 12, { align: 'right' });

  yPos += 20;

  // ========================================
  // COMPARISON TABLE
  // ========================================
  const metricColWidth = 50;
  const dataColWidth = (contentWidth - metricColWidth) / items.length;
  const rowHeight = 10;

  // Table header row
  doc.setFillColor(...COLORS.headerBg);
  doc.roundedRect(margin, yPos, contentWidth, rowHeight + 4, 2, 2, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(FONT.sm);
  doc.setFont('helvetica', 'bold');
  doc.text('METRIC', margin + 5, yPos + 8);

  // Column headers with labels
  items.forEach((item, i) => {
    const colX = margin + metricColWidth + i * dataColWidth;
    doc.text(item.label.toUpperCase(), colX + dataColWidth / 2, yPos + 5, { align: 'center' });
    doc.setFontSize(FONT.xs);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(item.timestamp), colX + dataColWidth / 2, yPos + 10, { align: 'center' });
    doc.setFontSize(FONT.sm);
    doc.setFont('helvetica', 'bold');
  });

  yPos += rowHeight + 4;

  // Data rows
  const metrics = [
    { label: 'Investment Rating', key: 'rating' },
    { label: 'Initial Investment', key: 'initialInvestment' },
    { label: 'Keys/Units', key: 'keys' },
    { label: 'Year 1 ADR', key: 'y1ADR' },
    { label: 'Year 1 Occupancy', key: 'y1Occupancy' },
    { label: 'ADR Growth Rate', key: 'adrGrowth' },
    { label: 'Management Fee', key: 'incentiveFeePct' },
    { label: '10-Year Avg ROI', key: 'avgROI', highlight: true },
    { label: 'Avg Annual Cash Flow', key: 'avgAnnualCashFlow', highlight: true },
    { label: 'Total Revenue (10Y)', key: 'totalRevenue' },
    { label: 'Total Profit (10Y)', key: 'totalProfit', highlight: true },
    { label: 'Total Mgmt Fees (10Y)', key: 'totalManagementFees' },
    { label: 'Payback Period', key: 'paybackYears' },
    { label: 'Avg GOP Margin', key: 'avgGopMargin' },
  ];

  // Calculate best/worst for highlighting
  const roiValues = items.map(i => i.avgROI);
  const profitValues = items.map(i => i.totalProfit);
  const paybackValues = items.map(i => i.paybackYears);
  const gopValues = items.map(i => i.avgGopMargin);
  const cashFlowValues = items.map(i => i.avgAnnualCashFlow || 0);

  const bestROI = Math.max(...roiValues);
  const worstROI = Math.min(...roiValues);
  const bestProfit = Math.max(...profitValues);
  const worstProfit = Math.min(...profitValues);
  const bestPayback = Math.min(...paybackValues.filter(v => v > 0));
  const worstPayback = Math.max(...paybackValues);
  const bestGOP = Math.max(...gopValues);
  const worstGOP = Math.min(...gopValues);
  const bestCashFlow = Math.max(...cashFlowValues);
  const worstCashFlow = Math.min(...cashFlowValues);

  metrics.forEach((metric, rowIdx) => {
    const isEven = rowIdx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, yPos, contentWidth, rowHeight, 'F');

    if (rowIdx < metrics.length - 1) {
      doc.setDrawColor(...COLORS.borderLight);
      doc.line(margin, yPos + rowHeight, margin + contentWidth, yPos + rowHeight);
    }

    // Metric label
    doc.setTextColor(...COLORS.textMedium);
    doc.setFontSize(FONT.sm);
    doc.setFont('helvetica', metric.highlight ? 'bold' : 'normal');
    doc.text(metric.label, margin + 5, yPos + 8);

    // Values
    items.forEach((item, colIdx) => {
      const colX = margin + metricColWidth + colIdx * dataColWidth;
      let value = '';
      let isBest = false;
      let isWorst = false;

      switch (metric.key) {
        case 'rating':
          // Draw rating badge
          const ratingColor = getRatingColor(item.investmentRating.grade);
          const ratingBg = getRatingBgColor(item.investmentRating.grade);
          doc.setFillColor(...ratingBg);
          doc.roundedRect(colX + dataColWidth / 2 - 10, yPos + 2, 20, 8, 2, 2, 'F');
          doc.setTextColor(...ratingColor);
          doc.setFontSize(FONT.sm);
          doc.setFont('helvetica', 'bold');
          doc.text(item.investmentRating.grade, colX + dataColWidth / 2, yPos + 7.5, { align: 'center' });
          return;
        case 'initialInvestment':
          value = formatCurrency(item.initialInvestment, item.currency);
          break;
        case 'keys':
          value = item.keys ? String(item.keys) : '-';
          break;
        case 'y1ADR':
          value = formatCurrency(item.y1ADR, item.currency);
          break;
        case 'y1Occupancy':
          value = `${item.y1Occupancy}%`;
          break;
        case 'adrGrowth':
          value = `${item.adrGrowth || 0}%`;
          break;
        case 'incentiveFeePct':
          value = `${item.incentiveFeePct || 0}%`;
          break;
        case 'avgROI':
          value = `${item.avgROI.toFixed(2)}%`;
          isBest = item.avgROI === bestROI && items.length > 1;
          isWorst = item.avgROI === worstROI && bestROI !== worstROI;
          break;
        case 'avgAnnualCashFlow':
          value = formatCurrency(item.avgAnnualCashFlow || 0, item.currency);
          isBest = (item.avgAnnualCashFlow || 0) === bestCashFlow && items.length > 1;
          isWorst = (item.avgAnnualCashFlow || 0) === worstCashFlow && bestCashFlow !== worstCashFlow;
          break;
        case 'totalRevenue':
          value = formatCurrency(item.totalRevenue, item.currency);
          break;
        case 'totalProfit':
          value = formatCurrency(item.totalProfit, item.currency);
          isBest = item.totalProfit === bestProfit && items.length > 1;
          isWorst = item.totalProfit === worstProfit && bestProfit !== worstProfit;
          break;
        case 'totalManagementFees':
          value = formatCurrency(item.totalManagementFees || 0, item.currency);
          break;
        case 'paybackYears':
          value = `${item.paybackYears.toFixed(1)} years`;
          isBest = item.paybackYears === bestPayback && items.length > 1;
          isWorst = item.paybackYears === worstPayback && bestPayback !== worstPayback;
          break;
        case 'avgGopMargin':
          value = `${item.avgGopMargin.toFixed(1)}%`;
          isBest = item.avgGopMargin === bestGOP && items.length > 1;
          isWorst = item.avgGopMargin === worstGOP && bestGOP !== worstGOP;
          break;
      }

      if (isBest) {
        doc.setTextColor(...COLORS.emerald);
        doc.setFont('helvetica', 'bold');
      } else if (isWorst) {
        doc.setTextColor(...COLORS.red);
        doc.setFont('helvetica', 'normal');
      } else {
        doc.setTextColor(...COLORS.textDark);
        doc.setFont('helvetica', 'normal');
      }
      doc.setFontSize(FONT.sm);
      doc.text(value, colX + dataColWidth / 2, yPos + 8, { align: 'center' });
    });

    yPos += rowHeight;
  });

  // Table border
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(margin, margin + 20, contentWidth, yPos - margin - 20, 2, 2, 'S');

  yPos += 10;

  // ========================================
  // LEGEND
  // ========================================
  doc.setFillColor(...COLORS.cardBg);
  doc.roundedRect(margin, yPos, contentWidth, 14, 2, 2, 'F');
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(margin, yPos, contentWidth, 14, 2, 2, 'S');

  doc.setTextColor(...COLORS.textMedium);
  doc.setFontSize(FONT.sm);
  doc.setFont('helvetica', 'bold');
  doc.text('Legend:', margin + 5, yPos + 9);

  // Best indicator
  doc.setFillColor(...COLORS.emerald);
  doc.circle(margin + 35, yPos + 7, 2, 'F');
  doc.setTextColor(...COLORS.textMedium);
  doc.setFontSize(FONT.xs);
  doc.setFont('helvetica', 'normal');
  doc.text('Best Value', margin + 40, yPos + 9);

  // Worst indicator
  doc.setFillColor(...COLORS.red);
  doc.circle(margin + 75, yPos + 7, 2, 'F');
  doc.text('Needs Attention', margin + 80, yPos + 9);

  // Rating scale
  doc.setTextColor(...COLORS.textLight);
  doc.text('Rating Scale:  A+ = Excellent  |  A/B+ = Good  |  B/C = Fair  |  D = Poor', margin + 140, yPos + 9);

  // ========================================
  // FOOTER
  // ========================================
  const footerY = pageHeight - 10;
  doc.setDrawColor(...COLORS.border);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  doc.setTextColor(...COLORS.textLight);
  doc.setFontSize(FONT.xs);
  doc.setFont('helvetica', 'normal');
  doc.text('Generated by ROI Calculate - Enterprise Investment Analysis', margin, footerY);
  doc.text('Confidential', pageWidth / 2, footerY, { align: 'center' });
  doc.text(new Date().toLocaleDateString(), pageWidth - margin, footerY, { align: 'right' });

  // Save
  const fileName = `ROI_Comparison_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

export async function generateXIRRComparisonPDF(
  items: XIRRComparisonData[]
): Promise<void> {
  const logoBase64 = await loadLogoAsBase64();
  const doc = new jsPDF('l', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  // Background
  doc.setFillColor(...COLORS.background);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // ========================================
  // HEADER
  // ========================================
  const logoSize = 12;
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', margin, yPos, logoSize, logoSize);
  } else {
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(margin, yPos, logoSize, logoSize, 2, 2, 'F');
  }

  doc.setTextColor(...COLORS.textDark);
  doc.setFontSize(FONT.xl);
  doc.setFont('helvetica', 'bold');
  doc.text('Investment Comparison Report', margin + logoSize + 5, yPos + 5);

  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(FONT.sm);
  doc.setFont('helvetica', 'normal');
  doc.text('XIRR Analysis', margin + logoSize + 5, yPos + 10);

  // Right side
  doc.setTextColor(...COLORS.textLight);
  doc.setFontSize(FONT.xs);
  doc.text('GENERATED', pageWidth - margin, yPos + 2, { align: 'right' });
  doc.setTextColor(...COLORS.textDark);
  doc.setFontSize(FONT.sm);
  doc.setFont('helvetica', 'bold');
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  doc.text(dateStr, pageWidth - margin, yPos + 7, { align: 'right' });
  doc.setTextColor(...COLORS.textLight);
  doc.setFontSize(FONT.xs);
  doc.setFont('helvetica', 'normal');
  doc.text(`${items.length} Calculations Compared`, pageWidth - margin, yPos + 12, { align: 'right' });

  yPos += 20;

  // ========================================
  // COMPARISON TABLE
  // ========================================
  const metricColWidth = 50;
  const dataColWidth = (contentWidth - metricColWidth) / items.length;
  const rowHeight = 10;

  // Header
  doc.setFillColor(...COLORS.headerBg);
  doc.roundedRect(margin, yPos, contentWidth, rowHeight + 4, 2, 2, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(FONT.sm);
  doc.setFont('helvetica', 'bold');
  doc.text('METRIC', margin + 5, yPos + 8);

  items.forEach((item, i) => {
    const colX = margin + metricColWidth + i * dataColWidth;
    doc.text(item.label.toUpperCase(), colX + dataColWidth / 2, yPos + 5, { align: 'center' });
    doc.setFontSize(FONT.xs);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(item.timestamp), colX + dataColWidth / 2, yPos + 10, { align: 'center' });
    doc.setFontSize(FONT.sm);
    doc.setFont('helvetica', 'bold');
  });

  yPos += rowHeight + 4;

  const metrics = [
    { label: 'Investment Rating', key: 'rating' },
    { label: 'Location', key: 'location' },
    { label: 'Purchase Price', key: 'totalPrice' },
    { label: 'Projected Sale', key: 'projectedSalesPrice' },
    { label: 'XIRR', key: 'xirr', highlight: true },
    { label: 'Total Invested', key: 'totalInvested' },
    { label: 'Net Profit', key: 'netProfit', highlight: true },
    { label: 'Hold Period', key: 'holdPeriodMonths' },
  ];

  // Calculate best/worst
  const xirrValues = items.map(i => i.xirr);
  const profitValues = items.map(i => i.netProfit);
  const holdValues = items.map(i => i.holdPeriodMonths);

  const bestXIRR = Math.max(...xirrValues);
  const worstXIRR = Math.min(...xirrValues);
  const bestProfit = Math.max(...profitValues);
  const worstProfit = Math.min(...profitValues);
  const bestHold = Math.min(...holdValues.filter(v => v > 0));
  const worstHold = Math.max(...holdValues);

  metrics.forEach((metric, rowIdx) => {
    const isEven = rowIdx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, yPos, contentWidth, rowHeight, 'F');

    if (rowIdx < metrics.length - 1) {
      doc.setDrawColor(...COLORS.borderLight);
      doc.line(margin, yPos + rowHeight, margin + contentWidth, yPos + rowHeight);
    }

    doc.setTextColor(...COLORS.textMedium);
    doc.setFontSize(FONT.sm);
    doc.setFont('helvetica', metric.highlight ? 'bold' : 'normal');
    doc.text(metric.label, margin + 5, yPos + 8);

    items.forEach((item, colIdx) => {
      const colX = margin + metricColWidth + colIdx * dataColWidth;
      let value = '';
      let isBest = false;
      let isWorst = false;

      switch (metric.key) {
        case 'rating':
          const ratingColor = getRatingColor(item.investmentRating.grade);
          const ratingBg = getRatingBgColor(item.investmentRating.grade);
          doc.setFillColor(...ratingBg);
          doc.roundedRect(colX + dataColWidth / 2 - 10, yPos + 2, 20, 8, 2, 2, 'F');
          doc.setTextColor(...ratingColor);
          doc.setFontSize(FONT.sm);
          doc.setFont('helvetica', 'bold');
          doc.text(item.investmentRating.grade, colX + dataColWidth / 2, yPos + 7.5, { align: 'center' });
          return;
        case 'location':
          value = item.location || '-';
          break;
        case 'totalPrice':
          value = formatCurrency(item.totalPrice, item.currency);
          break;
        case 'projectedSalesPrice':
          value = formatCurrency(item.projectedSalesPrice, item.currency);
          break;
        case 'xirr':
          value = `${(item.xirr * 100).toFixed(2)}%`;
          isBest = item.xirr === bestXIRR && items.length > 1;
          isWorst = item.xirr === worstXIRR && bestXIRR !== worstXIRR;
          break;
        case 'totalInvested':
          value = formatCurrency(item.totalInvested, item.currency);
          break;
        case 'netProfit':
          value = formatCurrency(item.netProfit, item.currency);
          isBest = item.netProfit === bestProfit && items.length > 1;
          isWorst = item.netProfit === worstProfit && bestProfit !== worstProfit;
          break;
        case 'holdPeriodMonths':
          value = `${item.holdPeriodMonths} months`;
          isBest = item.holdPeriodMonths === bestHold && items.length > 1;
          isWorst = item.holdPeriodMonths === worstHold && bestHold !== worstHold;
          break;
      }

      if (isBest) {
        doc.setTextColor(...COLORS.emerald);
        doc.setFont('helvetica', 'bold');
      } else if (isWorst) {
        doc.setTextColor(...COLORS.red);
        doc.setFont('helvetica', 'normal');
      } else {
        doc.setTextColor(...COLORS.textDark);
        doc.setFont('helvetica', 'normal');
      }
      doc.setFontSize(FONT.sm);
      doc.text(value, colX + dataColWidth / 2, yPos + 8, { align: 'center' });
    });

    yPos += rowHeight;
  });

  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(margin, margin + 20, contentWidth, yPos - margin - 20, 2, 2, 'S');

  yPos += 10;

  // Legend
  doc.setFillColor(...COLORS.cardBg);
  doc.roundedRect(margin, yPos, contentWidth, 14, 2, 2, 'F');
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(margin, yPos, contentWidth, 14, 2, 2, 'S');

  doc.setTextColor(...COLORS.textMedium);
  doc.setFontSize(FONT.sm);
  doc.setFont('helvetica', 'bold');
  doc.text('Legend:', margin + 5, yPos + 9);

  doc.setFillColor(...COLORS.emerald);
  doc.circle(margin + 35, yPos + 7, 2, 'F');
  doc.setTextColor(...COLORS.textMedium);
  doc.setFontSize(FONT.xs);
  doc.setFont('helvetica', 'normal');
  doc.text('Best Value', margin + 40, yPos + 9);

  doc.setFillColor(...COLORS.red);
  doc.circle(margin + 75, yPos + 7, 2, 'F');
  doc.text('Needs Attention', margin + 80, yPos + 9);

  doc.setTextColor(...COLORS.textLight);
  doc.text('Rating Scale:  A+ = Excellent  |  A/B+ = Good  |  B/C = Fair  |  D = Poor', margin + 140, yPos + 9);

  // Footer
  const footerY = pageHeight - 10;
  doc.setDrawColor(...COLORS.border);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  doc.setTextColor(...COLORS.textLight);
  doc.setFontSize(FONT.xs);
  doc.setFont('helvetica', 'normal');
  doc.text('Generated by ROI Calculate - Enterprise Investment Analysis', margin, footerY);
  doc.text('Confidential', pageWidth / 2, footerY, { align: 'center' });
  doc.text(new Date().toLocaleDateString(), pageWidth - margin, footerY, { align: 'right' });

  const fileName = `XIRR_Comparison_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
