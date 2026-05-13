const API_URL = import.meta.env.VITE_API_URL || "";

export const api = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}/api${endpoint}`, { ...options, headers });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(error.error || response.statusText);
    }
    return response.json();
  },

  auth: {
    login: (credentials: any) => api.fetch("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
    register: (details: any) => api.fetch("/auth/register", { method: "POST", body: JSON.stringify(details) }),
  },

  projects: {
    list: () => api.fetch("/projects"),
    get: (id: string) => api.fetch(`/projects/${id}`),
    create: (data: any) => api.fetch("/projects", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => api.fetch(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  },

  users: {
    list: () => api.fetch("/users"),
  },

  tasks: {
    listByProject: (projectId: string) => api.fetch(`/tasks?projectId=${projectId}`),
    dashboard: () => api.fetch("/tasks/dashboard"),
    create: (data: any) => api.fetch("/tasks", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => api.fetch(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  }
};
