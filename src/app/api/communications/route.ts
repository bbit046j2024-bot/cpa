import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendBulkSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const communications = db.getCommunications();
    const settings = db.getSettings();
    return NextResponse.json({
      success: true,
      communications,
      smsSettings: settings.smsProvider,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, message, channel, targetCourse, targetYear, createdBy } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Determine consented recipient count (ONLY consented and active supporters)
    let eligibleSupporters = db
      .getSupporters()
      .filter((s) => s.communicationConsent && s.status === 'active');

    if (targetCourse && targetCourse !== 'all') {
      eligibleSupporters = eligibleSupporters.filter((s) => s.course === targetCourse);
    }

    if (targetYear && targetYear !== 'all') {
      eligibleSupporters = eligibleSupporters.filter((s) => s.yearOfStudy === targetYear);
    }

    const recipientPhones = eligibleSupporters
      .map((s) => s.phoneNumber)
      .filter(Boolean);

    let dispatchResult = null;

    if (channel === 'sms' && recipientPhones.length > 0) {
      dispatchResult = await sendBulkSms(recipientPhones, message);
    }

    const status = channel === 'sms' && dispatchResult && !dispatchResult.success ? 'draft' : 'sent';

    const comm = db.addCommunication({
      title,
      message,
      channel: channel || 'sms',
      targetCourse: targetCourse || 'all',
      targetYear: targetYear || 'all',
      recipientCount: eligibleSupporters.length,
      status,
      sentAt: status === 'sent' ? new Date().toISOString() : undefined,
      createdBy: createdBy || 'admin',
    });

    return NextResponse.json(
      {
        success: true,
        communication: comm,
        dispatchResult,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
