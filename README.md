# PhotoBooth

A mobile-first photobooth web app. Choose a frame layout, take or upload photos, customize your strip, and download.

## Features

- **5 frame layouts** — 2, 3, or 4 photos (vertical, 1+2, or 2×2 grid)
- **Take Photos or Upload** — camera capture or gallery upload per slot
- **Countdown timer** — 3, 5, or 10 seconds
- **Inline retake** — retake individual photos before continuing
- **Customize** — frame color, caption text, and text color (solid colors)
- **Print & download** — animated print screen, then save PNG

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Design Assets

Figma reference files live in `figma/` (source) and `public/figma/` (served assets):

- `pages/` — screen mockups
- `icons/` — UI icons
- `decorations/` — background and stars
- `frames/` — Frame1–5 SVG layouts
- `specs.md` — colors and fonts

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Framer Motion
- react-webcam
- Canvas API (strip composition)

## User Flow

1. **Landing** — pick frame layout, tap Select
2. **Add Photo** — Take Photos or Upload tab, capture/upload all slots, tap Next
3. **Customize** — frame color, text color, caption, tap Print
4. **Print** — printing animation, then Home or Download

## Mobile Testing

Camera requires HTTPS or localhost. For phone testing over LAN, use a tunnel (e.g. ngrok) for reliable camera access.
