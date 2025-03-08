import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

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
   * Find a movie by its MongoDB ID
   */
  async findOne(id: string): Promise<Movie | null> {
    return this.movieModel.findById(id).exec();
  }

  /**
   * Retrieve a paginated list of actors with their Marvel movies
   */
  async getMoviesPerActor(pagination?: PaginationQueryDto) {
    this.logger.log('Getting movies per actor');
    const { page = 0, limit = 10 } = pagination || {};

    // Get paginated actors and total count
    const [paginatedActors, totalActors] = await Promise.all([
      this.actorModel
        .find()
        .sort({ name: 1 })
        .skip(page * limit)
        .limit(limit)
        .exec(),
      this.actorModel.countDocuments(),
    ]);

    // Extract actor IDs for the relations query
    const actorIds = paginatedActors.map(actor => actor._id);

    // Get movie relations only for the paginated actors
    const actorMovieRelations = await this.macModel
      .find({ actor: { $in: actorIds } })
      .populate('movie')
      .populate('actor')
      .exec();

    // Build the response data structure
    const actorMoviesMap = this.buildActorMoviesMap(paginatedActors, actorMovieRelations);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalActors / limit);
    const paginationMetadata = {
      total: totalActors,
      page,
      limit,
      totalPages,
      hasPrevPage: page > 0,
      hasNextPage: page < totalPages - 1,
    };

    return {
      data: actorMoviesMap,
      pagination: paginationMetadata,
    };
  }

  /**
   * Build a map of actors to their movies with image URLs
   */
  private buildActorMoviesMap(actors: ActorDocument[], relations: MovieActorCharacterDocument[]) {
    // Initialize result object with all actors
    const result = {};
    actors.forEach(actor => {
      result[actor.name] = [];
    });

    // Populate with movies
    for (const relation of relations) {
      const actor = relation.actor as unknown as ActorDocument;
      const movie = relation.movie as unknown as MovieDocument;
      const actorName = actor.name;

      // Skip if this movie is already added for this actor
      if (
        result[actorName].some(item =>
          typeof item === 'object' ? item.title === movie.title : item === movie.title,
        )
      ) {
        continue;
      }

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

    // Format response with actor image URLs
    const responseWithImages = {};
    for (const [actorName, movies] of Object.entries(result)) {
      const actor = actors.find(a => a.name === actorName);
      responseWithImages[actorName] = {
        movies,
        actorImageUrl: actor?.profileUrl || null,
      };
    }

    return responseWithImages;
  }

  /**
   * Find actors who have played multiple Marvel characters
   */
  async getActorsWithMultipleCharacters(pagination?: PaginationQueryDto) {
    this.logger.log('Getting actors with multiple characters');
    const { page = 0, limit = 10 } = pagination || {};

    // Find actors who have multiple characters
    const actorsWithMultipleCharacters = await this.findActorsWithMultipleCharacters();

    // Get total count for pagination
    const totalActors = actorsWithMultipleCharacters.length;

    // Apply pagination to the actor IDs
    const paginatedActorIds = actorsWithMultipleCharacters
      .slice(page * limit, page * limit + limit)
      .map(actorInfo => new Types.ObjectId(actorInfo.actorId));

    // Get details for the paginated actors
    const actorDetails = await this.getActorCharacterDetails(paginatedActorIds);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalActors / limit);
    const paginationInfo = {
      total: totalActors,
      page,
      limit,
      totalPages,
      hasPrevPage: page > 0,
      hasNextPage: page < totalPages - 1,
    };

    return {
      data: actorDetails,
      pagination: paginationInfo,
    };
  }

  /**
   * Find actors who have played multiple Marvel characters
   */
  private async findActorsWithMultipleCharacters() {
    // Get all movie-actor-character relationships
    const allRelations = await this.macModel
      .find()
      .populate('actor')
      .populate('character')
      .lean()
      .exec();

    // Create a map to track character counts per actor
    const actorCharacterMap = new Map();

    // Process each relationship
    for (const relation of allRelations) {
      const actorId = relation.actor['_id'].toString();
      const characterName = relation.character
        ? relation.character['name']
        : relation.characterName;

      // Initialize actor entry if not exists
      if (!actorCharacterMap.has(actorId)) {
        actorCharacterMap.set(actorId, {
          actorId,
          actorName: relation.actor['name'],
          characters: new Set(),
        });
      }

      // Add this character to the actor's set of characters
      actorCharacterMap.get(actorId).characters.add(characterName);
    }

    // Filter to actors with multiple characters
    return Array.from(actorCharacterMap.values())
      .filter(info => info.characters.size > 1)
      .map(info => ({
        actorId: info.actorId,
        actorName: info.actorName,
        characterCount: info.characters.size,
      }));
  }

  /**
   * Get detailed character information for the specified actors
   */
  private async getActorCharacterDetails(actorIds: Types.ObjectId[]) {
    // Get actor details
    const actors = await this.actorModel
      .find({ _id: { $in: actorIds } })
      .sort({ name: 1 })
      .exec();

    // Get all relevant relationships
    const relations = await this.macModel
      .find({ actor: { $in: actorIds } })
      .populate('movie')
      .populate('actor')
      .populate('character')
      .exec();

    // Build detailed character information for each actor
    const result = {};

    for (const actor of actors) {
      // Get relationships for this actor
      const actorRelations = relations.filter(
        r => r.actor['_id'].toString() === actor._id.toString(),
      );

      // Map of unique characters for this actor
      const characterMap = new Map();

      // Process each relationship
      for (const relation of actorRelations) {
        const movie = relation.movie as unknown as MovieDocument;
        const characterName = relation.character
          ? (relation.character as unknown as CharacterDocument).name
          : relation.characterName;

        // Add character if not already tracked
        if (!characterMap.has(characterName)) {
          characterMap.set(characterName, {
            movieName: movie.title,
            characterName: characterName,
            movieImageUrl: movie.posterUrl || null,
          });
        }
      }

      // Only include actors with multiple characters
      if (characterMap.size > 1) {
        result[actor.name] = {
          characters: Array.from(characterMap.values()),
          actorImageUrl: actor.profileUrl || null,
        };
      }
    }

    return result;
  }

  /**
   * Find Marvel characters who have been portrayed by multiple actors
   */
  async getCharactersWithMultipleActors(pagination?: PaginationQueryDto) {
    this.logger.log('Getting characters with multiple actors');
    const { page = 0, limit = 10 } = pagination || {};

    // Find characters portrayed by multiple actors
    const charactersWithMultipleActors = await this.findCharactersWithMultipleActors();

    // Get total count for pagination
    const totalCharacters = charactersWithMultipleActors.length;

    // Apply pagination to the character names
    const paginatedCharacterNames = charactersWithMultipleActors
      .sort((a, b) => a.characterName.localeCompare(b.characterName))
      .slice(page * limit, page * limit + limit)
      .map(charInfo => charInfo.characterName);

    // Get details for the paginated characters
    const characterDetails = await this.getCharacterActorDetails(paginatedCharacterNames);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCharacters / limit);
    const paginationInfo = {
      total: totalCharacters,
      page,
      limit,
      totalPages,
      hasPrevPage: page > 0,
      hasNextPage: page < totalPages - 1,
    };

    return {
      data: characterDetails,
      pagination: paginationInfo,
    };
  }

  /**
   * Find characters who have been played by multiple actors
   */
  private async findCharactersWithMultipleActors() {
    // Get all movie-actor-character relationships
    const allRelations = await this.macModel
      .find()
      .populate('actor')
      .populate('character')
      .lean()
      .exec();

    // Create a map to track actor counts per character
    const characterActorMap = new Map();

    // Process each relationship
    for (const relation of allRelations) {
      const characterName = relation.character
        ? relation.character['name']
        : relation.characterName;

      const actorId = relation.actor['_id'].toString();

      // Initialize character entry if not exists
      if (!characterActorMap.has(characterName)) {
        characterActorMap.set(characterName, {
          characterName,
          actors: new Set(),
        });
      }

      // Add this actor to the character's set of actors
      characterActorMap.get(characterName).actors.add(actorId);
    }

    // Filter to characters with multiple actors
    return Array.from(characterActorMap.values())
      .filter(info => info.actors.size > 1)
      .map(info => ({
        characterName: info.characterName,
        actorCount: info.actors.size,
      }));
  }

  /**
   * Get detailed actor information for the specified characters
   */
  private async getCharacterActorDetails(characterNames: string[]) {
    // Get all relevant relationships
    const relations = await this.macModel
      .find()
      .populate('movie')
      .populate('actor')
      .populate('character')
      .exec();

    // Build detailed actor information for each character
    const result = {};

    for (const characterName of characterNames) {
      // Get relationships for this character
      const characterRelations = relations.filter(r => {
        const relCharName = r.character
          ? (r.character as unknown as CharacterDocument).name
          : r.characterName;
        return relCharName === characterName;
      });

      // Map of unique actors for this character
      const actorMap = new Map();

      // Process each relationship
      for (const relation of characterRelations) {
        const actor = relation.actor as unknown as ActorDocument;
        const movie = relation.movie as unknown as MovieDocument;
        const actorKey = actor.name;

        // Add actor if not already tracked
        if (!actorMap.has(actorKey)) {
          actorMap.set(actorKey, {
            movieName: movie.title,
            actorName: actor.name,
            actorImageUrl: actor.profileUrl || null,
            movieImageUrl: movie.posterUrl || null,
          });
        }
      }

      // Only include characters with multiple actors
      if (actorMap.size > 1) {
        result[characterName] = Array.from(actorMap.values());
      }
    }

    return result;
  }
}
