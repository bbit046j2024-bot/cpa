import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tidb } from '@/lib/tidb';
import { normalizeKenyanPhone } from '@/lib/phone';
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

    // Always fetch from TiDB first (source of truth - survives cold starts)
    let supporters: Supporter[] = [];
    try {
      supporters = await tidb.getSupporters();
      // Also hydrate in-memory cache so other local ops stay consistent
      supporters.forEach(s => {
        const existing = db.getSupporterById(s.id);
        if (!existing) {
          db.addSupporterToMemory?.(s);
        }
      });
    } catch (tidbErr) {
      console.warn('[TiDB] getSupporters failed, falling back to local store:', tidbErr);
      supporters = db.getSupporters();
    }

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

    return NextResponse.json({
      success: true,
      count: supporters.length,
      supporters,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch supporters';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phoneNumber, rawPhone, course, yearOfStudy, communicationConsent } = body;

    // Strict 4-field validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Full name is required (at least 2 characters)' },
        { status: 400 }
      );
    }

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const phoneValidation = normalizeKenyanPhone(phoneNumber);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { success: false, error: phoneValidation.error || 'Invalid Kenyan mobile phone number' },
        { status: 400 }
      );
    }

    if (!course || typeof course !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Departmental course is required' },
        { status: 400 }
      );
    }

    if (!yearOfStudy || typeof yearOfStudy !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Year of study is required' },
        { status: 400 }
      );
    }

    // Check duplicates directly in TiDB (source of truth)
    let allSupporters: Supporter[] = [];
    try {
      allSupporters = await tidb.getSupporters();
    } catch (e) {
      console.warn('[TiDB] getSupporters failed during duplicate check, using local:', e);
      allSupporters = db.getSupporters();
    }

    const normalizedPhone = phoneValidation.normalized;
    const trimmedName = fullName.trim().toUpperCase();

    const phoneExists = allSupporters.find(s => s.phoneNumber === normalizedPhone);
    if (phoneExists) {
      return NextResponse.json(
        { success: false, error: `A supporter with phone number ${normalizedPhone} is already registered (${phoneExists.fullName}).` },
        { status: 409 }
      );
    }

    // Name duplicate check (token-based)
    const nameExists = allSupporters.find(s => {
      const a = s.fullName.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
      const b = trimmedName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
      return a === b;
    });
    if (nameExists) {
      return NextResponse.json(
        { success: false, error: `A student named "${nameExists.fullName}" is already in the supporters register. Already-listed students cannot register again.` },
        { status: 409 }
      );
    }

    const newId = `sup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRecord: Supporter = {
      id: newId,
      fullName: trimmedName,
      phoneNumber: normalizedPhone,
      rawPhone: rawPhone || phoneValidation.formatted,
      course: course.trim(),
      yearOfStudy: yearOfStudy.trim(),
      communicationConsent: Boolean(communicationConsent),
      consentTimestamp: new Date().toISOString(),
      registrationDate: new Date().toISOString(),
      status: 'active',
      source: 'Online Supporter Portal',
    };

    // Write to TiDB first (persistent) — this NEVER throws EROFS
    await tidb.addSupporter(newRecord);

    // Also update in-memory local store (best-effort, may fail on EROFS which is fine)
    try {
      db.addSupporterToMemory?.(newRecord);
    } catch (_) { /* ignore local store errors */ }

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful! Thank you for joining the campaign community.',
        supporter: newRecord,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
