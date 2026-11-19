import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { tidb } from '@/lib/tidb';
import { normalizeKenyanPhone } from '@/lib/phone';
import { sanitizeString } from '@/lib/security';
import { classRepJson, classRepPreflight, getAllowedClassRepOrigin } from '@/lib/class-representatives';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function OPTIONS(request: Request) {
  return classRepPreflight(request);
}

export async function GET(request: Request) {
  return NextResponse.json({
    success: true,
    service: 'CPA Class Representative Registration API',
    status: 'online',
    acceptedMethods: ['POST', 'OPTIONS'],
    message: 'This API endpoint accepts registration form submissions via POST from authorized campaign portals.',
  });
}

export async function POST(request: Request) {
  const origin = getAllowedClassRepOrigin(request);
  if (!origin) {
    if (!process.env.CLASS_REP_ALLOWED_ORIGINS) {
      return NextResponse.json({ success: false, error: 'Registration service is not configured.' }, { status: 503 });
    }
    return NextResponse.json({ success: false, error: 'Origin is not allowed.' }, { status: 403 });
  }

  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    return classRepJson(request, { success: false, error: 'Send registration details as JSON.' }, 415);
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 4096) {
    return classRepJson(request, { success: false, error: 'Registration request is too large.' }, 413);
  }

  try {
    const body = await request.json();
    const fullName = sanitizeString(body.fullName, 200);
    const rawContact = sanitizeString(body.contact, 254);
    const course = sanitizeString(body.course, 255);
    const yearOfStudy = sanitizeString(body.yearOfStudy, 20);

    if (fullName.length < 2) {
      return classRepJson(request, { success: false, error: 'Enter your full name.' }, 400);
    }
    if (!course) {
      return classRepJson(request, { success: false, error: 'Enter your course or programme.' }, 400);
    }
    if (!/^Year [1-6]$/i.test(yearOfStudy)) {
      return classRepJson(request, { success: false, error: 'Select a valid year of study.' }, 400);
    }
    if (body.classRepresentative !== true || body.dataUseConsent !== true) {
      return classRepJson(request, { success: false, error: 'Only current class representatives may register.' }, 403);
    }

    let contact: string;
    let contactType: 'phone' | 'email';
    const phone = normalizeKenyanPhone(rawContact);
    if (phone.isValid) {
      contact = phone.normalized;
      contactType = 'phone';
    } else if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(rawContact)) {
      contact = rawContact.toLowerCase();
      contactType = 'email';
    } else {
      return classRepJson(request, { success: false, error: 'Enter a valid Kenyan mobile number or email address.' }, 400);
    }

    const registration = {
      id: `cr_${randomUUID()}`,
      fullName,
      contact,
      contactType,
      course,
      yearOfStudy: yearOfStudy.replace(/^year/i, 'Year'),
      classRepConfirmed: true,
      privacyConsent: true,
      consentAt: new Date().toISOString(),
      registeredAt: new Date().toISOString(),
      source: 'Aggrey Faculty Representative 2026/2027',
    };

    await tidb.addClassRepresentative(registration);
    return classRepJson(request, {
      success: true,
      message: 'Registration received and pending class representative verification.',
    }, 201);
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY') {
      return classRepJson(request, { success: false, error: 'This contact is already registered for class representative verification.' }, 409);
    }
    console.error('[Class Rep Registration] Request could not be saved:', error);
    return classRepJson(request, { success: false, error: 'Registration could not be saved. Please try again later.' }, 500);
  }
}
