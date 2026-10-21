import Link from 'next/link';
import { DomainRepository } from '@/db/repository';
import { getCurrentSession } from '@/lib/auth/session';
import { VisitorRadarService } from '@/lib/social/radar';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';
import {
  ShieldCheck,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  FileText,
} from 'lucide-react';

import { notFound } from 'next/navigation';
import { getPublicProfileByIdFromDb } from '@/db/queries';
import { connection } from 'next/server';

export const instant = false;

export default async function SingleProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const profile = await getPublicProfileByIdFromDb(id);

  if (!profile) {
    notFound();
  }


  const isPurdah = profile.photo_privacy === 'BLURRED_PURDAH';
  const photoUrl =
    profile.photo_url ||
    (profile.gender === 'FEMALE'
      ? 'https://muslimbibah.com/design/member_image/2018055584_1526196452_1.jpg'
      : 'https://muslimbibah.com/design/member_image/2021027948_1622089820_1.jpg');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ maxWidth: 1120, margin: '0 auto', padding: 'var(--space-2xl) var(--space-md)', width: '100%', flex: 1 }}>
        {/* Breadcrumb Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-lg)',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <Link href="/search" className="btn btn-outline btn-sm" style={{ fontWeight: 800 }}>
            <ArrowLeft size={15} /> Back to Search Profiles
          </Link>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link
              href="/proposals"
              className="btn-3d-gold"
              style={{
                padding: '9px 16px',
                borderRadius: 10,
                fontSize: '0.8rem',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <FileText size={14} /> Export / Print Official Biodata
            </Link>
            <Link
              href="/proposals"
              className="btn-3d-crimson"
              style={{
                padding: '9px 18px',
                borderRadius: 10,
                fontSize: '0.8rem',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Heart size={14} /> Send Salaam / Marriage Proposal
            </Link>
          </div>
        </div>

        {/* 3D Hero Profile Summary Card */}
        <div
          className="card-3d"
          style={{
            padding: 'var(--space-xl)',
            marginBottom: 'var(--space-xl)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: 'var(--space-xl)',
            alignItems: 'center',
            borderTop: '5px solid #059669',
          }}
        >
          {/* Left Real Member Photo & Purdah Shield */}
          <div
            style={{
              background:
                profile.gender === 'FEMALE'
                  ? 'linear-gradient(135deg, #FFF1F2, #FCE7F3)'
                  : 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              border: '1px solid #CBD5E1',
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.9)',
            }}
          >
            <div
              style={{
                width: 190,
                height: 225,
                borderRadius: 18,
                overflow: 'hidden',
                background: '#0F172A',
                border: '4px solid #FFFFFF',
                boxShadow: '0 8px 24px rgba(15,23,42,0.2)',
                marginBottom: 14,
              }}
            >
              <img
                src={photoUrl}
                alt={profile.full_name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                  filter: isPurdah ? 'blur(8px)' : 'none',
                }}
              />
            </div>
            <span className={`badge ${isPurdah ? 'badge-gold' : 'badge-emerald'}`}>
              {isPurdah ? (
                <>
                  <Lock size={12} /> Protected by Purdah Shield
                </>
              ) : (
                <>
                  <CheckCircle2 size={12} /> Verified Member Photo
                </>
              )}
            </span>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: 8, fontWeight: 800 }}>
              Profile ID: <span style={{ color: '#c0392b' }}>#{profile.profile_id}</span>
            </div>
          </div>

          {/* Right Primary Details */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              <span className="badge badge-emerald">
                <ShieldCheck size={12} /> {profile.package_name}
              </span>
              <span className="badge badge-sapphire">
                🛡️ {profile.residing_status}
              </span>
              <span className="badge badge-gold">
                <Sparkles size={12} /> 96% Compatibility Match
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                fontWeight: 900,
                color: 'var(--text-main)',
                margin: '4px 0',
                fontFamily: 'var(--font-display)',
              }}
            >
              {profile.full_name} ({profile.age} yrs, {profile.height_feet_inches})
            </h1>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                fontSize: '0.9rem',
                color: 'var(--text-body)',
                marginTop: 10,
                marginBottom: 18,
                fontWeight: 600,
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Briefcase size={16} style={{ color: 'var(--emerald-600)' }} />
                {profile.profession} ({profile.annual_income})
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <GraduationCap size={16} style={{ color: 'var(--sapphire-600)' }} />
                {profile.education_level} — {profile.institution_name}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} style={{ color: 'var(--coral-500)' }} />
                {profile.city}, {profile.state_province}, {profile.country_living_in}
              </span>
            </div>

            <p
              style={{
                fontSize: '0.9rem',
                lineHeight: 1.7,
                color: 'var(--text-body)',
                background: 'linear-gradient(135deg, #F8FAFC, #F0FDF4)',
                padding: 'var(--space-lg)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid #CBD5E1',
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8)',
                margin: 0,
              }}
            >
              “{profile.about_me}”
            </p>
          </div>
        </div>

        {/* 4-Category 85+ Field Biodata Matrix with 3D Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 'var(--space-lg)',
          }}
        >
          {/* 1. Islamic Practice & Modesty */}
          <div className="card-3d" style={{ padding: 'var(--space-xl)', borderTop: '4px solid #059669' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 14, color: 'var(--emerald-800)' }}>
              ☪ 1. Islamic Practice & Sunnah Lifestyle
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: '0.85rem' }}>
              <div><strong>Religion & Sect:</strong> {profile.religion} ({profile.sect_mazhab})</div>
              <div><strong>Religiousness:</strong> {profile.religiousness}</div>
              <div><strong>Salah / Prayer Frequency:</strong> {profile.pray_frequency}</div>
              <div><strong>Modesty (Hijab / Beard):</strong> {profile.wears_hijab_or_beard ? 'Yes (Practicing)' : 'No'}</div>
              <div><strong>Halal Diet:</strong> {profile.halal_diet} • <strong>Smoke/Alcohol:</strong> Strictly No</div>
            </div>
          </div>

          {/* 2. Marital & Family Background */}
          <div className="card-3d" style={{ padding: 'var(--space-xl)', borderTop: '4px solid #0284C7' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 14, color: '#075985' }}>
              👨‍👩‍👧‍👦 2. Marital History & Family Values
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: '0.85rem' }}>
              <div><strong>Marital Status:</strong> {profile.marital_status}</div>
              <div><strong>Children:</strong> {profile.have_children}</div>
              <div><strong>Family Values:</strong> {profile.family_values}</div>
              <div><strong>Parents Status:</strong> Father ({profile.father_status}) • Mother ({profile.mother_status})</div>
              <div><strong>Siblings:</strong> {profile.brothers_count} Brothers, {profile.sisters_count} Sisters</div>
            </div>
          </div>

          {/* 3. Education, Career & US Residency */}
          <div className="card-3d" style={{ padding: 'var(--space-xl)', borderTop: '4px solid #D97706' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 14, color: '#92400E' }}>
              🎓 3. Academic Credentials & Career
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: '0.85rem' }}>
              <div><strong>Highest Degree:</strong> {profile.education_level} ({profile.field_of_study})</div>
              <div><strong>University / Institution:</strong> {profile.institution_name}</div>
              <div><strong>Profession & Role:</strong> {profile.profession} — {profile.designation}</div>
              <div><strong>Annual Income:</strong> {profile.annual_income}</div>
              <div><strong>Legal Residency Status:</strong> {profile.residing_status} ({profile.nationality})</div>
            </div>
          </div>

          {/* 4. Mandatory Wali (Guardian) Verification */}
          <div className="card-3d-gold" style={{ padding: 'var(--space-xl)', borderTop: '4px solid #e74c3c' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 14, color: '#991B1B' }}>
              🛡️ 4. Verified Wali (Guardian) & Partner Expectations
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: '0.85rem', color: 'var(--text-main)' }}>
              <div><strong>Wali / Guardian Name:</strong> {profile.guardian_name} ({profile.guardian_relation})</div>
              <div><strong>Wali Phone Status:</strong> {profile.guardian_verified ? 'Verified' : 'Pending'} ({profile.guardian_phone_country_code} {profile.guardian_phone.slice(0, 3)}-***-****)</div>
              <div><strong>Partner Expectations:</strong> {profile.what_i_am_looking_for}</div>
              <div><strong>Hobbies & Interests:</strong> {profile.hobbies_interests || 'Reading, Family, Islamic Studies'}</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
