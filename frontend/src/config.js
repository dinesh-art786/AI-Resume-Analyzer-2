
const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8081";

export const API_URL = `${BACKEND_URL}/api`;
export const BACKEND_BASE_URL = BACKEND_URL;
