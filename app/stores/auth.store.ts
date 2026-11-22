import { defineStore } from 'pinia';
import { useNuxtApp } from '#app';
import type { AuthApi, AuthPayload, AuthUser, SocialProvider } from '~/api/auth';

/** Error kinds the UI translates; `message` keeps the API text as a fallback. */
export type AuthErrorCode = 'notFound' | 'wrongPassword' | 'notActivated' | 'exists' | 'network' | 'unknown';

const STORAGE_KEY = 'localhub_auth';

interface StoredSession {
  user: AuthUser;
  accessToken: string;
}

function api(): AuthApi {
  // Provided by plugins/axios.ts as $customApi.
  return (useNuxtApp().$customApi as { auth: AuthApi }).auth;
}

/** Maps an axios error from localhub_back to a code the UI can translate. */
export function authErrorOf(err: unknown): { code: AuthErrorCode; message: string } {
  const e = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
  const status = e?.response?.status;
  // Some API errors arrive as "Error: <text>".
  const message = String(e?.response?.data?.message || e?.message || '').replace(/^Error:\s*/, '');
  if (!e?.response) return { code: 'network', message };
  if (status === 404) return { code: 'notFound', message };
  if (status === 409) return { code: 'exists', message };
  if (/не активовано|not activated/i.test(message)) return { code: 'notActivated', message };
  if (/невірний пароль|wrong password/i.test(message)) return { code: 'wrongPassword', message };
  return { code: 'unknown', message };
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    accessToken: null as string | null,
    /** Keep the session after the browser closes (localStorage) or not (sessionStorage). */
    remember: true,
    loading: false,
    error: null as { code: AuthErrorCode; message: string } | null,
  }),

  getters: {
    isAuthed: (state) => Boolean(state.user && state.accessToken),
    userName: (state) => {
      const u = state.user;
      if (!u) return '';
      const full = [u.name, u.surname].filter(Boolean).join(' ');
      return full || u.email?.split('@')[0] || '';
    },
  },

  actions: {
    storage(remember?: boolean): Storage | null {
      if (typeof window === 'undefined') return null;
      return (remember ?? this.remember) ? window.localStorage : window.sessionStorage;
    },

    persist() {
      if (typeof window === 'undefined') return;
      const session: StoredSession | null =
        this.user && this.accessToken ? { user: this.user, accessToken: this.accessToken } : null;
      // Only one storage holds the session at a time.
      try {
        this.storage(!this.remember)?.removeItem(STORAGE_KEY);
        if (session) this.storage()?.setItem(STORAGE_KEY, JSON.stringify(session));
        else this.storage()?.removeItem(STORAGE_KEY);
      } catch {
        // Storage can be unavailable (private mode); the session then lives in memory only.
      }
    },

    /** Restores a saved session on the client (called once on app start). */
    restore() {
      if (typeof window === 'undefined') return;
      for (const remember of [true, false]) {
        try {
          const raw = this.storage(remember)?.getItem(STORAGE_KEY);
          if (!raw) continue;
          const saved = JSON.parse(raw) as StoredSession;
          if (saved?.user && saved?.accessToken) {
            this.user = saved.user;
            this.accessToken = saved.accessToken;
            this.remember = remember;
            return;
          }
        } catch {
          // ignore broken entries
        }
      }
      // Sessions saved by the previous version of the store.
      try {
        const legacy = window.localStorage.getItem('userData');
        if (legacy) {
          const old = JSON.parse(legacy) as { user?: AuthUser; tokens?: { accessToken?: string } };
          window.localStorage.removeItem('userData');
          if (old.user && old.tokens?.accessToken)
            this.setSession({ user: old.user, tokens: { accessToken: old.tokens.accessToken } }, true);
        }
      } catch {
        // ignore
      }
    },

    setSession(payload: AuthPayload, remember?: boolean) {
      this.user = payload.user;
      this.accessToken = payload.tokens.accessToken;
      this.remember = remember ?? this.remember;
      this.error = null;
      this.persist();
    },

    clearSession() {
      this.user = null;
      this.accessToken = null;
      this.persist();
    },

    async run<T>(fn: () => Promise<T>): Promise<T | null> {
      this.loading = true;
      this.error = null;
      try {
        return await fn();
      } catch (err) {
        this.error = authErrorOf(err);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async login(email: string, password: string, remember = true): Promise<boolean> {
      const res = await this.run(() => api().signIn({ email, password }));
      if (!res) return false;
      this.setSession(res.data, remember);
      return true;
    },

    /** Creates the account; the API e-mails an activation link. */
    async register(email: string, password: string): Promise<boolean> {
      const res = await this.run(() => api().signUp({ email, password }));
      return Boolean(res);
    },

    /** Activation link from the e-mail: activates the account and signs in. */
    async activate(link: string): Promise<boolean> {
      const res = await this.run(() => api().activate(link));
      if (!res) return false;
      this.setSession(res.data, true);
      return true;
    },

    /** Redirects to Google / Facebook; the API brings the user back to /callback/<link>. */
    async startSocial(provider: SocialProvider): Promise<void> {
      const res = await this.run(() => api().socAuth(provider));
      if (res?.data?.url && typeof window !== 'undefined') window.location.assign(res.data.url);
    },

    /** Return from the social provider. */
    async finishSocial(link: string): Promise<boolean> {
      const res = await this.run(() => api().getAuthUser(link));
      if (!res) return false;
      this.setSession(res.data, true);
      return true;
    },

    /** New access token from the refresh cookie; false when the session is over. */
    async refresh(): Promise<boolean> {
      try {
        const res = await api().refresh();
        const token = res?.data?.tokens?.accessToken;
        if (!token) throw new Error('no access token');
        this.accessToken = token;
        if (res.data.user) this.user = res.data.user;
        this.persist();
        return true;
      } catch {
        this.clearSession();
        return false;
      }
    },

    async logout() {
      try {
        await api().logout();
      } catch {
        // The local session is cleared either way.
      } finally {
        this.clearSession();
        this.error = null;
      }
    },
  },
});
