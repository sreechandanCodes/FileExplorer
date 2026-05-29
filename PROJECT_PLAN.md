# File Explorer App Plan

## Summary

Build a greenfield local file explorer with a Vite React frontend and Express Node.js backend. The app is for a trusted personal localhost user, exposes OS-level roots, and is read-only in v1: no create, delete, rename, upload, move, or edit operations.

The primary interaction is keyboard-first browsing, with matching UI controls for common navigation. Keyboard-first means important actions should be fast from the keyboard, not that mouse or button navigation is abandoned.

## Key Changes

- Scaffold:
  - `client/`: Vite + React frontend.
  - `server/`: Express REST backend.
  - Optional root-level scripts for running both together.
- Backend read-only REST APIs:
  - `GET /api`: health/status check for the backend.
  - `GET /api/home`: current user's home directory.
  - `GET /api/root`: filesystem root for the current runtime.
  - `GET /api/ls?path=...`: children of a directory with lightweight metadata needed for display and sorting.
  - `GET /api/symlink-target?path=...`: resolved target for a selected symlink.
- Lightweight list entry metadata:
  - name, absolute path, kind or equivalent type flags, extension, size, created time, modified time, hidden flag, symlink flag, and error state if inaccessible.
- Frontend layout:
  - Top hierarchy bar showing context like `parent2 > parent1 > currentFolder > visitedChild1 > visitedChild2`.
  - Address/path controls for copying the current folder path and pasting or typing an absolute path to open.
  - Back and forward navigation buttons for folder history.
  - Symlink jump controls when the selected item has a valid target, plus an inverse-jump control when the current location was reached through a symlink jump.
  - Main row list for current folder contents.
  - Bottom status bar showing selected item info, current folder counts, visible size where practical, and permission/error messages.
  - No search bar in v1.
- Navigation:
  - `Up/Down`: move among sibling entries.
  - `Left`: navigate to parent folder.
  - `Right`: navigate to cached last-visited child when available; otherwise open selected folder if it is a directory.
  - `Enter`: open selected folder.
  - `Home`: jump selection to top.
  - `End`: jump selection to bottom.
  - Add visible jump-to-top and jump-to-bottom buttons that perform the same actions as `Home` and `End`.
  - Add visible back and forward buttons that move through navigation history like a browser.
  - Opening a folder, opening a pasted path, or following a symlink target pushes a new history entry.
  - Using back or forward changes the current folder without creating another history entry.
  - Add a copy-current-path button that copies the current folder path to the clipboard.
  - Add a paste/type path bar that opens an absolute path after backend validation.
  - If a selected symlink has a target path, make the target path clickable from the details/status UI.
  - `j`: jump to the selected symlink's target when the target is valid.
  - Add a visible jump-to-target button for valid selected symlinks.
  - Track the source path when navigating through a symlink jump.
  - `Alt+j`: inverse jump back to the symlink/source location when the current location was reached through a symlink jump.
  - Add a visible inverse-jump button when inverse jump state is available.
  - Symlink jump and inverse jump are tracked separately from normal back/forward history.
- Sorting:
  - Default folders first, then files, alphabetically.
  - Sort toggles for name, type, size, and modified date.
  - Sorting is frontend-controlled using metadata from `/api/ls`.
- Root navigation:
  - Show OS roots, home, and detected mounts.
  - When running in WSL, include `/`, `/home/<user>`, and Windows mounts such as `/mnt/c`, `/mnt/d` when present.
- Error handling:
  - Permission-denied folders remain visible but show as inaccessible.
  - Pasted paths, symlink targets, and history entries that no longer exist show a clear error without crashing.
  - Broken or inaccessible symlink targets are shown but cannot be opened.
  - Backend never mutates the filesystem.
  - Large folders can return a capped list with a clear `truncated` flag if needed.

## Interface Defaults

- Backend runs on `localhost`, default port `3001`.
- Frontend runs on Vite dev server, default port `5173`.
- Frontend calls backend through a Vite proxy for `/api`.
- Paths are passed as URL query parameters and normalized server-side.
- No authentication in v1 because the app is localhost-only and read-only.

## Test Plan

- Backend tests:
  - Lists normal directories.
  - Returns lightweight list metadata for files, folders, symlinks, and hidden files.
  - Resolves symlink targets through `/api/symlink-target`.
  - Handles permission errors without crashing.
  - Returns home and root locations for the current OS/runtime.
  - Rejects malformed or missing path parameters.
- Frontend tests:
  - Renders roots, hierarchy bar, address/path controls, file rows, jump buttons, history buttons, and status bar.
  - Keyboard navigation updates selection and path correctly.
  - `Left/Right` parent and visited-child cache behavior works.
  - `Home/End` and jump buttons move selection to top/bottom.
  - Copy-current-path writes the current folder path to the clipboard.
  - Pasting or typing an absolute path opens that path after validation.
  - Back and forward buttons move through navigation history without adding duplicate entries.
  - Clickable symlink target paths, `j`, and the jump-to-target button navigate when valid and show errors when invalid.
  - `Alt+j` and the inverse-jump button return to the symlink/source location only when inverse jump state is available.
  - Sorting by name, type, size, and modified date works.
  - Inaccessible entries display a clear non-crashing state.
- Manual acceptance:
  - Launch backend and frontend locally.
  - Browse from OS roots into nested folders.
  - Move quickly using only keyboard arrows.
  - Confirm jump-to-top and jump-to-bottom buttons match `Home/End`.
  - Copy the current path, paste a valid path, and verify it opens.
  - Navigate back and forward through visited folders.
  - Select a symlink and verify clickable target, `j`, jump-to-target button, `Alt+j`, and inverse-jump button behavior.
  - Confirm no UI exposes write/destructive operations.

## Assumptions

- v1 is a browser-based local app, not Electron.
- Metadata-only means no content previews, thumbnails, or file downloads in v1.
- "Whole machine" means all readable OS roots and mounted drives visible to the Node process, with permission errors handled gracefully.
- The current workspace is greenfield: no existing app files or Git repository are present.
