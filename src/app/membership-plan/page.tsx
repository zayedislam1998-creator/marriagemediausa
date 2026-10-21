import { AppHeader } from '@/components/layout/AppHeader';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { PricingSection } from '@/components/home/PricingSection';
import { Crown } from 'lucide-react';
import { getAllPackagesFromDb } from '@/db/queries';
import { connection } from 'next/server';

export const instant = false;

export default async function MembershipPlanPage() {
  await connection();
  const allPackages = await getAllPackagesFromDb().catch(() => []);
  const activePackages = allPackages.filter((p: any) => p.isActive);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <section style={{ background: 'linear-gradient(135deg, #064E3B, #0F172A)', paddingBlock: 'var(--space-3xl)', color: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', paddingInline: 'var(--space-lg)' }}>
          <span className="badge badge-gold" style={{ marginBottom: 12 }}>
            <Crown size={13} /> Membership plans
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, margin: '0 0 12px', fontFamily: 'var(--font-display)' }}>
            Membership Plan & Benefits
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.65, margin: 0 }}>
            Current plans, prices, duration, and features are loaded directly from the membership database.
          </p>
        </div>
      </section>
      <PricingSection packages={activePackages} />
      <Footer />
      <BottomNav />
    </div>
  );
}
