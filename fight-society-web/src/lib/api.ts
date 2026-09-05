import { AuthResponse, CheckIn, DojoDescription, Enrollment, Payment, Plan, PlanSchedule, User } from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string | null,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg =
        typeof data?.message === 'string'
          ? data.message
          : Array.isArray(data?.message)
            ? data.message.join(', ')
            : 'Erro ao processar requisição';
      throw new Error(errorMsg);
    }

    return data?.data !== undefined ? data.data : data;
  }

  // ================= Auth =================
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    cpf?: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // ================= Users =================
  async getProfile(token: string): Promise<User> {
    return this.request<User>('/users/me', { method: 'GET' }, token);
  }

  async getAllUsers(token: string): Promise<User[]> {
    return this.request<User[]>('/users', { method: 'GET' }, token);
  }

  async updateProfile(
    data: { name?: string; email?: string; phone?: string; cpf?: string; currentPassword?: string },
    token: string,
  ): Promise<User> {
    return this.request<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  }

  async updatePassword(currentPassword: string, newPassword: string, token: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/users/me/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    }, token);
  }

  // ================= Plans =================
  async getPlans(token?: string | null): Promise<Plan[]> {
    return this.request<Plan[]>('/plans', { method: 'GET' }, token);
  }

  // ================= Dojo =================
  async getDojoDescription(): Promise<DojoDescription | null> {
    return this.request<DojoDescription | null>('/dojo', { method: 'GET' });
  }

  async createDojoDescription(description: string, token: string): Promise<DojoDescription> {
    return this.request<DojoDescription>('/dojo', {
      method: 'POST',
      body: JSON.stringify({ description }),
    }, token);
  }

  async updateDojoDescription(id: string, description: string, token: string): Promise<DojoDescription> {
    return this.request<DojoDescription>(`/dojo/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ description }),
    }, token);
  }

  async deleteDojoDescription(id: string, token: string): Promise<DojoDescription> {
    return this.request<DojoDescription>(`/dojo/${id}`, { method: 'DELETE' }, token);
  }

  async createPlan(planData: Partial<Plan>, token: string): Promise<Plan> {
    return this.request<Plan>(
      '/plans',
      {
        method: 'POST',
        body: JSON.stringify(planData),
      },
      token,
    );
  }

  async updatePlan(id: string, planData: Partial<Plan>, token: string): Promise<Plan> {
    return this.request<Plan>(
      `/plans/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(planData),
      },
      token,
    );
  }

  async deletePlan(id: string, token: string): Promise<Plan> {
    return this.request<Plan>(
      `/plans/${id}`,
      { method: 'DELETE' },
      token,
    );
  }

  // ================= Enrollments =================
  async getMyEnrollments(token: string): Promise<Enrollment[]> {
    return this.request<Enrollment[]>('/enrollments/my', { method: 'GET' }, token);
  }

  async getAllEnrollments(token: string): Promise<Enrollment[]> {
    return this.request<Enrollment[]>('/enrollments', { method: 'GET' }, token);
  }

  async createEnrollment(userId: string, planId: string, token: string): Promise<Enrollment> {
    return this.request<Enrollment>(
      '/enrollments',
      {
        method: 'POST',
        body: JSON.stringify({ userId, planId }),
      },
      token,
    );
  }

  async deactivateEnrollment(id: string, token: string): Promise<Enrollment> {
    return this.request<Enrollment>(
      `/enrollments/${id}/deactivate`,
      { method: 'PATCH' },
      token,
    );
  }

  async reactivateEnrollment(id: string, token: string): Promise<Enrollment> {
    return this.request<Enrollment>(
      `/enrollments/${id}/reactivate`,
      { method: 'PATCH' },
      token,
    );
  }

  // ================= Payments =================
  async createCheckout(enrollmentId: string, token: string): Promise<{ checkoutUrl: string; sessionId: string }> {
    return this.request<{ checkoutUrl: string; sessionId: string }>(
      '/payments/checkout',
      {
        method: 'POST',
        body: JSON.stringify({ enrollmentId }),
      },
      token,
    );
  }

  async getMyPayments(token: string): Promise<Payment[]> {
    return this.request<Payment[]>('/payments/my', { method: 'GET' }, token);
  }

  async getAllPayments(token: string): Promise<Payment[]> {
    return this.request<Payment[]>('/payments', { method: 'GET' }, token);
  }

  // ================= Schedules =================
  async getPlanSchedules(planId: string, token?: string | null): Promise<PlanSchedule[]> {
    return this.request<PlanSchedule[]>(`/plans/${planId}/schedules`, { method: 'GET' }, token);
  }

  async createPlanSchedule(
    planId: string,
    data: { dayOfWeek: number; startTime: string; endTime: string; instructor?: string },
    token: string,
  ): Promise<PlanSchedule> {
    return this.request<PlanSchedule>(
      `/plans/${planId}/schedules`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token,
    );
  }

  async deletePlanSchedule(id: string, token: string): Promise<PlanSchedule> {
    return this.request<PlanSchedule>(
      `/schedules/${id}`,
      { method: 'DELETE' },
      token,
    );
  }

  // ================= Check-ins =================
  async createCheckIn(
    userId: string,
    enrollmentId: string,
    token: string,
    note?: string,
  ): Promise<CheckIn> {
    return this.request<CheckIn>(
      '/checkins',
      {
        method: 'POST',
        body: JSON.stringify({ userId, enrollmentId, note }),
      },
      token,
    );
  }

  async getCheckIns(token: string, filters?: { userId?: string; date?: string }): Promise<CheckIn[]> {
    const params = new URLSearchParams();
    if (filters?.userId) params.set('userId', filters.userId);
    if (filters?.date) params.set('date', filters.date);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<CheckIn[]>(`/checkins${qs}`, { method: 'GET' }, token);
  }

  async getMyCheckIns(token: string): Promise<CheckIn[]> {
    return this.request<CheckIn[]>('/checkins/my', { method: 'GET' }, token);
  }
}

export const api = new ApiClient(API_BASE);
