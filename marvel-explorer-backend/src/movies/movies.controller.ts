import { Controller, Get, Param, Query, HttpStatus, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PaginationQueryDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { MovieDto } from '../models/responses-dto';

import { MoviesService } from './movies.service';
import { IdParamDto } from './dto/id-param.dto';
import { SearchQueryDto } from './dto/query-param.dto';

@ApiTags('marvel')
@Controller()
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('movies')
  @ApiOperation({ summary: 'Get all Marvel movies' })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Filter movies by title',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of Marvel movies retrieved successfully',
    type: [MovieDto],
  })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
  async findAll(
    @Query() query: SearchQueryDto,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginationResponseDto<MovieDto>> {
    return this.moviesService.findAll(query?.search, paginationQuery);
  }

  @Get('movies/:id')
  @ApiOperation({ summary: 'Get a specific Marvel movie by ID' })
  @ApiParam({ name: 'id', description: 'Movie ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Movie found', type: MovieDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Movie not found' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
  async findOne(@Param() params: IdParamDto): Promise<MovieDto> {
    const movie = await this.moviesService.findOne(params.id);
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
    return movie;
  }

  @Get('moviesPerActor')
  @ApiOperation({ summary: 'Get all Marvel movies per actor' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of Marvel movies per actor retrieved successfully',
  })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
  async getMoviesPerActor(@Query() paginationQuery: PaginationQueryDto) {
    return this.moviesService.getMoviesPerActor(paginationQuery);
  }

  @Get('actorsWithMultipleCharacters')
  @ApiOperation({ summary: 'Get actors who have played multiple Marvel characters' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Actors with multiple Marvel characters retrieved successfully',
  })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
  async getActorsWithMultipleCharacters(@Query() paginationQuery: PaginationQueryDto) {
    return this.moviesService.getActorsWithMultipleCharacters(paginationQuery);
  }

  @Get('charactersWithMultipleActors')
  @ApiOperation({ summary: 'Get Marvel characters portrayed by multiple actors' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Characters with multiple actors retrieved successfully',
  })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
  async getCharactersWithMultipleActors(@Query() paginationQuery: PaginationQueryDto) {
    return this.moviesService.getCharactersWithMultipleActors(paginationQuery);
  }
}
