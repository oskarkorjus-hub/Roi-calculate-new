import jsPDF from 'jspdf';
import type { PortfolioProject } from '../types/portfolio';

interface PitchDeckOptions {
  logo?: string; // URL or base64
  companyName?: string;
  primaryColor?: { r: number; g: number; b: number };
  secondaryColor?: { r: number; g: number; b: number };
  agentName?: string;
  agentEmail?: string;
  agentPhone?: string;
  sections?: {
    executiveSummary?: boolean;
    dealHighlights?: boolean;
    financialProjections?: boolean;
    marketAnalysis?: boolean;
    riskAssessment?: boolean;
    legalStructure?: boolean;
    callToAction?: boolean;
  };
}

const defaultColors = {
  primary: { r: 79, g: 70, b: 229 }, // indigo
  secondary: { r: 99, g: 102, b: 241 }, // indigo-500
  success: { r: 34, g: 197, b: 94 }, // green
  danger: { r: 239, g: 68, b: 68 }, // red
  warning: { r: 251, g: 146, b: 60 }, // orange
  gray: { r: 107, g: 114, b: 128 }, // gray-500
  lightGray: { r: 243, g: 244, b: 246 }, // gray-100
};

export async function generateInvestorPitchDeck(
  project: PortfolioProject,
  options: PitchDeckOptions = {}
) {
  const {
    logo,
    companyName = 'Investment Report',
    primaryColor = defaultColors.primary,
    secondaryColor = defaultColors.secondary,
    agentName = 'Investment Advisor',
    agentEmail = 'info@example.com',
    agentPhone = '+1 (555) 000-0000',
    sections = {
      executiveSummary: true,
      dealHighlights: true,
      financialProjections: true,
      marketAnalysis: true,
      riskAssessment: true,
      legalStructure: true,
      callToAction: true,
    },
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  let currentPage = 1;

  // Helper functions
  const setColorFill = (color: { r: number; g: number; b: number }) => {
    doc.setFillColor(color.r, color.g, color.b);
  };

  const setColorText = (color: { r: number; g: number; b: number }) => {
    doc.setTextColor(color.r, color.g, color.b);
  };

  const addPage = () => {
    doc.addPage();
    currentPage++;
  };

  const addHeader = (title: string, subtitle?: string) => {
    setColorFill(primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    setColorText({ r: 255, g: 255, b: 255 });
    doc.setFontSize(24);
    doc.text(title, margin, 20);
    if (subtitle) {
      doc.setFontSize(12);
      doc.text(subtitle, margin, 30);
    }
    setColorText({ r: 0, g: 0, b: 0 });
  };

  const addFooter = () => {
    setColorText(defaultColors.gray);
    doc.setFontSize(9);
    doc.text(
      `Page ${currentPage} | ${new Date().toLocaleDateString()} | Confidential`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  };

  // Calculate risk rating
  const getRiskRating = (investmentScore: number): { level: string; emoji: string; color: { r: number; g: number; b: number } } => {
    if (investmentScore >= 80) {
      return { level: 'Low Risk', emoji: '🟢', color: defaultColors.success };
    } else if (investmentScore >= 60) {
      return { level: 'Moderate Risk', emoji: '🟡', color: defaultColors.warning };
    } else {
      return { level: 'High Risk', emoji: '🔴', color: defaultColors.danger };
    }
  };

  const riskRating = getRiskRating(project.investmentScore);

  // PAGE 1: EXECUTIVE SUMMARY
  if (sections.executiveSummary) {
    addHeader('Executive Summary', project.projectName);

    let yPos = 50;

    // Deal Headline
    setColorText(primaryColor);
    doc.setFontSize(16);
    doc.text(`${project.projectName}`, margin, yPos);
    yPos += 8;
    setColorText(defaultColors.gray);
    doc.setFontSize(11);
    doc.text(`Location: ${project.location} | Strategy: ${project.strategy || 'Mixed'}`, margin, yPos);
    yPos += 15;

    // Key Metrics (2x2 grid)
    const metrics = [
      { label: 'Total Investment', value: formatCurrency(project.totalInvestment) },
      { label: 'Projected ROI', value: `${(project.roi || 0).toFixed(1)}%` },
      { label: 'Annual Cash Flow', value: formatCurrency(project.avgCashFlow * 12) },
      { label: 'Break-Even', value: `${project.breakEvenMonths} months` },
    ];

    const boxWidth = (pageWidth - margin * 2 - 5) / 2;
    let boxIndex = 0;

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const metric = metrics[boxIndex++];
        const x = margin + col * (boxWidth + 5);
        const y = yPos + row * 30;

        // Box background
        setColorFill(defaultColors.lightGray);
        doc.rect(x, y, boxWidth, 25, 'F');
        doc.setDrawColor(229, 231, 235);
        doc.rect(x, y, boxWidth, 25);

        // Label
        setColorText(defaultColors.gray);
        doc.setFontSize(9);
        doc.text(metric.label, x + 5, y + 8);

        // Value
        setColorText(primaryColor);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(metric.value, x + 5, y + 18);
        setColorText({ r: 0, g: 0, b: 0 });
        doc.setFont(undefined, 'normal');
      }
    }

    yPos += 65;

    // Risk Rating
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    setColorText({ r: 0, g: 0, b: 0 });
    doc.text('Risk Assessment:', margin, yPos);
    yPos += 8;

    setColorFill(defaultColors.lightGray);
    doc.rect(margin, yPos, pageWidth - margin * 2, 15, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.rect(margin, yPos, pageWidth - margin * 2, 15);

    setColorText(riskRating.color);
    doc.setFontSize(14);
    doc.text(riskRating.emoji, margin + 5, yPos + 10);
    setColorText({ r: 0, g: 0, b: 0 });
    doc.setFontSize(11);
    doc.text(riskRating.level + ` (Score: ${(project.investmentScore || 0).toFixed(0)}/100)`, margin + 15, yPos + 10);

    yPos += 25;

    // Investment Summary
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    setColorText({ r: 0, g: 0, b: 0 });
    doc.text('Investment Thesis:', margin, yPos);
    yPos += 8;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    const summary = `This ${project.strategy || 'mixed'} opportunity presents a compelling risk-adjusted return profile. With a projected ROI of ${(project.roi || 0).toFixed(1)}% and monthly cash flow of ${formatCurrency(project.avgCashFlow)}, the investment is positioned to break even in ${project.breakEvenMonths} months while generating stable returns. The property's location in ${project.location} and investment score of ${(project.investmentScore || 0).toFixed(0)}/100 reflect strong fundamentals.`;
    const summaryLines = doc.splitTextToSize(summary, pageWidth - margin * 2);
    doc.text(summaryLines, margin, yPos);

    addFooter();
    addPage();
  }

  // PAGE 2: DEAL HIGHLIGHTS
  if (sections.dealHighlights) {
    addHeader('Deal Highlights');

    let yPos = 50;

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    setColorText({ r: 0, g: 0, b: 0 });

    const highlights = [
      `Location: ${project.location}`,
      `Investment Strategy: ${project.strategy || 'Mixed'}`,
      `Total Investment Required: ${formatCurrency(project.totalInvestment)}`,
      `Projected Annual Returns: ${formatCurrency(project.avgCashFlow * 12)}`,
      `Break-Even Timeline: ${project.breakEvenMonths} months`,
    ];

    highlights.forEach((highlight, idx) => {
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      setColorText(primaryColor);
      doc.text('•', margin + 2, yPos);
      setColorText({ r: 0, g: 0, b: 0 });
      doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(highlight, pageWidth - margin * 2 - 10);
      doc.text(lines, margin + 10, yPos);
      yPos += lines.length * 6 + 5;
    });

    yPos += 10;

    // Competitive Advantages
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    setColorText({ r: 0, g: 0, b: 0 });
    doc.text('Competitive Advantages:', margin, yPos);
    yPos += 10;

    const advantages = [
      'Strategic location with high market demand',
      'Competitive pricing relative to comparable properties',
      'Professional property management included',
      'Transparent, structured investment terms',
    ];

    advantages.forEach((advantage) => {
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      setColorText(primaryColor);
      doc.text('✓', margin + 2, yPos);
      setColorText({ r: 0, g: 0, b: 0 });
      doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(advantage, pageWidth - margin * 2 - 10);
      doc.text(lines, margin + 10, yPos);
      yPos += lines.length * 6 + 4;
    });

    addFooter();
    addPage();
  }

  // PAGE 3: FINANCIAL PROJECTIONS
  if (sections.financialProjections) {
    addHeader('Financial Projections');

    let yPos = 50;

    // Year-by-Year Table
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    setColorText({ r: 0, g: 0, b: 0 });
    doc.text('5-Year Cash Flow Projection:', margin, yPos);
    yPos += 10;

    const tableStartY = yPos;
    const colWidth = (pageWidth - margin * 2) / 4;

    // Header
    setColorFill(primaryColor);
    doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
    setColorText({ r: 255, g: 255, b: 255 });
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Year', margin + 2, yPos + 6);
    doc.text('Investment', margin + colWidth + 2, yPos + 6);
    doc.text('Cash Flow', margin + colWidth * 2 + 2, yPos + 6);
    doc.text('Cumulative', margin + colWidth * 3 + 2, yPos + 6);

    yPos += 8;

    setColorText({ r: 0, g: 0, b: 0 });
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);

    let cumulativeCashFlow = 0;
    for (let year = 1; year <= 5; year++) {
      const annualCashFlow = project.avgCashFlow * 12;
      cumulativeCashFlow += annualCashFlow;

      // Alternating row colors
      if (year % 2 === 0) {
        setColorFill(defaultColors.lightGray);
        doc.rect(margin, yPos, pageWidth - margin * 2, 6, 'F');
      }

      doc.text(`Year ${year}`, margin + 2, yPos + 5);
      doc.text(formatCurrency(project.totalInvestment), margin + colWidth + 2, yPos + 5);
      doc.text(formatCurrency(annualCashFlow), margin + colWidth * 2 + 2, yPos + 5);
      doc.text(formatCurrency(cumulativeCashFlow), margin + colWidth * 3 + 2, yPos + 5);

      yPos += 6;
    }

    yPos += 15;

    // ROI Breakdown
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    setColorText({ r: 0, g: 0, b: 0 });
    doc.text('ROI Calculation Breakdown:', margin, yPos);
    yPos += 8;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);

    const roiBreakdown = [
      `Total Investment: ${formatCurrency(project.totalInvestment)}`,
      `Annual Returns: ${formatCurrency(project.avgCashFlow * 12)}`,
      `ROI: ${(project.roi || 0).toFixed(1)}%`,
      `Break-Even Point: ${project.breakEvenMonths} months`,
    ];

    roiBreakdown.forEach((item) => {
      doc.text(item, margin + 5, yPos);
      yPos += 6;
    });

    addFooter();
    addPage();
  }

  // PAGE 4: MARKET ANALYSIS
  if (sections.marketAnalysis) {
    addHeader('Market Analysis & Comparables');

    let yPos = 50;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    setColorText({ r: 0, g: 0, b: 0 });

    const marketText = `Market Analysis: ${project.location} represents a strategic investment opportunity with strong fundamentals. The location benefits from proximity to key amenities, rental demand, and long-term appreciation potential.`;
    const marketLines = doc.splitTextToSize(marketText, pageWidth - margin * 2);
    doc.text(marketLines, margin, yPos);
    yPos += marketLines.length * 6 + 10;

    // Placeholder for comparables
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('Comparable Properties (Market Benchmarks):', margin, yPos);
    yPos += 10;

    setColorFill(defaultColors.lightGray);
    doc.rect(margin, yPos - 2, pageWidth - margin * 2, 8, 'F');
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    setColorText({ r: 0, g: 0, b: 0 });
    doc.text('Property', margin + 2, yPos + 4);
    doc.text('Price/m²', margin + 80, yPos + 4);
    doc.text('Rental Yield', margin + 130, yPos + 4);

    yPos += 10;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);

    // Sample comparables
    const comparables = [
      { name: 'Property A', pricePerM2: '$8,500', yield: '7.5%' },
      { name: 'Property B', pricePerM2: '$8,200', yield: '8.2%' },
      { name: 'Your Property', pricePerM2: '$7,950', yield: '8.8%' },
      { name: 'Property C', pricePerM2: '$8,800', yield: '6.9%' },
    ];

    comparables.forEach((comp, idx) => {
      if (idx % 2 === 0) {
        setColorFill(defaultColors.lightGray);
        doc.rect(margin, yPos - 2, pageWidth - margin * 2, 6, 'F');
      }
      setColorText(idx === 2 ? primaryColor : { r: 0, g: 0, b: 0 });
      if (idx === 2) doc.setFont(undefined, 'bold');
      doc.text(comp.name, margin + 2, yPos + 2);
      doc.text(comp.pricePerM2, margin + 80, yPos + 2);
      doc.text(comp.yield, margin + 130, yPos + 2);
      if (idx === 2) doc.setFont(undefined, 'normal');
      yPos += 6;
    });

    yPos += 10;

    // Market insight
    setColorText({ r: 0, g: 0, b: 0 });
    doc.setFont(undefined, 'italic');
    doc.setFontSize(9);
    const insight = 'Your property is competitively positioned in the market, offering superior value with higher rental yield compared to comparable properties.';
    const insightLines = doc.splitTextToSize(insight, pageWidth - margin * 2);
    doc.text(insightLines, margin, yPos);

    addFooter();
    addPage();
  }

  // PAGE 5: RISK ASSESSMENT
  if (sections.riskAssessment) {
    addHeader('Risk Assessment');

    let yPos = 50;

    // Investment Score Visual
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    setColorText({ r: 0, g: 0, b: 0 });
    doc.text(`Investment Score: ${(project.investmentScore || 0).toFixed(0)}/100`, margin, yPos);
    yPos += 8;

    // Score bar
    const scoreWidth = (pageWidth - margin * 2) * ((project.investmentScore || 0) / 100);
    setColorFill(project.investmentScore! >= 70 ? defaultColors.success : defaultColors.warning);
    doc.rect(margin, yPos, scoreWidth, 8, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, yPos, pageWidth - margin * 2, 8);

    yPos += 15;

    // Key Risks
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    setColorText({ r: 0, g: 0, b: 0 });
    doc.text('Key Risk Factors:', margin, yPos);
    yPos += 8;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);

    const risks = [
      { factor: 'Market Risk', mitigation: 'Diversified tenant base reduces dependency on single market conditions.' },
      { factor: 'Construction Delay', mitigation: 'Professional contractors with proven track record. Contingency timeline included.' },
      { factor: 'Rental Market Slowdown', mitigation: 'Multi-use property allows pivoting to alternative income streams.' },
      { factor: 'Currency Fluctuation', mitigation: 'Hedging strategy in place. Revenue in stable local currency.' },
    ];

    risks.forEach((risk) => {
      setColorText(defaultColors.danger);
      doc.setFont(undefined, 'bold');
      doc.text('⚠', margin + 2, yPos);
      setColorText({ r: 0, g: 0, b: 0 });
      doc.setFont(undefined, 'bold');
      doc.text(risk.factor, margin + 12, yPos);
      yPos += 6;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      const mitLines = doc.splitTextToSize(risk.mitigation, pageWidth - margin * 2 - 18);
      doc.text(mitLines, margin + 12, yPos);
      yPos += mitLines.length * 5 + 2;

      doc.setFontSize(10);
      yPos += 2;
    });

    addFooter();
    addPage();
  }

  // PAGE 6: LEGAL & STRUCTURE
  if (sections.legalStructure) {
    addHeader('Legal & Ownership Structure');

    let yPos = 50;

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    setColorText({ r: 0, g: 0, b: 0 });

    const sections_legal = [
      { title: 'Ownership Structure', content: 'Freehold or PT ownership structure with clear legal documentation.' },
      { title: 'Required Permits & Licenses', content: 'All necessary permits obtained. Ongoing compliance with local regulations.' },
      { title: 'Tax Treatment', content: 'Optimized tax structure. Compliance with local and international tax laws.' },
    ];

    sections_legal.forEach((section) => {
      doc.text(section.title, margin, yPos);
      yPos += 7;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      const contentLines = doc.splitTextToSize(section.content, pageWidth - margin * 2 - 5);
      doc.text(contentLines, margin + 5, yPos);
      yPos += contentLines.length * 5 + 5;

      doc.setFont(undefined, 'bold');
      doc.setFontSize(11);
      yPos += 3;
    });

    yPos += 10;

    // Disclaimer
    doc.setFont(undefined, 'italic');
    doc.setFontSize(9);
    setColorText(defaultColors.gray);
    const disclaimer = 'This document is for informational purposes only and does not constitute investment advice. Legal review recommended before investment. All terms subject to final agreement.';
    const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - margin * 2);
    doc.text(disclaimerLines, margin, yPos);

    addFooter();
    addPage();
  }

  // PAGE 7: CALL TO ACTION
  if (sections.callToAction) {
    addHeader('Investment Framework & Next Steps');

    let yPos = 50;

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    setColorText(primaryColor);
    doc.text('Ready to Proceed?', margin, yPos);
    setColorText({ r: 0, g: 0, b: 0 });
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    const nextSteps = [
      '1. Initial Consultation - Review investment thesis and property details',
      '2. Due Diligence - Property inspection and financial verification',
      '3. Legal Review - Contract review by your legal counsel',
      '4. Funding - Arrange investment capital and finalize documentation',
      '5. Closing - Complete transaction and begin investment period',
    ];

    nextSteps.forEach((step) => {
      doc.text(step, margin + 5, yPos);
      yPos += 7;
    });

    yPos += 10;

    // Contact Information
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    setColorText(primaryColor);
    doc.text('Contact Information:', margin, yPos);
    setColorText({ r: 0, g: 0, b: 0 });
    yPos += 8;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Name: ${agentName}`, margin + 5, yPos);
    yPos += 6;
    doc.text(`Email: ${agentEmail}`, margin + 5, yPos);
    yPos += 6;
    doc.text(`Phone: ${agentPhone}`, margin + 5, yPos);
    yPos += 15;

    // Timeline
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    setColorText(primaryColor);
    doc.text('Expected Timeline:', margin, yPos);
    setColorText({ r: 0, g: 0, b: 0 });
    yPos += 8;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    const timeline = [
      'Consultation & Review: 3-5 days',
      'Due Diligence: 1-2 weeks',
      'Legal Documentation: 1 week',
      'Closing: 3-5 business days',
    ];

    timeline.forEach((item) => {
      doc.text('• ' + item, margin + 5, yPos);
      yPos += 6;
    });

    addFooter();
  }

  // Save PDF
  const fileName = `${project.projectName.replace(/\s+/g, '-')}-Pitch-Deck.pdf`;
  doc.save(fileName);
  return fileName;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return '$' + (value / 1_000_000).toFixed(1) + 'M';
  if (value >= 1_000) return '$' + (value / 1_000).toFixed(0) + 'K';
  return '$' + value.toFixed(0);
}
