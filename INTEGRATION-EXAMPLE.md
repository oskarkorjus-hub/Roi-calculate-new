# Integration Example: Adding New Features to XIRR Calculator

This document shows how to integrate the 5 new features into the existing XIRR Calculator as a complete example.

## Overview
We'll add:
1. Investment Score display
2. Timeline Analysis chart
3. Portfolio saving + Email collection modal

## Step 1: Update XIRRCalculator/index.tsx

### Add Imports
```tsx
import { InvestmentScore, TimelineAnalysis, ResultsWithEmailCollection } from '../../components';
import { useProjectExport } from '../../hooks/useProjectExport';
import {
  calculateBreakEvenMonths,
  calculateCashFlowStability,
  calculateRiskScore,
  generateTimelineData,
  calculateInvestmentScore as calcInvestmentScore,
} from '../../utils/projectMetrics';
```

### Add State Variables
```tsx
export function XIRRCalculator() {
  // ... existing state ...
  
  const { isLoading: isExporting, exportWithEmail } = useProjectExport();
  const [showResults, setShowResults] = useState(false);
  const [timelineData, setTimelineData] = useState<TimelineDataPoint[]>([]);
  const [investmentScoreValue, setInvestmentScoreValue] = useState(0);
```

### Calculate Metrics After Results
```tsx
// After calculating XIRR result
useEffect(() => {
  if (result && data.additionalCashFlows) {
    // Calculate timeline
    const timeline = generateTimelineData(
      data.additionalCashFlows,
      new Date(data.property.purchaseDate)
    );
    setTimelineData(timeline);

    // Calculate investment score
    const breakEvenMonths = calculateBreakEvenMonths(data.additionalCashFlows);
    const stability = calculateCashFlowStability(data.additionalCashFlows);
    const riskScore = calculateRiskScore(result.rate * 100, breakEvenMonths, stability);
    
    const score = calcInvestmentScore({
      roi: result.rate * 100,
      cashFlowStability: stability,
      breakEvenMonths: breakEvenMonths,
      riskScore: riskScore,
    });
    setInvestmentScoreValue(score);
  }
}, [result, data]);
```

### Modify Results Display Section

Find the existing results display section and wrap it:

```tsx
// BEFORE: <ReportView ... />
// AFTER:

{showResults && (
  <ResultsWithEmailCollection
    projectName={data.property.projectName}
    onExport={async (email, name, propertyName) => {
      const result = await exportWithEmail({
        calculatorId: 'xirr',
        data,
        result,
        currency: symbol,
        formatDisplay,
        generatePDF: () => {
          // Generate PDF as base64
          // Use existing pdfExport utility
          return 'data:application/pdf;base64,...'; // Your PDF generation
        },
      }, email, name, propertyName);
      
      if (result.success) {
        setShowResults(false); // Hide email modal
      }
    }}
    onSkip={() => {
      // User skipped email, show results anyway
    }}
    autoShowEmail={true}
  >
    {/* Existing results display */}
    <div className="space-y-6">
      {/* Investment Score */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold mb-4">Investment Score</h3>
        <InvestmentScore
          input={{
            roi: (result?.rate || 0) * 100,
            cashFlowStability: calculateCashFlowStability(data.additionalCashFlows || []),
            breakEvenMonths: calculateBreakEvenMonths(data.additionalCashFlows || []),
            riskScore: calculateRiskScore(
              (result?.rate || 0) * 100,
              calculateBreakEvenMonths(data.additionalCashFlows || []),
              calculateCashFlowStability(data.additionalCashFlows || [])
            ),
          }}
          size="lg"
          showBreakdown={true}
          showTooltip={true}
        />
      </div>

      {/* Timeline Analysis */}
      {timelineData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <TimelineAnalysis
            data={timelineData}
            title={`${data.property.projectName} - Cash Flow Timeline`}
            showBreakEvenLine={true}
          />
        </div>
      )}

      {/* Existing ReportView */}
      <ReportView {...reportViewProps} />
    </div>
  </ResultsWithEmailCollection>
)}
```

## Step 2: Update XIRRCalculator/components/ReportView.tsx (Optional)

Add Investment Score to the report PDF:

```tsx
// In the PDF generation section, add:
addInvestmentScoreSection(doc, investmentScoreValue, metrics);

// New function to add to ReportView
function addInvestmentScoreSection(
  doc: jsPDF,
  score: number,
  metrics: {
    roi: number;
    stability: number;
    breakEvenMonths: number;
    riskScore: number;
  }
) {
  // Add score section to PDF
  doc.setFontSize(12);
  doc.text('Investment Score', MARGIN, yPosition);
  yPosition += 10;

  doc.setFontSize(20);
  doc.setTextColor(score >= 75 ? 34 : 99, score >= 75 ? 197 : 102);
  doc.text(String(score), MARGIN, yPosition);
  yPosition += 15;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text(`ROI: ${metrics.roi.toFixed(1)}`, MARGIN, yPosition);
  doc.text(`Stability: ${metrics.stability.toFixed(0)}/100`, MARGIN + 50, yPosition);
  // ... etc
}
```

## Step 3: Test Integration

### 1. Navigate to XIRR Calculator
- Click on "XIRR" tab
- Fill in property details
- Enter payment schedule
- Set exit strategy

### 2. Calculate and See Results
- Click "Calculate"
- Email modal appears
- Investment score visible
- Timeline chart displayed

### 3. Test Email Collection
- Enter email: `test@example.com`
- Enter name: `John Doe`
- Enter property: `Beach Villa`
- Click "Get Report"
- Wait for confirmation

