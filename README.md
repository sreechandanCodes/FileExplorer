# File Explorer

A local, read-only file explorer with a Vite React frontend and a Node/Express backend.

The backend reads the filesystem on the machine where it is running. The frontend talks to that backend and displays folders, files, symlinks, metadata, and keyboard-friendly navigation.

## Requirements

- Node.js 20 or newer
- npm
- Two terminal windows or tabs

## Install

Install dependencies once in both projects:

```sh
cd server
npm install

cd ../client
npm install
cd ..
```

## Run A Dev Demo

Start the backend in one terminal:

```sh
cd server
npm run dev
```

Start the frontend in another terminal:

```sh
cd client
npm run dev
```

Open the frontend URL from [filexplorer.config.json](filexplorer.config.json):

```text
http://localhost:5173
```

## Run A Production-Style Demo

Build the frontend:

```sh
cd client
npm run build
```

Start the backend in one terminal:

```sh
cd server
npm start
```

Preview the built frontend in another terminal:

```sh
cd client
npm run preview
```

Open the frontend URL from [filexplorer.config.json](filexplorer.config.json):

```text
http://localhost:5173
```

## Configuration

The frontend and backend ports are set in [filexplorer.config.json](filexplorer.config.json):

```json
{
  "client": {
    "port": 5173
  },
  "server": {
    "port": 3001
  }
}
```

The backend reads this file at startup. The frontend reads it when Vite starts or builds, then uses `server.port` for API requests and `client.port` for the Vite dev server and preview server.

Most users can leave this alone. If you change the port, restart both the backend and frontend dev servers.

## Platform Notes

### Windows

Run both `server` and `client` from Windows PowerShell or Windows Terminal for the simplest native Windows demo. The app will browse the Windows filesystem and show Windows-style paths such as `C:\Users\...`.

### macOS and Linux

Run both projects from your normal terminal. The app will browse the local Unix-style filesystem.

### WSL

Run both projects inside WSL if you want to browse the WSL filesystem. Windows drives are usually available under paths like `/mnt/c`.

If you want to demo native Windows paths like `C:\Users\...`, run the backend on Windows instead of WSL.

## How To Use

- Click an entry to select it.
- Double-click a folder or openable symlink to enter it.
- Use `Up` and `Down` to move selection.
- Use `Left` to go to the parent folder.
- Use `Right` to open the selected entry, or return to the remembered child folder.
- Use `Alt+Left` and `Alt+Right` for history back/forward.
- Use `j` on a symlink to jump to its resolved target.
- Use the info button in the bottom bar to view keyboard help.

The details sidebar shows stable metadata first, then conditional details such as symlink targets, file size, and file extension. Folder sizes are not shown because the app does not recursively calculate directory size.

## Troubleshooting

If the frontend cannot load folders, check that:

- the backend is running on the port from `filexplorer.config.json`
- the frontend is running on the port from `filexplorer.config.json`
- the backend terminal does not show an error
- the configured port is not already in use by another app

By default, open `http://localhost:5173` and make sure the backend is running at `http://localhost:3001`.

## Development Checks

Frontend:

```sh
cd client
npm test
npm run lint
npm run build
```

Backend syntax check:

```sh
cd server
node --check src/index.js
node --check src/files.js
```
