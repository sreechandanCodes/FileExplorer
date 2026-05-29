import type { DirectoryContents } from './types';

const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`;

export async function listDirectory(path: string): Promise<DirectoryContents> {
  const response = await fetch(`${apiUrl}/list?path=${encodeURIComponent(path)}`);
  return response.json();
}

export async function canListPath(path: string) {
  try {
    const response = await fetch(`${apiUrl}/list?path=${encodeURIComponent(path)}`);
    return response.ok;
  } catch {
    return false;
  }
}
