import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const DIRECTORY_ENTRY_CONCURRENCY = 32;

const asyncMapLimit = async (array, limit, callback) => {
  const results = new Array(array.length);
  let nextIndex = 0;

  const workers = Array.from({ length: Math.min(limit, array.length) }, async () => {
    while (nextIndex < array.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await callback(array[currentIndex]);
    }
  });

  await Promise.all(workers);
  return results;
};

const canOpenDirectory = async entryPath => {
  try {
    const dir = await fs.opendir(entryPath);
    await dir.close();
    return true;
  } catch {
    return false;
  }
};

const canJumpToSymlinkTarget = async targetPath => {
  if (await canOpenDirectory(targetPath)) return true;
  return canOpenDirectory(path.dirname(targetPath));
};

export const getDirectoryContents = async dirPath => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const results = await asyncMapLimit(entries, DIRECTORY_ENTRY_CONCURRENCY, async (entry) => {
      const fullPath = path.join(dirPath, entry.name);
      let stats;
      try {
        stats = await fs.lstat(fullPath);
      } catch {
        return null;
      }

      const result = {
        name: entry.name,
        fullPath,
        isDirectory: entry.isDirectory(),
        isSymbolicLink: entry.isSymbolicLink(),
        isHidden: entry.name.startsWith('.'),
        canOpen: false,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      };

      if (result.isDirectory || result.isSymbolicLink) {
        result.canOpen = await canOpenDirectory(fullPath);
      }

      if (!result.isDirectory && !result.isSymbolicLink) {
        result.extension = path.extname(entry.name);
        if (result.extension === '') delete result.extension;
      }
      if (result.isSymbolicLink) {
        try {
          result.linkTargetPath = await fs.readlink(fullPath);
        } catch {
          result.linkTargetPath = null;
        }

        try {
          const realPath = await fs.realpath(fullPath);
          result.linkTarget = realPath;
          result.canJumpToTarget = await canJumpToSymlinkTarget(realPath);
        } catch (error) {
          result.linkTarget = null; // Broken link
          result.canJumpToTarget = false;
        }
      }
      return result;
    });
    return results.filter(Boolean);
  } catch (error) {
    return { isError: true, message: error.message };
  }
};

export const getHomeDirectory = () => {
  return os.homedir();
};

export const getRootDirectory = () => {
  return path.parse(process.cwd()).root;
};
