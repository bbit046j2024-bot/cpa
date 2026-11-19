import { NextResponse } from 'next/server';
import { tidb } from '@/lib/tidb';
import { normalizeKenyanPhone } from '@/lib/phone';
import { secureJson, sanitizeString } from '@/lib/security';
import { Supporter } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const course = searchParams.get('course') || '';
    const year = searchParams.get('year') || '';
    const consent = searchParams.get('consent');
    const status = searchParams.get('status') || '';

    // Always fetch directly from TiDB Cloud
    let supporters = await tidb.getSupporters();

    if (search) {
      supporters = supporters.filter(
        (s) =>
          s.fullName.toLowerCase().includes(search) ||
          s.phoneNumber.includes(search) ||
          (s.rawPhone && s.rawPhone.includes(search))
      );
    }

    if (course) {
      supporters = supporters.filter((s) => s.course === course);
    }

    if (year) {
      supporters = supporters.filter((s) => s.yearOfStudy === year);
    }

    if (consent !== null && consent !== undefined && consent !== '') {
      const isConsent = consent === 'true';
      supporters = supporters.filter((s) => s.communicationConsent === isConsent);
    }

    if (status) {
      supporters = supporters.filter((s) => s.status === status);
    }

    return secureJson({
      success: true,
      count: supporters.length,
      supporters,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch supporters';
    return secureJson({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawFullName = sanitizeString(body.fullName, 200);
    const rawPhone = sanitizeString(body.phoneNumber, 25);
    const rawCourse = sanitizeString(body.course, 300);
    const rawYear = sanitizeString(body.yearOfStudy, 20);
    const communicationConsent = Boolean(body.communicationConsent);

    // Strict 4-field validation
    if (!rawFullName || rawFullName.length < 2) {
      return secureJson(
        { success: false, error: 'Full name is required (at least 2 characters)' },
        { status: 400 }
      );
    }

    if (!rawPhone) {
      return secureJson(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const phoneValidation = normalizeKenyanPhone(rawPhone);
    if (!phoneValidation.isValid) {
      return secureJson(
        { success: false, error: phoneValidation.error || 'Invalid Kenyan mobile phone number' },
        { status: 400 }
      );
    }

    if (!rawCourse) {
      return secureJson(
        { success: false, error: 'Departmental course is required' },
        { status: 400 }
      );
    }

    if (!rawYear) {
      return secureJson(
        { success: false, error: 'Year of study is required' },
        { status: 400 }
      );
    }

    // Check duplicates directly in TiDB
    const allSupporters = await tidb.getSupporters();
    const normalizedPhone = phoneValidation.normalized;
    const trimmedName = rawFullName.toUpperCase();

    const phoneExists = allSupporters.find(s => s.phoneNumber === normalizedPhone);
    if (phoneExists) {
      return secureJson(
        { success: false, error: `A supporter with phone number ${normalizedPhone} is already registered (${phoneExists.fullName}).` },
        { status: 409 }
      );
    }

    // Token-based matching so reversed first/last name matches
    const nameNormInput = trimmedName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
    const nameExists = allSupporters.find(s => {
      const a = s.fullName.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
      if (a === nameNormInput) return true;
      const tokensA = a.split(' ').sort().join(' ');
      const tokensB = nameNormInput.split(' ').sort().join(' ');
      return tokensA.length > 2 && tokensA === tokensB;
    });

    if (nameExists) {
      return secureJson(
        { success: false, error: `A student named "${nameExists.fullName}" is already listed in the supporters register (${nameExists.course}, ${nameExists.yearOfStudy}). Already listed students cannot register again.` },
        { status: 409 }
      );
    }

    const newId = `sup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRecord: Supporter = {
      id: newId,
      fullName: trimmedName,
      phoneNumber: normalizedPhone,
      rawPhone: phoneValidation.formatted,
      course: rawCourse,
      yearOfStudy: rawYear,
      communicationConsent,
      consentTimestamp: new Date().toISOString(),
      registrationDate: new Date().toISOString(),
      status: 'active',
      source: 'Online Supporter Portal',
    };

    // Write to TiDB Cloud
    await tidb.addSupporter(newRecord);

    return secureJson(
      {
        success: true,
        message: 'Registration successful! Thank you for joining the campaign community.',
        supporter: newRecord,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return secureJson({ success: false, error: message }, { status: 500 });
  }
}
