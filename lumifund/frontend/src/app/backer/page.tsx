'use client';
import { useEffect, useState } from 'react';
import { getWalletAddress, refund } from '@/lib/stellar';
import { fetchCampaigns } from '@/lib/api';

type Contribution = {
  id: number;
  contractId: string;
  amount: string;
  refunded: boolean;
  campaign: { id: number; status: string; goal: string };
};

export default function BackerPortal() {
  const [address, setAddress] = useState('');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [myContribs, setMyContribs] = useState<Contribution[]>([]);
  const [refunding, setRefunding] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function connect() {
    try {
      const addr = await getWalletAddress();
      setAddress(addr);
      const all = await fetchCampaigns();
      setCampaigns(all);
      const mine: Contribution[] = all.flatMap((c: any) =>
        (c.contributions ?? [])
          .filter((ct: any) => ct.contributor === addr)
          .map((ct: any) => ({ ...ct, campaign: c })),
      );
      setMyContribs(mine);
    } catch (e: any) {
      setError(e.message ?? 'Failed to connect wallet');
    }
  }

  async function handleRefund(contrib: Contribution) {
    setRefunding(contrib.id);
    setError('');
    try {
      await refund(contrib.campaign.id, contrib.id);
      setMyContribs((prev) =>
        prev.map((c) => (c.id === contrib.id ? { ...c, refunded: true } : c)),
      );
    } catch (e: any) {
      setError(e.message ?? 'Refund failed');
    } finally {
      setRefunding(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Contributions</h1>

      {!address ? (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">Connect your Freighter wallet to view contributions</p>
          <button onClick={connect} className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-lg font-medium">
            Connect Wallet
          </button>
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        </div>
      ) : (
        <div>
          <p className="text-xs text-gray-500 mb-6 font-mono">{address}</p>

          {myContribs.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No contributions found.</p>
          ) : (
            <div className="space-y-4">
              {myContribs.map((c) => (
                <div key={c.id} className="border border-gray-800 rounded-xl p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">Campaign #{c.campaign.id}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Amount: {Number(c.amount).toLocaleString()} stroops
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      c.campaign.status === 'FAILED' ? 'bg-red-900 text-red-300' :
                      c.campaign.status === 'SUCCESSFUL' ? 'bg-blue-900 text-blue-300' :
                      'bg-green-900 text-green-300'
                    }`}>{c.campaign.status}</span>
                  </div>

                  {c.campaign.status === 'FAILED' && !c.refunded && (
                    <button
                      onClick={() => handleRefund(c)}
                      disabled={refunding === c.id}
                      className="mt-3 w-full bg-red-900 hover:bg-red-800 disabled:opacity-40 py-2 rounded-lg text-sm"
                    >
                      {refunding === c.id ? 'Processing…' : 'Claim Refund'}
                    </button>
                  )}
                  {c.refunded && (
                    <p className="text-xs text-gray-500 mt-2">Refunded ✓</p>
                  )}
                </div>
              ))}
            </div>
          )}
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      )}
    </div>
  );
}
