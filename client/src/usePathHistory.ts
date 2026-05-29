import { useCallback, useState } from 'react';
import type { Path } from './navigation';

interface PathHistoryState {
  paths: Path[];
  index: number;
}

export function usePathHistory(initialPath: Path = '') {
  const [pathHistory, setPathHistory] = useState<PathHistoryState>({
    paths: [initialPath],
    index: 0,
  });

  const currentPath = pathHistory.paths[pathHistory.index];

  const navigateToPath = useCallback((nextPath: Path) => {
    setPathHistory(prevPathHistory => {
      if (prevPathHistory.paths[prevPathHistory.index] === nextPath) {
        return prevPathHistory;
      }

      const previousPaths = prevPathHistory.paths.slice(0, prevPathHistory.index + 1);
      return {
        paths: [...previousPaths, nextPath],
        index: previousPaths.length,
      };
    });
  }, []);

  const replaceCurrentPath = useCallback((nextPath: Path) => {
    setPathHistory(prevPathHistory => ({
      ...prevPathHistory,
      paths: prevPathHistory.paths.map((path, index) => (
        index === prevPathHistory.index ? nextPath : path
      )),
    }));
  }, []);

  const goToPreviousHistoryEntry = useCallback(() => {
    setPathHistory(prevPathHistory => ({
      ...prevPathHistory,
      index: Math.max(prevPathHistory.index - 1, 0),
    }));
  }, []);

  const goToNextHistoryEntry = useCallback(() => {
    setPathHistory(prevPathHistory => ({
      ...prevPathHistory,
      index: Math.min(prevPathHistory.index + 1, prevPathHistory.paths.length - 1),
    }));
  }, []);

  return {
    currentPath,
    navigateToPath,
    replaceCurrentPath,
    goToNextHistoryEntry,
    goToPreviousHistoryEntry,
    canGoNext: pathHistory.index < pathHistory.paths.length - 1,
    canGoPrevious: pathHistory.index > 0,
    size: pathHistory.paths.length,
  };
}
