import { findInvestor, paymentByRef, updatePayment, paidTotal } from './db';
import { sendReceipt } from './mail';

// Verifies a Paystack transaction server-side and settles it exactly once.
export async function settle(reference) {
  const r = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  const j = await r.json();
  const t = j.data;
  if (!j.status || !t) return false;
  const p = await paymentByRef(reference);
  if (!p) return false;
  if (p.status === 'successful') return true; // already processed
  if (t.status !== 'success' || (t.amount / 100) < p.amount || t.currency !== p.currency) {
    if (t.status === 'failed' || t.status === 'abandoned') await updatePayment(p.tx_ref, { status: 'failed' });
    return false;
  }
  await updatePayment(p.tx_ref, { status: 'successful', paystackId: t.id, paidAt: new Date().toISOString() });
  const inv = await findInvestor(p.investorId);
  const paid = await paidTotal(inv.id);
  await sendReceipt({ to: inv.email, name: inv.name, amount: p.amount, currency: p.currency, ref: p.tx_ref, paid, total: inv.total });
  return true;
}
