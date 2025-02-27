// src/tmdb/data-populate.service.ts
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
import { ProgressGateway } from '../websocket/progress.gateway';
import {
  TMDB_IMAGE_BASE_URL,
  POSTER_SIZE,
  PROFILE_SIZE,
  MARVEL_MOVIES,
  RELEVANT_ACTORS,
} from '../config/marvel.config';
import { CharacterNormalizerService } from '../utils/character-normalizer';

import { TmdbService } from './tmdb.service';

@Injectable()
export class DataPopulateService {
  private readonly logger = new Logger(DataPopulateService.name);

  // Map to track normalized character names to canonical character documents
  private characterMap = new Map<string, CharacterDocument>();

  constructor(
    private readonly tmdbService: TmdbService,
    private readonly progressGateway: ProgressGateway,
    private readonly characterNormalizer: CharacterNormalizerService,
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    @InjectModel(Actor.name) private actorModel: Model<ActorDocument>,
    @InjectModel(Character.name) private characterModel: Model<CharacterDocument>,
    @InjectModel(MovieActorCharacter.name) private macModel: Model<MovieActorCharacterDocument>,
  ) {}

  /**
   * Build a full image URL from a TMDB image path
   */
  private getFullImageUrl(
    path: string | null | undefined,
    type: 'poster' | 'profile' = 'poster',
  ): string | null {
    if (!path) return null;
    const size = type === 'poster' ? POSTER_SIZE : PROFILE_SIZE;
    return `${TMDB_IMAGE_BASE_URL}${size}${path}`;
  }

  /**
   * Import all Marvel movie data
   * This is now a purely sync function that returns immediately and updates progress via WebSockets
   */
  async importData(taskId = 'initial-import'): Promise<{ success: boolean; message: string }> {
    // Start the import process in the background
    this.executeImportProcess(taskId);

    // Return immediately with an acknowledgment
    return {
      success: true,
      message: 'Data import started. Progress will be reported via WebSocket.',
    };
  }

