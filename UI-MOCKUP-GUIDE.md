# 🎨 UI Mockup Guide - Investment Management Platform

## Design Overview

This document provides visual descriptions of key screens in the application, showing the layout, components, and user interactions.

---

## Color Palette

```
Primary Colors:
- Primary Blue:    #1976D2 (Buttons, Links, Headers)
- Secondary Green: #388E3C (Money, Deposits, Success)
- Accent Orange:   #FF9800 (Notifications, Warnings)

Status Colors:
- Success:  #4CAF50 (Paid, Active)
- Warning:  #FFC107 (Pending, Due Soon)
- Error:    #F44336 (Overdue, Deleted)
- Info:     #2196F3 (Information)

Neutrals:
- Background Light: #F5F5F5
- Background Dark:  #121212
- Text Primary:     #212121
- Text Secondary:   #757575
- Border:           #E0E0E0
```

---

## 1. Login Page

### Layout Description
```
┌──────────────────────────────────────────────┐
│                                              │
│                                              │
│         [Logo]                               │
│    Investment Management                     │
│         Platform                             │
│                                              │
│    ┌────────────────────────────┐           │
│    │                            │           │
│    │   Welcome Back! 👋         │           │
│    │                            │           │
│    │   ┌──────────────────┐    │           │
│    │   │ Email/Username    │    │           │
│    │   └──────────────────┘    │           │
│    │                            │           │
│    │   ┌──────────────────┐    │           │
│    │   │ Password     [👁] │    │           │
│    │   └──────────────────┘    │           │
│    │                            │           │
│    │   ☐ Remember me            │           │
│    │                            │           │
│    │   ┌──────────────────┐    │           │
│    │   │    LOGIN         │    │           │
│    │   └──────────────────┘    │           │
│    │                            │           │
│    │   Forgot Password?         │           │
│    │                            │           │
│    └────────────────────────────┘           │
│                                              │
│         © 2026 Investment Platform          │
│                                              │
└──────────────────────────────────────────────┘
```

### Features
- Gradient background (light blue to white)
- Floating card with shadow
- Material input fields with labels
- Show/hide password toggle
- Remember me checkbox
- Primary blue login button
- Link to forgot password
- Responsive: stacks vertically on mobile

---

## 2. Dashboard (Desktop)

### Layout Description
```
┌────────────────────────────────────────────────────────────────┐
│ [Logo] Dashboard    Groups   Members   Deposits   Reports   [🔔][👤▼] │
├────┬───────────────────────────────────────────────────────────┤
│    │  📊 Statistics                                            │
│ 📊 │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                   │
│ Dash│  │ 👥35 │ │ 💰7  │ │8000৳ │ │ ⚠️ 2 │                   │
│    │  │Members│ │Deposits│ │Collected│ │Pending│                   │
│ 👥 │  └──────┘ └──────┘ └──────┘ └──────┘                   │
│ Groups│                                                         │
│    │  📈 Monthly Deposit Trends                               │
│ 👨‍👩‍👧 │  ┌────────────────────────────────────────────────┐  │
│ Families│  │         [Line Chart]                         │  │
│    │  │   8000                                           │  │
│ 💵 │  │   6000  ╱╲                                      │  │
│ Deposits│  │   4000 ╱  ╲  ╱╲                              │  │
│    │  │   2000╱    ╲╱  ╲                             │  │
│ 📊 │  │      Jan Feb Mar Apr May Jun                    │  │
│ Reports│  └────────────────────────────────────────────────┘  │
│    │                                                         │
│ ⚙️ │  🏠 Family Contributions                               │
│ Settings│  ┌──────────────────────────────────────────────┐  │
│    │  │                                                  │  │
│    │  │    [Pie Chart]                                   │  │
│    │  │                                                  │  │
│    │  │  Doe: 40%  Smith: 35%  Johnson: 25%            │  │
│    │  └──────────────────────────────────────────────────┘  │
│    │                                                         │
│    │  📋 Recent Deposits                                    │
│    │  ┌──────────────────────────────────────────────────┐  │
│    │  │ Date      Member      Amount    Status          │  │
│    │  │ Jan 10    John Doe    3000৳     ✅ Paid         │  │
│    │  │ Jan 10    Jane Smith  3000৳     ✅ Paid         │  │
│    │  │ Jan 12    Mike J.     1000৳     ✅ Paid         │  │
│    │  │ Jan 15    Alice Doe   1000৳     ⏳ Pending      │  │
│    │  └──────────────────────────────────────────────────┘  │
└────┴───────────────────────────────────────────────────────────┘
```

### Features
- Top navigation bar with logo, menu items, notifications, user menu
- Left sidebar with icons and labels
- Main content area with cards
- Statistics cards with icons and numbers
- Interactive charts (Chart.js)
- Recent activity list
- Color-coded status indicators
- Responsive: sidebar collapses to hamburger on mobile

