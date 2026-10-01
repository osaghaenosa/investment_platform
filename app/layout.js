import { Fraunces, DM_Sans } from 'next/font/google';
import './globals.css';
const display = Fraunces({ subsets: ['latin'], variable: '--display', axes: ['opsz'] });
const body = DM_Sans({ subsets: ['latin'], variable: '--body' });

export const metadata = { title: 'Aurum Capital | Investor portal', description: 'Commit, track and pay your investment securely.' };
export default function RootLayout({ children }) {
  return (<html lang="en"><body className={`${display.variable} ${body.variable}`}>{children}</body></html>);
}
