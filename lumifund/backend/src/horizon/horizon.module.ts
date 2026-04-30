import { Module } from '@nestjs/common';
import { HorizonService } from './horizon.service';
import { CampaignModule } from '../campaign/campaign.module';

@Module({ imports: [CampaignModule], providers: [HorizonService] })
export class HorizonModule {}
