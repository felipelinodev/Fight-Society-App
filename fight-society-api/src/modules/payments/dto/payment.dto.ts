import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class CreateCheckoutDto {
  @ApiProperty({ example: 'uuid-of-enrollment' })
  @IsUUID()
  @IsNotEmpty()
  enrollmentId!: string;

  @ApiPropertyOptional({
    example: '123.456.789-00',
    description: 'Required when the user has no CPF on file (Asaas needs it to bill)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^d{3}.?d{3}.?d{3}-?d{2}$/, {
    message: 'CPF must be in format 123.456.789-00 or 12345678900',
  })
  cpf?: string;
}
