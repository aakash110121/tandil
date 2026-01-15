import apiClient from './api';

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
  created_at: string;
  updated_at: string;
}

export interface EmployeesResponse {
  status: boolean;
  data: Employee[];
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
  getEmployees: async (): Promise<EmployeesResponse> => {
    const response = await apiClient.get<EmployeesResponse>('/admin/hr/employees');
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
};

