const config = useRuntimeConfig();
const { apiKeyMapbox } = config.public;

export const MAP_CONFIG = {
  CENTER: [49.7548762, 27.1951962],
  ZOOM: 14,
  defaultZoom: 11,
  defaultCenter: {
    lat: 59.95,
    lng: 30.33,
  },
};

export const TILE_PROVIDERS = [
  {
    name: 'OpenStreetMap',
    visible: true,
    attribution: '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  },
  {
    name: 'Google Streets',
    visible: false,
    maxZoom: 20,
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; <a href="https://www.google.com/maps">Google</a>',
  },
  {
    name: 'Google Hybrid',
    visible: false,
    maxZoom: 20,
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; <a href="https://www.google.com/maps">Google</a>',
  },
];
