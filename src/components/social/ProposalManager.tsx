'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Inbox,
  Send,
  Heart,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Phone,
  Bookmark,
} from 'lucide-react';
import { ProposalItem, ProposalService, ProposalStatus } from '@/lib/social/proposals';
import { updateProposalStatusAction } from '@/lib/social/actions';

interface ProposalManagerProps {
  initialProposals: ProposalItem[];
  currentUserId: string;
}

export function ProposalManager({ initialProposals, currentUserId }: ProposalManagerProps) {
  const [proposals, setProposals] = useState<ProposalItem[]>(initialProposals);
  const [activeTab, setActiveTab] = useState<'INBOX' | 'SHORTLISTED' | 'ACCEPTED' | 'SENT'>('INBOX');
  const [selectedDeclineProposal, setSelectedDeclineProposal] = useState<ProposalItem | null>(null);
  const [declineReason, setDeclineReason] = useState<string>(
    'JazakAllahu Khayran for your interest. After family consultation, we feel our life vision and preferences do not align. May Allah grant you a righteous spouse.'
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (proposalId: string, status: ProposalStatus, reason?: string) => {
    setLoadingId(proposalId);
    try {
      const res = await updateProposalStatusAction(proposalId, status, reason);
      if (res.success && res.proposal) {
        setProposals((prev) =>
          prev.map((p) => (p.id === proposalId ? res.proposal! : p))
        );
        if (status === 'DECLINED') {
          setSelectedDeclineProposal(null);
        }
      } else {
        alert(res.error || 'Failed to update proposal status.');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred.');
    } finally {
      setLoadingId(null);
    }
  };

  const filteredProposals = proposals.filter((p) => {
    if (activeTab === 'INBOX') return p.status === 'PENDING';
    if (activeTab === 'SHORTLISTED') return p.status === 'SHORTLISTED';
    if (activeTab === 'ACCEPTED') return p.status === 'ACCEPTED';
    if (activeTab === 'SENT') return p.senderId === currentUserId;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          background: 'var(--bg-surface)',
          padding: 6,
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          overflowX: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('INBOX')}
          className={`btn btn-sm ${activeTab === 'INBOX' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          <Inbox size={16} /> Pending Inbox (
          {proposals.filter((p) => p.status === 'PENDING').length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SHORTLISTED')}
          className={`btn btn-sm ${activeTab === 'SHORTLISTED' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          <Bookmark size={16} /> Shortlisted (
          {proposals.filter((p) => p.status === 'SHORTLISTED').length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ACCEPTED')}
          className={`btn btn-sm ${activeTab === 'ACCEPTED' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          <CheckCircle2 size={16} /> Accepted Connections (
          {proposals.filter((p) => p.status === 'ACCEPTED').length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SENT')}
          className={`btn btn-sm ${activeTab === 'SENT' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          <Send size={16} /> Sent Outbox
        </button>
      </div>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-3xl) var(--space-lg)',
            textAlign: 'center',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>💌</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            No proposals in this category
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 4 }}>
            Explore verified suitors in the 3-Column Search Workspace to initiate Sunnah proposals.
          </p>
          <Link href="/search" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
            Find Compatible Suitors
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {filteredProposals.map((item) => {
            const isSender = item.senderId === currentUserId;
            const otherName = isSender ? item.receiverName : item.senderName;
            const otherPhoto = isSender ? item.receiverPhoto : item.senderPhoto;
            const otherProfession = isSender ? item.receiverProfession : item.senderProfession;
            const otherLocation = isSender ? item.receiverLocation : item.senderLocation;
            const otherAge = isSender ? item.receiverAge : item.senderAge;

            return (
              <div
                key={item.id}
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-xl)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-md)',
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        background: '#E2E8F0',
                      }}
                    >
                      <img
                        src={otherPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                        alt={otherName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h4 style={{ fontSize: '1.0625rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                          {otherName}
                        </h4>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          ({otherAge} yrs)
                        </span>
                        <span className="badge badge-emerald" style={{ fontSize: '0.625rem' }}>
                          {item.matchScore}% Compatibility
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-body)', marginTop: 2 }}>
                        {otherProfession} • {otherLocation}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {item.status === 'PENDING' && (
                      <span className="badge badge-gold">⏳ Pending Review</span>
                    )}
                    {item.status === 'SHORTLISTED' && (
                      <span className="badge badge-sapphire">⭐ Shortlisted</span>
                    )}
                    {item.status === 'ACCEPTED' && (
                      <span className="badge badge-emerald">✓ Mutual Connection Accepted</span>
                    )}
                    {item.status === 'DECLINED' && (
                      <span className="badge badge-coral">✕ Respectfully Declined</span>
                    )}
                  </div>
                </div>

                {/* Initial Proposal Message */}
                <div
                  style={{
                    background: 'var(--bg-app)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '12px 16px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8125rem',
                    color: 'var(--text-body)',
                    lineHeight: 1.6,
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                    💬 Initial Proposal Message:
                  </div>
                  "{item.initialMessage}"
                  {item.rejectionReason && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-subtle)', color: 'var(--coral-700)' }}>
                      <strong>Polite Decline Reason:</strong> {item.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Wali Notification Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--emerald-700)' }}>
                  <ShieldCheck size={14} />
                  <span>Wali guardian notification enabled • Zero unmonitored communication</span>
                </div>

                {/* Action Buttons */}
                {!isSender && item.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      disabled={loadingId === item.id}
                      onClick={() => handleStatusChange(item.id, 'ACCEPTED')}
                      className="btn btn-primary btn-sm"
                    >
                      <CheckCircle2 size={16} /> Accept Proposal & Unlock Communication
                    </button>

                    <button
                      type="button"
                      disabled={loadingId === item.id}
                      onClick={() => handleStatusChange(item.id, 'SHORTLISTED')}
                      className="btn btn-outline btn-sm"
                    >
                      ⭐ Shortlist for Family Review
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedDeclineProposal(item)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--coral-600)' }}
                    >
                      <XCircle size={16} /> Decline Respectfully
                    </button>
                  </div>
                )}

                {item.status === 'ACCEPTED' && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Link href="/chat" className="btn btn-primary btn-sm">
                      <MessageSquare size={16} /> Open Halal Chat Lounge
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Decline Reason Modal */}
      {selectedDeclineProposal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-md)',
          }}
          onClick={() => setSelectedDeclineProposal(null)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: 500,
              width: '100%',
              padding: 'var(--space-xl)',
              boxShadow: 'var(--shadow-modal)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-main)' }}>
              Decline Proposal Respectfully
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 12 }}>
              Choose or edit a polite canned Islamic note. Dignity and kindness are mandatory on Marriage Media USA.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {[
                'JazakAllahu Khayran for your interest. After family consultation, we feel our life vision and preferences do not align. May Allah grant you a righteous spouse.',
                'Thank you for reaching out. We have already proceeded with another family at this stage. May Allah bless your search.',
                'BarakAllahu Feek. We kindly decline due to geographic and relocation constraints.',
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setDeclineReason(reason)}
                  style={{
                    padding: 8,
                    borderRadius: 'var(--radius-md)',
                    border: declineReason === reason ? '2px solid var(--emerald-600)' : '1px solid var(--border-subtle)',
                    background: declineReason === reason ? 'var(--emerald-50)' : 'var(--bg-app)',
                    fontSize: '0.75rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>

            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8125rem',
                marginBottom: 16,
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setSelectedDeclineProposal(null)}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loadingId === selectedDeclineProposal.id}
                onClick={() => handleStatusChange(selectedDeclineProposal.id, 'DECLINED', declineReason)}
                className="btn btn-primary btn-sm"
                style={{ background: 'var(--coral-500)', borderColor: 'var(--coral-500)' }}
              >
                Send Polite Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
