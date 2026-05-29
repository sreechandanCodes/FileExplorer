import { useEffect, useRef } from 'react';
import {
  FileIcon,
  FolderIcon,
  SymlinkIcon,
} from './icons';
import { isVisuallyUnavailable } from './navigation';
import type { Entry } from './types';

export function EntryList({
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
