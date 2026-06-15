# B2B Outbound Sales Landing Page - SPEC.md

## 1. Concept & Vision

A premium, enterprise-grade landing page that positions the outbound sales service as the definitive solution for B2B businesses trapped in the "renting" model. The experience should feel like visiting a high-end consultancy—authoritative, data-rich, and confidence-inspiring. The page communicates: "This is not another SaaS subscription. This is building a business asset."

**Personality**: Bold, direct, no-nonsense. Speaks to founders and sales leaders who've been burned by expensive subscriptions that add zero value to their balance sheet.

## 2. Design Language

### Aesthetic Direction
Dark executive aesthetic—think McKinsey meets modern SaaS. Deep charcoal backgrounds with warm amber/gold accents that signal premium value. Clean lines, generous whitespace, typography that commands attention.

### Color Palette
- **Primary Background**: `#0D0D0F` (near black)
- **Secondary Background**: `#1A1A1F` (dark charcoal)
- **Card Background**: `#242428` (elevated surface)
- **Primary Accent**: `#D4A853` (warm gold)
- **Secondary Accent**: `#E8C77B` (light gold)
- **Success/CTA**: `#22C55E` (green for contrast)
- **Text Primary**: `#FFFFFF`
- **Text Secondary**: `#A1A1AA` (muted gray)
- **Text Tertiary**: `#71717A`
- **Border**: `#3F3F46`

### Typography
- **Headlines**: Inter, 700 weight, tracking -0.02em
- **Body**: Inter, 400/500 weight
- **Accent Text**: Inter, 600 weight, gold color
- **Monospace (stats)**: JetBrains Mono for numbers/data

### Spatial System
- Base unit: 8px
- Section padding: 120px vertical (desktop), 80px (mobile)
- Container max-width: 1280px
- Card padding: 32px
- Grid gap: 24px

### Motion Philosophy
- Subtle fade-up animations on scroll (opacity 0→1, translateY 20px→0, 600ms ease-out)
- Gold accent elements have subtle glow pulse
- CTA buttons have scale(1.02) on hover with 200ms transition
- Numbers count up when in viewport
- Comparison table rows highlight on hover

### Visual Assets
- Hero: Cinematic background video (dark, abstract, business/corporate feel)
- Icons: Custom SVG icons in gold/white
- Decorative: Subtle grid pattern overlay, gradient orbs for depth
- Trust badges: Placeholder logos in grayscale

## 3. Layout & Structure

### Page Flow
1. **Hero** (100vh) - Video background, bold headline, CTA, trust indicator
2. **Problem Section** - 4-pain grid with icons and explanations
3. **Solution/Fix** - "Own Don't Rent" philosophy with 4 benefit cards
4. **Deliverables** - 5 core features in detailed cards
5. **ROI & Value** - Multi-card layout with stats and benefits
6. **Comparison Table** - Old Way vs New Way
7. **Guarantee** - Trust-building guarantee section
8. **Final CTA** - Strong close with form

### Responsive Strategy
- Desktop: Full grid layouts, large typography
- Tablet (768px): 2-column grids, reduced padding
- Mobile (480px): Single column, stacked cards, touch-friendly CTAs

## 4. Features & Interactions

### Lead Capture Form
- Fields: Name, Email, Company Name, Monthly Outbound Spend (dropdown)
- Validation: Real-time, friendly error messages
- Submit: Loading state, success message, error handling
- Data storage: Console log for demo (analytics-ready structure)

### Scroll Animations
- Elements fade up as they enter viewport
- Stats count up when visible
- Staggered animations for card grids

### Navigation
- Sticky header on scroll (appears after hero)
- Smooth scroll to sections
- Mobile hamburger menu

### CTA Behavior
- Primary CTA: Pulse animation on idle, scale on hover
- All CTAs scroll to form or open modal

## 5. Component Inventory

### Hero Section
- Full-screen video background (muted, looped, autoplay)
- Large headline (clamp 48px-80px)
- Subheadline in muted text
- Primary CTA button (gold)
- Trust indicator (stat or badge)
- Scroll indicator

### Problem Cards (4x)
- Icon (gold, 48px)
- Title (bold, white)
- Description (muted gray)
- Hover: subtle border glow

### Feature Cards (5x)
- Icon header
- Title
- Feature list with checkmarks
- Hover: lift shadow

### Stat Cards
- Large number (gold, monospace)
- Label below
- Subtle background pattern

### Comparison Table
- Two columns (Old Way / New Way)
- Row hover highlight
- Check/X icons for features
- Sticky header

### Form Section
- Dark card with border
- Floating labels
- Dropdown for spend selector
- Submit button with loading state

### Guarantee Badge
- Large icon
- "6 Days" emphasized
- Refund promise

## 6. Technical Approach

### Stack
- Pure HTML5 + CSS3 + Vanilla JavaScript
- No frameworks (fastest load time)
- CSS custom properties for theming
- Intersection Observer for scroll animations

### Performance
- Video: Compressed MP4, lazy load below fold
- Fonts: Google Fonts with display=swap
- CSS: Inline critical styles, minimal file size
- Images: WebP where possible, lazy loading

### Form Handling
- Client-side validation
- Console.log submission data (analytics-ready)
- Success/error state UI

### File Structure
```
/sales-landing-page/
├── index.html
├── styles.css (inlined)
├── app.js (inlined)
├── videos/
│   └── hero.mp4
└── SPEC.md
```
