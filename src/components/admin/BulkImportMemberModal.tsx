'use client';

import React, { useState } from 'react';
import { X, UploadCloud, Download, CheckCircle, AlertCircle, Copy, Check, Users, FileText, ArrowRight, FileSpreadsheet } from 'lucide-react';
import { broadcastSyncEvent } from '@/lib/sync/broadcastSync';
import * as XLSX from 'xlsx';

interface BulkImportMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  packages: Array<{ id: number; name: string; priceUsd: number; contactCredits: number; isActive: boolean }>;
}

interface ParsedMember {
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
  countryLivingIn?: string;
  stateProvince?: string;
  city?: string;
  profession?: string;
  educationLevel?: string;
  sectMazhab?: string;
  maritalStatus?: any;
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  packageId?: number;
  isValid: boolean;
  error?: string;
}

// Simple robust CSV line splitter respecting quoted fields
function parseCsvLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

export function BulkImportMemberModal({ isOpen, onClose, onSuccess, packages }: BulkImportMemberModalProps) {
  const [selectedPackageId, setSelectedPackageId] = useState<number>(packages[0]?.id || 1);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedMembers, setParsedMembers] = useState<ParsedMember[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError(null);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          setParseError('The uploaded workbook contains no sheets.');
          setParsedMembers([]);
          return;
        }
        const worksheet = workbook.Sheets[sheetName];
        const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        if (rawRows.length < 2) {
          setParseError('The uploaded file must contain a header row and at least one data row.');
          setParsedMembers([]);
          return;
        }

        const headers = rawRows[0].map((h: any) => String(h || '').toLowerCase().replace(/[^a-z0-9]/g, ''));
        const nameIdx = headers.findIndex((h: string) => h.includes('fullname') || h.includes('name'));
        const emailIdx = headers.findIndex((h: string) => h.includes('email'));
        const phoneIdx = headers.findIndex((h: string) => h.includes('phone') || h.includes('mobile'));
        const genderIdx = headers.findIndex((h: string) => h.includes('gender'));
        const dobIdx = headers.findIndex((h: string) => h.includes('dateofbirth') || h.includes('dob') || h.includes('birth'));
        const countryIdx = headers.findIndex((h: string) => h.includes('country'));
        const stateIdx = headers.findIndex((h: string) => h.includes('state') || h.includes('province'));
        const cityIdx = headers.findIndex((h: string) => h.includes('city'));
        const profIdx = headers.findIndex((h: string) => h.includes('profession') || h.includes('job'));
        const eduIdx = headers.findIndex((h: string) => h.includes('education'));
        const sectIdx = headers.findIndex((h: string) => h.includes('sect') || h.includes('mazhab'));
        const maritalIdx = headers.findIndex((h: string) => h.includes('marital'));
        const gNameIdx = headers.findIndex((h: string) => h.includes('guardianname'));
        const gRelIdx = headers.findIndex((h: string) => h.includes('guardianrelation'));
        const gPhoneIdx = headers.findIndex((h: string) => h.includes('guardianphone'));
        const pkgIdx = headers.findIndex((h: string) => h.includes('package'));

        if (nameIdx === -1 || emailIdx === -1 || phoneIdx === -1) {
          setParseError('Missing required columns: Full Name, Email, and Phone Number are mandatory.');
          setParsedMembers([]);
          return;
        }

        const members: ParsedMember[] = [];
        const seenEmails = new Set<string>();
        const seenPhones = new Set<string>();

        for (let i = 1; i < rawRows.length; i++) {
          const cols = rawRows[i].map((c: any) => String(c ?? '').trim());
          if (cols.length < 3 || cols.every((c: string) => !c)) continue;

          const fullName = cols[nameIdx] || '';
          const email = (cols[emailIdx] || '').toLowerCase().trim();
          const phone = cols[phoneIdx] || '';
          const cleanPhoneDigits = phone.replace(/\D/g, '');
          const rawGender = (cols[genderIdx] || 'MALE').toUpperCase();
          const gender: 'MALE' | 'FEMALE' = rawGender.includes('FEMALE') ? 'FEMALE' : 'MALE';
          
          let dob = '1995-01-01';
          if (dobIdx !== -1 && cols[dobIdx]) {
            const rawDob = cols[dobIdx];
            if (/^\d{4}-\d{2}-\d{2}/.test(rawDob)) {
              dob = rawDob.slice(0, 10);
            } else if (!isNaN(Date.parse(rawDob))) {
              dob = new Date(rawDob).toISOString().slice(0, 10);
            }
          }

          let isValid = true;
          let err: string | undefined;

          if (!fullName) {
            isValid = false;
            err = 'Name is required';
          } else if (!email.includes('@')) {
            isValid = false;
            err = 'Invalid email address';
          } else if (cleanPhoneDigits.length < 7) {
            isValid = false;
            err = 'Phone number too short (minimum 7 digits)';
          } else if (seenEmails.has(email)) {
            isValid = false;
            err = 'Duplicate email within workbook';
          } else if (seenPhones.has(cleanPhoneDigits)) {
            isValid = false;
            err = 'Duplicate phone within workbook';
          }

          if (email) seenEmails.add(email);
          if (cleanPhoneDigits) seenPhones.add(cleanPhoneDigits);

          members.push({
            fullName,
            email,
            phoneNumber: phone,
            gender,
            dateOfBirth: dob,
            countryLivingIn: countryIdx !== -1 ? cols[countryIdx] : undefined,
            stateProvince: stateIdx !== -1 ? cols[stateIdx] : undefined,
            city: cityIdx !== -1 ? cols[cityIdx] : undefined,
            profession: profIdx !== -1 ? cols[profIdx] : undefined,
            educationLevel: eduIdx !== -1 ? cols[eduIdx] : undefined,
            sectMazhab: sectIdx !== -1 ? cols[sectIdx] : undefined,
            maritalStatus: maritalIdx !== -1 ? cols[maritalIdx] : undefined,
            guardianName: gNameIdx !== -1 ? cols[gNameIdx] : undefined,
            guardianRelation: gRelIdx !== -1 ? cols[gRelIdx] : undefined,
            guardianPhone: gPhoneIdx !== -1 ? cols[gPhoneIdx] : undefined,
            packageId: pkgIdx !== -1 && cols[pkgIdx] ? Number(cols[pkgIdx]) : undefined,
            isValid,
            error: err,
          });
        }

        setParsedMembers(members);
      } catch (err: any) {
        setParseError(`Failed to parse Excel/CSV workbook: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExecuteImport = async () => {
    if (parsedMembers.length === 0) return;
    setIsImporting(true);
    setParseError(null);

    try {
      const validMembers = parsedMembers.filter((m) => m.isValid);
      const res = await fetch('/api/admin/members/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          members: validMembers,
          defaultPackageId: selectedPackageId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete bulk import.');
      }

      setImportResult(data.result);
      broadcastSyncEvent('MEMBER_PROVISIONED', { count: data.result.importedCount });
      onSuccess();
    } catch (err: any) {
      setParseError(err.message || 'Import failed.');
    } finally {
      setIsImporting(false);
    }
  };

  const copyToClipboard = (text: string, token: string) => {
    const fullUrl = `${window.location.origin}${text}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
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
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '840px',
          maxHeight: '92vh',
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
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, #F8FAFC, #FFFFFF)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
              }}
            >
              <Users size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Bulk Excel & CSV Member Import & Invite Dispatch
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                Batch onboard prospective members from Excel workbooks (.xlsx, .xls) or CSV with 30-day password setup links.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: '#F1F5F9',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#64748B',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Options Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155' }}>
                Default Package Tier:
              </label>
              <select
                value={selectedPackageId}
                onChange={(e) => setSelectedPackageId(Number(e.target.value))}
                className="input-3d"
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              >
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} (${Number(pkg.priceUsd).toLocaleString()} / {pkg.contactCredits} credits)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <a
                href="/api/admin/members/template?format=xlsx"
                download="muslimbibah_members_import_template.xlsx"
                className="btn-3d-gold"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  fontSize: '0.8rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 800,
                  backgroundColor: '#059669',
                  color: '#fff',
                }}
              >
                <FileSpreadsheet size={14} /> Download Excel (.xlsx) Template
              </a>
              <a
                href="/api/admin/members/template?format=csv"
                download="muslimbibah_members_import_template.csv"
                className="btn-3d-gold"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  fontSize: '0.8rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 800,
                }}
              >
                <Download size={14} /> Download CSV Template
              </a>
            </div>
          </div>

          {/* Upload Dropzone */}
          {!importResult && (
            <div
              style={{
                border: '2px dashed #CBD5E1',
                borderRadius: '12px',
                padding: '30px 20px',
                textAlign: 'center',
                backgroundColor: '#F8FAFC',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <input
                type="file"
                accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileUpload}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%',
                }}
              />
              <UploadCloud size={40} color="#059669" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontWeight: 800, color: '#1E293B', margin: '0 0 4px', fontSize: '0.95rem' }}>
                {fileName ? fileName : 'Click or Drag & Drop Excel (.XLSX, .XLS) or CSV File Here'}
              </p>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>
                Supports Excel 2007+ Workbooks (.xlsx), legacy spreadsheets (.xls), and UTF-8 CSV with automated header mapping and in-file duplicate detection.
              </p>
            </div>
          )}

          {/* Parse Errors */}
          {parseError && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#B91C1C',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{parseError}</span>
            </div>
          )}

          {/* Preflight Parsed Table Preview */}
          {!importResult && parsedMembers.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E293B' }}>
                  Parsed Records Preview ({parsedMembers.filter((m) => m.isValid).length} ready / {parsedMembers.length} total)
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Assigned Default Tier: <strong>{packages.find((p) => p.id === selectedPackageId)?.name}</strong>
                </span>
              </div>

              <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead style={{ background: '#F8FAFC', position: 'sticky', top: 0 }}>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '8px 12px', color: '#475569' }}>Name</th>
                      <th style={{ padding: '8px 12px', color: '#475569' }}>Email</th>
                      <th style={{ padding: '8px 12px', color: '#475569' }}>Phone</th>
                      <th style={{ padding: '8px 12px', color: '#475569' }}>Gender</th>
                      <th style={{ padding: '8px 12px', color: '#475569' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedMembers.slice(0, 20).map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: row.isValid ? '#FFFFFF' : '#FFF1F2' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0F172A' }}>{row.fullName || '—'}</td>
                        <td style={{ padding: '8px 12px', color: '#334155' }}>{row.email || '—'}</td>
                        <td style={{ padding: '8px 12px', color: '#334155' }}>{row.phoneNumber || '—'}</td>
                        <td style={{ padding: '8px 12px', color: '#334155' }}>{row.gender}</td>
                        <td style={{ padding: '8px 12px' }}>
                          {row.isValid ? (
                            <span style={{ color: '#059669', fontWeight: 700 }}>Ready</span>
                          ) : (
                            <span style={{ color: '#E11D48', fontWeight: 700 }}>{row.error}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedMembers.length > 20 && (
                <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px', textAlign: 'right' }}>
                  Showing first 20 of {parsedMembers.length} records.
                </p>
              )}
            </div>
          )}

          {/* Import Result Screen */}
          {importResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <CheckCircle size={36} color="#059669" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#065F46' }}>
                    Bulk Import Completed Successfully!
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#047857' }}>
                    <strong>{importResult.importedCount}</strong> new accounts created &bull;{' '}
                    <strong>{importResult.skippedDuplicatesCount}</strong> duplicates skipped &bull;{' '}
                    <strong>{importResult.errors?.length || 0}</strong> issues.
                  </p>
                </div>
              </div>

              {/* Generated Invites Table */}
              {importResult.importedMembers && importResult.importedMembers.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>
                    Generated 30-Day Setup Links (Send to Prospective Candidates)
                  </h4>
                  <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead style={{ background: '#F8FAFC', position: 'sticky', top: 0 }}>
                        <tr style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                          <th style={{ padding: '8px 12px' }}>Candidate Name</th>
                          <th style={{ padding: '8px 12px' }}>Email</th>
                          <th style={{ padding: '8px 12px' }}>Profile ID</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.importedMembers.map((m: any, idx: number) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '8px 12px', fontWeight: 700 }}>{m.fullName}</td>
                            <td style={{ padding: '8px 12px' }}>{m.email}</td>
                            <td style={{ padding: '8px 12px', color: '#059669', fontWeight: 700 }}>#{m.profileId}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(m.inviteLink, m.inviteToken)}
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '0.75rem',
                                  borderRadius: '6px',
                                  border: '1px solid #CBD5E1',
                                  backgroundColor: copiedToken === m.inviteToken ? '#ECFDF5' : '#FFFFFF',
                                  color: copiedToken === m.inviteToken ? '#059669' : '#334155',
                                  cursor: 'pointer',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                }}
                              >
                                {copiedToken === m.inviteToken ? <Check size={12} /> : <Copy size={12} />}
                                {copiedToken === m.inviteToken ? 'Copied' : 'Copy Invite Link'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          {importResult ? (
            <button
              type="button"
              onClick={onClose}
              className="btn-3d-emerald"
              style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 800 }}
            >
              Done & Close
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isImporting || parsedMembers.filter((m) => m.isValid).length === 0}
                onClick={handleExecuteImport}
                className="btn-3d-emerald"
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: isImporting || parsedMembers.filter((m) => m.isValid).length === 0 ? 'not-allowed' : 'pointer',
                  opacity: isImporting || parsedMembers.filter((m) => m.isValid).length === 0 ? 0.6 : 1,
                }}
              >
                <Users size={16} />
                {isImporting
                  ? 'Importing Batch...'
                  : `Import ${parsedMembers.filter((m) => m.isValid).length} Members`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
