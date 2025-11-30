import { config } from 'dotenv';
import { join } from 'path';
import { existsSync } from 'fs';
import { sql } from 'drizzle-orm';

// IMPORTANT: Load .env BEFORE importing client to ensure DATABASE_URL is available
// Load .env file - check multiple locations (must load BEFORE importing client)
// 1. packages/db/.env (package-specific)
// 2. packages/.env (monorepo packages level)
// 3. Root .env (monorepo root)
// 4. Current working directory (fallback)
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
    console.log(`Loaded .env from: ${envPath}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  // Fallback to default behavior (current working directory)
  config();
  console.warn(`Warning: .env file not found in common locations. Make sure DATABASE_URL is set in environment.`);
}

async function testConnection() {
  try {
    // Dynamic import AFTER .env is loaded to ensure DATABASE_URL is available
    const { db } = await import('./client');
    
    console.log('Testing database connection...');
    
    // Test connection with a simple query
    const result = await db.execute(sql`SELECT version() as version, current_database() as database, current_user as user`);
    
    console.log('✅ Database connection successful!');
    console.log('\nDatabase Info:');
    const row = result[0] as { version?: string; database?: string; user?: string } | undefined;
    console.log(`  PostgreSQL Version: ${row?.version || 'N/A'}`);
    console.log(`  Database: ${row?.database || 'N/A'}`);
    console.log(`  User: ${row?.user || 'N/A'}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testConnection();

