/**
 * Client order list (shop + services). Uses apiClient (Bearer customer token).
 * GET /api/orders — list with pagination.
 */
import apiClient from './api';
import type { AxiosError } from 'axios';
import type { Order, OrderStatus, Address, PaymentMethod } from '../types';

export interface ShopOrderLineItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: string;
  subtotal: string;
  product?: {
    id: number;
    name: string;
    image_url?: string | null;
    estimated_arrival?: string | null;
    job_duration?: string | null;
  } | null;
}

export interface ShopOrderApi {
  id: number;
  user_id: number;
  total_amount: string;
  subtotal_amount?: string | null;
  tax_amount?: string | null;
  shipping_amount?: string | null;
  payment_status: string;
  order_status: string;
  payment_method: string;
  refunded_at?: string | null;
  refund_amount?: string | null;
  refund_reason?: string | null;
  created_at: string;
  items: ShopOrderLineItem[];
}

export interface OrdersListPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

export interface GetClientOrdersResponse {
  success?: boolean;
  message?: string;
  data?: ShopOrderApi[];
  pagination?: OrdersListPagination;
}

function lineItemsSummary(items: ShopOrderLineItem[] | undefined): string {
  if (!items?.length) return '—';
  const names = items
    .map((i) => i.product?.name?.trim() || `Product #${i.product_id}`)
    .filter(Boolean);
  if (names.length === 0) return '—';
  if (names.length === 1) return names[0];
  return `${names[0]} +${names.length - 1} more`;
}

const ORDER_STATUS_MAP: Record<string, OrderStatus> = {
  pending: 'pending',
  processing: 'in_progress',
  confirmed: 'confirmed',
  assigned: 'assigned',
  in_progress: 'in_progress',
  completed: 'completed',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

const PAYMENT_MAP: Record<string, PaymentMethod> = {
  stripe: 'card',
  card: 'card',
  cash: 'cash',
  wallet: 'wallet',
  paypal: 'wallet',
};

/**
 * Map Laravel shop order to legacy `Order` shape for `OrderCard`.
 */
export function shopOrderToOrder(o: ShopOrderApi): Order {
  const status = ORDER_STATUS_MAP[String(o.order_status || '').toLowerCase()] ?? 'pending';
  const pay = PAYMENT_MAP[String(o.payment_method || '').toLowerCase()] ?? 'card';
  const total = parseFloat(String(o.total_amount ?? '0')) || 0;
  const created = new Date(o.created_at);
  const summary = lineItemsSummary(o.items);
  const addr: Address = {
    id: '0',
    street: summary,
    city: o.payment_status === 'paid' ? 'Paid' : o.payment_status || '—',
    state: '',
    zipCode: '',
    country: '',
  };
  return {
    id: String(o.id),
    userId: String(o.user_id),
    serviceId: String(o.items?.[0]?.product_id ?? o.id),
    status,
    totalAmount: total,
    createdAt: created,
    scheduledDate: created,
    address: addr,
    tracking: [],
    paymentMethod: pay,
  };
}

/**
 * GET /orders — customer order history (Postman: Orders - List).
 */
export async function getClientOrders(params?: {
  page?: number;
  per_page?: number;
}): Promise<{
  orders: ShopOrderApi[];
  pagination: OrdersListPagination | null;
  message?: string;
}> {
  const response = await apiClient.get<GetClientOrdersResponse>('/orders', {
    params: {
      page: params?.page ?? 1,
      per_page: params?.per_page ?? 30,
    },
    timeout: 20000,
  });
  const body = response.data;
  if (body?.success && Array.isArray(body.data)) {
    return { orders: body.data, pagination: body.pagination ?? null, message: body.message };
  }
  if (Array.isArray(body?.data)) {
    return { orders: body.data, pagination: body.pagination ?? null, message: body?.message };
  }
  return { orders: [], pagination: null, message: body?.message };
}

/**
 * GET /orders/cancelled — customer cancelled orders list.
 */
export async function getClientCancelledOrders(params?: {
  page?: number;
  per_page?: number;
}): Promise<{
  orders: ShopOrderApi[];
  pagination: OrdersListPagination | null;
  message?: string;
}> {
  const response = await apiClient.get<GetClientOrdersResponse>('/orders/cancelled', {
    params: {
      page: params?.page ?? 1,
      per_page: params?.per_page ?? 15,
    },
    timeout: 20000,
  });
  const body = response.data;
  if (body?.success && Array.isArray(body.data)) {
    return { orders: body.data, pagination: body.pagination ?? null, message: body.message };
  }
  if (Array.isArray(body?.data)) {
    return { orders: body.data, pagination: body.pagination ?? null, message: body?.message };
  }
  return { orders: [], pagination: null, message: body?.message };
}

export function mapShopOrdersToOrders(rows: ShopOrderApi[]): Order[] {
  return rows.map(shopOrderToOrder);
}

/** GET /orders/:id/track — order tracking (timeline, summary, photos). */
export interface TrackTimelineItem {
  key: string;
  label: string;
  description: string;
  completed: boolean;
  timestamp: string | null;
}

export interface OrderTrackSummary {
  placed_at: string;
  delivery_address: string;
  payment_method: string;
  payment_method_code?: string;
  total: number;
  currency: string;
  payment_status?: string;
  refund_amount?: number | string | null;
  refund_reason?: string | null;
  refunded_at?: string | null;
  special_instructions?: string | null;
  estimated_arrival?: string | null;
  job_duration?: string | null;
}

export interface OrderTrackData {
  order_id: number;
  order_number: string;
  order_number_short: string;
  order: ShopOrderApi & {
    shipping_address?: unknown;
    items?: ShopOrderLineItem[];
  };
  order_summary: OrderTrackSummary;
  current_status: string;
  tracking: {
    status: string;
    payment_status?: string;
    timeline: TrackTimelineItem[];
    created_at?: string;
    updated_at?: string;
    paid_at?: string;
  };
  maintenance_photos: unknown[];
  can_cancel: boolean;
}

export interface GetOrderTrackResponse {
  success?: boolean;
  message?: string;
  data?: OrderTrackData;
}

/**
 * GET /orders/:id/track
 */
export async function getOrderTrack(
  orderId: string | number
): Promise<{ data: OrderTrackData | null; message?: string }> {
  const id = encodeURIComponent(String(orderId));
  const response = await apiClient.get<GetOrderTrackResponse>(`/orders/${id}/track`, {
    timeout: 25000,
  });
  const body = response.data;
  if (body?.success && body.data) {
    return { data: body.data, message: body.message };
  }
  if (body?.data) {
    return { data: body.data, message: body.message };
  }
  return { data: null, message: body?.message };
}

/** Root `refund` object on POST /orders/:id/cancel (alongside `data` order). */
export interface CancelOrderRefundSummary {
  stage?: string;
  refund_percent?: number;
  refund_amount?: number;
  service_fee_amount?: number;
  wallet_credited?: number;
  wallet_expires_at?: string;
}

export interface CancelClientOrderResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
  refund?: CancelOrderRefundSummary;
}

