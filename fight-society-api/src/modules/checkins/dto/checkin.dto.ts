import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCheckInDto {
  @ApiProperty({ example: 'uuid-of-user' })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ example: 'uuid-of-enrollment' })
  @IsUUID()
  @IsNotEmpty()
  enrollmentId!: string;

  @ApiPropertyOptional({ example: 'Treino de Jiu Jitsu - manhã' })
  @IsString()
  @IsOptional()
  note?: string;
}
