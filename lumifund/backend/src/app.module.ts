import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { CampaignModule } from './campaign/campaign.module';
import { HorizonModule } from './horizon/horizon.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    CampaignModule,
    HorizonModule,
  ],
})
export class AppModule {}
