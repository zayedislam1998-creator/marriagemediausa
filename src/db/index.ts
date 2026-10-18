import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/marriagemediausa';

// Disable prefetch for environments like serverless/turbopack
export const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 5,
});

export const db = drizzle(client, { schema });

export * from './schema';
