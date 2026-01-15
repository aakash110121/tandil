import apiClient from './api';

export interface SubscriptionClient {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface Subscription {
  id: number;
  client_id: number;
  plan: string;
  start_date: string;
  end_date: string;
  amount: string;
  payment_status: string;
  payment_reference: string | null;
  paid_at: string | null;
  total_visits: number;
  completed_visits: number;
  created_at: string;
  updated_at: string;
  client: SubscriptionClient;
}

export interface SubscriptionsResponse {
  message?: string;
  status?: boolean;
  data: Subscription[];
}

export const subscriptionService = {
  getSubscriptions: async (): Promise<SubscriptionsResponse> => {
    const response = await apiClient.get<SubscriptionsResponse>('/subscriptions');
    return response.data;
  },

  getSubscriptionById: async (subscriptionId: number): Promise<{ status: boolean; data: Subscription; message?: string }> => {
    const response = await apiClient.get(`/subscriptions/${subscriptionId}`);
    return response.data;
  },

  updateSubscription: async (subscriptionId: number, subscriptionData: {
    start_date?: string;
    end_date?: string;
    payment_status?: string;
    amount?: string | number;
    total_visits?: number;
    completed_visits?: number;
    payment_reference?: string | null;
  }): Promise<{ status: boolean; data: Subscription; message?: string }> => {
    const response = await apiClient.put(`/subscriptions/${subscriptionId}`, subscriptionData);
    return response.data;
  },

  deleteSubscription: async (subscriptionId: number): Promise<{ status: boolean; message?: string }> => {
    const response = await apiClient.delete(`/subscriptions/${subscriptionId}`);
    return response.data;
  },
};

