import express from "express";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { createServer as createViteServer } from "vite";
import app from "./src/apiApp.js";

async function startServer() {
  const PORT = 3000;

  // -------------------------------------------------------------------
  // 0. DIAGNOSTICS: GIT HISTORY & STATUS
  // -------------------------------------------------------------------
  try {
    const gitLog = execSync("git log -n 10 --oneline").toString();
    const gitStatus = execSync("git status").toString();
    const gitReflog = execSync("git reflog -n 30").toString();
    fs.writeFileSync(path.join(process.cwd(), "git_diag.txt"), `=== LOG ===\n${gitLog}\n=== STATUS ===\n${gitStatus}\n=== REFLOG ===\n${gitReflog}`);
  } catch (e: any) {
    fs.writeFileSync(path.join(process.cwd(), "git_diag.txt"), `Error: ${e.message}\nStack: ${e.stack}`);
  }

  // -------------------------------------------------------------------
  // VITE MIDDLEWARE AND SPA ROUTING
  // -------------------------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting development Vite server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static items for production...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Server boot crash:", err);
});
