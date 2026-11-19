import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const activities = db.getActivities();
    return NextResponse.json({ success: true, activities });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, date, time, venue, status, category, targetAudience, createdBy } = body;

    if (!title || !date || !venue) {
      return NextResponse.json(
        { success: false, error: 'Title, date, and venue are required' },
        { status: 400 }
      );
    }

    const activity = db.addActivity(
      {
        title,
        description: description || '',
        date,
        time: time || '14:00',
        venue,
        status: status || 'upcoming',
        category: category || 'hall_meeting',
        targetAudience: targetAudience || 'Management Science Students',
        createdBy: createdBy || 'admin',
      },
      createdBy || 'admin'
    );

    return NextResponse.json({ success: true, activity }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
