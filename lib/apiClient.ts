const API_BASE_URL = (import.meta.env as any)["VITE_API_BASE_URL"] || "http://localhost:8000";
const TOKEN_KEY = "statskill_access_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    let rawText = "";
    try {
      rawText = await response.text();
      const errorJson = JSON.parse(rawText);
      if (errorJson.detail) {
        errorDetail = typeof errorJson.detail === "string" ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch {
      // fallback
    }
    const err: any = new Error(errorDetail);
    err.status = response.status;
    err.rawText = rawText;
    throw err;
  }

  return response.json();
}

export { API_BASE_URL };

export function getMediaUrl(urlPath?: string | null): string | undefined {
  if (!urlPath) return undefined;
  if (urlPath.startsWith("http://") || urlPath.startsWith("https://") || urlPath.startsWith("data:")) {
    return urlPath;
  }
  return `${API_BASE_URL}${urlPath.startsWith("/") ? "" : "/"}${urlPath}`;
}

export async function uploadForm<T = any>(endpoint: string, formData: FormData): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    let errorDetail = `Upload failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorDetail = typeof errorJson.detail === "string" ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch {
      // fallback
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const apiClient = {
  get: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: "GET" }),
  post: <T = any>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, { method: "POST", ...(data !== undefined ? { body: JSON.stringify(data) } : {}) }),
  put: <T = any>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, { method: "PUT", ...(data !== undefined ? { body: JSON.stringify(data) } : {}) }),
  patch: <T = any>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, { method: "PATCH", ...(data !== undefined ? { body: JSON.stringify(data) } : {}) }),
  delete: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: "DELETE" }),
  upload: <T = any>(endpoint: string, formData: FormData) => uploadForm<T>(endpoint, formData),
};
