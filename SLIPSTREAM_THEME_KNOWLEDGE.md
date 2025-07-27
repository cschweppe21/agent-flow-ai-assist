# SlipStream Dashboard Theme & Design System

**SlipStream Dashboard** is a professional real estate CRM and analytics platform with a sophisticated blue-themed design system, smooth animations, and comprehensive component styling optimized for real estate professionals.

## Core Brand Identity

**Primary Brand Colors:**
- Primary: `hsl(221, 83%, 53%)` - Professional blue for main brand elements
- Primary Foreground: `hsl(210, 40%, 98%)` - Light text on primary backgrounds
- Primary Glow: `hsl(221, 83%, 65%)` - Lighter blue for hover effects and glows

**Tagline:** "Streamline your real estate business with intelligent insights"
**Voice:** Professional, modern, data-driven, empowering

## Complete Color System (HSL Values Only)

### Base Colors
```css
/* Light Mode */
--background: 0 0% 100%
--foreground: 222.2 84% 4.9%
--muted: 210 40% 96%
--muted-foreground: 215.4 16.3% 46.9%
--popover: 0 0% 100%
--popover-foreground: 222.2 84% 4.9%
--card: 0 0% 100%
--card-foreground: 222.2 84% 4.9%
--border: 214.3 31.8% 91.4%
--input: 214.3 31.8% 91.4%

/* Dark Mode */
--background: 222.2 84% 4.9%
--foreground: 210 40% 98%
--muted: 217.2 32.6% 17.5%
--muted-foreground: 215 20.2% 65.1%
--popover: 222.2 84% 4.9%
--popover-foreground: 210 40% 98%
--card: 222.2 84% 4.9%
--card-foreground: 210 40% 98%
--border: 217.2 32.6% 17.5%
--input: 217.2 32.6% 17.5%
```

### Status Colors
```css
--success: 142 71% 45%
--success-foreground: 138 100% 94%
--warning: 48 96% 53%
--warning-foreground: 48 100% 8%
--destructive: 0 84% 60%
--destructive-foreground: 210 40% 98%
```

### Real Estate Specific Colors
```css
--listing-active: 142 71% 45%      /* Green for active listings */
--listing-pending: 48 96% 53%      /* Yellow for pending sales */
--listing-sold: 221 83% 53%        /* Primary blue for sold properties */
--commission-high: 142 71% 45%     /* Green for high commissions */
--commission-low: 48 96% 53%       /* Yellow for moderate commissions */
--market-trend-up: 142 71% 45%     /* Green for positive trends */
--market-trend-down: 0 84% 60%     /* Red for negative trends */
```

### Gradient System
```css
--gradient-primary: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)))
--gradient-card: linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)
--gradient-success: linear-gradient(135deg, hsl(var(--success)) 0%, hsl(142 71% 55%) 100%)
--gradient-hero: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 50%, hsl(221 83% 75%) 100%)
```

### Shadow System
```css
--shadow-card: 0 1px 3px 0 hsl(var(--foreground) / 0.1), 0 1px 2px 0 hsl(var(--foreground) / 0.06)
--shadow-elevated: 0 10px 15px -3px hsl(var(--foreground) / 0.1), 0 4px 6px -2px hsl(var(--foreground) / 0.05)
--shadow-glow: 0 0 20px hsl(var(--primary) / 0.3)
```

## Component Styling Patterns

### Button Variants (Critical: Use these exact variants)
- `default`: Primary blue with white text
- `destructive`: Red for delete/dangerous actions
- `outline`: Transparent with border (perfect for secondary actions)
- `secondary`: Muted background for secondary actions
- `ghost`: Transparent hover effects for minimal actions
- `link`: Styled as clickable text
- `success`: Green for positive actions
- `warning`: Yellow for caution actions
- `hero`: Special variant for landing page CTAs
- `listing`: Real estate specific styling
- `premium`: Enhanced styling for premium features