---

## 3. Dashboard (Mobile)

### Layout Description
```
┌─────────────────────────┐
│ [☰] Dashboard     [🔔][👤] │
├─────────────────────────┤
│                         │
│ 📊 Quick Stats          │
│ ┌──────┐ ┌──────┐      │
│ │ 👥35 │ │ 💰7  │      │
│ │Members│ │Deposits│      │
│ └──────┘ └──────┘      │
│ ┌──────┐ ┌──────┐      │
│ │8000৳ │ │ ⚠️ 2 │      │
│ │Collected│ │Pending│      │
│ └──────┘ └──────┘      │
│                         │
│ 📈 Trends               │
│ ┌─────────────────────┐ │
│ │   [Mini Chart]      │ │
│ └─────────────────────┘ │
│                         │
│ 📋 Recent Activity      │
│ ┌─────────────────────┐ │
│ │ John Doe            │ │
│ │ 3000৳  ✅ Jan 10    │ │
│ ├─────────────────────┤ │
│ │ Jane Smith          │ │
│ │ 3000৳  ✅ Jan 10    │ │
│ ├─────────────────────┤ │
│ │ Mike Johnson        │ │
│ │ 1000৳  ✅ Jan 12    │ │
│ └─────────────────────┘ │
│                         │
│    [+] Add Deposit      │
│                         │
├─────────────────────────┤
│ [📊][👥][💵][📊][⚙️]    │
│ Dash Groups Deposits ... │
└─────────────────────────┘
```

### Features
- Hamburger menu for navigation
- Stacked statistics cards (2 columns)
- Compact charts
- Swipeable recent activity cards
- Floating action button (FAB) for quick actions
- Bottom navigation with 5 tabs
- Pull-to-refresh
- Touch-optimized spacing

---

## 4. Members List (Desktop)

### Layout Description
```
┌────────────────────────────────────────────────────────────────┐
│ [Logo] Dashboard    Groups   Members   Deposits   Reports   [🔔][👤▼] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Members Management                                            │
│                                                                │
│  ┌──────────────┐  ┌──────────┐  ┌──────────┐               │
│  │🔍 Search...   │  │ Group ▼  │  │ Type ▼   │  [+ Add Member]│
│  └──────────────┘  └──────────┘  └──────────┘               │
│                                                                │
│  ┌────────────────────────────────────────────────────────────┐│
│  │☐ │Avatar│Name        │Type  │Group    │Family │Shares│Actions││
│  ├────────────────────────────────────────────────────────────┤│
│  │☐ │ [JD] │John Doe    │Friend│Downtown │Doe    │  3   │👁✏🗑│││
│  │☐ │ [JS] │Jane Smith  │Friend│Downtown │Smith  │  3   │👁✏🗑│││
│  │☐ │ [MJ] │Mike Johnson│Friend│Downtown │Johnson│  1   │👁✏🗑│││
│  │☐ │ [AD] │Alice Doe   │Family│Downtown │Doe    │  1   │👁✏🗑│││
│  │☐ │ [BD] │Bob Doe     │Family│Downtown │Doe    │  1   │👁✏🗑│││
│  │☐ │ [CS] │Carol Smith │Family│Downtown │Smith  │  1   │👁✏🗑│││
│  │☐ │ [DS] │Dave Smith  │Family│Downtown │Smith  │  1   │👁✏🗑│││
│  └────────────────────────────────────────────────────────────┘│
│                                                                │
│  Showing 7 of 7 entries    [< 1 2 3 4 5 >]   [10 per page ▼] │
│                                                                │
│  [Export to Excel]  [Export to PDF]                           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Features
- Search bar with instant filtering
- Dropdown filters (Group, Type, Status)
- Add Member button (top right)
- Data table with:
  - Multi-select checkboxes
  - Avatar/initials
  - Sortable columns
  - Action buttons (View, Edit, Delete)
- Pagination controls
- Items per page selector
- Export buttons
- Hover effects on rows

---

## 5. Add/Edit Deposit (Modal)

### Layout Description
```
┌────────────────────────────────────┐
│ ✖                                  │
│      Add Monthly Deposit           │
│                                    │
│  Step 1 of 4: Member Selection     │
│  ━━━━━━━━━━○──────○──────○         │
│                                    │
│  Select Member *                   │
│  ┌──────────────────────────────┐ │
│  │ 🔍 Search member...          ▼│ │
│  └──────────────────────────────┘ │
│                                    │
│  Selected: John Doe                │
│  Group: Downtown Investment Club   │
│  Family: Doe Family                │
│  Share Count: 3                    │
│                                    │
│  Deposit Month *                   │
│  ┌──────────────────────────────┐ │
│  │ January                      ▼│ │
│  └──────────────────────────────┘ │
│                                    │
│  Deposit Year *                    │
│  ┌──────────────────────────────┐ │
│  │ 2024                         ▼│ │
│  └──────────────────────────────┘ │
│                                    │
│  Amount (BDT) *                    │
│  ┌──────────────────────────────┐ │
│  │ 3000                          │ │
│  └──────────────────────────────┘ │
│  Auto-calculated: 3 shares × 1000  │
│                                    │
│  Deposit Date *                    │
│  ┌──────────────────────────────┐ │
│  │ 📅 10/01/2024                │ │
│  └──────────────────────────────┘ │
│                                    │
│  Notes (optional)                  │
│  ┌──────────────────────────────┐ │
│  │                              │ │
│  │                              │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────┐    ┌──────────┐    │
│  │  Cancel  │    │   Save   │    │
│  └──────────┘    └──────────┘    │
│                                    │
└────────────────────────────────────┘
```

### Features
- Modal dialog (centered)
- Multi-step progress indicator
- Autocomplete member search
- Auto-populated fields (group, family, shares)
- Auto-calculated amount
- Date picker
- Validation messages
- Cancel and Save buttons
- Close button (top right)
- Responsive: full screen on mobile

---

## 6. Deposit Calendar View

### Layout Description
```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  Deposits Calendar                           [List View] [Calendar]│
│                                                                │
│  ┌─────────────────┐  January 2024  ┌─────────────────┐       │
│  │      < Prev     │                 │      Next >     │       │
│  └─────────────────┘                 └─────────────────┘       │
│                                                                │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Sun   Mon   Tue   Wed   Thu   Fri   Sat                   ││
│  ├────────────────────────────────────────────────────────────┤│
│  │ -     1     2     3     4     5     6                      ││
│  │       🟢    🟢    -     -     -     -                      ││
│  │                                                            ││
│  │ 7     8     9    10    11    12    13                     ││
│  │ -     -     -    🟢🟢   -    🟢    -                      ││
│  │                   🟢                                       ││
│  │                                                            ││
│  │ 14    15    16    17    18    19    20                    ││
│  │ -    🟡     -     -     -     -     -                     ││
│  │                                                            ││
│  │ 21    22    23    24    25    26    27                    ││
│  │ -     -     -     -     -     -     -                     ││
│  │                                                            ││
│  │ 28    29    30    31                                       ││
│  │ -     -     -     -                                        ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                │
│  Legend:  🟢 Paid    🟡 Pending    🔴 Overdue                 │
│                                                                │
│  Click on a date to add/view deposits                         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Features
- Month/Year navigation
- Calendar grid with deposit indicators
- Color-coded status dots
- Multiple deposits per day shown
- Click date to view/add deposits
- Legend for status colors
- Toggle between list and calendar view
- Swipe to change months (mobile)

