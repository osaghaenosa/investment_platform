import { NextResponse } from 'next/server';
import { settle } from '@/lib/payments';

// Paystack redirects the investor here after checkout.
export async function GET(req) {
  const q = new URL(req.url).searchParams;
  const reference = q.get('reference');
  let result = 'failed';
  if (reference) result = (await settle(reference)) ? 'success' : 'failed';
  return NextResponse.redirect(new URL(`/dashboard?payment=${result}`, process.env.APP_URL));
}
