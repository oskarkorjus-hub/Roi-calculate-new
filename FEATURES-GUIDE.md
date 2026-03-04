# ROI Calculator - New Features Guide

## Overview
This document describes the 5 quick-win features implemented for the ROI Calculator application.

## Feature 1: Investment Score (1-100 Rating) ✅

### What It Does
- Auto-calculates a 1-100 score for every project
- Factors in: ROI (40%), Cash Flow Stability (30%), Timeline to Break-Even (20%), Risk (10%)
- Displays a visual circular progress indicator with a tooltip
- Shows detailed breakdown explaining why the score is what it is

### Location
- Hook: `src/hooks/useInvestmentScore.ts`
- Component: `src/components/display/InvestmentScore.tsx`

### Usage
```tsx
import { InvestmentScore } from './components';
import { useInvestmentScore } from './hooks/useInvestmentScore';

// Calculate score
const { overallScore, breakdown, scoreLabel } = useInvestmentScore({
  roi: 25,                    // % return
  cashFlowStability: 75,      // 0-100 score
  breakEvenMonths: 18,        // months to break even
  riskScore: 70,              // 0-100, 100 = low risk
});

// Render
<InvestmentScore
  input={{ roi: 25, cashFlowStability: 75, breakEvenMonths: 18, riskScore: 70 }}
  size="md"
  showBreakdown={true}
  showTooltip={true}
/>
```

### Features
- Click "Why 78?" to see detailed breakdown
- Color-coded: Red (risky) → Orange (poor) → Yellow (acceptable) → Blue (good) → Green (excellent)
- Responsive sizes: `sm`, `md`, `lg`

---

## Feature 2: Portfolio Dashboard (localStorage MVP) ✅

### What It Does
- Saves project state after each calculator
- Displays all saved projects with summary metrics
- Shows: Total Investment, Blended ROI, Average Cash Flow, Average Score
- Actions: View, Edit, Delete, Compare

### Location
- Hook: `src/hooks/usePortfolio.ts`
- Component: `src/components/PortfolioDashboard.tsx`
- Types: `src/types/portfolio.ts`

### Storage
- Uses localStorage with key: `baliinvest_portfolio`
- Persists: projects array, email log
- Non-destructive: existing data preserved

### Usage
```tsx
import { usePortfolio } from './hooks/usePortfolio';

const {
  projects,
  addProject,
  deleteProject,
  calculatePortfolioMetrics,
} = usePortfolio();

// Add a project
const project = addProject({
  calculatorId: 'xirr',
  projectName: 'Beach Villa Project',
  location: 'Bali, Indonesia',
  totalInvestment: 500000000,
  roi: 25.5,
  avgCashFlow: 15000000,
  breakEvenMonths: 18,
  investmentScore: 78,
  currency: 'IDR',
  data: { /* raw calculator data */ },
});

// Get portfolio metrics
const metrics = calculatePortfolioMetrics();
// Returns: {
//   totalProjects: 3,
//   totalInvestment: 1500000000,
//   blendedROI: 22.3,
//   avgCashFlow: 12500000,
//   avgInvestmentScore: 75,
// }
```

### Navigation
- New tab in main app: "💼 Portfolio"
- Shows empty state when no projects
- Grid view with project cards
- Click "View" to see details
- Click "Delete" to remove (with confirmation)

---

## Feature 3: Scenario Comparison (Cross-Calculator) ✅

### What It Does
- Compare multiple projects side-by-side
- Select 2-5 projects and see:
  - Total Investment
  - ROI
  - Avg Cash Flow
  - Break-Even Timeline
  - Investment Score
- Highlights best/worst values
- Export to CSV

### Location
- Component: `src/components/ScenarioComparison.tsx`

### Usage
```tsx
import { ScenarioComparison } from './components';

// In app
<ScenarioComparison />
```

### Features
- "Select All" / "Deselect All" buttons
- Checkbox selection for each project
- Table with color highlighting:
  - Green (best value)
  - Red (worst value)
  - Default (neutral)
- Save comparison snapshots
- Export as CSV file

### Navigation
- New tab in main app: "⚖️ Compare"
- Works across all calculators

---

## Feature 4: Timeline Impact Analysis ✅

