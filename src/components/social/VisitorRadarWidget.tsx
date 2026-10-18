'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, ShieldCheck, Heart, Sparkles, MapPin, Briefcase, ArrowRight, UserCheck } from 'lucide-react';
import { ProfileVisitor, VisitorRadarService } from '@/lib/social/radar';

interface VisitorRadarWidgetProps {
  initialVisitors?: ProfileVisitor[];
}

export function VisitorRadarWidget({ initialVisitors }: VisitorRadarWidgetProps) {
  const [visitors, setVisitors] = useState<ProfileVisitor[]>(
    initialVisitors || VisitorRadarService.getVisitors()
  );

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-xl)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-md)',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 'var(--space-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--sapphire-50)',
              color: 'var(--sapphire-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Eye size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              👀 Who Viewed My Profile (Visitor Radar)
            </h3>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              Verified suitors who explored your biodata recently
            </div>
          </div>
        </div>

        <span className="badge badge-sapphire" style={{ fontSize: '0.6875rem' }}>
          {visitors.length} Recent Visitors
        </span>
      </div>

      {/* Visitor List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {visitors.map((v) => (
          <div
            key={v.id}
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              transition: 'background 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  background: '#E2E8F0',
                  flexShrink: 0,
                }}
              >
                <img
                  src={v.visitorPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                  alt={v.visitorName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                    {v.visitorName}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ({v.visitorAge} yrs)
                  </span>
                  {v.isVerified && (
                    <span className="badge badge-emerald" style={{ fontSize: '0.625rem', padding: '1px 6px' }}>
                      ✓ Verified
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-body)', marginTop: 2 }}>
                  {v.visitorProfession} • {v.visitorLocation}
                </div>

                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  🛡️ {v.visitorResidency} • Viewed {v.viewedAt}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-emerald" style={{ fontWeight: 700, fontSize: '0.75rem' }}>
                {v.compatibilityScore}% Match
              </span>

              <Link
                href={`/search`}
                className="btn btn-outline btn-sm"
                style={{ padding: '6px 12px' }}
              >
                Inspect Suitor
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