### 4. Check Portfolio
- Click "💼 Portfolio" tab
- See new project added
- Verify all metrics
- Check investment score matches

### 5. Try Comparison
- Create 2-3 more projects
- Go to "⚖️ Compare" tab
- Select 2 projects
- Verify side-by-side comparison
- Check highlighting

## Step 4: Handle Edge Cases

### No Cash Flows
```tsx
if (!data.additionalCashFlows || data.additionalCashFlows.length === 0) {
  // Show default values
  setInvestmentScoreValue(50); // Neutral score
  setTimelineData([]);
}
```

### Invalid Dates
```tsx
try {
  const timeline = generateTimelineData(
    data.additionalCashFlows,
    new Date(data.property.purchaseDate)
  );
  setTimelineData(timeline);
} catch (error) {
  console.error('Failed to generate timeline:', error);
  setTimelineData([]);
}
```

### Export Failures
```tsx
const result = await exportWithEmail({...}, email, name, propertyName);
if (!result.success) {
  // Show error toast
  setToast({
    message: result.message || 'Failed to send report',
    type: 'error',
  });
  // Keep showing email modal for retry
}
```

## Step 5: Style Considerations

### Responsive Layout
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Investment Score */}
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <InvestmentScore {...} />
  </div>
  
  {/* Timeline Chart */}
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <TimelineAnalysis {...} />
  </div>
</div>

{/* Full width report */}
<div className="bg-white rounded-lg border border-gray-200 p-6">
  <ReportView {...} />
</div>
```

### Dark Mode Support (if needed)
```tsx
<div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
  <InvestmentScore {...} />
</div>
```

## Step 6: Performance Optimization

### Memoize Calculations
```tsx
import { useMemo, useCallback } from 'react';

const breakEvenMonths = useMemo(
  () => calculateBreakEvenMonths(data.additionalCashFlows || []),
  [data.additionalCashFlows]
);

const cashFlowStability = useMemo(
  () => calculateCashFlowStability(data.additionalCashFlows || []),
  [data.additionalCashFlows]
);

const timelineData = useMemo(
  () => generateTimelineData(
    data.additionalCashFlows || [],
    new Date(data.property.purchaseDate)
  ),
  [data.additionalCashFlows, data.property.purchaseDate]
);
```

### Lazy Load Timeline Chart
```tsx
const [showTimeline, setShowTimeline] = useState(false);

// Show timeline only if needed
{showTimeline && <TimelineAnalysis data={timelineData} />}
```

## Step 7: Add to All Calculators

Repeat the same pattern for:
1. RentalROI Calculator
2. MortgageCalculator
3. CashFlowProjector
4. DevFeasibilityCalculator

The integration is identical - just adjust the `calculatorId` parameter.

## Complete Example Code

### Minimal Integration (Quick Add)

```tsx
import { InvestmentScore, ResultsWithEmailCollection } from '../../components';
import { useProjectExport } from '../../hooks/useProjectExport';
import { calculateInvestmentScore as calcScore } from '../../utils/projectMetrics';

export function YourCalculator() {
  const { exportWithEmail } = useProjectExport();
  
  // ... existing code ...

  return (
    <ResultsWithEmailCollection
      projectName={projectName}
      onExport={(email, name, propertyName) =>
        exportWithEmail({
          calculatorId: 'your-calc-id',
          data,
          result,
          currency,
          formatDisplay,
          generatePDF: () => generatePDF(),
        }, email, name, propertyName)
      }
      onSkip={() => {}}
    >
      <div className="space-y-6">
        <InvestmentScore
          input={{
            roi: result.roi * 100,
            cashFlowStability: 75,
            breakEvenMonths: 18,
            riskScore: 70,
          }}
          size="lg"
        />
        {/* Your existing results */}
      </div>
    </ResultsWithEmailCollection>
  );
}
```

## Testing Checklist

- [ ] Calculator loads without errors
- [ ] Results display correctly
- [ ] Investment score calculates
- [ ] Email modal appears before results
- [ ] Can skip email
- [ ] Email sends successfully
- [ ] Project added to portfolio
- [ ] Portfolio shows new project
- [ ] Can delete project
- [ ] Timeline chart displays
- [ ] Page refresh preserves portfolio
- [ ] All metrics calculate correctly

## Troubleshooting

### Email Modal Not Showing
```tsx
// Verify autoShowEmail is true
<ResultsWithEmailCollection autoShowEmail={true} />
```

### Investment Score Shows 0
```tsx
// Check input values
console.log({ roi, stability, breakEvenMonths, riskScore });
// Verify calculateCashFlowStability returns valid number
```

### Timeline Chart Empty
```tsx
// Check cashFlows array
console.log('Cash flows:', data.additionalCashFlows);
// Verify purchase date is valid
console.log('Start date:', new Date(data.property.purchaseDate));
```

### Project Not Saving
```tsx
// Check browser localStorage
console.log(localStorage.getItem('baliinvest_portfolio'));
// Verify addProject is called
console.log('Result:', result);
```

## Performance Tips

1. Memoize all calculations with `useMemo`
2. Lazy load timeline chart
3. Defer non-critical calculations
4. Use `useCallback` for event handlers
5. Keep investment score in small component

## Next Steps

1. Apply this to one calculator first
2. Test thoroughly
3. Apply to remaining calculators
4. Deploy and monitor
5. Gather user feedback
6. Iterate on UX

---

This integration example provides a complete working template for adding the new features to any of the five calculators in the application.