### What It Does
- Shows break-even timeline for each project
- Chart: cumulative cash flow by month (0-60 months)
- Displays when project becomes cash-flow positive
- Integrates into all calculators

### Location
- Hook: `src/utils/projectMetrics.ts`
- Component: `src/components/display/TimelineAnalysis.tsx`
- Types: `src/components/display/TimelineAnalysis.tsx`

### Usage
```tsx
import { TimelineAnalysis } from './components';
import { generateTimelineData } from './utils/projectMetrics';

// Generate timeline data
const timelineData = generateTimelineData(
  cashFlows,         // CashFlow[] array
  new Date('2024-03-01')  // project start date
);

// Render chart
<TimelineAnalysis
  data={timelineData}
  title="Project Cash Flow Timeline"
  showBreakEvenLine={true}
/>
```

### Features
- Line chart with 60-month projection
- Reference line at break-even (0)
- Shows max negative and final cash flow
- Responsive and interactive
- Hover for exact values

---

## Feature 5: PDF Reports + Email Collection ✅

### What It Does
- Email modal shows BEFORE calculator results
- Collects: email (required), name (optional), property name (optional)
- Generates PDF automatically
- Sends via Postmark integration
- Logs email for marketing

### Location
- Hook: `src/hooks/useProjectExport.ts`
- Component: `src/components/EmailCollectionModal.tsx`
- Component: `src/components/ResultsWithEmailCollection.tsx`
- Storage: `src/hooks/usePortfolio.ts` (email log)

### Usage
```tsx
import { ResultsWithEmailCollection } from './components';
import { useProjectExport } from './hooks/useProjectExport';

// Wrapper around results
<ResultsWithEmailCollection
  projectName="Beach Villa Project"
  onExport={async (email, name, propertyName) => {
    // Generate PDF and send
    const result = await exportWithEmail({
      calculatorId: 'xirr',
      data: investmentData,
      result: xirrResult,
      currency: 'IDR',
      formatDisplay: formatDisplay,
      generatePDF: () => generatePDFAsBase64(),
    }, email, name, propertyName);
  }}
  onSkip={() => {
    // User skipped email
  }}
  autoShowEmail={true}
>
  {/* Calculator results display here */}
</ResultsWithEmailCollection>
```

### Features
- Clean modal with benefits listed
- Email validation
- Error handling with toast notifications
- "Skip for Now" option
- Success confirmation
- Privacy note in footer

### Email Log Storage
```tsx
const { emailLog } = usePortfolio();
// Returns: [
//   {
//     email: "john@example.com",
//     name: "John Doe",
//     propertyName: "Beach Villa",
//     reportType: "xirr",
//     sentAt: "2024-03-04T10:30:00Z"
//   }
// ]
```

---

## Integration Guide

### How to Integrate into Existing Calculators

#### Step 1: Add Investment Score Display
```tsx
import { InvestmentScore } from '../components';

// In calculator results
<InvestmentScore
  input={{
    roi: result.rate * 100,
    cashFlowStability: calculateCashFlowStability(data.additionalCashFlows),
    breakEvenMonths: calculateBreakEvenMonths(data.additionalCashFlows),
    riskScore: 70, // Calculate from your data
  }}
  size="lg"
/>
```

#### Step 2: Add Timeline Analysis
```tsx
import { TimelineAnalysis } from '../components';
import { generateTimelineData } from '../utils/projectMetrics';

// Generate and display
const timelineData = generateTimelineData(
  data.additionalCashFlows,
  new Date(data.property.purchaseDate)
);

<TimelineAnalysis
  data={timelineData}
  title={`${data.property.projectName} - Cash Flow Timeline`}
/>
```

#### Step 3: Add Email Collection & Portfolio Saving
```tsx
import { ResultsWithEmailCollection } from '../components';
import { useProjectExport } from '../hooks/useProjectExport';

const { exportWithEmail } = useProjectExport();

// Wrap results display
<ResultsWithEmailCollection
  projectName={data.property.projectName}
  onExport={(email, name, propertyName) =>
    exportWithEmail({
      calculatorId: 'xirr',
      data,
      result,
      currency: symbol,
      formatDisplay,
      generatePDF: () => exportPDFAsBase64(/* params */),
    }, email, name, propertyName)
  }
  onSkip={() => {
    // Handle skip
  }}
>
  {/* Your existing results display */}
</ResultsWithEmailCollection>
```

