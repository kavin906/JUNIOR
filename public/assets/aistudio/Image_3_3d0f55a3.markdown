---
name: Clinical Telemetry Interface
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#ffb3ad'
  on-tertiary: '#68000a'
  tertiary-container: '#ff7a73'
  on-tertiary-container: '#79000e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.05em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 12px
    letterSpacing: 0.06em
  vital-display-lg:
    fontFamily: JetBrains Mono
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  vital-display-md:
    fontFamily: JetBrains Mono
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system is engineered for life-critical patient monitoring environments, operating room handhelds, and mobile intensive care units. The interface prioritizes rapid diagnostic legibility, situational awareness, and extreme perceptual clarity under varying hospital lighting conditions. 

The aesthetic is functional, precise, and utilitarian, rooted in a technical clinical style. It fuses high-contrast information architecture with micro-pulsing visual feedback, emulating hardware oscilloscope precision while retaining ergonomic mobile interactions. Every pixel and line weight directly reflects the physiological state of the patient, reducing cognitive load and eliminating visual ambiguity.

## Colors

The palette uses absolute darkness and deep clinical neutrals to ensure that chromatic signals strictly communicate status:

- **Background & Canvas**: Absolute base `#121212` prevents ocular fatigue during extended shifts.
- **Surfaces**: Tier-1 container `#181B22`, Tier-2 elevated card `#1E222B`, and structural dividers `#2D3748`.
- **Status Normal (Primary)**: `#10B981` (Emerald Green) signals normal rhythm, safe perfusion, and stable vitals.
- **Status Critical (Alert)**: `#EF4444` (Crimson Red) is reserved strictly for acute anomalies, life-threatening ventricular events, and critical limit breaks.
- **Status Caution (Warning)**: `#F59E0B` (Amber) designates technical alerts such as artifact noise, sensor detachment, or leads off.
- **Waveform & Trace Vectors**: `#06B6D4` (Neon Cyan) for plethysmograph/SpO2/respiratory traces, and `#22C55E` / `#A3E635` (Lime Green) for primary Lead II/V5 ECG vectors.
- **Grid Layer**: Low-luminance technical grid tint `#1A222D` with sub-divisions at `#151B24`.

## Typography

The type system separates general interface semantics from quantitative diagnostic telemetry.

- **Inter** handles clinical patient details, navigation, unit descriptions, and alert notifications.
- **JetBrains Mono** governs all quantitative real-time readouts, telemetry values (BPM, SpO2 %, EtCO2, NIBP mmHg), sweep speed notations, and metric limits. Monospaced tabular alignment prevents visual jitter during continuous numeric recalculations.
- `vital-display-lg` and `vital-display-md` are explicitly budgeted for instant distance-viewing across a patient bed or crash cart.

## Layout & Spacing

Telemetry dashboards use a high-density, fluid grid built around quick-glance containment:

- **Mobile Viewport**: Operates on a unified single-column or split 2-column channel structure with 12px (`0.75rem`) gutters and 16px (`1rem`) screen margins.
- **Waveform-to-Metric Ratio**: Each telemetry strip enforces a 2:1 or 3:1 width split between the active oscillometric trace and its paired numerical readout block.
- **Rhythm**: Internal card gaps follow a strict 4px/8px incremental rhythm (`space-xs` to `space-md`), minimizing wasted space while preventing accidental tap errors when toggling alarm boundaries.

## Elevation & Depth

Visual depth is achieved through tonal separation and low-contrast outlines rather than heavy drop shadows:

- **Base Layer (Level 0)**: `#121212`, the primary structural canvas.
- **ECG Grid Plane**: CSS grid pattern overlaid on canvas or card backgrounds using 1mm/5mm equivalent lines in `#1A222D` with 1px stroke weight.
- **Surface Layer (Level 1)**: `#181B22` with a 1px border of `#2D3748`.
- **Active Card Layer (Level 2)**: `#1E222B` for focused leads, interactive controls, or expandable telemetry cards.
- **Alarm States**: Drop shadows are replaced by localized inner glows or hard perimeter borders (e.g., 1.5px solid `#EF4444` with a subtle `rgba(239, 68, 68, 0.2)` diffuse perimeter flare during critical telemetry events).

## Shapes

The interface adopts a tight, semi-technical curvature profile:

- Containers, cards, and input controls use a restrained 4px (`0.25rem`) radius to evoke medical-grade physical equipment.
- Sub-components, status chips, and alarm tags scale up to 6px or 8px, but avoid pill-shaped roundness to preserve a dense, non-consumer aesthetic.
- Interactive toggle indicators and oscilloscope line tips maintain crisp, squared-off terminal edges.

## Components

### Telemetry & Waveform Cards
- Surface background: `#181B22` featuring a background-repeating SVG medical grid (5x5 grid cells, `#1A222D`).
- Encased in a 1px `#2D3748` structural outline.
- Right-aligned quantitative metric display (JetBrains Mono) paired with an active sweep canvas on the left.
- Real-time oscilloscope traces use vector paths with an opacity gradient trailing 40px behind the current sweep vector.

### Status Indicators & Micro-Pulses
- Micro-pulsing beacons: 8px circular nodes accompanied by a 1.2s infinite keyframe scale ping (0% to 150% radius, transitioning opacity from 0.8 to 0).
- Normal status: `#10B981` soft pulse.
- Critical anomaly: `#EF4444` rapid hard flash (400ms interval).
- Lead off / Disconnected: Amber `#F59E0B` static ring without pulse.

### Buttons & Interactive Controls
- Primary actions (Acknowledge, Silence Alarm): Flat `#1E222B` with high-contrast borders and uppercase `JetBrains Mono` label text.
- Emergency Overrides (Defib Sync, Code Blue): Solid `#EF4444` fill with `#FFFFFF` bold typography.
- Minimum touch target: 48px height across all mobile clinical states.

### Metric Chips & Badges
- Compact rectangles with a 2px border radius.
- Background: 10% tint of the metric's functional color (`rgba(16, 185, 129, 0.1)` for safe, `rgba(245, 158, 11, 0.1)` for caution).
- Text: Pure functional color, monospaced, uppercase.

### Inputs & Limit Sliders
- Threshold adjustments feature horizontal track sliders with color zones indicating critical high, warning high, nominal, warning low, and critical low boundaries.
- Discrete numeric input steps require deliberate stepped increment buttons rather than free-form continuous drags to avoid accidental limit shifts.