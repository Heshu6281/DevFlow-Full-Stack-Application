const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  body?: BodyInit | null;
}

interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: unknown;
}

const getToken = (): string | null => {
  return localStorage.getItem('devflow_token');
};

const request = async <T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let result: ApiResponse<T>;

  try {
    result = await response.json();
  } catch {
    throw new Error('Invalid response received from server.');
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('devflow_token');
      localStorage.removeItem('devflow_user');
    }

    throw new Error(
      typeof result.message === 'string'
        ? result.message
        : 'Something went wrong. Please try again.'
    );
  }

  return result;
};

export const api = {
  request,
};

export default api;