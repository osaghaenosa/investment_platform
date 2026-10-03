'use client';
import { useEffect, useState, useRef } from 'react';
import { BRAND, TERMS, money } from '@/lib/config';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function Dashboard() {
  const [d, setD] = useState(null); const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(''); const [agreed, setAgreed] = useState(false);
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [note, setNote] = useState('');
  const [receipt, setReceipt] = useState(null);
  const receiptRef = useRef(null);

  const downloadPdf = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(`Receipt_${receipt.tx_ref}.pdf`);
  };

  const shareReceipt = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current, { scale: 2 });
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `Receipt_${receipt.tx_ref}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ title: 'Investment Receipt', text: `Receipt for ${money(receipt.amount, receipt.currency)}`, files: [file] });
        } catch (e) { console.error('Share failed:', e); }
      } else if (navigator.share) {
        try {
          await navigator.share({ title: 'Investment Receipt', text: `Receipt for ${money(receipt.amount, receipt.currency)}. Reference: ${receipt.tx_ref}` });
        } catch (e) { console.error('Share failed:', e); }
      } else {
        alert("Sharing is not supported on this device.");
      }
    });
  };

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
            <tr key={p.tx_ref} onClick={() => setReceipt(p)} className="clickable"><td>{new Date(p.createdAt).toLocaleDateString('en-GB')}</td><td>{p.tx_ref.slice(0, 12)}…</td>
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
      {receipt && (
        <div className="overlay" onClick={() => setReceipt(null)}>
          <div className="modal" style={{ padding: '0', background: '#f3f4f6' }} onClick={(e) => e.stopPropagation()}>
            <div ref={receiptRef} style={{ background: '#ffffff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#0b3b34', padding: '30px', textAlign: 'center', color: '#ffffff' }}>
                <h1 style={{ margin: 0, fontSize: '24px' }}>Payment Receipt</h1>
              </div>
              
              <div className={`stamp stamp-${receipt.status}`}>
                {receipt.status}
              </div>

              <div style={{ padding: '40px 30px' }}>
                <p style={{ marginTop: 0 }}>Hi <strong>{d.investor.name}</strong>,</p>
                <p>Thank you for your payment. We have successfully recorded your transaction.</p>
                
                <div style={{ margin: '30px 0', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '20px 0' }}>
                  <h2 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '1px', marginTop: 0, marginBottom: '15px' }}>Transaction Details</h2>
                  
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '8px 0', color: '#6b7280', fontSize: '15px' }}>Amount Paid</td>
                        <td style={{ padding: '8px 0', color: '#111827', fontSize: '15px', textAlign: 'right', fontWeight: 'bold' }}>{money(receipt.amount, receipt.currency)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 0', color: '#6b7280', fontSize: '15px' }}>Reference Number</td>
                        <td style={{ padding: '8px 0', color: '#111827', fontSize: '15px', textAlign: 'right' }}>{receipt.tx_ref}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 0', color: '#6b7280', fontSize: '15px' }}>Date</td>
                        <td style={{ padding: '8px 0', color: '#111827', fontSize: '15px', textAlign: 'right' }}>{new Date(receipt.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ backgroundColor: '#f9fafb', borderRadius: '6px', padding: '20px', marginBottom: '30px' }}>
                  <h3 style={{ fontSize: '14px', color: '#374151', marginTop: 0, marginBottom: '10px' }}>Investment Summary</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '5px 0', color: '#6b7280', fontSize: '14px' }}>Total Goal</td>
                        <td style={{ padding: '5px 0', color: '#111827', fontSize: '14px', textAlign: 'right' }}>{money(d.total, d.currency)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>&copy; {new Date().getFullYear()} {BRAND}. All rights reserved.</p>
                </div>
              </div>
            </div>
            
            <div className="row" style={{ padding: '20px', borderTop: '1px solid #e5e7eb', background: '#fff' }}>
              <button className="ghost" onClick={() => setReceipt(null)}>Close</button>
              <button className="ghost" onClick={shareReceipt}>Share</button>
              <button className="btn" onClick={downloadPdf}>Download PDF</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
