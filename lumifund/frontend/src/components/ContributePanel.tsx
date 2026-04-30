'use client';
import { useState } from 'react';
import { contribute } from '@/lib/stellar';

export default function ContributePanel({ campaignId }: { campaignId: number }) {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'done' | 'error'>('idle');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  async function handleContribute() {
    if (!amount || Number(amount) <= 0) return;
    setStatus('pending');
    setError('');
    try {
      const hash = await contribute(campaignId, Number(amount));
      setTxHash(hash);
      setStatus('done');
    } catch (e: any) {
      setError(e.message ?? 'Transaction failed');
      setStatus('error');
    }
  }

  return (
    <div className="border border-gray-800 rounded-xl p-6">
      <h2 className="font-semibold mb-4">Back this Campaign</h2>
      {status === 'done' ? (
        <div>
          <p className="text-green-400 font-medium">Contribution submitted!</p>
          <p className="text-xs text-gray-500 break-all mt-1">Tx: {txHash}</p>
        </div>
      ) : (
        <div className="flex gap-3">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (stroops)"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleContribute}
            disabled={status === 'pending'}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 px-5 py-2 rounded-lg text-sm font-medium"
          >
            {status === 'pending' ? 'Signing…' : 'Contribute'}
          </button>
        </div>
      )}
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      <p className="text-xs text-gray-600 mt-3">Requires Freighter wallet extension</p>
    </div>
  );
}
