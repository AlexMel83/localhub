import type { AxiosInstance } from 'axios';

export interface Panorama {
  id: number;
  user_id: number;
  title: string;
  description: string;
  address: string;
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

export interface PanoramasResponse {
  status: number;
  data: {
    panoramas: Panorama[];
  };
}

export interface QueryParams {
  [key: string]: string;
}

export interface PanoramasApi {
  getPanoramas(queryParams: QueryParams): Promise<PanoramasResponse>;
  getPanoramaById(id: number): Promise<Panorama>;
}

export default function (instance: AxiosInstance) {
  return {
    async getPanoramas(queryParams: QueryParams) {
      let url = '/panoramas';
      if (queryParams && Object.keys(queryParams).length) {
        const queryString = new URLSearchParams(queryParams).toString();
        url += `?${queryString}`;
      }
      return await instance.get(url);
    },
    async getPanoramaById(id: number) {
      return await instance.get(`/panoramas?id=${id}`);
    },
  };
}
