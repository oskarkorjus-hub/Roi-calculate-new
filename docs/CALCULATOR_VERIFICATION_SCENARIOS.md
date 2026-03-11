# Calculator Verification Scenarios

## Two-Way Testing Document

This document contains test scenarios with **input values** and **expected results** for all 13 calculators.

**How to use:**
1. Enter the exact input values shown
2. Compare your results with the expected values
3. Results should match within 1-2% tolerance (due to rounding)

---

## 1. Mortgage Calculator

### Scenario 1A: Standard 30-Year Mortgage
**Inputs:**
| Field | Value |
|-------|-------|
| Loan Amount | $300,000 |
| Interest Rate | 6.5% |
| Loan Term | 30 years |

**Hand Calculation:**
```
Monthly Rate (r) = 6.5% / 12 = 0.005417
Number of Payments (n) = 30 × 12 = 360

Monthly Payment = P × [r(1+r)^n] / [(1+r)^n - 1]
                = 300,000 × [0.005417 × (1.005417)^360] / [(1.005417)^360 - 1]
                = 300,000 × [0.005417 × 6.9913] / [6.9913 - 1]
                = 300,000 × 0.03787 / 5.9913
                = 300,000 × 0.006321
                = $1,896.20
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| Monthly Payment (P+I) | $1,896.20 |
| Total of All Payments | $682,632 |
| Total Interest Paid | $382,632 |

---

### Scenario 1B: 15-Year Mortgage
**Inputs:**
| Field | Value |
|-------|-------|
| Loan Amount | $250,000 |
| Interest Rate | 5.5% |
| Loan Term | 15 years |

**Hand Calculation:**
```
r = 5.5% / 12 = 0.00458333...
n = 15 × 12 = 180

(1 + r)^180 = (1.00458333)^180 = 2.2774

Monthly Payment = 250,000 × [0.004583 × 2.2774] / [2.2774 - 1]
                = 250,000 × 0.01044 / 1.2774
                = 250,000 × 0.008172
                = $2,043.00
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| Monthly Payment (P+I) | $2,043 |
| Total of All Payments | $367,740 |
| Total Interest Paid | $117,740 |

---

### Scenario 1C: Mortgage with Advanced Options (PITI + HOA)
**Inputs:**
| Field | Value |
|-------|-------|
| Loan Amount | $400,000 |
| Interest Rate | 7% |
| Loan Term | 30 years |
| **Advanced Options:** | |
| Property Tax Rate | 1.2% |
| Home Insurance (Annual) | $1,800 |
| HOA (Monthly) | $350 |
| PMI | $0 |

**Hand Calculation:**
```
STEP 1: Calculate Base P+I Payment
r = 7% / 12 = 0.00583333
n = 30 × 12 = 360
(1 + r)^360 = (1.00583333)^360 = 8.1165

Monthly P+I = 400,000 × [0.005833 × 8.1165] / [8.1165 - 1]
            = 400,000 × 0.04735 / 7.1165
            = 400,000 × 0.006653
            = $2,661.21

STEP 2: Calculate Monthly Property Tax
Annual Property Tax = $400,000 × 1.2% = $4,800
Monthly Property Tax = $4,800 / 12 = $400.00

STEP 3: Calculate Monthly Insurance
Monthly Insurance = $1,800 / 12 = $150.00

STEP 4: HOA
Monthly HOA = $350.00

STEP 5: Total Monthly Payment (PITI + HOA)
Total = P+I + Tax + Insurance + HOA
      = $2,661 + $400 + $150 + $350
      = $3,561
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| Monthly P+I | $2,661 |
| Monthly Property Tax | $400 |
| Monthly Insurance | $150 |
| Monthly HOA | $350 |
| **Total Monthly Payment** | **$3,561** |
| Total Interest (30yr) | ~$558,000 |

---

## 2. Cap Rate Calculator

### Scenario 2A: Residential Rental Property
**Inputs:**
| Field | Value |
|-------|-------|
| Property Value | $500,000 |
| Monthly Rental Income | $3,500 |
| Vacancy Rate | 5% |
| Annual Operating Expenses | $8,000 |

**Hand Calculation:**
```
Gross Annual Income = $3,500 × 12 = $42,000
Vacancy Loss = $42,000 × 5% = $2,100
Effective Gross Income = $42,000 - $2,100 = $39,900
NOI = $39,900 - $8,000 = $31,900

