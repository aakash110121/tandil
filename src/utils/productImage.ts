import { buildFullImageUrl } from '../config/api';
import type { AdminProduct } from '../services/adminService';

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
  return buildFullImageUrl(raw);
}
