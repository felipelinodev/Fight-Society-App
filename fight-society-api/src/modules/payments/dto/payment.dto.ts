import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCheckoutDto {
  @ApiProperty({ example: 'uuid-of-enrollment' })
  @IsUUID()
  @IsNotEmpty()
  enrollmentId!: string;
}
