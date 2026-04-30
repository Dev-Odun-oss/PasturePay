const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function fetchCampaigns() {
  const res = await fetch(`${BASE}/campaigns`);
  if (!res.ok) throw new Error('Failed to fetch campaigns');
  return res.json();
}

export async function fetchCampaign(id: number) {
  const res = await fetch(`${BASE}/campaigns/${id}`);
  if (!res.ok) throw new Error('Campaign not found');
  return res.json();
}

export async function postCampaign(body: object) {
  const res = await fetch(`${BASE}/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create campaign');
  return res.json();
}
