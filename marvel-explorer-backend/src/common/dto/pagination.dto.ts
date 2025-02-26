import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, Max } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (zero-based)',
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number = 0;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class PaginationResponseDto<T> {
  @ApiPropertyOptional({ description: 'List of items on the current page' })
  items: T[];

  @ApiPropertyOptional({ description: 'Total number of items across all pages' })
  total: number;

  @ApiPropertyOptional({ description: 'Current page number (zero-based)' })
  page: number;

  @ApiPropertyOptional({ description: 'Number of items per page' })
  limit: number;

  @ApiPropertyOptional({ description: 'Total number of pages' })
  totalPages: number;

  @ApiPropertyOptional({ description: 'Has previous page' })
  hasPrevPage: boolean;

  @ApiPropertyOptional({ description: 'Has next page' })
  hasNextPage: boolean;
}
