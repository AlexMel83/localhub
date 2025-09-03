import type { AxiosInstance } from 'axios';

export interface Store {
  id: number;
  slug: string;
  user_id: number;
  title: string;
  type: string;
  rating: number;
  description: string;
  address: string;
  contacts: string;
  working_hours: string;
  price: string;
  shooting_date: string;
  latitude: string;
  longitude: string;
  view_mode: string;
  yaw: string;
  heading: string;
  tilt: string;
  pano_id: string;
  thumbnail_url: string;
  image_width: number;
  image_height: number;
  created_at: string;
  updated_at: string;
}

export interface StoresResponse {
  status: number;
  data: {
    stores: Store[];
  };
}

export interface QueryParams {
  [key: string]: string;
}

export interface StoresApi {
  getStores(queryParams: QueryParams): Promise<StoresResponse>;
  getStoreById(id: number): Promise<Store>;
  getStoreBySlug(slug: string): Promise<Store>;
}

export default function (instance: AxiosInstance) {
  return {
    async getStores(queryParams: QueryParams) {
      let url = '/stores';
      if (queryParams && Object.keys(queryParams).length) {
        const queryString = new URLSearchParams(queryParams).toString();
        url += `?${queryString}`;
      }
      return await instance.get(url);
    },
    async getStoreById(id: number) {
      return await instance.get(`/stores?id=${id}`);
    },
    async getStoreBySlug(slug: string) {
      return await instance.get(`/stores?slug=${slug}`);
    },
  };
}
