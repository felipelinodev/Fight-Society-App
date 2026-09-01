export interface IAuthService {
  register(
    data: RegisterInput,
  ): Promise<AuthResponse>;
  login(email: string, password: string): Promise<AuthResponse>;
  refreshToken(refreshToken: string): Promise<AuthResponse>;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  cpf?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export const AUTH_SERVICE = Symbol('AUTH_SERVICE');
