import apiClient from './api';

export interface TechnicianWeeklyKpis {
  earnings: number;
  visits_done: number;
  rating: number;
}

/** Task as returned by GET /api/technician/dashboard today_tasks */
export interface TechnicianTodayTask {
  id: number | string;
  scheduled_date?: string;
  scheduled_time?: string;
  status?: string;
  farm_name?: string;
  service_name?: string;
  location?: string;
  duration_minutes?: number;
  client_name?: string;
  client_id?: number;
  area?: string;
  accepted_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  /** Legacy field names */
  customer_name?: string;
  customerName?: string;
  service?: string;
  address?: string;
  scheduledTime?: string;
  estimated_duration?: string;
  estimatedDuration?: string;
  task_type?: string;
  taskType?: string;
  [key: string]: unknown;
}

/** Recent visit as returned by GET /api/technician/dashboard recent_visits */
export interface TechnicianRecentVisit {
  id: number | string;
  farm_name: string;
  service_name: string;
  date: string;
  price: number;
  price_display?: string;
  rating: number;
}

export interface TechnicianDashboardData {
  name: string;
  email: string;
  employee_id: string;
  is_online: boolean;
  profile_picture?: string | null;
  profile_picture_url?: string | null;
  designation?: string;
  weekly_kpis: TechnicianWeeklyKpis;
  today_tasks: TechnicianTodayTask[];
  recent_visits?: TechnicianRecentVisit[];
}

export interface TechnicianDashboardResponse {
  success?: boolean;
  data?: TechnicianDashboardData;
}

/**
 * GET /api/technician/dashboard
 * Returns technician profile, weekly KPIs, and today's tasks. Requires Bearer token.
 */
export async function getTechnicianDashboard(): Promise<TechnicianDashboardData | null> {
  const response = await apiClient.get<TechnicianDashboardResponse>('/technician/dashboard', {
    timeout: 15000,
  });
  if (response.data?.success && response.data?.data) {
    return response.data.data;
  }
  return null;
}

/** Profile response from GET /api/technician/profile */
export interface TechnicianNotificationPreferences {
  push_enabled?: boolean;
  email_enabled?: boolean;
}

export interface TechnicianProfileData {
  name: string;
  email: string;
  phone?: string | null;
  profile_picture?: string | null;
  profile_picture_url?: string | null;
  employee_id?: string;
  rating: number;
  jobs_completed: number;
  total_earnings: number;
  member_since: string;
  specializations: string[];
  service_area?: string | null;
  notification_preferences?: TechnicianNotificationPreferences | null;
  availability?: unknown;
}

export interface TechnicianProfileResponse {
  success?: boolean;
  data?: TechnicianProfileData;
}

/**
 * GET /api/technician/profile
 * Returns full technician profile. Requires Bearer token.
 */
export async function getTechnicianProfile(): Promise<TechnicianProfileData | null> {
  const response = await apiClient.get<TechnicianProfileResponse>('/technician/profile', {
    timeout: 15000,
  });
  if (response.data?.success && response.data?.data) {
    return response.data.data;
  }
  return null;
}

/** Params for POST /api/technician/profile (form-data). Omit optional fields to leave unchanged. */
export interface TechnicianProfileUpdateParams {
  name?: string;
  email?: string;
  phone?: string;
  service_area?: string;
  /** Comma-separated e.g. "AC,Plumbing" */
  specializations?: string;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
  profile_picture?: { uri: string; type?: string; name?: string };
}

/**
 * POST /api/technician/profile (form-data)
 * Updates technician profile. Requires Bearer token.
 */
export async function updateTechnicianProfile(params: TechnicianProfileUpdateParams): Promise<TechnicianProfileData | null> {
  const formData = new FormData();
  if (params.name != null) formData.append('name', params.name);
  if (params.email != null) formData.append('email', params.email);
  if (params.phone != null) formData.append('phone', params.phone);
  if (params.service_area != null) formData.append('service_area', params.service_area);
  if (params.specializations != null) formData.append('specializations', params.specializations);
  if (params.current_password != null) formData.append('current_password', params.current_password);
  if (params.password != null) formData.append('password', params.password);
  if (params.password_confirmation != null) formData.append('password_confirmation', params.password_confirmation);
  if (params.profile_picture?.uri) {
    formData.append('profile_picture', {
      uri: params.profile_picture.uri,
      type: params.profile_picture.type || 'image/jpeg',
      name: params.profile_picture.name || 'profile.jpg',
    } as any);
  }
  const response = await apiClient.post<TechnicianProfileResponse>('/technician/profile', formData, {
    timeout: 30000,
  });
  if (response.data?.success && response.data?.data) {
    return response.data.data;
  }
  return null;
}
