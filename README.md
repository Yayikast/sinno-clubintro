# Photobooth

A mobile-first web app for taking photobooth photo strips. Choose a layout, capture photos with a countdown, review and retake, pick a frame color, and download your strip as a PNG.

## Features

- **3 layout options** — 6:2 vertical (3 or 4 photos) and 6:5 grid (2×2)
- **Countdown timer** — 3, 5, or 10 seconds before each capture
- **Review & retake** — retake any individual photo
- **Frame colors** — white, black, blush, sage, navy, gold
- **Download** — save the composed strip as PNG

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing on Mobile

Camera access requires a **secure context** (HTTPS or localhost).

- **Same device:** Use `http://localhost:3000` if testing in the mobile browser on your dev machine.
- **LAN testing:** Run `npm run dev` and open `http://<your-local-ip>:3000` on your phone. Camera may be blocked over HTTP on some browsers — use HTTPS via a tunnel (e.g. ngrok) for reliable mobile camera access.

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Framer Motion
- react-webcam
- Canvas API (strip composition)

## User Flow

1. Choose layout (visual photostrip preview)
2. Capture photos with countdown
3. Review and retake individual photos
4. Confirm photos
5. Choose frame color
6. Confirm frame preview
7. Download PNG
