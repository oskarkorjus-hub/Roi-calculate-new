import { useState, useCallback } from 'react';
import { Toast } from './Toast';
import { useNotifications } from '../../lib/notification-context';
import jsPDF from 'jspdf';

export interface ReportData {
  calculatorType: 'mortgage' | 'cashflow' | 'cap-rate' | 'irr' | 'npv' | 'dev-feasibility' | 'rental-roi' | 'xirr' | 'indonesia-tax' | 'rental-projection' | 'financing' | 'brrrr';
  title: string;
  subtitle?: string;
  currency: string;
  symbol: string;
  generatedDate: string;
  sections: ReportSection[];
  rating?: {
    grade: string;
    label: string;
    value: string;
    description: string;
  };
}

export interface ReportSection {
  title: string;
  icon?: string;
  color?: 'emerald' | 'cyan' | 'orange' | 'red' | 'purple' | 'blue' | 'amber' | 'zinc';
  type: 'metrics' | 'table' | 'text' | 'highlight';
  data: ReportMetric[] | ReportTableRow[] | string;
}

export interface ReportMetric {
  label: string;
  value: string;
  highlight?: boolean;
  positive?: boolean;
  negative?: boolean;
}

export interface ReportTableRow {
  cells: string[];
  highlight?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reportData: ReportData;
}

