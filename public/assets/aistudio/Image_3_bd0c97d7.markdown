---
name: Sanitary Flow
colors:
  surface: '#f7f9ff'
  surface-dim: '#cfdbe9'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ecf4ff'
  surface-container: '#e3effd'
  surface-container-high: '#dde9f8'
  surface-container-highest: '#d7e4f2'
  on-surface: '#111d27'
  on-surface-variant: '#3f4850'
  inverse-surface: '#26323c'
  inverse-on-surface: '#e7f2ff'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#00628d'
  on-tertiary: '#ffffff'
  tertiary-container: '#007cb1'
  on-tertiary-container: '#fcfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#c9e6ff'
  tertiary-fixed-dim: '#89ceff'
  on-tertiary-fixed: '#001e2f'
  on-tertiary-fixed-variant: '#004c6e'
  background: '#f7f9ff'
  on-background: '#111d27'
  surface-variant: '#d7e4f2'
  clean-mint: '#10b981'
  clean-mint-light: '#d1fae5'
  queue-amber: '#f59e0b'
  queue-amber-light: '#fef3c7'
  crowd-coral: '#ef4444'
  crowd-coral-light: '#fee2e2'
  urgent-red: '#dc2626'
  urgent-red-glow: rgba(220, 38, 38, 0.4)
  surface-glass: rgba(255, 255, 255, 0.82)
  surface-glass-border: rgba(255, 255, 255, 0.65)
  map-radius-stroke: rgba(2, 132, 199, 0.45)
  tag-bg-neutral: '#f1f5f9'
typography:
  display-hero:
    fontFamily: Outfit
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Outfit
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.04em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.5rem
  margin: 1rem
  margin-lg: 1.5rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
---

## Brand & Style

This design system defines a high-utility, hyper-reliable mobile navigation interface for locating public amenities across Singapore. The aesthetic pairs pristine clinical cleanliness with fluid, modern glassmorphic ergonomics. It addresses both casual exploration and high-stress scenarios (e.g., immediate physiological urgency, accessibility requirements, parenting needs).

The core experience evokes relief, crystal clarity, and precision:
- **Cleanliness & Hygiene**: Bright translucent materials, crisp aqua-tinted reflections, and immaculate white surface planes communicate medical-grade sanitation and trustworthiness.
- **Fast Wayfinding Under Pressure**: High legibility, distinct visual tags for immediate cognitive parsing, and high-impact emergency states.
- **Modern Glassmorphism & Tactile Utility**: Frosted overlays floating above an interactive vector map, allowing context retention while interacting with nested amenity sheets and live sensor ratings.

## Colors

The palette balances clean water and sanitation tones with high-contrast indicator signals:

- **Primary (`#0284c7`) & Accent Sky (`#0ea5e9`)**: Represent freshness, running water, and reliable civic infrastructure. Used for primary interactive triggers, active navigation routes, and current location indicators.
- **Clean Mint (`#10b981`)**: Dedicated indicator for verified cleanliness, 5-star ratings, hand sanitizer availability, and free/open access.
- **Queue Amber (`#f59e0b`) & Crowd Coral (`#ef4444`)**: Real-time operational feedback. Amber indicates moderate queues (2–5 mins), while coral indicates dense queues or maintenance in progress.
- **Urgent Need Red (`#dc2626`)**: An assertive override state. In 'Urgent Need Mode', the interface strips away decorative flourishes, converts navigation to direct shortest-path routing, and highlights the single nearest stall with high-contrast accessibility flags.
- **Translucent Neutrals**: Whites layered with backdrop blurs preserve connection to the live map canvas below, avoiding visual isolation.

## Typography

The typography system relies entirely on **Outfit** to provide geometric clarity, modern warmth, and superior scanning speed. 

- Large display sizes employ tighter tracking to remain compact in drawer headers and modal overlays.
- Label styles utilize bold weights (`600`–`700`) with deliberate letter spacing for fast identification of accessibility attributes (e.g., `BIDET`, `WHEELCHAIR`, `FREE`) on mobile screens under direct sunlight.
- Numerical readouts for distance (e.g., `120m`, `3 min`) always render in semi-bold weights to guarantee glanceability during rapid walking.

## Layout & Spacing

The layout model is designed specifically for mobile-first map ergonomics, optimizing for one-handed thumb interaction:

