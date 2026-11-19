import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeKenyanPhone } from '@/lib/phone';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supporter = db.getSupporterById(id);

    if (!supporter) {
      return NextResponse.json({ success: false, error: 'Supporter not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, supporter });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // If phone number is being changed, normalize and validate
    if (body.phoneNumber) {
      const val = normalizeKenyanPhone(body.phoneNumber);
      if (!val.isValid) {
        return NextResponse.json({ success: false, error: val.error }, { status: 400 });
      }
      body.phoneNumber = val.normalized;
      body.rawPhone = val.formatted;
    }

    const updated = db.updateSupporter(id, body, body.actorId || 'admin');

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Supporter not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, supporter: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const actorId = searchParams.get('actorId') || 'admin';

    const deleted = db.deleteSupporter(id, actorId);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Supporter not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Supporter record deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

