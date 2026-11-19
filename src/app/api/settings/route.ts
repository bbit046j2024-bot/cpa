import { NextResponse } from 'next/server';
import { tidb } from '@/lib/tidb';
import { secureJson } from '@/lib/security';
import { DEFAULT_SETTINGS } from '@/lib/defaults';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await tidb.getSettings();
    // Merge with defaults for any missing fields; never expose adminPassword to client
    const safe = { ...DEFAULT_SETTINGS, ...(settings || {}) };
    delete (safe as any).adminPassword; // SECURITY: never send password to client
    return secureJson({ success: true, settings: safe });
  } catch (error) {
    return secureJson({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    // Block direct password updates through settings endpoint (use /api/auth/change-password)
    delete body.adminPassword;

    const current = await tidb.getSettings();
    const updated = { ...DEFAULT_SETTINGS, ...(current || {}), ...body };
    await tidb.saveSettings(updated);

    // Never return password to client
    const safe = { ...updated };
    delete (safe as any).adminPassword;
    return secureJson({ success: true, settings: safe });
  } catch (error) {
    return secureJson({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}
