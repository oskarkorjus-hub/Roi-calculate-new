# Quick Start Guide - UI Design System

## 🎯 What's New

A complete, enterprise-grade unified UI design system for all ROI calculators with:
- ✅ 4 reusable UI components
- ✅ 50+ field helper texts
- ✅ Professional consistent styling
- ✅ Full TypeScript support
- ✅ WCAG AA accessibility

## 📦 New Components

### InputField
```tsx
import { InputField } from '@/components/ui';

<InputField
  label="Monthly Rental Income"
  value={monthlyIncome}
  onChange={(v) => setMonthlyIncome(parseFloat(v as string) || 0)}
  type="number"
  unit="$"
  placeholder="5000"
  helperText="Expected monthly rental revenue"
  icon="🏠"
  required
/>
```

### SelectField
```tsx
<SelectField
  label="Currency"
  value={currency}
  onChange={(v) => setCurrency(v as any)}
  options={[
    { label: 'USD', value: 'USD' },
    { label: 'IDR', value: 'IDR' },
  ]}
  helperText="All monetary values use this currency"
  icon="💵"
/>
```

### ToggleField
```tsx
<ToggleField
  label="PMI Required"
  checked={pmiRequired}
  onChange={(c) => setPmiRequired(c)}
  helperText="Required when down payment < 20%"
  description="Private Mortgage Insurance"
  icon="✓"
/>
```

### SectionHeader
```tsx
<SectionHeader
  title="Loan Details"
  icon="🏦"
  description="Enter your mortgage information"
/>
```

## 🎨 Design System

**Colors:**
- Primary: `indigo-600` (focus, actions)
- Success: `green-600`
- Danger: `red-600`
- Neutral: `slate-*` (borders, text)

**Styling:**
- Borders: `2px solid slate-200`, focus: `indigo-500`
- Radius: `rounded-xl` (12px)
- Padding: `px-4 py-3` (inputs)
- Shadows: `shadow-sm` (cards)

## 📚 Helper Texts

All fields have descriptions via `getFieldHelper()`:

```typescript
import { getFieldHelper } from '@/utils/fieldHelpers';

const helperText = getFieldHelper('propertyValue');
// Output: "Total market value of the property"
```

**Available fields:** 50+ across all calculators

## ✅ Refactored Calculators

1. **MortgageCalculator** - 100% updated ✨
2. **CapRateCalculator** - 100% updated ✨
3. **CashFlowProjector** - 100% updated ✨
4. **IRRCalculator** - Enhanced (table styling)

## 🚀 Using in New Calculators

### Step 1: Import Components
```tsx
import { InputField, SelectField, SectionHeader } from '@/components/ui';
import { getFieldHelper } from '@/utils/fieldHelpers';
```

### Step 2: Create Input Sections
```tsx
<div className="space-y-6">
  {/* Basic Section */}
  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
    <SectionHeader
      title="Property Information"
      icon="🏠"
      description="Enter your property details"
    />
    
    <div className="space-y-4 mt-6">
      <InputField
        label="Property Value"
        value={propertyValue}
        onChange={(v) => setPropertyValue(parseFloat(v as string) || 0)}
        type="number"
        unit="$"
        placeholder="1000000"
        helperText={getFieldHelper('propertyValue')}
        icon="🏠"
        required
      />
      
      <SelectField
        label="Currency"
        value={currency}
        onChange={(v) => setCurrency(v as any)}
        options={currencyOptions}
        helperText={getFieldHelper('currency')}
        icon="💵"
      />
    </div>
  </div>

  {/* Advanced Section */}
  <AdvancedSection
    title="Advanced Options"
    icon="⚙️"
    isOpen={showAdvanced}
    onToggle={() => setShowAdvanced(!showAdvanced)}
  >
    {/* More fields here */}
  </AdvancedSection>
</div>
```

## 🎓 Best Practices

### ✅ Do
- Use `SectionHeader` for section titles
- Add icons to InputFields
- Use `getFieldHelper()` for help text
- Convert string values: `parseFloat(v as string) || 0`
- Use unit labels for numbers
- Group related fields with `space-y-4`