---

## Utilities & Helper Functions

### projectMetrics.ts

```tsx
import {
  calculateBreakEvenMonths,
  calculateCashFlowStability,
  calculateRiskScore,
  generateTimelineData,
  calculateAverageCashFlow,
  createProjectSummary,
  calculateInvestmentScore,
} from './utils/projectMetrics';

// Calculate metrics
const breakEven = calculateBreakEvenMonths(cashFlows);      // Returns: number (months)
const stability = calculateCashFlowStability(cashFlows);   // Returns: 0-100
const risk = calculateRiskScore(roi, breakEven, stability); // Returns: 0-100
const timeline = generateTimelineData(cashFlows, startDate); // Returns: TimelineDataPoint[]
const avgCF = calculateAverageCashFlow(cashFlows, 120);    // Returns: number
const score = calculateInvestmentScore({                    // Returns: 0-100
  roi: 25,
  cashFlowStability: 75,
  breakEvenMonths: 18,
  riskScore: 70,
});
```

---

## Testing Checklist

### Portfolio Dashboard
- [ ] Add a project from calculator
- [ ] See it appear on Portfolio tab
- [ ] View project details
- [ ] Delete project with confirmation
- [ ] Check portfolio metrics update
- [ ] Check localStorage persistence (reload page)

### Investment Score
- [ ] See score display on project cards
- [ ] Click "Why X?" to expand details
- [ ] Verify breakdown percentages add up correctly
- [ ] Test different input combinations
- [ ] Check color coding works (red, orange, yellow, blue, green)

### Scenario Comparison
- [ ] Create 2-3 projects
- [ ] Go to Compare tab
- [ ] Select projects
- [ ] Verify highlighting (green for best, red for worst)
- [ ] Test "Select All" / "Deselect All"
- [ ] Export to CSV
- [ ] Save comparison snapshot

### Timeline Analysis
- [ ] View timeline chart on a project
- [ ] Verify break-even line at 0
- [ ] Check month labels
- [ ] Hover for exact values
- [ ] Verify max negative and final values
- [ ] Test with different cash flow patterns

### Email Collection
- [ ] Run calculator
- [ ] See email modal BEFORE results
- [ ] Enter invalid email (should show error)
- [ ] Submit with valid email
- [ ] Check toast notification
- [ ] Verify project saved to portfolio
- [ ] Skip email and verify results still show
- [ ] Check email log in localStorage

---

## Data Structures

### PortfolioProject
```typescript
interface PortfolioProject {
  id: string;
  calculatorId: string;
  projectName: string;
  location: string;
  totalInvestment: number;
  roi: number;
  avgCashFlow: number;
  breakEvenMonths: number;
  investmentScore: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  data: any; // Raw calculator data
}
```

### TimelineDataPoint
```typescript
interface TimelineDataPoint {
  month: number;
  monthLabel: string;
  cumulativeCashFlow: number;
  isBreakEven: boolean;
}
```

### EmailLog
```typescript
interface EmailLog {
  email: string;
  name?: string;
  propertyName: string;
  reportType: string;
  sentAt: string;
}
```

---

## Performance Notes

- **localStorage**: ~50KB per project (with full data)
- **Rendering**: All components use React.useMemo for optimization
- **Charts**: Recharts handles rendering efficiently
- **Bundle Size**: Added ~50KB (gzipped)

---

## Future Enhancements

1. **Cloud Sync**: Move portfolio to Supabase
2. **Sharing**: Generate shareable comparison links
3. **Templates**: Save comparison templates
4. **Alerts**: Notify on ROI changes
5. **Mobile**: Optimize for mobile layouts
6. **Export**: Excel export with charts
7. **Webhooks**: Send data to external systems
8. **AI Analysis**: AI-powered investment insights

---

## Support

For questions about the new features, check:
1. Component props (TypeScript interfaces)
2. Hook return values
3. Example usage sections above
4. Type definitions in `/src/types/`

