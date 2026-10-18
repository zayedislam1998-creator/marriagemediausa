'use client';

import { useState } from 'react';
import {
  User,
  Heart,
  Activity,
  BookOpen,
  Briefcase,
  MapPin,
  ShieldCheck,
  Sparkles,
  Camera,
  FileCheck,
  CheckCircle2,
  Lock,
  Eye,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { Country, USState } from '@/db/repository';
import { saveBiodataAction, uploadAvatarAction, uploadKycDocumentAction } from '@/lib/biodata/actions';
import { calculateCompletionScore, BiodataFormData } from '@/lib/biodata/schema';

interface BiodataWizardProps {
  countries: Country[];
  usStates: USState[];
  professions: string[];
  educationLevels: string[];
  sectsAndMazhabs: string[];
  residencyStatuses: string[];
  initialData?: Partial<BiodataFormData>;
}

export function BiodataWizard({
  countries,
  usStates,
  professions,
  educationLevels,
  sectsAndMazhabs,
  residencyStatuses,
  initialData,
}: BiodataWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State initialized with authentic matrimonial defaults
  const [formData, setFormData] = useState<any>({
    createdBy: initialData?.createdBy || 'self',
    createdFor: initialData?.createdFor || 'self',
    lookingFor: initialData?.lookingFor || 'MALE',
    fullName: initialData?.fullName || 'Dr. Ayesha Siddiqa',
    nickName: initialData?.nickName || 'Ayesha',
    gender: initialData?.gender || 'FEMALE',
    dateOfBirth: initialData?.dateOfBirth || '1999-05-14',
    age: initialData?.age || 27,

    maritalStatus: initialData?.maritalStatus || 'NEVER_MARRIED',
    haveChildren: initialData?.haveChildren || 'No',
    childLivingStatus: initialData?.childLivingStatus || 'No Child',
    familyValues: initialData?.familyValues || 'Religious',
    fatherStatus: initialData?.fatherStatus || 'Professional (Civil Engineer)',
    motherStatus: initialData?.motherStatus || 'Homemaker',
    brothersCount: initialData?.brothersCount || '1',
    sistersCount: initialData?.sistersCount || '1',
    siblingPosition: initialData?.siblingPosition || '1',

    heightFeetInches: initialData?.heightFeetInches || "5'6\"",
    heightCm: initialData?.heightCm || 167,
    weightKg: initialData?.weightKg || 58,
    bodyType: initialData?.bodyType || 'SLIM',
    complexion: initialData?.complexion || 'FAIR',
    eyesColor: initialData?.eyesColor || 'Brown',
    hairColor: initialData?.hairColor || 'Dark Brown',
    bloodGroup: initialData?.bloodGroup || 'B+',
    disability: initialData?.disability || 'None',
    eyeWear: initialData?.eyeWear || 'Glasses',

    religion: initialData?.religion || 'Islam',
    sectMazhab: initialData?.sectMazhab || 'Sunni (Hanafi)',
    religiousness: initialData?.religiousness || 'VERY_RELIGIOUS',
    prayFrequency: initialData?.prayFrequency || 'ALWAYS',
    fastingRamadan: initialData?.fastingRamadan || 'ALWAYS',
    quranReading: initialData?.quranReading || 'DAILY',
    halalDiet: initialData?.halalDiet || 'STRICTLY_HALAL',
    smoke: initialData?.smoke || 'NO',
    drink: initialData?.drink || 'NO',
    wearsHijabOrBeard: initialData?.wearsHijabOrBeard ?? true,
    motherTongue: initialData?.motherTongue || 'English',

    educationLevel: initialData?.educationLevel || 'Doctorate (Ph.D / MD / JD)',
    institutionName: initialData?.institutionName || 'UCLA David Geffen School of Medicine',
    fieldOfStudy: initialData?.fieldOfStudy || 'Medicine / Pediatrics',
    profession: initialData?.profession || 'Doctor',
    designation: initialData?.designation || 'Pediatric Resident Physician',
    employerName: initialData?.employerName || 'Children\'s Hospital Los Angeles',
    experienceYears: initialData?.experienceYears || '3 years',
    annualIncome: initialData?.annualIncome || '$75,000 - $100,000',

    nationality: initialData?.nationality || 'United States',
    countryLivingIn: initialData?.countryLivingIn || 'United States (USA)',
    stateProvince: initialData?.stateProvince || 'California',
    city: initialData?.city || 'Los Angeles',
    zipCode: initialData?.zipCode || '90024',
    residingStatus: initialData?.residingStatus || 'CITIZEN',
    addressLine: initialData?.addressLine || 'Westwood, Los Angeles, CA',

    guardianName: initialData?.guardianName || 'Mohammad Siddiqur Rahman',
    guardianRelation: initialData?.guardianRelation || 'Father',
    guardianPhoneCountryCode: initialData?.guardianPhoneCountryCode || '+1',
    guardianPhone: initialData?.guardianPhone || '310-555-0142',
    guardianEmail: initialData?.guardianEmail || 'guardian@example.com',
    guardianVerified: initialData?.guardianVerified ?? true,

    aboutMe:
      initialData?.aboutMe ||
      'Alhamdulillah, I am a practicing Muslimah currently completing my medical residency in California. I pray 5 times daily, wear hijab, and strive to center my life around Islamic ethics. I enjoy reading, hiking, and family gatherings.',
    whatIAmLookingFor:
      initialData?.whatIAmLookingFor ||
      'Seeking a practicing, honest, and kind Muslim brother living in the US who takes his Salah seriously, values family, and holds strong moral character. Preferably an educated professional who respects mutual Islamic values.',
    hobbiesInterests: initialData?.hobbiesInterests || 'Reading Quran, hiking, calligraphy, cooking',
    photoPrivacy: initialData?.photoPrivacy || 'BLURRED_PURDAH',

    partnerAgeMin: initialData?.partnerAgeMin || 24,
    partnerAgeMax: initialData?.partnerAgeMax || 34,
    partnerMaritalStatus: initialData?.partnerMaritalStatus || 'NEVER_MARRIED',
    partnerHeightMinCm: initialData?.partnerHeightMinCm || 165,
    partnerHeightMaxCm: initialData?.partnerHeightMaxCm || 195,
    partnerPreferredCountry: initialData?.partnerPreferredCountry || 'United States (USA)',
    partnerPreferredState: initialData?.partnerPreferredState || 'California',
    partnerPreferredResidency: initialData?.partnerPreferredResidency || 'CITIZEN',
  });

  // Media state
  const [avatarResult, setAvatarResult] = useState<{
    fullUrl: string;
    thumbUrl: string;
    blurUrl: string;
  } | null>(null);
  const [kycPath, setKycPath] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingKyc, setUploadingKyc] = useState(false);

  const completionScore = calculateCompletionScore(formData);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const fd = new FormData();
    fd.append('photo', file);

    const res = await uploadAvatarAction(fd);
    setUploadingImage(false);

    if (res.success && res.fullUrl && res.thumbUrl && res.blurUrl) {
      setAvatarResult({
        fullUrl: res.fullUrl,
        thumbUrl: res.thumbUrl,
        blurUrl: res.blurUrl,
      });
    } else {
      alert(res.error || 'Failed to process avatar');
    }
  };

  const handleKycUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingKyc(true);
    const fd = new FormData();
    fd.append('kycFile', file);

    const res = await uploadKycDocumentAction(fd);
    setUploadingKyc(false);

    if (res.success && res.privatePath) {
      setKycPath(res.privatePath);
    } else {
      alert(res.error || 'Failed to upload KYC document');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      fd.append(k, String(v));
    });

    const res = await saveBiodataAction(null, fd);
    setIsSubmitting(false);

    if (res && !res.success) {
      setErrorMessage(res.error);
    }
  };

  const steps = [
    { num: 1, title: 'Basic Identity', icon: User },
    { num: 2, title: 'Family & Marital', icon: Heart },
    { num: 3, title: 'Physical & Health', icon: Activity },
    { num: 4, title: 'Islamic Practice', icon: BookOpen },
    { num: 5, title: 'Education & Career', icon: Briefcase },
    { num: 6, title: 'Location & US Diaspora', icon: MapPin },
    { num: 7, title: 'Wali Guardian (Halal)', icon: ShieldCheck },
    { num: 8, title: 'Preferences & Purdah Photo', icon: Camera },
  ];

  return (
    <div
      style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: 'var(--space-xl)',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-modal)',
        border: '1px solid var(--border-medium)',
      }}
    >
      {/* Wizard Header with Dynamic Completion Meter */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-md)',
          paddingBottom: 'var(--space-lg)',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: 'var(--space-xl)',
        }}
      >
        <div>
          <div className="badge badge-emerald" style={{ marginBottom: 4 }}>
            <Sparkles size={12} />
            85+ Field Authentic Matrimonial Biodata Wizard
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Matrimonial Profile Creator
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Halal, Sunnah-compliant profile registration with verified Wali oversight.
          </p>
        </div>

        {/* Dynamic Completion Score Ring Box */}
        <div
          style={{
            background: 'var(--bg-app)',
            borderRadius: 'var(--radius-lg)',
            padding: '10px 16px',
            border: '1.5px solid var(--emerald-500)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              PROFILE COMPLETION
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--emerald-600)', lineHeight: 1 }}>
              {completionScore}%
            </div>
          </div>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'var(--emerald-50)',
              color: 'var(--emerald-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Stepper Navigation Pills */}
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: 6,
          paddingBottom: 'var(--space-md)',
          marginBottom: 'var(--space-xl)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.num;
          const isDone = currentStep > s.num;

          return (
            <button
              key={s.num}
              type="button"
              onClick={() => setCurrentStep(s.num)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                border: 'none',
                background: isActive
                  ? 'var(--emerald-600)'
                  : isDone
                  ? 'var(--emerald-50)'
                  : 'var(--bg-surface-subtle)',
                color: isActive ? '#fff' : isDone ? 'var(--emerald-800)' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} />
              <span>
                {s.num}. {s.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div
          style={{
            background: '#FFF1F2',
            border: '1px solid #FECDD3',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.8125rem',
            color: '#BE123C',
            marginBottom: 'var(--space-lg)',
          }}
        >
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit}>
        {/* STEP 1: Basic Identity */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800 }}>1. Basic & Identity Information</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nick Name / Known As</label>
                <input
                  type="text"
                  value={formData.nickName}
                  onChange={(e) => handleChange('nickName', e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => {
                    const g = e.target.value;
                    handleChange('gender', g);
                    handleChange('lookingFor', g === 'FEMALE' ? 'MALE' : 'FEMALE');
                  }}
                  className="form-control"
                >
                  <option value="FEMALE">Female (Bride / Sister)</option>
                  <option value="MALE">Male (Groom / Brother)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Looking For</label>
                <select
                  value={formData.lookingFor}
                  onChange={(e) => handleChange('lookingFor', e.target.value)}
                  className="form-control"
                >
                  <option value="MALE">Male (Groom / Brother)</option>
                  <option value="FEMALE">Female (Bride / Sister)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth (YYYY-MM-DD)</label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Age (Years)</label>
                <input
                  type="number"
                  min={18}
                  max={99}
                  required
                  value={formData.age}
                  onChange={(e) => handleChange('age', Number(e.target.value))}
                  className="form-control"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Marital History & Family Background */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800 }}>2. Marital & Family Background</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label">Marital Status</label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => handleChange('maritalStatus', e.target.value)}
                  className="form-control"
                >
                  <option value="NEVER_MARRIED">Never Married</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                  <option value="SEPARATED">Separated</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Do you have children?</label>
                <select
                  value={formData.haveChildren}
                  onChange={(e) => handleChange('haveChildren', e.target.value)}
                  className="form-control"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Family Values</label>
                <select
                  value={formData.familyValues}
                  onChange={(e) => handleChange('familyValues', e.target.value)}
                  className="form-control"
                >
                  <option value="Religious">Religious</option>
                  <option value="Traditional">Traditional</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Liberal">Liberal</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Father's Occupation / Status</label>
                <input
                  type="text"
                  value={formData.fatherStatus}
                  onChange={(e) => handleChange('fatherStatus', e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mother's Occupation / Status</label>
                <input
                  type="text"
                  value={formData.motherStatus}
                  onChange={(e) => handleChange('motherStatus', e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Number of Brothers / Sisters</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    placeholder="Brothers count"
                    value={formData.brothersCount}
                    onChange={(e) => handleChange('brothersCount', e.target.value)}
                    className="form-control"
                  />
                  <input
                    type="text"
                    placeholder="Sisters count"
                    value={formData.sistersCount}
                    onChange={(e) => handleChange('sistersCount', e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Physical & Health */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800 }}>3. Physical Attributes & Health</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label">Height (Feet & Inches, e.g. 5'6")</label>
                <input
                  type="text"
                  value={formData.heightFeetInches}
                  onChange={(e) => handleChange('heightFeetInches', e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Height in CM</label>
                <input
                  type="number"
                  value={formData.heightCm}
                  onChange={(e) => handleChange('heightCm', Number(e.target.value))}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Weight (KG)</label>
                <input
                  type="number"
                  value={formData.weightKg}
                  onChange={(e) => handleChange('weightKg', Number(e.target.value))}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Body Type</label>
                <select
                  value={formData.bodyType}
                  onChange={(e) => handleChange('bodyType', e.target.value)}
                  className="form-control"
                >
                  <option value="AVERAGE">Average</option>
                  <option value="SLIM">Slim</option>
                  <option value="ATHLETIC">Athletic</option>
                  <option value="HEAVY">Heavy</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Complexion</label>
                <select
                  value={formData.complexion}
                  onChange={(e) => handleChange('complexion', e.target.value)}
                  className="form-control"
                >
                  <option value="FAIR">Fair</option>
                  <option value="VERY_FAIR">Very Fair</option>
                  <option value="WHEATISH">Wheatish</option>
                  <option value="WHEATISH_MEDIUM">Wheatish Medium</option>
                  <option value="WHEATISH_BROWN">Wheatish Brown</option>
                  <option value="DARK">Dark</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => handleChange('bloodGroup', e.target.value)}
                  className="form-control"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Islamic Lifestyle */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800 }}>4. Islamic Lifestyle & Religious Practice</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label">Sect / Mazhab</label>
                <select
                  value={formData.sectMazhab}
                  onChange={(e) => handleChange('sectMazhab', e.target.value)}
                  className="form-control"
                >
                  {sectsAndMazhabs.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Religious Commitment</label>
                <select
                  value={formData.religiousness}
                  onChange={(e) => handleChange('religiousness', e.target.value)}
                  className="form-control"
                >
                  <option value="VERY_RELIGIOUS">Very Religious</option>
                  <option value="RELIGIOUS">Religious</option>
                  <option value="PRACTICING">Practicing</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="AVERAGE">Average</option>
                  <option value="REVERT">Revert / Convert</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Salah (Prayer Frequency)</label>
                <select
                  value={formData.prayFrequency}
                  onChange={(e) => handleChange('prayFrequency', e.target.value)}
                  className="form-control"
                >
                  <option value="ALWAYS">Always (5 Times Daily)</option>
                  <option value="REGULARLY">Regularly</option>
                  <option value="SOMETIMES">Sometimes</option>
                  <option value="JUMUAH_ONLY">Only Jumu'ah</option>
                  <option value="RARELY">Rarely</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Halal Diet</label>
                <select
                  value={formData.halalDiet}
                  onChange={(e) => handleChange('halalDiet', e.target.value)}
                  className="form-control"
                >
                  <option value="STRICTLY_HALAL">Strictly Halal Only</option>
                  <option value="HALAL_PREFERRED">Halal Preferred</option>
                  <option value="VEGETARIAN">Vegetarian / Seafood</option>
                  <option value="ANY">Flexible</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Hijab or Sunnah Beard</label>
                <select
                  value={formData.wearsHijabOrBeard ? 'true' : 'false'}
                  onChange={(e) => handleChange('wearsHijabOrBeard', e.target.value === 'true')}
                  className="form-control"
                >
                  <option value="true">Yes (Wears Hijab / Has Sunnah Beard)</option>
                  <option value="false">No / Modest Attire</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Mother Tongue</label>
                <input
                  type="text"
                  value={formData.motherTongue}
                  onChange={(e) => handleChange('motherTongue', e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Education & Career */}
        {currentStep === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800 }}>5. Education & Professional Career</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label">Education Level</label>
                <select
                  value={formData.educationLevel}
                  onChange={(e) => handleChange('educationLevel', e.target.value)}
                  className="form-control"
                >
                  {educationLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Institution / University</label>
                <input
                  type="text"
                  required
                  value={formData.institutionName}
                  onChange={(e) => handleChange('institutionName', e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Field of Study / Major</label>
                <input
                  type="text"
                  required
                  value={formData.fieldOfStudy}
                  onChange={(e) => handleChange('fieldOfStudy', e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Profession Sector</label>
                <select
                  value={formData.profession}
                  onChange={(e) => handleChange('profession', e.target.value)}
                  className="form-control"
                >
                  {professions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Job Title / Designation</label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Employer Name / Company</label>
                <input
                  type="text"
                  required
                  value={formData.employerName}
                  onChange={(e) => handleChange('employerName', e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Annual Income Bracket</label>
                <select
                  value={formData.annualIncome}
                  onChange={(e) => handleChange('annualIncome', e.target.value)}
                  className="form-control"
                >
                  <option value="$50,000 - $75,000">$50,000 - $75,000</option>
                  <option value="$75,000 - $100,000">$75,000 - $100,000</option>
                  <option value="$100,000 - $150,000">$100,000 - $150,000</option>
                  <option value="$150,000 - $200,000">$150,000 - $200,000</option>
                  <option value="$200,000+">$200,000+</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Location & US Residency */}
        {currentStep === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800 }}>6. Location & US Diaspora Residency</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label">Country Living In</label>
                <select
                  value={formData.countryLivingIn}
                  onChange={(e) => handleChange('countryLivingIn', e.target.value)}
                  className="form-control"
                >
                  {countries.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">State / Province</label>
                <select
                  value={formData.stateProvince}
                  onChange={(e) => handleChange('stateProvince', e.target.value)}
                  className="form-control"
                >
                  {usStates.map((s) => (
                    <option key={s.code} value={s.name}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Zip / Postal Code</label>
                <input
                  type="text"
                  required
                  value={formData.zipCode}
                  onChange={(e) => handleChange('zipCode', e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">US Residency / Immigration Status</label>
                <select
                  value={formData.residingStatus}
                  onChange={(e) => handleChange('residingStatus', e.target.value)}
                  className="form-control"
                >
                  <option value="CITIZEN">US Citizen (Naturalized or Born)</option>
                  <option value="PERMANENT_RESIDENT">Permanent Resident (Green Card)</option>
                  <option value="WORK_PERMIT">Work Permit (H-1B, L-1, O-1)</option>
                  <option value="STUDENT_VISA">Student Visa (F-1 / OPT / STEM)</option>
                  <option value="BUSINESS_VISA">Business Visa (E-2 / EB-5)</option>
                  <option value="OTHERS">Other Legal Status</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Mandatory Wali Guardian */}
        {currentStep === 7 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={24} style={{ color: 'var(--emerald-600)' }} />
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 800 }}>
                  7. Guardian / Wali Information (Mandatory for Halal Marriage)
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  To preserve dignity and family trust, Wali contact is strictly collected for all sister profiles.
                </p>
              </div>
            </div>

            <div
              style={{
                background: 'var(--emerald-50)',
                border: '1px solid var(--emerald-200)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.8125rem',
                color: 'var(--emerald-900)',
                lineHeight: 1.5,
              }}
            >
              <strong>Islamic Jurisprudence Requirement:</strong> The Prophet Muhammad (ﷺ) said:
              <em> "There is no marriage without a Wali (guardian)."</em> [Abu Dawud 2085].
              Marriage Media USA will only release Wali contact information to verified paid suitors upon mutual interest.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label">Wali / Guardian Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.guardianName}
                  onChange={(e) => handleChange('guardianName', e.target.value)}
                  placeholder="e.g. Mohammad Siddiqur Rahman"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Wali Relationship</label>
                <select
                  value={formData.guardianRelation}
                  onChange={(e) => handleChange('guardianRelation', e.target.value)}
                  className="form-control"
                >
                  <option value="Father">Father</option>
                  <option value="Brother">Brother</option>
                  <option value="Uncle">Paternal Uncle</option>
                  <option value="Grandfather">Grandfather</option>
                  <option value="Legal Guardian">Legal Guardian</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Country Code</label>
                <input
                  type="text"
                  value={formData.guardianPhoneCountryCode}
                  onChange={(e) => handleChange('guardianPhoneCountryCode', e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Wali Direct Telephone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.guardianPhone}
                  onChange={(e) => handleChange('guardianPhone', e.target.value)}
                  placeholder="e.g. 310-555-0142"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Wali Email (Optional)</label>
                <input
                  type="email"
                  value={formData.guardianEmail}
                  onChange={(e) => handleChange('guardianEmail', e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Narrative, Purdah Photo Shield & KYC Vault */}
        {currentStep === 8 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800 }}>
              8. Expectations, Purdah Photo Shield & KYC Document Vault
            </h2>

            {/* About Me & Expectations */}
            <div className="form-group">
              <label className="form-label">About Myself & Religious Goals</label>
              <textarea
                rows={3}
                required
                value={formData.aboutMe}
                onChange={(e) => handleChange('aboutMe', e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">What I Am Looking For in a Spouse</label>
              <textarea
                rows={3}
                required
                value={formData.whatIAmLookingFor}
                onChange={(e) => handleChange('whatIAmLookingFor', e.target.value)}
                className="form-control"
              />
            </div>

            {/* Photo Privacy & Purdah Modesty Shield */}
            <div
              style={{
                background: 'var(--bg-app)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-lg)',
                border: '1.5px solid var(--border-medium)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Lock size={18} style={{ color: 'var(--emerald-600)' }} />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
                  Purdah Photo Modesty Shield Options
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, marginBottom: 'var(--space-md)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="photoPrivacy"
                    checked={formData.photoPrivacy === 'BLURRED_PURDAH'}
                    onChange={() => handleChange('photoPrivacy', 'BLURRED_PURDAH')}
                  />
                  <span>🛡️ <strong>Purdah Blur (24px Shield)</strong></span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="photoPrivacy"
                    checked={formData.photoPrivacy === 'PUBLIC'}
                    onChange={() => handleChange('photoPrivacy', 'PUBLIC')}
                  />
                  <span>🌐 <strong>Public Avatar</strong></span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="photoPrivacy"
                    checked={formData.photoPrivacy === 'HIDDEN'}
                    onChange={() => handleChange('photoPrivacy', 'HIDDEN')}
                  />
                  <span>🔒 <strong>Silhouette Only</strong></span>
                </label>
              </div>

              {/* Real Sharp Processing File Upload */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                  Upload Profile Avatar (Sharp WebP Generator):
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  disabled={uploadingImage}
                />
                {uploadingImage && <span style={{ fontSize: '0.75rem', color: 'var(--emerald-600)' }}>Processing Sharp 3-variant WebP...</span>}

                {/* Real-time 3-variant Preview */}
                {avatarResult && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <img src={avatarResult.thumbUrl} alt="Thumbnail" style={{ width: 64, height: 80, objectFit: 'cover', borderRadius: 6 }} />
                      <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Card Thumb</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <img src={avatarResult.blurUrl} alt="Purdah Blur" style={{ width: 64, height: 80, objectFit: 'cover', borderRadius: 6 }} />
                      <div style={{ fontSize: '0.625rem', color: 'var(--coral-600)', fontWeight: 700 }}>24px Purdah Blur</div>
                    </div>
                    <span className="badge badge-emerald">✓ 3 Variants Generated in /uploads/</span>
                  </div>
                )}
              </div>
            </div>

            {/* Private KYC Document Upload Vault */}
            <div
              style={{
                background: 'var(--sapphire-50)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-lg)',
                border: '1.5px solid var(--sapphire-100)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <FileCheck size={18} style={{ color: 'var(--sapphire-600)' }} />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--sapphire-900)' }}>
                  Private KYC Vault (Passport / US Green Card / Degree)
                </h3>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                Stored strictly under private disk vault (<code>/uploads/private/kyc/</code>). Blocked from public HTTP serving.
              </p>

              <input
                type="file"
                accept=".pdf,image/jpeg,image/png"
                onChange={handleKycUpload}
                disabled={uploadingKyc}
              />
              {uploadingKyc && <span style={{ fontSize: '0.75rem', color: 'var(--sapphire-600)' }}>Uploading to private vault...</span>}
              {kycPath && (
                <div style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--emerald-700)', fontWeight: 600 }}>
                  ✓ Securely vaulted at {kycPath} (Pending Moderator Review)
                </div>
              )}
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'var(--space-2xl)',
            paddingTop: 'var(--space-md)',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="btn btn-ghost"
            >
              <ArrowLeft size={16} /> Back Step
            </button>
          ) : (
            <div />
          )}

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="btn btn-primary"
            >
              Next Step <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-lg"
              style={{ paddingInline: 28 }}
            >
              {isSubmitting ? 'Validating & Saving...' : 'Save & Publish Halal Biodata'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
