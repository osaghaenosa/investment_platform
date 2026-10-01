import { NextResponse } from 'next/server';
import { settle } from '@/lib/payments';

// Flutterwave redirects the investor here after checkout.
export async function GET(req) {
  const q = new URL(req.url).searchParams;
  const id = q.get('transaction_id');
  let result = q.get('status') === 'cancelled' ? 'cancelled' : 'failed';
  if (id && result !== 'cancelled') result = (await settle(id)) ? 'success' : 'failed';
  return NextResponse.redirect(new URL(`/dashboard?payment=${result}`, process.env.APP_URL));
}
