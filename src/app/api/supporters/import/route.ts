import { NextResponse } from 'next/server';
import { tidb } from '@/lib/tidb';
import { normalizeKenyanPhone } from '@/lib/phone';
import { secureJson, sanitizeString } from '@/lib/security';
import { Supporter } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rows, actorId } = body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return secureJson(
        { success: false, error: 'No data rows provided for import' },
        { status: 400 }
      );
    }

    if (rows.length > 500) {
      return secureJson(
        { success: false, error: 'Maximum 500 rows per import batch' },
        { status: 400 }
      );
    }

    const validItems: Supporter[] = [];
    const skippedRows: Array<{ row: number; reason: string }> = [];

    rows.forEach((row, index) => {
      const name        = sanitizeString(row.fullName || row['Full Name'] || row.name || '', 200);
      const rawContact  = sanitizeString(String(row.phoneNumber || row['Phone Number'] || row.contact || row.Phone || ''), 20);
      const course      = sanitizeString(row.course || row['Course'] || 'Management Science', 300);
      const year        = sanitizeString(row.yearOfStudy || row['Year of Study'] || row.year || 'Year 2', 20);

      if (!name) {
        skippedRows.push({ row: index + 1, reason: 'Missing Full Name' });
        return;
      }
      if (!rawContact) {
        skippedRows.push({ row: index + 1, reason: 'Missing Phone Number' });
        return;
      }

      const phoneResult = normalizeKenyanPhone(rawContact);
      if (!phoneResult.isValid) {
        skippedRows.push({ row: index + 1, reason: `Invalid Kenyan Phone: ${rawContact}` });
        return;
      }

      validItems.push({
        id: `sup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${index}`,
        fullName: name,
        phoneNumber: phoneResult.normalized,
        rawPhone: phoneResult.formatted,
        course,
        yearOfStudy: year,
        communicationConsent: true,
        consentTimestamp: new Date().toISOString(),
        registrationDate: new Date().toISOString(),
        status: 'active',
        source: 'Bulk File Import',
      });
    });

    // Write directly to TiDB (deduplication handled inside bulkAddSupporters)
    const result = await tidb.bulkAddSupporters(validItems);

    return secureJson({
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
    return secureJson({ success: false, error: message }, { status: 500 });
  }
}
