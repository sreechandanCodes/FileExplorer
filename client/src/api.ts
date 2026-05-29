import type { DirectoryListing } from './types';

const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function listDirectory(path: string): Promise<DirectoryListing> {
  const response = await fetch(`${apiUrl}/list?path=${encodeURIComponent(path)}`);
  const data: unknown = await response.json();

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data), response.status);
  }

  if (!isDirectoryListing(data)) {
    throw new ApiError('Directory response was not a valid listing', response.status);
  }

  return data;
}

export async function getRootDirectory() {
  const response = await fetch(`${apiUrl}/root`);
  const data: unknown = await response.json();

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data), response.status);
  }

  if (!isRootDirectoryResponse(data)) {
    throw new ApiError('Root response was not valid', response.status);
  }

  return data.rootDirectory;
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

function isDirectoryListing(data: unknown): data is DirectoryListing {
  if (!data || typeof data !== 'object') return false;

  const listing = data as Partial<DirectoryListing>;
  return typeof listing.path === 'string'
    && typeof listing.rootPath === 'string'
    && (typeof listing.parentPath === 'string' || listing.parentPath === null)
    && typeof listing.pathSeparator === 'string'
    && Array.isArray(listing.entries);
}

function isRootDirectoryResponse(data: unknown): data is { rootDirectory: string } {
  if (!data || typeof data !== 'object') return false;

  const response = data as { rootDirectory?: unknown };
  return typeof response.rootDirectory === 'string';
}
