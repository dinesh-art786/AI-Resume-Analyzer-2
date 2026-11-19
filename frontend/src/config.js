const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

export const API_URL = `${BACKEND_URL}/api`;
export const BACKEND_BASE_URL = BACKEND_URL;