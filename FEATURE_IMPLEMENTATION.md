# Scenario Comparison & Investor Pitch Deck Implementation

## Overview
Two major features have been implemented for the ROI Calculate application:
1. **Feature 3: Scenario Comparison Tool** - Create and compare project variants
2. **Feature 4: PDF Investor Pitch Deck Generator** - Professional multi-page pitch decks

## Feature 3: Scenario Comparison Tool

### Purpose
Allows users to create scenario variants of saved projects with different parameters and compare them side-by-side. For example, a user can save a "5-villa development" project, then create scenarios for "3-villa development" and "10-year hold strategy" to compare ROI, cash flow, and break-even across variants.

### User Journey

1. **View Saved Project** → Click "🔀 Create Scenario" button on ProjectCard
2. **Edit Parameters** → Modal opens with project inputs (can modify property price, rental income, investment term, etc.)
3. **Name Scenario** → Give it a name like "3 villas instead of 5"
4. **Auto-Calculate** → System automatically calculates new results
5. **Compare Scenarios** → On projects with scenarios, click "⚖️ Compare" button
6. **View Analysis** → Full scenario comparison page shows:
   - Baseline vs all created scenarios
   - Metrics table with deltas (differences)
   - Visual comparison charts (ROI, cash flow, break-even)
   - Winner badge highlighting best scenario
   - Comprehensive analysis summary

### Data Structure

```typescript
// Added to types/portfolio.ts
interface ProjectScenario {
  id: string;
  name: string; // "5 villas flip" or "3 villas hold"
  baseProjectId: string; // links to original project
  inputs: Record<string, any>; // all calculator inputs
  results: Record<string, any>; // calculated outputs
  createdAt: string;
  isBaseline: boolean;
}

// Extended PortfolioProject interface
interface PortfolioProject {
  // ... existing fields ...
  scenarios?: ProjectScenario[]; // array of scenario versions
}
```

### Files Created

1. **`src/hooks/useScenarios.ts`**
   - Manages scenario CRUD operations
   - `createScenario()` - Create new variant with inputs
   - `updateScenario()` - Modify existing scenario
   - `deleteScenario()` - Remove scenario
   - `calculateWinner()` - Determine best scenario based on composite scoring
   - `getScenarioComparison()` - Fetch selected scenarios for comparison

2. **`src/components/ScenarioCreator.tsx`**
   - Modal to create scenario variants
   - Displays key input fields for editing
   - Validates scenario name before creation
   - Shows change summary if inputs differ from baseline
   - Integrates with useScenarios hook

3. **`src/components/ScenarioComparatorTable.tsx`**
   - Side-by-side metrics table
   - Compares baseline + selected scenarios
   - Shows 4 key metrics: ROI%, Monthly Cash Flow, Break-Even, Investment
   - Highlights best values in green
   - Shows delta (difference from baseline) for each scenario
   - Mobile-responsive with overflow handling

4. **`src/components/ScenarioComparisonCharts.tsx`**
   - Visual charts using Recharts
   - ROI & Cash Flow bar chart comparison
   - Break-Even timeline bar chart
   - 10-Year projection line chart
   - Winner cards highlighting:
     - Best ROI scenario
     - Best Cash Flow scenario
     - Fastest Break-Even scenario

5. **`src/pages/ScenarioAnalysis.tsx`**
   - Full-page scenario comparison dashboard
   - Scenario selection UI (up to 4 scenarios)
   - Detailed comparison table
   - Visual analysis charts
   - Scenario management: rename, delete, reorder
   - Summary statistics
   - Overall winner badge with reasoning

### Files Modified

1. **`src/types/portfolio.ts`**
   - Added `ProjectScenario` interface
   - Extended `PortfolioProject` with `scenarios` array

2. **`src/hooks/usePortfolio.ts`**
   - Updated `updateProject()` to properly preserve scenarios when updating

3. **`src/components/ProjectCard.tsx`**
   - Added imports for ScenarioCreator and PitchDeckCustomizer
   - Added `onViewScenarios` prop for navigation
   - Added "🔀 Create Scenario" button
   - Added "📊 Pitch Deck" button
   - Added "⚖️ Compare" button (shows when scenarios exist)
   - Updated both full and compact views

4. **`src/pages/Portfolio.tsx`**
   - Added scenario view state management
   - Integrated ScenarioAnalysisPage component
   - Passes `onViewScenarios` handler to ProjectCard
   - Handles navigation between portfolio and scenario comparison

### Key Features