Cap Rate = NOI / Property Value × 100
         = $31,900 / $500,000 × 100
         = 6.38%
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| Gross Annual Income | $42,000 |
| Net Operating Income (NOI) | $31,900 |
| Cap Rate | 6.38% |

---

### Scenario 2B: Commercial Property
**Inputs:**
| Field | Value |
|-------|-------|
| Property Value | $1,200,000 |
| Monthly Rental Income | $10,000 |
| Vacancy Rate | 8% |
| Annual Operating Expenses | $25,000 |

**Hand Calculation:**
```
Gross Annual Income = $10,000 × 12 = $120,000
Vacancy Loss = $120,000 × 8% = $9,600
Effective Gross Income = $120,000 - $9,600 = $110,400
NOI = $110,400 - $25,000 = $85,400

Cap Rate = $85,400 / $1,200,000 × 100 = 7.12%
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| Cap Rate | 7.12% |
| NOI | $85,400 |

---

## 3. IRR Calculator

### Scenario 3A: Simple Investment
**Inputs:**
| Year | Cash Flow |
|------|-----------|
| 0 | -$100,000 |
| 1 | +$30,000 |
| 2 | +$40,000 |
| 3 | +$50,000 |

**Hand Calculation (using trial and error / Newton-Raphson):**
```
Find rate r where: -100,000 + 30,000/(1+r) + 40,000/(1+r)² + 50,000/(1+r)³ = 0

At r = 10%:
NPV = -100,000 + 27,273 + 33,058 + 37,566 = -2,103 (slightly negative)

At r = 9%:
NPV = -100,000 + 27,523 + 33,670 + 38,609 = -198 (close to zero)

IRR ≈ 8.9% to 9.5%
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| IRR | ~9% to 11% |
| NPV at 10% | ~-$2,100 |

---

### Scenario 3B: Real Estate Flip
**Inputs:**
| Year | Cash Flow |
|------|-----------|
| 0 | -$200,000 |
| 1 | +$50,000 |
| 2 | +$300,000 |

**Hand Calculation:**
```
At r = 25%:
NPV = -200,000 + 50,000/1.25 + 300,000/1.5625
    = -200,000 + 40,000 + 192,000 = 32,000 (positive)

At r = 35%:
NPV = -200,000 + 50,000/1.35 + 300,000/1.8225
    = -200,000 + 37,037 + 164,609 = 1,646 (close)

IRR ≈ 35-36%
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| IRR | ~35-36% |

---

## 4. NPV Calculator

### Scenario 4A: Investment with 10% Discount Rate
**Inputs:**
| Field | Value |
|-------|-------|
| Discount Rate | 10% |
| Year 0 | -$100,000 |
| Year 1 | +$40,000 |
| Year 2 | +$45,000 |
| Year 3 | +$50,000 |

**Hand Calculation:**
```
NPV = -100,000 + 40,000/(1.10) + 45,000/(1.10)² + 50,000/(1.10)³
    = -100,000 + 36,364 + 37,190 + 37,566
    = +$11,120
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| NPV at 10% | $11,120 |
| Profitability Index | 1.11 |

---

### Scenario 4B: Higher Discount Rate
**Inputs:**
| Field | Value |
|-------|-------|
| Discount Rate | 15% |
| Year 0 | -$100,000 |
| Year 1 | +$40,000 |
| Year 2 | +$45,000 |
| Year 3 | +$50,000 |

