import { IsString, IsNumber, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class MilestoneDto {
  @IsString() description: string;
  @IsNumber() @Min(1) @Max(100) targetPct: number;
}

export class CreateCampaignDto {
  @IsString() creator: string;
  @IsNumber() goal: number;
  @IsString() tokenAddress: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => MilestoneDto)
  milestones: MilestoneDto[];
}
