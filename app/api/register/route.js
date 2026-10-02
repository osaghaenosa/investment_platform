import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import { createInvestor, findByPhone } from '@/lib/db';

export async function POST(req) {
  const { name, phone, email, amount } = await req.json();
  const total = Number(amount);
  const cleanPhone = String(phone || '').replace(/[\s-]/g, '');
  if (!name?.trim() || !/^\+?\d{7,15}$/.test(cleanPhone) || !/^\S+@\S+\.\S+$/.test(email || '') || !(total > 0))
    return NextResponse.json({ error: 'Check your details: name, a valid phone, a valid email and an amount above 0.' }, { status: 400 });
  if (await findByPhone(cleanPhone))
    return NextResponse.json({ error: 'This phone number is already registered. Contact us to update your account.' }, { status: 409 });

  const id = randomUUID();
  await createInvestor({ id, name: name.trim(), phone: cleanPhone, email: email.trim(), total, createdAt: new Date().toISOString() });
  (await cookies()).set('inv', id, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 365 });
  return NextResponse.json({ ok: true });
}
