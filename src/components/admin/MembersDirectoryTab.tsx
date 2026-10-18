'use client';

import { useState } from 'react';
import {
  Search,
  User,
  Shield,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Lock,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Crown,
  X,
  FileText,
  UserCheck,
} from 'lucide-react';
import { AdminMemberRecord } from '@/db/queries';
import {
  adminChangeUserRoleAction,
  adminToggleUserActiveAction,
  adminUpdateMemberKycAction,
} from '@/lib/auth/actions';
import { adminAssignMemberTierAction } from '@/lib/admin/packageActions';
import { adminSetMemberAccess } from '@/lib/firebase/authService';

interface MembersDirectoryTabProps {
  initialMembers: AdminMemberRecord[];
}

export function MembersDirectoryTab({ initialMembers }: MembersDirectoryTabProps) {
  const [members, setMembers] = useState<AdminMemberRecord[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');
  const [selectedMember, setSelectedMember] = useState<AdminMemberRecord | null>(null);
  const [modalTab, setModalTab] = useState<'islamic' | 'personal' | 'career' | 'guardian' | 'narrative'>('islamic');
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  // Filter members
  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      m.email.toLowerCase().includes(q) ||
      m.phoneNumber.toLowerCase().includes(q) ||
      m.profile?.fullName.toLowerCase().includes(q) ||
      m.profile?.profileId.toLowerCase().includes(q) ||
      m.profile?.profession.toLowerCase().includes(q) ||
      m.profile?.city.toLowerCase().includes(q);

    const matchRole = roleFilter === 'ALL' || m.role === roleFilter;
    const matchGender = genderFilter === 'ALL' || m.profile?.gender === genderFilter;

    return matchSearch && matchRole && matchGender;
  });

  const totalPages = Math.ceil(filteredMembers.length / PAGE_SIZE) || 1;
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleRoleChange = async (userId: string, newRole: any) => {
    setActionLoading(true);
    const res = await adminChangeUserRoleAction(userId, newRole);
    setActionLoading(false);

    if (res.success) {
      setMembers((prev) =>
        prev.map((m) => (m.userId === userId ? { ...m, role: newRole } : m))
      );
      if (selectedMember?.userId === userId) {
        setSelectedMember((prev) => (prev ? { ...prev, role: newRole } : null));
      }
      setNotification({ type: 'success', message: res.message || 'Role updated successfully.' });
      setTimeout(() => setNotification(null), 4000);
    } else {
      setNotification({ type: 'error', message: res.error || 'Failed to update role' });
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    setActionLoading(true);
    const newStatus = !currentStatus;
    const res = await adminToggleUserActiveAction(userId, newStatus);
    setActionLoading(false);

    if (res.success) {
      setMembers((prev) =>
        prev.map((m) => (m.userId === userId ? { ...m, isActive: newStatus } : m))
      );
      if (selectedMember?.userId === userId) {
        setSelectedMember((prev) => (prev ? { ...prev, isActive: newStatus } : null));
      }
      setNotification({ type: 'success', message: res.message || 'Status updated successfully.' });
      setTimeout(() => setNotification(null), 4000);
    } else {
      setNotification({ type: 'error', message: res.error || 'Failed to update status' });
    }
  };

  const handleKycUpdate = async (userId: string, newStatus: 'VERIFIED' | 'REJECTED' | 'PENDING') => {
    setActionLoading(true);
    const res = await adminUpdateMemberKycAction(userId, newStatus);
    setActionLoading(false);

    if (res.success) {
      setMembers((prev) =>
        prev.map((m) =>
          m.userId === userId && m.profile
            ? { ...m, profile: { ...m.profile, kycStatus: newStatus } }
            : m
        )
      );
      if (selectedMember?.userId === userId && selectedMember.profile) {
        setSelectedMember((prev) =>
          prev && prev.profile
            ? { ...prev, profile: { ...prev.profile, kycStatus: newStatus } }
            : null
        );
      }
      setNotification({ type: 'success', message: res.message || 'KYC status updated successfully.' });
      setTimeout(() => setNotification(null), 4000);
    } else {
      setNotification({ type: 'error', message: res.error || 'Failed to update KYC' });
    }
  };

  const handleTierChange = async (userId: string, newTier: 'FREE' | 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND' | 'ELITE') => {
    setActionLoading(true);
    const res = await adminAssignMemberTierAction(userId, newTier);
    try {
      await adminSetMemberAccess(userId, newTier);
    } catch {
      // Graceful fallback if user is only in PostgreSQL
    }
    setActionLoading(false);

    if (res.success) {
      setMembers((prev) =>
        prev.map((m) =>
          m.userId === userId
            ? {
                ...m,
                subscription: {
                  packageName: res.packageName || `${newTier} Plan`,
                  contactCreditsRemaining: m.subscription?.contactCreditsRemaining ?? 25,
                  status: 'ACTIVE',
                },
              }
            : m
        )
      );
      if (selectedMember?.userId === userId) {
        setSelectedMember((prev) =>
          prev
            ? {
                ...prev,
                subscription: {
                  packageName: res.packageName || `${newTier} Plan`,
                  contactCreditsRemaining: prev.subscription?.contactCreditsRemaining ?? 25,
                  status: 'ACTIVE',
                },
              }
            : null
        );
      }
      setNotification({ type: 'success', message: res.message || `Granted ${newTier} Mode successfully.` });
      setTimeout(() => setNotification(null), 4000);
    } else {
      setNotification({ type: 'error', message: res.error || 'Failed to update membership tier' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Toast Notification */}
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
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          }}
        >
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Executive Toolbar & Filters */}
      <div
        className="card-3d"
        style={{
          padding: '18px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          background: '#fff',
        }}
      >
        {/* Top Line: Header & Summary Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Members & Biodata Directory
              </h3>
              <span className="badge-3d" style={{ background: '#F1F5F9', color: '#0F172A', fontWeight: 800 }}>
                {filteredMembers.length} Results
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Inspect all authentic member profiles across 85+ attributes, manage KYC, and enforce Halal matrimonial rules.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge-3d" style={{ background: '#F8FAFC', color: 'var(--text-main)' }}>
              Total: {members.length}
            </span>
            <span className="badge-3d" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#B45309' }}>
              👑 Admins: {members.filter((m) => m.role === 'SUPER_ADMIN').length}
            </span>
            <span className="badge-3d" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#047857' }}>
              ✓ KYC Verified: {members.filter((m) => m.profile?.kycStatus === 'VERIFIED').length}
            </span>
          </div>
        </div>

        {/* Toolbar Row: Search (centered / prominent) + Professional Filter Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            paddingTop: 10,
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {/* Search Box with Search Icon and Clear button */}
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 420 }}>
            <input
              type="text"
              placeholder="Search by Name, Email, Phone, Profession, City..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="input-3d"
              style={{
                width: '100%',
                padding: '9px 34px 9px 38px',
                borderRadius: 10,
                fontSize: '0.85rem',
                border: '1.5px solid var(--border-medium)',
                background: '#fff',
              }}
            />
            <Search
              size={16}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 2,
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Compact Filter Buttons / Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Role Filter Pills */}
            <div style={{ display: 'flex', background: '#F1F5F9', padding: 3, borderRadius: 10 }}>
              {(['ALL', 'SUPER_ADMIN', 'MEMBER'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRoleFilter(r);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: roleFilter === r ? '#fff' : 'transparent',
                    color: roleFilter === r ? '#0F172A' : '#64748B',
                    boxShadow: roleFilter === r ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {r === 'ALL' ? 'All Roles' : r === 'SUPER_ADMIN' ? '👑 Admins' : '👤 Members'}
                </button>
              ))}
            </div>

            {/* Gender Filter Pills */}
            <div style={{ display: 'flex', background: '#F1F5F9', padding: 3, borderRadius: 10 }}>
              {(['ALL', 'FEMALE', 'MALE'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setGenderFilter(g);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: genderFilter === g ? '#fff' : 'transparent',
                    color: genderFilter === g ? '#0F172A' : '#64748B',
                    boxShadow: genderFilter === g ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {g === 'ALL' ? 'All Genders' : g === 'FEMALE' ? '🧕 Sisters' : '👨‍💼 Brothers'}
                </button>
              ))}
            </div>

            {/* Reset Filters button if any filter active */}
            {(searchQuery || roleFilter !== 'ALL' || genderFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('ALL');
                  setGenderFilter('ALL');
                  setCurrentPage(1);
                }}
                className="btn-3d-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 10px', borderRadius: 8 }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div
        className="card-3d"
        style={{
          overflow: 'hidden',
          padding: 0,
          background: '#fff',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid var(--border-medium)' }}>
                <th style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--text-muted)' }}>Profile & ID</th>
                <th style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--text-muted)' }}>Contact Details</th>
                <th style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--text-muted)' }}>Role</th>
                <th style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--text-muted)' }}>Subscription</th>
                <th style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--text-muted)' }}>KYC Status</th>
                <th style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No members match the current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((member) => {
                  const prof = member.profile;

                  return (
                    <tr
                      key={member.userId}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Profile & ID */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 10,
                              background: prof?.gender === 'FEMALE' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                              color: prof?.gender === 'FEMALE' ? '#BE185D' : '#1D4ED8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '1rem',
                            }}
                          >
                            {prof?.gender === 'FEMALE' ? '🧕' : '👨‍💼'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                              {prof?.fullName || 'Registered Member'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span>ID: {prof?.profileId || 'N/A'}</span>
                              {prof?.photoPrivacy === 'BLURRED_PURDAH' && (
                                <span style={{ color: '#D97706', fontSize: '0.7rem' }}>• Purdah Shield</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{member.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.phoneNumber}</div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '4px 10px',
                            borderRadius: 8,
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            background:
                              member.role === 'SUPER_ADMIN'
                                ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)'
                                : member.role === 'MODERATOR'
                                ? '#E0E7FF'
                                : member.role === 'EDITOR'
                                ? '#F3E8FF'
                                : '#F1F5F9',
                            color:
                              member.role === 'SUPER_ADMIN'
                                ? '#92400E'
                                : member.role === 'MODERATOR'
                                ? '#3730A3'
                                : member.role === 'EDITOR'
                                ? '#6B21A8'
                                : '#475569',
                            border: member.role === 'SUPER_ADMIN' ? '1px solid #FCD34D' : 'none',
                          }}
                        >
                          {member.role === 'SUPER_ADMIN' && <Crown size={12} />}
                          {member.role}
                        </span>
                      </td>

                      {/* Subscription / Active */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: 6,
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              background:
                                member.subscription?.packageName?.toUpperCase().includes('GOLD')
                                  ? '#FEF3C7'
                                  : member.subscription?.packageName?.toUpperCase().includes('DIAMOND')
                                  ? '#E0F2FE'
                                  : member.subscription?.packageName?.toUpperCase().includes('SILVER')
                                  ? '#F1F5F9'
                                  : member.subscription?.packageName?.toUpperCase().includes('BRONZE')
                                  ? '#FFEDD5'
                                  : '#F8FAFC',
                              color:
                                member.subscription?.packageName?.toUpperCase().includes('GOLD')
                                  ? '#B45309'
                                  : member.subscription?.packageName?.toUpperCase().includes('DIAMOND')
                                  ? '#0369A1'
                                  : member.subscription?.packageName?.toUpperCase().includes('SILVER')
                                  ? '#475569'
                                  : member.subscription?.packageName?.toUpperCase().includes('BRONZE')
                                  ? '#C2410C'
                                  : '#64748B',
                              border: '1px solid rgba(0,0,0,0.06)',
                            }}
                          >
                            {member.subscription?.packageName || 'Free Explorer'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', marginTop: 4 }}>
                          <span style={{ color: member.isActive ? '#059669' : '#DC2626', fontWeight: 600 }}>
                            {member.isActive ? '● Active' : '● Suspended'}
                          </span>
                        </div>
                      </td>

                      {/* KYC Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background:
                              prof?.kycStatus === 'VERIFIED'
                                ? '#ECFDF5'
                                : prof?.kycStatus === 'PENDING'
                                ? '#FEF3C7'
                                : '#F1F5F9',
                            color:
                              prof?.kycStatus === 'VERIFIED'
                                ? '#065F46'
                                : prof?.kycStatus === 'PENDING'
                                ? '#92400E'
                                : '#64748B',
                          }}
                        >
                          {prof?.kycStatus === 'VERIFIED'
                            ? '✓ Verified'
                            : prof?.kycStatus === 'PENDING'
                            ? '⏳ Pending'
                            : 'Not Submitted'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedMember(member)}
                          className="btn-3d"
                          style={{
                            padding: '8px 14px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <Eye size={14} />
                          Inspect Profile
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredMembers.length > 0 && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--border-subtle)',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              fontSize: '0.8125rem',
            }}
          >
            <div style={{ color: 'var(--text-muted)' }}>
              Showing <strong>{(currentPage - 1) * PAGE_SIZE + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * PAGE_SIZE, filteredMembers.length)}</strong> of{' '}
              <strong>{filteredMembers.length}</strong> authentic profiles
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="btn-3d-secondary"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  opacity: currentPage === 1 ? 0.45 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                ← Previous
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      background: currentPage === pageNum ? 'var(--emerald-600)' : '#fff',
                      color: currentPage === pageNum ? '#fff' : 'var(--text-main)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn-3d-secondary"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  opacity: currentPage === totalPages ? 0.45 : 1,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Complete Member 85+ Attributes Details Modal */}
      {selectedMember && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedMember(null);
          }}
        >
          <div
            className="card-3d"
            style={{
              width: '100%',
              maxWidth: 840,
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '28px 30px',
              position: 'relative',
              background: '#fff',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '1.5px solid var(--border-medium)',
                paddingBottom: 16,
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background:
                      selectedMember.profile?.gender === 'FEMALE'
                        ? 'rgba(236, 72, 153, 0.12)'
                        : 'rgba(59, 130, 246, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem',
                  }}
                >
                  {selectedMember.profile?.gender === 'FEMALE' ? '🧕' : '👨‍💼'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      {selectedMember.profile?.fullName || selectedMember.email}
                    </h3>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        background: '#FEF3C7',
                        color: '#92400E',
                      }}
                    >
                      {selectedMember.role}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 12 }}>
                    <span>Profile ID: <strong>{selectedMember.profile?.profileId || 'N/A'}</strong></span>
                    <span>• {selectedMember.email}</span>
                    <span>• {selectedMember.phoneNumber}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 8,
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Quick Admin Role & Status Management Bar */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(245, 158, 11, 0.08))',
                border: '1.5px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 14,
                padding: '14px 18px',
                marginBottom: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Crown size={18} style={{ color: 'var(--gold-600)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Executive Seat Delegation:
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {/* Promote / Change Role */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Assign Role:</span>
                  <select
                    disabled={actionLoading}
                    value={selectedMember.role}
                    onChange={(e) => handleRoleChange(selectedMember.userId, e.target.value)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: '1px solid var(--border-medium)',
                      background: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="SUPER_ADMIN">👑 Promote to Super Admin</option>
                    <option value="MODERATOR">🛡️ Appoint Moderator</option>
                    <option value="EDITOR">✍️ Appoint Editor</option>
                    <option value="MEMBER">👤 Set as Member</option>
                  </select>
                </div>

                {/* Membership Tier Mode Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Grant Mode:</span>
                  <select
                    disabled={actionLoading}
                    value={
                      selectedMember.subscription?.packageName?.toUpperCase().includes('GOLD')
                        ? 'GOLD'
                        : selectedMember.subscription?.packageName?.toUpperCase().includes('BRONZE')
                        ? 'BRONZE'
                        : selectedMember.subscription?.packageName?.toUpperCase().includes('SILVER')
                        ? 'SILVER'
                        : selectedMember.subscription?.packageName?.toUpperCase().includes('DIAMOND')
                        ? 'DIAMOND'
                        : selectedMember.subscription?.packageName?.toUpperCase().includes('CONCIERGE') || selectedMember.subscription?.packageName?.toUpperCase().includes('ELITE')
                        ? 'ELITE'
                        : 'FREE'
                    }
                    onChange={(e) => handleTierChange(selectedMember.userId, e.target.value as any)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      border: '1.5px solid #F59E0B',
                      background: '#FFFBEB',
                      color: '#92400E',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="FREE">⚪ Free Explorer ($0)</option>
                    <option value="BRONZE">🥉 Bronze Mode</option>
                    <option value="SILVER">🥈 Silver Sunnah ($2,000)</option>
                    <option value="GOLD">🥇 Gold Barakah ($3,000)</option>
                    <option value="DIAMOND">💎 Diamond VIP ($4,000)</option>
                    <option value="ELITE">👑 Elite Concierge ($6,500)</option>
                  </select>
                </div>

                {/* KYC Approval */}
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    handleKycUpdate(
                      selectedMember.userId,
                      selectedMember.profile?.kycStatus === 'VERIFIED' ? 'PENDING' : 'VERIFIED'
                    )
                  }
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    border: 'none',
                    background: selectedMember.profile?.kycStatus === 'VERIFIED' ? '#FEE2E2' : '#D1FAE5',
                    color: selectedMember.profile?.kycStatus === 'VERIFIED' ? '#991B1B' : '#065F46',
                    cursor: 'pointer',
                  }}
                >
                  {selectedMember.profile?.kycStatus === 'VERIFIED' ? 'Revoke KYC' : '✓ Verify KYC'}
                </button>

                {/* Suspend / Activate */}
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleToggleActive(selectedMember.userId, selectedMember.isActive)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    border: 'none',
                    background: selectedMember.isActive ? '#FEE2E2' : '#E0E7FF',
                    color: selectedMember.isActive ? '#991B1B' : '#3730A3',
                    cursor: 'pointer',
                  }}
                >
                  {selectedMember.isActive ? 'Suspend User' : 'Reactivate User'}
                </button>
              </div>
            </div>

            {/* Modal Internal Tabs */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                borderBottom: '2px solid var(--border-subtle)',
                marginBottom: 20,
                overflowX: 'auto',
              }}
            >
              {[
                { id: 'islamic', label: '🕌 Islamic Practice' },
                { id: 'personal', label: '👤 Personal & Health' },
                { id: 'career', label: '🎓 Education & Career' },
                { id: 'guardian', label: '🛡️ Guardian / Wali Record' },
                { id: 'narrative', label: '📝 Narrative & Expectations' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setModalTab(tab.id as any)}
                  style={{
                    padding: '8px 14px',
                    border: 'none',
                    background: 'transparent',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    borderBottom: modalTab === tab.id ? '3px solid var(--emerald-600)' : '3px solid transparent',
                    color: modalTab === tab.id ? 'var(--emerald-800)' : 'var(--text-muted)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {selectedMember.profile ? (
              <div>
                {/* 1. Islamic Commitment */}
                {modalTab === 'islamic' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="card-3d" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prayer Frequency (Salah)</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        {selectedMember.profile.prayFrequency}
                      </div>
                    </div>
                    <div className="card-3d" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Halal Dietary Adherence</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        {selectedMember.profile.halalDiet}
                      </div>
                    </div>
                    <div className="card-3d" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hijab / Beard Modesty</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        {selectedMember.profile.wearsHijabOrBeard ? 'Yes (Practicing)' : 'No'}
                      </div>
                    </div>
                    <div className="card-3d" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sect & Mazhab School</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        {selectedMember.profile.sectMazhab}
                      </div>
                    </div>
                    <div className="card-3d" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Religiousness Self-Assessment</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        {selectedMember.profile.religiousness}
                      </div>
                    </div>
                    <div className="card-3d" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Smoking & Alcohol Consumption</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        Smoke: {selectedMember.profile.smoke} • Drink: {selectedMember.profile.drink}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Personal & Physical */}
                {modalTab === 'personal' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="card-3d" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Age & Date of Birth</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        {selectedMember.profile.age} Years ({selectedMember.profile.dateOfBirth})
                      </div>
                    </div>
                    <div className="card-3d" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Height & Weight</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        {selectedMember.profile.heightFeetInches} ({selectedMember.profile.heightCm} cm) • {selectedMember.profile.weightKg || 'N/A'} kg
                      </div>
                    </div>
                    <div className="card-3d" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Complexion & Body Type</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        {selectedMember.profile.complexion || 'Fair'} • {selectedMember.profile.bodyType || 'Average'}
                      </div>
                    </div>
                    <div className="card-3d" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Marital Status</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        {selectedMember.profile.maritalStatus}
                      </div>
                    </div>
                    <div className="card-3d" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Children Details</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        Children: {selectedMember.profile.haveChildren} ({selectedMember.profile.childLivingStatus})
                      </div>
                    </div>
                    <div className="card-3d" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Photo Modesty Policy</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        {selectedMember.profile.photoPrivacy === 'BLURRED_PURDAH' ? '🔒 24px Purdah Shield Active' : 'Public Avatar'}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Career, Education & Location */}
                {modalTab === 'career' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="card-3d" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Education Level</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        {selectedMember.profile.educationLevel}
                      </div>
                    </div>
                    <div className="card-3d" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Profession & Occupation</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        {selectedMember.profile.profession}
                      </div>
                    </div>
                    <div className="card-3d" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Annual Income Bracket</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        {selectedMember.profile.annualIncome || 'Undisclosed'}
                      </div>
                    </div>
                    <div className="card-3d" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location (City, State, Country)</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        {selectedMember.profile.city}, {selectedMember.profile.stateProvince}, {selectedMember.profile.countryLivingIn}
                      </div>
                    </div>
                    <div className="card-3d" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Residency / Visa Status</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        {selectedMember.profile.residingStatus}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Guardian & Family */}
                {modalTab === 'guardian' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="card-3d-gold" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gold-800)' }}>Wali / Guardian Name</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        {selectedMember.profile.guardianName}
                      </div>
                    </div>
                    <div className="card-3d-gold" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gold-800)' }}>Guardian Relationship</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        {selectedMember.profile.guardianRelation}
                      </div>
                    </div>
                    <div className="card-3d-gold" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gold-800)' }}>Guardian Contact Phone</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        {selectedMember.profile.guardianPhone}
                      </div>
                    </div>
                    <div className="card-3d" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Family Moral Values</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        {selectedMember.profile.familyValues}
                      </div>
                    </div>
                    <div className="card-3d" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Parents Status</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        Father: {selectedMember.profile.fatherStatus} • Mother: {selectedMember.profile.motherStatus}
                      </div>
                    </div>
                    <div className="card-3d" style={{ padding: 14 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Siblings Count</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        Brothers: {selectedMember.profile.brothersCount} • Sisters: {selectedMember.profile.sistersCount}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Narrative Bio */}
                {modalTab === 'narrative' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="card-3d" style={{ padding: 16 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 6 }}>
                        About Me:
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.6, margin: 0 }}>
                        {selectedMember.profile.aboutMe || 'No detailed narrative provided yet.'}
                      </p>
                    </div>

                    <div className="card-3d" style={{ padding: 16 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 6 }}>
                        What I Am Looking For in a Spouse:
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.6, margin: 0 }}>
                        {selectedMember.profile.whatIAmLookingFor || 'No specific preferences recorded.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                This user has not yet completed their full matrimonial biodata profile.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
