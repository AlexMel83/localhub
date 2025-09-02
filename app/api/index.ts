import type { AxiosInstance } from 'axios';
import authModule from './auth';
import type { AuthResponse } from './auth';
import storesModule from './stores';
import type { StoresResponse } from './stores';

export default function (instance: AxiosInstance) {
  return {
    auth: authModule(instance),
    stores: storesModule(instance),
  };
}

export interface ApiModule {
  auth: AuthResponse;
  stores: StoresResponse;
  getUser(): Promise<AuthResponse>;
}
