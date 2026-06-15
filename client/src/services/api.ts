const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

interface RequestOptions extends RequestInit {
  body?: any;
}

async function request(path: string, options: RequestOptions = {}) {
  const token = localStorage.getItem("token");
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  get: (path: string, options?: RequestOptions) => 
    request(path, { ...options, method: "GET" }),
    
  post: (path: string, body?: any, options?: RequestOptions) => 
    request(path, { ...options, method: "POST", body }),
    
  put: (path: string, body?: any, options?: RequestOptions) => 
    request(path, { ...options, method: "PUT", body }),
    
  delete: (path: string, options?: RequestOptions) => 
    request(path, { ...options, method: "DELETE" }),
};
