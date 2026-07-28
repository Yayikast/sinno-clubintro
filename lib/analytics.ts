import { track } from "@vercel/analytics";

type PhotoboothEvent =
  | "photobooth_started"
  | "photobooth_photos_completed"
  | "photobooth_strip_printed"
  | "photobooth_strip_downloaded";

export function trackPhotobooth(
  event: PhotoboothEvent,
  data?: Record<string, string | number | boolean>,
) {
  track(event, data);
}
