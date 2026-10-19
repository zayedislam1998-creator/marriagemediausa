'use client';

import { useState } from 'react';
import {
  User,
  Heart,
  Save,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Phone,
  Eye,
  Lock,
} from 'lucide-react';
import { updateMemberProfileAction } from '@/lib/auth/actions';
import { MediaUploadPicker } from '@/components/media/MediaUploadPicker';

interface MemberProfileEditorProps {
  initialProfile: any;
  userEmail: string;
}

export function MemberProfileEditor({ initialProfile, userEmail }: MemberProfileEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states initialized from DB or defaults
  const [fullName, setFullName] = useState(initialProfile?.fullName || '');
  const [age, setAge] = useState(initialProfile?.age || 27);
  const [heightFeetInches, setHeightFeetInches] = useState(initialProfile?.heightFeetInches || "5'6\"");
  const [maritalStatus, setMaritalStatus] = useState(initialProfile?.maritalStatus || 'NEVER_MARRIED');
  const [prayFrequency, setPrayFrequency] = useState(initialProfile?.prayFrequency || 'ALWAYS');
  const [halalDiet, setHalalDiet] = useState(initialProfile?.halalDiet || 'STRICTLY_HALAL');
  const [sectMazhab, setSectMazhab] = useState(initialProfile?.sectMazhab || 'Sunni / Hanafi');
  const [educationLevel, setEducationLevel] = useState(initialProfile?.educationLevel || "Bachelor's Degree");
  const [profession, setProfession] = useState(initialProfile?.profession || 'Professional');
  const [annualIncome, setAnnualIncome] = useState(initialProfile?.annualIncome || '$75,000+');
  const [city, setCity] = useState(initialProfile?.city || 'New York');
  const [stateProvince, setStateProvince] = useState(initialProfile?.stateProvince || 'New York');
  const [guardianName, setGuardianName] = useState(initialProfile?.guardianName || 'Family Guardian');
  const [guardianRelation, setGuardianRelation] = useState(initialProfile?.guardianRelation || 'Father');
  const [guardianPhone, setGuardianPhone] = useState(initialProfile?.guardianPhone || '+1-555-0100');
  const [aboutMe, setAboutMe] = useState(initialProfile?.aboutMe || '');
  const [whatIAmLookingFor, setWhatIAmLookingFor] = useState(initialProfile?.whatIAmLookingFor || '');
  const [photoPrivacy, setPhotoPrivacy] = useState(initialProfile?.photoPrivacy || 'PUBLIC');
  const [avatar, setAvatar] = useState<{ url: string; thumbUrl: string; blurUrl: string; name: string } | null>(
    initialProfile?.avatarUrl
      ? { url: initialProfile.avatarUrl, thumbUrl: initialProfile.avatarUrl, blurUrl: initialProfile.avatarUrl, name: 'Profile Photo' }
      : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('age', age.toString());
    formData.append('heightFeetInches', heightFeetInches);
    formData.append('maritalStatus', maritalStatus);
    formData.append('prayFrequency', prayFrequency);
    formData.append('halalDiet', halalDiet);
    formData.append('sectMazhab', sectMazhab);
    formData.append('educationLevel', educationLevel);
    formData.append('profession', profession);
    formData.append('annualIncome', annualIncome);
    formData.append('city', city);
    formData.append('stateProvince', stateProvince);
    formData.append('guardianName', guardianName);
    formData.append('guardianRelation', guardianRelation);
    formData.append('guardianPhone', guardianPhone);
    formData.append('aboutMe', aboutMe);
    formData.append('whatIAmLookingFor', whatIAmLookingFor);
    formData.append('photoPrivacy', photoPrivacy);
    if (avatar) {
      formData.append('photoUrl', avatar.url);
      formData.append('photoThumbUrl', avatar.thumbUrl);
      formData.append('photoBlurUrl', avatar.blurUrl);
    }

    const res = await updateMemberProfileAction(null, formData);
    setIsSubmitting(false);

    if (res.success) {
      setNotification({ type: 'success', message: '✓ Your biodata and profile have been successfully saved in PostgreSQL!' });
      setTimeout(() => setNotification(null), 5000);
    } else {
      setNotification({ type: 'error', message: res.error || 'Failed to update profile.' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {notification && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 12,
            background: notification.type === 'success' ? '#ECFDF5' : '#FFF1F2',
            border: `1px solid ${notification.type === 'success' ? '#A7F3D0' : '#FECDD3'}`,
            color: notification.type === 'success' ? '#065F46' : '#9F1239',
            fontSize: '0.875rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header card with completion meter */}
        <div className="card-3d" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  📝 My Islamic Biodata Profile
                </h2>
                <span className="badge-3d" style={{ fontSize: '0.7rem' }}>
                  ID: {initialProfile?.profileId || '2026-NEW'}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Providing authentic and complete details increases your verified match quality and mutual family compatibility.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-3d"
              style={{
                padding: '12px 24px',
                fontSize: '0.9rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              <Save size={16} />
              {isSubmitting ? 'Saving changes...' : 'Save Biodata'}
            </button>
          </div>
        </div>

        {/* Section 1: Islamic Practice */}
        <div className="card-3d" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <span style={{ fontSize: '1.25rem' }}>🕌</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Islamic Practice & Religious Values
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Prayer Frequency (Salah)
              </label>
              <select
                value={prayFrequency}
                onChange={(e) => setPrayFrequency(e.target.value)}
                className="input-3d"
                style={{ padding: '10px 12px', borderRadius: 10, fontSize: '0.85rem', background: '#fff' }}
              >
                <option value="ALWAYS">Always 5 Times Daily (Regular)</option>
                <option value="SOMETIMES">Sometimes / Striving</option>
                <option value="JUMUAH_ONLY">Jumuah Only</option>
                <option value="RARELY">Rarely</option>
              </select>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Halal Diet Adherence
              </label>
              <select
                value={halalDiet}
                onChange={(e) => setHalalDiet(e.target.value)}
                className="input-3d"
                style={{ padding: '10px 12px', borderRadius: 10, fontSize: '0.85rem', background: '#fff' }}
              >
                <option value="STRICTLY_HALAL">Strictly 100% Halal Only</option>
                <option value="HALAL_PREFERRED">Halal Preferred</option>
                <option value="VEGETARIAN">Vegetarian / Halal Strict</option>
              </select>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Sect / Mazhab (Aqeeda)
              </label>
              <input
                type="text"
                value={sectMazhab}
                onChange={(e) => setSectMazhab(e.target.value)}
                placeholder="e.g., Sunni / Hanafi"
                className="input-3d"
                style={{ padding: '10px 12px', borderRadius: 10, fontSize: '0.85rem', background: '#fff' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Photo Privacy Policy (Purdah Shield)
              </label>
              <select
                value={photoPrivacy}
                onChange={(e) => setPhotoPrivacy(e.target.value)}
                className="input-3d"
                style={{ padding: '10px 12px', borderRadius: 10, fontSize: '0.85rem', background: '#fff' }}
              >
                <option value="PUBLIC">Public (Visible to verified members)</option>
                <option value="BLURRED_PURDAH">🔒 Purdah Shield (Blurred photo, visible upon mutual consent)</option>
              </select>
            </div>

            {/* Profile Avatar Upload with Enterprise File Manager */}
            <div style={{ gridColumn: '1 / -1', marginTop: 10 }}>
              <MediaUploadPicker
                label="Profile Photo (Sharp WebP & Purdah Shield)"
                description="Manage your profile image with our Enterprise File Manager. Automatically generates 3 WebP variants with 24px Purdah blur."
                value={avatar}
                onChange={(m) => setAvatar(m)}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Personal & Physical */}
        <div className="card-3d" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <span style={{ fontSize: '1.25rem' }}>👤</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Personal & Physical Attributes
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-3d"
                style={{ padding: '10px 12px', borderRadius: 10, fontSize: '0.85rem', background: '#fff' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Age (Years)
              </label>
              <input
                type="number"
                min={18}
                max={80}
                required
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value, 10))}
                className="input-3d"
                style={{ padding: '10px 12px', borderRadius: 10, fontSize: '0.85rem', background: '#fff' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Height
              </label>
              <input
                type="text"
                value={heightFeetInches}
                onChange={(e) => setHeightFeetInches(e.target.value)}
                placeholder="e.g., 5'6&quot;"
                className="input-3d"
                style={{ padding: '10px 12px', borderRadius: 10, fontSize: '0.85rem', background: '#fff' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Marital Status
              </label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                className="input-3d"
                style={{ padding: '10px 12px', borderRadius: 10, fontSize: '0.85rem', background: '#fff' }}
              >
                <option value="NEVER_MARRIED">Never Married</option>
                <option value="DIVORCED">Divorced</option>
                <option value="WIDOWED">Widowed</option>
                <option value="SEPARATED">Separated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Career & Location */}
        <div className="card-3d" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <span style={{ fontSize: '1.25rem' }}>🎓</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Education, Career & Location
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Education Level
              </label>
              <input
                type="text"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                placeholder="e.g., Bachelor's in CS / Master's / MBBS"
                className="input-3d"
                style={{ padding: '10px 12px', borderRadius: 10, fontSize: '0.85rem', background: '#fff' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Profession
              </label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="e.g., Software Engineer / Physician / Teacher"
                className="input-3d"
                style={{ padding: '10px 12px', borderRadius: 10, fontSize: '0.85rem', background: '#fff' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Annual Income
              </label>
              <input
                type="text"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                placeholder="e.g., $85,000+ USD"
                className="input-3d"
                style={{ padding: '10px 12px', borderRadius: 10, fontSize: '0.85rem', background: '#fff' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                City & State / Province
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City (e.g. New York)"
                  className="input-3d"
                  style={{ padding: '10px 12px', borderRadius: 10, fontSize: '0.85rem', background: '#fff' }}
                />
                <input
                  type="text"
                  value={stateProvince}
                  onChange={(e) => setStateProvince(e.target.value)}
                  placeholder="State (e.g. NY / TX)"
                  className="input-3d"
                  style={{ padding: '10px 12px', borderRadius: 10, fontSize: '0.85rem', background: '#fff' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Mandatory Halal Guardian / Wali */}
        <div className="card-3d-gold" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: '1.25rem' }}>🛡️</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Wali & Guardian Details (Islamic Matrimonial Guarantee)
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            In accordance with Islamic Shariah, authentic guardian information ensures safe and dignified family involvement.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Guardian / Wali Full Name
              </label>
              <input
                type="text"
                required
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="e.g., Mohammad Rafiqul Islam"
                className="input-3d"
                style={{ padding: '10px 12px', borderRadius: 10, fontSize: '0.85rem', background: '#fff' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Relationship to Member
              </label>
              <select
                value={guardianRelation}
                onChange={(e) => setGuardianRelation(e.target.value)}
                className="input-3d"
                style={{ padding: '10px 12px', borderRadius: 10, fontSize: '0.85rem', background: '#fff' }}
              >
                <option value="Father">Father</option>
                <option value="Brother">Brother</option>
                <option value="Uncle">Uncle</option>
                <option value="Grandfather">Grandfather</option>
                <option value="Self">Self (Independent)</option>
              </select>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Guardian Phone Number
              </label>
              <input
                type="tel"
                required
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="+1-555-0100"
                className="input-3d"
                style={{ padding: '10px 12px', borderRadius: 10, fontSize: '0.85rem', background: '#fff' }}
              />
            </div>
          </div>
        </div>

        {/* Section 5: Narrative Bio */}
        <div className="card-3d" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <span style={{ fontSize: '1.25rem' }}>✍️</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Personal Bio & Partner Expectations
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                About Myself (Values, Personality & Background)
              </label>
              <textarea
                rows={3}
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                placeholder="Describe your Islamic values, daily lifestyle, interests, and family values..."
                className="input-3d"
                style={{ padding: '12px 14px', borderRadius: 10, fontSize: '0.85rem', background: '#fff', width: '100%' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                What I Am Looking For (Partner Expectations)
              </label>
              <textarea
                rows={3}
                value={whatIAmLookingFor}
                onChange={(e) => setWhatIAmLookingFor(e.target.value)}
                placeholder="Describe your desired qualities in a spouse, religious commitment, and goals..."
                className="input-3d"
                style={{ padding: '12px 14px', borderRadius: 10, fontSize: '0.85rem', background: '#fff', width: '100%' }}
              />
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-3d"
              style={{
                padding: '12px 28px',
                fontSize: '0.95rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Save size={18} />
              {isSubmitting ? 'Saving changes...' : 'Save All Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
