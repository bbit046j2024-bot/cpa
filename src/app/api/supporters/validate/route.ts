import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeKenyanPhone } from '@/lib/phone';

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

    const dupCheck = db.checkSupporterDuplicate(name, normalizedPhone || phone);

    return NextResponse.json({
      success: true,
      phoneValidation,
      nameConflict: dupCheck.nameExists
        ? {
            exists: true,
            fullName: dupCheck.existingByName?.fullName,
            course: dupCheck.existingByName?.course,
            yearOfStudy: dupCheck.existingByName?.yearOfStudy,
          }
        : { exists: false },
      phoneConflict: dupCheck.phoneExists
        ? {
            exists: true,
            fullName: dupCheck.existingByPhone?.fullName,
            phoneNumber: dupCheck.existingByPhone?.phoneNumber,
          }
        : { exists: false },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Validation error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
