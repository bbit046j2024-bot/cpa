import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { SECURE_HEADERS, secureJson } from '@/lib/security';

export function getAllowedClassRepOrigin(request: Request): string | null {
  const origin = request.headers.get('origin');
  if (!origin) return null;
  const allowed = (process.env.CLASS_REP_ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean);
  return allowed.includes(origin.replace(/\/$/, '')) ? origin : null;
}

export function classRepCorsHeaders(origin: string): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  };
}

export function classRepPreflight(request: Request): Response {
  if (!process.env.CLASS_REP_ALLOWED_ORIGINS) {
    return secureJson({ success: false, error: 'Registration service is not configured.' }, { status: 503 });
  }
  const origin = getAllowedClassRepOrigin(request);
  if (!origin) {
    return secureJson({ success: false, error: 'Origin is not allowed.' }, { status: 403 });
  }
  const headers = new Headers(SECURE_HEADERS);
  for (const [key, value] of Object.entries(classRepCorsHeaders(origin))) {
    if (typeof value === 'string') headers.set(key, value);
  }
  return new NextResponse(null, { status: 204, headers });
}

export function classRepJson(request: Request, body: object, status = 200): Response {
  if (!process.env.CLASS_REP_ALLOWED_ORIGINS) {
    return secureJson({ success: false, error: 'Registration service is not configured.' }, { status: 503 });
  }
  const origin = getAllowedClassRepOrigin(request);
  if (!origin) {
    return secureJson({ success: false, error: 'Origin is not allowed.' }, { status: 403 });
  }
  return secureJson(body, { status, headers: classRepCorsHeaders(origin) });
}

export function requireClassRepReviewToken(request: Request): NextResponse | null {
  const expected = process.env.CLASS_REP_REVIEW_TOKEN || '';
  if (!expected) {
    return secureJson({ success: false, error: 'Class representative review is not configured.' }, { status: 503 });
  }
  const authorization = request.headers.get('authorization') || '';
  const provided = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  const expectedBytes = Buffer.from(expected);
  const providedBytes = Buffer.from(provided);
  const matches = expectedBytes.length === providedBytes.length && expectedBytes.length > 0
    ? timingSafeEqual(expectedBytes, providedBytes)
    : false;
  if (!matches) {
    return secureJson({ success: false, error: 'A valid class representative review token is required.' }, { status: 401 });
  }
  return null;
}
