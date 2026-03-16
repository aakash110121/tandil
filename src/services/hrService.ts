import apiClient from './api';

/** Pending leave request from GET /hr/dashboard/summary */
export interface HRPendingLeaveRequest {
  id: number;
  applicant_name: string;
  applicant_id: string;
  leave_type: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
}

/** Dashboard summary from GET /hr/dashboard/summary */
export interface HRDashboardSummary {
  name: string;
  id: string;
  role: string;
  profile_picture?: string;
  profile_picture_url?: string | null;
  total_staff: number;
  new_hires: number;
  leave_requests: number;
  pending_leave_requests: HRPendingLeaveRequest[];
}

export interface HRDashboardSummaryResponse {
  success: boolean;
  data: HRDashboardSummary;
}

/** Visit assignments from GET /hr/dashboard/visit-assignments */
export interface HRVisitAssignmentsDay {
  total: number;
  assigned: number;
  unassigned: number;
}

export interface HRVisitAssignmentsData {
  today: HRVisitAssignmentsDay;
  tomorrow: HRVisitAssignmentsDay;
}

export interface HRVisitAssignmentsResponse {
  success: boolean;
  data: HRVisitAssignmentsData;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  user_id: number | null;
  employee_id: string;
  designation: string;
  region: string;
  joining_date: string;
  status?: string;
  leave_balance?: number;
  leave_remaining_days?: number | null;
  leave_days?: number | null;
  leave_end_date?: string | null;
  created_at: string;
  updated_at: string;
  profile_picture?: string | null;
  profile_picture_url?: string | null;
  initial?: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: string;
    profile_picture?: string | null;
    profile_picture_url?: string | null;
    initial?: string | null;
  } | null;
}

export interface EmployeesResponse {
  success?: boolean;
  message?: string;
  data: Employee[];
  total?: number;
  meta?: { current_page: number; last_page: number; per_page: number };
}

export interface CreateEmployeeData {
  name: string;
  email: string;
  phone: string;
  user_id?: number | null;
  employee_id?: string;
  designation: string;
  region: string;
  joining_date: string;
}

export const hrService = {
  /** GET /hr/dashboard/summary – HR manager profile and dashboard stats */
  getDashboardSummary: async (): Promise<HRDashboardSummaryResponse> => {
    const response = await apiClient.get<HRDashboardSummaryResponse>('/hr/dashboard/summary');
    return response.data;
  },

  /** GET /hr/dashboard/visit-assignments – today and tomorrow visit stats */
  getVisitAssignments: async (): Promise<HRVisitAssignmentsResponse> => {
    const response = await apiClient.get<HRVisitAssignmentsResponse>('/hr/dashboard/visit-assignments');
    return response.data;
  },

  getEmployees: async (params?: { page?: number; per_page?: number }): Promise<EmployeesResponse> => {
    const response = await apiClient.get<EmployeesResponse>('/admin/hr/employees', { params });
    return response.data;
  },

  createEmployee: async (employeeData: CreateEmployeeData): Promise<{ status: boolean; data: Employee; message?: string }> => {
    const response = await apiClient.post('/admin/hr/employees', employeeData);
    return response.data;
  },

  updateEmployee: async (employeeId: number, employeeData: Partial<CreateEmployeeData>): Promise<{ status: boolean; data: Employee; message?: string }> => {
    const response = await apiClient.put(`/admin/hr/employees/${employeeId}`, employeeData);
    return response.data;
  },

  deleteEmployee: async (employeeId: number): Promise<{ status: boolean; message?: string }> => {
    const response = await apiClient.delete(`/admin/hr/employees/${employeeId}`);
    return response.data;
  },

  /** POST /hr/leave-requests/:id/approve – approve a pending leave request */
  approveLeaveRequest: async (leaveRequestId: number): Promise<{ success?: boolean; message?: string }> => {
    const response = await apiClient.post(`/hr/leave-requests/${leaveRequestId}/approve`);
    return response.data;
  },

  /** POST /hr/leave-requests/:id/reject – reject a pending leave request */
  rejectLeaveRequest: async (leaveRequestId: number): Promise<{ success?: boolean; message?: string }> => {
    const response = await apiClient.post(`/hr/leave-requests/${leaveRequestId}/reject`);
    return response.data;
  },
};

