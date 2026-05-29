import { useEffect } from 'react';
import * as navigation from './navigation';
import type { NavigationActions } from './navigation';

export function useKeyboardNavigation({
  isDisabled,
  nav,
}: {
  isDisabled: boolean;
  nav: NavigationActions;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isDisabled) {
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
    isDisabled,
    nav,
  ]);
}
