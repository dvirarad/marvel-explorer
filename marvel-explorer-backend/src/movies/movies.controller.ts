// src/movies/movies.controller.ts
import {
  Controller,
  Get,
  Param,
  Logger,
  HttpStatus,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IdParamDto } from './dto/id-param.dto';
import { SearchQueryDto } from './dto/query-param.dto';
import {
  MovieDto,
  MoviesPerActorResponseDto,
  ActorsWithMultipleCharactersResponseDto,
  CharactersWithMultipleActorsResponseDto,
} from '../models/responses-dto';

@ApiTags('marvel')
@Controller()
export class MoviesController {
  private readonly logger = new Logger(MoviesController.name);
  private readonly RESOURCE_NOT_FOUND = 'Resource not found';

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
  async findAll(@Query() query: SearchQueryDto): Promise<MovieDto[]> {
    return this.moviesService.findAll(query?.search);
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
      throw new NotFoundException(this.RESOURCE_NOT_FOUND);
    }
    return movie;
  }

  @Get('moviesPerActor')
  @ApiOperation({ summary: 'Get all Marvel movies per actor' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of Marvel movies per actor retrieved successfully',
    type: MoviesPerActorResponseDto,
  })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
  async getMoviesPerActor(): Promise<MoviesPerActorResponseDto> {
    return this.moviesService.getMoviesPerActor();
  }

  @Get('actorsWithMultipleCharacters')
  @ApiOperation({ summary: 'Get actors who have played multiple Marvel characters' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Actors with multiple Marvel characters retrieved successfully',
    type: ActorsWithMultipleCharactersResponseDto,
  })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
  async getActorsWithMultipleCharacters(): Promise<ActorsWithMultipleCharactersResponseDto> {
    return this.moviesService.getActorsWithMultipleCharacters();
  }

  @Get('charactersWithMultipleActors')
  @ApiOperation({ summary: 'Get Marvel characters portrayed by multiple actors' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Characters with multiple actors retrieved successfully',
    type: CharactersWithMultipleActorsResponseDto,
  })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
  async getCharactersWithMultipleActors(): Promise<CharactersWithMultipleActorsResponseDto> {
    return this.moviesService.getCharactersWithMultipleActors();
  }
}
