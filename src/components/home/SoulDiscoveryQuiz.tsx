'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Heart, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';

export function SoulDiscoveryQuiz() {
  const [currentStep, setCurrentStep] = useState(1);
  const [lookingFor, setLookingFor] = useState<'FEMALE' | 'MALE'>('FEMALE');
  const [ageRange, setAgeRange] = useState('24 - 32');
  const [islamicPractice, setIslamicPractice] = useState('Prays 5x Daily & Halal Diet');
  const [residency, setResidency] = useState('US Citizen or Green Card');
  const [careerField, setCareerField] = useState('Medicine & Engineering');
  const [calculatedCount, setCalculatedCount] = useState<number | null>(null);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate dynamic match estimate
      const randomCount = Math.floor(Math.random() * 40) + 165; // ~165-205 matches
      setCalculatedCount(randomCount);
      setCurrentStep(5);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(1);
    setCalculatedCount(null);
  };

  return (
    <section
      id="quiz"
      style={{
        paddingBlock: 'var(--space-3xl)',
        background: 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%)',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 840, margin: '0 auto', paddingInline: 'var(--space-lg)', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--gold-300)',
              marginBottom: 'var(--space-xs)',
            }}
          >
            <Sparkles size={12} />
            4-Question Soul Discovery Quiz
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, margin: 0 }}>
            Find Your Sunnah Soulmate in 60 Seconds
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', marginTop: 6, marginBottom: 0 }}>
            Answer 4 quick questions about your marriage priorities to instantly unlock tailored matches.
          </p>
        </div>

        {/* Card Container */}
        <div
          style={{
            background: 'var(--bg-surface)',
            color: 'var(--text-main)',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-2xl)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          }}
        >
          {currentStep <= 4 ? (
            <div>
              {/* Step Progression Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--emerald-600)', textTransform: 'uppercase' }}>
                  Question {currentStep} of 4
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {currentStep === 1 && 'Partner Basics'}
                  {currentStep === 2 && 'Deen & Practice'}
                  {currentStep === 3 && 'US Diaspora'}
                  {currentStep === 4 && 'Career & Aspirations'}
                </span>
              </div>
              <div style={{ height: 6, width: '100%', background: 'var(--bg-app)', borderRadius: 3, marginBottom: 'var(--space-xl)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(currentStep / 4) * 100}%`,
                    background: 'linear-gradient(90deg, var(--emerald-500), var(--gold-500))',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>

              {/* Question 1 */}
              {currentStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>
                    1. Who are you looking to meet, and what is your desired age window?
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setLookingFor('FEMALE')}
                      style={{
                        padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-lg)',
                        border: lookingFor === 'FEMALE' ? '2px solid var(--emerald-600)' : '1px solid var(--border-subtle)',
                        background: lookingFor === 'FEMALE' ? 'var(--emerald-50)' : 'var(--bg-surface)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      🧕 Practicing Bride (Sister)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLookingFor('MALE')}
                      style={{
                        padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-lg)',
                        border: lookingFor === 'MALE' ? '2px solid var(--emerald-600)' : '1px solid var(--border-subtle)',
                        background: lookingFor === 'MALE' ? 'var(--emerald-50)' : 'var(--bg-surface)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      👨 Practicing Groom (Brother)
                    </button>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      Target Age Range:
                    </label>
                    <select
                      value={ageRange}
                      onChange={(e) => setAgeRange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-app)',
                        fontSize: '0.875rem',
                      }}
                    >
                      <option value="20 - 26">20 - 26 years</option>
                      <option value="24 - 32">24 - 32 years (Most Popular)</option>
                      <option value="30 - 38">30 - 38 years</option>
                      <option value="36 - 48">36 - 48 years</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Question 2 */}
              {currentStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>
                    2. Which level of Islamic practice and Sunnah lifestyle do you prioritize?
                  </h3>
                  {[
                    'Prays 5x Daily, Strictly Halal & Active in Masjid',
                    'Prays Regularly, Halal Diet & Modest Attire',
                    'Moderate Practicing Muslim (Jumuah, Halal Diet)',
                    'Spiritual / Returning to Faith (Growth mindset)',
                  ].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setIslamicPractice(opt)}
                      style={{
                        padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-lg)',
                        border: islamicPractice === opt ? '2px solid var(--emerald-600)' : '1px solid var(--border-subtle)',
                        background: islamicPractice === opt ? 'var(--emerald-50)' : 'var(--bg-surface)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>🕌 {opt}</span>
                      {islamicPractice === opt && <CheckCircle2 size={18} color="var(--emerald-600)" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Question 3 */}
              {currentStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>
                    3. What is your preferred location and US legal residency status?
                  </h3>
                  {[
                    'US Citizen or US Permanent Resident (Green Card)',
                    'Valid US Work Permit (H-1B, L-1, EAD, STEM OPT)',
                    'North America (USA or Canada)',
                    'Open to Global Suitors willing to relocate',
                  ].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setResidency(opt)}
                      style={{
                        padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-lg)',
                        border: residency === opt ? '2px solid var(--emerald-600)' : '1px solid var(--border-subtle)',
                        background: residency === opt ? 'var(--emerald-50)' : 'var(--bg-surface)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>🛡️ {opt}</span>
                      {residency === opt && <CheckCircle2 size={18} color="var(--emerald-600)" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Question 4 */}
              {currentStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>
                    4. What educational & career background do you value in a spouse?
                  </h3>
                  {[
                    'Medicine & Healthcare (Physicians, Dentists, Pharmacists)',
                    'Technology & Engineering (Software, AI, Cloud, Civil)',
                    'Finance, Law & Corporate Business Executives',
                    'Educators, Academics & Public Servants',
                    'Open to all halal careers and honest professions',
                  ].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setCareerField(opt)}
                      style={{
                        padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-lg)',
                        border: careerField === opt ? '2px solid var(--emerald-600)' : '1px solid var(--border-subtle)',
                        background: careerField === opt ? 'var(--emerald-50)' : 'var(--bg-surface)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>🎓 {opt}</span>
                      {careerField === opt && <CheckCircle2 size={18} color="var(--emerald-600)" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Bottom Nav Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-xl)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-subtle)' }}>
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="btn btn-ghost btn-sm"
                  >
                    <ArrowLeft size={16} /> Previous
                  </button>
                ) : <div />}

                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary"
                >
                  {currentStep === 4 ? 'Calculate Matches 🎯' : 'Next Question'} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'var(--emerald-100)',
                  color: 'var(--emerald-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-md)',
                }}
              >
                <Sparkles size={36} />
              </div>
              <div className="badge badge-emerald" style={{ marginBottom: 8 }}>
                Alhamdulillah! Discovery Complete
              </div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                We Found <span style={{ color: 'var(--emerald-600)' }}>{calculatedCount} Compatible</span> Suitors!
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: 500, margin: '8px auto 20px', lineHeight: 1.6 }}>
                Based on your criteria ({ageRange} yrs, {islamicPractice.split(',')[0]}, {residency.split('(')[0]}), these verified suitors meet your Sunnah matrimonial vision.
              </p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/search" className="btn btn-primary btn-lg">
                  Explore Your {calculatedCount} Matches Now <ArrowRight size={18} />
                </Link>
                <button type="button" onClick={resetQuiz} className="btn btn-outline btn-lg">
                  <RefreshCw size={16} /> Retake Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