✅ **Create unlimited scenarios** - Each project can have multiple variants  
✅ **Side-by-side comparison** - Compare up to 4 scenarios at once  
✅ **Auto-calculation** - Results automatically calculated from inputs  
✅ **Visual analysis** - Charts showing ROI, cash flow, and timeline projections  
✅ **Delta metrics** - See differences from baseline at a glance  
✅ **Winner detection** - Automatically identifies best scenario  
✅ **Rename/delete** - Manage scenarios flexibly  
✅ **Persistent storage** - Scenarios saved in localStorage within project  
✅ **Mobile-friendly** - Responsive design for all screen sizes  

---

## Feature 4: PDF Investor Pitch Deck Generator

### Purpose
Generate professional, customizable investor pitch decks in PDF format. Takes project data and transforms it into a compelling 7-section presentation suitable for pitching to investors.

### User Journey

1. **View Project** → Click "📊 Pitch Deck" button on ProjectCard
2. **Customize (Optional)** → Modal opens with customization options:
   - Company name
   - Agent name, email, phone
   - Primary brand color
   - Section selection (toggles for each section)
3. **Preview** → See estimated page count and sections
4. **Download** → PDF automatically generated and downloaded

### PDF Sections (Customizable)

1. **Executive Summary** (1 page)
   - Deal headline with ROI
   - 4 key metrics in boxes
   - Risk rating (Low/Moderate/High)
   - Investment thesis summary

2. **Deal Highlights** (1 page)
   - Location & strategy
   - Investment structure
   - Revenue assumptions
   - Competitive advantages list

3. **Financial Projections** (1 page)
   - 5-year cash flow table
   - ROI calculation breakdown
   - Year-by-year projections
   - Cumulative cash flow tracking

4. **Market Analysis** (1 page)
   - Market overview
   - Comparable properties table (sample data)
   - Price per m² comparison
   - Your property vs market average analysis

5. **Risk Assessment** (1 page)
   - Investment score visualization (0-100)
   - Key risk factors with mitigation strategies
   - Sensitivity analysis placeholders
   - Professional risk rating

6. **Legal & Structure** (1 page)
   - Ownership structure options
   - Permits & licenses status
   - Tax treatment overview
   - Legal disclaimers

7. **Call to Action** (1 page)
   - Investment decision framework
   - 5-step process (Consultation → Closing)
   - Agent contact information
   - Expected timeline

### Files Created

1. **`src/utils/investorPitchDeckGenerator.ts`**
   - `generateInvestorPitchDeck()` function
   - Accepts project data and customization options
   - Generates 7-page professional PDF
   - White-label support with custom colors and branding
   - Section toggles (can include/exclude sections)
   - Uses jsPDF for PDF generation
   - Implements professional layouts with:
     - Header/footer on each page
     - Color-coded sections
     - Data-driven metrics
     - Professional typography
     - Proper spacing and alignment

2. **`src/components/PitchDeckCustomizer.tsx`**
   - Modal for pitch deck customization
   - Input fields for:
     - Company name
     - Agent details (name, email, phone)
     - Primary color (color picker + hex input)
   - Section toggles for each PDF section
   - Preview showing selected section count
   - Generates PDF with selected customizations
   - Toast notifications for success/error

### Files Modified

1. **`src/components/ProjectCard.tsx`**
   - Added PitchDeckCustomizer component integration
   - Added "📊 Pitch Deck" button to action buttons
   - Works in both full and compact card views

### Customization Options

```typescript
interface PitchDeckOptions {
  logo?: string; // URL or base64 (for future use)
  companyName?: string; // Branding
  primaryColor?: { r: number; g: number; b: number };
  secondaryColor?: { r: number; g: number; b: number };
  agentName?: string;
  agentEmail?: string;
  agentPhone?: string;
  sections?: { // Toggle each section on/off
    executiveSummary?: boolean;
    dealHighlights?: boolean;
    financialProjections?: boolean;
    marketAnalysis?: boolean;
    riskAssessment?: boolean;
    legalStructure?: boolean;
    callToAction?: boolean;
  };
}
```

### Key Features

✅ **Professional layout** - 7-section investor-ready presentation  
✅ **White-label support** - Custom branding, colors, agent info  
✅ **Customizable sections** - Toggle each section on/off  
✅ **Data-driven content** - Pulls all metrics from project  
✅ **Visual design** - Color-coded sections, professional typography  
✅ **Responsive PDF** - Works on all devices when printed  
✅ **Auto-download** - PDF saves automatically with project name  
✅ **Multi-page layout** - Proper headers, footers, page breaks  
✅ **Risk visualization** - Investment score graphic  
✅ **Financial tables** - Year-by-year projections  
✅ **Market analysis** - Comparable properties section  
✅ **Legal compliance** - Terms and disclaimers included  

---

## Integration Points

### UI Integration

