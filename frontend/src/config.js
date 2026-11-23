export const PYTHON_BACKEND_URL =
  import.meta.env.VITE_PYTHON_API_URL ||
  "https://ai-resume-analyzer-2-3x63.onrender.com";

export const JAVA_BACKEND_URL =
  import.meta.env.VITE_JAVA_API_URL ||
  "https://ai-resume-analyzer-java-9sfz.onrender.com";

export const PYTHON_API_URL = `${PYTHON_BACKEND_URL}/api`;
export const JAVA_API_URL = `${JAVA_BACKEND_URL}/api`;