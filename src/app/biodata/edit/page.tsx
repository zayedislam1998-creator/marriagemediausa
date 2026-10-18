'use client';

import Link from 'next/link';
import { DomainRepository } from '@/db/repository';
import { BiodataWizard } from '@/components/biodata/BiodataWizard';
import { useRequireAuth } from '@/lib/firebase/useRequireAuth';
import { ArrowLeft, ShieldCheck, Lock, Sparkles } from 'lucide-react';

export default function BiodataEditPage() {
  const { user, isLoading } = useRequireAuth();

  if (isLoading || !user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 44,
              height: 44,
              border: '3px solid rgba(16, 185, 129, 0.2)',
              borderTopColor: '#10b981',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
            Verifying Authentication & Opening Biodata Studio...
          </p>
        </div>
      </div>
    );
  }

  const countries = DomainRepository.getCountries();
  const usStates = DomainRepository.getUSStates();
  const professions = DomainRepository.getProfessions();
  const educationLevels = DomainRepository.getEducationLevels();
  const sectsAndMazhabs = DomainRepository.getSectsAndMazhabs();
  const residencyStatuses = DomainRepository.getResidencyStatuses();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '12px var(--space-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link
            href="/dashboard"
            className="btn btn-ghost btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div style={{ height: 20, width: 1, background: 'var(--border-subtle)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'linear-gradient(135deg, var(--emerald-600), var(--gold-500))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.875rem',
              }}
            >
              ☪
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Marriage Media USA Biodata Studio
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--emerald-700)',
              background: 'var(--emerald-50)',
              border: '1px solid var(--emerald-200)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-pill)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <ShieldCheck size={14} /> Wali Guardian Protocol
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Signed in: <strong>{user.email}</strong>
          </span>
        </div>
      </header>

      {/* Main Studio Body */}
      <main style={{ maxWidth: 1040, margin: '0 auto', padding: 'var(--space-2xl) var(--space-md)', width: '100%', flex: 1 }}>
        {/* Intro Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(217, 119, 6, 0.05) 100%)',
            border: '1.5px solid var(--emerald-200)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-lg)',
            marginBottom: 'var(--space-xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-md)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Sparkles size={18} color="var(--emerald-600)" />
              <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                Comprehensive 8-Category Biodata Wizard
              </h1>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              Complete your profile according to strict Islamic matrimonial standards. Every attribute helps find your genuine compatible match.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--emerald-800)',
                background: '#fff',
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--emerald-200)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Lock size={12} /> 100% Halal Shariah Privacy
            </span>
          </div>
        </div>

        {/* 8-Step Interactive Biodata Wizard */}
        <BiodataWizard
          countries={countries}
          usStates={usStates}
          professions={professions}
          educationLevels={educationLevels}
          sectsAndMazhabs={sectsAndMazhabs}
          residencyStatuses={residencyStatuses}
        />
      </main>
    </div>
  );
}