**Hand Calculation:**
```
NPV = -100,000 + 40,000/(1.15) + 45,000/(1.15)² + 50,000/(1.15)³
    = -100,000 + 34,783 + 34,026 + 32,876
    = +$1,685
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| NPV at 15% | $1,685 |

---

## 5. XIRR Calculator

### Scenario 5A: Property Purchase and Sale (IDR)
**Inputs:**
| Field | Value |
|-------|-------|
| Total Price | Rp 500,000,000 (500M) |
| Payment Type | Full Payment (100% upon signing) |
| Projected Sales Price | Rp 650,000,000 (650M) |
| Closing Cost | 0% |

**Hand Calculation:**
```
Investment = Rp 500,000,000
Sale Proceeds = Rp 650,000,000
Net Profit = 650M - 500M = Rp 150,000,000

Simple ROI = 150M / 500M × 100 = 30%

XIRR depends on holding period:
- 1 year hold: XIRR ≈ 30%
- 2 year hold: XIRR ≈ 14%
- 3 year hold: XIRR ≈ 9%
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| Total Invested | Rp 500,000,000 |
| Net Profit | Rp 150,000,000 |
| XIRR | Depends on dates |

---

### Scenario 5B: With Closing Costs
**Inputs:**
| Field | Value |
|-------|-------|
| Total Price | Rp 500,000,000 |
| Payment Type | Full Payment |
| Projected Sales Price | Rp 650,000,000 |
| Closing Cost | 5% |

**Hand Calculation:**
```
Investment = Rp 500,000,000
Sale Proceeds = 650M - (650M × 5%) = 650M - 32.5M = Rp 617,500,000
Net Profit = 617.5M - 500M = Rp 117,500,000
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| Net Profit | Rp 117,500,000 |

---

## 6. Rental ROI Calculator (10-Year)

### Scenario 6A: Villa Rental (IDR)
**Inputs:**
| Field | Value |
|-------|-------|
| Initial Capex | Rp 5,000,000,000 (5B) |
| Keys (Units) | 2 |
| Occupancy Rate | 70% |
| ADR (Average Daily Rate) | Rp 1,600,000 |

**Hand Calculation:**
```
Annual Room Revenue = Keys × 365 × Occupancy × ADR
                    = 2 × 365 × 0.70 × 1,600,000
                    = 2 × 255.5 × 1,600,000
                    = 511 × 1,600,000
                    = Rp 817,600,000 per year

10-Year Gross Revenue = 817.6M × 10 = Rp 8,176,000,000 (8.176B)

Annualized Net Yield = Annual Revenue / Investment × 100
                     = 817.6M / 5,000M × 100
                     = 16.35%
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| 10Y Gross Potential | Rp 8,176,000,000 (8.176B) |
| Annualized Net Yield | ~16.35% |
| Avg Annual Cash Flow | ~Rp 817,600,000 |

---

### Scenario 6B: Lower Investment, Same Revenue
**Inputs:**
| Field | Value |
|-------|-------|
| Initial Capex | Rp 3,000,000,000 (3B) |
| Keys (Units) | 2 |
| Occupancy Rate | 70% |
| ADR | Rp 1,600,000 |

**Hand Calculation:**
```
Same revenue: Rp 817,600,000/year

Annualized Net Yield = 817.6M / 3,000M × 100 = 27.25%
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| Annualized Net Yield | ~27.25% |

---

## 7. Cash Flow Projector

### Scenario 7A: Rental Property Cash Flow
**Inputs:**
| Field | Value |
|-------|-------|
| Monthly Rental Income | $5,000 |
| Vacancy Rate | 10% |
| Projection Years | 5 |
| Monthly Maintenance | $500 |
| Monthly Property Tax | $300 |
| Monthly Insurance | $200 |
| Monthly Utilities | $100 |
| Other Expenses | $0 |

**Hand Calculation (Year 1):**
```
Gross Annual Income = $5,000 × 12 = $60,000
Vacancy Loss = $60,000 × 10% = $6,000
Effective Income = $60,000 - $6,000 = $54,000

