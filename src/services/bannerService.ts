import { publicApiClient } from './api';
import { buildFullImageUrl } from '../config/api';

export interface Banner {
  id: number;
  title: string;
  description?: string | null;
  button_text?: string | null;
  button_link?: string | null;
  image?: string | null;
  image_url?: string | null;
  priority?: number;
  is_active?: boolean;
}

/** GET /api/banners – customer-facing banners for home slider. Returns active banners sorted by priority (asc). */
export async function getBanners(): Promise<Banner[]> {
  try {
    const response = await publicApiClient.get<{ data?: Banner[]; banners?: Banner[] } | Banner[]>('/banners', {
      timeout: 15000,
    });
    const body = response?.data ?? response;
    const list = Array.isArray(body)
      ? body
      : Array.isArray((body as any)?.data)
        ? (body as any).data
        : Array.isArray((body as any)?.banners)
          ? (body as any).banners
          : [];
    const active = list.filter((b) => b.is_active !== false);
    active.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
    return active;
  } catch (_) {
    return [];
  }
}

export function getBannerImageUrl(banner: Banner): string | null {
  const raw = banner.image_url ?? banner.image ?? null;
  if (!raw) return null;
  return raw.startsWith('http') ? raw : buildFullImageUrl(raw);
}
