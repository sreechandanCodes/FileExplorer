import { useEffect, useRef } from 'react';
import { useFileExplorerLogic } from './appLogic';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CloseIcon,
  FileIcon,
  FolderIcon,
  InfoIcon,
  ParentDirectoryIcon,
  SymlinkIcon,
} from './icons';
import { isBrokenSymlink, isVisuallyUnavailable } from './navigation';
import type { BottomBarStatus, Entry } from './types';
import './App.css';

function App() {
  const fileExplorer = useFileExplorerLogic();

  return (
    <div className="flex col h-100pc">
      <TopBar
        currentPath={fileExplorer.currentPath}
        canGoNext={fileExplorer.history.canGoNext}
        canGoPrevious={fileExplorer.history.canGoPrevious}
        onGoToParent={fileExplorer.nav.goToParent}
        onGoNext={fileExplorer.nav.goNext}
        onGoPrevious={fileExplorer.nav.goPrevious}
      />
      <div className="main-area flex grow">
        <EntryList
          entries={fileExplorer.entries}
          selectedIndex={fileExplorer.selectedIndex}
          onSelectEntry={fileExplorer.selectEntryIndex}
          onOpenEntry={fileExplorer.openEntry}
        />
        <EntryDetails entry={fileExplorer.selectedEntry} />
      </div>
      <BottomBar
        status={fileExplorer.bottomBarStatus}
        isKeyboardHelpOpen={fileExplorer.keyboardHelp.isOpen}
        onOpenKeyboardHelp={fileExplorer.keyboardHelp.open}
        onCloseKeyboardHelp={fileExplorer.keyboardHelp.close}
      />
    </div>
  );
}

function TopBar({
  currentPath,
  canGoNext,
  canGoPrevious,
  onGoToParent,
  onGoNext,
  onGoPrevious,
}: {
  currentPath: string;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onGoToParent: () => void;
  onGoNext: () => void;
  onGoPrevious: () => void;
}) {
  /*
  - History: Back/Forward buttons
  - Current Path (Non-Editable to keep it simple for now, can be made editable later)
  - For later:
    - Search Bar
  */
  return (
    <div className="top-bar flex items-center gap-10 pad-5">
      <div className="flex items-center gap-5">
        <button
          className="top-bar-button"
          type="button"
          aria-label="Go to parent directory"
          title="Go to parent directory"
          disabled={currentPath === '/'}
          onClick={onGoToParent}
        >
          <ParentDirectoryIcon />
        </button>
        <button
          className="top-bar-button"
          type="button"
          aria-label="Go to previous location"
          title="Go to previous location"
          disabled={!canGoPrevious}
          onClick={onGoPrevious}
        >
          <ArrowLeftIcon />
        </button>
        <button
          className="top-bar-button"
          type="button"
          aria-label="Go to next location"
          title="Go to next location"
          disabled={!canGoNext}
          onClick={onGoNext}
        >
          <ArrowRightIcon />
        </button>
      </div>
      <span>{currentPath}</span>
    </div>
  );
}

function EntryList({
  entries,
  selectedIndex,
  onSelectEntry,
  onOpenEntry,
}: {
  entries: Entry[];
  selectedIndex: number;
  onSelectEntry: (entryIndex: number) => void;
  onOpenEntry: (entry: Entry) => void;
}) {
  return (
    <div className="grow overflow-y-auto scrollarea overscroll-x-none">
      {entries.map((entry, entryIndex) => (
        <EntryRow
          key={entry.fullPath}
          entry={entry}
          isSelected={entryIndex === selectedIndex}
          onSelect={() => onSelectEntry(entryIndex)}
          onOpen={() => onOpenEntry(entry)}
        />
      ))}
    </div>
  );
}

