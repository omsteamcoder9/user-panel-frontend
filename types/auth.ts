
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// ADD: Reset Password Data interface
export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

// ADD: Forgot Password Data interface  
export interface ForgotPasswordData {
  email: string;
}

// Unified user interface
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

// Unified auth response interface
export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  data?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    token: string;
  };
}

// API response wrapper for consistent structure
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
  user?: User;
}