Monthly Expenses = $500 + $300 + $200 + $100 + $0 = $1,100
Annual Expenses = $1,100 × 12 = $13,200

Year 1 Net Cash Flow = $54,000 - $13,200 = $40,800
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| Year 1 Gross Income | $60,000 |
| Year 1 Vacancy Loss | $6,000 |
| Year 1 Expenses | $13,200 |
| Year 1 Net Cash Flow | $40,800 |

---

### Scenario 7B: With 5% Annual Growth
**Inputs:** Same as 7A, plus:
| Field | Value |
|-------|-------|
| Annual Income Growth | 5% |

**Hand Calculation (Year 3):**
```
Year 3 Gross = $60,000 × (1.05)² = $60,000 × 1.1025 = $66,150
Year 3 Effective = $66,150 × 0.90 = $59,535
Year 3 Net CF = $59,535 - $13,200 = $46,335
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| Year 3 Net Cash Flow | ~$46,335 |

---

## 8. Development Feasibility

### Scenario 8A: Villa Development Project (IDR)
**Inputs:**
| Field | Value |
|-------|-------|
| Land Size | 500 m² |
| Land Cost | Rp 500,000,000 (500M) |
| Permits & Legal | Rp 50,000,000 (50M) |
| Number of Villas | 2 |
| Average Villa Size | 100 m² |
| Construction Cost per m² | Rp 5,000,000 |
| Sale Price per Villa | Rp 750,000,000 (750M) |

**Hand Calculation:**
```
Total Construction Area = 2 × 100 = 200 m²
Construction Cost = 200 × 5,000,000 = Rp 1,000,000,000 (1B)

Total Project Cost = Land + Permits + Construction
                   = 500M + 50M + 1B
                   = Rp 1,550,000,000 (1.55B)

Revenue from Sale = 2 × 750M = Rp 1,500,000,000 (1.5B)

Gross Profit = 1.5B - 1.55B = -Rp 50,000,000 (LOSS)
ROI = -50M / 1.55B × 100 = -3.2%
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| Total Project Cost | Rp 1,550,000,000 |
| Revenue | Rp 1,500,000,000 |
| Gross Profit | -Rp 50,000,000 (Loss) |
| Flip ROI | -3.2% |

---

### Scenario 8B: Profitable Development
**Inputs:**
| Field | Value |
|-------|-------|
| Land Cost | Rp 300,000,000 (300M) |
| Permits | Rp 30,000,000 (30M) |
| Number of Villas | 2 |
| Villa Size | 100 m² |
| Construction Cost/m² | Rp 4,000,000 |
| Sale Price/Villa | Rp 600,000,000 (600M) |

**Hand Calculation:**
```
Construction = 200 × 4M = 800M
Total Cost = 300M + 30M + 800M = 1,130M (1.13B)
Revenue = 2 × 600M = 1,200M (1.2B)
Profit = 1.2B - 1.13B = 70M
ROI = 70M / 1.13B × 100 = 6.2%
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| Total Cost | Rp 1,130,000,000 |
| Profit | Rp 70,000,000 |
| Flip ROI | ~6.2% |

---

## 9. Indonesia Tax Optimizer

### Scenario 9A: Property Sale with Capital Gain (IDR)
**Inputs:**
| Field | Value |
|-------|-------|
| Purchase Price | Rp 5,000,000,000 (5B) |
| Holding Period | 5 years |
| Sale Price | Rp 7,000,000,000 (7B) |

**Hand Calculation:**
```
Capital Gain = Sale - Purchase = 7B - 5B = Rp 2,000,000,000 (2B)

