/**
 * Support/ticket API. Uses apiClient so Authorization: Bearer <token> is sent.
 */
import apiClient from './api';

export interface SubmitTicketParams {
  subject: string;
  message: string;
  /** optional: low, medium, high, urgent */
  priority?: string;
  /** optional: general, billing, technical, account, order, other */
  category?: string;
}

export interface SubmitTicketResponse {
  success?: boolean;
  message?: string;
  data?: { id?: number; [key: string]: unknown };
}

/**
 * POST /api/support/tickets
 * Body: x-www-form-urlencoded with subject, message, priority (optional), category (optional).
 * Requires Bearer token.
 */
export async function submitTicket(params: SubmitTicketParams): Promise<{ success: boolean; message?: string }> {
  const form = new URLSearchParams();
  form.append('subject', params.subject.trim());
  form.append('message', params.message.trim());
  if (params.priority?.trim()) form.append('priority', params.priority.trim());
  if (params.category?.trim()) form.append('category', params.category.trim());

  const response = await apiClient.post<SubmitTicketResponse>('/support/tickets', form.toString(), {
    timeout: 15000,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (response.data?.success) {
    return { success: true, message: response.data.message };
  }
  return {
    success: false,
    message: (response.data as any)?.message || 'Failed to submit ticket.',
  };
}
