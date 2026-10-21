import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get('format')?.toLowerCase() || 'csv';

  const rows = [
    {
      'Full Name': 'Tariq Al-Mansoor',
      'Email': 'tariq.mansoor@example.com',
      'Phone Number': '+13135550188',
      'Gender': 'MALE',
      'Date of Birth (YYYY-MM-DD)': '1995-04-12',
      'Country Living In': 'United States (USA)',
      'State/Province': 'Michigan',
      'City': 'Dearborn',
      'Profession': 'Software Architect',
      'Education Level': "Master's Degree",
      'Sect/Mazhab': 'Sunni / Hanafi',
      'Marital Status': 'NEVER_MARRIED',
      'Guardian Name': 'Rashid Al-Mansoor',
      'Guardian Relation': 'Father',
      'Guardian Phone': '+13135550189',
      'Package ID': 1,
    },
    {
      'Full Name': 'Fatima Noor',
      'Email': 'fatima.noor@example.com',
      'Phone Number': '+17185550192',
      'Gender': 'FEMALE',
      'Date of Birth (YYYY-MM-DD)': '1998-08-20',
      'Country Living In': 'United States (USA)',
      'State/Province': 'New York',
      'City': 'Brooklyn',
      'Profession': 'Clinical Psychologist',
      'Education Level': 'Doctorate',
      'Sect/Mazhab': 'Sunni / Shafii',
      'Marital Status': 'NEVER_MARRIED',
      'Guardian Name': 'Dr. Kamal Noor',
      'Guardian Relation': 'Father',
      'Guardian Phone': '+17185550193',
      'Package ID': 1,
    },
  ];

  if (format === 'xlsx') {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Members');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="muslimbibah_members_import_template.xlsx"',
        'Cache-Control': 'no-store',
      },
    });
  }

  const csvHeaders = Object.keys(rows[0]).join(',');
  const csvRows = rows.map((r) =>
    Object.values(r)
      .map((val) => (typeof val === 'string' && val.includes(',') ? `"${val}"` : val))
      .join(',')
  );
  const csvContent = `${csvHeaders}\n${csvRows.join('\n')}\n`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="muslimbibah_members_import_template.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
