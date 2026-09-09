export type UserRole = 'admin' | 'hod' | 'teacher' | 'student';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  departmentId?: string | null;
  phone?: string;
  profilePhoto?: string;
  isActive?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: AuthUser;
}
