import { NextResponse } from 'next/server';
import { tidb } from '@/lib/tidb';
import { secureJson, sanitizeString } from '@/lib/security';
import { requireClassRepReviewToken } from '@/lib/class-representatives';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authError = requireClassRepReviewToken(request);
  if (authError) return authError;

  try {
    const status = new URL(request.url).searchParams.get('status') || '';
    const registrations = await tidb.getClassRepresentatives(status);
    return secureJson({ success: true, count: registrations.length, registrations });
  } catch (error) {
    console.error('[Class Rep Review] Could not list registrations:', error);
    return secureJson({ success: false, error: 'Could not load class representative registrations.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const authError = requireClassRepReviewToken(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const id = sanitizeString(body.id, 64);
    const status = sanitizeString(body.status, 20);
    if (!id || !['pending', 'verified', 'rejected'].includes(status)) {
      return secureJson({ success: false, error: 'A registration ID and valid review status are required.' }, { status: 400 });
    }

    const updated = await tidb.reviewClassRepresentative(id, status as 'pending' | 'verified' | 'rejected');
    if (!updated) {
      return secureJson({ success: false, error: 'Registration not found.' }, { status: 404 });
    }
    return secureJson({ success: true, message: `Registration marked ${status}.` });
  } catch (error) {
    console.error('[Class Rep Review] Could not update registration:', error);
    return secureJson({ success: false, error: 'Could not update the registration.' }, { status: 500 });
  }
}