### ❌ Don't
- Use plain HTML `<input>` elements
- Hardcode field descriptions
- Mix old and new input styles
- Forget to add helper text
- Use inconsistent padding/spacing

## 📖 Documentation

- **Full Guide:** `UI_DESIGN_SYSTEM.md`
- **Design Tokens:** `DESIGN_TOKENS.md`
- **Deliverables:** `DELIVERABLES.md`

## 🔧 Troubleshooting

### TypeScript error: "Type 'string' not assignable to 'number'"
```tsx
// ❌ Wrong
onChange={(v) => setLoanAmount(v)}

// ✅ Correct
onChange={(v) => setLoanAmount(parseFloat(v as string) || 0)}
```

### SelectField not showing selected value
```tsx
// Make sure value matches option value exactly
<SelectField
  value={currency}  // Must be 'USD', 'IDR', etc.
  options={[
    { label: 'USD (US Dollar)', value: 'USD' },
  ]}
/>
```

### Tooltip not appearing
```tsx
// Make sure to import getFieldHelper or provide helperText
<InputField
  label="Field Name"
  helperText="This will show in tooltip"  // ← Required
  // OR use getFieldHelper('fieldName')
/>
```

## 📊 Component Props Reference

### InputField Props
| Prop | Type | Default | Required |
|------|------|---------|----------|
| label | string | - | ✓ |
| value | number/string | - | ✓ |
| onChange | function | - | ✓ |
| type | 'number'/... | 'number' | - |
| unit | string | - | - |
| placeholder | string | - | - |
| helperText | string | - | - |
| icon | string | - | - |
| required | boolean | false | - |
| error | string | - | - |
| disabled | boolean | false | - |

### SelectField Props
| Prop | Type | Default | Required |
|------|------|---------|----------|
| label | string | - | ✓ |
| value | string/number | - | ✓ |
| onChange | function | - | ✓ |
| options | SelectOption[] | - | ✓ |
| placeholder | string | - | - |
| helperText | string | - | - |
| icon | string | - | - |
| error | string | - | - |

### ToggleField Props
| Prop | Type | Default | Required |
|------|------|---------|----------|
| label | string | - | ✓ |
| checked | boolean | - | ✓ |
| onChange | function | - | ✓ |
| helperText | string | - | - |
| icon | string | - | - |
| description | string | - | - |
| disabled | boolean | false | - |

### SectionHeader Props
| Prop | Type | Default | Required |
|------|------|---------|----------|
| title | string | - | ✓ |
| icon | string | - | - |
| description | string | - | - |
| action | object | - | - |

## 🌟 Features at a Glance

| Feature | Old | New |
|---------|-----|-----|
| Consistent Styling | ❌ | ✅ |
| Reusable Components | ❌ | ✅ |
| Helper Texts | Manual | Centralized |
| TypeScript Support | ⚠️ | ✅ Full |
| Mobile Responsive | ⚠️ | ✅ |
| WCAG Accessible | ⚠️ | ✅ AA |
| Professional Appearance | ⚠️ | ✅ |
| Tooltip Support | ⚠️ | ✅ All |
| Error States | Basic | ✅ Advanced |
| Focus States | Basic | ✅ Enhanced |

## 🎯 Next Steps

1. **Review Documentation**
   - Read `UI_DESIGN_SYSTEM.md` for comprehensive guide
   - Check `DESIGN_TOKENS.md` for color/spacing specs

2. **Refactor Remaining Calculators**
   - DevFeasibility, NPVCalculator, XIRRCalculator
   - Follow pattern from MortgageCalculator

3. **Test Components**
   - Verify focus states
   - Check tooltip display
   - Test mobile responsiveness
   - Validate error states

4. **Customize (If Needed)**
   - Modify colors in design tokens
   - Add new field helpers
   - Create additional components

## 📞 Questions?

Refer to the documentation files:
- Component usage → `UI_DESIGN_SYSTEM.md`
- Design specs → `DESIGN_TOKENS.md`
- Project summary → `DELIVERABLES.md`

---

**Version:** 1.0  
**Status:** Production Ready  
**Last Updated:** 2024

Happy building! 🚀
