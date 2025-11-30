import type { Config } from "drizzle-kit";
import { config } from "dotenv";
import { join } from "path";
import { existsSync } from "fs";

// Load .env from multiple possible locations
const packageDir = __dirname;
const possiblePaths = [
  join(packageDir, ".env"),
  join(packageDir, "..", ".env"),
  join(packageDir, "..", "..", ".env"),
];

for (const p of possiblePaths) {
  if (existsSync(p)) {
    config({ path: p });
    break;
  }
}

// Drizzle config
export default {
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  driver: "pg", // ✔ Correct
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || "", // ✔ Correct key
  },
} satisfies Config;
