import express from "express";
import cors from "cors";
import { serverPort } from "./config.js";
import * as fs from "./files.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.json({
    ok: true,
    service: "file-explorer-server",
  });
});

app.get("/api/list", async (req, res) => {
  const dirPath = req.query.path;
  if (typeof dirPath !== "string" || dirPath === "") {
    return res.status(400).json({ error: "Path query parameter is required" });
  }
  
  const listing = await fs.getDirectoryListing(dirPath);
  if (listing.isError) {
    return res.status(500).json({ error: listing.message });
  }
  
  res.json(listing);
});

app.get("/api/home", (req, res) => {
  const homeDir = fs.getHomeDirectory();
  res.json({ homeDirectory: homeDir });
});

app.get("/api/root", (req, res) => {
  const rootDir = fs.getRootDirectory();
  res.json({ rootDirectory: rootDir });
});

app.listen(serverPort, () => {
  console.log(`Server listening on http://localhost:${serverPort}`);
});
