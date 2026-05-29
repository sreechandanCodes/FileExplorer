# File Explorer Project Journal

This journal tracks setup steps, decisions, learning notes, and progress while building the local File Explorer app.

## Project Goal

Build a read-only local file explorer with:

- React frontend built with Vite.
- Node.js backend built with Express.
- Localhost-only usage.
- Whole-machine browsing through OS roots and mounted drives.
- Keyboard-first navigation.
- Matching UI controls for important keyboard actions.
- Lightweight directory listings and detailed metadata on selection.

## Environment Setup

### 1. Install Node.js and npm

Use `nvm` so Node versions can be installed and switched without system package conflicts.

Run:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

Then either close and reopen the terminal, or run:

```bash
source ~/.bashrc
```

Install the latest Node.js LTS release:

```bash
nvm install --lts
nvm use --lts
```

Verify installation:

```bash
node -v
npm -v
```

Expected result:

- `node -v` prints a Node.js version.
- `npm -v` prints an npm version.

### 2. Planned Project Structure

The project will eventually use this structure:

```text
FileExplorer/
  PROJECT_PLAN.md
  PROJECT_JOURNAL.md
  client/
  server/
```

- `client/`: Vite React app.
- `server/`: Express backend.
- Root markdown files: planning and journal notes.

## Learning Path

### React and Vite

Focus only on the React concepts needed for this app:

- Components.
- Props.
- State with `useState`.
- Side effects and API calls with `useEffect`.
- Event handlers.
- Keyboard events.
- Rendering lists.
- Conditional rendering.

Vite is mainly the development tool that starts the React app quickly.

### Node and Express

Focus only on the backend concepts needed for this app:

- Starting a local server.
- Creating REST endpoints.
- Reading query parameters.
- Using Node's filesystem APIs.
- Returning JSON.
- Handling errors without crashing.

## Build Milestones

### Milestone 1: Tooling

- Install Node.js and npm.
- Verify `node -v` and `npm -v`.
- Create the Vite React frontend.
- Create the Express backend.
- Confirm both development servers can run locally.

### Milestone 2: Backend Basics

- Add `GET /api/roots`.
- Add `GET /api/list?path=...`.
- Add `GET /api/stat?path=...`.
- Make all endpoints read-only.
- Handle missing, invalid, inaccessible, and permission-denied paths.

### Milestone 3: Frontend Basics

- Render available roots.
- Render current folder entries.
- Show a top hierarchy/path bar.
- Show a bottom status bar.
- Show selected item metadata.

### Milestone 4: Navigation

- Add keyboard navigation:
  - `Up/Down`: move among siblings.
  - `Left`: go to parent.
  - `Right`: open cached visited child or selected folder.
  - `Enter`: open selected folder.
  - `Home`: jump to top.
  - `End`: jump to bottom.
- Add jump-to-top and jump-to-bottom buttons.
- Add back and forward navigation history buttons.
- Add symlink jump navigation:
  - `j`: jump to selected symlink target.
  - `Alt+j`: inverse jump back to the source path when available.
  - UI buttons for jump-to-target and inverse jump.

### Milestone 5: Path Controls

- Add copy-current-path button.
- Add paste/type path bar.
- Validate pasted paths through the backend.
- Open valid paths.
- Show clear errors for invalid or inaccessible paths.

### Milestone 6: Sorting and Polish

- Add sorting by:
  - name
  - type
  - size
  - modified date
- Keep folders first by default.
- Improve empty-folder, loading, and error states.
- Confirm no write/destructive actions are exposed.

## Notes and Decisions

- v1 is read-only.
- v1 does not include search.
- v1 does not include file previews or thumbnails.
- v1 does not include upload, delete, rename, create, move, or copy operations.
- `/api/list` should return lightweight metadata only.
- `/api/stat` should return detailed metadata for the selected item.
- Symlink target paths should be clickable when valid.
- Keyboard-first does not mean keyboard-only; important actions should also have clear UI controls.
- Symlink jump state should be tracked separately from normal back/forward history.

## Progress Log

### 2026-05-28

- Created initial project plan.
- Decided on Vite React frontend and Express backend.
- Decided v1 should be read-only and localhost-only.
- Decided to use OS roots and mounted drives for whole-machine browsing.
- Added keyboard-first navigation requirements.
- Added path copy/open controls.
- Added back/forward navigation history.
- Clarified that keyboard-first navigation still needs matching UI controls.
- Added symlink jump behavior with `j`, inverse jump with `Alt+j`, and matching UI buttons.
- Created this project journal.
