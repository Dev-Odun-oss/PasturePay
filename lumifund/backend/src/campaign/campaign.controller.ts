import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './campaign.dto';

@Controller('campaigns')
export class CampaignController {
  constructor(private svc: CampaignService) {}

  @Post() create(@Body() dto: CreateCampaignDto) { return this.svc.create(dto); }
  @Get() findAll() { return this.svc.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }
}
