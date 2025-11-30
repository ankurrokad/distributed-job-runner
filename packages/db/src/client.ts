import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { PoolClient } from 'pg';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { config } from 'dotenv';
import { join } from 'path';
import { existsSync } from 'fs';

if (process.env.NODE_ENV !== 'production') {
  const packageDir = join(__dirname, '..');
  const possiblePaths = [
    join(packageDir, '.env'), // packages/db/.env
    join(packageDir, '..', '.env'), // packages/.env
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
  throw new Error('DATABASE_URL is not set in environment');
}

export const pool = new Pool({
  connectionString,
  // tune as needed
  max: Number(process.env.DB_MAX_CLIENTS ?? 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool);

// `withTransaction` wrapper: accepts a callback that receives a transactional db instance.
// Transaction wrapper
export async function withTransaction<T>(cb: (tx: NodePgDatabase) => Promise<T>): Promise<T> {
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');
    const txDb: NodePgDatabase = drizzle(client);
    const result = await cb(txDb);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export type { NodePgDatabase };
