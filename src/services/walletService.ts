/**
 * Customer wallet API. Uses apiClient (Bearer customer token).
 * GET /api/user/wallet — summary, credits, terms.
 */
import apiClient from './api';
import type { AxiosError } from 'axios';

export interface WalletCredit {
  id: number;
  order_id: number | null;
  amount: string;
  status: string;
  reason: string;
  credited_at: string;
  expires_at: string;
  forfeited_at: string | null;
}

export interface WalletTerms {
  credit_destination?: string;
  expires_after_months?: number;
  spend_within_months?: number;
  forfeiture_to_company?: boolean;
  forfeiture_summary?: string;
  terms_notice?: string;
}

export interface WalletSummaryData {
  balance: number;
  forfeited_total: number;
  credits: WalletCredit[];
  wallet_terms?: WalletTerms;
}

export interface GetWalletSummaryResponse {
  success?: boolean;
  message?: string;
  data?: WalletSummaryData;
}

export async function getWalletSummary(): Promise<{
  data: WalletSummaryData | null;
  message?: string;
}> {
  try {
    const response = await apiClient.get<GetWalletSummaryResponse>('/user/wallet', { timeout: 15000 });
    if (response.data?.success && response.data?.data) {
      return { data: response.data.data, message: response.data.message };
    }
    return { data: null, message: response.data?.message };
  } catch (e) {
    const ax = e as AxiosError<{ message?: string }>;
    const msg = ax.response?.data?.message || ax.message;
    return { data: null, message: msg };
  }
}
