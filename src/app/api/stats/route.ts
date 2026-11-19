import { NextResponse } from 'next/server';
import { tidb } from '@/lib/tidb';
import { secureJson } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Always from TiDB — supporters list is the live source of truth
    const stats = await tidb.getStats();
    return secureJson({ success: true, stats });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch stats';
    return secureJson({ success: false, error: message }, { status: 500 });
  }
}
