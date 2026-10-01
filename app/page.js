'use client';
import { useState } from 'react';
import { BRAND } from '@/lib/config';

export default function Home() {
  const [f, setF] = useState({ name: '', phone: '', email: '', amount: '' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    const r = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const j = await r.json();
    if (r.ok) window.location.href = '/dashboard'; else { setErr(j.error); setBusy(false); }
  }

  return (
    <main className="split">
      <section className="hero">
        <div className="brand">{BRAND}</div>
        <h1>Put your capital to work, at your own pace.</h1>
        <p>Tell us how much you plan to invest. Pay it all at once or in instalments, and watch your commitment fill up as each payment lands.</p>
        <div className="gauge" aria-hidden="true"><i /></div>
        <small>Payments are processed by Flutterwave. Every payment is confirmed by email.</small>
      </section>
      <section className="panel">
        <form onSubmit={submit} className="card">
          <h2>Start your investment</h2>
          <label>Full name<input required value={f.name} onChange={set('name')} autoComplete="name" /></label>
          <label>Phone number<input required type="tel" placeholder="+234 801 234 5678" value={f.phone} onChange={set('phone')} autoComplete="tel" /></label>
          <label>Email for receipts<input required type="email" value={f.email} onChange={set('email')} autoComplete="email" /></label>
          <label>Total amount you want to invest (NGN)<input required type="number" min="1" inputMode="numeric" value={f.amount} onChange={set('amount')} /></label>
          {err && <p className="err" role="alert">{err}</p>}
          <button className="btn" disabled={busy}>{busy ? 'Creating account…' : 'Create my dashboard'}</button>
        </form>
      </section>
    </main>
  );
}
