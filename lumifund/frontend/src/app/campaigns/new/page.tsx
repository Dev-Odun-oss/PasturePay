'use client';
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { createCampaign } from '@/lib/stellar';
import { postCampaign } from '@/lib/api';
import { useRouter } from 'next/navigation';

type FormValues = {
  goal: number;
  tokenAddress: string;
  milestones: { description: string; targetPct: number }[];
};

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const { register, control, handleSubmit, getValues, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      goal: 1000,
      tokenAddress: '',
      milestones: [{ description: '', targetPct: 50 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'milestones' });

  const totalPct = getValues('milestones').reduce((s, m) => s + Number(m.targetPct), 0);

  async function onSubmit(data: FormValues) {
    setError('');
    try {
      // 1. Save to backend
      const campaign = await postCampaign({
        creator: 'pending', // replaced after wallet connect
        goal: data.goal,
        tokenAddress: data.tokenAddress,
        milestones: data.milestones,
      });

      // 2. Invoke on-chain
      const hash = await createCampaign(data.goal, data.tokenAddress, data.milestones);
      setTxHash(hash);
      setStep(3);
      setTimeout(() => router.push('/campaigns'), 3000);
    } catch (e: any) {
      setError(e.message ?? 'Transaction failed');
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Campaign</h1>

      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {['Details', 'Milestones', 'Confirm'].map((label, i) => (
          <div key={label} className={`flex-1 text-center text-xs py-1 rounded ${step === i + 1 ? 'bg-indigo-600' : 'bg-gray-800 text-gray-500'}`}>
            {label}
          </div>
        ))}
      </div>

      {step === 3 ? (
        <div className="text-center py-12">
          <p className="text-green-400 text-xl font-semibold mb-2">Campaign Created!</p>
          <p className="text-gray-400 text-sm break-all">Tx: {txHash}</p>
          <p className="text-gray-500 text-xs mt-2">Redirecting…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm mb-1">Funding Goal (stroops)</label>
                <input
                  type="number"
                  {...register('goal', { required: true, min: 1 })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Token Contract Address</label>
                <input
                  {...register('tokenAddress', { required: true })}
                  placeholder="C…"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button type="button" onClick={() => setStep(2)} className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded-lg">
                Next →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-gray-400">Define milestones. Total must equal 100%.</p>
              {fields.map((field, i) => (
                <div key={field.id} className="border border-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Milestone {i + 1}</span>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(i)} className="text-red-400 text-xs">Remove</button>
                    )}
                  </div>
                  <input
                    {...register(`milestones.${i}.description`, { required: true })}
                    placeholder="Description"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      {...register(`milestones.${i}.targetPct`, { required: true, min: 1, max: 100 })}
                      className="w-24 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <span className="text-sm text-gray-400">% of goal</span>
                  </div>
                </div>
              ))}
              <p className={`text-xs ${totalPct === 100 ? 'text-green-400' : 'text-yellow-400'}`}>
                Total: {totalPct}% {totalPct !== 100 && '(must be 100%)'}
              </p>
              <button
                type="button"
                onClick={() => append({ description: '', targetPct: 0 })}
                className="text-indigo-400 text-sm hover:underline"
              >
                + Add Milestone
              </button>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 border border-gray-700 py-2 rounded-lg text-sm">
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={totalPct !== 100}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 py-2 rounded-lg text-sm"
                >
                  Launch Campaign
                </button>
              </div>
            </>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>
      )}
    </div>
  );
}
