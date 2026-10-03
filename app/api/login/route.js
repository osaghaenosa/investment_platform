import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findByPhone } from '@/lib/db';

export async function POST(req) {
  const { phone, email } = await req.json();
  const cleanPhone = String(phone || '').replace(/[\s-]/g, '');
  
  if (!/^\+?\d{7,15}$/.test(cleanPhone) || !/^\S+@\S+\.\S+$/.test(email || '')) {
    return NextResponse.json({ error: 'Please enter a valid phone number and email.' }, { status: 400 });
  }

  const inv = await findByPhone(cleanPhone);
  
  // Verify that the account exists and the email matches (used as a simple authentication factor)
  if (!inv || inv.email.toLowerCase() !== email.toLowerCase().trim()) {
    return NextResponse.json({ error: 'No account found with this phone number and email combination.' }, { status: 401 });
  }

  (await cookies()).set('inv', inv.id, { 
    httpOnly: true, 
    sameSite: 'lax', 
    secure: process.env.NODE_ENV === 'production', 
    path: '/', 
    maxAge: 60 * 60 * 24 * 365 
  });
  
  return NextResponse.json({ ok: true });
}