Indonesia Property Tax (BPHTB): 2.5% of sale price (final tax)
Tax = 7B × 2.5% = Rp 175,000,000

Net Proceeds = 7B - 175M = 6,825,000,000
Net Profit = 6.825B - 5B = Rp 1,825,000,000

Effective Tax Rate on Gain = 175M / 2B × 100 = 8.75%
Net ROI = 1.825B / 5B × 100 = 36.5%
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| Capital Gain | Rp 2,000,000,000 |
| Tax (2.5% BPHTB) | Rp 175,000,000 |
| Effective Rate on Gain | ~8.75% |
| Net ROI | ~36.5% |

---

## 10. Financing Comparison

### Scenario 10A: Bank Loan Comparison
**Inputs:**
| Field | Value |
|-------|-------|
| Property Value | $500,000 |
| Down Payment | 20% |
| Loan 1 Interest Rate | 7% |
| Loan 1 Term | 30 years |

**Hand Calculation:**
```
Loan Amount = $500,000 × (1 - 20%) = $400,000

Monthly Rate = 7% / 12 = 0.005833
Payments = 30 × 12 = 360

(1 + r)^n = (1.005833)^360 = 8.1167

Monthly Payment = 400,000 × [0.005833 × 8.1167] / [8.1167 - 1]
                = 400,000 × 0.04735 / 7.1167
                = 400,000 × 0.006653
                = $2,661.21

Total Payments = $2,661.21 × 360 = $958,036
Total Interest = $958,036 - $400,000 = $558,036
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| Loan Amount | $400,000 |
| Monthly Payment | $2,661 |
| Total Interest | ~$558,000 |
| Total Cost | ~$958,000 |

---

### Scenario 10B: Compare with 15-Year Term
**Inputs:** Same property, but:
| Field | Value |
|-------|-------|
| Loan 2 Term | 15 years |
| Loan 2 Interest Rate | 6.5% |

**Hand Calculation:**
```
r = 6.5% / 12 = 0.005417
n = 180

Monthly Payment = 400,000 × [0.005417 × 2.655] / [2.655 - 1]
                = 400,000 × 0.01438 / 1.655
                = 400,000 × 0.008689
                = $3,475.73

Total Interest = ($3,475.73 × 180) - $400,000 = $225,631
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| Monthly Payment | ~$3,476 |
| Total Interest | ~$225,600 |
| Interest Savings vs 30yr | ~$332,000 |

---

## 11. Rental Income Projection

### Scenario 11A: Vacation Rental (IDR)
**Inputs:**
| Field | Value |
|-------|-------|
| Property Size | 150 m² |
| Base Nightly Rate | Rp 1,500,000 |
| Monthly Operating Expenses | Rp 5,000,000 |
| Projection Period | 1 year |
| Base Occupancy Rate | 70% |
| Average Stay Length | 3 nights |

**Hand Calculation:**
```
Days per Year = 365
Occupied Nights = 365 × 70% = 255.5 ≈ 256 nights

Gross Revenue = 256 × 1,500,000 = Rp 384,000,000

Annual Expenses = 5,000,000 × 12 = Rp 60,000,000

Net Income = 384M - 60M = Rp 324,000,000
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| Occupied Nights | ~256 |
| Gross Annual Revenue | ~Rp 384,000,000 |
| Annual Expenses | Rp 60,000,000 |
| Net Income | ~Rp 324,000,000 |

---

## 12. Development Budget Tracker

### Scenario 12A: Budget vs Actual Tracking (IDR)
**Inputs:**
| Category | Budgeted | Actual |
|----------|----------|--------|
| Land | Rp 1,000,000,000 | Rp 1,100,000,000 |
| Construction | Rp 500,000,000 | Rp 550,000,000 |
| Soft Costs | Rp 100,000,000 | Rp 100,000,000 |
| Contingency | Rp 100,000,000 | Rp 60,000,000 |

**Hand Calculation:**
```
Total Budgeted = 1B + 500M + 100M + 100M = Rp 1,700,000,000
Total Actual = 1.1B + 550M + 100M + 60M = Rp 1,810,000,000

