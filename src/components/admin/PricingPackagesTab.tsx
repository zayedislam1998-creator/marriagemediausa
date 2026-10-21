'use client';

import React, { useState } from 'react';
import {
  Award,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Save,
  Sparkles,
  Coins,
  Eye,
  Shield,
  Clock,
  X,
  Check,
} from 'lucide-react';
import {
  adminCreatePackageAction,
  adminUpdatePackageAction,
  adminTogglePackageAction,
  adminDeletePackageAction,
} from '@/lib/admin/packageActions';
import { broadcastSyncEvent, useCrossTabSync } from '@/lib/sync/broadcastSync';

interface PricingPackagesTabProps {
  initialPackages: any[];
}

export function PricingPackagesTab({ initialPackages }: PricingPackagesTabProps) {
  const [pkgList, setPkgList] = useState<any[]>(initialPackages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<any | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  React.useEffect(() => {
    fetch('/api/packages?includeInactive=1', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.packages)) {
          setPkgList(data.packages);
        }
      })
      .catch((e) => console.error('Error fetching live packages in admin:', e));
  }, []);

  // Modal Form State
  const [name, setName] = useState('');
  const [priceUsd, setPriceUsd] = useState('');
  const [durationMonths, setDurationMonths] = useState('3');
  const [contactCredits, setContactCredits] = useState('50');
  const [dailyProfileViewLimit, setDailyProfileViewLimit] = useState('100');
  const [badgeTitle, setBadgeTitle] = useState('Gold Member');
  const [featuresList, setFeaturesList] = useState<string[]>([
    'Verified Profile Badge',
    'Direct Guardian (Wali) Contact Unlock',
    'Purdah Photo Privacy Shield',
    'Encrypted Direct Matrimonial Chat',
  ]);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [saving, setSaving] = useState(false);
  const refreshPackages = async () => {
    const res = await fetch('/api/packages?includeInactive=1', { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok || !data.success || !Array.isArray(data.packages)) throw new Error(data.error || 'Could not load packages from the database.');
    setPkgList(data.packages);
  };

  // Cross-Tab Reactivity
  useCrossTabSync((msg) => {
    if (msg.type === 'PACKAGE_UPDATED') {
      refreshPackages().catch((error) => setStatusMsg({ text: error.message, isError: true }));
    }
  }, ['PACKAGE_UPDATED']);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingPkg(null);
    setName('');
    setPriceUsd('49');
    setDurationMonths('3');
    setContactCredits('50');
    setDailyProfileViewLimit('100');
    setBadgeTitle('Member');
    setFeaturesList([
      'Verified Profile Badge',
      'Direct Guardian (Wali) Contact Unlock',
      'Purdah Photo Privacy Shield',
      'Encrypted Direct Matrimonial Chat',
    ]);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (pkg: any) => {
    setEditingPkg(pkg);
    setName(pkg.name);
    setPriceUsd((pkg.price_usd ?? pkg.priceUsd ?? 0).toString());
    setDurationMonths((pkg.duration_months ?? pkg.durationMonths ?? 1).toString());
    setContactCredits((pkg.contact_credits ?? pkg.contactCredits ?? 0).toString());
    setDailyProfileViewLimit((pkg.daily_profile_view_limit ?? pkg.dailyProfileViewLimit ?? 10).toString());
    setBadgeTitle(pkg.badge_title ?? pkg.badgeTitle ?? 'Member');
    const feats = pkg.features ?? pkg.featuresJson ?? [];
    setFeaturesList(Array.isArray(feats) ? feats : []);
    setIsModalOpen(true);
  };

  // Handle Save (Create or Update)
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('priceUsd', priceUsd);
    formData.append('durationMonths', durationMonths);
    formData.append('contactCredits', contactCredits);
    formData.append('dailyProfileViewLimit', dailyProfileViewLimit);
    formData.append('badgeTitle', badgeTitle);
    formData.append('features', featuresList.join('\n'));

    try {
      if (editingPkg) {
        const res = await adminUpdatePackageAction(Number(editingPkg.id), formData);
        if (res.success && res.package) {
          setPkgList((prev) =>
            prev.map((p) =>
              p.id === editingPkg.id
                ? {
                    ...p,
                    name: res.package!.name,
                    price_usd: parseFloat(res.package!.priceUsd),
                    priceUsd: parseFloat(res.package!.priceUsd),
                    duration_months: res.package!.durationMonths,
                    durationMonths: res.package!.durationMonths,
                    contact_credits: res.package!.contactCredits,
                    contactCredits: res.package!.contactCredits,
                    daily_profile_view_limit: res.package!.dailyProfileViewLimit,
                    dailyProfileViewLimit: res.package!.dailyProfileViewLimit,
                    badge_title: res.package!.badgeTitle,
                    badgeTitle: res.package!.badgeTitle,
                    features: res.package!.featuresJson || [],
                  }
                : p
            )
          );
          setStatusMsg({ text: `✓ Package "${name}" updated successfully!`, isError: false });
          broadcastSyncEvent('PACKAGE_UPDATED', { packageId: editingPkg.id, price: priceUsd });
        }
      } else {
        const res = await adminCreatePackageAction(null, formData);
        if (res.success && res.package) {
          setPkgList((prev) => [
            ...prev,
            {
              id: res.package!.id,
              name: res.package!.name,
              price_usd: parseFloat(res.package!.priceUsd),
              priceUsd: parseFloat(res.package!.priceUsd),
              duration_months: res.package!.durationMonths,
              durationMonths: res.package!.durationMonths,
              contact_credits: res.package!.contactCredits,
              contactCredits: res.package!.contactCredits,
              daily_profile_view_limit: res.package!.dailyProfileViewLimit,
              dailyProfileViewLimit: res.package!.dailyProfileViewLimit,
              badge_title: res.package!.badgeTitle,
              badgeTitle: res.package!.badgeTitle,
              features: res.package!.featuresJson || [],
              isActive: true,
            },
          ]);
          setStatusMsg({ text: `✓ New package "${name}" created successfully!`, isError: false });
          broadcastSyncEvent('PACKAGE_UPDATED', { price: priceUsd });
        }
      }

      setIsModalOpen(false);
      setTimeout(() => setStatusMsg(null), 3500);
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Error saving package', isError: true });
    } finally {
      setSaving(false);
    }
  };

  // Toggle Active
  const handleToggle = async (pkgId: number, currentStatus: boolean) => {
    const res = await adminTogglePackageAction(pkgId, !currentStatus);
    if (res.success) {
      setPkgList((prev) =>
        prev.map((p) => (p.id === pkgId ? { ...p, isActive: !currentStatus } : p))
      );
      broadcastSyncEvent('PACKAGE_UPDATED', { packageId: pkgId });
      await refreshPackages();
    }
  };

  // Delete Package
  const handleDelete = async (pkgId: number) => {
    if (!confirm('Are you sure you want to remove this package?')) return;
    const res = await adminDeletePackageAction(pkgId);
    if (res.success) {
      setPkgList((prev) => prev.filter((p) => p.id !== pkgId));
      broadcastSyncEvent('PACKAGE_UPDATED', { packageId: pkgId });
      await refreshPackages();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Bar */}
      <div
        className="card-3d"
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.4rem' }}>💎</span>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Pricing & Membership Packages
            </h2>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Manage authentic matrimonial packages, contact unlock credits, and duration options with instant reactivity.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={openCreateModal}
            className="btn-3d"
            style={{ fontSize: '0.85rem', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} /> Create New Package
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 12,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: statusMsg.isError ? '#FEF2F2' : '#ECFDF5',
            color: statusMsg.isError ? '#B91C1C' : '#047857',
            border: `1px solid ${statusMsg.isError ? '#FCA5A5' : '#A7F3D0'}`,
          }}
        >
          {statusMsg.isError ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {statusMsg.text}
        </div>
      )}

      {/* 2. Packages Grid inside Smooth Internal Scroll Container */}
      <div
        style={{
          maxHeight: 'calc(100vh - 230px)',
          overflowY: 'auto',
          paddingRight: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
          {pkgList.map((pkg, idx) => {
            const price = pkg.price_usd ?? pkg.priceUsd ?? 0;
            const duration = pkg.duration_months ?? pkg.durationMonths ?? 1;
            const credits = pkg.contact_credits ?? pkg.contactCredits ?? 0;
            const views = pkg.daily_profile_view_limit ?? pkg.dailyProfileViewLimit ?? 10;
            const badge = pkg.badge_title ?? pkg.badgeTitle ?? 'Member';
            const feats = pkg.features ?? pkg.featuresJson ?? [];
            const isActive = pkg.isActive !== false;

            return (
              <div
                key={pkg.id || idx}
                className="card-3d"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 16,
                  opacity: isActive ? 1 : 0.65,
                  position: 'relative',
                }}
              >
                <div>
                  {/* Package Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="badge-3d" style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                        {badge}
                      </span>
                      {!isActive && (
                        <span style={{ fontSize: '0.68rem', color: '#DC2626', fontWeight: 700 }}>
                          Paused
                        </span>
                      )}
                    </div>

                  </div>

                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {pkg.name}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '8px 0 14px 0' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--emerald-600)' }}>
                      ${price}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      / {duration} {duration === 1 ? 'Month' : 'Months'}
                    </span>
                  </div>

                  {/* Quotas */}
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      marginBottom: 14,
                    }}
                  >
                    <span>{credits} Contact Credits</span>
                    <span>{views} Daily Views</span>
                  </div>

                  {/* Features List */}
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {feats.map((feat: string, fIdx: number) => (
                      <li key={fIdx} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Check size={13} color="var(--emerald-600)" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
                  <button
                    type="button"
                    onClick={() => openEditModal(pkg)}
                    className="btn-3d-secondary"
                    style={{ flex: 1, fontSize: '0.75rem', padding: '7px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                  >
                    <Edit3 size={13} /> Edit Package
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle(pkg.id, isActive)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: 8,
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: '#FFF',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: isActive ? '#D97706' : '#059669',
                    }}
                    title={isActive ? 'Pause Package' : 'Activate Package'}
                  >
                    {isActive ? 'Pause' : 'Activate'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(pkg.id)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: 8,
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      color: '#DC2626',
                      cursor: 'pointer',
                    }}
                    title="Delete Package"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Create / Edit Package Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 22px',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Award size={20} color="#10B981" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC' }}>
                  {editingPkg ? `Edit Package: ${editingPkg.name}` : 'Create New Membership Package'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSavePackage} style={{ padding: '22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Package Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Gold Shield VIP"
                    className="input-field"
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Price in USD ($) *</label>
                  <input
                    type="number"
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(e.target.value)}
                    placeholder="e.g. 3000"
                    className="input-field"
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Duration (Months) *</label>
                  <select
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                    className="input-field"
                    style={inputStyle}
                  >
                    <option value="1">1 Month</option>
                    <option value="2">2 Months</option>
                    <option value="3">3 Months (Standard)</option>
                    <option value="6">6 Months (Popular)</option>
                    <option value="12">12 Months (1 Year VIP)</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Badge Title</label>
                  <input
                    type="text"
                    value={badgeTitle}
                    onChange={(e) => setBadgeTitle(e.target.value)}
                    placeholder="e.g. Gold Member"
                    className="input-field"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Contact Unlock Credits</label>
                  <input
                    type="number"
                    value={contactCredits}
                    onChange={(e) => setContactCredits(e.target.value)}
                    className="input-field"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Daily Profile View Limit</label>
                  <input
                    type="number"
                    value={dailyProfileViewLimit}
                    onChange={(e) => setDailyProfileViewLimit(e.target.value)}
                    className="input-field"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Feature Checklist */}
              <div>
                <label style={labelStyle}>Included Features Checklist</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '180px', overflowY: 'auto' }}>
                  {featuresList.map((feat, fIdx) => (
                    <div
                      key={fIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: 8,
                        backgroundColor: '#F8FAFC',
                        fontSize: '0.8rem',
                      }}
                    >
                      <span>✓ {feat}</span>
                      <button
                        type="button"
                        onClick={() => setFeaturesList((prev) => prev.filter((_, i) => i !== fIdx))}
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    placeholder="Add custom feature..."
                    style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newFeatureText.trim()) {
                        setFeaturesList((prev) => [...prev, newFeatureText.trim()]);
                        setNewFeatureText('');
                      }
                    }}
                    className="btn-3d-secondary"
                    style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-3d-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-3d"
                  style={{ padding: '8px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: 'var(--text-main)',
  marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 8,
  fontSize: '0.825rem',
};
