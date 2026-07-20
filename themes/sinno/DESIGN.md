# SINNO PhotoBooth — Design Tokens

Design reference for the SINNO theme (`themes/sinno/`). Switch the app with `activeThemeId = "sinno"` in [`themes/active.ts`](../active.ts).

## Typography

Same as the original PhotoBooth theme:

| Role | Font | CSS variable | Usage |
|------|------|--------------|--------|
| Display / buttons / caption input | **Caveat** (400, 700) | `--font-cursive` | Header title, primary buttons, strip caption |
| UI / hints / labels | **LXGW WenKai Mono TC** (400, 700) | `--font-mono` | Subtitle, countdown, status hints, swatch labels |
| Canvas strip caption | `Caveat, cursive` | — | Exported PNG caption rendering |

Configured in [`fonts.ts`](./fonts.ts) and [`fontTokens.ts`](./fontTokens.ts).

## Colors

### Neutrals

| Token | Hex | Usage |
|-------|-----|--------|
| Black | `#000000` | Primary text |
| Gray | `#CACACA` | Disabled / muted UI (e.g. unselected tab labels) |
| White | `#FFFFFF` | Tab pill, countdown selected bg, caption on dark frames |
| Overlay | `#202020` @ 80% opacity (`rgba(32, 32, 32, 0.8)`) | Camera hover overlay, upload slot overlay |

### Purple palette

| Token | Hex | Usage |
|-------|-----|--------|
| Purple dark | `#D4A0E7` | Selected swatch ring, primary button hover, accents |
| Purple light | `#EED6F7` | Primary buttons |
| Purple light 2 | `#F8E6FF` | Secondary buttons, tab track, empty frame slots |
| Purple bg | `#F9EBFF` | Page background, browser theme color |

### Gradient

| Token | Stops | Usage |
|-------|-------|--------|
| Purple gradient | `#D4A0E7` (0%) → `#EED6F7` (100%), both 100% opacity | Reserved for future UI (documented; not wired globally yet) |

Linear CSS equivalent:

```css
linear-gradient(90deg, #D4A0E7 0%, #EED6F7 100%)
```

## Assets

Static files live under [`public/sinno/`](../../public/sinno/). Paths are set in [`assets.ts`](./assets.ts).

| Asset | Path |
|-------|------|
| Page background | `/sinno/background.png` |
| Frame fill patterns | `/sinno/patterns/frame1.webp` … `frame5.png` |

Shared icons, printer chrome, and logo still reference `/figma/…` until SINNO-specific replacements are added.

Source design files may also be kept in repo-root [`sinno/`](../../sinno/); **`public/sinno/` is what the app serves.**

## Theme mapping

Implementation lives in [`colors.ts`](./colors.ts), [`frames.ts`](./frames.ts), and [`brand.ts`](./brand.ts).
