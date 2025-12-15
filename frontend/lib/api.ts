import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== "undefined"
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          console.log("Attempting to refresh token...");
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          localStorage.setItem("access_token", access_token);
          console.log("Token refreshed successfully");

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } else {
          console.warn("No refresh token found, redirecting to login");
          // No refresh token, redirect to login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          window.location.href = "/auth/login";
          return Promise.reject(new Error("No refresh token available"));
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login/", { email, password });
    return response.data;
  },

  register: async (data: { name: string; email: string; password: string }) => {
    const response = await api.post("/auth/register/", {
      name: data.name,
      email: data.email,
      password: data.password,
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout/");
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post("/auth/refresh/", {
      refresh_token: refreshToken,
    });
    return response.data;
  },
};

// User API
export const userAPI = {
  getCurrentUser: async () => {
    const response = await api.get("/users/me/");
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.patch("/users/me/", data);
    return response.data;
  },
};

// Agents API
export const agentsAPI = {
  getAll: async () => {
    const response = await api.get("/agents/");
    return response.data;
  },

  getDefault: async () => {
    const response = await api.get("/agents/default/");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/agents/${id}/`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/agents/", data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/agents/${id}/`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/agents/${id}/`);
    return response.data;
  },
};

// Conversations API
export const conversationsAPI = {
  getAll: async () => {
    const response = await api.get("/conversations/");
    return response.data;
  },

  getOrCreate: async () => {
    const response = await api.get("/conversations/get_or_create/");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/conversations/${id}/`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/conversations/", data);
    return response.data;
  },

  sendMessage: async (
    id: string,
    content: string,
    isResponseToProactive: boolean = false
  ) => {
    const response = await api.post(`/conversations/${id}/send_message/`, {
      content,
      is_response_to_proactive: isResponseToProactive,
      // Command detection is now done by backend using LLM
    });
    return response.data;
  },

  checkProactive: async (id: string) => {
    const response = await api.get(`/conversations/${id}/check_proactive/`);
    return response.data;
  },

  adjustProactivity: async (id: string) => {
    const response = await api.post(`/conversations/${id}/adjust_proactivity/`);
    return response.data;
  },

  getProactivitySettings: async (id: string) => {
    const response = await api.get(
      `/conversations/${id}/proactivity_settings/`
    );
    return response.data;
  },

  updateProactivitySettings: async (id: string, settings: any) => {
    const response = await api.patch(
      `/conversations/${id}/update_proactivity_settings/`,
      settings
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/conversations/${id}/`);
    return response.data;
  },
};

// Messages API
export const messagesAPI = {
  getByConversation: async (
    conversationId: string,
    options?: { limit?: number; before?: string }
  ) => {
    const params = new URLSearchParams({ conversation: conversationId });
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.before) params.append("before", options.before);

    const response = await api.get(`/messages/?${params.toString()}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/messages/", data);
    return response.data;
  },
};

// Timers API
export const timersAPI = {
  getAll: async () => {
    const response = await api.get("/timers/");
    return response.data;
  },

  getActive: async () => {
    const response = await api.get("/timers/active/");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/timers/${id}/`);
    return response.data;
  },

  create: async (data: { name: string; duration_seconds: number }) => {
    const response = await api.post("/timers/", data);
    return response.data;
  },

  pause: async (id: string) => {
    const response = await api.post(`/timers/${id}/pause/`);
    return response.data;
  },

  resume: async (id: string) => {
    const response = await api.post(`/timers/${id}/resume/`);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await api.post(`/timers/${id}/cancel/`);
    return response.data;
  },

  cancelAll: async () => {
    const response = await api.post("/timers/cancel_all/");
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/timers/${id}/`);
    return response.data;
  },
};

export default api;
