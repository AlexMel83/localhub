import type { AxiosInstance } from 'axios';

export interface AuthUser {
  id: number;
  email: string | null;
  facebook_id?: string | null;
  google_id?: string | null;
  name?: string | null;
  surname?: string | null;
  phone?: string | null;
  picture?: string | null;
  role?: string;
  social_login?: boolean;
  isactivated?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthTokens {
  accessToken: string;
  expAcToken?: string;
}

/** What /login, /activate, /auth-user and /refresh return. The refresh token
 *  itself travels only in the httpOnly cookie set by the API. */
export interface AuthPayload {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface AuthResponse {
  status: number;
  data: AuthPayload;
}

export type SocialProvider = 'google' | 'facebook';

export interface AuthApi {
  signIn(payload: { email: string; password: string }): Promise<AuthResponse>;
  signUp(payload: { email: string; password: string }): Promise<{ data: { user: AuthUser } }>;
  activate(activationLink: string): Promise<AuthResponse>;
  logout(): Promise<unknown>;
  socAuth(provider: SocialProvider): Promise<{ data: { url: string } }>;
  getAuthUser(authLink: string): Promise<AuthResponse>;
  refresh(): Promise<AuthResponse>;
  updateUser(payload: Partial<AuthUser>): Promise<AuthResponse>;
}

export default function (instance: AxiosInstance): AuthApi {
  return {
    signIn: (payload) => instance.post('/login', payload),
    signUp: (payload) => instance.post('/registration', payload),
    activate: (activationlink) => instance.post('/activate/', { activationlink }),
    logout: () => instance.post('/logout'),
    socAuth: (provider) => instance.get(`/social-login/${provider}`),
    getAuthUser: (authLink) => instance.post(`/auth-user/${authLink}`),
    // The API reads the refresh token from its httpOnly cookie.
    refresh: () => instance.get('/refresh'),
    updateUser: (payload) => instance.put('/users', payload),
  };
}
