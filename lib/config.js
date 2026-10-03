export const BRAND = 'Zacnos Capital';
export const money = (n, cur = 'NGN') =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n || 0);
export const TERMS = [
  'You confirm that the funds you invest are lawfully obtained and belong to you.',
  'Your investment is a commitment of the total amount you registered. You may pay it in instalments, and each payment is recorded against that total.',
  'All investments carry risk. Returns are not guaranteed and past performance does not predict future results.',
  'Payments are processed securely by Paystack. We never see or store your card details.',
  'Once a payment is confirmed it is non-refundable except where required by law or agreed in writing with us.',
  'You will receive an email receipt for each successful payment. Your dashboard updates once the payment is verified.',
  'We may update these terms. Material changes will be communicated by email before they apply to new payments.',
];
