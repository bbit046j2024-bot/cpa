import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { username, password, role } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const isValid = db.verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid campaign credentials. Please verify your password.' },
        { status: 401 }
      );
    }

    const user = {
      name: username === 'admin' ? 'Campaign Administrator' : username,
      username,
      role: role || 'admin',
      token: `token_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    };

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
