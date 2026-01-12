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
    guard_name: string;
    created_at: string;
    updated_at: string;
    pivot: {
      model_type: string;
      model_id: number;
    };
  }>;
}

export interface UsersResponse {
  status: boolean;
  data: {
    current_page: number;
    data: AdminUser[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
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
};