export function ReportPreviewModal({ isOpen, onClose, reportData }: Props) {
  const [mode, setMode] = useState<'preview' | 'email'>('preview');
  const [email, setEmail] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const generatePDF = useCallback((): jsPDF => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12; // Reduced margin for more content
    const contentWidth = pageWidth - 2 * margin;
    let y = 0;

    // Professional Color Palette
    const COLORS = {
      primary: { r: 16, g: 185, b: 129 },
      primaryDark: { r: 5, g: 150, b: 105 },
      dark: { r: 24, g: 24, b: 27 },
      gray: { r: 113, g: 113, b: 122 },
      lightGray: { r: 250, g: 250, b: 250 },
      mediumGray: { r: 228, g: 228, b: 231 },
      white: { r: 255, g: 255, b: 255 },
      success: { r: 22, g: 163, b: 74 },
      warning: { r: 217, g: 119, b: 6 },
      danger: { r: 220, g: 38, b: 38 },
      accent: { r: 59, g: 130, b: 246 },
    };

    // Grade color mapping
    const getGradeColor = (grade: string) => {
      if (grade.startsWith('A')) return COLORS.success;
      if (grade.startsWith('B')) return COLORS.primary;
      if (grade.startsWith('C')) return COLORS.warning;
      return COLORS.danger;
    };

    // Helper: Draw compact header bar
    const drawHeader = () => {
      const headerHeight = 18;
      doc.setFillColor(COLORS.primaryDark.r, COLORS.primaryDark.g, COLORS.primaryDark.b);
      doc.rect(0, 0, pageWidth, headerHeight, 'F');

      doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('ROI CALCULATE', margin, 11);

      // Report type and date on right
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const badgeText = reportData.calculatorType.replace(/-/g, ' ').toUpperCase();
      doc.text(`${badgeText} | ${reportData.generatedDate}`, pageWidth - margin, 11, { align: 'right' });

      return headerHeight + 6;
    };

    // Helper: Draw executive summary hero section
    const drawHeroSection = (startY: number) => {
      let currentY = startY;

      // Title row with rating badge
      doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');

      const titleLines = doc.splitTextToSize(reportData.title, contentWidth - 50);
      doc.text(titleLines, margin, currentY + 6);

      // Investment grade badge (inline with title)
      if (reportData.rating) {
        const gradeColor = getGradeColor(reportData.rating.grade);
        const badgeX = pageWidth - margin - 35;
        const badgeY = currentY - 2;

        // Badge background
        doc.setFillColor(gradeColor.r, gradeColor.g, gradeColor.b);
        doc.roundedRect(badgeX, badgeY, 35, 20, 3, 3, 'F');

        // Grade letter
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(reportData.rating.grade, badgeX + 17.5, badgeY + 13, { align: 'center' });
      }

      currentY += titleLines.length * 7 + 4;

      // Subtitle
      if (reportData.subtitle) {
        doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(reportData.subtitle, margin, currentY);
        currentY += 6;
      }

      return currentY + 4;
    };

    // Helper: Draw key metrics summary box
    const drawKeyMetricsSummary = (startY: number) => {
      const firstMetrics = reportData.sections.find(s => s.type === 'metrics');
      if (!firstMetrics || !Array.isArray(firstMetrics.data)) return startY;

      const metrics = firstMetrics.data as ReportMetric[];
      const highlighted = metrics.filter(m => m.highlight || m.positive);
      const keyMetrics = highlighted.length > 0 ? highlighted.slice(0, 4) : metrics.slice(0, 4);

      if (keyMetrics.length === 0) return startY;

      const boxHeight = 24;
      const cols = Math.min(keyMetrics.length, 4);
      const colWidth = contentWidth / cols;

      // Box background
      doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
      doc.roundedRect(margin, startY, contentWidth, boxHeight, 2, 2, 'F');

      // Border
      doc.setDrawColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, startY, contentWidth, boxHeight, 2, 2, 'S');

      // Draw each key metric
      keyMetrics.forEach((metric, i) => {
        const x = margin + i * colWidth;

        // Vertical divider (except first)
        if (i > 0) {
          doc.setDrawColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
          doc.line(x, startY + 4, x, startY + boxHeight - 4);
        }

        // Label
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
        doc.setFont('helvetica', 'normal');
        const label = metric.label.length > 18 ? metric.label.substring(0, 16) + '..' : metric.label;
        doc.text(label.toUpperCase(), x + colWidth / 2, startY + 8, { align: 'center' });

        // Value
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        if (metric.positive) {
          doc.setTextColor(COLORS.success.r, COLORS.success.g, COLORS.success.b);
        } else if (metric.negative) {
          doc.setTextColor(COLORS.danger.r, COLORS.danger.g, COLORS.danger.b);
        } else {
          doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
        }

        let value = metric.value;
        if (value.length > 12) value = value.substring(0, 11) + '..';
        doc.text(value, x + colWidth / 2, startY + 18, { align: 'center' });
      });

      return startY + boxHeight + 6;
    };

    // Helper: Draw verdict/recommendation section
    const drawVerdict = (startY: number) => {
      if (!reportData.rating) return startY;

      const gradeColor = getGradeColor(reportData.rating.grade);
      const boxHeight = 18;

      // Left accent bar
      doc.setFillColor(gradeColor.r, gradeColor.g, gradeColor.b);
      doc.roundedRect(margin, startY, 3, boxHeight, 1, 1, 'F');

      // Background
      doc.setFillColor(gradeColor.r, gradeColor.g, gradeColor.b, 0.1);
      doc.roundedRect(margin + 3, startY, contentWidth - 3, boxHeight, 2, 2, 'F');

      // Verdict text
      doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`INVESTMENT VERDICT: ${reportData.rating.label.toUpperCase()}`, margin + 8, startY + 7);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      doc.setFontSize(8);

      const descText = `${reportData.rating.description} | Key Value: ${reportData.rating.value}`;
      const truncatedDesc = descText.length > 80 ? descText.substring(0, 77) + '...' : descText;
      doc.text(truncatedDesc, margin + 8, startY + 14);

      return startY + boxHeight + 6;
    };

    // Helper: Draw section title (compact)
    const drawSectionTitle = (title: string, color: number[], currentY: number) => {
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(margin, currentY, 2, 6, 'F');

      doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(title.toUpperCase(), margin + 5, currentY + 4.5);

      return currentY + 10;
    };

    // Helper: Draw compact metric in 3-column grid
    const drawCompactMetric = (metric: ReportMetric, x: number, y: number, width: number) => {
      const height = 18;

      // Background
      doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
      doc.roundedRect(x, y, width, height, 2, 2, 'F');

      // Label
      doc.setFontSize(6);
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      doc.setFont('helvetica', 'normal');
      const label = metric.label.length > 22 ? metric.label.substring(0, 20) + '..' : metric.label;
      doc.text(label.toUpperCase(), x + 3, y + 6);

      // Value with indicator
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');

      let indicator = '';
      if (metric.positive) {
        doc.setTextColor(COLORS.success.r, COLORS.success.g, COLORS.success.b);
        indicator = '↑ ';
      } else if (metric.negative) {
        doc.setTextColor(COLORS.danger.r, COLORS.danger.g, COLORS.danger.b);
        indicator = '↓ ';
      } else {
        doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
      }

      let value = metric.value;
      const maxWidth = width - 6;
      while (doc.getTextWidth(indicator + value) > maxWidth && value.length > 4) {
        value = value.slice(0, -1);
      }
      doc.text(indicator + value, x + 3, y + 14);

      return height;
    };

    // Helper: Check page break
    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 18) {
        doc.addPage();
        y = 12;
        return true;
      }
      return false;
    };

    // Helper: Add footers
    const addFooters = () => {
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const footerY = pageHeight - 8;

        doc.setDrawColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
        doc.setLineWidth(0.2);
        doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

        doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('ROI Calculate | roicalculate.com', margin, footerY);
        doc.text(`${i}/${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
      }
    };

    // Color map
    const colorMap: Record<string, number[]> = {
      emerald: [COLORS.primary.r, COLORS.primary.g, COLORS.primary.b],
      cyan: [6, 182, 212],
      orange: [249, 115, 22],
      red: [COLORS.danger.r, COLORS.danger.g, COLORS.danger.b],
      purple: [168, 85, 247],
      blue: [59, 130, 246],
      amber: [245, 158, 11],
      zinc: [113, 113, 122],
    };

    // ============ SINGLE PAGE PITCH DECK LAYOUT ============
    y = drawHeader();
    y = drawHeroSection(y);
    y = drawKeyMetricsSummary(y);
    y = drawVerdict(y);

    // All metrics sections in compact 3-column grid
    const metricsSections = reportData.sections.filter(s => s.type === 'metrics');

    for (const section of metricsSections) {
      if (!Array.isArray(section.data)) continue;

      const color = colorMap[section.color || 'emerald'];
      checkPageBreak(30);
      y = drawSectionTitle(section.title, color, y);

      const metrics = section.data as ReportMetric[];
      const cols = 3;
      const gap = 4;
      const cardWidth = (contentWidth - gap * (cols - 1)) / cols;
      const cardHeight = 18;

      let col = 0;
      let rowY = y;

      for (const metric of metrics) {
        if (checkPageBreak(cardHeight + 3)) {
          rowY = y;
          col = 0;
        }

        const x = margin + col * (cardWidth + gap);
        drawCompactMetric(metric, x, rowY, cardWidth);

        col++;
        if (col >= cols) {
          col = 0;
          rowY += cardHeight + 3;
        }
      }
      y = rowY + (col > 0 ? cardHeight + 3 : 0) + 6;
    }

    // Tables (compact)
    const tableSections = reportData.sections.filter(s => s.type === 'table');

    for (const section of tableSections) {
      if (!Array.isArray(section.data)) continue;

      const rows = section.data as ReportTableRow[];
      if (rows.length === 0) continue;

      const color = colorMap[section.color || 'emerald'];
      checkPageBreak(40);
      y = drawSectionTitle(section.title, color, y);

      const numCols = rows[0].cells.length;
      const colWidth = contentWidth / numCols;
      const rowHeight = 6;

      // Header
      doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
      doc.setDrawColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
      doc.setLineWidth(0.2);
      doc.rect(margin, y, contentWidth, rowHeight, 'S');

      doc.setFontSize(7);
      doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
      doc.setFont('helvetica', 'bold');
      rows[0].cells.forEach((cell, i) => {
        const truncated = cell.length > 15 ? cell.substring(0, 13) + '..' : cell;
        doc.text(truncated.toUpperCase(), margin + i * colWidth + 2, y + 4);
      });
      y += rowHeight;

      // Data rows (limit to 15 for compactness)
      doc.setFont('helvetica', 'normal');
      const maxRows = 15;
      for (let i = 1; i < Math.min(rows.length, maxRows); i++) {
        if (checkPageBreak(rowHeight + 2)) {
          // Redraw header on new page
          doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
          doc.rect(margin, y, contentWidth, rowHeight, 'F');
          doc.rect(margin, y, contentWidth, rowHeight, 'S');
          doc.setFont('helvetica', 'bold');
          rows[0].cells.forEach((cell, j) => {
            const truncated = cell.length > 15 ? cell.substring(0, 13) + '..' : cell;
            doc.text(truncated.toUpperCase(), margin + j * colWidth + 2, y + 4);
          });
          y += rowHeight;
          doc.setFont('helvetica', 'normal');
        }

        if (i % 2 === 0) {
          doc.setFillColor(252, 252, 253);
          doc.rect(margin, y, contentWidth, rowHeight, 'F');
        }
        doc.setDrawColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
        doc.rect(margin, y, contentWidth, rowHeight, 'S');

        doc.setFontSize(7);
        doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
        rows[i].cells.forEach((cell, j) => {
          const truncated = cell.length > 15 ? cell.substring(0, 13) + '..' : cell;
          doc.text(truncated, margin + j * colWidth + 2, y + 4);
        });
        y += rowHeight;
      }

      if (rows.length > maxRows) {
        doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
        doc.setFontSize(6);
        doc.text(`+ ${rows.length - maxRows} more rows`, margin, y + 4);
        y += 6;
      }
      y += 4;
    }

    // Highlights (compact)
    const highlightSections = reportData.sections.filter(s => s.type === 'highlight');
    for (const section of highlightSections) {
      if (typeof section.data !== 'string') continue;

      const color = colorMap[section.color || 'emerald'];
      checkPageBreak(16);

      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(margin, y, 2, 12, 1, 1, 'F');

      doc.setFillColor(color[0], color[1], color[2], 0.05);
      doc.roundedRect(margin + 2, y, contentWidth - 2, 12, 2, 2, 'F');

      doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      const text = section.data.length > 100 ? section.data.substring(0, 97) + '...' : section.data;
      doc.text(text, margin + 6, y + 7);
      y += 16;
    }

    // Text sections (compact)
    const textSections = reportData.sections.filter(s => s.type === 'text');
    for (const section of textSections) {
      if (typeof section.data !== 'string') continue;

      checkPageBreak(12);
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(section.data, contentWidth);
      const limitedLines = lines.slice(0, 4);
      doc.text(limitedLines, margin, y + 4);
      y += limitedLines.length * 3 + 4;
    }

    addFooters();
    return doc;
  }, [reportData]);

  const handleDownload = useCallback(async () => {
    setIsExporting(true);
    try {
      const doc = generatePDF();
      const filename = `${reportData.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
      doc.save(filename);
      setToast({ message: 'PDF downloaded successfully!', type: 'success' });
      addNotification({
        title: 'Report Downloaded',
        message: `${reportData.title} PDF has been saved to your downloads`,
        type: 'success',
        icon: 'download',
      });
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      setToast({ message: 'Failed to generate PDF', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  }, [generatePDF, reportData.title, onClose, addNotification]);

  const handleSendEmail = useCallback(async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsExporting(true);
    setEmailError(null);

    try {
      const doc = generatePDF();
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const fileName = `${reportData.title.replace(/\s+/g, '-')}.pdf`;

      // Debug logging
      console.log('Email payload:', {
        email: trimmed,
        fileName,
        reportType: reportData.title,
        pdfBase64Length: pdfBase64?.length || 0,
      });

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          pdfBase64,
          fileName,
          reportType: reportData.title,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Failed to send email');
      }

      setToast({ message: `Report sent to ${trimmed}!`, type: 'success' });
      addNotification({
        title: 'Report Emailed',
        message: `${reportData.title} has been sent to ${trimmed}`,
        type: 'success',
        icon: 'mail',
      });
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to send email';
      setToast({ message: `${errorMsg}. Try downloading instead.`, type: 'error' });
    } finally {
      setIsExporting(false);
    }
  }, [email, generatePDF, reportData, onClose, addNotification]);

  if (!isOpen) return null;

  const getSectionColor = (color?: string) => {
    const colors = {
      emerald: 'border-emerald-500 bg-emerald-500/10',
      cyan: 'border-cyan-500 bg-cyan-500/10',
      orange: 'border-orange-500 bg-orange-500/10',
      red: 'border-red-500 bg-red-500/10',
      purple: 'border-purple-500 bg-purple-500/10',
      blue: 'border-blue-500 bg-blue-500/10',
    };
    return colors[color as keyof typeof colors] || colors.emerald;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{reportData.title}</h2>
            {reportData.subtitle && <p className="text-white/70 text-sm">{reportData.subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition p-2"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Rating Card */}
          {reportData.rating && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-black text-emerald-400">{reportData.rating.grade}</div>
                <div>
                  <div className="text-lg font-bold text-white">{reportData.rating.label}</div>
                  <div className="text-sm text-zinc-400">{reportData.rating.description}</div>
                </div>
              </div>
              <div className="text-3xl font-bold text-emerald-400">{reportData.rating.value}</div>
            </div>
          )}

          {/* Sections Preview */}
          {reportData.sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-1 h-5 rounded-full ${
                  section.color === 'cyan' ? 'bg-cyan-500' :
                  section.color === 'orange' ? 'bg-orange-500' :
                  section.color === 'red' ? 'bg-red-500' :
                  section.color === 'purple' ? 'bg-purple-500' :
                  section.color === 'blue' ? 'bg-blue-500' :
                  'bg-emerald-500'
                }`} />
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">{section.title}</h3>
              </div>

              {section.type === 'metrics' && Array.isArray(section.data) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(section.data as ReportMetric[]).map((metric, i) => (
                    <div key={i} className="bg-zinc-800 rounded-lg p-3 border border-zinc-700">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">{metric.label}</div>
                      <div className={`text-lg font-bold ${
                        metric.positive ? 'text-emerald-400' :
                        metric.negative ? 'text-red-400' :
                        'text-white'
                      }`}>{metric.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {section.type === 'table' && Array.isArray(section.data) && (
                <div className="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-zinc-700/50">
                        {(section.data as ReportTableRow[])[0]?.cells.map((cell, i) => (
                          <th key={i} className="px-4 py-2 text-left text-xs font-bold text-zinc-400 uppercase">{cell}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(section.data as ReportTableRow[]).slice(1, 6).map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-zinc-800' : 'bg-zinc-800/50'}>
                          {row.cells.map((cell, j) => (
                            <td key={j} className="px-4 py-2 text-zinc-300">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(section.data as ReportTableRow[]).length > 6 && (
                    <div className="px-4 py-2 text-center text-xs text-zinc-500 bg-zinc-700/30">
                      + {(section.data as ReportTableRow[]).length - 6} more rows in PDF
                    </div>
                  )}
                </div>
              )}

              {section.type === 'highlight' && typeof section.data === 'string' && (
                <div className={`rounded-lg p-4 border-l-4 ${getSectionColor(section.color)}`}>
                  <p className="text-white font-medium">{section.data}</p>
                </div>
              )}

              {section.type === 'text' && typeof section.data === 'string' && (
                <p className="text-zinc-400 text-sm">{section.data}</p>
              )}
            </div>
          ))}

          {/* Generated date */}
          <div className="text-center text-xs text-zinc-500 pt-4 border-t border-zinc-800">
            Report generated on {reportData.generatedDate} • ROI Calculate
          </div>
        </div>

        {/* Action Footer */}
        <div className="border-t border-zinc-800 p-4 bg-zinc-800/50">
          {mode === 'preview' ? (
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                disabled={isExporting}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </>
                )}
              </button>
              <button
                onClick={() => setMode('email')}
                disabled={isExporting}
                className="flex-1 px-6 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send to Email
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none [&:-webkit-autofill]:bg-zinc-800 [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#27272a_inset] [&:-webkit-autofill]:border-zinc-700"
                  autoFocus
                />
                <button
                  onClick={handleSendEmail}
                  disabled={isExporting}
                  className="px-6 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send'
                  )}
                </button>
              </div>
              {emailError && (
                <p className="text-red-400 text-sm">{emailError}</p>
              )}
              <button
                onClick={() => setMode('preview')}
                className="text-sm text-zinc-400 hover:text-white transition"
              >
                ← Back to preview
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportPreviewModal;