Variance = 1.81B - 1.7B = Rp 110,000,000 (OVER)
Variance % = 110M / 1.7B × 100 = 6.47%

Contingency Used = 60M / 100M × 100 = 60%

Health Score Calculation:
- Start: 100
- Variance penalty: -min(6.47 × 2, 30) = -12.94
- Contingency penalty (>50%): -(60-50)/2 = -5
- No delayed phases: -0
- Health Score = 100 - 12.94 - 5 = 82.06 ≈ 82%
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| Total Budgeted | Rp 1,700,000,000 |
| Total Actual | Rp 1,810,000,000 |
| Variance | +6.47% |
| Contingency Used | 60% |
| Health Score | ~82% |

---

## 13. Risk Assessment

### Scenario 13A: Low Risk Investment
**Inputs:**
| Field | Value |
|-------|-------|
| Project ROI | 25% |
| Break-even Months | 10 |
| DSCR | 2.0 |
| Leverage Ratio | 0.3 (30%) |
| Avg Occupancy | 80% |

**Hand Calculation (Points System):**
```
ROI ≥ 20%: 0 points (excellent)
Break-even < 12 months: 0 points (quick payback)
DSCR ≥ 1.5: 0 points (strong coverage)
Leverage < 50%: 0 points (low debt)
Occupancy ≥ 75%: 0 points (high occupancy)

Total Risk Score = 0 + 0 + 0 + 0 + 0 = 0 points (minimum)
Note: Base score may start higher due to other factors
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| Risk Score | < 30 points |
| Rating | Low Risk |

---

### Scenario 13B: High Risk Investment
**Inputs:**
| Field | Value |
|-------|-------|
| Project ROI | 3% |
| Break-even Months | 60 |
| DSCR | 0.5 |
| Leverage Ratio | 0.9 (90%) |
| Avg Occupancy | 20% |

**Hand Calculation:**
```
ROI < 5%: 20 points (poor)
Break-even > 36 months: 15 points (very long)
DSCR < 1.0: 15 points (weak coverage)
Leverage > 80%: 15 points (very high debt)
Occupancy < 45%: 15 points (very low)

Total = 20 + 15 + 15 + 15 + 15 = 80 points
```

**Expected Results:**
| Metric | Expected Value |
|--------|----------------|
| Risk Score | > 60 points |
| Rating | High Risk |

---

## Summary Checklist

| Calculator | Scenario | Key Verification |
|------------|----------|------------------|
| Mortgage | 30yr $300K @ 6.5% | Payment = $1,896.20 |
| Cap Rate | $500K, $3.5K/mo rent | Cap Rate = 6.38% |
| IRR | -100K, +30K, +40K, +50K | IRR ≈ 9-11% |
| NPV | Same CFs @ 10% | NPV = $11,120 |
| XIRR | 500M buy, 650M sell | Profit = 150M (0% closing) |
| Rental ROI | 5B, 2 keys, 70%, 1.6M ADR | Yield = 16.35% |
| Cash Flow | $5K/mo, 10% vacancy | Net CF = $40,800/yr |
| Dev Feasibility | Cost 1.13B, Revenue 1.2B | ROI = 6.2% |
| Indonesia Tax | 5B buy, 7B sell | Tax = 175M (2.5%) |
| Financing | $400K @ 7%, 30yr | Payment = $2,661 |
| Rental Projection | 1.5M/night, 70% occ | Revenue = 384M/yr |
| Dev Budget | 1.7B budget, 1.81B actual | Variance = +6.47% |
| Risk Assessment | High risk inputs | Score > 60 |

---

*Document Version: 1.0*
*Created: March 2026*
*Use these scenarios to verify calculator accuracy through two-way testing.*
