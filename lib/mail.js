import nodemailer from 'nodemailer';
import { BRAND, money } from './config';

export async function sendReceipt({ to, name, amount, currency, ref, paid, total }) {
  try {
    const t = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await t.sendMail({
      from: process.env.MAIL_FROM, to, subject: `Payment received: ${money(amount, currency)}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#0b3b34">
        <h2>Thank you, ${name}.</h2>
        <p>We received your payment of <b>${money(amount, currency)}</b>.</p>
        <p>Total invested so far: <b>${money(paid, currency)}</b><br/>Remaining: <b>${money(Math.max(total - paid, 0), currency)}</b></p>
        <p style="color:#667">Reference: ${ref}</p><p>${BRAND}</p></div>`,
    });
  } catch (e) { console.error('Email failed:', e.message); }
}
