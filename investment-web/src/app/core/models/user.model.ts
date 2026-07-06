// Generic ApiResponse envelope used by the backend
export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
}

// UserInfo as returned in the LoginResponse.user field
export interface UserInfo {
  id?: string;
  userId?: string;
  guid?: string;
  username: string;
  email: string;
  role: string;
}

// Generic user shape (from users_hdr)
export interface User {
  guid: string;
  username: string;
  email: string;
  role?: string;
  status?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface UserContainer {
  users_hdr: User;
}

// Login request payload
export interface LoginRequest {
  username: string;
  password: string;
}

// Login response (matches backend LoginResponse)
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: UserInfo;
}

// Signup request payload
export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}
