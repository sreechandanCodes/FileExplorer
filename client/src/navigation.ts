import type { DirectoryContents, Entry } from './types';

export type Path = string;
export type VisitedChildByPath = Record<Path, Path>;

type SetSelectedIndex = (nextIndex: number | ((prevIndex: number) => number)) => void;
type SetPath = (path: Path) => void;
type EntryDestination = {
  directoryPath: Path;
  selectedEntryPath?: Path;
};

export interface NavigationActions {
  goToParent: () => void;
  goToVisitedChild: () => boolean;
  goNext: () => void;
  goPrevious: () => void;
  goToNextSibling: () => void;
  goToPreviousSibling: () => void;
  openSelectedEntry: () => void;
  openDirectory: (nextPath: Path) => void;
  openEntry: (entry: Entry) => void;
  jumpToSelectedSymlinkTarget: () => Promise<void>;
}

export function openDirectory({
  currentPath,
  nextPath,
  rememberVisitedChild,
  setCurrentPath,
}: {
  currentPath: Path;
  nextPath: Path;
  rememberVisitedChild: (parentPath: Path, childPath: Path) => void;
  setCurrentPath: SetPath;
}) {
  if (nextPath !== currentPath) {
    rememberVisitedChild(currentPath, nextPath);
    setCurrentPath(nextPath);
  }
}

export function goToParent({
  currentPath,
  parentPath,
  rememberVisitedChild,
  navigateToDirectoryAndSelect,
}: {
  currentPath: Path;
  parentPath: Path | null;
  rememberVisitedChild: (parentPath: Path, childPath: Path) => void;
  navigateToDirectoryAndSelect: (directoryPath: Path, entryPath: Path) => void;
}) {
  if (!parentPath) return;

  rememberVisitedChild(parentPath, currentPath);
  navigateToDirectoryAndSelect(parentPath, currentPath);
}

export function goToVisitedChild({
  entries,
  entriesAreCurrent,
  visitedChildPath,
  openEntry,
}: {
  entries: DirectoryContents;
  entriesAreCurrent: boolean;
  visitedChildPath?: Path;
  openEntry: (entry: Entry) => void;
}) {
  if (!entriesAreCurrent || !visitedChildPath) return false;

  const visitedChildEntry = entries.find(entry => entry.fullPath === visitedChildPath);
  if (!visitedChildEntry?.canOpen) return false;

  openEntry(visitedChildEntry);
  return true;
}

export function goToNextSibling({
  entries,
  setSelectedIndex,
}: {
  entries: DirectoryContents;
  setSelectedIndex: SetSelectedIndex;
}) {
  setSelectedIndex(prevIndex => {
    if (entries.length === 0) return 0;
    return Math.min(prevIndex + 1, entries.length - 1);
  });
}

export function goToPreviousSibling({
  setSelectedIndex,
}: {
  setSelectedIndex: SetSelectedIndex;
}) {
  setSelectedIndex(prevIndex => Math.max(prevIndex - 1, 0));
}

export function openSelectedEntry({
  entries,
  selectedIndex,
  entriesAreCurrent,
  openEntry,
}: {
  entries: DirectoryContents;
  selectedIndex: number;
  entriesAreCurrent: boolean;
  openEntry: (entry: Entry) => void;
}) {
  if (!entriesAreCurrent) return;

  const selectedEntry = entries[selectedIndex];
  if (!selectedEntry) return;

  if (selectedEntry.canOpen) {
    openEntry(selectedEntry);
  }
}

export function openEntry({
  currentPath,
  entry,
  rememberVisitedChild,
  setCurrentPath,
}: {
  currentPath: Path;
  entry: Entry;
  rememberVisitedChild: (parentPath: Path, childPath: Path) => void;
  setCurrentPath: SetPath;
}) {
  if (!entry.canOpen) return;

  const nextPath = getEntryOpenPath(entry);
  if (!nextPath || nextPath === currentPath) return;

  rememberVisitedChild(currentPath, entry.fullPath);
  setCurrentPath(nextPath);
}

function getEntryOpenPath(entry: Entry) {
  if (entry.isSymbolicLink) {
    return entry.linkTarget;
  }

  return entry.fullPath;
}

export async function jumpToSelectedSymlinkTarget({
  entries,
  selectedIndex,
  entriesAreCurrent,
  rememberVisitedChild,
  navigateToDirectoryAndSelect,
  setCurrentPath,
  canListPath,
}: {
  entries: DirectoryContents;
  selectedIndex: number;
  entriesAreCurrent: boolean;
  rememberVisitedChild: (parentPath: Path, childPath: Path) => void;
  navigateToDirectoryAndSelect: (directoryPath: Path, entryPath: Path) => void;
  setCurrentPath: SetPath;
  canListPath: (path: Path) => Promise<boolean>;
}) {
  if (!entriesAreCurrent) return;

  const selectedEntry = entries[selectedIndex];
  if (!selectedEntry?.isSymbolicLink || !selectedEntry.linkTarget) {
    return;
  }

  const destination = await getSymlinkTargetDestination(selectedEntry, canListPath);
  if (!destination) return;

  if (!destination.selectedEntryPath) {
    setCurrentPath(destination.directoryPath);
    return;
  }

  rememberVisitedChild(destination.directoryPath, destination.selectedEntryPath);
  navigateToDirectoryAndSelect(destination.directoryPath, destination.selectedEntryPath);
}

async function getSymlinkTargetDestination(
  entry: Entry,
  canListPath: (path: Path) => Promise<boolean>
): Promise<EntryDestination | null> {
  if (!entry.linkTarget) return null;

  if (await canListPath(entry.linkTarget)) {
    return { directoryPath: entry.linkTarget };
  }

  const targetParentPath = entry.linkTargetParentPath;
  if (!targetParentPath) return null;
  if (!await canListPath(targetParentPath)) return null;

  return {
    directoryPath: targetParentPath,
    selectedEntryPath: entry.linkTarget,
  };
}

function getEntrySortGroup(entry: Entry) {
  if (entry.isDirectory) return 0;
  if (entry.isSymbolicLink) return 1;
  return 2;
}

export function sortEntries(entries: DirectoryContents) {
  return [...entries].sort((a, b) => {
    const groupDifference = getEntrySortGroup(a) - getEntrySortGroup(b);
    if (groupDifference !== 0) return groupDifference;

    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}

export function isBrokenSymlink(entry: Entry) {
  return entry.isSymbolicLink && entry.linkTarget === null;
}

export function isVisuallyUnavailable(entry: Entry) {
  return (entry.isDirectory && !entry.canOpen)
    || (entry.isSymbolicLink && (!entry.canOpen || isBrokenSymlink(entry)));
}

export function isJumpKey(event: KeyboardEvent) {
  return event.code === 'KeyJ' || event.key.toLowerCase() === 'j';
}
