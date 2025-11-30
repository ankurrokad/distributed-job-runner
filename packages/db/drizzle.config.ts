import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';
import { join } from 'path';
import { existsSync } from 'fs';

// Load .env file for drizzle-kit commands - check multiple locations
// 1. packages/db/.env (package-specific)
// 2. packages/.env (monorepo packages level)
// 3. Root .env (monorepo root)
// 4. Current working directory (fallback)
const packageDir = join(__dirname, '.');
const possiblePaths = [
  join(packageDir, '.env'),           // packages/db/.env
  join(packageDir, '..', '.env'),     // packages/.env
  join(packageDir, '..', '..', '.env'), // root/.env
];

let envLoaded = false;
for (const envPath of possiblePaths) {
  if (existsSync(envPath)) {
    config({ path: envPath });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  // Fallback to default behavior (current working directory)
  config();
}

export default {
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
} satisfies Config;

