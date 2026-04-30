import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto } from './campaign.dto';

@Injectable()
export class CampaignService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCampaignDto) {
    return this.prisma.campaign.create({
      data: {
        contractId: 0, // updated after on-chain tx
        creator: dto.creator,
        goal: dto.goal,
        tokenAddress: dto.tokenAddress,
        milestones: {
          create: dto.milestones.map((m, i) => ({
            index: i,
            description: m.description,
            targetPct: m.targetPct,
          })),
        },
      },
      include: { milestones: true },
    });
  }

  async findAll() {
    return this.prisma.campaign.findMany({ include: { milestones: true } });
  }

  async findOne(id: number) {
    const c = await this.prisma.campaign.findUnique({
      where: { id },
      include: { milestones: true, contributions: true },
    });
    if (!c) throw new NotFoundException('Campaign not found');
    return c;
  }

  async updateFromChain(contractId: bigint, raised: bigint, status: string) {
    return this.prisma.campaign.update({
      where: { contractId },
      data: { raised, status: status as any },
    });
  }

  async upsertContribution(
    contractId: bigint,
    campaignContractId: bigint,
    contributor: string,
    amount: bigint,
  ) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { contractId: campaignContractId },
    });
    if (!campaign) return;
    return this.prisma.contribution.upsert({
      where: { contractId },
      create: { contractId, campaignId: campaign.id, contributor, amount },
      update: { amount },
    });
  }
}
