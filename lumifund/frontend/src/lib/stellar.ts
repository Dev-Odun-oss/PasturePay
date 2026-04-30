import {
  getPublicKey,
  isConnected,
  signTransaction,
} from '@stellar/freighter-api';
import {
  Contract,
  Networks,
  SorobanRpc,
  TransactionBuilder,
  BASE_FEE,
  xdr,
  nativeToScVal,
  Address,
} from '@stellar/stellar-sdk';

const RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? 'https://soroban-testnet.stellar.org';
const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID ?? '';
const NETWORK_PASSPHRASE = Networks.TESTNET;

export const server = new SorobanRpc.Server(RPC_URL);

export async function getWalletAddress(): Promise<string> {
  if (!(await isConnected())) throw new Error('Freighter not connected');
  return getPublicKey();
}

async function invokeContract(method: string, args: xdr.ScVal[]): Promise<string> {
  const source = await getWalletAddress();
  const account = await server.getAccount(source);
  const contract = new Contract(CONTRACT_ID);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(tx);
  const signed = await signTransaction(prepared.toXDR(), {
    network: 'TESTNET',
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  const result = await server.sendTransaction(
    TransactionBuilder.fromXDR(signed, NETWORK_PASSPHRASE),
  );
  return result.hash;
}

export async function createCampaign(
  goal: number,
  tokenAddress: string,
  milestones: { description: string; targetPct: number }[],
) {
  const creator = await getWalletAddress();
  const msVec = xdr.ScVal.scvVec(
    milestones.map((m) =>
      xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
          key: nativeToScVal('description'),
          val: nativeToScVal(m.description),
        }),
        new xdr.ScMapEntry({
          key: nativeToScVal('target_pct'),
          val: nativeToScVal(m.targetPct, { type: 'u32' }),
        }),
      ]),
    ),
  );
  return invokeContract('create_campaign', [
    new Address(creator).toScVal(),
    nativeToScVal(goal, { type: 'i128' }),
    new Address(tokenAddress).toScVal(),
    msVec,
  ]);
}

export async function contribute(campaignId: number, amount: number) {
  const contributor = await getWalletAddress();
  return invokeContract('contribute', [
    nativeToScVal(campaignId, { type: 'u64' }),
    new Address(contributor).toScVal(),
    nativeToScVal(amount, { type: 'i128' }),
  ]);
}

export async function voteMilestone(
  campaignId: number,
  milestoneIndex: number,
  approve: boolean,
) {
  const voter = await getWalletAddress();
  return invokeContract('vote_milestone', [
    nativeToScVal(campaignId, { type: 'u64' }),
    nativeToScVal(milestoneIndex, { type: 'u32' }),
    new Address(voter).toScVal(),
    nativeToScVal(approve),
  ]);
}

export async function refund(campaignId: number, contributionId: number) {
  return invokeContract('refund', [
    nativeToScVal(campaignId, { type: 'u64' }),
    nativeToScVal(contributionId, { type: 'u64' }),
  ]);
}
