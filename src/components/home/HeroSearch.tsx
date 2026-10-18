'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Sparkles,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Heart,
  UserPlus,
} from 'lucide-react';
import { Country, USState } from '@/db/repository';

interface HeroSearchProps {
  countries: Country[];
  usStates: USState[];
  professions: string[];
  onSearch?: (criteria: any) => void;
}

const HERO_SLIDES = [
  {
    id: 1,
    image: '/images/slider/Marriage_Muslim.webp',
    badge: '☪ #1 Worldwide Halal Matrimonial & Matchmaking Site',
    title: 'Are You Waiting For Someone Special?',
    highlight: 'Complete Half Your Deen With Barakah',
    subtitle:
      'Connecting practicing Muslim brides and grooms across the USA, Bangladesh, UK, Canada, and worldwide with 10-Level Profile Verification and verified family Walis.',
    cardHeading: 'Begin Your Sacred Journey',
    cardSubtext: 'Over 15,420+ practicing Muslim singles seeking pious life partners for Sunnah Nikkah.',
    stats: '15,420+ Active Biodatas',
    bismillahText: 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    bismillahFont: 'var(--font-arabic-ruqaa)',
    bismillahStyleName: "Royal Ruq'ah Calligraphy",
    bismillahSize: 'clamp(1.4rem, 2.2vw, 1.85rem)',
    bismillahWeight: 700,
  },
  {
    id: 2,
    image: '/images/slider/Bride.webp',
    badge: '💍 Dignified Sunnah-Compliant Matchmaking',
    title: 'My Husband Is My First Love',
    highlight: 'And My Only Forever Companion',
    subtitle:
      'Protected by our Purdah Photo Privacy Shield and mandatory Guardian (Wali) verification. Experience safe, honorable Islamic matrimony.',
    cardHeading: '100% Halal & Guardian Verified',
    cardSubtext: 'Strict Purdah photo privacy with direct Wali/Guardian oversight for all sisters.',
    stats: '100% Wali Verified',
    bismillahText: 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ',
    bismillahFont: 'var(--font-arabic-naskh)',
    bismillahStyleName: 'Sacred Quranic Naskh',
    bismillahSize: 'clamp(1.45rem, 2.3vw, 1.95rem)',
    bismillahWeight: 700,
  },
  {
    id: 3,
    image: '/images/slider/LOVE-love.webp',
    badge: '🌟 Trusted by Thousands of Muslim Families',
    title: 'I Love My Wife & Would Do Anything For Her',
    highlight: 'Where Two Families Unite in Faith',
    subtitle:
      'From Doctors, Engineers, and IT Professionals to Islamic Scholars—find your ideal life partner by profession, mother tongue, city, or country.',
    cardHeading: 'Educated & Pious Matches',
    cardSubtext: 'Physicians, Tech Leaders, Scholars & Entrepreneurs across US diaspora & abroad.',
    stats: '3,890+ Blessed Nikkahs',
    bismillahText: 'بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيْمِ',
    bismillahFont: 'var(--font-arabic-nastaliq)',
    bismillahStyleName: "Cascading Nasta'liq Script",
    bismillahSize: 'clamp(1.45rem, 2.3vw, 1.95rem)',
    bismillahWeight: 400,
  },
  {
    id: 4,
    image: '/images/slider/wedding.webp',
    badge: '🛡️ World’s Highest 10-Level Profile Verification',
    title: '100% Free Registration & Verified Biodatas',
    highlight: 'No Gimmicks • Genuine Marriage Intentions',
    subtitle:
      'Every profile is screened across Name, Parent/Wali, Photograph, National ID/Passport, Education, and Profession for complete peace of mind.',
    cardHeading: 'Zero Fake Profiles Guaranteed',
    cardSubtext: 'Authentic 10-stage human KYC verification before any biodata goes public.',
    stats: 'Strict 10-Level KYC',
    bismillahText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    bismillahFont: 'var(--font-arabic-kufi)',
    bismillahStyleName: 'Monumental Kufic Script',
    bismillahSize: 'clamp(1.35rem, 2.1vw, 1.75rem)',
    bismillahWeight: 700,
  },
  {
    id: 5,
    image: '/images/slider/bride_b.webp',
    badge: '✨ Gateway to Happy Islamic Marriages',
    title: 'Love Is A Universal Blessing',
    highlight: 'Experienced Through Sacred Halal Nikkah',
    subtitle:
      'Join MarriageMediaUSA.com today for free, create your 85+ field Islamic biodata, and express interest to verified suitors worldwide.',
    cardHeading: 'Gateway to Happy Marriages',
    cardSubtext: 'Create your comprehensive 85+ field Islamic biodata in under 3 minutes for free.',
    stats: '100% Free Lifetime',
    bismillahText: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
    bismillahFont: 'var(--font-arabic-thuluth)',
    bismillahStyleName: 'Grand Thuluth Scripture',
    bismillahSize: 'clamp(1.45rem, 2.3vw, 1.95rem)',
    bismillahWeight: 700,
  },
];

