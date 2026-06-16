/**
 * Client-Side Image Processing Utilities
 *
 * Provides lightweight image resizing via the browser Canvas API so that
 * photos captured on mobile devices can be compressed before being sent
 * to the Gemini AI service.
 *
 * @module imageUtils
 */

/**
 * Resize an image file to fit within a maximum dimension and return it as a
 * base64-encoded JPEG data URI.
 *
 * The aspect ratio is always preserved. If the image is already smaller than
 * `maxSize` in both dimensions it is still re-encoded at the target quality
 * to ensure a consistent output format.
 *
 * @param file     - The source image `File` (e.g. from an `<input type="file">`)
 * @param maxSize  - Maximum width **or** height in pixels (default: `512`)
 * @param quality  - JPEG compression quality between `0` (worst) and `1` (best)
 *                   (default: `0.7`)
 * @returns A `Promise` that resolves with a `data:image/jpeg;base64,…` URI
 *
 * @throws {Error} If the file cannot be read or drawn to a canvas
 *
 * @example
 * ```ts
 * const dataUri = await resizeImageToBase64(fileInput.files[0], 512, 0.7);
 * // → "data:image/jpeg;base64,/9j/4AAQ..."
 * ```
 */
export async function resizeImageToBase64(
  file: File,
  maxSize: number = 512,
  quality: number = 0.7,
): Promise<string> {
  // 1. Read the File as a data URL so we can load it into an <img>
  const originalDataUrl = await readFileAsDataUrl(file);

  // 2. Decode the image to get its natural dimensions
  const img = await loadImage(originalDataUrl);

  // 3. Compute the scaled dimensions (preserve aspect ratio)
  const { width, height } = computeScaledDimensions(
    img.naturalWidth,
    img.naturalHeight,
    maxSize,
  );

  // 4. Draw to an off-screen canvas and export as JPEG
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to obtain 2D canvas context');
  }

  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', quality);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Read a `File` object as a base64 data URL via `FileReader`.
 */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('FileReader did not return a string'));
      }
    };

    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${reader.error?.message ?? 'unknown error'}`));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Create an `HTMLImageElement` from a source URL, waiting for it to decode.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));

    img.src = src;
  });
}

/**
 * Compute new dimensions that fit within `maxSize` while preserving aspect
 * ratio. If both dimensions are already within bounds the original sizes
 * are returned unchanged.
 */
function computeScaledDimensions(
  originalWidth: number,
  originalHeight: number,
  maxSize: number,
): { width: number; height: number } {
  if (originalWidth <= maxSize && originalHeight <= maxSize) {
    return { width: originalWidth, height: originalHeight };
  }

  const ratio = Math.min(maxSize / originalWidth, maxSize / originalHeight);

  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio),
  };
}
