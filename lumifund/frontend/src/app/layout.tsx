import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'LumiFund', description: 'Milestone-based crowdfunding on Stellar' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-gray-100 font-sans">
        <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-6">
          <a href="/" className="text-xl font-bold text-indigo-400">LumiFund</a>
          <a href="/campaigns" className="text-sm text-gray-400 hover:text-white">Campaigns</a>
          <a href="/campaigns/new" className="text-sm text-gray-400 hover:text-white">Create</a>
          <a href="/backer" className="text-sm text-gray-400 hover:text-white">My Contributions</a>
        </nav>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