- **Interactive Map Canvas**: Operates edge-to-edge as the continuous base substrate.
- **Top Safe Control Zone**: Floats search, proximity radius filters (`2km radius`), and system status bars with standard `margin` padding (`1rem`).
- **Bottom Sheet Drawer Engine**: Collapsible bottom sheet that docks at three discrete heights:
  - *Peek (84px)*: Displays nearest restroom distance, quickest route CTA, and urgent toggle.
  - *Half (45vh)*: Lists nearby facilities sorted by hygiene index or distance.
  - *Full (90vh)*: Facility profile with stall breakdown, cleanliness logs, fee requirements, and photos.
- **Horizontal Micro-Gap Grid**: Pill badges and tags strictly adhere to `space-xs` and `space-sm` gaps to pack essential metadata (e.g. Bidet + Barrier-Free + Cleanliness) into a single row without wrapping.

## Elevation & Depth

Visual hierarchy uses frosted glassmorphism coupled with subtle ambient occlusion rather than heavy drop shadows:

- **Map Anchors & Markers**: Minimal floating depth using a clean drop shadow (`0 2px 8px rgba(2, 132, 199, 0.25)`). Active targets project an animated pulse ring on the canvas.
- **Floating Controls & Top Search**: Built with `rgba(255, 255, 255, 0.85)` background, a `12px` backdrop blur (`backdrop-filter: blur(12px)`), a top-edge highlight border (`1px solid rgba(255, 255, 255, 0.7)`), and soft ambient grounding (`0 4px 20px rgba(15, 23, 42, 0.08)`).
- **Interactive Facility Cards**: Surface tier using `rgba(255, 255, 255, 0.92)` glass. When dragged or focused, the card elevates with an increased shadow (`0 12px 32px rgba(15, 23, 42, 0.12)`).
- **Urgent Need Mode Elevation**: Suppresses soft blurs in favor of crisp high-contrast red accents (`rgba(220, 38, 38, 0.2)` edge rings) that demand instant cognitive focus.

## Shapes

The interface embraces a fully pill-shaped, rounded geometry (Level 3):

- **Floating Pills**: Header chips, radius buttons, status indicators, and filter pills use complete half-circle caps (`rounded-full` / `9999px`).
- **Sheet Drawers & Cards**: Sheet tops and card containers implement generous `1.5rem` to `2rem` radii (`rounded-xl` to `rounded-2xl`), delivering a friendly, soft, and approachable touch experience.
- **Action Buttons & Badges**: Main CTAs feature full pill curvature (`rounded-full`), conveying a tactile, soap-bubble smoothness aligned with hygiene.

## Components

### Buttons & Quick Actions
- **Primary CTA ("Navigate", "Direct Route")**: Solid `#0284c7` background, white label in `label-lg`, full pill radius (`9999px`), with `space-md` horizontal padding. Interactive scale down to `0.97` on press.
- **Urgent Need Trigger**: High-impact pill button with crimson background (`#dc2626`), vibrant white text, an urgent siren/lightning icon, and a pulsating outer ring (`urgent-red-glow`). Tapping triggers an instant re-route to the nearest unlocked facility.
- **Ghost Utility Buttons**: Semi-translucent glass background (`surface-glass`), 1px outline (`surface-glass-border`), and primary colored text.

### Accessibility & Feature Chips
- **Feature Badges (Wheelchair, Baby Changing, Bidet, Shower)**: Compact pill badges with solid white or soft slate background (`#f1f5f9`), 16px vector icon, and `label-sm` bold uppercase title.
- **Verification Indicator**: Clean mint tag (`#d1fae5` background, `#047857` icon/text) displaying "Verified Clean" or National Environment Agency rating grade (e.g., "NEA 5-Star").

### Queue & Crowd Status Meter
- Real-time indicator combining a color-coded status dot (`6px` circular badge: Mint for `< 1 min`, Amber for `2–5 min`, Coral for `> 5 min`) with contextual body copy (e.g., "Short queue · 2 cubicles free").

### Restroom Cards & Map Overlays
- **Facility Bottom Card**: Glassmorphism surface housing facility name, location tier (e.g., "MRT Station B1", "Hawker Centre #01"), distance counter, crowd level pill, and horizontal icon ribbon for amenities.
- **Floating Radius Bubble**: Translucent pill pinned to map center depicting the current search zone (`2km radius`) with subtle blue dashed vector bounds.

### Input Fields & Search
- Integrated search pill floating at screen top, housing a prominent search icon, clear query button, and right-aligned "Nearby" toggle switch with smooth tactile sliding action.