import type { DirectoryContents } from './types';

const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function listDirectory(path: string): Promise<DirectoryContents> {
  const response = await fetch(`${apiUrl}/list?path=${encodeURIComponent(path)}`);
  const data: unknown = await response.json();

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data), response.status);
  }

  if (!Array.isArray(data)) {
    throw new ApiError('Directory response was not a list', response.status);
  }

  return data;
}

export async function canListPath(path: string) {
  try {
    const response = await fetch(`${apiUrl}/list?path=${encodeURIComponent(path)}`);
    return response.ok;
  } catch {
    return false;
  }
}

function getErrorMessage(data: unknown) {
  if (isApiErrorResponse(data)) return data.error;
  return 'Directory request failed';
}

function isApiErrorResponse(data: unknown): data is { error: string } {
  const error = data && typeof data === 'object'
    ? (data as { error?: unknown }).error
    : undefined;

  return Boolean(
    typeof error === 'string'
  );
}
