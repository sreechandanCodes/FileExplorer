import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const configPath = fileURLToPath(new URL("../../filexplorer.config.json", import.meta.url));
const config = JSON.parse(readFileSync(configPath, "utf8"));

const getServerPort = () => {
  const port = config?.server?.port;
  if (Number.isInteger(port) && port > 0 && port <= 65535) {
    return port;
  }

  throw new Error("filexplorer.config.json server.port must be an integer from 1 to 65535");
};

export const serverPort = getServerPort();
