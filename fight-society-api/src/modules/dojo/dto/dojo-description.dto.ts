import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SaveDojoDescriptionDto {
  @ApiProperty({ example: 'A Fight Society é um dojo focado em...' })
  @IsString()
  @IsNotEmpty()
  description!: string;
}
