import { client } from './index';

async function runFormBuilderMigration() {
  console.log('[Migration] Creating form_builder_configs in PostgreSQL 18...');

  try {
    await client`
      CREATE TABLE IF NOT EXISTS form_builder_configs (
        form_id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(128) NOT NULL,
        theme VARCHAR(64) DEFAULT 'emerald' NOT NULL,
        border_radius VARCHAR(32) DEFAULT '12px' NOT NULL,
        button_text VARCHAR(128) NOT NULL,
        fields_json JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `;
    console.log('[Migration] ✓ form_builder_configs table verified.');

    const count = await client`SELECT count(*) FROM form_builder_configs`;
    if (parseInt(count[0].count) === 0) {
      console.log('[Migration] Seeding initial form configurations for Login, Register, Profile, and CV...');

      const initialForms = [
        {
          form_id: 'login',
          title: 'Member & Admin Login Portal',
          theme: 'emerald',
          border_radius: '12px',
          button_text: 'Sign In to Marriage Media USA',
          fields_json: JSON.stringify([
            { id: 'f_email', fieldKey: 'email', label: 'Email Address', placeholder: 'your.email@example.com', type: 'email', required: true, width: 'full', order: 1 },
            { id: 'f_password', fieldKey: 'password', label: 'Security Password', placeholder: '••••••••••••', type: 'password', required: true, width: 'full', order: 2 },
            { id: 'f_remember', fieldKey: 'remember_me', label: 'Remember this device (7 Days)', placeholder: '', type: 'checkbox', required: false, width: 'half', order: 3 },
          ]),
        },
        {
          form_id: 'register',
          title: 'Authentic 100% Halal Registration',
          theme: 'emerald',
          border_radius: '12px',
          button_text: 'Create Verified Halal Account',
          fields_json: JSON.stringify([
            { id: 'f_reg_name', fieldKey: 'full_name', label: 'Full Legal Name', placeholder: 'e.g. Shahidul Islam', type: 'text', required: true, width: 'half', order: 1 },
            { id: 'f_reg_email', fieldKey: 'email', label: 'Email Address', placeholder: 'you@example.com', type: 'email', required: true, width: 'half', order: 2 },
            { id: 'f_reg_phone', fieldKey: 'phone_number', label: 'Phone Number (SMS Verified)', placeholder: '+1 (555) 000-0000', type: 'tel', required: true, width: 'half', order: 3 },
            { id: 'f_reg_pass', fieldKey: 'password', label: 'Account Password', placeholder: 'Minimum 8 characters', type: 'password', required: true, width: 'half', order: 4 },
            { id: 'f_reg_gender', fieldKey: 'gender', label: 'I am a...', placeholder: 'Select Gender', type: 'select', required: true, width: 'half', order: 5, options: ['Brother (Groom)', 'Sister (Bride)'] },
            { id: 'f_reg_dob', fieldKey: 'date_of_birth', label: 'Date of Birth (18+ Only)', placeholder: 'YYYY-MM-DD', type: 'date', required: true, width: 'half', order: 6 },
            { id: 'f_reg_country', fieldKey: 'country', label: 'Country of Residence', placeholder: 'Select Country', type: 'select', required: true, width: 'full', order: 7, options: ['United States (USA)', 'Canada', 'United Kingdom', 'Bangladesh'] },
          ]),
        },
        {
          form_id: 'profile',
          title: 'Comprehensive 85+ Biodata Profile',
          theme: 'gold',
          border_radius: '14px',
          button_text: 'Save & Publish Biodata',
          fields_json: JSON.stringify([
            { id: 'f_prof_name', fieldKey: 'full_name', label: 'Full Legal Name', placeholder: 'Full Name', type: 'text', required: true, width: 'half', order: 1 },
            { id: 'f_prof_marital', fieldKey: 'marital_status', label: 'Marital Status', placeholder: 'Select status', type: 'select', required: true, width: 'half', order: 2, options: ['Never Married', 'Divorced', 'Widowed'] },
            { id: 'f_prof_edu', fieldKey: 'education_level', label: 'Highest Education Degree', placeholder: 'Degree', type: 'text', required: true, width: 'half', order: 3 },
            { id: 'f_prof_prof', fieldKey: 'profession', label: 'Profession & Career Track', placeholder: 'e.g. Software Engineer', type: 'text', required: true, width: 'half', order: 4 },
            { id: 'f_prof_salah', fieldKey: 'pray_frequency', label: 'Daily Salah (Prayers)', placeholder: 'Prayer frequency', type: 'select', required: true, width: 'half', order: 5, options: ['Always (5 times daily)', 'Sometimes', 'Jumuah only'] },
            { id: 'f_prof_diet', fieldKey: 'halal_diet', label: 'Dietary Observance', placeholder: 'Diet', type: 'select', required: true, width: 'half', order: 6, options: ['Strictly 100% Halal', 'Halal Preferred'] },
            { id: 'f_prof_wali_name', fieldKey: 'guardian_name', label: 'Wali / Guardian Name', placeholder: 'Father or Guardian', type: 'text', required: true, width: 'half', order: 7 },
            { id: 'f_prof_wali_phone', fieldKey: 'guardian_phone', label: 'Guardian Phone Number', placeholder: '+1 (555) 000-0000', type: 'tel', required: true, width: 'half', order: 8 },
            { id: 'f_prof_purdah', fieldKey: 'photo_privacy', label: 'Purdah Modesty Photo Shield', placeholder: 'Select privacy', type: 'select', required: true, width: 'full', order: 9, options: ['Public to Verified Members', 'Purdah Blur Shield (Recommended)', 'Hidden Avatar'] },
            { id: 'f_prof_about', fieldKey: 'about_me', label: 'About Me & Islamic Values', placeholder: 'Describe yourself and family background...', type: 'textarea', required: true, width: 'full', order: 10 },
          ]),
        },
        {
          form_id: 'cv',
          title: 'Matrimonial CV & Resume Document',
          theme: 'minimal',
          border_radius: '8px',
          button_text: 'Save Matrimonial CV',
          fields_json: JSON.stringify([
            { id: 'f_cv_bismillah', fieldKey: 'bismillah_header', label: 'Bismillah Calligraphy Header', placeholder: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ', type: 'static_header', required: false, width: 'full', order: 1 },
            { id: 'f_cv_personal', fieldKey: 'personal_section', label: '1. Personal & Contact Information', placeholder: 'Name, Age, Height, Location', type: 'rich_block', required: true, width: 'full', order: 2 },
            { id: 'f_cv_deen', fieldKey: 'deen_section', label: '2. Islamic Commitment & Practice', placeholder: 'Salah, Quran, Hijab/Beard, Deen Studies', type: 'rich_block', required: true, width: 'full', order: 3 },
            { id: 'f_cv_career', fieldKey: 'career_section', label: '3. Education & Professional Career', placeholder: 'University, Degree, Job Title, Employer', type: 'rich_block', required: true, width: 'full', order: 4 },
            { id: 'f_cv_family', fieldKey: 'family_section', label: '4. Family Background & Lineage', placeholder: 'Father, Mother, Siblings, Lineage', type: 'rich_block', required: true, width: 'full', order: 5 },
            { id: 'f_cv_partner', fieldKey: 'partner_section', label: '5. Desired Spouse Characteristics', placeholder: 'Qualities sought in future spouse', type: 'rich_block', required: true, width: 'full', order: 6 },
            { id: 'f_cv_wali', fieldKey: 'wali_section', label: '6. Guardian / Wali Verification Contact', placeholder: 'Wali Contact for family introduction', type: 'rich_block', required: true, width: 'full', order: 7 },
          ]),
        },
      ];

      for (const f of initialForms) {
        await client`
          INSERT INTO form_builder_configs (
            form_id, title, theme, border_radius, button_text, fields_json
          ) VALUES (
            ${f.form_id}, ${f.title}, ${f.theme}, ${f.border_radius}, ${f.button_text}, ${f.fields_json}
          )
          ON CONFLICT (form_id) DO NOTHING;
        `;
      }
      console.log('[Migration] ✓ Initial form builder configurations seeded.');
    }

    console.log('[Migration] Done!');
    process.exit(0);
  } catch (err) {
    console.error('[Migration Error]:', err);
    process.exit(1);
  }
}

runFormBuilderMigration();
