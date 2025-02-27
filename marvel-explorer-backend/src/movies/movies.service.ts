// src/movies/movies.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Movie, MovieDocument } from '../schemas/movie.schema';
import { Actor, ActorDocument } from '../schemas/actor.schema';
import { Character, CharacterDocument } from '../schemas/character.schema';
import {
  MovieActorCharacter,
  MovieActorCharacterDocument,
} from '../schemas/movie-actor-character.schema';
import { PaginationQueryDto, PaginationResponseDto } from '../common/dto/pagination.dto';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  constructor(
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    @InjectModel(Actor.name) private actorModel: Model<ActorDocument>,
    @InjectModel(Character.name) private characterModel: Model<CharacterDocument>,
    @InjectModel(MovieActorCharacter.name) private macModel: Model<MovieActorCharacterDocument>,
  ) {}

  /**
   * Get all movies with pagination
   * @param search Optional search term to filter movies by title
   * @param pagination Pagination options
   * @returns Paginated list of movies
   */
  async findAll(
    search?: string,
    pagination?: PaginationQueryDto,
  ): Promise<PaginationResponseDto<Movie>> {
    const { page = 0, limit = 10 } = pagination || {};

    const query = search ? { title: { $regex: search, $options: 'i' } } : {};

    const [items, total] = await Promise.all([
      this.movieModel
        .find(query)
        .sort({ releaseDate: 1 })
        .skip(page * limit)
        .limit(limit)
        .exec(),
      this.movieModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasPrevPage: page > 0,
      hasNextPage: page < totalPages - 1,
    };
  }

  /**
   * Get a movie by ID
   * @param id The movie ID
   * @returns The found movie or null
   */
  async findOne(id: string): Promise<Movie | null> {
    return this.movieModel.findById(id).exec();
  }

  /**
   * Get movies per actor with pagination
   * @param pagination Pagination options
   * @returns Paginated list of movies per actor with movie images
   */
  async getMoviesPerActor(pagination?: PaginationQueryDto) {
    this.logger.log('Getting movies per actor');
    const { page = 0, limit = 10 } = pagination || {};

    // First, get all actors
    const actors = await this.actorModel.find().sort({ name: 1 }).exec();

    // Apply pagination to actors
    const totalActors = actors.length;
    const paginatedActors = actors.slice(page * limit, page * limit + limit);
    const actorIds = paginatedActors.map(actor => actor._id);

    // Get all movie-actor-character relations for these actors
    const relations = await this.macModel
      .find({ actor: { $in: actorIds } })
      .populate('movie')
      .populate('actor')
      .exec();

    // Build the response data with image URLs
    const result = {};

    // Initialize with empty arrays for each actor
    paginatedActors.forEach(actor => {
      result[actor.name] = [];
    });

    // Populate with movies and add image URLs
    for (const relation of relations) {
      const actorName = relation.actor['name'];
      const actorImageUrl = relation.actor['profileUrl'];
      const movie = relation.movie as MovieDocument;

      if (
        !result[actorName].some(item =>
          typeof item === 'object' ? item.title === movie.title : item === movie.title,
        )
      ) {
        // Add movie with image URL if exists, otherwise just the title
        if (movie.posterUrl) {
          result[actorName].push({
            title: movie.title,
            imageUrl: movie.posterUrl,
          });
        } else {
          result[actorName].push(movie.title);
        }
      }
    }

    // Add actor image URLs
    const responseWithImages = {};
    for (const [actorName, movies] of Object.entries(result)) {
      const actor = paginatedActors.find(a => a.name === actorName);
      responseWithImages[actorName] = {
        movies,
        actorImageUrl: actor?.profileUrl || null,
      };
    }

    // Return with pagination metadata
    const totalPages = Math.ceil(totalActors / limit);

    return {
      data: responseWithImages,
      pagination: {
        total: totalActors,
        page,
        limit,
        totalPages,
        hasPrevPage: page > 0,
        hasNextPage: page < totalPages - 1,
      },
    };
  }

  /**
   * Get actors with multiple characters with pagination
   * @param pagination Pagination options
   * @returns Paginated list of actors with multiple characters including images
   */
  async getActorsWithMultipleCharacters(pagination?: PaginationQueryDto) {
    this.logger.log('Getting actors with multiple characters');
    const { page = 0, limit = 10 } = pagination || {};

    // Get all actor-character relationships
    const relations = await this.macModel
      .find()
      .populate('movie')
      .populate('actor')
      .populate('character')
      .exec();

    // Group by actor and collect unique characters
    const actorCharactersMap: Record<string, Map<string, any>> = {};

    for (const relation of relations) {
      const actor = relation.actor as ActorDocument;
      const movie = relation.movie as MovieDocument;
      const actorName = actor.name;
      const movieTitle = movie.title;
      const characterName = relation.character
        ? (relation.character as CharacterDocument).name
        : relation.characterName;

      if (!actorCharactersMap[actorName]) {
        actorCharactersMap[actorName] = new Map();
      }

      // Use a Map to track unique characters by name
      if (!actorCharactersMap[actorName].has(characterName)) {
        actorCharactersMap[actorName].set(characterName, {
          movieName: movieTitle,
          characterName: characterName,
          movieImageUrl: movie.posterUrl || null,
        });
      }
    }

    // Convert to the desired format and filter to actors with multiple characters
    const actorsWithMultipleCharacters = {};

    for (const [actorName, charactersMap] of Object.entries(actorCharactersMap)) {
      if (charactersMap?.size > 1) {
        // Get actor image URL
        const actor = await this.actorModel.findOne({ name: actorName }).exec();
        const actorImageUrl = actor?.profileUrl || null;

        actorsWithMultipleCharacters[actorName] = {
          characters: Array.from(charactersMap.values()),
          actorImageUrl,
        };
      }
    }

    // Get sorted actor names for consistent ordering
    const actorNames = Object.keys(actorsWithMultipleCharacters).sort();

    // Apply pagination
    const totalActors = actorNames.length;
    const paginatedActorNames = actorNames.slice(page * limit, page * limit + limit);

    // Build the paginated response
    const paginatedResult = {};
    paginatedActorNames.forEach(actor => {
      paginatedResult[actor] = actorsWithMultipleCharacters[actor];
    });

    // Return with pagination metadata
    const totalPages = Math.ceil(totalActors / limit);

    return {
      data: paginatedResult,
      pagination: {
        total: totalActors,
        page,
        limit,
        totalPages,
        hasPrevPage: page > 0,
        hasNextPage: page < totalPages - 1,
      },
    };
  }

  /**
   * Get characters with multiple actors with pagination
   * @param pagination Pagination options
   * @returns Paginated list of characters with multiple actors including images
   */
  async getCharactersWithMultipleActors(pagination?: PaginationQueryDto) {
    this.logger.log('Getting characters with multiple actors');
    const { page = 0, limit = 10 } = pagination || {};

    // Get all character-actor relationships
    const relations = await this.macModel
      .find()
      .populate('movie')
      .populate('actor')
      .populate('character')
      .exec();

    // Group by character and collect unique actors
    const characterActorsMap: Record<string, Map<string, any>> = {};

    for (const relation of relations) {
      const actor = relation.actor as ActorDocument;
      const movie = relation.movie as MovieDocument;
      const actorName = actor.name;
      const movieTitle = movie.title;
      const characterName = relation.character
        ? (relation.character as CharacterDocument).name
        : relation.characterName;

      if (!characterActorsMap[characterName]) {
        characterActorsMap[characterName] = new Map();
      }

      // Use a Map to track unique actors by name
      const actorKey = `${actorName}:${movieTitle}`;
      if (!characterActorsMap[characterName].has(actorKey)) {
        characterActorsMap[characterName].set(actorKey, {
          movieName: movieTitle,
          actorName: actorName,
          actorImageUrl: actor.profileUrl || null,
          movieImageUrl: movie.posterUrl || null,
        });
      }
    }

    // Convert to the desired format and filter to characters with multiple actors
    const charactersWithMultipleActors = {};

    for (const [characterName, actorsMap] of Object.entries(characterActorsMap)) {
      // First, group actors by name to handle same actor in different movies
      const actorsByName = {};
      for (const actorInfo of actorsMap.values()) {
        if (!actorsByName[actorInfo.actorName]) {
          actorsByName[actorInfo.actorName] = true;
        }
      }

      if (Object.keys(actorsByName).length > 1) {
        const listOfMovies = Array.from(actorsMap.values());
        //remove duplicate actors from listOfMovies
        const uniqueActors = listOfMovies.filter(
          (actor, index, self) => index === self.findIndex(t => t.actorName === actor.actorName),
        );
        charactersWithMultipleActors[characterName] = uniqueActors;
      }
    }

    // Get sorted character names for consistent ordering
    const characterNames = Object.keys(charactersWithMultipleActors).sort();

    // Apply pagination
    const totalCharacters = characterNames.length;
    const paginatedCharacterNames = characterNames.slice(page * limit, page * limit + limit);

    // Build the paginated response
    const paginatedResult = {};
    paginatedCharacterNames.forEach(character => {
      paginatedResult[character] = charactersWithMultipleActors[character];
    });

    // Return with pagination metadata
    const totalPages = Math.ceil(totalCharacters / limit);

    return {
      data: paginatedResult,
      pagination: {
        total: totalCharacters,
        page,
        limit,
        totalPages,
        hasPrevPage: page > 0,
        hasNextPage: page < totalPages - 1,
      },
    };
  }
}
