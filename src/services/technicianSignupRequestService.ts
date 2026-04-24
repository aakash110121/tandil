import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AxiosError } from 'axios';
import { authService } from './authService';
import { publicApiClient } from './api';

function messageFromRegisterTechnicianResponse(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  const errs = d.errors;
  if (errs && typeof errs === 'object' && errs !== null) {
    for (const key of Object.keys(errs as Record<string, unknown>)) {
      const v = (errs as Record<string, unknown[]>)[key];
      if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string') {
        return v[0];
      }
    }
  }
  if (typeof d.message === 'string') return d.message;
  if (typeof d.error === 'string') return d.error;
  return null;
}

const STORAGE_KEY = 'technician_signup_requests_v1';

/**
 * TEMPORARY — set to `false` before production / after client video.
 * When true, `register-technician` always sends `TECHNICIAN_SIGNUP_DEMO_SERVICE_AREA_VALUE`
 * so the API accepts signup regardless of GPS; the UI can still show the real geocoded label.
 */
export const TECHNICIAN_SIGNUP_DEMO_SERVICE_AREA = true;
export const TECHNICIAN_SIGNUP_DEMO_SERVICE_AREA_VALUE = 'Dubai';

export interface TechnicianSignupRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  service_area?: string;
  password: string;
  password_confirmation: string;
  created_at: string;
}

async function readAll(): Promise<TechnicianSignupRequest[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(list: TechnicianSignupRequest[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export const technicianSignupRequestService = {
  async createRequest(params: {
    name: string;
    email: string;
    phone: string;
    service_area?: string;
    password: string;
    password_confirmation: string;
  }): Promise<TechnicianSignupRequest> {
    const serviceAreaForApi =
      TECHNICIAN_SIGNUP_DEMO_SERVICE_AREA && TECHNICIAN_SIGNUP_DEMO_SERVICE_AREA_VALUE.trim()
        ? TECHNICIAN_SIGNUP_DEMO_SERVICE_AREA_VALUE.trim()
        : params.service_area?.trim() || '';

    let response;
    try {
      response = await publicApiClient.post('/auth/register-technician', {
        name: params.name.trim(),
        email: params.email.trim(),
        phone: params.phone.trim(),
        service_area: serviceAreaForApi,
        password: params.password,
        password_confirmation: params.password_confirmation,
      });
    } catch (e) {
      const ax = e as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
      const fromBody = messageFromRegisterTechnicianResponse(ax.response?.data);
      throw new Error(fromBody || ax.message || 'Technician signup request failed.');
    }
    const body = response?.data ?? {};
    if (body?.success !== true) {
      throw new Error(
        messageFromRegisterTechnicianResponse(body) || body?.message || 'Technician signup request failed.'
      );
    }
    const resolvedServiceArea =
      body?.data?.service_area ??
      (params.service_area?.trim() || serviceAreaForApi || undefined);
    return {
      id: String(body?.data?.request_id ?? `${Date.now()}`),
      name: params.name.trim(),
      email: params.email.trim(),
      phone: params.phone.trim(),
      service_area: resolvedServiceArea,
      password: params.password,
      password_confirmation: params.password_confirmation,
      created_at: new Date().toISOString(),
    };
  },

  async getRequests(): Promise<TechnicianSignupRequest[]> {
    const list = await readAll();
    const sorted = list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    if (sorted.length > 0) return sorted;
    return [
      {
        id: 'dummy-request-1',
        name: 'Ali Technician',
        email: 'ali.tech@example.com',
        phone: '+971501112233',
        service_area: 'Abu Dhabi',
        password: 'dummy123',
        password_confirmation: 'dummy123',
        created_at: new Date().toISOString(),
      },
    ];
  },

  async rejectRequest(id: string): Promise<void> {
    const list = await readAll();
    const next = list.filter((item) => item.id !== id);
    await writeAll(next);
  },

  async approveRequest(id: string): Promise<void> {
    const list = await readAll();
    const request = list.find((item) => item.id === id);
    if (!request) throw new Error('Request not found.');

    await authService.register({
      name: request.name,
      email: request.email,
      phone: request.phone,
      password: request.password,
      password_confirmation: request.password_confirmation,
      role: 'technician',
    });

    const next = list.filter((item) => item.id !== id);
    await writeAll(next);
  },
};