### Card Styling Patterns
```css
/* Standard Card */
.card-standard {
  @apply bg-gradient-card border-border/50 shadow-card hover:shadow-elevated;
  @apply transition-all duration-300 hover:scale-105;
}

/* Metrics Card */
.metrics-card {
  @apply bg-gradient-card border-border/50 shadow-card hover:shadow-elevated;
  @apply transition-all duration-300 hover:scale-105;
}

/* Premium Card */
.card-premium {
  @apply bg-gradient-primary border-primary/20 shadow-glow;
}
```

### Typography Hierarchy
- **Headers**: Use `text-foreground` with proper font weights
- **Body Text**: Use `text-muted-foreground` for secondary content
- **Accent Text**: Use `text-primary` for links and highlights
- **Success/Error**: Use `text-success` and `text-destructive`

## Layout Architecture

### Landing Page Pattern
- Hero section with gradient background
- Feature cards with hover animations
- Call-to-action buttons using `hero` variant
- Professional testimonials and social proof

### Dashboard Layout
- Sidebar navigation with real estate specific icons
- Metrics cards showing KPIs (listings, commissions, clients)
- Chart components with primary color theming
- Data tables with proper contrast ratios

### Authentication Forms
- Centered modal-style forms
- Role selection with badge styling
- Password strength indicators
- Social login integration ready

## Animation System

### Available Animations
```css
/* Use these classes directly in components */
.animate-fade-in      /* Smooth entry animations */
.animate-scale-in     /* Emphasis animations */
.animate-slide-in-right /* Sidebar/drawer animations */
.hover-scale          /* Interactive hover effects */
.story-link           /* Underline hover animations */
```

### Transition Standards
- **Duration**: 300ms for most interactions
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` for smooth feel
- **Hover Effects**: Scale 1.05 for cards, 1.02 for buttons

## Interactive Elements

### Focus States
- Ring color: `hsl(var(--ring))` with 2px offset
- High contrast for accessibility compliance

### Hover Effects
- Cards: Scale 1.05 + elevated shadow
- Buttons: Background color transitions
- Links: Underline animations with primary color

### Touch Interactions
- Minimum 44px touch targets
- Visual feedback for all interactive elements
- Swipe gestures for mobile task management

## Responsive Design Principles

### Breakpoints (Mobile-First)
- Mobile: Default styles
- Tablet: `md:` prefix (768px+)
- Desktop: `lg:` prefix (1024px+)
- Large Desktop: `xl:` prefix (1280px+)

### Mobile Optimizations
- Touch-friendly button sizes
- Simplified navigation patterns
- Readable typography scales
- Optimized spacing for small screens

## Theme Variations

### Dark Mode Support
- Automatic system preference detection
- Manual toggle available
- All colors have dark mode variants
- Proper contrast ratios maintained

### Accessibility Features
- High contrast mode available
- Reduced motion preferences respected
- Semantic color usage throughout
- Proper ARIA labeling

## Implementation Guidelines

### DO Use
✅ Semantic color tokens (`text-primary`, `bg-card`, etc.)
✅ Predefined button variants
✅ Gradient classes for enhanced visuals
✅ Animation utilities for smooth interactions
✅ Real estate specific color tokens

### DON'T Use
❌ Direct color values (`text-blue-500`, `bg-white`)
❌ Custom CSS without design system
❌ Inconsistent spacing patterns
❌ Non-semantic color usage
❌ Overly complex animations

### Real Estate Context
- Focus on data visualization for market trends
- Emphasize professional credibility
- Highlight revenue/commission tracking
- Support client relationship management
- Enable property portfolio management

## Component Enhancement Patterns

### Cards with Real Estate Context
```jsx
<MetricsCard 
  variant="success" 
  title="Active Listings" 
  value="24" 
  trend={{ value: 12, isPositive: true }}
/>
```

### Buttons for Real Estate Actions
```jsx
<Button variant="listing">Schedule Showing</Button>
<Button variant="success">Close Deal</Button>
<Button variant="warning">Follow Up Required</Button>
```

This design system ensures consistent, professional, and accessible user experiences across the entire SlipStream Dashboard platform while maintaining the real estate industry focus and modern aesthetic.