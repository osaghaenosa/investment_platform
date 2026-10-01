import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import { findInvestor, paidTotal, addPayment } from '@/lib/db';
import { BRAND } from '@/lib/config';

export async function POST(req) {
  const inv = findInvestor((await cookies()).get('inv')?.value);
  if (!inv) return NextResponse.json({ error: 'Not registered' }, { status: 401 });
  const { amount, agreed } = await req.json();
  const amt = Number(amount);
  const remaining = inv.total - paidTotal(inv.id);
  if (!agreed) return NextResponse.json({ error: 'You must accept the terms and conditions.' }, { status: 400 });
  if (!(amt > 0) || amt > remaining) return NextResponse.json({ error: 'Enter an amount between 1 and your remaining balance.' }, { status: 400 });

  const currency = process.env.CURRENCY || 'NGN';
  const tx_ref = `INV-${randomUUID()}`;
  const res = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tx_ref, amount: amt, currency, redirect_url: `${process.env.APP_URL}/api/verify`,
      customer: { email: inv.email, name: inv.name, phonenumber: inv.phone },
      customizations: { title: `${BRAND} investment`, description: 'Investment payment' },
    }),
  });
  const j = await res.json();
  if (j.status !== 'success') return NextResponse.json({ error: 'Could not start payment. Try again.' }, { status: 502 });

  addPayment({ tx_ref, investorId: inv.id, amount: amt, currency, status: 'pending', createdAt: new Date().toISOString(), termsAcceptedAt: new Date().toISOString() });
  return NextResponse.json({ link: j.data.link });
}
