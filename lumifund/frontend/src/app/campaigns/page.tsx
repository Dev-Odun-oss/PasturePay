import Link from 'next/link';
import { fetchCampaigns } from '@/lib/api';

export const revalidate = 30;

export default async function CampaignsPage() {
  const campaigns = await fetchCampaigns().catch(() => []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Link href="/campaigns/new" className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm">
          + New Campaign
        </Link>
      </div>

      {campaigns.length === 0 && (
        <p className="text-gray-500 text-center py-16">No campaigns yet. Be the first!</p>
      )}

      <div className="grid gap-4">
        {campaigns.map((c: any) => (
          <Link key={c.id} href={`/campaigns/${c.id}`} className="block border border-gray-800 rounded-xl p-5 hover:border-indigo-600 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-lg">{c.creator.slice(0, 8)}…</p>
                <p className="text-gray-400 text-sm mt-1">Goal: {Number(c.goal).toLocaleString()} stroops</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                c.status === 'ACTIVE' ? 'bg-green-900 text-green-300' :
                c.status === 'SUCCESSFUL' ? 'bg-blue-900 text-blue-300' :
                'bg-red-900 text-red-300'
              }`}>{c.status}</span>
            </div>
            <div className="mt-3">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(100, (Number(c.raised) / Number(c.goal)) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Number(c.raised).toLocaleString()} / {Number(c.goal).toLocaleString()} raised
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
