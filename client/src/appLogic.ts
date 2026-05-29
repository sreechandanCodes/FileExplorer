import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as navigation from './navigation';
import type {
  NavigationActions,
  Path,
  VisitedChildByPath,
} from './navigation';
import type { BottomBarStatus, DirectoryContents } from './types';

export function useFileExplorerLogic() {
  const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`;

  const [pathHistory, setPathHistory] = useState<{ paths: Path[]; index: number }>({
    paths: ['/'],
    index: 0,
  });
  const [entries, setEntries] = useState<DirectoryContents>([]);
  const [entriesPath, setEntriesPath] = useState<Path | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState(false);
  const visitedChildByPath = useRef<VisitedChildByPath>({});
  const pendingSelectionPath = useRef<string | null>(null);
  const currentPath = pathHistory.paths[pathHistory.index];
  const entriesAreCurrent = entriesPath === currentPath;

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

  const rememberVisitedChild = useCallback((parentPath: string, childPath: string) => {
    visitedChildByPath.current[parentPath] = childPath;
  }, []);

  const getVisitedChild = useCallback((parentPath: string) => {
    return visitedChildByPath.current[parentPath];
  }, []);

  const selectEntryByPath = useCallback((path: string) => {
    if (!entriesAreCurrent) return;

    const nextIndex = entries.findIndex(entry => entry.fullPath === path);
    setSelectedIndex(nextIndex >= 0 ? nextIndex : 0);
  }, [entries, entriesAreCurrent]);

  const navigateToDirectoryAndSelect = useCallback((directoryPath: string, entryPath: string) => {
    if (directoryPath === currentPath) {
      pendingSelectionPath.current = entryPath;
      if (entriesAreCurrent) {
        selectEntryByPath(entryPath);
      }
      return;
    }

    pendingSelectionPath.current = entryPath;
    navigateToPath(directoryPath);
  }, [currentPath, entriesAreCurrent, navigateToPath, selectEntryByPath]);

  const canListPath = useCallback(async (path: string) => {
    try {
      const response = await fetch(`${apiUrl}/list?path=${encodeURIComponent(path)}`);
      return response.ok;
    } catch {
      return false;
    }
  }, [apiUrl]);

  const openDirectory = useCallback((nextPath: string) => {
    navigation.openDirectory({
      currentPath,
      nextPath,
      rememberVisitedChild,
      setCurrentPath: navigateToPath,
    });
  }, [currentPath, navigateToPath, rememberVisitedChild]);

  const openEntry = useCallback((entry: DirectoryContents[number]) => {
    navigation.openEntry({
      currentPath,
      entry,
      rememberVisitedChild,
      setCurrentPath: navigateToPath,
    });
  }, [currentPath, navigateToPath, rememberVisitedChild]);

  const nav: NavigationActions = useMemo(() => ({
    goToParent: () => {
      navigation.goToParent({
        currentPath,
        rememberVisitedChild,
        navigateToDirectoryAndSelect,
      });
    },
    goToVisitedChild: () => navigation.goToVisitedChild({
      entries,
      entriesAreCurrent,
      visitedChildPath: getVisitedChild(currentPath),
      openEntry,
    }),
    goNext: goToNextHistoryEntry,
    goPrevious: goToPreviousHistoryEntry,
    goToNextSibling: () => {
      navigation.goToNextSibling({
        entries,
        setSelectedIndex,
      });
    },
    goToPreviousSibling: () => {
      navigation.goToPreviousSibling({ setSelectedIndex });
    },
    openSelectedEntry: () => {
      navigation.openSelectedEntry({
        entries,
        selectedIndex,
        entriesAreCurrent,
        openEntry,
      });
    },
    openDirectory,
    openEntry,
    jumpToSelectedSymlinkTarget: () => navigation.jumpToSelectedSymlinkTarget({
      entries,
      selectedIndex,
      entriesAreCurrent,
      rememberVisitedChild,
      navigateToDirectoryAndSelect,
      setCurrentPath: navigateToPath,
      canListPath,
    }),
  }), [
    canListPath,
    currentPath,
    entries,
    entriesAreCurrent,
    getVisitedChild,
    goToNextHistoryEntry,
    goToPreviousHistoryEntry,
    navigateToDirectoryAndSelect,
    navigateToPath,
    openEntry,
    openDirectory,
    rememberVisitedChild,
    selectedIndex,
  ]);

  useEffect(() => {
    let isCurrentRequest = true;
    fetch(`${apiUrl}/list?path=${encodeURIComponent(currentPath)}`)
      .then(response => response.json())
      .then((data: DirectoryContents) => {
        if (!isCurrentRequest) return;

        const sortedEntries = navigation.sortEntries(data);
        const pendingPath = pendingSelectionPath.current;
        const visitedChildPath = getVisitedChild(currentPath);
        const selectedPath = pendingPath || visitedChildPath;
        const selectedPathIndex = selectedPath
          ? sortedEntries.findIndex(entry => entry.fullPath === selectedPath)
          : -1;

        setEntries(sortedEntries);
        setSelectedIndex(Math.max(selectedPathIndex, 0));
        setEntriesPath(currentPath);
        pendingSelectionPath.current = null;
      })
      .catch(error => {
        if (!isCurrentRequest) return;

        console.error('Error fetching path', error);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [apiUrl, currentPath, getVisitedChild]);

  useEffect(() => {
    if (!entriesAreCurrent) return;

    const selectedEntry = entries[selectedIndex];
    if (!selectedEntry) return;

    rememberVisitedChild(currentPath, selectedEntry.fullPath);
  }, [entries, selectedIndex, currentPath, entriesAreCurrent, rememberVisitedChild]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isKeyboardHelpOpen) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) {
        return;
      }

      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        nav.goPrevious();
      } else if (event.altKey && event.key === 'ArrowRight') {
        event.preventDefault();
        nav.goNext();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        nav.goToPreviousSibling();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        nav.goToNextSibling();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        nav.goToParent();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (!nav.goToVisitedChild()) {
          nav.openSelectedEntry();
        }
      } else if (navigation.isJumpKey(event)) {
        event.preventDefault();
        nav.jumpToSelectedSymlinkTarget();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isKeyboardHelpOpen,
    nav,
  ]);

  const currentEntries = entriesAreCurrent ? entries : [];
  const selectedEntry = currentEntries[selectedIndex];
  const totalCount = currentEntries.length;
  const folderCount = currentEntries.filter(entry => entry.isDirectory).length;
  const fileCount = totalCount - folderCount;
  const canGoPrevious = pathHistory.index > 0;
  const canGoNext = pathHistory.index < pathHistory.paths.length - 1;
  const bottomBarStatus: BottomBarStatus = {
    totalCount,
    currentPosition: totalCount === 0 ? 0 : selectedIndex + 1,
    folderCount,
    fileCount,
    canJumpToTarget: Boolean(
      selectedEntry?.isSymbolicLink && selectedEntry.linkTarget && selectedEntry.canJumpToTarget !== false
    ),
  };

  return {
    currentPath,
    entries: currentEntries,
    selectedIndex: entriesAreCurrent ? selectedIndex : 0,
    selectedEntry,
    selectEntryIndex: setSelectedIndex,
    openEntry: nav.openEntry,
    nav,
    history: {
      canGoNext,
      canGoPrevious,
    },
    bottomBarStatus,
    keyboardHelp: {
      isOpen: isKeyboardHelpOpen,
      open: () => setIsKeyboardHelpOpen(true),
      close: () => setIsKeyboardHelpOpen(false),
    },
  };
}
