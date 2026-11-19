import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeKenyanPhone } from '@/lib/phone';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rows, actorId } = body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No data rows provided for import' },
        { status: 400 }
      );
    }

    const validItems: Array<{
      fullName: string;
      phoneNumber: string;
      rawPhone: string;
      course: string;
      yearOfStudy: string;
      communicationConsent: boolean;
      consentTimestamp: string;
      status: 'active' | 'inactive';
      source: string;
    }> = [];

    const skippedRows: Array<{ row: number; reason: string; data: unknown }> = [];

    rows.forEach((row, index) => {
      const name = (row.fullName || row['Full Name'] || row.name || '').trim();
      const rawContact = String(row.phoneNumber || row['Phone Number'] || row.contact || row.Phone || '').trim();
      const course = (row.course || row['Course'] || 'Management Science').trim();
      const year = (row.yearOfStudy || row['Year of Study'] || row.year || 'Year 2').trim();

      if (!name) {
        skippedRows.push({ row: index + 1, reason: 'Missing Full Name', data: row });
        return;
      }

      if (!rawContact) {
        skippedRows.push({ row: index + 1, reason: 'Missing Phone Number', data: row });
        return;
      }

      const phoneResult = normalizeKenyanPhone(rawContact);
      if (!phoneResult.isValid) {
        skippedRows.push({ row: index + 1, reason: `Invalid Kenyan Phone: ${rawContact}`, data: row });
        return;
      }

      validItems.push({
        fullName: name,
        phoneNumber: phoneResult.normalized,
        rawPhone: phoneResult.formatted,
        course,
        yearOfStudy: year,
        communicationConsent: true,
        consentTimestamp: new Date().toISOString(),
        status: 'active',
        source: 'Bulk File Import',
      });
    });

    const result = db.bulkAddSupporters(validItems, actorId || 'admin');

    return NextResponse.json({
      success: true,
      summary: {
        totalReceived: rows.length,
        addedCount: result.addedCount,
        duplicateCount: result.duplicateCount,
        invalidCount: skippedRows.length,
      },
      skippedRows,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error during import';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

