import { API_BASE_URL } from '../constants';

export async function mobileFetch<T>(
  path: string,
  opts?: {
    method?: 'GET' | 'POST';
    token?: string;
    body?: unknown;
  },
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: opts?.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(opts?.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    ...(opts?.body ? { body: JSON.stringify(opts.body) } : {}),
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message ?? data.error ?? 'Request failed.');
  }

  return data;
}
