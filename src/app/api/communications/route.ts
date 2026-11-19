import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const communications = db.getCommunications();
    const settings = db.getSettings();
    return NextResponse.json({ success: true, communications, smsSettings: settings.smsProvider });
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
      return NextResponse.json({ success: false, error: 'Title and message are required' }, { status: 400 });
    }

    // Determine consented recipient count
    let eligibleSupporters = db.getSupporters().filter((s) => s.communicationConsent && s.status === 'active');

    if (targetCourse && targetCourse !== 'all') {
      eligibleSupporters = eligibleSupporters.filter((s) => s.course === targetCourse);
    }

    if (targetYear && targetYear !== 'all') {
      eligibleSupporters = eligibleSupporters.filter((s) => s.yearOfStudy === targetYear);
    }

    const settings = db.getSettings();

    // If channel is SMS and provider is not approved/enabled
    if (channel === 'sms' && !settings.smsProvider.enabled) {
      // Save as draft with compliant explanation
      const comm = db.addCommunication({
        title,
        message,
        channel: 'sms',
        targetCourse: targetCourse || 'all',
        targetYear: targetYear || 'all',
        recipientCount: eligibleSupporters.length,
        status: 'draft',
        createdBy: createdBy || 'admin',
      });

      return NextResponse.json({
        success: true,
        message: 'Communication drafted successfully. SMS provider requires electoral platform clearance before direct live dispatch.',
        communication: comm,
        warning: 'SMS provider currently in sandbox/pending clearance mode.',
      });
    }

    const comm = db.addCommunication({
      title,
      message,
      channel: channel || 'sms',
      targetCourse: targetCourse || 'all',
      targetYear: targetYear || 'all',
      recipientCount: eligibleSupporters.length,
      status: 'sent',
      sentAt: new Date().toISOString(),
      createdBy: createdBy || 'admin',
    });

    return NextResponse.json({ success: true, communication: comm }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

