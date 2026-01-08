import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Carrega .env.local PRIMEIRO (prioridade para desenvolvimento local)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envLocalPath = path.resolve(__dirname, "../../.env.local");
const envPath = path.resolve(__dirname, "../../.env");

console.log("[ENV] Loading from:", envLocalPath);
console.log("[ENV] Fallback from:", envPath);

dotenv.config({ path: envLocalPath });
dotenv.config({ path: envPath });

console.log("[ENV] GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✓ Loaded" : "✗ NOT LOADED");
console.log("[ENV] GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "✓ Loaded" : "✗ NOT LOADED");
console.log("[ENV] NODE_ENV:", process.env.NODE_ENV);

// AGORA SIM importa os módulos (depois das variáveis estarem carregadas)
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerGoogleOAuthRoutes, initializeGoogleOAuth } from "./google-oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Initialize Google OAuth
  initializeGoogleOAuth();
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Google OAuth routes
  registerGoogleOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
