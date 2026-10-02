import mongoose from 'mongoose';

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Please define the MONGODB_URI environment variable inside your .env file');
  
  if (cached.conn) return cached.conn;
  
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { bufferCommands: false }).then(m => m);
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}

const InvestorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  total: { type: Number, required: true },
  createdAt: { type: String, required: true },
}, { strict: false });

const PaymentSchema = new mongoose.Schema({
  tx_ref: { type: String, required: true, unique: true },
  investorId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, required: true },
  createdAt: { type: String, required: true },
  termsAcceptedAt: { type: String },
  paystackId: { type: Number },
  paidAt: { type: String },
}, { strict: false });

const Investor = mongoose.models.Investor || mongoose.model('Investor', InvestorSchema);
const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

export const findInvestor = async (id) => { if (!id) return null; await connectMongo(); return Investor.findOne({ id }).lean(); };
export const findByPhone = async (phone) => { if (!phone) return null; await connectMongo(); return Investor.findOne({ phone }).lean(); };
export const createInvestor = async (inv) => { await connectMongo(); await Investor.create(inv); };
export const addPayment = async (p) => { await connectMongo(); await Payment.create(p); };
export const paymentByRef = async (ref) => { if (!ref) return null; await connectMongo(); return Payment.findOne({ tx_ref: ref }).lean(); };
export const updatePayment = async (ref, patch) => { if (!ref) return; await connectMongo(); await Payment.updateOne({ tx_ref: ref }, { $set: patch }); };
export const paymentsFor = async (id) => { 
  if (!id) return [];
  await connectMongo(); 
  const p = await Payment.find({ investorId: id }).lean();
  return p.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};
export const paidTotal = async (id) => { 
  const p = await paymentsFor(id);
  return p.filter(x => x.status === 'successful').reduce((s, x) => s + x.amount, 0); 
};
