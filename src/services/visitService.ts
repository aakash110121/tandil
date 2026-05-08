/**
 * User visit / area resolution API (authenticated).
 * POST /api/visits/resolve-area — multipart form-data; fields are optional on the server.
 */
import apiClient from './api';

export interface ResolveVisitAreaParams {
  area_id?: number;
  full_name?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface ResolveVisitAreaResult {
  success: boolean;
  message?: string;
  data?: unknown;
}

function appendIfPresent(form: FormData, key: string, value: string | undefined) {
  const trimmed = (value ?? '').trim();
  if (trimmed !== '') {
    form.append(key, trimmed);
  }
}

/**
 * POST /visits/resolve-area
 * Sends only non-empty string fields and coordinates when provided.
 */
export async function resolveVisitArea(params: ResolveVisitAreaParams): Promise<ResolveVisitAreaResult> {
  const form = new FormData();
  if (params.area_id != null && Number.isFinite(params.area_id)) {
    form.append('area_id', String(params.area_id));
  }
  appendIfPresent(form, 'full_name', params.full_name);
  appendIfPresent(form, 'street_address', params.street_address);
  appendIfPresent(form, 'city', params.city);
  appendIfPresent(form, 'state', params.state);
  appendIfPresent(form, 'zip_code', params.zip_code);
  appendIfPresent(form, 'country', params.country);
  if (params.latitude != null && Number.isFinite(params.latitude)) {
    form.append('latitude', String(params.latitude));
  }
  if (params.longitude != null && Number.isFinite(params.longitude)) {
    form.append('longitude', String(params.longitude));
  }

  try {
    const response = await apiClient.post<{
      success?: boolean;
      message?: string;
      data?: unknown;
    }>('/visits/resolve-area', form, { timeout: 20000 });

    const payload = response.data;
    if (payload && typeof payload === 'object' && payload.success === false) {
      return {
        success: false,
        message: typeof payload.message === 'string' ? payload.message : undefined,
        data: payload.data,
      };
    }
    return {
      success: true,
      message: typeof payload?.message === 'string' ? payload.message : undefined,
      data: payload?.data,
    };
  } catch (err: unknown) {
    const ax = err as { response?: { data?: { message?: string } }; message?: string };
    const serverMsg = ax?.response?.data?.message;
    const msg =
      typeof serverMsg === 'string'
        ? serverMsg
        : typeof ax?.message === 'string'
          ? ax.message
          : 'Could not resolve service area.';
    return { success: false, message: msg };
  }
}
