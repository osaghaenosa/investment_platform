import { NextResponse } from 'next/server';
import { settle } from '@/lib/payments';

// Backup in case the investor closes the tab before being redirected.
// In Flutterwave dashboard: Settings > Webhooks > URL = APP_URL/api/webhook, secret hash = FLW_SECRET_HASH.
export async function POST(req) {
  if (req.headers.get('verif-hash') !== process.env.FLW_SECRET_HASH) return NextResponse.json({}, { status: 401 });
  const body = await req.json();
  if (body?.data?.id) await settle(body.data.id);
  return NextResponse.json({ ok: true });
}
