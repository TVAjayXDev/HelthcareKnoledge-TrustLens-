---
name: Clinical Clarity
colors:
  surface: '#faf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#faf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f4f0'
  surface-container: '#efeeea'
  surface-container-high: '#e9e8e4'
  surface-container-highest: '#e3e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#444748'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ed'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#5e5f5a'
  on-secondary: '#ffffff'
  secondary-container: '#deddd7'
  on-secondary-container: '#61615c'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#23005c'
  on-tertiary-container: '#9466ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#e4e2dc'
  secondary-fixed-dim: '#c8c7c0'
  on-secondary-fixed: '#1b1c18'
  on-secondary-fixed-variant: '#474743'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#faf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e3e2df'
typography:
  display:
    fontFamily: Inter
    fontSize: 72px
    fontWeight: '700'
    lineHeight: 76px
    letterSpacing: -0.035em
  display-mobile:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 52px
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an authoritative, serene, and radically uncluttered visual environment tailored for clinical environments. Hospital workflows are high-stakes, sensorially overloaded, and time-critical. The interface functions as an antidote to cognitive strain: an editorial, premium AI assistant blending calm minimalism with clinical certitude.

The aesthetic fuses modern Swiss editorial typography with warm tactile digital surfaces. It deliberately eschews cold, sterile blue clinical palettes in favor of organic stone tones paired with pitch-black typography and crystalline white utility surfaces. Interactive elements evoke physical serenity through soft pill geometry and crisp border definitions, while atmospheric blurred spectral glows signify active synthetic intelligence without distracting from patient-facing insights.

## Colors

The palette operates on calibrated contrast tiers designed to surpass WCAG AAA legibility while projecting warmth and quiet confidence.

- **Primary Canvas & Surfaces:** The foundational app canvas rests on warm stone (`#F6F5F1`). Elevated context panels, diagnostic cards, and data surfaces sit on pure white (`#FFFFFF`) with calibrated hairline perimeter borders (`#E6E4DD`).
- **Typography & Content:** High-priority text, metrics, and primary interactive states anchor in pitch slate (`#111111`). Secondary metadata, systemic timestamps, and auxiliary guidance render in warm slate (`#6B6B66`). Inactive states and decorative divider lines drop back to `#DDDCD5`.
- **Synthetic Intelligence Halo:** AI activity, vector citations, and preview panels are accented with an ethereal, low-opacity conic/radial mesh transitioning through violet (`#8B5CF6`), cobalt (`#3B82F6`), and surgical teal (`#14B8A6`). This gradient exists strictly as atmospheric lighting, never as high-contrast foreground text.
- **Verification & Clinical Trust System:**
  - *High Verification / Current:* `#2F7D5B` typography on `#E4F2EA` tinted surface.
  - *Moderate / Review Required:* `#B7791F` typography on `#FBF0DA` tinted surface.
  - *Critical Discrepancy / Outdated:* `#B4403A` typography on `#FBE6E4` tinted surface.
  - *Unindexed / Clinical Draft:* `#5A5A58` typography on `#EAE9E4` tinted surface.

## Typography

The typographic hierarchy implements an editorial tension between commanding, ultra-tight display scales and expansive, hyper-legible narrative body copy. 

Inter is deployed across all levels, configured with tightened letter-spacing at display scales to mimic high-end grotesk typefoundry specimens (such as Satoshi or General Sans). Massive hero headings create rapid visual anchors for clinicians reviewing synthesis summaries. Body typography is calibrated with a generous `1.6` relative line height to ensure zero ocular fatigue when parsing multi-paragraph medical guidelines, drug interaction notes, or literature citations.

## Layout & Spacing

The structural layout uses an asymmetrical, airy 12-column grid system bounded by maximum canvas widths of 1440px on desktop and workstation monitors.

- **Desktop (1024px+):** 12-column fluid grid, 24px (`1.5rem`) gutters, and 48px (`3rem`) viewport margins. Assistant navigation and clinical citation dossiers leverage a 4-column secondary split panel, while synthesis results claim an 8-column reading path.
- **Tablet (768px - 1023px):** 8-column layout, 20px gutters, 32px canvas margins. Sidebars collapse to slide-over drawers or pinned segmented headers.
- **Mobile (< 768px):** 4-column responsive grid, 16px (`1rem`) gutters, and 20px (`1.25rem`) edge margins. Critical diagnostic summaries snap to single-column full-width reading cards.

Internal component rhythm adheres rigorously to multiples of 4px, giving priority to spacious internal padding (`space-xl` and `space-lg`) within white content cards to preserve an expansive, calm visual field.

