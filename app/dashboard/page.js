'use client';
import { useEffect, useState } from 'react';
import { BRAND, TERMS, money } from '@/lib/config';

export default function Dashboard() {
  const [d, setD] = useState(null); const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(''); const [agreed, setAgreed] = useState(false);
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [note, setNote] = useState('');

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('payment');
    if (p) setNote(p);
    fetch('/api/me').then(async (r) => (r.status === 401 ? (window.location.href = '/') : setD(await r.json())));
  }, []);

  if (!d) return <main className="loading">Loading your dashboard…</main>;
  const pct = Math.min(100, Math.round((d.paid / d.total) * 100));
  const notes = {
    success: ['ok', 'Payment received. A receipt is on its way to your email.'],
    failed: ['bad', 'We could not confirm that payment. You have not been charged, or it will be reversed.'],
    cancelled: ['bad', 'Payment cancelled. Nothing was charged.'],
  };

  async function pay() {
    setBusy(true); setErr('');
    const r = await fetch('/api/pay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount, agreed }) });
    const j = await r.json();
    if (r.ok) window.location.href = j.link; else { setErr(j.error); setBusy(false); }
  }
  const openPay = () => { setAmount(String(d.remaining)); setAgreed(false); setErr(''); setOpen(true); };

  return (
    <main className="dash">
      <header><div className="brand dark">{BRAND}</div><span>{d.investor.name}</span></header>
      {notes[note] && <p className={`banner ${notes[note][0]}`} role="status">{notes[note][1]}</p>}

      <section className="summary">
        <div>
          <p className="lead">You have invested</p>
          <p className="big">{money(d.paid, d.currency)}</p>
          <p className="of">of your {money(d.total, d.currency)} commitment · {money(d.remaining, d.currency)} remaining</p>
        </div>
        <div className="ring" style={{ '--p': pct }}><span>{pct}%</span></div>
      </section>
      <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100"><i style={{ width: pct + '%' }} /></div>

      <div className="actions">
        {d.remaining > 0
          ? <button className="btn" onClick={openPay}>Make a payment</button>
          : <p className="done">Your commitment is fully paid. Thank you.</p>}
      </div>

      <h3>Payment history</h3>
      {d.payments.length === 0 ? <p className="muted">No payments yet. Make your first payment to start investing.</p> : (
        <div className="scroll"><table>
          <thead><tr><th>Date</th><th>Reference</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>{d.payments.map((p) => (
            <tr key={p.tx_ref}><td>{new Date(p.createdAt).toLocaleDateString('en-GB')}</td><td>{p.tx_ref.slice(0, 12)}…</td>
              <td>{money(p.amount, p.currency)}</td><td><span className={`tag ${p.status}`}>{p.status}</span></td></tr>))}
          </tbody></table></div>
      )}

      {open && (
        <div className="overlay" onClick={() => setOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="Payment" onClick={(e) => e.stopPropagation()}>
            <h2>Make a payment</h2>
            <label>Amount to pay now (max {money(d.remaining, d.currency)})
              <input type="number" min="1" max={d.remaining} value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
            <h4>Terms and conditions</h4>
            <ol className="terms">{TERMS.map((t, i) => <li key={i}>{t}</li>)}</ol>
            <label className="check"><input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} /> I have read and agree to the terms and conditions</label>
            {err && <p className="err" role="alert">{err}</p>}
            <div className="row">
              <button className="ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn" disabled={!agreed || busy} onClick={pay}>{busy ? 'Redirecting…' : 'Pay with Paystack'}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
