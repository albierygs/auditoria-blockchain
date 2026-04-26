export const API_BASE_URL = import.meta.env.DEV
  ? String(import.meta.env.VITE_API_BASE_URL_DEV)
  : String(import.meta.env.VITE_API_BASE_URL);

export const MP_PUBLIC_KEY = String(import.meta.env.VITE_MP_PUBLIC_KEY);
