import { describe, expect, it, vi } from 'vitest';
import {
  goToParent,
  jumpToSelectedSymlinkTarget,
  openEntry,
  sortEntries,
} from './navigation';
import type { Entry } from './types';

function makeEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    name: 'entry',
    fullPath: '/home/user/entry',
    isDirectory: false,
    isSymbolicLink: false,
    isHidden: false,
    canOpen: false,
    size: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    modifiedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('goToParent', () => {
  it('uses the parent path supplied by the server', () => {
    const rememberVisitedChild = vi.fn();
    const navigateToDirectoryAndSelect = vi.fn();

    goToParent({
      currentPath: 'C:\\Users\\demo\\Documents',
      parentPath: 'C:\\Users\\demo',
      rememberVisitedChild,
      navigateToDirectoryAndSelect,
    });

    expect(rememberVisitedChild).toHaveBeenCalledWith(
      'C:\\Users\\demo',
      'C:\\Users\\demo\\Documents'
    );
    expect(navigateToDirectoryAndSelect).toHaveBeenCalledWith(
      'C:\\Users\\demo',
      'C:\\Users\\demo\\Documents'
    );
  });

  it('does nothing when there is no parent path', () => {
    const rememberVisitedChild = vi.fn();
    const navigateToDirectoryAndSelect = vi.fn();

    goToParent({
      currentPath: 'C:\\',
      parentPath: null,
      rememberVisitedChild,
      navigateToDirectoryAndSelect,
    });

    expect(rememberVisitedChild).not.toHaveBeenCalled();
    expect(navigateToDirectoryAndSelect).not.toHaveBeenCalled();
  });
});

describe('sortEntries', () => {
  it('sorts folders, then symlinks, then files by name', () => {
    const folder = makeEntry({ name: 'z-folder', fullPath: '/z-folder', isDirectory: true, canOpen: true });
    const symlink = makeEntry({ name: 'a-link', fullPath: '/a-link', isSymbolicLink: true, canOpen: true });
    const file = makeEntry({ name: 'b-file.txt', fullPath: '/b-file.txt' });

    expect(sortEntries([file, symlink, folder]).map(entry => entry.name)).toEqual([
      'z-folder',
      'a-link',
      'b-file.txt',
    ]);
  });
});

describe('openEntry', () => {
  it('opens folders by full path', () => {
    const rememberVisitedChild = vi.fn();
    const setCurrentPath = vi.fn();
    const folder = makeEntry({
      fullPath: '/home/user/docs',
      isDirectory: true,
      canOpen: true,
    });

    openEntry({
      currentPath: '/home/user',
      entry: folder,
      rememberVisitedChild,
      setCurrentPath,
    });

    expect(rememberVisitedChild).toHaveBeenCalledWith('/home/user', '/home/user/docs');
    expect(setCurrentPath).toHaveBeenCalledWith('/home/user/docs');
  });

  it('opens symlinks by resolved target path', () => {
    const rememberVisitedChild = vi.fn();
    const setCurrentPath = vi.fn();
    const symlink = makeEntry({
      fullPath: '/home/user/link',
      isSymbolicLink: true,
      canOpen: true,
      linkTarget: '/mnt/shared/docs',
      linkTargetPath: '../shared/docs',
    });

    openEntry({
      currentPath: '/home/user',
      entry: symlink,
      rememberVisitedChild,
      setCurrentPath,
    });

    expect(rememberVisitedChild).toHaveBeenCalledWith('/home/user', '/home/user/link');
    expect(setCurrentPath).toHaveBeenCalledWith('/mnt/shared/docs');
  });
});

describe('jumpToSelectedSymlinkTarget', () => {
  it('reveals file targets in their parent folder', async () => {
    const rememberVisitedChild = vi.fn();
    const navigateToDirectoryAndSelect = vi.fn();
    const setCurrentPath = vi.fn();
    const canListPath = vi.fn(async (path: string) => path === '/mnt/shared');
    const symlink = makeEntry({
      fullPath: '/home/user/file-link',
      isSymbolicLink: true,
      canOpen: true,
      linkTarget: '/mnt/shared/report.txt',
      linkTargetParentPath: '/mnt/shared',
    });

    await jumpToSelectedSymlinkTarget({
      entries: [symlink],
      selectedIndex: 0,
      entriesAreCurrent: true,
      rememberVisitedChild,
      navigateToDirectoryAndSelect,
      setCurrentPath,
      canListPath,
    });

    expect(setCurrentPath).not.toHaveBeenCalled();
    expect(rememberVisitedChild).toHaveBeenCalledWith('/mnt/shared', '/mnt/shared/report.txt');
    expect(navigateToDirectoryAndSelect).toHaveBeenCalledWith('/mnt/shared', '/mnt/shared/report.txt');
  });
});
