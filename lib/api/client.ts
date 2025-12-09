import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const TOKEN_KEY = "meggy_auth_token";
const REFRESH_TOKEN_KEY = "meggy_refresh_token";

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management utilities
export const tokenManager = {
  getToken: () => Cookies.get(TOKEN_KEY),
  setToken: (token: string) => {
    Cookies.set(TOKEN_KEY, token, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  },
  getRefreshToken: () => Cookies.get(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => {
    Cookies.set(REFRESH_TOKEN_KEY, token, {
      expires: 30, // 30 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  },
  removeTokens: () => {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
  },
};

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle token expiration (401 Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (refreshToken) {
          // Attempt to refresh the token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          tokenManager.setToken(access);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        }
      } catch {
        // Refresh failed, clear tokens and redirect to login
        tokenManager.removeTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// API Error types
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  details?: Record<string, string[]>;
}

// Generic API response wrapper
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

// Error handler utility
export const handleApiError = (error: AxiosError): ApiError => {
  if (error.response?.data) {
    const errorData = error.response.data as Record<string, unknown>;

    // Handle Django REST Framework validation errors
    if (error.response.status === 400 && errorData) {
      return {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: errorData,
      };
    }

    // Handle other API errors
    return {
      message: errorData.message || errorData.detail || "An error occurred",
      code: errorData.code || `HTTP_${error.response.status}`,
    };
  }

  // Handle network/timeout errors
  if (error.code === "ECONNABORTED") {
    return {
      message: "Request timeout. Please try again.",
      code: "TIMEOUT_ERROR",
    };
  }

  return {
    message: error.message || "Network error occurred",
    code: "NETWORK_ERROR",
  };
};

export default apiClient;
