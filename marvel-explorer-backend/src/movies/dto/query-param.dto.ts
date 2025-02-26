import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class SearchQueryDto {
  @ApiPropertyOptional({
    description: 'Optional search term to filter results',
    example: 'Iron Man',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  search?: string;
}
