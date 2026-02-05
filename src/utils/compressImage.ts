/**
 * Compress and resize an image for faster uploads.
 * Max width 1200px (keeps aspect ratio), JPEG compress 0.65.
 * Returns original uri if compression fails or package is missing.
 */
const MAX_WIDTH = 1200;
const COMPRESS = 0.65;

export async function compressImageForUpload(uri: string): Promise<string> {
  try {
    const ImageManipulator = require('expo-image-manipulator');
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: MAX_WIDTH } }],
      { compress: COMPRESS, format: ImageManipulator.SaveFormat?.JPEG ?? 'jpeg' }
    );
    return result?.uri ?? uri;
  } catch (_) {
    return uri;
  }
}

/**
 * Compress multiple image URIs. Returns array of URIs (compressed or original on failure).
 */
export async function compressImagesForUpload(uris: string[]): Promise<string[]> {
  const results: string[] = [];
  for (const uri of uris) {
    results.push(await compressImageForUpload(uri));
  }
  return results;
}
