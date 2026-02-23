/**
 * Client (customer) memberships API. Uses apiClient so Bearer token is sent.
 * GET /api/client/memberships - list current client's subscriptions with visits.
 */
import apiClient from './api';

/** A single visit within a membership */
export interface ClientMembershipVisit {
  id: number;
  subscription_id: number;
  technician_id: number | null;
  area_id: number | null;
  supervisor_id: number | null;
  scheduled_date: string;
  completed_date: string | null;
  status: string;
  accepted_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  approved_by: number | null;
  approved_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** A membership (subscription) from GET /api/client/memberships */
export interface ClientMembership {
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
  visits: ClientMembershipVisit[];
}

export interface ClientMembershipsResponse {
  success?: boolean;
  message?: string;
  data: ClientMembership[];
  total: number;
}

/**
 * GET /api/client/memberships
 * Returns the authenticated client's memberships (subscriptions) with visits. Requires Bearer token.
 */
export async function getClientMemberships(): Promise<{ list: ClientMembership[]; total: number }> {
  const response = await apiClient.get<ClientMembershipsResponse>('/client/memberships', {
    timeout: 15000,
  });
  const data = response.data;
  if (data?.success && Array.isArray(data.data)) {
    return { list: data.data, total: data.total ?? data.data.length };
  }
  return { list: [], total: 0 };
}
