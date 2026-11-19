import { NextResponse } from 'next/server';
import { tidb } from '@/lib/tidb';
import { secureJson } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return secureJson(
        { success: false, error: 'Both current password and new password are required' },
        { status: 400 }
      );
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return secureJson(
        { success: false, error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Reject passwords that are obviously weak
    if (['password', '123456', 'admin', 'cpa2026'].includes(newPassword.toLowerCase()) && newPassword === currentPassword) {
      return secureJson(
        { success: false, error: 'New password must be different from your current password' },
        { status: 400 }
      );
    }

    // Verify current password directly from TiDB (source of truth)
    const storedPassword = await tidb.getAdminPassword();
    if (currentPassword !== storedPassword) {
      await new Promise(r => setTimeout(r, 400)); // brute-force delay
      return secureJson(
        { success: false, error: 'Current password does not match existing records' },
        { status: 401 }
      );
    }

    // Save new password directly to TiDB
    await tidb.setAdminPassword(newPassword);

    return secureJson({
      success: true,
      message: 'Administrator password changed successfully.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return secureJson({ success: false, error: message }, { status: 500 });
  }
}