---

## 7. Reports Page

### Layout Description
```
┌────────────────────────────────────────────────────────────────┐
│  Reports & Analytics                                           │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   📊         │  │   👨‍👩‍👧       │  │   💰         │        │
│  │  Monthly     │  │  Family      │  │  Member      │        │
│  │  Report      │  │  Report      │  │  History     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   📈         │  │   ⚠️         │  │   📄         │        │
│  │  Yearly      │  │  Pending     │  │  Custom      │        │
│  │  Summary     │  │  Payments    │  │  Report      │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
│  ─────────────────────────────────────────────────────────────│
│                                                                │
│  Quick Report Generator                                        │
│                                                                │
│  Report Type:     ┌─────────────────────┐                     │
│                   │ Monthly Deposit  ▼  │                     │
│                   └─────────────────────┘                     │
│                                                                │
│  Month/Year:      ┌─────────┐  ┌─────────┐                   │
│                   │ January▼│  │ 2024 ▼  │                   │
│                   └─────────┘  └─────────┘                   │
│                                                                │
│  Group (optional):┌─────────────────────┐                     │
│                   │ All Groups      ▼   │                     │
│                   └─────────────────────┘                     │
│                                                                │
│  Export Format:   ⚪ PDF   ⚪ Excel   ⚪ CSV                   │
│                                                                │
│  ┌──────────────┐                                             │
│  │ Generate Report │                                            │
│  └──────────────┘                                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Features
- Report type cards (clickable)
- Quick report generator form
- Dropdown selectors
- Radio buttons for export format
- Generate button
- Icons for each report type
- Hover effects on cards
- Responsive grid layout

---

## 8. Mobile Bottom Navigation

### Layout Description
```
┌─────────────────────────┐
│                         │
│    [Content Area]       │
│                         │
│                         │
│                         │
│                         │
├─────────────────────────┤
│                         │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
│  │📊 │ │👥 │ │💵 │ │📊 │ │⚙️ │
│  │Dash│ │Groups│ │Deposits│ │Reports│ │More│
│  └───┘ └───┘ └───┘ └───┘ └───┘
│                         │
└─────────────────────────┘
```

### Features
- Fixed bottom navigation bar
- 5 primary tabs
- Icons with labels
- Active state highlighting (blue)
- Ripple effect on tap
- Badge for notifications
- Safe area insets for notched phones

---

## 9. Dark Mode

### Visual Changes
- Background: #121212 (instead of #F5F5F5)
- Cards: #1E1E1E (elevated)
- Text: #E0E0E0 (instead of #212121)
- Border: #333333 (instead of #E0E0E0)
- Shadows: Adjusted for dark background
- Charts: Dark-themed colors
- Status colors: Slightly desaturated

### Toggle Location
- User menu dropdown (desktop)
- Settings page (all devices)
- Respects system preference by default

---

## 10. Responsive Breakpoints

### Desktop (1200px+)
- Full sidebar visible
- Multi-column layouts
- Larger charts
- Hover effects
- Data tables

### Tablet (768px - 1199px)
- Collapsible sidebar
- 2-column layouts
- Medium-sized charts
- Adapted data tables

### Mobile (<768px)
- Hamburger menu
- Single column layouts
- Bottom navigation
- Stacked cards
- Swipeable lists
- Compact forms
- Full-screen modals

---

## 11. Loading States

### Page Loading
```
┌─────────────────────────┐
│                         │
│    ╔═══════════════╗    │
│    ║               ║    │
│    ║   [Spinner]   ║    │
│    ║               ║    │
│    ║   Loading...  ║    │
│    ║               ║    │
│    ╚═══════════════╝    │
│                         │
└─────────────────────────┘
```

### Skeleton Screens
```
┌─────────────────────────┐
│ ┌─────────────────────┐ │
│ │ ▓▓▓▓▓▓▓▓            │ │
│ │ ▓▓▓▓                │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ ▓▓▓▓▓▓▓▓            │ │
│ │ ▓▓▓▓                │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

