import { client } from './index';

async function runMigration() {
  console.log('[Migration] Ensuring new columns and tables in PostgreSQL 18...');

  try {
    // 1. Add columns to profiles
    await client`
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;
    `;
    await client`
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cv_url TEXT;
    `;
    console.log('[Migration] ✓ profiles columns (cover_photo_url, cv_url) verified.');

    // 2. Create member_resumes table
    await client`
      CREATE TABLE IF NOT EXISTS member_resumes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        resume_type VARCHAR(30) NOT NULL,
        file_name VARCHAR(255),
        file_url TEXT,
        file_size_bytes INT,
        document_content TEXT,
        title VARCHAR(255) DEFAULT 'Matrimonial Biodata & CV' NOT NULL,
        is_primary BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `;
    console.log('[Migration] ✓ member_resumes table verified.');

    // 3. Create profile_requirements_config table
    await client`
      CREATE TABLE IF NOT EXISTS profile_requirements_config (
        id VARCHAR(64) PRIMARY KEY,
        field_key VARCHAR(64) NOT NULL UNIQUE,
        field_label VARCHAR(128) NOT NULL,
        category VARCHAR(32) NOT NULL,
        is_required_for_registration BOOLEAN DEFAULT FALSE NOT NULL,
        is_required_for_profile BOOLEAN DEFAULT TRUE NOT NULL,
        completion_weight_percent INT DEFAULT 5 NOT NULL,
        gender_applicable VARCHAR(16) DEFAULT 'ALL' NOT NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `;
    console.log('[Migration] ✓ profile_requirements_config table verified.');

    // 4. Seed default requirement rules if empty
    const count = await client`SELECT count(*) FROM profile_requirements_config`;
    if (parseInt(count[0].count) === 0) {
      console.log('[Migration] Seeding default profile and registration requirements...');
      const defaultRules = [
        { id: 'full_name', field_key: 'full_name', field_label: 'Full Legal Name', category: 'PERSONAL', is_reg: true, is_prof: true, weight: 10, gender: 'ALL' },
        { id: 'gender', field_key: 'gender', field_label: 'Gender (Brother / Sister)', category: 'PERSONAL', is_reg: true, is_prof: true, weight: 5, gender: 'ALL' },
        { id: 'date_of_birth', field_key: 'date_of_birth', field_label: 'Date of Birth & Age', category: 'PERSONAL', is_reg: true, is_prof: true, weight: 5, gender: 'ALL' },
        { id: 'marital_status', field_key: 'marital_status', field_label: 'Marital Status', category: 'PERSONAL', is_reg: true, is_prof: true, weight: 5, gender: 'ALL' },
        { id: 'religion_sect', field_key: 'religion_sect', field_label: 'Islamic Practice & Sect', category: 'RELIGIOUS', is_reg: false, is_prof: true, weight: 10, gender: 'ALL' },
        { id: 'pray_frequency', field_key: 'pray_frequency', field_label: 'Daily Salah & Fasting', category: 'RELIGIOUS', is_reg: false, is_prof: true, weight: 10, gender: 'ALL' },
        { id: 'education_level', field_key: 'education_level', field_label: 'Highest Education Degree', category: 'EDUCATION', is_reg: false, is_prof: true, weight: 10, gender: 'ALL' },
        { id: 'profession', field_key: 'profession', field_label: 'Profession & Career Track', category: 'EDUCATION', is_reg: false, is_prof: true, weight: 10, gender: 'ALL' },
        { id: 'country_city', field_key: 'country_city', field_label: 'Residence Country, State & City', category: 'PERSONAL', is_reg: true, is_prof: true, weight: 10, gender: 'ALL' },
        { id: 'guardian_wali', field_key: 'guardian_wali', field_label: 'Wali / Guardian Contact (Mandatory for Sisters)', category: 'WALI', is_reg: false, is_prof: true, weight: 15, gender: 'FEMALE' },
        { id: 'about_me', field_key: 'about_me', field_label: 'About Me & Matrimonial Values', category: 'PERSONAL', is_reg: false, is_prof: true, weight: 5, gender: 'ALL' },
        { id: 'cv_resume', field_key: 'cv_resume', field_label: 'Verified Matrimonial CV / Resume', category: 'CV', is_reg: false, is_prof: true, weight: 15, gender: 'ALL' },
      ];

      for (const rule of defaultRules) {
        await client`
          INSERT INTO profile_requirements_config (
            id, field_key, field_label, category,
            is_required_for_registration, is_required_for_profile,
            completion_weight_percent, gender_applicable, is_active
          ) VALUES (
            ${rule.id}, ${rule.field_key}, ${rule.field_label}, ${rule.category},
            ${rule.is_reg}, ${rule.is_prof},
            ${rule.weight}, ${rule.gender}, true
          )
          ON CONFLICT (id) DO NOTHING;
        `;
      }
      console.log('[Migration] ✓ Default profile requirement rules seeded.');
    }

    console.log('[Migration] All migrations completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Migration Error]:', err);
    process.exit(1);
  }
}

runMigration();
