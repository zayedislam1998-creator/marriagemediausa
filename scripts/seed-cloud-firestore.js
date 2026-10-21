const fs = require('fs');
const path = require('path');

async function seedFirestore() {
  const p = path.join(process.env.USERPROFILE, '.config', 'configstore', 'firebase-tools.json');
  if (!fs.existsSync(p)) {
    console.error('Firebase tools credentials not found at:', p);
    process.exit(1);
  }

  const creds = JSON.parse(fs.readFileSync(p, 'utf8'));
  let token = creds.tokens.access_token;
  const projectId = 'muslimbibahmodern';
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

  console.log(`[Firestore Seeder] Connected to project: ${projectId} as ${creds.user?.email}`);

  // Helper to convert plain JS object to Firestore REST fields format
  function toFirestoreFields(obj) {
    const fields = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        fields[key] = { nullValue: null };
      } else if (typeof value === 'string') {
        fields[key] = { stringValue: value };
      } else if (typeof value === 'boolean') {
        fields[key] = { booleanValue: value };
      } else if (typeof value === 'number') {
        if (Number.isInteger(value)) {
          fields[key] = { integerValue: value.toString() };
        } else {
          fields[key] = { doubleValue: value };
        }
      } else if (Array.isArray(value)) {
        fields[key] = {
          arrayValue: {
            values: value.map(v => {
              if (typeof v === 'string') return { stringValue: v };
              if (typeof v === 'number') return { integerValue: v.toString() };
              if (typeof v === 'boolean') return { booleanValue: v };
              return { stringValue: String(v) };
            })
          }
        };
      } else if (typeof value === 'object') {
        fields[key] = { mapValue: { fields: toFirestoreFields(value) } };
      }
    }
    return fields;
  }

  async function writeDoc(collection, docId, data) {
    const url = `${baseUrl}/${collection}/${docId}`;
    const body = JSON.stringify({ fields: toFirestoreFields(data) });
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to write ${collection}/${docId} (${res.status}): ${err}`);
    }
    console.log(`  ✓ Written: ${collection}/${docId}`);
  }

  // 1. Seed Packages
  console.log('\n[1/3] Seeding Authentic Matrimonial Packages to Firestore...');
  const packages = [
    {
      id: 'pkg_free',
      name: 'Free Member Plan',
      priceUsd: 0,
      durationMonths: 1,
      contactCredits: 0,
      dailyProfileViewLimit: 15,
      badgeTitle: 'Free Member',
      features: [
        'Create Halal Marriage Profile',
        '15 Daily Profile Views',
        'Purdah Modesty Photo Shield',
        'Browse 15,420+ Verified Profiles',
      ],
      isActive: true,
    },
    {
      id: 'pkg_bronze',
      name: 'Bronze Match Plan',
      priceUsd: 2000,
      durationMonths: 3,
      contactCredits: 15,
      dailyProfileViewLimit: 30,
      badgeTitle: 'Bronze Member',
      features: [
        '15 Verified Contact Unlocks',
        'Direct Guardian / Wali Notifications',
        'Express Interest Salaam Messages',
        'Standard Search Boost',
      ],
      isActive: true,
    },
    {
      id: 'pkg_silver',
      name: 'Silver Match Plan',
      priceUsd: 3000,
      durationMonths: 3,
      contactCredits: 25,
      dailyProfileViewLimit: 60,
      badgeTitle: 'Silver Member',
      features: [
        '25 Verified Contact Unlocks',
        'Direct Guardian / Wali Verification',
        'Purdah Photo Access Requests',
        'Priority Customer Support',
      ],
      isActive: true,
    },
    {
      id: 'pkg_gold',
      name: 'Gold Premium Plan',
      priceUsd: 4000,
      durationMonths: 6,
      contactCredits: 50,
      dailyProfileViewLimit: 100,
      badgeTitle: 'Gold Member',
      features: [
        '50 Verified Contact Unlocks',
        'Direct Wali Phone Numbers',
        'Halal Chat Lounge Direct Messaging',
        'Featured Biodata Placement',
      ],
      isActive: true,
    },
    {
      id: 'pkg_diamond',
      name: 'Diamond VIP Plan',
      priceUsd: 5000,
      durationMonths: 6,
      contactCredits: 100,
      dailyProfileViewLimit: 250,
      badgeTitle: 'Diamond VIP',
      features: [
        '100 Verified Contact Unlocks',
        'Priority KYC Verification Badge',
        'Unlimited Daily Profile Views',
        'Direct Matchmaker Advice',
      ],
      isActive: true,
    },
    {
      id: 'pkg_elite',
      name: 'Royal Walima Concierge',
      priceUsd: 6500,
      durationMonths: 12,
      contactCredits: 999,
      dailyProfileViewLimit: 999,
      badgeTitle: 'Elite Concierge',
      features: [
        'Full 1-Year Executive Matchmaking',
        'Personal Halal Family Consultant',
        'Family Wali Background Check',
        'Dedicated Wedding Services Coordination',
      ],
      isActive: true,
    },
  ];

  for (const pkg of packages) {
    await writeDoc('packages', pkg.id, pkg);
  }

  // 2. Seed Initial Admin Users
  console.log('\n[2/3] Seeding Administrator Records to Firestore...');
  const adminUsers = [
    {
      uid: 'skyxamerica24_owner',
      email: 'skyxamerica24@gmail.com',
      fullName: 'Chief Super Administrator',
      role: 'SUPER_ADMIN',
      membershipTier: 'ELITE',
      status: 'ACTIVE',
      phone: '+1-555-0199',
      profileId: 'MB_ADMIN_01',
    },
    {
      uid: 'superadmin_executive',
      email: 'admin@muslimbibah.com',
      fullName: 'Executive Super Administrator',
      role: 'SUPER_ADMIN',
      membershipTier: 'ELITE',
      status: 'ACTIVE',
      phone: '+1-555-0100',
      profileId: 'MB_ADMIN_02',
    },
  ];

  for (const user of adminUsers) {
    await writeDoc('users', user.uid, user);
  }

  // 3. Seed Form Builder Configurations
  console.log('\n[3/3] Seeding Form Builder Configurations to Firestore...');
  const formConfigs = [
    {
      formId: 'login_form',
      title: 'Member Login Portal',
      theme: 'emerald',
      borderRadius: '12px',
      buttonText: 'Sign In Securely',
      fields: [
        { name: 'identifier', label: 'Email or Phone Number', type: 'text', required: true },
        { name: 'password', label: 'Password', type: 'password', required: true },
      ],
    },
    {
      formId: 'register_form',
      title: 'Free Registration Form',
      theme: 'crimson',
      borderRadius: '14px',
      buttonText: 'Complete Free Registration',
      fields: [
        { name: 'fullName', label: 'Full Legal Name', type: 'text', required: true },
        { name: 'gender', label: 'Biodata For (Gender)', type: 'select', required: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'phone', label: 'Guardian / Personal Phone', type: 'tel', required: true },
        { name: 'password', label: 'Password', type: 'password', required: true },
      ],
    },
    {
      formId: 'profile_form',
      title: 'Islamic Matrimonial Biodata Builder',
      theme: 'gold',
      borderRadius: '16px',
      buttonText: 'Save Biodata Details',
      fields: [
        { name: 'maritalStatus', label: 'Marital Status', type: 'select', required: true },
        { name: 'height', label: 'Height (Feet/Inches)', type: 'text', required: true },
        { name: 'religion', label: 'Religion & Mazhab', type: 'select', required: true },
        { name: 'profession', label: 'Profession', type: 'select', required: true },
        { name: 'guardianName', label: 'Wali / Guardian Name', type: 'text', required: true },
        { name: 'guardianPhone', label: 'Wali Phone Number', type: 'tel', required: true },
      ],
    },
    {
      formId: 'resume_form',
      title: 'Matrimonial Resume & CV Vault',
      theme: 'sapphire',
      borderRadius: '12px',
      buttonText: 'Upload Matrimonial CV',
      fields: [
        { name: 'cvTitle', label: 'CV Title', type: 'text', required: true },
        { name: 'academicSummary', label: 'Academic Qualifications', type: 'textarea', required: true },
        { name: 'familyBackground', label: 'Family Status & Heritage', type: 'textarea', required: true },
      ],
    },
  ];

  for (const cfg of formConfigs) {
    await writeDoc('form_builder_configs', cfg.formId, cfg);
  }

  console.log('\n✅ All Firestore collections successfully populated in muslimbibahmodern!');
}

seedFirestore().catch(err => {
  console.error('\n❌ Error seeding Firestore:', err);
  process.exit(1);
});
