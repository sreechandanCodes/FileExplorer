import { isBrokenSymlink } from './navigation';
import type { Entry } from './types';

export function EntryDetails({ entry }: { entry?: Entry }) {
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
