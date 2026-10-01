import { findInvestor, paymentByRef, updatePayment, paidTotal } from './db';
import { sendReceipt } from './mail';

// Verifies a Flutterwave transaction server-side and settles it exactly once.
export async function settle(transactionId) {
  const r = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
  });
  const j = await r.json();
  const t = j.data;
  if (j.status !== 'success' || !t) return false;
  const p = paymentByRef(t.tx_ref);
  if (!p) return false;
  if (p.status === 'successful') return true; // already processed
  if (t.status !== 'successful' || t.amount < p.amount || t.currency !== p.currency) {
    updatePayment(p.tx_ref, { status: 'failed' });
    return false;
  }
  updatePayment(p.tx_ref, { status: 'successful', flwId: t.id, paidAt: new Date().toISOString() });
  const inv = findInvestor(p.investorId);
  await sendReceipt({ to: inv.email, name: inv.name, amount: p.amount, currency: p.currency, ref: p.tx_ref, paid: paidTotal(inv.id), total: inv.total });
  return true;
}
