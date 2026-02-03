import { publicApiClient } from './api';

export interface ShopProductCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ShopProduct {
  id: number;
  category_id: number;
  name: string;
  vendor: string;
  type: string;
  sku: string;
  barcode?: string;
  description?: string;
  handle?: string;
  price: string;
  compare_at_price?: string;
  weight?: string;
  weight_unit?: string;
  stock: number;
  status: string;
  image?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
  category?: ShopProductCategory;
}

export interface ShopProductsResponse {
  success: boolean;
  message?: string;
  data: ShopProduct[];
}

export const shopService = {
  getProducts: async (params?: { per_page?: number; page?: number }): Promise<ShopProductsResponse> => {
    const response = await publicApiClient.get<ShopProductsResponse>('/shop/products', { params });
    return response.data;
  },
};
