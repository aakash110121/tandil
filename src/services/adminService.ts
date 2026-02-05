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

  getUsersStatistics: async (): Promise<{
    success: boolean;
    data: {
      all_users: number;
      workers: number;
      supervisors: number;
      managers: number;
    };
  }> => {
    const response = await apiClient.get('/admin/users/statistics');
    return response.data;
  },

  getRecentActivities: async (params?: { limit?: number }): Promise<{ success: boolean; data: AdminActivity[] }> => {
    const response = await apiClient.get<{ success: boolean; data: AdminActivity[] }>(
      '/admin/dashboard/recent-activities',
      { params, timeout: 60000 }
    );
    return response.data;
  },

  // Reports API
  getReports: async (params?: {
    page?: number;
    per_page?: number;
    status?: 'pending' | 'generated' | 'scheduled';
    type?: string;
  }): Promise<ReportsListResponse> => {
    const response = await apiClient.get<ReportsListResponse>('/admin/reports', { params });
    return response.data;
  },

  generateReport: async (body: {
    type: string;
    title: string;
    parameters: {
      start_date: string;
      end_date: string;
      format?: string;
      include_charts?: boolean;
      include_details?: boolean;
    };
  }): Promise<{ success: boolean; message: string; data: AdminReport }> => {
    const response = await apiClient.post<{ success: boolean; message: string; data: AdminReport }>(
      '/admin/reports/generate',
      body
    );
    return response.data;
  },

  scheduleReport: async (body: {
    type: string;
    title: string;
    scheduled_at: string; // "YYYY-MM-DD HH:MM:SS"
    recurrence?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
    parameters: {
      start_date: string;
      end_date: string;
      format?: string;
      include_charts?: boolean;
    };
  }): Promise<{ message: string; data: AdminReport }> => {
    const response = await apiClient.post<{ message: string; data: AdminReport }>(
      '/admin/reports/schedule',
      body
    );
    return response.data;
  },

  deleteReport: async (reportId: number): Promise<{ success?: boolean; message: string }> => {
    const response = await apiClient.delete<{ success?: boolean; message: string }>(
      `/admin/reports/${reportId}`
    );
    return response.data;
  },

  cancelScheduledReport: async (reportId: number): Promise<{ success?: boolean; message: string }> => {
    const response = await apiClient.delete<{ success?: boolean; message: string }>(
      `/admin/reports/${reportId}/cancel`
    );
    return response.data;
  },

  // Admin products list (uses Bearer token)
  getProducts: async (params?: {
    search?: string;
    category_id?: string | number;
    filter?: string;
    per_page?: number;
    page?: number;
  }): Promise<{
    status: boolean;
    message?: string;
    data: AdminProduct[];
    pagination: { current_page: number; last_page: number; per_page: number; total: number };
  }> => {
    const response = await apiClient.get('/admin/products', { params });
    return response.data;
  },

  // Admin product details (GET /admin/products/:id)
  // Response shape can vary across backends, so we keep it flexible.
  getProductById: async (
    productId: number
  ): Promise<{ status?: boolean; success?: boolean; message?: string; data: AdminProduct }> => {
    const response = await apiClient.get(`/admin/products/${productId}`);
    return response.data;
  },

  // Create product (POST /admin/products, Bearer token) – JSON body
  createProduct: async (body: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    status: string;
    category_id?: number | null;
    weight_unit?: string;
    sku: string;
    handle: string;
    image_urls?: string[];
  }): Promise<{
    status: boolean;
    message?: string;
    data: AdminProductCreated;
  }> => {
    const response = await apiClient.post('/admin/products', body, { timeout: 60000 });
    return response.data;
  },

  // Create product with image files (multipart). API expects main_image (primary) + images[] (extra).
  createProductWithImages: async (params: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    status: string;
    category_id?: number | null;
    weight_unit?: string;
    sku: string;
    handle: string;
    image_urls?: string[];
    mainImage: { uri: string };
    extraImages?: { uri: string }[];
  }): Promise<{ status: boolean; message?: string; data: AdminProductCreated }> => {
    const formData = new FormData();
    formData.append('name', params.name);
    if (params.description) formData.append('description', params.description);
    formData.append('price', String(params.price));
    formData.append('stock', String(params.stock));
    formData.append('status', params.status);
    if (params.category_id != null) formData.append('category_id', String(params.category_id));
    if (params.weight_unit) formData.append('weight_unit', params.weight_unit);
    formData.append('sku', params.sku);
    formData.append('handle', params.handle);
    if (params.image_urls?.length) {
      formData.append('image_urls', JSON.stringify(params.image_urls));
    }
    formData.append('main_image', {
      uri: params.mainImage.uri,
      type: 'image/jpeg',
      name: 'main-image.jpg',
    } as any);
    (params.extraImages ?? []).forEach((file, index) => {
      formData.append('images[]', {
        uri: file.uri,
        type: 'image/jpeg',
        name: `image-${index}.jpg`,
      } as any);
    });
    const response = await apiClient.post('/admin/products', formData, { timeout: 300000 });
    return response.data;
  },

  // Update product (PUT /admin/products/:id, Bearer token) – JSON body
  updateProduct: async (
    productId: number,
    body: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      status?: string;
      category_id?: number | null;
      weight_unit?: string;
      sku?: string;
      handle?: string;
      image_urls?: string[];
    }
  ): Promise<{ status: boolean; message?: string; updated_fields?: string[]; data: AdminProductCreated }> => {
    const response = await apiClient.put(`/admin/products/${productId}`, body, { timeout: 60000 });
    return response.data;
  },

  // Update product with image files (PUT /admin/products/:id, multipart). API: main_image (optional) + images[] (replace extra).
  updateProductWithImages: async (
    productId: number,
    params: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      status?: string;
      category_id?: number | null;
      weight_unit?: string;
      sku?: string;
      handle?: string;
      image_urls?: string[];
      mainImage?: { uri: string };
      extraImages?: { uri: string }[];
    }
  ): Promise<{ status: boolean; message?: string; updated_fields?: string[]; data: AdminProductCreated }> => {
    const formData = new FormData();
    if (params.name !== undefined) formData.append('name', params.name);
    if (params.description !== undefined) formData.append('description', params.description ?? '');
    if (params.price !== undefined) formData.append('price', String(params.price));
    if (params.stock !== undefined) formData.append('stock', String(params.stock));
    if (params.status !== undefined) formData.append('status', params.status);
    if (params.category_id != null) formData.append('category_id', String(params.category_id));
    if (params.weight_unit) formData.append('weight_unit', params.weight_unit);
    if (params.sku !== undefined) formData.append('sku', params.sku);
    if (params.handle !== undefined) formData.append('handle', params.handle);
    if (params.image_urls?.length) {
      formData.append('image_urls', JSON.stringify(params.image_urls));
    }
    if (params.mainImage) {
      formData.append('main_image', {
        uri: params.mainImage.uri,
        type: 'image/jpeg',
        name: 'main-image.jpg',
      } as any);
    }
    (params.extraImages ?? []).forEach((file, index) => {
      formData.append('images[]', {
        uri: file.uri,
        type: 'image/jpeg',
        name: `image-${index}.jpg`,
      } as any);
    });
    const response = await apiClient.put(`/admin/products/${productId}`, formData, { timeout: 300000 });
    return response.data;
  },

  // Delete product (DELETE /admin/products/:id, Bearer token)
  deleteProduct: async (productId: number): Promise<{ status: boolean; message?: string }> => {
    const response = await apiClient.delete(`/admin/products/${productId}`);
    return response.data;
  },

  // Categories (GET /admin/categories, Bearer token)
  getCategories: async (params?: { page?: number; per_page?: number }): Promise<AdminCategoriesResponse> => {
    const response = await apiClient.get<AdminCategoriesResponse>('/admin/categories', { params });
    return response.data;
  },
};

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
  products_count?: number;
}

