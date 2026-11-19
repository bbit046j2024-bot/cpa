export interface SendSmsResult {
  success: boolean;
  message: string;
  recipientsCount: number;
  data?: any;
  error?: string;
}

export async function sendBulkSms(
  to: string[],
  messageText: string
): Promise<SendSmsResult> {
  const apiKey = process.env.AT_API_KEY || process.env.AFRICASTALKING_API_KEY;
  const username = process.env.AT_USERNAME || process.env.AFRICASTALKING_USERNAME || 'sandbox';
  const senderId = process.env.AT_SENDER_ID || process.env.AFRICASTALKING_SENDER_ID || process.env.SMS_SENDER_ID || 'ELISHA2026';
  const isEnabled = process.env.SMS_ENABLED === 'true';

  if (!to || to.length === 0) {
    return {
      success: false,
      message: 'No recipients provided',
      recipientsCount: 0,
    };
  }

  // If live SMS is not enabled or API key is not yet set, operate in safe sandbox/draft mode
  if (!isEnabled || !apiKey) {
    console.log(`[SMS Safe Mode] Would send to ${to.length} recipients: "${messageText}"`);
    return {
      success: true,
      message: !apiKey 
        ? 'Drafted successfully. Add AT_API_KEY to .env.local to enable live Africa\'s Talking dispatch.'
        : 'Drafted in sandbox mode (SMS_ENABLED=false).',
      recipientsCount: to.length,
      data: { mode: 'sandbox_or_disabled', recipients: to },
    };
  }

  const endpoint = username === 'sandbox'
    ? 'https://api.sandbox.africastalking.com/version1/messaging'
    : 'https://api.africastalking.com/version1/messaging';

  const bodyParams = new URLSearchParams();
  bodyParams.append('username', username);
  bodyParams.append('to', to.join(','));
  bodyParams.append('message', messageText);

  if (senderId && senderId !== 'sandbox') {
    bodyParams.append('from', senderId);
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apiKey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: bodyParams.toString(),
    });

    const data = await response.json();
    return {
      success: response.ok,
      message: response.ok ? 'SMS dispatched successfully' : 'SMS provider dispatch failed',
      recipientsCount: to.length,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Network error communicating with Africa\'s Talking SMS gateway',
      recipientsCount: to.length,
      error: error.message || String(error),
    };
  }
}
