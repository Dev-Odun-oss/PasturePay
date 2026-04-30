import { fetchCampaign } from '@/lib/api';
import ContributePanel from '@/components/ContributePanel';
import MilestoneTracker from '@/components/MilestoneTracker';

export const revalidate = 15;

export default async function CampaignPage({ params }: { params: { id: string } }) {
  const campaign = await fetchCampaign(Number(params.id)).catch(() => null);

  if (!campaign) {
    return <p className="text-center text-gray-500 py-20">Campaign not found.</p>;
  }

  const pct = Math.min(100, (Number(campaign.raised) / Number(campaign.goal)) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border border-gray-800 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Creator</p>
            <p className="font-mono text-sm">{campaign.creator}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            campaign.status === 'ACTIVE' ? 'bg-green-900 text-green-300' :
            campaign.status === 'SUCCESSFUL' ? 'bg-blue-900 text-blue-300' :
            'bg-red-900 text-red-300'
          }`}>{campaign.status}</span>
        </div>

        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-400">Raised</span>
          <span>{Number(campaign.raised).toLocaleString()} / {Number(campaign.goal).toLocaleString()}</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-gray-500 mt-1">{pct.toFixed(1)}% funded</p>
      </div>

      {/* Milestone tracker */}
      <MilestoneTracker milestones={campaign.milestones} campaignId={campaign.id} />

      {/* Contribution panel */}
      {campaign.status === 'ACTIVE' && (
        <ContributePanel campaignId={campaign.id} />
      )}
    </div>
  );
}
