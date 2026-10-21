import { runAutoMigration } from '../src/db/auto-migrate';
import { client } from '../src/db/index';

async function main() {
  console.log('🚀 Running explicit database schema verification & migration...');
  try {
    await runAutoMigration();
    console.log('✅ Database migration completed successfully.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
    process.exit(0);
  }
}

main();
