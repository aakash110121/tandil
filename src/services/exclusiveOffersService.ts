/**
 * Public exclusive offers API (no auth).
 * GET /api/exclusive-offers – list exclusive offers for user dashboard.
 */
import { publicApiClient } from './api';

export interface PublicExclusiveOffer {
  id: number;
  title?: string | null;
  description?: string | null;
  image_url?: string | null;
  discount_type?: string | null;
  discount_value?: number | string | null;
  applies_to?: string | null;
  product_ids?: number[];
  start_date?: string | null;
  end_date?: string | null;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

interface ExclusiveOffersApiResponse {
  success?: boolean;
  message?: string;
  data?: {
    data?: PublicExclusiveOffer[];
    pagination?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

/**
 * GET /exclusive-offers (no token).
 * Returns list of exclusive offers. Response shape: { success, message, data: { data: [...], pagination } }.
 */
export async function getExclusiveOffers(params?: {
  per_page?: number;
  page?: number;
}): Promise<PublicExclusiveOffer[]> {
  const response = await publicApiClient.get<ExclusiveOffersApiResponse>('/exclusive-offers', {
    params: { per_page: params?.per_page ?? 20, page: params?.page ?? 1 },
    timeout: 15000,
  });
  const outer = response.data?.data;
  if (Array.isArray(outer)) return outer;
  const list = outer && typeof outer === 'object' && Array.isArray((outer as any).data) ? (outer as any).data : [];
  return list;
}
