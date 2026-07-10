const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

export async function apiClient(
  endpoint: string,
  options: RequestOptions = {},
) {
  const { method = "GET", body, headers = {} } = options;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("ysg-token") : null;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}/api${endpoint}`, config);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}
