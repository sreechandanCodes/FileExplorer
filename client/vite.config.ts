import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

interface FileExplorerConfig {
  server?: {
    port?: number
  }
}

const configPath = fileURLToPath(new URL('../filexplorer.config.json', import.meta.url))
const fileExplorerConfig = JSON.parse(readFileSync(configPath, 'utf8')) as FileExplorerConfig

function getServerPort() {
  const port = fileExplorerConfig.server?.port
  if (typeof port === 'number' && Number.isInteger(port) && port > 0 && port <= 65535) {
    return port
  }

  throw new Error('filexplorer.config.json server.port must be an integer from 1 to 65535')
}

const serverPort = getServerPort()

// https://vite.dev/config/
export default defineConfig({
  define: {
    __FILE_EXPLORER_API_URL__: JSON.stringify(`http://localhost:${serverPort}/api`),
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
