import { NextResponse } from 'next/server';
import { tidb } from '@/lib/tidb';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Both current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 4 characters long' },
        { status: 400 }
      );
    }

    // Verify current password directly from TiDB (source of truth)
    const storedPassword = await tidb.getAdminPassword();
    if (currentPassword !== storedPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password does not match existing records' },
        { status: 401 }
      );
    }

    // Save new password directly to TiDB
    await tidb.setAdminPassword(newPassword);

    return NextResponse.json({
      success: true,
      message: 'Administrator password changed successfully.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
