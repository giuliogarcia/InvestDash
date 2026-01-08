import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { OAuth2Client } from "google-auth-library";

let googleClient: OAuth2Client | null = null;
let isOAuthConfigured = false;

export function initializeGoogleOAuth() {
  // Lê as variáveis AQUI (dentro da função), não no escopo do módulo
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/google/callback";

  console.log("[Google OAuth] Reading credentials...");
  console.log("[Google OAuth] CLIENT_ID exists:", !!GOOGLE_CLIENT_ID);
  console.log("[Google OAuth] CLIENT_SECRET exists:", !!GOOGLE_CLIENT_SECRET);

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn(
      "[Google OAuth] ⚠️ Missing credentials:\n" +
      (GOOGLE_CLIENT_ID ? "" : "  - GOOGLE_CLIENT_ID not set\n") +
      (GOOGLE_CLIENT_SECRET ? "" : "  - GOOGLE_CLIENT_SECRET not set\n") +
      "  → Copy .env.local.example to .env.local and fill in the values\n" +
      "  → Get credentials from: https://console.cloud.google.com/"
    );
    isOAuthConfigured = false;
    return;
  }

  try {
    googleClient = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
    isOAuthConfigured = true;
    console.log("[Google OAuth] ✓ Successfully initialized");
  } catch (error) {
    console.error("[Google OAuth] ✗ Failed to initialize:", error);
    isOAuthConfigured = false;
  }
}

export function getGoogleAuthUrl() {
  if (!googleClient) {
    throw new Error("Google OAuth not initialized");
  }

  const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];

  return googleClient.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
}

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerGoogleOAuthRoutes(app: Express) {
  // Rota para iniciar o fluxo de login com Google
  app.get("/api/google/login", (req: Request, res: Response) => {
    if (!isOAuthConfigured || !googleClient) {
      const errorHtml = `
        <html>
          <body style="font-family: Arial; padding: 40px; background: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h1 style="color: #d32f2f;">❌ Google OAuth Not Configured</h1>
              <p>To enable Google login, you need to:</p>
              <ol>
                <li>Copy <code>.env.local.example</code> to <code>.env.local</code></li>
                <li>Fill in the Google OAuth credentials:
                  <ul>
                    <li><code>GOOGLE_CLIENT_ID</code></li>
                    <li><code>GOOGLE_CLIENT_SECRET</code></li>
                  </ul>
                </li>
                <li>Get credentials from: <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a></li>
                <li>Restart the server: <code>npm run dev</code></li>
              </ol>
              <p style="background: #fff3cd; padding: 10px; border-radius: 4px; margin-top: 20px;">
                <strong>📝 Note:</strong> Login is optional. You can still browse the site without logging in.
              </p>
              <p><a href="/" style="color: #1976d2;">← Go back to home</a></p>
            </div>
          </body>
        </html>
      `;
      res.status(503).set("Content-Type", "text/html").send(errorHtml);
      return;
    }

    const authUrl = googleClient.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
      prompt: "consent",
    });

    res.redirect(authUrl);
  });

  // Rota de callback do Google
  app.get("/api/google/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const error = getQueryParam(req, "error");

    if (error) {
      const errorHtml = `
        <html>
          <body style="font-family: Arial; padding: 40px; background: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
              <h1 style="color: #d32f2f;">❌ Login Failed</h1>
              <p><strong>Error:</strong> ${error}</p>
              <p><a href="/" style="color: #1976d2;">← Go back to home</a></p>
            </div>
          </body>
        </html>
      `;
      res.status(400).set("Content-Type", "text/html").send(errorHtml);
      return;
    }

    if (!code) {
      res.status(400).json({ error: "code is required" });
      return;
    }

    if (!isOAuthConfigured || !googleClient) {
      res.status(503).json({ error: "Google OAuth not configured" });
      return;
    }

    try {
      // Trocar código por tokens
      const { tokens } = await googleClient.getToken(code);
      googleClient.setCredentials(tokens);

      // Obter informações do usuário
      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.email || !payload.sub) {
        res.status(400).json({ error: "Invalid user payload from Google" });
        return;
      }

      const googleId = payload.sub;
      const email = payload.email;
      const name = payload.name || email.split("@")[0];
      const picture = payload.picture;

      console.log(`[Google OAuth] ✓ User logged in: ${email}`);

      // Salvar ou atualizar usuário no banco
      console.log("[Google OAuth] Upserting user with:", {
        openId: `google_${googleId}`,
        name,
        email,
        loginMethod: "google",
      });

      await db.upsertUser({
        openId: `google_${googleId}`,
        name: name || null,
        email: email || null,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      console.log("[Google OAuth] ✓ User upserted successfully");

      // Criar token de sessão
      const sessionToken = await sdk.createSessionToken(`google_${googleId}`, {
        name: name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Salvar cookie de sessão
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      console.log("[Google OAuth] ✓ Session cookie set:", COOKIE_NAME);
      console.log("[Google OAuth] ✓ Redirecting to /dashboard");

      // Redirecionar para dashboard com query param para forçar refetch
      res.redirect(302, `/dashboard?loggedin=${Date.now()}`);
    } catch (error) {
      console.error("[Google OAuth] ✗ Callback failed:", error);
      const errorHtml = `
        <html>
          <body style="font-family: Arial; padding: 40px; background: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
              <h1 style="color: #d32f2f;">❌ Google OAuth Error</h1>
              <p>Failed to complete login. Please try again.</p>
              <p><strong>Error:</strong> ${error instanceof Error ? error.message : "Unknown error"}</p>
              <p><a href="/" style="color: #1976d2;">← Go back to home</a></p>
            </div>
          </body>
        </html>
      `;
      res.status(500).set("Content-Type", "text/html").send(errorHtml);
    }
  });
}
