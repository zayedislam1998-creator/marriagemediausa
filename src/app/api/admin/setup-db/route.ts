import { NextResponse } from 'next/server';
import { runAutoMigration } from '@/db/auto-migrate';
import { client } from '@/db';

export async function GET(req: Request) {
  try {
    await runAutoMigration();

    // Fetch quick summary of tables
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    return NextResponse.json({
      success: true,
      message: 'PostgreSQL database schema verified, tables created, and default records seeded successfully.',
      tableCount: tables.length,
      tables: tables.map((t: any) => t.table_name),
    });
  } catch (error: any) {
    console.error('Setup DB error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Database setup failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
