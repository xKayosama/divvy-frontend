const MAX_EDGE = 2400;
const MAX_PIXELS = 4_000_000;
// Bound OCR work without enlarging smaller receipts or altering PDFs.
export function receiptImageSize(width: number, height: number) {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  )
    throw new Error(
      'This photo has invalid dimensions. Please take another photo.',
    );
  const scale = Math.min(
    1,
    MAX_EDGE / width,
    MAX_EDGE / height,
    Math.sqrt(MAX_PIXELS / (width * height)),
  );
  return {
    width: Math.max(1, Math.floor(width * scale)),
    height: Math.max(1, Math.floor(height * scale)),
  };
}
export async function prepareReceiptImage(
  file: File,
  signal: AbortSignal,
): Promise<File> {
  signal.throwIfAborted();
  if (!file.type.startsWith('image/')) return file;
  let source: CanvasImageSource;
  let width: number;
  let height: number;
  let release: () => void;
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: 'from-image',
    });
    source = bitmap;
    width = bitmap.width;
    height = bitmap.height;
    release = () => bitmap.close();
  } else {
    const url = URL.createObjectURL(file);
    const image = new Image();
    try {
      image.src = url;
      await image.decode();
    } catch {
      URL.revokeObjectURL(url);
      throw new Error(
        'This photo could not be opened. Please take another photo.',
      );
    }
    source = image;
    width = image.naturalWidth;
    height = image.naturalHeight;
    release = () => URL.revokeObjectURL(url);
  }
  try {
    signal.throwIfAborted();
    const size = receiptImageSize(width, height);
    if (size.width === width && size.height === height) return file;
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');
    if (!context)
      throw new Error(
        'Could not prepare this photo. Please try a smaller image.',
      );
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, size.width, size.height);
    context.drawImage(source, 0, 0, size.width, size.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (value) =>
          value
            ? resolve(value)
            : reject(
                new Error(
                  'Could not prepare this photo. Please try a smaller image.',
                ),
              ),
        'image/jpeg',
        0.9,
      ),
    );
    signal.throwIfAborted();
    return new File(
      [blob],
      `${file.name.replace(/\.[^.]+$/, '') || 'receipt'}.jpg`,
      { type: 'image/jpeg', lastModified: file.lastModified },
    );
  } finally {
    release();
  }
}
export function receiptScanError(error: unknown) {
  const status = (error as { status?: number | string })?.status;
  if (status === 504)
    return 'Receipt scanning took too long. Try a closer, well-lit photo of just the receipt, then scan again.';
  if (status === 'TIMEOUT_ERROR')
    return 'The scan request timed out. Check your connection and try again with a clearer photo.';
  return (
    (error as { data?: { message?: string } })?.data?.message ||
    (error instanceof Error
      ? error.message
      : 'Could not scan this receipt. Try a clearer file or enter the expense manually.')
  );
}