## Elevation & Depth

Visual hierarchy rejects simulated physical skeuomorphism and heavy drop shadows in favor of tonal layering, razor-sharp perimeter containment, and ambient luminescence:

- **Surface Layering:** The backdrop stone canvas (`#F6F5F1`) provides the zero baseline. Active analytical content is elevated onto pure white cards delineated by an unbroken 1px solid stroke (`#E6E4DD`).
- **Shadow Profile:** Shadows are predominantly flattened. When dynamic elevation is required (e.g., floating query bars, command dialogs, contextual tooltips), use an ultra-diffused, ambient drop shadow: `box-shadow: 0 12px 32px -4px rgba(17, 17, 17, 0.04), 0 4px 12px -2px rgba(17, 17, 17, 0.02)`.
- **Synthetic Gradient Ambient Blur:** Behind primary query modules, hero synthesis panels, and confidence score badges, place a soft, non-interactive radial bloom (`filter: blur(64px); opacity: 0.15;`) constructed from `#8B5CF6`, `#3B82F6`, and `#14B8A6`. The bloom lives under the white card surface, never over clinical data.

## Shapes

The geometric signature of this design system relies on a dual-tier radius logic:
- **Macro Containers:** Content panels, insight summaries, clinical evidence cards, and modal dialogs use an expansive curvature of 20px to 28px (`rounded-xl` to `rounded-2xl`). This softens clinical software rigor into an inviting architectural experience.
- **Micro Interactives & Badges:** Primary buttons, contextual input pills, filter chips, and trust badges strictly adopt full pill geometry (`border-radius: 9999px`).

## Components

### Buttons
- **Primary Action Pill:** Solid pitch black (`#111111`) fill, pure white text, fully rounded (`rounded-full`), padded `px-6 py-3`. Hover: transition background to `#262624` with gentle micro-scale (`transform: translateY(-0.5px)`). Focus: 2px offset ring in `#111111`.
- **Secondary Action Pill:** Crisp white (`#FFFFFF`) surface, 1px solid stone border (`#E6E4DD`), dark slate text (`#111111`), fully rounded. Hover: background tints to `#FAF9F6` with border darkening to `#D6D4CC`.
- **Ghost Utility:** Borderless, neutral text (`#6B6B66`), fully rounded, hover background tint `#EAE9E4`.

### Trust Semantic Badges
Compact pill markers (`rounded-full`, `py-1 px-3`, text size `11px`, weight `600`) pairing a 14px Lucide line icon with uppercase status labels:
- **Verified / Current:** Background `#E4F2EA`, Text `#2F7D5B`, Icon `check-circle`.
- **Review Due / Moderate:** Background `#FBF0DA`, Text `#B7791F`, Icon `clock`.
- **Conflict / Outdated:** Background `#FBE6E4`, Text `#B4403A`, Icon `alert-triangle`.
- **Draft / In-Training:** Background `#EAE9E4`, Text `#5A5A58`, Icon `file-text`.

### Input Fields & Search Bars
- Floating inquiry inputs adopt full pill frames (`rounded-full`) with a pure white background, 1px `#E6E4DD` border, and inset padding of `py-3.5 px-6`.
- Placeholder text in `#8C8C87`. 
- Focus state: border shifts decisively to `#111111` with no noisy glowing rings. Includes direct quick-action icons (e.g., source filters, keyboard shortcuts) anchored flush right inside the pill.

### Cards & Knowledge Blocks
- Engineered with pure white (`#FFFFFF`) backgrounds, 24px curvature (`rounded-2xl`), 1px continuous stroke (`#E6E4DD`), and generous internal padding (`32px` desktop, `20px` mobile).
- Headers pair an editorial section label in `#6B6B66` with high-contrast `#111111` titles.
- Dividers within cards are 1px solid `#F2F1EC`.

### Clinical Citation Dossiers
- Embedded cards indicating sources (e.g., institutional protocols, clinical trial results, patient records) use a distinct `#FBFBFA` background with a subtle dashed or solid `#E6E4DD` boundary, accompanied by a 1.5px stroke `git-compare` or `file-text` icon.

### Form Controls (Checkboxes & Radios)
- Checkboxes: 18px rounded squares (`rounded-md`), 1.5px border `#D1CFCA`, active state filled `#111111` with an ultra-crisp white check.
- Radios: 18px circles (`rounded-full`), active state using a solid `#111111` dot nested within a white interior and outer `#111111` stroke.