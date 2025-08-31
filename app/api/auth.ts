import type { AxiosInstance } from 'axios';

export interface AuthResponse {
  status: number;
  data: {
    user: {
      id: number;
      email: string | null;
      facebook_id: string | null;
      google_id: string | null;
      name: string;
      surname: string;
      phone: string;
      picture: string;
      role: string;
      social_login: boolean;
      isactivated: boolean;
      created_at: string;
      udated_at: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expAcToken: string;
      expRfToken: string;
    };
  };
}

export interface User {
  id: number;
  email?: string | null;
  facebook_id?: string | null;
  google_id?: string | null;
  name?: string;
  surname?: string;
  phone?: string;
  picture?: string;
  role?: string;
  social_login?: boolean;
  isactivated?: boolean;
  created_at?: string;
  udated_at?: string;
}

export interface AuthApi {
  signIn(payload: { email: string; password: string }): Promise<AuthResponse>;
  signUp(payload: { email: string; password: string; role?: string }): Promise<AuthResponse>;
  activate(activationLink: string): Promise<string>;
  logout(): Promise<void>;
  socAuth(provider: string): Promise<AuthResponse>;
  getAuthUser(authLink: string): Promise<AuthResponse>;
  refresh(refreshToken: string): Promise<AuthResponse>;
  updateUser(payload: User): Promise<AuthResponse>;
}

export default function (instance: AxiosInstance): AuthApi {
  return {
    async signIn(payload: { email: string; password: string }): Promise<AuthResponse> {
      return instance.post('/login', payload);
    },
    async signUp(payload: { email: string; password: string }): Promise<AuthResponse> {
      return instance.post('/registration', payload);
    },
    async activate(activationlink) {
      return instance.post('/activate/', { activationlink });
    },
    async logout() {
      return instance.post('/logout');
    },
    async socAuth(provider) {
      return instance.get(`/social-login/${provider}`, {
        // credentials: 'include',
      });
    },
    async getAuthUser(authLink) {
      return instance.post(`/auth-user/${authLink}`);
    },
    async refresh(refreshToken) {
      return instance.post('/refresh', { refreshToken });
    },
    async updateUser(payload: User) {
      return instance.put('/users', payload);
    },
  };
}
