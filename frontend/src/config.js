<<<<<<< HEAD

const BACKEND_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const API_URL = `${BACKEND_URL}/api`;
export const BACKEND_BASE_URL = BACKEND_URL;
=======

export const PYTHON_BACKEND_URL =
  import.meta.env.VITE_PYTHON_API_URL ||
  "https://ai-resume-analyzer-2-3x63.onrender.com";

export const JAVA_BACKEND_URL =
  import.meta.env.VITE_JAVA_API_URL ||
  "https://ai-resume-analyzer-java-9sfz.onrender.com";

export const PYTHON_API_URL = `${PYTHON_BACKEND_URL}/api`;
export const JAVA_API_URL = `${JAVA_BACKEND_URL}/api`;

// Backward compatibility for existing components
export const BACKEND_BASE_URL = JAVA_BACKEND_URL;
>>>>>>> e335e05750fe9d5281ca3e0e147b1901b1d0657e
