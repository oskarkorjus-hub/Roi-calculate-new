# Design Tokens & Visual Specifications

## Color Palette

### Primary Colors
| Token | Color | Hex | Usage |
|-------|-------|-----|-------|
| Primary | Indigo | `#4F46E5` | Focus states, primary actions |
| Primary Light | Indigo 500 | `#6366F1` | Hover states |
| Primary Dark | Indigo 700 | `#4338CA` | Active/pressed states |

### Status Colors
| Token | Color | Hex | Usage |
|-------|-------|-----|-------|
| Success | Green 600 | `#16A34A` | Positive values, confirmations |
| Warning | Amber 600 | `#D97706` | Warnings, caution states |
| Danger | Red 600 | `#DC2626` | Errors, invalid inputs |

### Neutral Colors (Slate)
| Token | Color | Usage |
|-------|-------|-------|
| `slate-50` | Very light gray | Backgrounds (disabled, hover) |
| `slate-100` | Light gray | Borders, separators |
| `slate-200` | Medium light gray | Input borders (default) |
| `slate-300` | Medium gray | Dividers, secondary borders |
| `slate-400` | Medium gray | Secondary text, placeholder |
| `slate-600` | Dark gray | Body text, help text |
| `slate-700` | Very dark gray | Secondary labels |
| `slate-900` | Near black | Primary text, labels |

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### Font Sizes
| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 12px | 16px | Help text, captions |
| `text-sm` | 14px | 20px | Body text, labels |
| `text-base` | 16px | 24px | Default, body |
| `text-lg` | 18px | 28px | Section titles |
| `text-2xl` | 24px | 32px | Card headers |
| `text-3xl` | 30px | 36px | Page headers |

### Font Weights
| Token | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Input values |
| `font-semibold` | 600 | Labels, section titles |
| `font-bold` | 700 | Emphasis, important values |

### Text Color Classes
```
text-slate-400  - Placeholder text
text-slate-600  - Helper/secondary text
text-slate-700  - Secondary labels
text-slate-900  - Primary text, labels

text-green-600  - Success states
text-red-600    - Errors
text-amber-600  - Warnings
```

## Spacing Scale

### Base Unit: 4px (Tailwind Default)

| Token | Pixels | Usage |
|-------|--------|-------|
| `p-1` | 4px | Tight spacing |
| `p-2` | 8px | Small padding |
| `p-3` | 12px | Medium padding |
| `p-4` | 16px | Default padding |
| `p-6` | 24px | Section padding |
| `px-4 py-3` | 16px / 12px | Input padding (standard) |
| `gap-2` | 8px | Tight gaps |
| `gap-4` | 16px | Default gaps |
| `gap-6` | 24px | Large gaps |
| `space-y-2` | 8px vertical | Label + input gap |
| `space-y-4` | 16px vertical | Field group gap |
| `space-y-6` | 24px vertical | Section gap |

## Border Radius

| Token | Pixels | Usage |
|-------|--------|-------|
| `rounded-lg` | 8px | Alternative |
| `rounded-xl` | 12px | **Standard for inputs & cards** |
| `rounded-2xl` | 16px | Large elements |
| `rounded-full` | 999px | Pills, toggle switches |

## Shadows

### Drop Shadows
```css
/* sm - Subtle */
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

/* Default - Standard */
box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
box-shadow: 0 1px 2px -1px rgba(0, 0, 0, 0.1);

/* md - Prominent */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
box-shadow: 0 2px 4px -2px rgba(0, 0, 0, 0.1);

/* lg - Emphasized */
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
box-shadow: 0 4px 6px -4px rgba(0, 0, 0, 0.1);

/* xl - Strong */
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
box-shadow: 0 8px 10px -6px rgba(0, 0, 0, 0.1);
```

### Shadow Classes Used
| Element | Shadow |
|---------|--------|
| Cards, sections | `shadow-sm` |
| Dropdown menus | `shadow-lg` |
| Modals, overlays | `shadow-xl` |
| Tooltips | `shadow-lg` |

## Input Field Styling

### Default State
```css
border: 2px solid #E2E8F0 (slate-200)
background: white
color: #1E293B (slate-900)
border-radius: 12px (rounded-xl)
padding: 12px 16px (py-3 px-4)
font--weight: 500 (font-medium)
transition: all 0.2s ease
```

### Focus State
```css
border: 2px solid #4F46E5 (indigo-500)
ring: 4px rgba(79, 70, 229, 0.1) (ring-4 ring-indigo-500/10)
outline: none
box-shadow: inset 0 1px 2px rgba(0,0,0,0.05)
```

### Error State
```css
border: 2px solid #DC2626 (red-500)
ring: 4px rgba(220, 38, 38, 0.1) (ring-4 ring-red-500/10)
background: white (or #FEF2F2 if selected)
```

### Disabled State
```css
border: 2px solid #E2E8F0 (slate-200)
background: #F1F5F9 (slate-50)
color: #94A3B8 (slate-500)
cursor: not-allowed
opacity: 1
pointer-events: none
```

### Placeholder Text
```css
color: #CBD5E1 (slate-400)
font-style: normal
```

### Unit Labels
```css
position: absolute
right: 1rem (right-4)
top: 50%
transform: translateY(-50%)
color: #94A3B8 (slate-400)
font-size: 14px (text-sm)
font-weight: 600 (font-semibold)
pointer-events: none
```

