import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ParentDirectoryIcon,
} from './icons';

export function TopBar({
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
