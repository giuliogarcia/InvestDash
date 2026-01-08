import type { Config } from "drizzle-kit";

export default {
  dialect: "sqlite",
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: "file:./dev.db",
  },
} satisfies Config;
