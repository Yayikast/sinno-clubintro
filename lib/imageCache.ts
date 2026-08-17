const imageCache = new Map<string, Promise<HTMLImageElement>>();

/**
 * Loads an image and memoizes the in-flight/resolved promise by src.
 * Only use for finite, stable asset URLs (patterns, frame SVGs, icons) —
 * never for one-off data URLs (e.g. captured photos), which would grow
 * the cache unbounded over a long session.
 */
export function loadCachedImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached) return cached;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => {
      imageCache.delete(src);
      reject(new Error(`Failed to load image: ${src}`));
    };
    image.src = src;
  });

  imageCache.set(src, promise);
  return promise;
}