## Button Styling

### Primary Buttons
```css
background: #4F46E5 (indigo-600)
color: white
padding: 10px 16px (px-4 py-2)
border-radius: 8px (rounded-lg)
font-size: 14px (text-sm)
font-weight: 600 (font-semibold)
transition: all 0.2s ease

&:hover {
  background: #4338CA (indigo-700)
}

&:active {
  transform: scale(0.98)
}
```

### Secondary Buttons
```css
background: #E2E8F0 (slate-200)
color: #475569 (slate-700)
/* Same sizing as primary */

&:hover {
  background: #CBD5E1 (slate-300)
}
```

## Section Containers

### Standard Card/Section
```css
background: white
border: 1px solid #E2E8F0 (border-slate-200)
border-radius: 12px (rounded-xl)
padding: 24px (p-6)
box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05) (shadow-sm)
```

### Background Sections
```css
background: #F8FAFC (slate-50)
border: 1px solid #E2E8F0
border-radius: 12px
padding: 16px (p-4)
```

## Tooltip Styling

```css
background: #1E293B (slate-900)
color: white
padding: 8px 12px (px-3 py-2)
border-radius: 8px (rounded-lg)
font-size: 12px (text-xs)
line-height: 1.5 (leading-relaxed)
box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1) (shadow-lg)
z-index: 50 (z-50)
max-width: 224px (w-56)
word-wrap: break-word
animation: fadeIn 150ms
```

### Tooltip Arrow
```css
position: absolute
width: 8px
height: 8px
background: #1E293B (slate-900)
transform: rotate(45deg)
```

## Transitions & Animations

### Standard Transitions
```css
transition: all 0.2s ease-in-out
```

### Specific Transitions
| Property | Duration | Timing |
|----------|----------|--------|
| `border-color` | 200ms | ease-in-out |
| `background-color` | 200ms | ease-in-out |
| `box-shadow` | 200ms | ease-in-out |
| `color` | 200ms | ease-in-out |
| `opacity` | 150ms | ease-in-out |

### Animation: fadeIn
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

animation: fadeIn 150ms ease-in-out
```

### Animation: slideIn
```css
@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(-8px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

animation: slideIn 200ms ease-out
```

## Hover & Active States

### Input Hover
```css
border-color: #CBD5E1 (slate-300)
/* Slight lift */
box-shadow: 0 2px 4px rgba(0,0,0,0.05)
```

### Button Hover
```css
background: lighter shade of primary
transform: none
cursor: pointer
```

### Button Active (Pressed)
```css
transform: scale(0.98)
opacity: 0.9
```

## Z-Index Scale

| Layer | Z-Index | Elements |
|-------|---------|----------|
| Base | 0 | Content, inputs |
| Dropdowns | 10 | Select menus |
| Fixed | 20 | Sticky headers |
| Floating | 30 | Floating buttons |
| Modal | 40 | Modals, overlays |
| Tooltip | 50 | Tooltips, popovers |
| Alert | 60 | Alerts, toasts |

## Responsive Breakpoints

| Device | Width | Tailwind |
|--------|-------|----------|
| Mobile | 320px - 640px | Default / `sm` (640px) |
| Tablet | 641px - 1024px | `md` (768px) / `lg` (1024px) |
| Desktop | 1025px+ | `xl` (1280px) / `2xl` (1536px) |

### Responsive Grid Example
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Single column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

## Icon Specifications

### Emoji Icons
- Used throughout for visual interest
- All fields have a relevant emoji
- Examples: 💰🏠📊🔧⚙️🛡️🔐⏱️📈

### Material Symbols (Web Font)
- Alternative to emojis for professional appearance
- Classes: `material-symbols-outlined`
- Size: `text-lg` for labels, `text-xl` for buttons

## Accessibility (WCAG AA)

### Color Contrast
- Text on background: **4.5:1** minimum (AA standard)
- Large text (18pt+): **3:1** minimum
- UI components: **3:1** for distinguishable edges

### Focus Indicators
- All interactive elements have visible focus
- Focus ring: **4px** of `indigo-500/10`
- Keyboard navigation fully supported

### Semantic HTML
- Proper `<label>` for inputs
- `<button>` for actions
- `<section>` for major regions
- ARIA attributes where needed

## Print Styles

```css
@media print {
  /* Hide buttons, modals, non-essential UI */
  /* Optimize colors for printing */
  /* Increase contrast for paper */
}
```

## Performance Notes

- Tailwind CSS purges unused classes in production
- All animations use `transform` and `opacity` (GPU accelerated)
- Minimal shadows for better performance
- No custom fonts (uses system fonts)
- SVG icons for crisp display

## Customization Guide

### Changing Primary Color
1. Update color in color palette
2. Change all `indigo-600` references to new color
3. Test focus and hover states
4. Verify WCAG contrast ratios

### Changing Spacing
1. Modify base spacing in token definitions
2. Update all `p-6`, `gap-4`, `space-y-2` accordingly
3. Test responsive behavior

### Adding New Color
1. Add to Tailwind config (if custom)
2. Follow naming convention
3. Update color palette docs
4. Document usage

---

**Last Updated:** 2024
**Version:** 1.0
**Status:** Production Ready
