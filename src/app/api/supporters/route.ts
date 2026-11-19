import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeKenyanPhone } from '@/lib/phone';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const course = searchParams.get('course') || '';
    const year = searchParams.get('year') || '';
    const consent = searchParams.get('consent');
    const status = searchParams.get('status') || '';

    let supporters = db.getSupporters();

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

    const result = db.addSupporter({
      fullName: fullName.trim(),
      phoneNumber: phoneValidation.normalized,
      rawPhone: rawPhone || phoneValidation.formatted,
      course: course.trim(),
      yearOfStudy: yearOfStudy.trim(),
      communicationConsent: Boolean(communicationConsent),
      consentTimestamp: new Date().toISOString(),
      status: 'active',
      source: 'Online Supporter Portal',
    });

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 409 } // Conflict
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful! Thank you for joining the campaign community.',
        supporter: result.supporter,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
