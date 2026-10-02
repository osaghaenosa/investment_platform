import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findInvestor, paymentsFor, paidTotal } from '@/lib/db';

export async function GET() {
  const inv = await findInvestor((await cookies()).get('inv')?.value);
  if (!inv) return NextResponse.json({ error: 'Not registered' }, { status: 401 });
  const paid = await paidTotal(inv.id);
  const payments = await paymentsFor(inv.id);
  return NextResponse.json({
    investor: { name: inv.name, phone: inv.phone, email: inv.email },
    total: inv.total, paid, remaining: Math.max(inv.total - paid, 0),
    currency: process.env.CURRENCY || 'NGN', payments,
  });
}
