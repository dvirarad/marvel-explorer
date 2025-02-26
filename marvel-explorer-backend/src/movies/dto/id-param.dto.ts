import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class IdParamDto {
  @ApiProperty({
    description: 'Movie ID in MongoDB format',
    example: '5f9d5b3b9d9b4b2e3c8b4567',
  })
  @IsMongoId()
  id: string;
}
