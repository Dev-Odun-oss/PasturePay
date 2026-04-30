import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Horizon } from '@stellar/stellar-sdk';
import { CampaignService } from '../campaign/campaign.service';

const CONTRACT_ID = process.env.LUMIFUND_CONTRACT_ID ?? '';
const HORIZON_URL = process.env.HORIZON_URL ?? 'https://horizon-testnet.stellar.org';

@Injectable()
export class HorizonService implements OnModuleInit {
  private readonly logger = new Logger(HorizonService.name);
  private server = new Horizon.Server(HORIZON_URL);
  private cursor = 'now';

  constructor(private campaigns: CampaignService) {}

  onModuleInit() { this.poll(); }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async poll() {
    if (!CONTRACT_ID) return;
    try {
      const ops = await this.server
        .operations()
        .forAccount(CONTRACT_ID)
        .cursor(this.cursor)
        .limit(50)
        .order('asc')
        .call();

      for (const op of ops.records) {
        await this.handleOp(op as any);
        this.cursor = op.paging_token;
      }
    } catch (e) {
      this.logger.warn(`Horizon poll error: ${e}`);
    }
  }

  private async handleOp(op: any) {
    // Soroban invoke_contract ops carry events in the transaction meta.
    // We parse the function name from the operation and sync state.
    if (op.type !== 'invoke_host_function') return;

    const fn = op.function ?? '';
    this.logger.log(`Indexing op: ${fn}`);

    if (fn === 'contributed') {
      const [campaignId, contribId, contributor, amount] = op.parameters ?? [];
      await this.campaigns.upsertContribution(
        BigInt(contribId),
        BigInt(campaignId),
        contributor,
        BigInt(amount),
      );
    }

    if (fn === 'campaign_failed' || fn === 'campaign_created') {
      const [campaignId] = op.parameters ?? [];
      const status = fn === 'campaign_failed' ? 'FAILED' : 'ACTIVE';
      await this.campaigns.updateFromChain(BigInt(campaignId), 0n, status);
    }
  }
}
