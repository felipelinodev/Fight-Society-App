export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  role: 'ADMIN' | 'STUDENT';
  active: boolean;
  createdAt: string;
}

export type MartialArt = 'JIU_JITSU' | 'MUAY_THAI';

export interface PlanSchedule {
  id: string;
  planId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  instructor?: string;
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  martialArt: MartialArt;
  price: number | string;
  durationDays: number;
  stripePriceId?: string;
  active: boolean;
  createdAt: string;
  schedules?: PlanSchedule[];
}

export interface Enrollment {
  id: string;
  userId: string;
  planId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  startDate: string;
  endDate?: string;
  user?: Partial<User>;
  plan?: Plan;
  payments?: Payment[];
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  enrollmentId: string;
  amount: number | string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paidAt?: string;
  createdAt: string;
  enrollment?: {
    plan?: Plan;
  };
}

export interface CheckIn {
  id: string;
  userId: string;
  enrollmentId: string;
  checkedInAt: string;
  note?: string;
  user?: Partial<User>;
  enrollment?: {
    plan?: { id: string; name: string; martialArt: MartialArt };
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'STUDENT';
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  statusCode?: number;
}

export interface DojoDescription {
  id: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
