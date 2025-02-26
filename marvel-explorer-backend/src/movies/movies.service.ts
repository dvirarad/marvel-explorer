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
import {
  MovieDto,
  MoviesPerActorResponseDto,
  ActorsWithMultipleCharactersResponseDto,
  CharactersWithMultipleActorsResponseDto,
  CharacterRoleDto,
  ActorRoleDto,
} from '../models/responses-dto';

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
   * Get all movies
   * @param search Optional search term to filter movies by title
   * @returns Array of movies matching the criteria
   */
  async findAll(search?: string): Promise<MovieDto[]> {
    const query = search ? { title: { $regex: search, $options: 'i' } } : {};

    return this.movieModel.find<MovieDto>(query).sort({ releaseDate: 1 }).exec();
  }

  /**
   * Get a movie by ID
   * @param id The movie ID
   * @returns The found movie or null
   */
  async findOne(id: string): Promise<MovieDto | null> {
    return this.movieModel.findById<MovieDto>(id).exec();
  }

  /**
   * Get movies per actor
   * @returns List of Marvel movies each actor has appeared in
   */
  async getMoviesPerActor(): Promise<MoviesPerActorResponseDto> {
    this.logger.log('Getting movies per actor');

    const relations = await this.macModel.find().populate('movie').populate('actor').exec();

    const result: MoviesPerActorResponseDto = {};

    for (const relation of relations) {
      const actorName = relation.actor['name'];
      const movieTitle = relation.movie['title'];

      if (!result[actorName]) {
        result[actorName] = [];
      }

      if (!result[actorName].includes(movieTitle)) {
        result[actorName].push(movieTitle);
      }
    }

    return result;
  }

  /**
   * Get actors with multiple characters
   * @returns Actors who have played more than one Marvel character
   */
  async getActorsWithMultipleCharacters(): Promise<ActorsWithMultipleCharactersResponseDto> {
    this.logger.log('Getting actors with multiple characters');

    const relations = await this.macModel.find().populate('movie').populate('actor').exec();

    const actorCharacters: Record<string, CharacterRoleDto[]> = {};

    // Group by actor and collect characters
    for (const relation of relations) {
      const actorName = relation.actor['name'];
      const movieTitle = relation.movie['title'];
      const characterName = relation.characterName;

      if (!actorCharacters[actorName]) {
        actorCharacters[actorName] = [];
      }

      // Check if this character is already recorded for this actor
      const existingChar = actorCharacters[actorName].find(
        char => char.characterName === characterName,
      );

      if (!existingChar) {
        actorCharacters[actorName].push({
          movieName: movieTitle,
          characterName: characterName,
        });
      }
    }

    // Filter to only actors with multiple characters
    const result: ActorsWithMultipleCharactersResponseDto = {};
    for (const [actorName, characters] of Object.entries(actorCharacters)) {
      if (characters.length > 1) {
        result[actorName] = characters;
      }
    }

    return result;
  }

  /**
   * Get characters with multiple actors
   * @returns Characters that were played by more than one actor
   */
  async getCharactersWithMultipleActors(): Promise<CharactersWithMultipleActorsResponseDto> {
    this.logger.log('Getting characters with multiple actors');

    const relations = await this.macModel.find().populate('movie').populate('actor').exec();

    const characterActors: Record<string, ActorRoleDto[]> = {};

    // Group by character and collect actors
    for (const relation of relations) {
      const actorName = relation.actor['name'];
      const movieTitle = relation.movie['title'];
      const characterName = relation.characterName;

      if (!characterActors[characterName]) {
        characterActors[characterName] = [];
      }

      // Check if this actor is already recorded for this character
      const existingActor = characterActors[characterName].find(
        actor => actor.actorName === actorName,
      );

      if (!existingActor) {
        characterActors[characterName].push({
          movieName: movieTitle,
          actorName: actorName,
        });
      }
    }

    // Filter to only characters with multiple actors
    const result: CharactersWithMultipleActorsResponseDto = {};
    for (const [characterName, actors] of Object.entries(characterActors)) {
      if (actors.length > 1) {
        result[characterName] = actors;
      }
    }

    return result;
  }
}
