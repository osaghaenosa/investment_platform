// Simple JSON-file store for getting started. For production (and Vercel, whose
// filesystem is read-only) swap these functions for Postgres/Supabase/MongoDB.
import fs from 'fs';
import path from 'path';
const FILE = path.join(process.cwd(), 'data', 'db.json');
const read = () => { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return { investors: [], payments: [] }; } };
const write = (d) => { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); };

export const findInvestor = (id) => read().investors.find((i) => i.id === id);
export const findByPhone = (phone) => read().investors.find((i) => i.phone === phone);
export const createInvestor = (inv) => { const d = read(); d.investors.push(inv); write(d); };
export const addPayment = (p) => { const d = read(); d.payments.push(p); write(d); };
export const paymentByRef = (ref) => read().payments.find((p) => p.tx_ref === ref);
export const updatePayment = (ref, patch) => {
  const d = read(); const p = d.payments.find((x) => x.tx_ref === ref);
  if (p) Object.assign(p, patch); write(d);
};
export const paymentsFor = (id) => read().payments.filter((p) => p.investorId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export const paidTotal = (id) => paymentsFor(id).filter((p) => p.status === 'successful').reduce((s, p) => s + p.amount, 0);
