import Link from 'next/link';
import { Globe, MapPin, Briefcase, Layers, Flag } from 'lucide-react';

export function SeoDirectoryMatrix() {
  // Real Popular Search Terms from https://marriagemediausa.com
  const languages = [
    'Bengali',
    'English',
    'Hindi',
    'Urdu',
    'Arabic',
    'Punjabi',
    'Turkish',
    'Persian',
    'Pashto',
    'Somali',
    'Malay',
    'French',
  ];

  const professions = [
    'Accountant',
    'Administrative Professional',
    'Advertising Professional',
    'Architect',
    'Banker',
    'Business / Entrepreneur',
    'Chartered Accountant',
    'Civil Engineer',
    'Company Secretary',
    'Corporate Planning',
    'Customer Support / BPO',
    'Defense Services',
    'Doctor / Physician',
    'Fashion Designer',
    'Finance Professional',
    'Government Employee',
    'HR Professional',
    'IT / Telecom Professional',
    'Journalist',
    'Lawyer / Legal Professional',
    'Lecturer / Professor',
    'Marketing Professional',
    'Media Professional',
    'Medical / Healthcare',
    'Merchant Navy',
    'Nurse',
    'Paramilitary',
    'Pharmacist',
    'Pilot',
    'Police',
    'Scientist / Researcher',
    'Self-Employed',
    'Social Worker',
    'Software Engineer / Programmer',
    'Student',
    'Teacher',
  ];

  const cities = [
    'Dhaka',
    'Chittagong',
    'Sylhet',
    'Rajshahi',
    'Khulna',
    'Barisal',
    'Comilla',
    'Gazipur',
    'Narayanganj',
    'Mymensingh',
    'New York City',
    'Dallas',
    'Houston',
    'Chicago',
    'Los Angeles',
    'London',
    'Toronto',
    'Sydney',
  ];

  const countries = [
    'Bangladesh',
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Saudi Arabia',
    'United Arab Emirates',
    'Malaysia',
    'Singapore',
    'Qatar',
    'Kuwait',
    'Oman',
    'Italy',
    'Germany',
    'France',
    'India',
    'Pakistan',
    'Turkey',
  ];

  return (
    <section
      id="directory"
      style={{
        paddingBlock: 'var(--space-3xl)',
        background: 'linear-gradient(180deg, #F8FAFC 0%, #FDFBF7 100%)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ maxWidth: 'var(--max-content-width)', margin: '0 auto', paddingInline: 'var(--space-lg)' }}>
        <div className="ornamental-header" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="badge badge-sapphire" style={{ marginBottom: 8 }}>
            <Layers size={12} />
            MarriageMediaUSA.com Popular Search Directory
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.65rem, 3vw, 2.35rem)',
              fontWeight: 900,
              color: 'var(--text-main)',
              marginBottom: 4,
              fontFamily: 'var(--font-display)',
            }}
          >
            Popular <span style={{ color: '#c0392b' }}>Search Terms</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', maxWidth: 640, margin: '0 auto' }}>
            Browse marriage profiles directly by Mother Tongue, Profession, City, and Living Country.
          </p>
          <img
            src="/images/w-title-b.png"
            alt="Divider"
            className="ornamental-divider"
          />
        </div>

        {/* 4 Directory Cards (2-Column on Mobile, Multi-Col on Desktop) */}
        <div className="mobile-2col-grid">
          {/* 1. By Mother Tongue */}
          <div className="card-3d" style={{ padding: 'var(--space-xl)', borderTop: '4px solid #D97706' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-md)' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #F59E0B, #B45309)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 0 #78350F',
                }}
              >
                <Globe size={18} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                By Mother Tongue
              </h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {languages.map((lang) => (
                <Link
                  key={lang}
                  href={`/search?language=${encodeURIComponent(lang)}`}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-body)',
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    boxShadow: '0 2px 0 #CBD5E1',
                    padding: '5px 10px',
                    borderRadius: 8,
                    textDecoration: 'none',
                  }}
                >
                  {lang}
                </Link>
              ))}
            </div>
          </div>

          {/* 2. By City */}
          <div className="card-3d" style={{ padding: 'var(--space-xl)', borderTop: '4px solid #e74c3c' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-md)' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #ff5e4d, #c0392b)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 0 #7f1d1d',
                }}
              >
                <MapPin size={18} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                By City
              </h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {cities.map((city) => (
                <Link
                  key={city}
                  href={`/search?city=${encodeURIComponent(city)}`}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-body)',
                    background: '#FFF1F2',
                    border: '1px solid #FECDD3',
                    boxShadow: '0 2px 0 #FDA4AF',
                    padding: '5px 10px',
                    borderRadius: 8,
                    textDecoration: 'none',
                  }}
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>

          {/* 3. By Country */}
          <div className="card-3d" style={{ padding: 'var(--space-xl)', borderTop: '4px solid #0284C7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-md)' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #38BDF8, #0284C7)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 0 #075985',
                }}
              >
                <Flag size={18} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                By Country
              </h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {countries.map((country) => (
                <Link
                  key={country}
                  href={`/search?country=${encodeURIComponent(country)}`}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-body)',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    boxShadow: '0 2px 0 #93C5FD',
                    padding: '5px 10px',
                    borderRadius: 8,
                    textDecoration: 'none',
                  }}
                >
                  {country}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Full-Width By Profession Matrix */}
        <div
          className="card-3d"
          style={{
            padding: 'var(--space-xl)',
            marginTop: 'var(--space-lg)',
            borderTop: '4px solid #059669',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-md)' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #10B981, #047857)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 3px 0 #064E3B',
              }}
            >
              <Briefcase size={18} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
              By Profession (36 Verified Career Categories)
            </h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {professions.map((prof) => (
              <Link
                key={prof}
                href={`/search?profession=${encodeURIComponent(prof)}`}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#065F46',
                  background: '#F0FDF4',
                  border: '1px solid #A7F3D0',
                  boxShadow: '0 2px 0 #6EE7B7',
                  padding: '5px 11px',
                  borderRadius: 8,
                  textDecoration: 'none',
                }}
              >
                {prof}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
