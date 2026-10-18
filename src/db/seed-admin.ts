import bcrypt from 'bcryptjs';
import { db } from './index';
import { users } from './schema';

async function seedAdmin() {
  console.log('👑 Seeding Super Admin user...');
  try {
    const adminPasswordHash = await bcrypt.hash('Admin@MarriageMedia2026', 10);
    const [adminUser] = await db
      .insert(users)
      .values({
        email: 'admin@marriagemediausa.com',
        phoneNumber: '+1-202-555-0100',
        passwordHash: adminPasswordHash,
        role: 'SUPER_ADMIN',
        isActive: true,
        isVerified: true,
      })
      .onConflictDoNothing()
      .returning();

    console.log(`✅ Super Admin: admin@marriagemediausa.com (Password: Admin@MarriageMedia2026)`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed admin:', error);
    process.exit(1);
  }
}

seedAdmin();