---

## 12. Empty States

### No Data
```
┌─────────────────────────┐
│                         │
│       [📭 Icon]         │
│                         │
│   No deposits found     │
│                         │
│  Start by adding your   │
│   first deposit         │
│                         │
│  ┌──────────────────┐   │
│  │ + Add Deposit    │   │
│  └──────────────────┘   │
│                         │
└─────────────────────────┘
```

---

## 13. Error States

### Error Message
```
┌─────────────────────────┐
│       [⚠️ Icon]         │
│                         │
│  Oops! Something went   │
│      wrong              │
│                         │
│  We couldn't load the   │
│  data. Please try again.│
│                         │
│  ┌──────────────────┐   │
│  │   Try Again      │   │
│  └──────────────────┘   │
│                         │
└─────────────────────────┘
```

---

## 14. Notifications & Toasts

### Success Toast
```
┌─────────────────────────────────┐
│ ✅ Deposit added successfully!  │
└─────────────────────────────────┘
```

### Error Toast
```
┌─────────────────────────────────┐
│ ❌ Failed to save deposit       │
│    [Retry]                      │
└─────────────────────────────────┘
```

### Info Toast
```
┌─────────────────────────────────┐
│ ℹ️ Changes saved automatically  │
└─────────────────────────────────┘
```

---

## 15. Confirmation Dialog

```
┌────────────────────────────────┐
│        ⚠️  Confirm Delete       │
│                                │
│  Are you sure you want to      │
│  delete this member?           │
│                                │
│  This action cannot be undone. │
│                                │
│  ┌──────────┐  ┌──────────┐   │
│  │  Cancel  │  │  Delete  │   │
│  └──────────┘  └──────────┘   │
│                                │
└────────────────────────────────┘
```

---

## Design Guidelines

### Spacing
- Padding: 16px (default), 24px (large cards)
- Margin: 8px (tight), 16px (normal), 24px (loose)
- Gap: 12px (grid items)

### Shadows
- Level 1: `0 2px 4px rgba(0,0,0,0.1)`
- Level 2: `0 4px 8px rgba(0,0,0,0.12)`
- Level 3: `0 8px 16px rgba(0,0,0,0.16)`

### Border Radius
- Small: 4px (inputs, buttons)
- Medium: 8px (cards)
- Large: 16px (modals, images)
- Pill: 24px (badges, chips)

### Typography Scale
- H1: 32px, Bold (Page titles)
- H2: 28px, Semi-Bold (Section headers)
- H3: 24px, Semi-Bold (Card titles)
- H4: 20px, Semi-Bold (Subsections)
- Body: 14px, Regular (Default text)
- Caption: 12px, Regular (Helper text)

---

**This UI mockup guide provides the visual foundation for implementation in Angular Material + Tailwind CSS!** 🎨
