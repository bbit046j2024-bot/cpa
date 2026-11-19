import { NextResponse } from 'next/server';
import { tidb } from '@/lib/tidb';
import { normalizeKenyanPhone } from '@/lib/phone';
import { secureJson } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || '';
    const phone = searchParams.get('phone') || '';

    let phoneValidation = null;
    let normalizedPhone = '';
    if (phone.trim()) {
      phoneValidation = normalizeKenyanPhone(phone);
      if (phoneValidation.isValid) {
        normalizedPhone = phoneValidation.normalized;
      }
    }

    const allSupporters = await tidb.getSupporters();

    // Check name duplicate
    let existingByName: any = undefined;
    if (name && name.trim().length >= 2) {
      const normInput = name.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
      existingByName = allSupporters.find(s => {
        const normExisting = s.fullName.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
        if (normExisting === normInput) return true;
        const tokensA = normExisting.split(' ').sort().join(' ');
        const tokensB = normInput.split(' ').sort().join(' ');
        return tokensA.length > 2 && tokensA === tokensB;
      });
    }

    // Check phone duplicate
    let existingByPhone: any = undefined;
    const phoneToFind = normalizedPhone || phone.trim();
    if (phoneToFind.length >= 5) {
      existingByPhone = allSupporters.find(s => s.phoneNumber === phoneToFind || s.rawPhone === phoneToFind);
    }

    return secureJson({
      success: true,
      phoneValidation,
      nameConflict: existingByName
        ? {
            exists: true,
            fullName: existingByName.fullName,
            course: existingByName.course,
            yearOfStudy: existingByName.yearOfStudy,
          }
        : { exists: false },
      phoneConflict: existingByPhone
        ? {
            exists: true,
            fullName: existingByPhone.fullName,
            phoneNumber: existingByPhone.phoneNumber,
          }
        : { exists: false },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Validation error';
    return secureJson({ success: false, error: message }, { status: 500 });
  }
}
