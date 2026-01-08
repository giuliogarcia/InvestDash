import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Sempre usar dist/public em produção
  const distPath = path.resolve(import.meta.dirname, "../..", "dist", "public");
  
  console.log(`[Static Files] Serving from: ${distPath}`);
  
  if (!fs.existsSync(distPath)) {
    console.error(
      `[ERROR] Could not find the build directory: ${distPath}`
    );
    console.error(`[ERROR] Make sure to run 'pnpm build' first`);
    console.error(`[ERROR] Current directory: ${process.cwd()}`);
    console.error(`[ERROR] Directory contents:`);
    try {
      const parentDir = path.resolve(import.meta.dirname, "../..");
      const contents = fs.readdirSync(parentDir);
      console.error(contents.map(f => `  - ${f}`).join("\n"));
    } catch (e) {
      console.error(`[ERROR] Could not read directory`);
    }
  }

  // Servir arquivos estáticos com cache
  app.use(express.static(distPath, {
    maxAge: "1d",
    etag: false,
  }));

  // Servir arquivos com extensão específica com cache mais agressivo
  app.use(express.static(distPath, {
    setHeaders: (res, path) => {
      if (path.endsWith(".js") || path.endsWith(".css")) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }));

  // SPA fallback: qualquer rota desconhecida volta para index.html
  app.use("*", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    
    if (!fs.existsSync(indexPath)) {
      console.error(`[ERROR] index.html not found at ${indexPath}`);
      return res.status(404).send("index.html not found");
    }
    
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.sendFile(indexPath);
  });
}
