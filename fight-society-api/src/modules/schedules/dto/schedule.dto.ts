import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty({ example: 1, description: 'Day of week: 0=Sunday, 1=Monday ... 6=Saturday' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ example: '19:30' })
  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @ApiProperty({ example: '21:00' })
  @IsString()
  @IsNotEmpty()
  endTime!: string;

  @ApiPropertyOptional({ example: 'Mestre Silva' })
  @IsString()
  @IsOptional()
  instructor?: string;
}