const MOTHER_TONGUES = [
  'All Languages',
  'Bengali',
  'English',
  'Arabic',
  'Urdu',
  'Hindi',
  'Punjabi',
  'Gujarati',
  'Spanish',
  'Kashmiri',
  'Tamil',
  'Telugu',
  'Malayalam',
  'Marathi',
];

export function HeroSearch({ countries, usStates, professions, onSearch }: HeroSearchProps) {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const [lookingFor, setLookingFor] = useState<'FEMALE' | 'MALE'>('FEMALE');
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(35);
  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const [selectedLanguage, setSelectedLanguage] = useState('All Languages');
  const [selectedProfession, setSelectedProfession] = useState('All');
  const [profileIdQuery, setProfileIdQuery] = useState('');

  // Auto-advance hero slider every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileIdQuery.trim()) {
      router.push(`/profile/${profileIdQuery.trim()}`);
      return;
    }
    if (onSearch) {
      onSearch({
        gender: lookingFor,
        minAge,
        maxAge,
        country: selectedCountry,
        language: selectedLanguage,
        profession: selectedProfession,
      });
    }
    const targetElement = document.getElementById('profiles-stream');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/search');
    }
  };

  const currentSlide = HERO_SLIDES[activeSlide];

  return (
    <section
      id="search"
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #0f172a 0%, #f1f5f9 100%)',
        paddingBottom: '3rem',
      }}
    >
      {/* ============================================================
          1. FULL-WIDTH 5-SLIDE REVOLUTION HERO CAROUSEL
         ============================================================ */}
      <div
        className="hero-carousel-container"
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.35)',
        }}
      >
        {HERO_SLIDES.map((slide, index) => {
          const isCurrent = index === activeSlide;
          return (
            <div
              key={slide.id}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: isCurrent ? 1 : 0,
                transform: isCurrent ? 'scale(1.03)' : 'scale(1)',
                transition: 'opacity 0.9s ease-in-out, transform 6s ease-out',
                pointerEvents: isCurrent ? 'auto' : 'none',
                zIndex: isCurrent ? 2 : 1,
              }}
            >
              {/* Slide Background Image from live marriagemediausa.com */}
              <img
                src={slide.image}
                alt={slide.title}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "low"}
                decoding={index === 0 ? "sync" : "async"}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center center',
                  filter: 'brightness(0.72) contrast(1.1)',
                }}
              />

              {/* Multi-layered 3D Luxury Gradient Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(95deg, rgba(2, 6, 23, 0.9) 0%, rgba(6, 78, 59, 0.76) 52%, rgba(15, 23, 42, 0.5) 100%)',
                }}
              />
            </div>
          );
        })}

        {/* Hero Slide Foreground 2-Column Responsive Content with Centered Calligraphy */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: 'var(--max-content-width)',
            width: '100%',
            margin: '0 auto',
            paddingInline: '1.5rem',
            paddingTop: '1.25rem',
            paddingBottom: '5.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* ============================================================
              CENTERED ROYAL GOLDEN ARABIC BISMILLAH CALLIGRAPHY
             ============================================================ */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '1rem',
              overflow: 'visible',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`bismillah-calligraphy-${activeSlide}`}
                initial={{ opacity: 0, y: -14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96, transition: { duration: 0.24, ease: 'easeOut' } }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '14px',
                  padding: '2px 20px',
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                {/* Left Golden Ornamental Star */}
                <span
                  style={{
                    color: '#F59E0B',
                    fontSize: '1.05rem',
                    lineHeight: 1,
                    filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.75))',
                    userSelect: 'none',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  ✦
                </span>

                {/* Golden Arabic Calligraphy Text (Spacious line-height & vertical padding completely prevents clipping) */}
                <span
                  style={{
                    display: 'inline-block',
                    fontFamily: currentSlide.bismillahFont,
                    fontSize: currentSlide.bismillahSize,
                    fontWeight: currentSlide.bismillahWeight,
                    lineHeight: 1.85,
                    direction: 'rtl',
                    textAlign: 'center',
                    background:
                      'linear-gradient(135deg, #FFFBEB 0%, #FEF08A 20%, #F59E0B 48%, #D97706 75%, #FDE047 92%, #FFFBEB 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    color: '#FDE047',
                    filter:
                      'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 16px rgba(245, 158, 11, 0.55))',
                    letterSpacing: currentSlide.bismillahFont.includes('Kufi') ? '0.03em' : 'normal',
                    paddingInline: '10px',
                    paddingBlock: '12px',
                    overflow: 'visible',
                    userSelect: 'none',
                  }}
                  title={currentSlide.bismillahStyleName}
                >
                  {currentSlide.bismillahText}
                </span>

                {/* Right Golden Ornamental Star */}
                <span
                  style={{
                    color: '#F59E0B',
                    fontSize: '1.05rem',
                    lineHeight: 1,
                    filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.75))',
                    userSelect: 'none',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  ✦
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`slide-container-${activeSlide}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.28, ease: 'easeOut' } }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.28fr) minmax(320px, 420px)',
                gap: '2.5rem',
                alignItems: 'center',
                width: '100%',
              }}
              className="hero-grid-layout"
            >
              {/* LEFT COLUMN: Framer Motion Staggered Sequential Lines */}
              <div
                className="hero-left-col"
                style={{
                  maxWidth: 720,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                {/* Main Slide Title */}
                <motion.h1
                  initial={
                    activeSlide % 3 === 0
                      ? { opacity: 0, x: -65 }
                      : activeSlide % 3 === 1
                      ? { opacity: 0, y: 45 }
                      : { opacity: 0, x: -45, y: 30 }
                  }
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.75, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontSize: 'clamp(2.1rem, 4.2vw, 3.4rem)',
                    fontWeight: 900,
                    color: '#ffffff',
                    lineHeight: 1.15,
                    marginBottom: 12,
                    textShadow: '0 6px 24px rgba(0, 0, 0, 0.75)',
                  }}
                >
                  {currentSlide.title}
                  <motion.span
                    initial={
                      activeSlide % 3 === 0
                        ? { opacity: 0, x: -55 }
                        : activeSlide % 3 === 1
                        ? { opacity: 0, y: 40 }
                        : { opacity: 0, x: -35, y: 25 }
                    }
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.75, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      display: 'block',
                      background: 'linear-gradient(90deg, #34d399 0%, #fbbf24 55%, #fb7185 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      marginTop: 6,
                    }}
                  >
                    {currentSlide.highlight}
                  </motion.span>
                </motion.h1>

                {/* 3. Subtitle / Description */}
                <motion.p
                  initial={
                    activeSlide % 3 === 0
                      ? { opacity: 0, x: -45 }
                      : activeSlide % 3 === 1
                      ? { opacity: 0, y: 35 }
                      : { opacity: 0, x: -30, y: 20 }
                  }
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.75, delay: 0.46, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontSize: 'clamp(0.95rem, 1.7vw, 1.125rem)',
                    color: '#e2e8f0',
                    lineHeight: 1.65,
                    maxWidth: 620,
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.65)',
                  }}
                >
                  {currentSlide.subtitle}
                </motion.p>
              </div>

              {/* RIGHT COLUMN: 3D Luxury Action Box with Framer Motion Entrance */}
              <motion.div
                initial={
                  activeSlide % 3 === 0
                    ? { opacity: 0, x: 75 }
                    : activeSlide % 3 === 1
                    ? { opacity: 0, y: 50, scale: 0.94 }
                    : { opacity: 0, x: 50, y: -30 }
                }
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                transition={{ duration: 0.75, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="hero-action-card-3d"
                style={{
                  width: '100%',
                }}
              >
                {/* 1. Dynamic Glowing Badge (Moved from top left of text into this 3D box) */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 15px',
                    borderRadius: 999,
                    background: 'rgba(16, 185, 129, 0.22)',
                    border: '1.5px solid rgba(52, 211, 153, 0.65)',
                    backdropFilter: 'blur(12px)',
                    color: '#ecfdf5',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    marginBottom: 14,
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <Sparkles size={14} style={{ color: '#fbbf24', flexShrink: 0 }} />
                  <span>{currentSlide.badge}</span>
                </div>

                {/* 2. Slide-Specific Heading & Short Description */}
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    color: '#ffffff',
                    lineHeight: 1.3,
                    marginBottom: 6,
                  }}
                >
                  {currentSlide.cardHeading}
                </h2>
                <p
                  style={{
                    fontSize: '0.835rem',
                    color: '#cbd5e1',
                    lineHeight: 1.55,
                    marginBottom: 18,
                  }}
                >
                  {currentSlide.cardSubtext}
                </p>

                {/* 3. Stacked 3D Action Buttons in Serial Order (Top one, then Bottom one) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Button 1: FREE Registration Now (Top) */}
                  <Link
                    href="/register"
                    className="btn-3d-crimson"
                    style={{
                      width: '100%',
                      fontSize: '0.95rem',
                      padding: '13px 22px',
                      borderRadius: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      boxShadow: '0 8px 24px rgba(225, 29, 72, 0.45)',
                    }}
                  >
                    <UserPlus size={19} />
                    FREE Registration Now
                  </Link>

                  {/* Button 2: Browse Verified Profiles (Bottom) */}
                  <Link
                    href="/search"
                    className="btn-3d-emerald"
                    style={{
                      width: '100%',
                      fontSize: '0.95rem',
                      padding: '13px 22px',
                      borderRadius: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      boxShadow: '0 8px 24px rgba(5, 150, 105, 0.45)',
                    }}
                  >
                    <Search size={19} />
                    Browse Verified Profiles
                  </Link>
                </div>

                {/* 4. 10-Level Profile Verification & Trust Footer */}
                <Link
                  href="/how-it-works"
                  style={{
                    marginTop: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <ShieldCheck size={17} style={{ color: '#fbbf24', flexShrink: 0 }} />
                    <span>10-Level Verification</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: '#34d399',
                      background: 'rgba(52, 211, 153, 0.18)',
                      border: '1px solid rgba(52, 211, 153, 0.35)',
                      padding: '2px 8px',
                      borderRadius: 999,
                      fontWeight: 800,
                    }}
                  >
                    {currentSlide.stats}
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Left / Right 3D Slider Controls */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="hero-carousel-arrow hero-carousel-arrow-prev"
          style={{
            position: 'absolute',
            left: 18,
            top: '45%',
            transform: 'translateY(-50%)',
            zIndex: 25,
            width: 46,
            height: 46,
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            color: '#ffffff',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
          }}
        >
          <ChevronLeft size={24} />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next Slide"
          className="hero-carousel-arrow hero-carousel-arrow-next"
          style={{
            position: 'absolute',
            right: 18,
            top: '45%',
            transform: 'translateY(-50%)',
            zIndex: 25,
            width: 46,
            height: 46,
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            color: '#ffffff',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
          }}
        >
          <ChevronRight size={24} />
        </button>

        {/* Slide Indicator Dots */}
        <div
          style={{
            position: 'absolute',
            bottom: 74,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            display: 'flex',
            gap: 10,
            background: 'rgba(15, 23, 42, 0.65)',
            padding: '6px 14px',
            borderRadius: 999,
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.25)',
          }}
        >
          {HERO_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
              style={{
                width: idx === activeSlide ? 28 : 10,
                height: 10,
                borderRadius: 999,
                background: idx === activeSlide ? '#10b981' : 'rgba(255,255,255,0.45)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* ============================================================
          2. 3D FLOATING ADVANCED PARTNER SEARCH CONSOLE
         ============================================================ */}
      <div
        className="hero-search-floating-wrapper"
        style={{
          maxWidth: 1180,
          margin: '-42px auto 0',
          paddingInline: '1.25rem',
          position: 'relative',
          zIndex: 30,
        }}
      >
        <form
          onSubmit={handleSearchClick}
          className="card-3d hero-search-form"
          style={{
            padding: '1.5rem 1.75rem',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            border: '2px solid rgba(5, 150, 105, 0.35)',
            boxShadow:
              '0 28px 60px -12px rgba(15, 23, 42, 0.28), 0 8px 0 0 #059669, inset 0 2px 0 #ffffff',
          }}
        >
          {/* Top Bar of Search Console */}
          <div
            className="hero-search-topbar"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: '1.1rem',
              paddingBottom: '0.85rem',
              borderBottom: '1.5px solid #e2e8f0',
            }}
          >
            <div className="hero-search-gender-group" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#0f172a' }}>
                🔍 Looking For:
              </span>
              <div className="hero-search-gender-btns" style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setLookingFor('FEMALE')}
                  className={lookingFor === 'FEMALE' ? 'btn-3d-emerald' : 'btn btn-ghost btn-sm'}
                  style={{ padding: '7px 16px', fontSize: '0.8125rem' }}
                >
                  🧕 Bride (Female)
                </button>
                <button
                  type="button"
                  onClick={() => setLookingFor('MALE')}
                  className={lookingFor === 'MALE' ? 'btn-3d-emerald' : 'btn btn-ghost btn-sm'}
                  style={{ padding: '7px 16px', fontSize: '0.8125rem' }}
                >
                  👨 Groom (Male)
                </button>
              </div>
            </div>

            {/* Direct Profile ID Search Box (From live marriagemediausa.com) */}
            <div className="hero-search-id-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="text"
                value={profileIdQuery}
                onChange={(e) => setProfileIdQuery(e.target.value)}
                placeholder="Search by Profile ID (e.g. 2020097159)"
                className="input-3d"
                style={{ width: 245, padding: '6px 12px', fontSize: '0.78rem' }}
              />
              <span className="badge badge-sapphire" style={{ padding: '5px 10px' }}>
                <UserCheck size={12} /> 100% Verified Biodatas
              </span>
            </div>
          </div>

          {/* 5-Column Search Filter Grid (Matching live marriagemediausa.com + US Diaspora) */}
          <div
            className="hero-search-filters-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
              gap: '1rem',
              alignItems: 'flex-end',
            }}
          >
            {/* 1. Age Range (16 to 80 as in live marriagemediausa.com) */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#334155',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Age ({minAge} to {maxAge} Yrs)
              </label>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <select
                  value={minAge}
                  onChange={(e) => setMinAge(Number(e.target.value))}
                  className="input-3d"
                  style={{ padding: '8px 10px' }}
                >
                  {Array.from({ length: 45 }, (_, i) => i + 16).map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
                <span style={{ fontWeight: 700, color: '#64748b', fontSize: '0.8rem' }}>to</span>
                <select
                  value={maxAge}
                  onChange={(e) => setMaxAge(Number(e.target.value))}
                  className="input-3d"
                  style={{ padding: '8px 10px' }}
                >
                  {Array.from({ length: 62 }, (_, i) => i + 19).map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Living Country */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#334155',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Living Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="input-3d"
              >
                <option value="All Countries">All Countries (Worldwide)</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Mother Tongue (Exact list from live marriagemediausa.com) */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#334155',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Mother Tongue
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="input-3d"
              >
                {MOTHER_TONGUES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Profession */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#334155',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Profession Field
              </label>
              <select
                value={selectedProfession}
                onChange={(e) => setSelectedProfession(e.target.value)}
                className="input-3d"
              >
                <option value="All">All Professions</option>
                {professions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. 3D Search Submit Button */}
            <div className="hero-search-submit-wrapper">
              <button
                type="submit"
                className="btn-3d-emerald hero-search-submit-btn"
                style={{ width: '100%', padding: '11px 18px', fontSize: '0.9rem' }}
              >
                <Search size={17} />
                Search Partner
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
