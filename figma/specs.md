# Photobooth Design Specs

## Fonts

| Font | Usage |
|------|-------|
| **Figma Hand** | Decorative cursive |
| **LXGW WenKai Mono TC** | Explanation / body text |

## Colors

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| Black | `#000000` | Primary text |
| Gray | `#CACACA` | Disabled text |
| White | `#FFFFFF` | Text on dark backgrounds |

### UI
| Token | Hex | Usage |
|-------|-----|-------|
| Overlay | `#202020` at 80% opacity | Hover overlay on camera |
| Pink dark | `#FFA8BD` | Accent |
| Pink light | `#FFDEE6` | Primary button |
| Pink light 2 | `#FFEDF1` | Secondary button |
| Pink bg | `#FFF5F7` | Page background |

### Gradient
| Token | Value | Usage |
|-------|-------|-------|
| Pink gradient | `#FFA8BD` (0%) → `#FFDEE6` (100%), both 100% opacity | Gradient fills |

```css
background: linear-gradient(180deg, #FFA8BD 0%, #FFDEE6 100%);
```

## Assets

### Pages (`figma/pages/`)
- `1 Landing.png` — Landing / layout picker
- `2 Add Photo - *` — Photo capture flow (gallery + camera variants)
- `3 Customize.png` — Frame customization
- `4 Print.png` — Final print / download

### Icons (`figma/icons/`)
- `back.svg`, `home.svg`, `gallery.svg`
- `camera-black.svg`, `camera-white.svg`
- `download.svg`, `print.svg`

### Decorations (`figma/decorations/`)
- `background.png` — Full page background
- `bg-decor.png` — Additional background decoration
- `star-dark.png`, `star-light.png`, `star-white.png`

### Frames (`figma/frames/`)
- `Frame1.svg` through `Frame5.svg` — 5 photobooth frame styles

## Notes

- Frame selection uses 5 SVG frame styles (not solid color borders).
- Page background uses `background.png` as the complete background layer.
- Decorative stars available in dark, light, and white variants.
