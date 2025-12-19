import { defineConfig } from "drizzle-kit";

// Do not throw during module import — this can crash serverless function initialization
// if Vercel hasn't had environment variables set yet. Instead, produce a config
// that uses the runtime DATABASE_URL (possibly empty). Commands that require a
// database (drizzle-kit up:pg) should ensure DATABASE_URL is set in the environment
// before invoking.

const databaseUrl = process.env.DATABASE_URL || "";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
