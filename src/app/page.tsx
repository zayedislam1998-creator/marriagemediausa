import { DomainRepository } from '@/db/repository';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';

// 14 Core Authentic Production Sections
import { HeroSearch } from '@/components/home/HeroSearch';
import { VitalCounters } from '@/components/home/VitalCounters';
import { StepsToNikkah } from '@/components/home/StepsToNikkah';
import { ProfileCardsStream } from '@/components/home/ProfileCardsStream';
import { UsDiasporaSpotlight } from '@/components/home/UsDiasporaSpotlight';
import { WhyHalalGrid } from '@/components/home/WhyHalalGrid';
import { SoulDiscoveryQuiz } from '@/components/home/SoulDiscoveryQuiz';
import { SuccessStoriesWall } from '@/components/home/SuccessStoriesWall';
import { PricingSection } from '@/components/home/PricingSection';
import { SeoDirectoryMatrix } from '@/components/home/SeoDirectoryMatrix';
import { IslamicAdviceHub } from '@/components/home/IslamicAdviceHub';
import { TrustSafetyFaq } from '@/components/home/TrustSafetyFaq';

export default function HomePage() {
  const countries = DomainRepository.getCountries();
  const usStates = DomainRepository.getUSStates();
  const professions = DomainRepository.getProfessions();
  const packages = DomainRepository.getPackages();
  const profiles = DomainRepository.getProfiles();

  return (
    <div className="page-main" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-app)' }}>
      {/* 1. Top Navigation Bar (Logo, USD, US States, Stories, Pricing, Login, CTA) */}
      <AppHeader />

      {/* 2. Hero Section & Fast Search Matrix with Dual Filter Tabs (Bride / Groom) */}
      <HeroSearch
        countries={countries}
        usStates={usStates}
        professions={professions}
      />

      {/* 3. Live Platform Vital Counters (15,420+ Members, Online, Grooms, Brides, Nikkahs) */}
      <VitalCounters />

      {/* 4. 3 Simple Steps to Blessed Nikkah (Verified Biodata -> Wali Involved -> Engaged / Nikkah) */}
      <StepsToNikkah />

      {/* 5. Featured Verified Profiles Stream (with Compatibility Ring & Purdah Shield) */}
      <ProfileCardsStream profiles={profiles} />

      {/* 6. US Diaspora Spotlight Grid (New York, Texas, California, Chicago, DMV, Florida) */}
      <UsDiasporaSpotlight />

      {/* 7. "Why Marriage Media USA" Halal Ethics Value Grid (Wali Involve, Purdah, KYC, Zero Latency) */}
      <WhyHalalGrid />

      {/* 8. Interactive Soul Discovery Quiz Widget (4-Question Compatibility Matchmaker Slider) */}
      <SoulDiscoveryQuiz />

      {/* 9. Real Couples Success Stories Wall (Photo & Video Testimonials) */}
      <SuccessStoriesWall />

      {/* 10. Transparent Membership Packages ($0, $2,000, $3,000, $4,000, $6,500) */}
      <PricingSection packages={packages} />

      {/* 11. SEO Deep Directory Matrix (By Profession, Mother Tongue, US City, Sect) */}
      <SeoDirectoryMatrix />

      {/* 12. Islamic Pre-Marital Advice Hub (Rights of Spouses, Mahr, Wali Guidelines) */}
      <IslamicAdviceHub />

      {/* 13. Trust, Safety, Anti-Fraud & FAQ Accordion (100% ID Verified & Safe Matrimony Guarantee) */}
      <TrustSafetyFaq />

      {/* 14. 4-Column Global Footer + Sticky Mobile App Bottom Bar (< 768px) */}
      <Footer />
      <BottomNav />
    </div>
  );
}
