/**
 * Cart API for logged-in customers.
 * Uses apiClient so Authorization: Bearer <customer token> is sent automatically.
 * POST /api/shop/cart/add – add item. GET /api/shop/cart – view cart.
 */
import apiClient from './api';

export interface AddCartItemRequest {
  product_id: number;
  quantity: number;
}

export interface AddCartItemResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

/** Cart item from GET /shop/cart response data.items */
export interface CartApiItem {
  id: number;
  product_id: number;
  name: string;
  image_url: string | null;
  category: string | null;
  brand: string | null;
  current_price: number;
  original_price: number | null;
  quantity: number;
  line_total: number;
  currency: string;
}

/** Order summary from GET /shop/cart response data.order_summary */
export interface CartOrderSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  currency: string;
}

export interface GetCartResponse {
  success?: boolean;
  message?: string;
  data?: {
    items?: CartApiItem[];
    order_summary?: CartOrderSummary;
  };
}

/**
 * Add item to cart. Requires user to be logged in (customer token).
 * POST /shop/cart/add with JSON body: { product_id, quantity }.
 */
export async function addCartItem(productId: number, quantity: number): Promise<AddCartItemResponse> {
  const response = await apiClient.post<AddCartItemResponse>('/shop/cart/add', {
    product_id: productId,
    quantity,
  } as AddCartItemRequest, {
    timeout: 15000,
  });
  return response.data ?? {};
}

/**
 * Get cart for logged-in customer. Requires customer token.
 * GET /shop/cart. Returns { data: { items, order_summary } }.
 */
export async function getCart(): Promise<GetCartResponse> {
  const response = await apiClient.get<GetCartResponse>('/shop/cart', { timeout: 15000 });
  return response.data ?? {};
}

/**
 * Update cart item quantity. Requires customer token.
 * PUT /shop/cart/:cart_item_id with JSON body: { quantity }.
 */
export async function updateCartItemQuantity(cartItemId: number, quantity: number): Promise<{ success?: boolean; message?: string }> {
  const response = await apiClient.put<{ success?: boolean; message?: string }>(`/shop/cart/${cartItemId}`, { quantity }, {
    timeout: 15000,
  });
  return response.data ?? {};
}

/**
 * Remove item from cart. Requires customer token.
 * DELETE /shop/cart/:cart_item_id
 */
export async function removeCartItem(cartItemId: number): Promise<{ success?: boolean; message?: string }> {
  const response = await apiClient.delete<{ success?: boolean; message?: string }>(`/shop/cart/${cartItemId}`, {
    timeout: 15000,
  });
  return response.data ?? {};
}