  /**
   * Execute the actual import process asynchronously
   * @param taskId Unique task ID for progress tracking
   */
  private async executeImportProcess(taskId: string): Promise<void> {
    try {
      // Clear character map
      this.characterMap.clear();

      // Count total movies for progress calculation
      const totalMovies = Object.keys(MARVEL_MOVIES).length;
      let processedMovies = 0;

      // Send initial progress update
      this.progressGateway?.sendProgressUpdate(taskId, {
        percent: 0,
        message: 'Starting data import...',
        status: 'running',
        eta: totalMovies * 3, // Rough estimate
      });

      // Import movies
      for (const [title, id] of Object.entries(MARVEL_MOVIES)) {
        // Send progress update
        const percent = Math.floor((processedMovies / totalMovies) * 100);
        const eta = (totalMovies - processedMovies) * 3;

        this.progressGateway?.sendProgressUpdate(taskId, {
          percent,
          message: `Importing movie: ${title}`,
          status: 'running',
          eta,
          details: { current: processedMovies + 1, total: totalMovies },
        });

        this.logger.log(`Importing movie: ${title}`);
        await this.importMovie(id);

        // Increment counter
        processedMovies++;

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Send completion update
      this.progressGateway?.sendProgressUpdate(taskId, {
        percent: 100,
        message: 'Data import completed successfully',
        status: 'completed',
        eta: 0,
        details: { current: totalMovies, total: totalMovies },
      });

      this.logger.log('Data import completed successfully');
    } catch (error) {
      this.logger.error(`Error during data import: ${error.message || 'Unknown error'}`);

      this.progressGateway?.sendProgressUpdate(taskId, {
        percent: 0,
        message: `Error during data import: ${error.message || 'Unknown error'}`,
        status: 'error',
      });
    }
  }

  /**
   * Import a single movie and its associated actors and characters
   */
  private async importMovie(tmdbId: number): Promise<Movie> {
    try {
      this.logger.log(`Importing movie ${tmdbId}`);

      // Get movie data from TMDB
      const movieData = await this.tmdbService.getMovie(tmdbId);

      // Create or get movie from database
      let movie = await this.movieModel.findOne({ tmdbId });
      if (!movie) {
        const posterUrl = this.getFullImageUrl(movieData.poster_path, 'poster');

        movie = await this.movieModel.create({
          tmdbId: movieData.id,
          title: movieData.title,
          releaseDate: new Date(movieData.release_date),
          overview: movieData.overview,
          posterPath: movieData.poster_path,
          posterUrl: posterUrl,
        });
      }

      // Get movie credits
      const credits = await this.tmdbService.getMovieCredits(tmdbId);

      // Process cast members
      for (const castMember of credits.cast) {
        // Only process relevant actors
        if (!RELEVANT_ACTORS.includes(castMember.name)) {
          continue;
        }

        // Create or get actor
        let actor = await this.actorModel.findOne({ tmdbId: castMember.id });
        if (!actor) {
          const profileUrl = this.getFullImageUrl(castMember.profile_path, 'profile');

          actor = await this.actorModel.create({
            tmdbId: castMember.id,
            name: castMember.name,
            profilePath: castMember.profile_path,
            profileUrl: profileUrl,
          });
        }

        // Skip if character name is empty
        if (!castMember.character) {
          this.logger.warn(`Skipping ${actor.name} in ${movie.title} - no character name`);
          continue;
        }

        // Normalize character name
        const originalName = castMember.character;
        const normalizedName = this.characterNormalizer.normalizeCharacterName(originalName);

        this.logger.debug(`Character: "${originalName}" -> normalized: "${normalizedName}"`);

        // Find or create character
        const character = await this.getOrCreateCharacter(normalizedName);

        // Create relationship if it doesn't exist
        const existingRelation = await this.macModel.findOne({
          movie: movie._id,
          actor: actor._id,
          character: character._id,
        });

        if (!existingRelation) {
          await this.macModel.create({
            movie: movie._id,
            actor: actor._id,
            character: character._id,
            characterName: originalName, // Keep original name for reference
          });
        }
      }

      return movie;
    } catch (error) {
      this.logger.error(`Error importing movie ${tmdbId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get or create a character by normalized name
   */
  private async getOrCreateCharacter(normalizedName: string): Promise<CharacterDocument> {
    // Check cache first
    if (this.characterMap.has(normalizedName)) {
      return this.characterMap.get(normalizedName);
    }

    // Check database
    let character = await this.characterModel.findOne({
      name: new RegExp(
        `^${this.characterNormalizer.formatCharacterNameForDisplay(normalizedName)}$`,
        'i',
      ),
    });

    // Create if not found
    if (!character) {
      // Format name for display
      const displayName = this.characterNormalizer.formatCharacterNameForDisplay(normalizedName);

      character = await this.characterModel.create({
        name: displayName,
      });

      this.logger.debug(`Created new character: ${displayName}`);
    }

    // Store in cache for future lookups
    this.characterMap.set(normalizedName, character);

    return character;
  }

  /**
   * Clean the database
   * This is now a purely sync function that returns immediately with no progress updates
   */
  async cleanDatabase(taskId = 'clean-database'): Promise<{ success: boolean; message: string }> {
    // Start the clean process in the background
    this.executeCleanProcess();

    // Return immediately with an acknowledgment
    return { success: true, message: 'Database clean started' };
  }

  /**
   * Execute the actual database cleaning process asynchronously without progress updates
   */
  private async executeCleanProcess(): Promise<void> {
    try {
      this.logger.log('Cleaning database...');

      // Delete collections without progress updates
      await this.macModel.deleteMany({});
      this.logger.log('Removed movie-actor-character relationships');

      await this.movieModel.deleteMany({});
      this.logger.log('Removed movies');

      await this.actorModel.deleteMany({});
      this.logger.log('Removed actors');

      await this.characterModel.deleteMany({});
      this.logger.log('Removed characters');

      // Clear character map
      this.characterMap.clear();

      this.logger.log('Database cleaned successfully');
    } catch (error) {
      this.logger.error(`Error cleaning database: ${error.message}`);
    }
  }

  /**
   * Reload the database with fresh data
   * This is now a purely sync function that returns immediately and updates progress via WebSockets
   * only during the import phase
   */
  async reloadDatabase(taskId = 'reload-database'): Promise<{ success: boolean; message: string }> {
    // Start the reload process in the background
    this.executeReloadProcess(taskId);

    // Return immediately with an acknowledgment
    return {
      success: true,
      message: 'Database reload started. Progress will be reported via WebSocket.',
    };
  }

  /**
   * Execute the actual database reloading process asynchronously
   * @param taskId Unique task ID for progress tracking
   */
  private async executeReloadProcess(taskId: string): Promise<void> {
    try {
      this.logger.log('Reloading database...');

      // First clean the database without progress updates
      await this.executeCleanProcess();

      // Then import fresh data with progress updates
      await this.executeImportProcess(taskId);
    } catch (error) {
      this.logger.error(`Error reloading database: ${error.message}`);

      this.progressGateway?.sendProgressUpdate(taskId, {
        percent: 0,
        message: `Error reloading database: ${error.message}`,
        status: 'error',
      });
    }
  }
}
