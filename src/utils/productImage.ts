import { buildFullImageUrl } from '../config/api';
import type { AdminProduct } from '../services/adminService';

function withCacheBuster(url: string, version: string | number | null | undefined): string {
  if (version == null || String(version).trim() === '') return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${encodeURIComponent(String(version))}`;
}

/**
 * Resolve the primary/first product image URL from API response (list or single product).
 * Handles image_url, primary_image, images[], thumbnail_url, etc.
 */
export function getProductImageUri(item: AdminProduct | null | undefined): string | null {
  if (!item) return null;
  const o = item as Record<string, unknown>;
  const thumbnailUrl =
    typeof o['thumbnail_url'] === 'string' && (o['thumbnail_url'] as string).trim()
      ? (o['thumbnail_url'] as string)
      : null;
  const imageUrl = o['image_url'] ?? item.image_url;
  const image = o['image'] ?? item.image;
  const primary = o['primary_image'] as
    | { image_path?: string; image_url?: string; thumbnail_url?: string }
    | null;
  const primaryUrl = primary?.image_url;
  const primaryThumb = primary?.thumbnail_url;
  const primaryPath = primary?.image_path ?? item.primary_image?.image_path;
  const imagesArr =
    (o['images'] as Array<{
      image_path?: string;
      image_url?: string;
      thumbnail_url?: string;
      is_primary?: number;
    }> | null) ?? item.images;
  const firstImg = imagesArr?.length
    ? (imagesArr.find((i) => i.is_primary === 1 || i.is_primary === true) ?? imagesArr[0])
    : null;
  const firstImgUrl = firstImg?.image_url;
  const firstImgThumb = firstImg?.thumbnail_url;
  const firstImgPath = firstImg?.image_path;
  const raw =
    (thumbnailUrl ?? null) ??
    (typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl : null) ??
    (typeof primaryThumb === 'string' && primaryThumb.trim() ? primaryThumb : null) ??
    (typeof primaryUrl === 'string' && primaryUrl.trim() ? primaryUrl : null) ??
    (typeof image === 'string' && image.trim() ? image : null) ??
    (typeof primaryPath === 'string' && primaryPath.trim() ? primaryPath : null) ??
    (typeof firstImgThumb === 'string' && firstImgThumb.trim() ? firstImgThumb : null) ??
    (typeof firstImgUrl === 'string' && firstImgUrl.trim() ? firstImgUrl : null) ??
    (typeof firstImgPath === 'string' && firstImgPath.trim() ? firstImgPath : null);
  if (!raw || typeof raw !== 'string' || !raw.trim()) return null;
  const fullUrl = buildFullImageUrl(raw);
  const version =
    // Prefer image-level updated_at when available (some endpoints include it)
    (o['primary_image'] as any)?.updated_at ??
    (o['updated_at'] as any) ??
    (item as any)?.updated_at ??
    // Fallback to ids (changes when a new image record is created)
    (o['primary_image'] as any)?.id ??
    (item.primary_image as any)?.id ??
    (firstImg as any)?.id ??
    null;
  return withCacheBuster(fullUrl, version);
}
