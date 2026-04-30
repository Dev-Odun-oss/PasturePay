import Link from 'next/link';

export default function Home() {
  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-bold text-indigo-400 mb-4">LumiFund</h1>
      <p className="text-gray-400 text-lg mb-8">
        Milestone-based crowdfunding powered by Stellar Soroban
      </p>
      <div className="flex justify-center gap-4">
        <Link href="/campaigns" className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-lg font-medium">
          Browse Campaigns
        </Link>
        <Link href="/campaigns/new" className="border border-indigo-600 hover:bg-indigo-900 px-6 py-3 rounded-lg font-medium">
          Start a Campaign
        </Link>
      </div>
    </div>
  );
}
