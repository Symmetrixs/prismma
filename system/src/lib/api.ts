const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

async function request(path: string, options: RequestOptions = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (!options.skipAuth && accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && !options.skipAuth && path !== "/auth/refresh") {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request(path, options);
    }
  }

  if (!res.ok) {
    const body = await res
      .json()
      .catch(() => ({ detail: "Something went wrong" }));
    throw new Error(body.detail || "Request failed");
  }

  if (res.status === 204) return null;
  return res.json();
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return false;
    const data = await res.json();
    accessToken = data.access_token;
    return true;
  } catch {
    return false;
  }
}

async function uploadFile(path: string, file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  });

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return uploadFile(path, file);
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(body.detail || "Upload failed");
  }

  return res.json();
}

export const api = {
  register: (payload: {
    name: string;
    email: string;
    password: string;
    employee_id: string;
    phone_number?: string;
    department_id?: number;
    job_title?: string;
  }) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    }),

  login: (identifier: string, password: string) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
      skipAuth: true,
    }),

  logout: () => request("/auth/logout", { method: "POST" }),

  refresh: tryRefresh,

  changePassword: (current_password: string, new_password: string) =>
    request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password, new_password }),
    }),

  requestPasswordReset: (email: string) =>
    request("/auth/password-reset/request", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipAuth: true,
    }),

  getMyProfile: () => request("/users/me"),
  updateMyProfile: (payload: Record<string, unknown>) =>
    request("/users/me", { method: "PATCH", body: JSON.stringify(payload) }),

  getModules: () => request("/modules"),
  createModule: (payload: {
    name: string;
    description?: string;
    status: string;
  }) => request("/modules", { method: "POST", body: JSON.stringify(payload) }),
  deleteModule: (id: number) => request(`/modules/${id}`, { method: "DELETE" }),

  getDepartments: () => request("/departments", { skipAuth: true }),
  createDepartment: (name: string) =>
    request("/departments", { method: "POST", body: JSON.stringify({ name }) }),
  deleteDepartment: (id: number) =>
    request(`/departments/${id}`, { method: "DELETE" }),

  getMyModuleAccess: () => request("/module-access/mine"),
  requestModuleAccess: (moduleId: number) =>
    request(`/module-access/request/${moduleId}`, { method: "POST" }),
  grantModuleAccess: (userId: number, moduleId: number) =>
    request("/module-access/grant", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, module_id: moduleId }),
    }),
  getPendingModuleRequests: () => request("/module-access/pending"),
  approveModuleRequest: (id: number) =>
    request(`/module-access/${id}/approve`, { method: "POST" }),
  rejectModuleRequest: (id: number, reason: string) =>
    request(`/module-access/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ rejection_reason: reason }),
    }),

  getUsers: () => request("/users"),
  getUserDetail: (id: number) => request(`/users/${id}`),
  getUserAnalytics: () => request("/users/analytics"),
  getPendingRegistrations: () => request("/users/pending-registrations"),
  createUser: (payload: Record<string, unknown>) =>
    request("/users", { method: "POST", body: JSON.stringify(payload) }),
  approveRegistration: (id: number) =>
    request(`/users/${id}/approve`, { method: "POST" }),
  rejectRegistration: (id: number, reason: string) =>
    request(`/users/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  updateUser: (id: number, payload: Record<string, unknown>) =>
    request(`/users/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  disableUser: (id: number) =>
    request(`/users/${id}/disable`, { method: "POST" }),
  enableUser: (id: number) =>
    request(`/users/${id}/enable`, { method: "POST" }),
  unlockUser: (id: number) =>
    request(`/users/${id}/unlock`, { method: "POST" }),
  setBlockStatus: (id: number, isBlocked: boolean) =>
    request(`/users/${id}/block`, {
      method: "POST",
      body: JSON.stringify({ is_blocked: isBlocked }),
    }),
  changeRole: (id: number, newRole: string) =>
    request(`/users/${id}/role`, {
      method: "POST",
      body: JSON.stringify({ new_role: newRole }),
    }),

  revokeModuleAccess: (id: number) =>
    request(`/module-access/${id}/revoke`, { method: "POST" }),

  getHistory: () => request("/history"),

  getPendingPasswordResets: () => request("/auth/password-reset/pending"),
  approvePasswordReset: (id: number) =>
    request(`/auth/password-reset/${id}/approve`, { method: "POST" }),

  getAllNews: () => request("/news?published_only=false"),
  createNews: (payload: Record<string, unknown>) =>
    request("/news", { method: "POST", body: JSON.stringify(payload) }),
  updateNews: (id: number, payload: Record<string, unknown>) =>
    request(`/news/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteNews: (id: number) => request(`/news/${id}`, { method: "DELETE" }),

  uploadNewsMedia: (file: File) => uploadFile("/uploads/news-media", file),
  uploadProfilePicture: (file: File) =>
    uploadFile("/uploads/profile-picture", file),
};
