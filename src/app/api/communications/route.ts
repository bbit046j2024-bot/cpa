import { NextResponse } from 'next/server';
import { tidb } from '@/lib/tidb';
import { sendBulkSms } from '@/lib/sms';
import { secureJson, sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [communications, settings] = await Promise.all([
      tidb.getCommunications(),
      tidb.getSettings(),
    ]);

    // Never expose adminPassword or secrets in the response
    const safeSmsSettings = settings?.smsProvider || { enabled: false };

    return secureJson({
      success: true,
      communications,
      smsSettings: safeSmsSettings,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return secureJson({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title        = sanitizeString(body.title, 200);
    const message      = sanitizeString(body.message, 1600); // SMS safe max
    const rawChannel   = sanitizeString(body.channel, 20);
    const channel: 'sms' | 'whatsapp' = rawChannel === 'whatsapp' ? 'whatsapp' : 'sms';
    const targetCourse = sanitizeString(body.targetCourse, 200) || 'all';
    const targetYear   = sanitizeString(body.targetYear, 20) || 'all';
    const createdBy    = sanitizeString(body.createdBy, 50) || 'admin';

    if (!title || !message) {
      return secureJson(
        { success: false, error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Pull live supporter list from TiDB for recipient filtering
    let allSupporters = await tidb.getSupporters();
    let eligible = allSupporters.filter(s => s.communicationConsent && s.status === 'active');
    if (targetCourse && targetCourse !== 'all') {
      eligible = eligible.filter(s => s.course === targetCourse);
    }
    if (targetYear && targetYear !== 'all') {
      eligible = eligible.filter(s => s.yearOfStudy === targetYear);
    }

    const recipientPhones = eligible.map(s => s.phoneNumber).filter(Boolean);

    let dispatchResult = null;
    if (channel === 'sms' && recipientPhones.length > 0) {
      dispatchResult = await sendBulkSms(recipientPhones, message);
    }

    const status: 'draft' | 'sent' | 'failed' = channel === 'sms' && dispatchResult && !dispatchResult.success ? 'draft' : 'sent';

    const comm = {
      id: `comm_${Date.now()}`,
      title,
      message,
      channel,
      targetCourse,
      targetYear,
      recipientCount: eligible.length,
      status,
      createdAt: new Date().toISOString(),
      sentAt: status === 'sent' ? new Date().toISOString() : undefined,
      createdBy,
    };

    await tidb.addCommunication(comm);

    return secureJson({ success: true, communication: comm, dispatchResult }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return secureJson({ success: false, error: message }, { status: 500 });
  }
}
