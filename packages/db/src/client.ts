import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { join } from 'path';
import { existsSync } from 'fs';
import * as schema from './schema';

// Only load .env in development - production should use environment variables
// This prevents accidentally loading .env files in production
if (process.env.NODE_ENV !== 'production') {
  const packageDir = join(__dirname, '..');
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
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL environment variable is not set. ' +
    'Please set it in your environment or .env file (development only).'
  );
}

// Validate connection string format (basic check)
if (!connectionString.startsWith('postgres://') && !connectionString.startsWith('postgresql://')) {
  throw new Error(
    'DATABASE_URL must be a valid PostgreSQL connection string starting with postgres:// or postgresql://'
  );
}

// Connection pool configuration for production safety
// - max: Maximum number of connections (default: 10)
// - idle_timeout: Close idle connections after this many seconds (default: 30)
// - connect_timeout: Connection timeout in seconds (default: 30)
// - prepare: false is required for transaction pool mode
const client = postgres(connectionString, {
  prepare: false,
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
  idle_timeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30', 10),
  connect_timeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '30', 10),
  // Enable SSL in production if not explicitly disabled
  ssl: process.env.DB_SSL === 'false' ? false : process.env.NODE_ENV === 'production' ? 'require' : undefined,
});

const globalForDrizzle = globalThis as unknown as {
  db: ReturnType<typeof drizzle> | undefined;
};

export const db =
  globalForDrizzle.db ??
  drizzle(client, {
    schema,
    logger: process.env.NODE_ENV === 'development',
  });

if (process.env.NODE_ENV !== 'production') globalForDrizzle.db = db;

/**
 * Gracefully close the database connection.
 * Call this when shutting down the application to ensure connections are properly closed.
 * Safe to call multiple times - will only close once.
 */
export async function closeDb(): Promise<void> {
  if (globalForDrizzle.db) {
    try {
      await client.end();
    } catch (error) {
      // Ignore errors if connection is already closed
      if (error instanceof Error && !error.message.includes('Connection ended')) {
        throw error;
      }
    } finally {
      globalForDrizzle.db = undefined;
    }
  }
}

// Export the postgres client for advanced usage if needed
export { client };
