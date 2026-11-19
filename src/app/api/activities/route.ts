import { NextResponse } from 'next/server';
import { tidb } from '@/lib/tidb';
import { secureJson, sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const activities = await tidb.getActivities();
    return secureJson({ success: true, activities });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return secureJson({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title    = sanitizeString(body.title, 200);
    const venue    = sanitizeString(body.venue, 200);
    const date     = sanitizeString(body.date, 20);
    const time     = sanitizeString(body.time, 10);
    const desc     = sanitizeString(body.description, 1000);
    const status   = sanitizeString(body.status, 20) || 'upcoming';
    const category = sanitizeString(body.category, 50) || 'hall_meeting';
    const audience = sanitizeString(body.targetAudience, 200) || 'Management Science Students';
    const creator  = sanitizeString(body.createdBy, 50) || 'admin';

    if (!title || !date || !venue) {
      return secureJson(
        { success: false, error: 'Title, date, and venue are required' },
        { status: 400 }
      );
    }

    const newActivity = {
      id: `act_${Date.now()}`,
      title,
      description: desc,
      date,
      time: time || '14:00',
      venue,
      status: status as 'upcoming' | 'completed' | 'cancelled',
      category: category as 'hall_meeting' | 'strategy' | 'outreach',
      targetAudience: audience,
      createdBy: creator,
    };

    await tidb.addActivity(newActivity);
    return secureJson({ success: true, activity: newActivity }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return secureJson({ success: false, error: message }, { status: 500 });
  }
}
