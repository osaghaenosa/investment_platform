import { Resend } from 'resend';
import { BRAND, money } from './config';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReceipt({ to, name, amount, currency, ref, paid, total }) {
  try {
    const formattedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const remaining = Math.max(total - paid, 0);

    await resend.emails.send({
      from: process.env.MAIL_FROM || 'receipts@yourdomain.com', 
      to,
      subject: `Payment Receipt: ${money(amount, currency)}`,
      html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 40px 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="background-color: #1e3a8a; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Payment Receipt</h1>
          </div>
          
          <div style="padding: 40px 30px;">
            <p style="font-size: 16px; color: #333333; margin-top: 0;">Hi <strong>${name}</strong>,</p>
            <p style="font-size: 16px; color: #333333; line-height: 1.5;">Thank you for your payment. We have successfully received your recent investment contribution.</p>
            
            <div style="margin: 30px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; padding: 20px 0;">
              <h2 style="font-size: 14px; text-transform: uppercase; color: #6b7280; letter-spacing: 1px; margin-top: 0; margin-bottom: 15px;">Transaction Details</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Amount Paid</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 15px; text-align: right; font-weight: bold;">${money(amount, currency)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Reference Number</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 15px; text-align: right;">${ref}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Date</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 15px; text-align: right;">${formattedDate}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #f9fafb; border-radius: 6px; padding: 20px; margin-bottom: 30px;">
              <h3 style="font-size: 14px; color: #374151; margin-top: 0; margin-bottom: 10px;">Investment Summary</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 5px 0; color: #6b7280; font-size: 14px;">Total Goal</td>
                  <td style="padding: 5px 0; color: #111827; font-size: 14px; text-align: right;">${money(total, currency)}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6b7280; font-size: 14px;">Total Invested</td>
                  <td style="padding: 5px 0; color: #1e3a8a; font-size: 14px; text-align: right; font-weight: bold;">${money(paid, currency)}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6b7280; font-size: 14px;">Remaining Balance</td>
                  <td style="padding: 5px 0; color: #b91c1c; font-size: 14px; text-align: right; font-weight: bold;">${money(remaining, currency)}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 14px; color: #6b7280; margin-bottom: 0; line-height: 1.5;">If you have any questions about this receipt, simply reply to this email or reach out to our support team.</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">&copy; ${new Date().getFullYear()} ${BRAND}. All rights reserved.</p>
          </div>
        </div>
      </div>
      `,
    });
  } catch (e) {
    console.error('Email failed:', e.message);
  }
}
