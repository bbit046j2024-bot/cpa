import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tidb } from '@/lib/tidb';
import { normalizeKenyanPhone } from '@/lib/phone';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(props.params);
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Supporter ID is required' }, { status: 400 });
    }

    // Try local cache first, then TiDB
    let supporter = db.getSupporterById(id);
    if (!supporter) {
      const all = await tidb.getSupporters().catch(() => []);
      supporter = all.find(s => s.id === id);
    }
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
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(props.params);
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Supporter ID is required' }, { status: 400 });
    }

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

    // Update in TiDB first (source of truth)
    await tidb.updateSupporter(id, body).catch(err => console.error('[TiDB Update Error]:', err));

    // Then update local cache
    const updated = db.updateSupporter(id, body, body.actorId || 'admin');

    return NextResponse.json({ success: true, supporter: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
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
      return NextResponse.json({ success: false, error: 'Supporter ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const actorId = searchParams.get('actorId') || 'admin';

    // Delete from TiDB first (source of truth - always works, no EROFS)
    await tidb.deleteSupporter(id);

    // Also remove from local in-memory cache (best-effort)
    db.deleteSupporter(id, actorId);

    return NextResponse.json({ success: true, message: 'Supporter record deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
