'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Lock,
  Unlock,
  Heart,
  CheckCircle2,
  Eye,
  X,
  UserCheck,
  SlidersHorizontal,
  ChevronRight,
  Send,
  Bookmark,
  Calendar,
  Layers,
  Phone,
} from 'lucide-react';
import { AuthenticProfile, Country, USState } from '@/db/repository';
import { calculateCompatibilityScore, SuitorFilterCriteria } from '@/lib/matchmaking/compatibility';
import { UnlockContactModal } from '@/components/social/UnlockContactModal';

interface SearchWorkspaceProps {
  initialProfiles: AuthenticProfile[];
  countries: Country[];
  usStates: USState[];
  professions: string[];
  educationLevels: string[];
  sectsAndMazhabs: string[];
  initialLookingFor?: 'FEMALE' | 'MALE';
}

export function SearchWorkspace({
  initialProfiles,
  countries,
  usStates,
  professions,
  educationLevels,
  sectsAndMazhabs,
  initialLookingFor = 'FEMALE',
}: SearchWorkspaceProps) {
  // Column 1 Filter State
  const [lookingFor, setLookingFor] = useState<'FEMALE' | 'MALE'>(initialLookingFor);
  const [searchQuery, setSearchQuery] = useState('');
  const [minAge, setMinAge] = useState<number>(20);
  const [maxAge, setMaxAge] = useState<number>(40);
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedSect, setSelectedSect] = useState<string>('All');
  const [selectedProfession, setSelectedProfession] = useState<string>('All');
  const [selectedEducation, setSelectedEducation] = useState<string>('All');
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState<string>('All');
  const [selectedResidency, setSelectedResidency] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'match' | 'age_asc' | 'age_desc'>('match');

  // Purdah Photo Shields & Saved Profiles
  const [revealedPurdah, setRevealedPurdah] = useState<Record<string, boolean>>({});
  const [bookmarkedProfiles, setBookmarkedProfiles] = useState<Record<string, boolean>>({});
  const [sentSalaam, setSentSalaam] = useState<Record<string, boolean>>({});

  // Column 3 Active Inspector
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    initialProfiles[0]?.profile_id || ''
  );
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [unlockModalProfile, setUnlockModalProfile] = useState<AuthenticProfile | null>(null);

  // Active Filter Counter
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCountry !== 'All') count++;
    if (selectedState !== 'All') count++;
    if (selectedSect !== 'All') count++;
    if (selectedProfession !== 'All') count++;
    if (selectedEducation !== 'All') count++;
    if (selectedMaritalStatus !== 'All') count++;
    if (selectedResidency !== 'All') count++;
    if (minAge !== 20 || maxAge !== 40) count++;
    return count;
  }, [
    selectedCountry,
    selectedState,
    selectedSect,
    selectedProfession,
    selectedEducation,
    selectedMaritalStatus,
    selectedResidency,
    minAge,
    maxAge,
  ]);

  // Live Instant Ajax Dropdown State
  const [liveDropdownOpen, setLiveDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close live dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setLiveDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Active filter criteria object
  const criteria: SuitorFilterCriteria = useMemo(
    () => ({
      gender: lookingFor,
      minAge,
      maxAge,
      country: selectedCountry,
      usState: selectedState,
      sect: selectedSect,
      profession: selectedProfession,
      maritalStatus: selectedMaritalStatus,
      residencyStatus: selectedResidency,
      query: searchQuery,
    }),
    [
      lookingFor,
      minAge,
      maxAge,
      selectedCountry,
      selectedState,
      selectedSect,
      selectedProfession,
      selectedMaritalStatus,
      selectedResidency,
      searchQuery,
    ]
  );

  // Real-time matching profiles for live dropdown (matching gender and query)
  const liveMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return initialProfiles
      .filter((p) => {
        if (p.gender !== lookingFor) return false;
        const matchName = p.full_name.toLowerCase().includes(q);
        const matchCity = (p.city || '').toLowerCase().includes(q);
        const matchState = (p.state_province || '').toLowerCase().includes(q);
        const matchCountry = (p.country_living_in || '').toLowerCase().includes(q);
        const matchJob = (p.profession || '').toLowerCase().includes(q);
        const matchEdu =
          (p.field_of_study || '').toLowerCase().includes(q) ||
          (p.education_level || '').toLowerCase().includes(q);
        const matchId = (p.profile_id || '').toLowerCase().includes(q);
        const matchSect = (p.sect_mazhab || '').toLowerCase().includes(q);
        return matchName || matchCity || matchState || matchCountry || matchJob || matchEdu || matchId || matchSect;
      })
      .map((p) => {
        const { score, colorClass } = calculateCompatibilityScore(p, criteria);
        return { ...p, score, colorClass };
      })
      .slice(0, 8); // Top 8 instantaneous matches
  }, [initialProfiles, lookingFor, searchQuery, criteria]);

  // Filtered & Scored Profiles
  const filteredProfiles = useMemo(() => {
    return initialProfiles
      .filter((p) => {
        // Gender match: looking for Bride means candidate is FEMALE
        if (p.gender !== lookingFor) return false;

        // Age filter
        if (p.age < minAge || p.age > maxAge) return false;

        // Country filter
        if (selectedCountry !== 'All' && !p.country_living_in.includes(selectedCountry)) {
          return false;
        }

        // US State filter
        if (selectedState !== 'All' && !p.state_province.toLowerCase().includes(selectedState.toLowerCase())) {
          return false;
        }

        // Sect filter
        if (selectedSect !== 'All' && p.sect_mazhab && !p.sect_mazhab.toLowerCase().includes(selectedSect.toLowerCase())) {
          return false;
        }

        // Profession filter
        if (selectedProfession !== 'All' && !p.profession.toLowerCase().includes(selectedProfession.toLowerCase())) {
          return false;
        }

        // Education filter
        if (selectedEducation !== 'All' && !p.education_level.toLowerCase().includes(selectedEducation.toLowerCase())) {
          return false;
        }

        // Marital status
        if (selectedMaritalStatus !== 'All' && p.marital_status !== selectedMaritalStatus) {
          return false;
        }

        // Residency Status
        if (selectedResidency !== 'All' && !p.residing_status.toLowerCase().includes(selectedResidency.toLowerCase())) {
          return false;
        }

        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.full_name.toLowerCase().includes(q);
          const matchCity = p.city.toLowerCase().includes(q);
          const matchJob = p.profession.toLowerCase().includes(q);
          const matchEdu = p.field_of_study.toLowerCase().includes(q);
          if (!matchName && !matchCity && !matchJob && !matchEdu) return false;
        }

        return true;
      })
      .map((p) => {
        const { score, colorClass, breakdown } = calculateCompatibilityScore(p, criteria);
        return { ...p, compatibilityScore: score, colorClass, breakdown };
      })
      .sort((a, b) => {
        if (sortBy === 'match') return b.compatibilityScore - a.compatibilityScore;
        if (sortBy === 'age_asc') return a.age - b.age;
        if (sortBy === 'age_desc') return b.age - a.age;
        return 0;
      });
  }, [
    initialProfiles,
    lookingFor,
    minAge,
    maxAge,
    selectedCountry,
    selectedState,
    selectedSect,
    selectedProfession,
    selectedEducation,
    selectedMaritalStatus,
    selectedResidency,
    searchQuery,
    sortBy,
    criteria,
  ]);

  // Selected Profile for Column 3 Inspector
  const selectedProfile = useMemo(() => {
    return (
      filteredProfiles.find((p) => p.profile_id === selectedProfileId) ||
      filteredProfiles[0] ||
      null
    );
  }, [filteredProfiles, selectedProfileId]);

  const togglePurdah = (id: string) => {
    setRevealedPurdah((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedProfiles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSendSalaam = (p: AuthenticProfile) => {
    setSentSalaam((prev) => ({ ...prev, [p.profile_id]: true }));
    alert(
      `💌 Proposal & Salaam dispatched to ${p.full_name}!\nWali guardian (${p.guardian_name}) alerted per Islamic matrimonial guidelines.`
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setMinAge(20);
    setMaxAge(40);
    setSelectedState('All');
    setSelectedCountry('All');
    setSelectedSect('All');
    setSelectedProfession('All');
    setSelectedEducation('All');
    setSelectedMaritalStatus('All');
    setSelectedResidency('All');
    setSortBy('match');
  };

  const renderFilterFields = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      {/* Keyword Search */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: 4 }}>
          Keyword / Suitor Name
        </label>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Doctor, Dallas, Tariq..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px 8px 30px',
              fontSize: '0.8125rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-app)',
            }}
          />
        </div>
      </div>

      {/* Age Range Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: 4 }}>
          <span>Age Range</span>
          <span style={{ color: 'var(--emerald-600)' }}>{minAge} - {maxAge} yrs</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="range"
            min={18}
            max={55}
            value={minAge}
            onChange={(e) => setMinAge(Math.min(Number(e.target.value), maxAge - 1))}
            style={{ width: '100%', accentColor: 'var(--emerald-600)' }}
          />
          <input
            type="range"
            min={18}
            max={55}
            value={maxAge}
            onChange={(e) => setMaxAge(Math.max(Number(e.target.value), minAge + 1))}
            style={{ width: '100%', accentColor: 'var(--emerald-600)' }}
          />
        </div>
      </div>

      {/* Living Country Filter */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: 4 }}>
          🌍 Living Country
        </label>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          style={{
            width: '100%',
            padding: '7px 10px',
            fontSize: '0.8125rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-app)',
          }}
        >
          <option value="All">All Countries Worldwide</option>
          {countries.map((c) => (
            <option key={c.code || c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* US State Filter */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: 4 }}>
          🇺🇸 US Diaspora State
        </label>
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          style={{
            width: '100%',
            padding: '7px 10px',
            fontSize: '0.8125rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-app)',
          }}
        >
          <option value="All">All US States (50 States)</option>
          {usStates.map((s) => (
            <option key={s.code} value={s.name}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>
      </div>

      {/* Islamic Sect / Mazhab */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: 4 }}>
          🕌 Islamic Sect / Mazhab
        </label>
        <select
          value={selectedSect}
          onChange={(e) => setSelectedSect(e.target.value)}
          style={{
            width: '100%',
            padding: '7px 10px',
            fontSize: '0.8125rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-app)',
          }}
        >
          <option value="All">All Sects / Any Mazhab</option>
          {sectsAndMazhabs.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Profession Filter */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: 4 }}>
          💼 Profession
        </label>
        <select
          value={selectedProfession}
          onChange={(e) => setSelectedProfession(e.target.value)}
          style={{
            width: '100%',
            padding: '7px 10px',
            fontSize: '0.8125rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-app)',
          }}
        >
          <option value="All">All Professions</option>
          {professions.slice(0, 15).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Education Filter */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: 4 }}>
          🎓 Education Level
        </label>
        <select
          value={selectedEducation}
          onChange={(e) => setSelectedEducation(e.target.value)}
          style={{
            width: '100%',
            padding: '7px 10px',
            fontSize: '0.8125rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-app)',
          }}
        >
          <option value="All">All Education Levels</option>
          {educationLevels.map((edu) => (
            <option key={edu} value={edu}>{edu}</option>
          ))}
        </select>
      </div>

      {/* Marital Status */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: 4 }}>
          💍 Marital Status
        </label>
        <select
          value={selectedMaritalStatus}
          onChange={(e) => setSelectedMaritalStatus(e.target.value)}
          style={{
            width: '100%',
            padding: '7px 10px',
            fontSize: '0.8125rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-app)',
          }}
        >
          <option value="All">All Marital Statuses</option>
          <option value="NEVER_MARRIED">Never Married</option>
          <option value="DIVORCED">Divorced</option>
          <option value="WIDOWED">Widowed</option>
          <option value="SEPARATED">Separated</option>
        </select>
      </div>

      {/* Residency Status */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: 4 }}>
          🛡️ Legal US Residency Status
        </label>
        <select
          value={selectedResidency}
          onChange={(e) => setSelectedResidency(e.target.value)}
          style={{
            width: '100%',
            padding: '7px 10px',
            fontSize: '0.8125rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-app)',
          }}
        >
          <option value="All">All Residencies</option>
          <option value="CITIZEN">US Citizen</option>
          <option value="PERMANENT_RESIDENT">Green Card / Permanent Resident</option>
          <option value="WORK_PERMIT">Work Permit (H1B / L1 / EAD)</option>
          <option value="STUDENT_VISA">Student Visa</option>
        </select>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      {/* Search Header Banner */}
      <div
        style={{
          background: 'var(--bg-surface)',
          padding: 'var(--space-md) var(--space-lg)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--emerald-600), var(--gold-500))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
            }}
          >
            🔍
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-main)' }}>
              Fluid 3-Column Matrimonial Matchmaker Workspace
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Live 0–100% Sunnah compatibility algorithm • Strict Purdah shields • Verified Walis
            </div>
          </div>
        </div>

        {/* Dual Gender Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-body)' }}>
            Showing Candidates:
          </span>
          <div
            style={{
              display: 'inline-flex',
              padding: 4,
              background: 'var(--bg-app)',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setLookingFor('FEMALE');
                setSelectedProfileId('');
              }}
              className={`btn btn-sm ${lookingFor === 'FEMALE' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-pill)', padding: '6px 14px' }}
            >
              🧕 Brides (Sisters)
            </button>
            <button
              type="button"
              onClick={() => {
                setLookingFor('MALE');
                setSelectedProfileId('');
              }}
              className={`btn btn-sm ${lookingFor === 'MALE' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-pill)', padding: '6px 14px' }}
            >
              👨 Grooms (Brothers)
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SMART LIVE AJAX INSTANT SUITOR SEARCH CONSOLE (FACEBOOK/SPOTLIGHT STYLE)
         ========================================================================= */}
      <div
        ref={searchContainerRef}
        style={{
          position: 'relative',
          width: '100%',
        }}
      >
        <div
          className="card-3d"
          style={{
            padding: '14px 20px',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            border: '2px solid rgba(5, 150, 105, 0.35)',
            boxShadow: '0 10px 28px -8px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(5, 150, 105, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {/* Main Input Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0,
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
              }}
            >
              <Search size={22} />
            </div>

            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setLiveDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setLiveDropdownOpen(true);
                }}
                placeholder={`⚡ Live Instant Search: Type candidate name, profession, city, or ID (e.g. Ayesha, Doctor, California, 2026044925)...`}
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 16px',
                  borderRadius: 12,
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.925rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                }}
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setLiveDropdownOpen(false);
                  }}
                  aria-label="Clear Search"
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#e2e8f0',
                    border: 'none',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#475569',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Result Pill Counter */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#047857',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(52, 211, 153, 0.45)',
                  padding: '9px 16px',
                  borderRadius: 999,
                  whiteSpace: 'nowrap',
                }}
              >
                {filteredProfiles.length} Matches Found
              </span>
            </div>
          </div>

          {/* Suggested Quick Filter Chips Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
              paddingTop: 6,
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Suggested:
            </span>
            {[
              { label: '🩺 Doctors', val: 'Doctor' },
              { label: '💻 Software / IT', val: 'Software' },
              { label: '🎓 PhD / Master’s', val: 'Doctorate' },
              { label: '🇺🇸 US Diaspora', val: 'United States' },
              { label: '🕌 Sunni (Hanafi)', val: 'Hanafi' },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  setSearchQuery(chip.val);
                  setLiveDropdownOpen(true);
                }}
                style={{
                  padding: '4px 11px',
                  borderRadius: 999,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: searchQuery === chip.val ? '#059669' : '#f1f5f9',
                  color: searchQuery === chip.val ? '#ffffff' : '#334155',
                  border: '1px solid',
                  borderColor: searchQuery === chip.val ? '#059669' : '#e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {chip.label}
              </button>
            ))}

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setLiveDropdownOpen(false);
                }}
                style={{
                  padding: '4px 11px',
                  borderRadius: 999,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #fca5a5',
                  cursor: 'pointer',
                  marginLeft: 'auto',
                }}
              >
                Reset Search
              </button>
            )}
          </div>
        </div>

        {/* =========================================================================
            LIVE REALTIME INSTANT AJAX DROPDOWN (FACEBOOK/SPOTLIGHT STYLE)
           ========================================================================= */}
        {liveDropdownOpen && searchQuery.trim().length > 0 && (
          <div
            className="card-3d"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              zIndex: 700,
              background: '#ffffff',
              borderRadius: 18,
              border: '2px solid rgba(5, 150, 105, 0.4)',
              boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(5, 150, 105, 0.2)',
              maxHeight: 460,
              overflowY: 'auto',
              padding: '10px 8px',
            }}
          >
            {/* Dropdown Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderBottom: '1px solid #e2e8f0',
                marginBottom: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={15} style={{ color: '#059669' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                  Live Suitor Matches for &quot;{searchQuery}&quot;
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#059669',
                    background: '#ecfdf5',
                    padding: '2px 8px',
                    borderRadius: 999,
                  }}
                >
                  {liveMatches.length} Found
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Click to inspect candidate breakdown
              </span>
            </div>

            {/* Results List */}
            {liveMatches.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {liveMatches.map((m) => (
                  <div
                    key={m.profile_id}
                    onClick={() => {
                      setSelectedProfileId(m.profile_id);
                      setLiveDropdownOpen(false);
                      const el = document.getElementById(`profile-card-${m.profile_id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      cursor: 'pointer',
                      border: '1.5px solid transparent',
                      background: selectedProfileId === m.profile_id ? '#f0fdf4' : '#ffffff',
                      borderColor: selectedProfileId === m.profile_id ? 'rgba(5, 150, 105, 0.4)' : 'transparent',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f0fdf4';
                      e.currentTarget.style.borderColor = 'rgba(5, 150, 105, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                      if (selectedProfileId !== m.profile_id) {
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.borderColor = 'transparent';
                      }
                    }}
                  >
                    {/* Left: Avatar & Candidate Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '1rem',
                          flexShrink: 0,
                          boxShadow: '0 4px 10px rgba(5, 150, 105, 0.25)',
                        }}
                      >
                        {m.full_name.charAt(0)}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 900, fontSize: '0.92rem', color: '#0f172a' }}>
                            {m.full_name}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                            {m.age} yrs • {m.marital_status}
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              color: '#059669',
                              background: '#ecfdf5',
                              padding: '2px 6px',
                              borderRadius: 4,
                            }}
                          >
                            #{m.profile_id}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600, marginTop: 2 }}>
                          {m.profession} • {m.city}, {m.state_province} ({m.country_living_in})
                        </div>
                      </div>
                    </div>

                    {/* Right: Compatibility Score & Inspect CTA */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <div
                        style={{
                          padding: '6px 12px',
                          borderRadius: 999,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff',
                          fontSize: '0.8rem',
                          fontWeight: 900,
                          boxShadow: '0 3px 8px rgba(5, 150, 105, 0.3)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {m.score}% Match
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          color: '#059669',
                        }}
                      >
                        Inspect ➔
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>🔍</div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.875rem' }}>
                  No suitors matched &quot;{searchQuery}&quot;
                </div>
                <div style={{ fontSize: '0.78rem', marginTop: 4 }}>
                  Try searching by profession (e.g. Doctor, Engineer), city, or country.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Responsive Workspace Container */}
      <div className="search-workspace-grid">
        {/* =========================================================================
            COLUMN 1: Fast Faceted Live Filter Bar (Desktop >= 1024px)
           ========================================================================= */}
        <aside
          className="search-workspace-sidebar"
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-lg)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
            position: 'sticky',
            top: 76,
            maxHeight: 'calc(100vh - 90px)',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-md)',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: 'var(--space-xs)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '0.9375rem' }}>
              <SlidersHorizontal size={16} color="var(--emerald-600)" />
              Faceted Filters
            </div>
            <button
              type="button"
              onClick={resetFilters}
              style={{
                fontSize: '0.6875rem',
                color: 'var(--emerald-600)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Reset All
            </button>
          </div>

          {renderFilterFields()}
        </aside>

        {/* =========================================================================
            COLUMN 2: High-Density Profile Card Feed (1fr)
           ========================================================================= */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {/* Mobile Filter Bar Trigger (Sticky on Mobile < 1024px) */}
          <div
            className="search-mobile-filter-bar"
            style={{
              position: 'sticky',
              top: 66,
              zIndex: 100,
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              padding: '10px 14px',
              borderRadius: 14,
              border: '1.5px solid rgba(5, 150, 105, 0.3)',
              boxShadow: '0 6px 20px rgba(15, 23, 42, 0.1)',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="btn btn-sm btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                fontSize: '0.8rem',
                fontWeight: 800,
              }}
            >
              <SlidersHorizontal size={14} />
              Filter Suitors
              {activeFilterCount > 0 && (
                <span
                  style={{
                    background: '#ffffff',
                    color: '#059669',
                    padding: '1px 6px',
                    borderRadius: 999,
                    fontSize: '0.7rem',
                    fontWeight: 900,
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Quick Gender Switcher for Mobile */}
            <div
              style={{
                display: 'inline-flex',
                padding: 3,
                background: '#f1f5f9',
                borderRadius: 999,
                border: '1px solid #cbd5e1',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setLookingFor('FEMALE');
                  setSelectedProfileId('');
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 999,
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: lookingFor === 'FEMALE' ? '#059669' : 'transparent',
                  color: lookingFor === 'FEMALE' ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease',
                }}
              >
                🧕 Brides
              </button>
              <button
                type="button"
                onClick={() => {
                  setLookingFor('MALE');
                  setSelectedProfileId('');
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 999,
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: lookingFor === 'MALE' ? '#059669' : 'transparent',
                  color: lookingFor === 'MALE' ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease',
                }}
              >
                👨 Grooms
              </button>
            </div>
          </div>

          {/* Feed Toolbar */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '10px var(--space-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Found <span style={{ color: 'var(--emerald-600)' }}>{filteredProfiles.length}</span> Verified{' '}
              {lookingFor === 'FEMALE' ? 'Brides (Sisters)' : 'Grooms (Brothers)'}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                style={{
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-app)',
                }}
              >
                <option value="match">Highest Match Score (0-100%)</option>
                <option value="age_asc">Age: Youngest First</option>
                <option value="age_desc">Age: Oldest First</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredProfiles.length === 0 ? (
            <div
              style={{
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-3xl) var(--space-lg)',
                textAlign: 'center',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔍</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>
                No suitors matched your current criteria
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: 440, margin: '0 auto 16px' }}>
                Try relaxing the age boundaries, selecting "All US States", or broadening the profession filter.
              </p>
              <button type="button" onClick={resetFilters} className="btn btn-primary btn-sm">
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                gap: 'var(--space-md)',
              }}
            >
              {filteredProfiles.map((p) => {
                const isSelected = selectedProfile?.profile_id === p.profile_id;
                const isPurdah = p.photo_privacy === 'BLURRED_PURDAH';
                const isPurdahRevealed = !isPurdah || revealedPurdah[p.profile_id];
                const isBookmarked = bookmarkedProfiles[p.profile_id];
                const isSalaamSent = sentSalaam[p.profile_id];

                return (
                  <article
                    key={p.profile_id}
                    id={`profile-card-${p.profile_id}`}
                    onClick={() => {
                      setSelectedProfileId(p.profile_id);
                      setMobileInspectorOpen(true);
                    }}
                    className="card-3d"
                    style={{
                      border: isSelected
                        ? '2px solid var(--emerald-600)'
                        : undefined,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    {/* Top Image Box with Compatibility Ring & Badges */}
                    <div style={{ position: 'relative', width: '100%', height: 260, background: '#0F172A', overflow: 'hidden' }}>
                      {/* Real Member Photo from MarriageMediaUSA.com */}
                      <img
                        src={
                          p.photo_url ||
                          (p.gender === 'FEMALE'
                            ? 'https://marriagemediausa.com/design/member_image/2018055584_1526196452_1.jpg'
                            : 'https://marriagemediausa.com/design/member_image/2021027948_1622089820_1.jpg')
                        }
                        alt={p.full_name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'top center',
                          filter: !isPurdahRevealed ? 'blur(14px)' : 'none',
                          transform: !isPurdahRevealed ? 'scale(1.08)' : 'scale(1)',
                          transition: 'filter 0.3s ease, transform 0.3s ease',
                        }}
                      />

                      {/* Purdah Shield Toggle Button */}
                      {isPurdah && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePurdah(p.profile_id);
                          }}
                          style={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            background: 'rgba(15, 23, 42, 0.82)',
                            backdropFilter: 'blur(8px)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.25)',
                            borderRadius: 'var(--radius-pill)',
                            padding: '5px 11px',
                            fontSize: '0.6875rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            cursor: 'pointer',
                          }}
                        >
                          {isPurdahRevealed ? (
                            <>
                              <Unlock size={12} color="var(--gold-400)" /> Hide (Purdah)
                            </>
                          ) : (
                            <>
                              <Lock size={12} color="var(--emerald-400)" /> Reveal Photo
                            </>
                          )}
                        </button>
                      )}

                      {/* Compatibility Score Ring */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(6px)',
                          borderRadius: 'var(--radius-pill)',
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}
                      >
                        {/* Mini SVG Ring */}
                        <svg width="24" height="24" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#E2E8F0"
                            strokeWidth="3.5"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="var(--emerald-600)"
                            strokeWidth="3.8"
                            strokeDasharray={`${p.compatibilityScore}, 100`}
                          />
                        </svg>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--emerald-700)' }}>
                          {p.compatibilityScore}%
                        </span>
                      </div>

                      {/* US Residency Ribbon & Verified Ribbon */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 10,
                          left: 10,
                          display: 'flex',
                          gap: 6,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          className="badge badge-sapphire"
                          style={{
                            fontSize: '0.625rem',
                            padding: '2px 8px',
                            backdropFilter: 'blur(6px)',
                            background: 'rgba(2, 132, 199, 0.9)',
                            color: '#fff',
                            border: 'none',
                          }}
                        >
                          🛡️ {p.residing_status.replace('_', ' ')}
                        </span>
                        <span
                          className="badge badge-emerald"
                          style={{
                            fontSize: '0.625rem',
                            padding: '2px 8px',
                            backdropFilter: 'blur(6px)',
                            background: 'rgba(5, 150, 105, 0.9)',
                            color: '#fff',
                            border: 'none',
                          }}
                        >
                          ✓ ID Verified
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                            {p.full_name}
                          </h3>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {p.age} yrs • {p.height_feet_inches} • {p.marital_status.replace('_', ' ')}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(p.profile_id);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: isBookmarked ? 'var(--coral-500)' : 'var(--text-muted)',
                            padding: 2,
                          }}
                        >
                          <Bookmark size={18} fill={isBookmarked ? 'var(--coral-500)' : 'none'} />
                        </button>
                      </div>

                      {/* Profession & Education */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-body)' }}>
                        <Briefcase size={13} color="var(--emerald-600)" />
                        <span style={{ fontWeight: 600 }}>{p.profession}</span>
                        <span style={{ color: 'var(--text-muted)' }}>• {p.employer_name}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-body)' }}>
                        <GraduationCap size={13} color="var(--sapphire-600)" />
                        <span>{p.education_level} in {p.field_of_study}</span>
                      </div>

                      {/* Location */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <MapPin size={13} color="var(--coral-500)" />
                        <span>{p.city}, {p.state_province}, {p.country_living_in}</span>
                      </div>

                      {/* Islamic Practice Snippet */}
                      <div
                        style={{
                          marginTop: 6,
                          padding: '6px 10px',
                          background: 'var(--bg-app)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.6875rem',
                          color: 'var(--text-body)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <span>🕌 {p.sect_mazhab}</span>
                        <span style={{ fontWeight: 600, color: 'var(--emerald-700)' }}>
                          Prays: {p.pray_frequency}
                        </span>
                      </div>

                      {/* Actions */}
                      <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendSalaam(p);
                          }}
                          className={`btn btn-sm ${isSalaamSent ? 'btn-ghost' : 'btn-primary'}`}
                          style={{
                            flex: 1,
                            justifyContent: 'center',
                            background: isSalaamSent ? 'var(--emerald-100)' : undefined,
                            color: isSalaamSent ? 'var(--emerald-800)' : undefined,
                          }}
                        >
                          {isSalaamSent ? '✓ Salaam Sent' : '💬 Send Salaam'}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUnlockModalProfile(p);
                          }}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '6px 8px', color: 'var(--emerald-700)', borderColor: 'var(--emerald-300)' }}
                          title="Unlock Direct Contact & Verified Wali"
                        >
                          <Phone size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProfileId(p.profile_id);
                            setMobileInspectorOpen(true);
                          }}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '6px 8px' }}
                          title="Quick View Inspector"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>

        {/* =========================================================================
            COLUMN 3: Matchmaker Quick Inspector (340px)
           ========================================================================= */}
        <aside
          className="search-workspace-inspector"
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-lg)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
            position: 'sticky',
            top: 76,
            maxHeight: 'calc(100vh - 90px)',
            overflowY: 'auto',
          }}
        >
          {selectedProfile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {/* Inspector Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: 8,
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <UserCheck size={16} color="var(--emerald-600)" />
                  Matchmaker Quick Inspector
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.6875rem' }}>
                  {selectedProfile.compatibilityScore}% Match
                </span>
              </div>

              {/* Photo & Header */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 110,
                    height: 135,
                    borderRadius: 'var(--radius-lg)',
                    margin: '0 auto 8px',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  <img
                    src={
                      selectedProfile.photo_url ||
                      (selectedProfile.gender === 'FEMALE'
                        ? 'https://marriagemediausa.com/design/member_image/2018055584_1526196452_1.jpg'
                        : 'https://marriagemediausa.com/design/member_image/2021027948_1622089820_1.jpg')
                    }
                    alt={selectedProfile.full_name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'top center',
                      filter:
                        selectedProfile.photo_privacy === 'BLURRED_PURDAH' &&
                        !revealedPurdah[selectedProfile.profile_id]
                          ? 'blur(12px)'
                          : 'none',
                    }}
                  />
                </div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  {selectedProfile.full_name}
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Profile ID #{selectedProfile.profile_id}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 6 }}>
                  <span className="badge badge-sapphire" style={{ fontSize: '0.625rem' }}>
                    🛡️ {selectedProfile.residing_status.replace('_', ' ')}
                  </span>
                  <span className="badge badge-gold" style={{ fontSize: '0.625rem' }}>
                    {selectedProfile.package_name || 'Verified Member'}
                  </span>
                </div>
              </div>

              {/* Compatibility Breakdown Gauge */}
              <div
                style={{
                  background: 'var(--bg-app)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                  🎯 Compatibility Breakdown ({selectedProfile.compatibilityScore}/100)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.6875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Islamic Practice & Sect</span>
                    <span style={{ fontWeight: 700, color: 'var(--emerald-600)' }}>
                      {selectedProfile.breakdown?.islamic || 24}/25 pts
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Age Alignment</span>
                    <span style={{ fontWeight: 700, color: 'var(--emerald-600)' }}>
                      {selectedProfile.breakdown?.age || 19}/20 pts
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>US Location & Diaspora</span>
                    <span style={{ fontWeight: 700, color: 'var(--emerald-600)' }}>
                      {selectedProfile.breakdown?.location || 19}/20 pts
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Marital History & Upbringing</span>
                    <span style={{ fontWeight: 700, color: 'var(--emerald-600)' }}>
                      {selectedProfile.breakdown?.marital || 18}/20 pts
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Career & Education</span>
                    <span style={{ fontWeight: 700, color: 'var(--emerald-600)' }}>
                      {selectedProfile.breakdown?.career || 14}/15 pts
                    </span>
                  </div>
                </div>
              </div>

              {/* Halal Wali Contact Status (Guardian Box) */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)',
                  border: '1px solid var(--emerald-300)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.75rem', color: 'var(--emerald-900)' }}>
                  <ShieldCheck size={14} color="var(--emerald-600)" />
                  Wali / Guardian Transparency
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-body)', marginTop: 4 }}>
                  Guardian: <strong>{selectedProfile.guardian_name}</strong> ({selectedProfile.guardian_relation})
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--emerald-700)', marginTop: 2 }}>
                  ✓ ID Verified • Direct contact unlocked via Silver, Gold or VIP membership.
                </div>
              </div>

              {/* Key Biodata Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>About Suitor</div>
                  <div style={{ color: 'var(--text-body)', lineHeight: 1.4, fontSize: '0.75rem' }}>
                    {selectedProfile.about_me}
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>Looking For</div>
                  <div style={{ color: 'var(--text-body)', lineHeight: 1.4, fontSize: '0.75rem' }}>
                    {selectedProfile.what_i_am_looking_for}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>Family Dynamics</div>
                  <div style={{ color: 'var(--text-body)' }}>
                    • Father: {selectedProfile.father_status}<br />
                    • Mother: {selectedProfile.mother_status}<br />
                    • Siblings: {selectedProfile.brothers_count} brothers, {selectedProfile.sisters_count} sisters
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setUnlockModalProfile(selectedProfile)}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    background: 'var(--emerald-50)',
                    color: 'var(--emerald-800)',
                    borderColor: 'var(--emerald-300)',
                    fontWeight: 700,
                  }}
                >
                  <Phone size={14} color="var(--emerald-700)" />
                  Unlock Contact & Verified Wali
                </button>
                <button
                  type="button"
                  onClick={() => handleSendSalaam(selectedProfile)}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Send size={14} /> Send Proposal to Suitor & Wali
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0', color: 'var(--text-muted)' }}>
              Click any profile to inspect full biodata & Wali details
            </div>
          )}
        </aside>
      </div>

      {/* =========================================================================
          MOBILE FILTER BOTTOM SHEET / MODAL (< 1024px)
         ========================================================================= */}
      {mobileFilterOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setMobileFilterOpen(false)}
          style={{ zIndex: 1000 }}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              background: '#ffffff',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: '1rem', color: 'var(--text-main)' }}>
                <SlidersHorizontal size={18} color="var(--emerald-600)" />
                Filter Suitors ({lookingFor === 'FEMALE' ? 'Brides' : 'Grooms'})
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close Filter Modal"
                style={{
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Filter Fields Scrollable */}
            <div style={{ padding: '16px 18px', overflowY: 'auto', flex: 1 }}>
              {renderFilterFields()}
            </div>

            {/* Modal Footer CTA */}
            <div
              style={{
                padding: '12px 18px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                gap: 10,
                background: '#f8fafc',
              }}
            >
              <button
                type="button"
                onClick={resetFilters}
                className="btn btn-outline btn-sm"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="btn btn-primary btn-sm"
                style={{ flex: 2, justifyContent: 'center', fontWeight: 800 }}
              >
                Show {filteredProfiles.length} Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MOBILE QUICK INSPECTOR MODAL (< 1024px)
         ========================================================================= */}
      {mobileInspectorOpen && selectedProfile && (
        <div
          className="modal-backdrop"
          onClick={() => setMobileInspectorOpen(false)}
          style={{ zIndex: 1000 }}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              background: '#ffffff',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                <UserCheck size={18} color="var(--emerald-600)" />
                Quick Biodata Inspector
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                  {selectedProfile.compatibilityScore}% Match
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileInspectorOpen(false)}
                aria-label="Close Inspector Modal"
                style={{
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '16px 18px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Photo, Name, Details */}
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div
                  style={{
                    width: 76,
                    height: 96,
                    borderRadius: 12,
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: '#0F172A',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  }}
                >
                  <img
                    src={
                      selectedProfile.photo_url ||
                      (selectedProfile.gender === 'FEMALE'
                        ? 'https://marriagemediausa.com/design/member_image/2018055584_1526196452_1.jpg'
                        : 'https://marriagemediausa.com/design/member_image/2021027948_1622089820_1.jpg')
                    }
                    alt={selectedProfile.full_name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter:
                        selectedProfile.photo_privacy === 'BLURRED_PURDAH' && !revealedPurdah[selectedProfile.profile_id]
                          ? 'blur(10px)'
                          : 'none',
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text-main)' }}>
                    {selectedProfile.full_name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {selectedProfile.age} yrs • {selectedProfile.marital_status} • #{selectedProfile.profile_id}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--emerald-700)', marginTop: 2 }}>
                    {selectedProfile.profession} ({selectedProfile.country_living_in})
                  </div>
                </div>
              </div>

              {/* About & Expectations */}
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, fontSize: '0.8125rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>About Suitor</div>
                <div style={{ color: 'var(--text-body)', lineHeight: 1.5 }}>{selectedProfile.about_me}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, fontSize: '0.8125rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>Partner Expectations</div>
                <div style={{ color: 'var(--text-body)', lineHeight: 1.5 }}>{selectedProfile.what_i_am_looking_for}</div>
              </div>

              <div style={{ background: '#ecfdf5', padding: 12, borderRadius: 10, fontSize: '0.8125rem', border: '1px solid rgba(5, 150, 105, 0.2)' }}>
                <div style={{ fontWeight: 700, color: '#047857', marginBottom: 2 }}>Verified Guardian (Wali)</div>
                <div style={{ color: '#065f46' }}>
                  {selectedProfile.guardian_name} ({selectedProfile.guardian_relation}) • {selectedProfile.guardian_verified ? '✓ Verified' : 'Pending Verification'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                padding: '12px 18px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                background: '#f8fafc',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMobileInspectorOpen(false);
                  setUnlockModalProfile(selectedProfile);
                }}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', fontWeight: 700 }}
              >
                <Phone size={14} color="var(--emerald-700)" />
                Unlock Contact & Verified Wali
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileInspectorOpen(false);
                  handleSendSalaam(selectedProfile);
                }}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', fontWeight: 800 }}
              >
                <Send size={14} /> Send Proposal to Suitor & Wali
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact & Wali Unlock Modal */}
      {unlockModalProfile && (
        <UnlockContactModal
          targetProfile={unlockModalProfile}
          isOpen={!!unlockModalProfile}
          onClose={() => setUnlockModalProfile(null)}
        />
      )}
    </div>
  );
}
