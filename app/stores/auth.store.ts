import { defineStore } from 'pinia';
import { useNuxtApp } from '#app';
import type { AuthApi } from '~/api/auth';

interface User {
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
  updated_at?: string;
}

interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken?: string;
    expAcToken?: string;
    expRfToken?: string;
  };
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userData: null as AuthResponse | null,
    isAuthed: false,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    user: (state) => state.userData?.user || null,
    userName: (state) => state.userData?.user?.name || '',
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const nuxtApp = useNuxtApp();
        const $api = nuxtApp.$api as { auth: AuthApi };
        const { data } = await $api.auth.signIn({ email, password });
        this.saveUserData(data);
      } catch (err: any) {
        console.error('Login error:', err);
        this.error = err?.response?.data?.message || 'Login failed';
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        const nuxtApp = useNuxtApp();
        const $api = nuxtApp.$api as { auth: AuthApi };
        await $api.auth.logout();
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        this.$reset();
        if (typeof window !== 'undefined') localStorage.clear();
      }
    },

    saveUserData(data: Partial<AuthResponse>) {
      if (!data.user || !data.tokens) return;
      this.userData = data as AuthResponse;
      this.isAuthed = true;
      if (typeof window !== 'undefined') localStorage.setItem('userData', JSON.stringify(this.userData));
    },

    loadUserData() {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('userData');
        if (stored) {
          this.userData = JSON.parse(stored);
          this.isAuthed = !!this.userData?.tokens?.accessToken;
        }
      }
    },
  },
});
