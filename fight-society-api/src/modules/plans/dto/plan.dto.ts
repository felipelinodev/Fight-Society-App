import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { MartialArt } from '@prisma/client';

export class CreatePlanDto {
  @ApiProperty({ example: 'Jiu Jitsu Mensal' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Plano mensal de Jiu Jitsu para iniciantes' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: MartialArt, example: MartialArt.JIU_JITSU })
  @IsEnum(MartialArt)
  @IsNotEmpty()
  martialArt!: MartialArt;

  @ApiProperty({ example: 150.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price!: number;

  @ApiProperty({ example: 30, description: 'Plan duration in days' })
  @IsNumber()
  @Min(1)
  durationDays!: number;

  @ApiPropertyOptional({ example: 'price_xxx' })
  @IsString()
  @IsOptional()
  stripePriceId?: string;
}

export class UpdatePlanDto {
  @ApiPropertyOptional({ example: 'Jiu Jitsu Trimestral' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Plano trimestral com desconto' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 400.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 90 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  durationDays?: number;

  @ApiPropertyOptional({ example: 'price_xxx' })
  @IsString()
  @IsOptional()
  stripePriceId?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
