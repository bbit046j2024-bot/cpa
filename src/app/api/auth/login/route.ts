import { NextResponse } from 'next/server';
import { tidb } from '@/lib/tidb';
import { registerToken, secureJson, sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = sanitizeString(body.username, 50);
    const password = sanitizeString(body.password, 100);
    const role = sanitizeString(body.role, 20);

    if (!username || !password) {
      return secureJson(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Always verify against TiDB (source of truth — survives cold starts)
    const storedPassword = await tidb.getAdminPassword();
    if (password !== storedPassword) {
      // Add a small delay to slow brute-force attempts
      await new Promise(r => setTimeout(r, 400));
      return secureJson(
        { success: false, error: 'Invalid campaign credentials. Please verify your password.' },
        { status: 401 }
      );
    }

    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    registerToken(token);

    return secureJson({
      success: true,
      message: 'Authentication successful',
      user: {
        name: username === 'admin' ? 'Campaign Administrator' : username,
        username,
        role: role || 'admin',
        token,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return secureJson({ success: false, error: message }, { status: 500 });
  }
}
