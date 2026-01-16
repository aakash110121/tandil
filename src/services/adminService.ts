import apiClient from './api';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  roles?: Array<{
    id: number;
    name: string;
    guard_name?: string;
    created_at?: string;
    updated_at?: string;
    pivot?: {
      model_type: string;
      model_id: number;
    };
  }>;
}

export interface UsersResponse {
  message?: string;
  status?: boolean;
  data: AdminUser[] | {
    current_page?: number;
    data: AdminUser[];
    first_page_url?: string;
    from?: number;
    last_page?: number;
    last_page_url?: string;
    links?: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    next_page_url?: string | null;
    path?: string;
    per_page?: number;
    prev_page_url?: string | null;
    to?: number;
    total?: number;
  };
}

export const adminService = {
  getUsers: async (params?: { 
    page?: number; 
    per_page?: number;
    search?: string;
    role?: string;
  }): Promise<UsersResponse> => {
    const response = await apiClient.get<UsersResponse>('/admin/users', { params });
    return response.data;
  },

  getUserById: async (userId: number): Promise<{ status: boolean; data: AdminUser }> => {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  createUser: async (userData: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirmation: string;
    role: string;
    status: string;
  }): Promise<{ status: boolean; data: AdminUser; message?: string }> => {
    const response = await apiClient.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (userId: number, userData: {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    password_confirmation?: string;
    role?: string;
    status?: string;
  }): Promise<{ status: boolean; data: AdminUser; message?: string }> => {
    const response = await apiClient.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: number): Promise<{ status: boolean; message?: string }> => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },

  getDashboardStatistics: async (params?: {
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }): Promise<{
    success: boolean;
    data: {
      customers: {
        total: number;
        daily: number;
        weekly: number;
        monthly: number;
        yearly: number;
        growth: {
          daily: string;
          weekly: string;
          monthly: string;
          yearly: string;
        };
      };
      technicians: {
        total: number;
        daily: number;
        weekly: number;
        monthly: number;
        yearly: number;
        growth: {
          daily: string;
          weekly: string;
          monthly: string;
          yearly: string;
        };
      };
      employees?: {
        total: number;
        daily: number;
        weekly: number;
        monthly: number;
        yearly: number;
        growth: {
          daily: string;
          weekly: string;
          monthly: string;
          yearly: string;
        };
      };
      total_users?: {
        total: number;
        daily: number;
        weekly: number;
        monthly: number;
        yearly: number;
        growth: {
          daily: string;
          weekly: string;
          monthly: string;
          yearly: string;
        };
      };
      active_subscriptions?: {
        total: number;
        daily: number;
        weekly: number;
        monthly: number;
        yearly: number;
        growth: {
          daily: string;
          weekly: string;
          monthly: string;
          yearly: string;
        };
      };
      monthly_revenue?: {
        total: number;
        daily: number;
        weekly: number;
        monthly: number;
        yearly: number;
        growth: {
          daily: string;
          weekly: string;
          monthly: string;
          yearly: string;
        };
      };
    };
  }> => {
    const response = await apiClient.get('/admin/dashboard/statistics', { params });
    return response.data;
  },
};

