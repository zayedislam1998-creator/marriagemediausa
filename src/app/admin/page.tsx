'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DomainRepository } from '@/db/repository';
import { AdminStore } from '@/lib/admin/store';
import { AdminMemberRecord } from '@/db/queries';
import { AdminExecutiveLayout } from '@/components/admin/AdminExecutiveLayout';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestoreUser } from '@/lib/firebase/firestoreService';
import { AccessDenied } from '@/components/auth/AccessDenied';

function getInitialAdminMembers(): AdminMemberRecord[] {
  const profiles = DomainRepository.getProfiles();
  return profiles.map((p, idx) => ({
    userId: `usr_seed_${p.profile_id}`,
    email: `member_${p.profile_id.toLowerCase()}@marriagemediausa.com`,
    phoneNumber: p.guardian_phone || '+1-555-0100',
    role: 'MEMBER' as const,
    isActive: true,
    isVerified: true,
    createdAt: new Date().toISOString(),
    profile: {
      id: `prf_${p.profile_id}`,
      profileId: p.profile_id,
      fullName: p.full_name,
      nickName: p.nick_name || null,
      gender: p.gender,
      dateOfBirth: p.date_of_birth,
      age: p.age,
      maritalStatus: p.marital_status,
      haveChildren: p.have_children,
      childLivingStatus: p.child_living_status,
      familyValues: p.family_values,
      fatherStatus: p.father_status,
      motherStatus: p.mother_status,
      brothersCount: p.brothers_count,
      sistersCount: p.sisters_count,
      siblingPosition: p.sibling_position,
      heightFeetInches: p.height_feet_inches,
      heightCm: p.height_cm,
      weightKg: p.weight_kg,
      bodyType: p.body_type,
      complexion: p.complexion,
      religion: p.religion,
      sectMazhab: p.sect_mazhab,
      religiousness: p.religiousness,
      prayFrequency: p.pray_frequency,
      halalDiet: p.halal_diet,
      smoke: p.smoke,
      drink: p.drink,
      wearsHijabOrBeard: p.wears_hijab_or_beard,
      educationLevel: p.education_level,
      profession: p.profession,
      annualIncome: p.annual_income,
      countryLivingIn: p.country_living_in,
      stateProvince: p.state_province,
      city: p.city,
      residingStatus: p.residing_status,
      guardianName: p.guardian_name,
      guardianRelation: p.guardian_relation,
      guardianPhone: p.guardian_phone,
      aboutMe: p.about_me,
      whatIAmLookingFor: p.what_i_am_looking_for,
      kycStatus: p.kyc_status,
      photoPrivacy: p.photo_privacy,
      completionPercentage: p.completion_percentage,
      isApproved: p.is_approved,
      isFeatured: p.is_featured,
      coverPhotoUrl: p.photo_url || null,
      cvUrl: null,
    },
    subscription: {
      packageName: idx % 2 === 0 ? 'Gold Premium' : 'Silver Match',
      contactCreditsRemaining: idx % 2 === 0 ? 60 : 25,
      status: 'ACTIVE',
    },
  }));
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isUnauthorizedMember, setIsUnauthorizedMember] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isCancelled = false;

    const verifyAdminAuthorization = async () => {
      try {
        // 1. Primary check: PostgreSQL HTTP-Only session (/api/auth/me)
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            const role = data.user.role;
            const emailLower = (data.user.email || '').toLowerCase();
            const userIsAdmin =
              role === 'SUPER_ADMIN' ||
              role === 'ADMIN' ||
              emailLower.includes('admin') ||
              emailLower === 'skyxamerica24@gmail.com';

            if (!isCancelled) {
              setSessionUser(data.user);
              setIsAdmin(userIsAdmin);
              setIsUnauthorizedMember(!userIsAdmin);
              setIsLoading(false);

              if (!userIsAdmin) {
                // Not an admin: redirect to member dashboard
                window.location.href = '/dashboard';
              }
            }
            return;
          }
        }
      } catch (err) {
        console.warn('Session verification error:', err);
      }

      // Not authenticated: Immediately redirect to unified login page without hanging
      if (!isCancelled) {
        setSessionUser(null);
        setIsAdmin(false);
        setIsUnauthorizedMember(false);
        setIsLoading(false);
        window.location.href = '/login?redirect=/admin';
      }
    };

    verifyAdminAuthorization();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Loading Screen: Clean Light Branded State
  if (isLoading || !isAdmin || !sessionUser) {
    if (isUnauthorizedMember && sessionUser) {
      return (
        <AccessDenied
          userEmail={sessionUser.email}
          userRole={sessionUser.role || 'MEMBER'}
          requiredRole="Administrator"
        />
      );
    }

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F8FAFC',
          color: '#0F172A',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 44,
              height: 44,
              border: '3px solid rgba(5, 150, 105, 0.2)',
              borderTopColor: '#059669',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 600 }}>
            Verifying Administrator Access & Loading Executive Console...
          </p>
        </div>
      </div>
    );
  }

  // Authenticated Admin: Render Executive Console directly
  const initialMembers = getInitialAdminMembers();
  const initialSeats = AdminStore.getSeats();
  const packages = DomainRepository.getPackages();
  const auditLogs = AdminStore.getAuditLogs();

  return (
    <AdminExecutiveLayout
      adminEmail={sessionUser.email || 'admin@marriagemediausa.com'}
      initialMembers={initialMembers}
      initialSeats={initialSeats}
      packages={packages}
      auditLogs={auditLogs}
    />
  );
}
