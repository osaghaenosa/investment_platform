import { NextResponse } from 'next/server';
import { settle } from '@/lib/payments';

import crypto from 'crypto';

// Backup in case the investor closes the tab before being redirected.
// In Paystack dashboard: Settings > Webhooks > URL = APP_URL/api/webhook
export async function POST(req) {
  const bodyText = await req.text();
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(bodyText).digest('hex');
  if (req.headers.get('x-paystack-signature') !== hash) return NextResponse.json({}, { status: 401 });
  
  const body = JSON.parse(bodyText);
  if (body.event === 'charge.success' && body.data?.reference) {
    await settle(body.data.reference);
  }
  return NextResponse.json({ ok: true });
}
