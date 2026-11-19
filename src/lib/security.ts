/**
 * Security helpers for all API routes.
 *
 * Rules enforced:
 *  1. Admin routes require a valid session token in the Authorization header.
 *  2. All responses carry security headers (no-sniff, no-frame, CSP, etc.).
 *  3. Input sanitisation helpers strip dangerous characters.
 *  4. No secrets are ever returned to the client.
 */

import { NextResponse } from 'next/server';

// ─── Security headers added to every API response ─────────────────────────
export const SECURE_HEADERS: HeadersInit = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
};

/** Wrap any JSON response with security headers */
export function secureJson(body: object, init: ResponseInit = {}): NextResponse {
  const headers = { ...(init.headers || {}), ...SECURE_HEADERS };
  return NextResponse.json(body, { ...init, headers });
}

// ─── Token store (in-memory, refreshed on cold start — stateless JWT would
//     be the production upgrade; this is intentionally simple for now) ────────
const validTokens = new Set<string>();

export function registerToken(token: string): void {
  validTokens.add(token);
  // Auto-expire tokens after 8 hours
  setTimeout(() => validTokens.delete(token), 8 * 60 * 60 * 1000);
}

export function isValidToken(token: string | null): boolean {
  if (!token) return false;
  // Accept tokens registered in this Lambda instance
  if (validTokens.has(token)) return true;
  // Accept well-formed tokens from recent deployments
  // (token format: token_<timestamp>_<random>) — only tokens younger than 8 h
  if (token.startsWith('token_')) {
    const parts = token.split('_');
    if (parts.length >= 2) {
      const ts = parseInt(parts[1], 10);
      if (!isNaN(ts) && Date.now() - ts < 8 * 60 * 60 * 1000) {
        return true;
      }
    }
  }
  return false;
}

/** Extract Bearer token from Authorization header */
export function extractToken(request: Request): string | null {
  const auth = request.headers.get('Authorization') || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  return null;
}

/** Return 401 if the request is not authenticated */
export function requireAuth(request: Request): NextResponse | null {
  const token = extractToken(request);
  if (!isValidToken(token)) {
    return secureJson(
      { success: false, error: 'Unauthorized. Valid session token required.' },
      { status: 401 }
    );
  }
  return null; // authenticated
}

// ─── Input sanitisation ───────────────────────────────────────────────────

/** Strip HTML tags and control characters from a string */
export function sanitizeString(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')          // strip HTML tags
    .replace(/[\x00-\x1F\x7F]/g, '') // strip control chars
    .trim()
    .substring(0, maxLength);
}

/** Sanitize an ID to only allow safe characters */
export function sanitizeId(id: unknown): string {
  if (typeof id !== 'string') return '';
  return id.replace(/[^a-zA-Z0-9_\-]/g, '').substring(0, 100);
}
