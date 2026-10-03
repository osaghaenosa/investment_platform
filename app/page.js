'use client';
import { useState } from 'react';
import { BRAND } from '@/lib/config';

export default function Home() {
  const [isLogin, setIsLogin] = useState(false);
  const [f, setF] = useState({ name: '', phone: '', email: '', amount: '' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    const endpoint = isLogin ? '/api/login' : '/api/register';
    const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const j = await r.json();
    if (r.ok) window.location.href = '/dashboard'; else { setErr(j.error); setBusy(false); }
  }

  return (
    <main className="split">
      <section className="hero">
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="https://www.zacnosinventory.com/icon-72.png" alt="Zacnos Capital" width="32" height="32" style={{ borderRadius: '4px' }}/>
          {BRAND}
        </div>
        <h1>Put your capital to work, at your own pace.</h1>
        <p>Tell us how much you plan to invest. Pay it all at once or in instalments, and watch your commitment fill up as each payment lands.</p>
        <div className="gauge" aria-hidden="true"><i /></div>
        <small>Payments are processed by Paystack. Every payment is confirmed by email.</small>
      </section>
      <section className="panel">
        <form onSubmit={submit} className="card">
          <h2>{isLogin ? 'Log in to your account' : 'Start your investment'}</h2>
          
          {!isLogin && <label>Full name<input required value={f.name} onChange={set('name')} autoComplete="name" /></label>}
          <label>Phone number<input required type="tel" placeholder="+234 801 234 5678" value={f.phone} onChange={set('phone')} autoComplete="tel" /></label>
          <label>Email {isLogin ? '' : 'for receipts'}<input required type="email" value={f.email} onChange={set('email')} autoComplete="email" /></label>
          {!isLogin && <label>Total amount you want to invest (NGN)<input required type="number" min="1" inputMode="numeric" value={f.amount} onChange={set('amount')} /></label>}
          
          {err && <p className="err" role="alert">{err}</p>}
          <button className="btn" disabled={busy}>{busy ? 'Please wait…' : (isLogin ? 'Log in' : 'Create my dashboard')}</button>
          
          <div style={{ textAlign: 'center', margin: '10px 0 0', fontSize: '0.9rem', color: 'var(--mute)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={() => { setIsLogin(!isLogin); setErr(''); }} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>
              {isLogin ? 'Register here' : 'Log in'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