function EntryRow({
  entry,
  isSelected,
  onSelect,
  onOpen,
}: {
  entry: Entry;
  isSelected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const unavailableClass = isVisuallyUnavailable(entry) ? ' unavailable' : '';

  useEffect(() => {
    if (isSelected) {
      rowRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [isSelected]);

  return (
    <div
      ref={rowRef}
      className={`file-entry flex items-center gap-6 px-8 py-2${isSelected ? ' selected' : ''}${unavailableClass}`}
      aria-selected={isSelected}
      onClick={onSelect}
      onDoubleClick={() => {
        if (entry.canOpen) {
          onOpen();
        }
      }}
    >
      <EntryIcon entry={entry} />
      <span>{entry.name}</span>
    </div>
  );
}

function EntryIcon({ entry }: { entry: Entry }) {
  return entry.isSymbolicLink ? <SymlinkIcon /> : entry.isDirectory ? <FolderIcon /> : <FileIcon />;
}

function EntryDetails({ entry }: { entry?: Entry }) {
  if (!entry) {
    return (
      <aside className="entry-details">
        <div className="entry-details-empty">No entry selected</div>
      </aside>
    );
  }

  const type = entry.isSymbolicLink
    ? 'Symlink'
    : entry.isDirectory
      ? 'Folder'
      : 'File';
  const availabilityMessage = getAvailabilityMessage(entry);
  const targetIsMeaningfullyDifferent = areSymlinkTargetsMeaningfullyDifferent(
    entry.linkTargetPath,
    entry.linkTarget
  );

  return (
    <aside className="entry-details">
      <h2>{entry.name}</h2>
      <dl>
        <MetadataRow label="Type" value={type} />
        <MetadataRow label="Path" value={entry.fullPath} />
        <MetadataRow label="Created" value={formatDate(entry.createdAt)} />
        <MetadataRow label="Modified" value={formatDate(entry.modifiedAt)} />
        <MetadataRow label="Hidden" value={entry.isHidden ? 'Yes' : 'No'} />
        {availabilityMessage && <MetadataRow label="Status" value={availabilityMessage} />}
        {entry.linkTargetPath && <MetadataRow label="Target path" value={entry.linkTargetPath} />}
        {targetIsMeaningfullyDifferent && entry.linkTarget && <MetadataRow label="Target" value={entry.linkTarget} />}
        {!entry.isDirectory && <MetadataRow label="Size" value={`${entry.size} bytes`} />}
        {entry.extension && <MetadataRow label="Extension" value={entry.extension} />}
      </dl>
    </aside>
  );
}

function areSymlinkTargetsMeaningfullyDifferent(targetPath?: string | null, target?: string | null) {
  if (!targetPath || !target) return false;

  return normalizeSymlinkTargetForDisplay(targetPath) !== normalizeSymlinkTargetForDisplay(target);
}

function normalizeSymlinkTargetForDisplay(value: string) {
  return value.trim().replace(/^\/+|\/+$/g, '');
}

function getAvailabilityMessage(entry: Entry) {
  if (isBrokenSymlink(entry)) {
    return 'Broken symlink: target path is invalid';
  }

  if (entry.isDirectory && !entry.canOpen) {
    return 'Cannot enter this folder';
  }

  if (entry.isSymbolicLink && !entry.canOpen) {
    return 'Cannot enter this symlink target';
  }

  return null;
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="metadata-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function BottomBar({
  status,
  isKeyboardHelpOpen,
  onOpenKeyboardHelp,
  onCloseKeyboardHelp,
}: {
  status: BottomBarStatus;
  isKeyboardHelpOpen: boolean;
  onOpenKeyboardHelp: () => void;
  onCloseKeyboardHelp: () => void;
}) {
  return (
    <div className="bottom-bar flex items-center justify-between pad-5">
      <div className="left-section flex items-center gap-10">
        <span>({status.currentPosition}/{status.totalCount})</span>
        <span>{status.folderCount} folders</span>
        <span>{status.fileCount} files</span>
      </div>
      <div className="right-section flex items-center gap-10">
        {status.canJumpToTarget && <KeyboardHint keys={['j']} label="Jump target" />}
        <button
          className="bottom-bar-info-button"
          type="button"
          aria-label="Show keyboard help"
          title="Show keyboard help"
          onClick={onOpenKeyboardHelp}
        >
          <InfoIcon />
        </button>
      </div>
      {isKeyboardHelpOpen && <KeyboardHelpOverlay onClose={onCloseKeyboardHelp} />}
    </div>
  );
}

function KeyboardHint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className="keyboard-hint">
      <span>
        {keys.map(key => <kbd key={key}>{key}</kbd>)}
      </span>
      {label}
    </span>
  );
}

function KeyboardHelpOverlay({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="keyboard-help-overlay" onMouseDown={onClose}>
      <section
        className="keyboard-help-panel"
        aria-modal="true"
        aria-labelledby="keyboard-help-title"
        role="dialog"
        onMouseDown={event => event.stopPropagation()}
      >
        <div className="keyboard-help-header">
          <h2 id="keyboard-help-title">Keyboard</h2>
          <button
            className="keyboard-help-close"
            type="button"
            aria-label="Close keyboard help"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>
        <dl className="keyboard-help-list">
          <ShortcutRow keys={['↑']} label="Select previous entry" />
          <ShortcutRow keys={['↓']} label="Select next entry" />
          <ShortcutRow keys={['←']} label="Go to parent directory" />
          <ShortcutRow keys={['→']} label="Go to remembered child, or open selected entry" />
          <ShortcutRow keys={['Alt', '←']} label="Go to previous location" />
          <ShortcutRow keys={['Alt', '→']} label="Go to next location" />
          <ShortcutRow keys={['j']} label="Jump to selected symlink target" />
          <ShortcutRow keys={['Esc']} label="Close this panel" />
        </dl>
      </section>
    </div>
  );
}

function ShortcutRow({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="shortcut-row">
      <dt>
        {keys.map(key => <kbd key={key}>{key}</kbd>)}
      </dt>
      <dd>{label}</dd>
    </div>
  );
}

export default App;
