# Tax Naija - Specification Document

## Project Overview

- **Project Name**: Tax Naija
- **Type**: Single-page web application
- **Core Functionality**: Nigerian income tax calculator with comprehensive breakdown, visualization, and comparison features
- **Target Users**: Nigerian employees, HR professionals, and anyone calculating personal or employee taxes

## UI/UX Specification

### Layout Structure

**Page Sections**:

1. **Header**: App title with Nigerian flag-inspired branding, dark/light mode toggle
2. **Main Calculator Panel**: Income input, toggle switches, deductions inputs
3. **Results Dashboard**: Summary cards with key metrics
4. **Tax Bracket Breakdown Table**: Detailed band-by-band analysis
5. **Visualization Chart**: Bar chart comparing gross vs tax vs pension vs take-home
6. **Salary Comparison Panel**: Side-by-side salary comparison
7. **Bonus Calculator**: 13th month/bonus tax calculation
8. **Action Buttons**: Copy to clipboard, PDF download, Reset

**Responsive Breakpoints**:

- Mobile: < 640px (single column, stacked layout)
- Tablet: 640px - 1024px (two column where appropriate)
- Desktop: > 1024px (full layout with side-by-side elements)

### Visual Design

**Color Palette**:

- Primary Dark Green: `#006233` (Nigeria flag green)
- Secondary Green: `#1a4d2e`
- Gold Accent: `#FFD700`
- Light Gold: `#F5E6A3`
- Dark Text: `#1a1a1a`
- Light Text: `#f5f5f5`
- Card Background (Light): `#ffffff`
- Card Background (Dark): `#1e293b`
- Input Background (Light): `#f8fafc`
- Input Background (Dark): `#334155`
- Border (Light): `#e2e8f0`
- Border (Dark): `#475569`
- Success: `#22c55e`
- Error: `#ef4444`

**Typography**:

- Headings: Georgia, "Times New Roman", serif
- Body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- Heading sizes: H1: 2rem, H2: 1.5rem, H3: 1.25rem
- Body size: 1rem (16px base)
- Small text: 0.875rem

**Spacing System**:

- Base unit: 4px
- Section padding: 24px
- Card padding: 20px
- Element gaps: 16px
- Input padding: 12px 16px

**Visual Effects**:

- Card shadows: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- Border radius: 12px for cards, 8px for inputs/buttons
- Transitions: 0.2s ease for all interactive elements
- Hover states: slight scale (1.02) on buttons, color shifts

### Components

**Input Fields**:

- Rounded borders, subtle focus ring in gold
- Currency prefix (₦) displayed
- Real-time comma formatting
- Labels above inputs

**Toggle Switch (Monthly/Annual)**:

- Custom styled toggle
- Active state in green
- Smooth slide animation

**Result Cards**:

- White/dark cards with subtle shadow
- Icon + label + value layout
- Color-coded by type (green for income, red for deductions)

**Data Table**:

- Alternating row colors
- Sticky header
- Responsive horizontal scroll on mobile
- Clear column alignment

**Buttons**:

- Primary: Dark green background, gold text
- Secondary: Outlined with green border
- Icon buttons for copy, PDF, reset

**Chart**:

- Horizontal bar chart
- Color-coded bars (green for gross, red for tax, gold for pension, blue for net)
- Animated on load
- Tooltips showing exact values

## Functionality Specification

### Core Features

1. **Income Input with Formatting**
   - Accept numeric input
   - Display with ₦ prefix and comma separators
   - Format on input (e.g., 1200000 → ₦1,200,000)

2. **Monthly/Annual Toggle**
   - Default: Monthly
   - When monthly: multiply by 12 for annual calculation
   - Clear visual indication of current mode

3. **Pension Input**
   - Default: 8%
   - Range: 0-20%
   - Input field for custom percentage

4. **Rent Relief Input**
   - Annual rent input field
   - Calculate rent relief (25% of rent, max ₦500,000)
   - Deduct from tax

5. **Real-time Calculation**
   - Calculate on every input change (debounced 300ms)
   - No submit button needed
   - Instant result updates

6. **Results Dashboard**
   - Gross Income (annual)
   - Total Deductions (pension + rent relief)
   - Taxable Income
   - Annual Tax
   - Monthly Tax
   - Effective Tax Rate (%)
   - Net Take-home Pay

7. **Tax Bracket Breakdown Table**
   - Columns: Bracket Range, Rate, Amount in Bracket, Tax Owed
   - Show progressive calculation
   - Highlight applicable brackets

8. **Visualization Chart**
   - Horizontal bar chart using Chart.js
   - Show: Gross Income, Total Tax, Pension Contribution, Net Take-home
   - Responsive sizing

9. **Salary Comparison**
   - Two input sets side by side
   - Compare: Tax, Take-home, Effective Rate
   - Visual diff indicators

10. **Bonus/13th Month Calculator**
    - Input bonus amount
    - Calculate additional tax (usually 10% of bonus)
    - Show net bonus

11. **Copy to Clipboard**
    - Copy formatted results summary
    - Visual feedback on copy

12. **PDF Download**
    - Generate PDF summary using html2pdf.js
    - Include all results and breakdown

13. **Dark/Light Mode**
    - Toggle in header
    - Persist preference in localStorage
    - Smooth transition between modes

14. **Reset Button**
    - Clear all inputs
    - Reset to default values
    - Hide results until new input

### Tax Calculation Logic

**Nigerian Tax Brackets (2024)**:

- ₦0 - ₦800,000: 0%
- ₦800,001 - ₦3,000,000: 15%
- ₦3,000,001 - ₦12,000,000: 18%
- ₦12,000,001 - ₦25,000,000: 21%
- ₦25,000,001 - ₦50,000,000: 24%
- Above ₦50,000,000: 25%

**Deductions**:

- Pension: User-defined % (default 8%) of gross
- Rent Relief: 25% of annual rent, max ₦500,000

**Progressive Tax Calculation**:

- Calculate tax bracket by bracket
- Sum all bracket taxes for total

## Acceptance Criteria

1. ✓ Income displays with ₦ prefix and commas as user types
2. ✓ Monthly/Annual toggle works correctly
3. ✓ Pension defaults to 8% and calculates correctly
4. ✓ Rent relief calculates at 25% (max ₦500k)
5. ✓ Results update instantly without submit button
6. ✓ All 7 result metrics display correctly
7. ✓ Tax bracket table shows accurate per-bracket breakdown
8. ✓ Chart renders with correct proportions
9. ✓ Side-by-side comparison works
10. ✓ Bonus calculator computes correctly
11. ✓ Copy to clipboard works with visual feedback
12. ✓ PDF downloads with full summary
13. ✓ Dark/light mode toggles and persists
14. ✓ Fully responsive on mobile devices
15. ✓ Reset button clears all and starts fresh
16. ✓ Professional Nigerian-inspired design (green/gold)
