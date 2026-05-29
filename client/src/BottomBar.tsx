import { useEffect } from 'react';
import {
  CloseIcon,
  InfoIcon,
} from './icons';
import type { BottomBarStatus } from './types';

export function BottomBar({
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
