'use client';
import { useState } from 'react';
import { voteMilestone } from '@/lib/stellar';

type Milestone = {
  index: number;
  description: string;
  targetPct: number;
  votesFor: number;
  votesAgainst: number;
  released: boolean;
};

export default function MilestoneTracker({
  milestones,
  campaignId,
}: {
  milestones: Milestone[];
  campaignId: number;
}) {
  const [voting, setVoting] = useState<number | null>(null);
  const [voted, setVoted] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');

  async function vote(index: number, approve: boolean) {
    setVoting(index);
    setError('');
    try {
      await voteMilestone(campaignId, index, approve);
      setVoted((prev) => new Set(prev).add(index));
    } catch (e: any) {
      setError(e.message ?? 'Vote failed');
    } finally {
      setVoting(null);
    }
  }

  return (
    <div className="border border-gray-800 rounded-xl p-6">
      <h2 className="font-semibold mb-4">Milestones</h2>
      <div className="space-y-4">
        {milestones.map((ms) => {
          const total = ms.votesFor + ms.votesAgainst;
          const approvalPct = total > 0 ? Math.round((ms.votesFor / total) * 100) : 0;
          return (
            <div key={ms.index} className={`rounded-lg p-4 border ${ms.released ? 'border-green-800 bg-green-950/30' : 'border-gray-800'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{ms.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{ms.targetPct}% of goal</p>
                </div>
                {ms.released && (
                  <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded-full">Released</span>
                )}
              </div>

              {/* Vote bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>👍 {ms.votesFor}</span>
                  <span>{approvalPct}% approval</span>
                  <span>👎 {ms.votesAgainst}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${approvalPct}%` }} />
                </div>
              </div>

              {/* Vote buttons */}
              {!ms.released && !voted.has(ms.index) && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => vote(ms.index, true)}
                    disabled={voting === ms.index}
                    className="flex-1 text-xs bg-green-900 hover:bg-green-800 disabled:opacity-40 py-1.5 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => vote(ms.index, false)}
                    disabled={voting === ms.index}
                    className="flex-1 text-xs bg-red-900 hover:bg-red-800 disabled:opacity-40 py-1.5 rounded"
                  >
                    Reject
                  </button>
                </div>
              )}
              {voted.has(ms.index) && (
                <p className="text-xs text-gray-500 mt-2">Vote submitted ✓</p>
              )}
            </div>
          );
        })}
      </div>
      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
    </div>
  );
}