**Portfolio Dashboard**
- ProjectCard now shows 3 new action buttons:
  - "🔀 Create Scenario" → Opens ScenarioCreator modal
  - "📊 Pitch Deck" → Opens PitchDeckCustomizer modal
  - "⚖️ Compare" → Navigates to ScenarioAnalysis page (if scenarios exist)

**Scenario Comparison Flow**
- User can toggle scenarios in selection UI
- Max 4 scenarios compared simultaneously
- Winner badge automatically calculated
- Rename/delete scenario options in hover menu

**Navigation**
- Back button on ScenarioAnalysis page returns to portfolio
- State management in Portfolio.tsx handles view transitions
- Seamless navigation between portfolio and scenario analysis

### Data Flow

```
ProjectCard
├── Create Scenario
│   └── ScenarioCreator (modal)
│       └── useScenarios.createScenario()
│           └── updateProject() [adds to scenarios array]
│
├── View Scenarios (if scenarios exist)
│   └── ScenarioAnalysisPage
│       ├── Select scenarios to compare
│       ├── ScenarioComparatorTable (metrics)
│       └── ScenarioComparisonCharts (visuals)
│
└── Download Pitch Deck
    └── PitchDeckCustomizer (modal)
        └── generateInvestorPitchDeck()
            └── Download PDF file
```

### Storage

All data persists in localStorage:
- `baliinvest_portfolio` - Contains all projects with nested scenarios array
- Each scenario stores: id, name, inputs, results, createdAt
- Updates to scenarios trigger Portfolio localStorage update

---

## Technical Details

### Dependencies Used

- **React** - UI framework
- **TypeScript** - Type safety (strict mode)
- **jsPDF** - PDF generation
- **Recharts** - Data visualization charts
- **uuid** - Unique ID generation

### Browser Compatibility

- Modern browsers (Chrome, Safari, Firefox, Edge)
- Mobile-friendly responsive design
- PDF generation supported in all modern browsers

### Performance Considerations

- Scenario creation is lightweight (no server calls)
- Chart rendering optimized with Recharts
- PDF generation is client-side (no server load)
- LocalStorage efficient for typical portfolio sizes (100+ projects)

### Future Enhancements

1. **Scenario Analysis**
   - Sensitivity analysis visualizations
   - Monte Carlo simulations for risk
   - Regression analysis for market impact

2. **Advanced Pitch Deck**
   - Logo upload/embedding
   - Custom section ordering
   - Section descriptions/notes
   - Photo/image embedding

3. **Collaboration Features**
   - Share scenarios with team
   - Comments on scenarios
   - Version history/rollback

4. **Integration Capabilities**
   - Export scenarios as Excel
   - Import scenarios from templates
   - Integration with investor databases

---

## Testing Checklist

✅ Scenario creation and naming  
✅ Parameter modification in scenarios  
✅ Automatic calculation and results  
✅ Comparison table rendering  
✅ Charts visualization  
✅ Winner badge calculation  
✅ Scenario deletion and rename  
✅ Persistent storage on page reload  
✅ Pitch deck customization  
✅ PDF generation and download  
✅ White-label customization  
✅ Mobile responsiveness  
✅ Error handling  
✅ Empty state handling  
✅ Navigation between views  

---

## Usage Examples

### Creating a Scenario

```typescript
// 1. Click "🔀 Create Scenario" on ProjectCard
// 2. Enter scenario name: "Lower investment option - 3 villas"
// 3. Modify inputs in modal (e.g., change property count from 5 to 3)
// 4. Click "Create Scenario"
// 5. System auto-calculates new results
```

### Comparing Scenarios

```typescript
// 1. Project now shows "⚖️ Compare" button
// 2. Click to navigate to ScenarioAnalysis page
// 3. Select up to 4 scenarios to compare
// 4. View:
//    - Detailed metrics table with deltas
//    - Visual comparison charts
//    - Winner badge with top scenario
//    - Year-by-year projections
```

### Generating Pitch Deck

```typescript
// 1. Click "📊 Pitch Deck" on ProjectCard
// 2. Optional: Customize in modal
//    - Change company name
//    - Set brand color
//    - Toggle sections on/off
//    - Enter agent info
// 3. Click "Download PDF"
// 4. PDF automatically generated and downloaded
```

---

## Summary

These two features significantly enhance the ROI Calculate application by enabling:

1. **Scenario Analysis** - Users can test different investment strategies without modifying originals
2. **Professional Presentations** - Generate investor-ready pitch decks with one click
3. **Data-Driven Decisions** - Visual comparison tools help identify best scenarios
4. **White-Label Support** - Customizable branding for agents/companies

Both features are fully integrated, persistent, and mobile-responsive.
