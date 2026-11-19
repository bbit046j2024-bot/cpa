import { NextResponse } from 'next/server';
import { tidb } from '@/lib/tidb';
import { normalizeKenyanPhone } from '@/lib/phone';
import { secureJson, sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(props.params);
    const id = params?.id;
    if (!id) {
      return secureJson({ success: false, error: 'Supporter ID is required' }, { status: 400 });
    }

    const supporter = await tidb.getSupporterById(id);
    if (!supporter) {
      return secureJson({ success: false, error: 'Supporter not found' }, { status: 404 });
    }

    return secureJson({ success: true, supporter });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return secureJson({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(props.params);
    const id = params?.id;
    if (!id) {
      return secureJson({ success: false, error: 'Supporter ID is required' }, { status: 400 });
    }

    const body = await request.json();

    if (body.phoneNumber) {
      const val = normalizeKenyanPhone(body.phoneNumber);
      if (!val.isValid) {
        return secureJson({ success: false, error: val.error }, { status: 400 });
      }
      body.phoneNumber = val.normalized;
      body.rawPhone = val.formatted;
    }

    if (body.fullName) body.fullName = sanitizeString(body.fullName, 200);
    if (body.course) body.course = sanitizeString(body.course, 300);
    if (body.yearOfStudy) body.yearOfStudy = sanitizeString(body.yearOfStudy, 20);

    await tidb.updateSupporter(id, body);
    const updated = await tidb.getSupporterById(id);

    return secureJson({ success: true, supporter: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return secureJson({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(props.params);
    const id = params?.id;
    if (!id) {
      return secureJson({ success: false, error: 'Supporter ID is required' }, { status: 400 });
    }

    await tidb.deleteSupporter(id);
    return secureJson({ success: true, message: 'Supporter record deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return secureJson({ success: false, error: message }, { status: 500 });
  }
}
