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
  const initialMembers: AdminMemberRecord[] = [];
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