export interface AdminCategoriesResponse {
  success: boolean;
  message?: string;
  data: {
    current_page: number;
    data: AdminCategory[];
    first_page_url?: string;
    from?: number;
    last_page: number;
    last_page_url?: string;
    links?: Array<{ url: string | null; label: string; page: number | null; active: boolean }>;
    next_page_url?: string | null;
    path?: string;
    per_page: number;
    prev_page_url?: string | null;
    to?: number;
    total: number;
  };
}

// Admin product (for list from GET /admin/products)
export interface AdminProduct {
  id: number;
  category_id?: number;
  name: string;
  vendor?: string;
  type?: string;
  sku?: string;
  description?: string;
  price: string;
  stock?: number;
  status?: string;
  weight_unit?: string;
  handle?: string;
  image?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
  category?: { id: number; name: string; slug?: string };
  primary_image?: { id?: number; image_path?: string; image_url?: string };
  images?: Array<{ id?: number; image_path?: string; image_url?: string; is_primary?: number }>;
}

// Admin product create response (POST /admin/products – JSON or multipart)
export interface AdminProductCreated {
  id: number;
  name: string;
  description?: string;
  sku?: string;
  price: string | number;
  stock: number;
  status: string;
  weight_unit?: string;
  handle?: string;
  category_id?: number | null;
  track_quantity?: boolean;
  allow_backorder?: boolean;
  requires_shipping?: boolean;
  taxable?: boolean;
  created_at?: string;
  updated_at?: string;
  image?: string | null;
  image_url?: string | null;
  category?: { id: number; name: string } | null;
  primary_image?: {
    id: number;
    product_id: number;
    image_path: string;
    sort_order: number;
    is_primary: number;
    created_at?: string;
    updated_at?: string;
  };
  images?: Array<{
    id: number;
    product_id: number;
    image_path: string;
    sort_order: number;
    is_primary: number;
    created_at?: string;
    updated_at?: string;
  }>;
}

// Reports types
export interface ReportCreatedBy {
  id: number;
  name: string;
}

export interface ReportParameters {
  start_date?: string;
  end_date?: string;
  format?: string;
  include_charts?: boolean;
  include_details?: boolean;
}

export interface AdminReport {
  id?: number;
  title?: string;
  type?: string;
  status?: string;
  created_at?: string;
  scheduled_at?: string | null;
  generated_at?: string | null;
  file_url?: string | null;
  file_size?: number;
  created_by?: ReportCreatedBy;
  parameters?: ReportParameters;
}

export interface ReportsMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ReportsListResponse {
  success?: boolean;
  data: AdminReport[];
  meta: ReportsMeta;
}

export interface AdminActivity {
  type?: string;
  icon_type?: string;
  description?: string;
  timestamp?: string;
  created_at?: string;
  related_id?: number;
  related_type?: string;
}

