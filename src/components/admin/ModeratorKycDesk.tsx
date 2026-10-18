'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  FileCheck,
  Eye,
  Check,
  X,
  AlertTriangle,
  Lock,
  Unlock,
  Ban,
  ShieldAlert,
} from 'lucide-react';
import { KycSubmission, FraudTicket } from '@/lib/admin/store';
import { updateKycStatusAction, updateFraudStatusAction } from '@/lib/admin/actions';
import { AuthenticProfile } from '@/db/repository';

interface ModeratorKycDeskProps {
  initialKycQueue: KycSubmission[];
  initialFraudTickets: FraudTicket[];
  profiles: AuthenticProfile[];
}

export function ModeratorKycDesk({
  initialKycQueue,
  initialFraudTickets,
  profiles,
}: ModeratorKycDeskProps) {
  const [activeTab, setActiveTab] = useState<'kyc' | 'modesty' | 'fraud'>('kyc');
  const [kycQueue, setKycQueue] = useState<KycSubmission[]>(initialKycQueue);
  const [fraudTickets, setFraudTickets] = useState<FraudTicket[]>(initialFraudTickets);
  const [selectedDoc, setSelectedDoc] = useState<KycSubmission | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Photo Modesty Queue State
  const [photoPolicies, setPhotoPolicies] = useState<Record<string, 'PUBLIC' | 'BLURRED_PURDAH'>>(
    () =>
      Object.fromEntries(
        profiles.map((p) => [
          p.profile_id,
          p.photo_privacy === 'BLURRED_PURDAH' ? 'BLURRED_PURDAH' : 'PUBLIC',
        ])
      )
  );

  const handleKycDecision = async (submissionId: string, status: 'VERIFIED' | 'REJECTED') => {
    const res = await updateKycStatusAction(submissionId, status);
    if (res.success && res.submission) {
      setKycQueue((prev) => prev.map((k) => (k.id === submissionId ? res.submission! : k)));
      if (selectedDoc?.id === submissionId) {
        setSelectedDoc(res.submission);
      }
      setFeedback(
        `✓ ${res.submission.candidateName} (${submissionId}) marked as ${status}`
      );
    } else {
      setFeedback(`⚠️ ${res.error || 'Failed to update KYC status'}`);
    }
  };

  const handleFraudDecision = async (
    ticketId: string,
    status: 'OPEN' | 'WARNED' | 'SUSPENDED' | 'BANNED'
  ) => {
    const res = await updateFraudStatusAction(ticketId, status);
    if (res.success && res.ticket) {
      setFraudTickets((prev) => prev.map((t) => (t.id === ticketId ? res.ticket! : t)));
      setFeedback(
        `🛡️ Ticket ${ticketId} (${res.ticket.reportedName}) updated to ${status}`
      );
    } else {
      setFeedback(`⚠️ ${res.error || 'Failed to update fraud ticket'}`);
    }
  };

  const togglePurdahEnforcement = (profileId: string, fullName: string) => {
    setPhotoPolicies((prev) => {
      const next = prev[profileId] === 'BLURRED_PURDAH' ? 'PUBLIC' : 'BLURRED_PURDAH';
      setFeedback(
        next === 'BLURRED_PURDAH'
          ? `🔒 Enforced 24px Purdah Gaussian Blur shield on ${fullName} (#${profileId})`
          : `✓ Approved public modesty compliance for ${fullName} (#${profileId})`
      );
      return { ...prev, [profileId]: next };
    });
  };

  const pendingKycCount = kycQueue.filter((k) => k.status === 'PENDING_REVIEW').length;
  const verifiedKycCount = kycQueue.filter((k) => k.status === 'VERIFIED').length;
  const openFraudCount = fraudTickets.filter((t) => t.status === 'OPEN').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* Top KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 'var(--space-md)',
        }}
      >
        <div
          style={{
            background: 'var(--bg-surface)',
            padding: 'var(--space-lg)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Pending KYC Reviews
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold-600)', marginTop: 4 }}>
            {pendingKycCount} Documents
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            padding: 'var(--space-lg)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Verified Suitors (KYC Stamp)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--emerald-600)', marginTop: 4 }}>
            {verifiedKycCount} Approved
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            padding: 'var(--space-lg)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Purdah Blur Protected
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sapphire-600)', marginTop: 4 }}>
            {Object.values(photoPolicies).filter((v) => v === 'BLURRED_PURDAH').length} Profiles
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            padding: 'var(--space-lg)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Open Fraud / Safety Tickets
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--coral-500)', marginTop: 4 }}>
            {openFraudCount} Active Alerts
          </div>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--emerald-50)',
            border: '1px solid var(--emerald-300)',
            color: 'var(--emerald-900)',
            fontSize: '0.8125rem',
            fontWeight: 600,
          }}
        >
          {feedback}
        </div>
      )}

      {/* Desk Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '2px solid var(--border-subtle)',
          paddingBottom: 2,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('kyc')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'transparent',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'kyc' ? '3px solid var(--emerald-600)' : '3px solid transparent',
            color: activeTab === 'kyc' ? 'var(--emerald-700)' : 'var(--text-muted)',
          }}
        >
          📋 KYC Identity & Degree Queue ({kycQueue.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('modesty')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'transparent',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'modesty' ? '3px solid var(--emerald-600)' : '3px solid transparent',
            color: activeTab === 'modesty' ? 'var(--emerald-700)' : 'var(--text-muted)',
          }}
        >
          🧕 Photo Modesty & Purdah Shield ({profiles.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fraud')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'transparent',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'fraud' ? '3px solid var(--emerald-600)' : '3px solid transparent',
            color: activeTab === 'fraud' ? 'var(--emerald-700)' : 'var(--text-muted)',
          }}
        >
          🚨 Fraud Alert & Abuse Desk ({fraudTickets.length})
        </button>
      </div>

      {/* TAB 1: KYC Verification Inbox */}
      {activeTab === 'kyc' && (
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>
              📋 Private Vault Document Verification Queue (/uploads/private/kyc/)
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Compare government passports, state IDs, and university credentials against suitor profile claims.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 12px' }}>Queue ID</th>
                  <th style={{ padding: '10px 12px' }}>Suitor Candidate</th>
                  <th style={{ padding: '10px 12px' }}>Document Claimed</th>
                  <th style={{ padding: '10px 12px' }}>Submitted</th>
                  <th style={{ padding: '10px 12px' }}>Verification Status</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Moderator Actions</th>
                </tr>
              </thead>
              <tbody>
                {kycQueue.map((k) => (
                  <tr key={k.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{k.id}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{k.candidateName}</div>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Profile #{k.profileId}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600 }}>{k.docType}</div>
                      {k.notes && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{k.notes}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{k.submittedDate}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        className={`badge ${
                          k.status === 'VERIFIED'
                            ? 'badge-emerald'
                            : k.status === 'REJECTED'
                            ? 'badge-coral'
                            : 'badge-gold'
                        }`}
                      >
                        {k.status === 'VERIFIED'
                          ? '✓ Verified'
                          : k.status === 'REJECTED'
                          ? '✕ Rejected'
                          : '⏳ Pending Review'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedDoc(k)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px' }}
                        >
                          <Eye size={12} /> Inspect
                        </button>
                        <button
                          type="button"
                          onClick={() => handleKycDecision(k.id, 'VERIFIED')}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 8px' }}
                        >
                          <Check size={12} /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleKycDecision(k.id, 'REJECTED')}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '4px 8px', color: 'var(--coral-600)' }}
                        >
                          <X size={12} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Photo Modesty Review Desk */}
      {activeTab === 'modesty' && (
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>
              🧕 Photo Modesty & Purdah Gaussian Blur Desk
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Verify that uploaded suitor avatars adhere to Islamic modesty guidelines or enforce 24px Purdah blur.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-md)',
            }}
          >
            {profiles.map((p) => {
              const mode = photoPolicies[p.profile_id] || 'PUBLIC';
              const isBlurred = mode === 'BLURRED_PURDAH';
              return (
                <div
                  key={p.profile_id}
                  style={{
                    padding: 'var(--space-lg)',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge ${isBlurred ? 'badge-gold' : 'badge-emerald'}`}>
                      {isBlurred ? '🔒 24px Purdah Blur Active' : '✓ Public Modesty Approved'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{p.profile_id}</span>
                  </div>

                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                      {p.full_name} ({p.age})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {p.profession} • {p.city}, {p.state_province}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-body)' }}>
                    <strong>Modesty Practice:</strong> {p.wears_hijab_or_beard} • <strong>Sect:</strong> {p.sect_mazhab}
                  </div>

                  <button
                    type="button"
                    onClick={() => togglePurdahEnforcement(p.profile_id, p.full_name)}
                    className={`btn btn-sm ${isBlurred ? 'btn-outline' : 'btn-primary'}`}
                    style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}
                  >
                    {isBlurred ? (
                      <>
                        <Unlock size={13} /> Switch to Public Verified
                      </>
                    ) : (
                      <>
                        <Lock size={13} /> Enforce 24px Purdah Blur
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Fraud Alert & Abuse Desk */}
      {activeTab === 'fraud' && (
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>
              🚨 Fraud Alert, Wali Inquiry & Abuse Investigation Desk
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Investigate member reports, issue formal warnings, or freeze malicious accounts immediately.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {fraudTickets.map((ticket) => (
              <div
                key={ticket.id}
                style={{
                  padding: 'var(--space-lg)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="badge badge-coral">{ticket.id}</span>
                    <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                      {ticket.reportedName} (#{ticket.reportedProfileId})
                    </span>
                    <span
                      className={`badge ${
                        ticket.status === 'OPEN'
                          ? 'badge-gold'
                          : ticket.status === 'BANNED'
                          ? 'badge-coral'
                          : 'badge-sapphire'
                      }`}
                    >
                      Status: {ticket.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-body)' }}>{ticket.reason}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Reported by: {ticket.reporterEmail} • Opened: {ticket.createdAt}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleFraudDecision(ticket.id, 'WARNED')}
                    className="btn btn-outline btn-sm"
                  >
                    <AlertTriangle size={12} /> Warning Notice
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFraudDecision(ticket.id, 'SUSPENDED')}
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: 'var(--gold-400)', color: 'var(--gold-700)' }}
                  >
                    <ShieldAlert size={12} /> Suspend (7d)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFraudDecision(ticket.id, 'BANNED')}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--coral-600)' }}
                  >
                    <Ban size={12} /> Permanent Ban
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Side-by-Side Document Inspector Modal */}
      {selectedDoc && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-md)',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-xl)',
              maxWidth: 640,
              width: '100%',
              boxShadow: 'var(--shadow-modal)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>
                  KYC Vault Inspector: {selectedDoc.id}
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Candidate: {selectedDoc.candidateName} (#{selectedDoc.profileId})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="btn btn-ghost btn-sm"
              >
                ✕
              </button>
            </div>

            <div
              style={{
                background: 'var(--bg-app)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 4 }}>
                Submitted Credential: {selectedDoc.docType}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-body)', marginBottom: 8 }}>
                {selectedDoc.notes}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--emerald-700)', fontWeight: 600 }}>
                🔒 Protected Path: /api/admin/kyc/{selectedDoc.id.toLowerCase()}.webp
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                onClick={() => handleKycDecision(selectedDoc.id, 'REJECTED')}
                className="btn btn-outline"
                style={{ color: 'var(--coral-600)' }}
              >
                <X size={14} /> Reject Submission
              </button>
              <button
                type="button"
                onClick={() => handleKycDecision(selectedDoc.id, 'VERIFIED')}
                className="btn btn-primary"
              >
                <Check size={14} /> Issue Verified Badge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
