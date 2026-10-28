import type { UserSummary } from '@/types/user';
export interface User extends UserSummary {
  email: string;
  avatar: string | null;
  role?: string | null;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface MeResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}
