class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<unknown> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
  };

  const res = await fetch(path, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('auth:expired'));
    throw new ApiError('Unauthorized', 401);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error || `Request failed (${res.status})`, res.status);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string): Promise<T> =>
    apiFetch(path) as Promise<T>,

  post: <T>(path: string, body?: unknown): Promise<T> =>
    apiFetch(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }) as Promise<T>,

  put: <T>(path: string, body?: unknown): Promise<T> =>
    apiFetch(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }) as Promise<T>,

  patch: <T>(path: string, body?: unknown): Promise<T> =>
    apiFetch(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }) as Promise<T>,

  delete: <T>(path: string): Promise<T> =>
    apiFetch(path, { method: 'DELETE' }) as Promise<T>,
};

export { ApiError };
