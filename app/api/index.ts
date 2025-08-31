import type { AxiosInstance } from 'axios';
import authModule from './auth';
import type { AuthResponse } from './auth';
import panoramasModule from './panoramas';
import type { PanoramasResponse } from './panoramas';

export default function (instance: AxiosInstance) {
  return {
    auth: authModule(instance),
    panoramas: panoramasModule(instance),
  };
}

export interface ApiModule {
  auth: AuthResponse;
  panoramas: PanoramasResponse;
  getUser(): Promise<AuthResponse>;
}
