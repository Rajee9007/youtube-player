export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin';
  };
  token: string;
}