/**
 * POST /orders/:id/cancel — cancel order (logged-in customer).
 * Matches Postman: `POST {{base_url}}/api/orders/{{order_id}}/cancel`
 */
export async function cancelClientOrder(
  orderId: string | number
): Promise<{ success: boolean; message?: string; refund?: CancelOrderRefundSummary }> {
  const id = encodeURIComponent(String(orderId));
  try {
    const response = await apiClient.post<CancelClientOrderResponse>(`/orders/${id}/cancel`, {}, { timeout: 30000 });
    const body = response.data;
    if (body?.success === true) {
      return { success: true, message: body.message, refund: body.refund };
    }
    if (response.status >= 200 && response.status < 300 && body?.success !== false) {
      return { success: true, message: body?.message, refund: body.refund };
    }
    return { success: false, message: body?.message || 'Could not cancel order.' };
  } catch (e) {
    const ax = e as AxiosError<{ message?: string }>;
    const msg = ax.response?.data?.message || ax.message;
    return { success: false, message: msg };
  }
}

/**
 * GET /orders/:id/cancel-track — cancelled order refund tracking.
 */
export async function getCancelledOrderTrack(
  orderId: string | number
): Promise<{ data: OrderTrackData | null; message?: string }> {
  const id = encodeURIComponent(String(orderId));
  const response = await apiClient.get<GetOrderTrackResponse>(`/orders/${id}/cancel-track`, {
    timeout: 25000,
  });
  const body = response.data;
  if (body?.success && body.data) {
    return { data: body.data, message: body.message };
  }
  if (body?.data) {
    return { data: body.data, message: body.message };
  }
  return { data: null, message: body?.message };
}

export function maintenancePhotoUrl(entry: unknown): string | null {
  if (typeof entry === 'string') {
    const s = entry.trim();
    if (s.length > 0) return s;
  }
  if (entry && typeof entry === 'object' && 'url' in entry && typeof (entry as { url: string }).url === 'string') {
    return (entry as { url: string }).url;
  }
  if (entry && typeof entry === 'object' && 'image_url' in entry) {
    const u = (entry as { image_url?: string }).image_url;
    if (typeof u === 'string' && u.length > 0) return u;
  }
  return null;
}
