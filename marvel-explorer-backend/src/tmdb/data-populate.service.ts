import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Movie, MovieDocument } from '../schemas/movie.schema';
import { Actor, ActorDocument } from '../schemas/actor.schema';
import { Character, CharacterDocument } from '../schemas/character.schema';
import {
  MovieActorCharacter,
  MovieActorCharacterDocument,
} from '../schemas/movie-actor-character.schema';

import { TmdbService } from './tmdb.service';
import { TmdbCastMember } from './types/tmdb-api.types';

@Injectable()
export class DataPopulateService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DataPopulateService.name);

  private readonly marvelMovies = {
    'Fantastic Four (2005)': 9738,
    'Fantastic Four: Rise of the Silver Surfer': 1979,
    'Iron Man': 1726,
    'The Incredible Hulk': 1724,
    'Iron Man 2': 10138,
    Thor: 10195,
    'Captain America: The First Avenger': 1771,
    'The Avengers': 24428,
    'Iron Man 3': 68721,
    'Thor: The Dark World': 76338,
    'Captain America: The Winter Soldier': 100402,
    'Guardians of the Galaxy': 118340,
    'Avengers: Age of Ultron': 99861,
    'Ant-Man': 102899,
    'Fantastic Four (2015)': 166424,
    'Captain America: Civil War': 271110,
    'Doctor Strange': 284052,
    'Guardians of the Galaxy Vol. 2': 283995,
    'Spider-Man: Homecoming': 315635,
    'Thor: Ragnarok': 284053,
    'Black Panther': 284054,
    'Avengers: Infinity War': 299536,
    'Ant-Man and the Wasp': 363088,
    'Captain Marvel': 299537,
    'Avengers: Endgame': 299534,
    'Spider-Man: Far From Home': 429617,
  };

  private readonly relevantActors = [
    'Robert Downey Jr.',
    'Chris Evans',
    'Mark Ruffalo',
    'Chris Hemsworth',
    'Scarlett Johansson',
    'Jeremy Renner',
    'Don Cheadle',
    'Paul Rudd',
    'Brie Larson',
    'Michael B. Jordan',
    'Karen Gillan',
    'Danai Gurira',
    'Josh Brolin',
    'Gwyneth Paltrow',
    'Bradley Cooper',
    'Tom Holland',
    'Zoe Saldana',
    'Anthony Mackie',
    'Tom Hiddleston',
    'Chris Pratt',
    'Samuel L. Jackson',
    'Dave Bautista',
  ];

  constructor(
    private readonly tmdbService: TmdbService,
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    @InjectModel(Actor.name) private actorModel: Model<ActorDocument>,
    @InjectModel(Character.name) private characterModel: Model<CharacterDocument>,
    @InjectModel(MovieActorCharacter.name) private macModel: Model<MovieActorCharacterDocument>,
  ) {}

  async onApplicationBootstrap() {
    // Check if we need to seed the database
    const movieCount = await this.movieModel.countDocuments();
    if (movieCount === 0) {
      this.logger.log('Database is empty. Starting data import...');
      await this.importData();
    } else {
      this.logger.log('Database already contains data. Skipping import.');
    }
  }

  async importData() {
    try {
      // Import movies
      for (const [title, id] of Object.entries(this.marvelMovies)) {
        this.logger.log(`Importing movie: ${title}`);
        await this.importMovie(id);

        // Add a small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      this.logger.log('Data import completed successfully');
    } catch (error) {
      this.logger.error(
        `Error during data import: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async importMovie(tmdbId: number) {
    try {
      this.logger.log(`Importing movie ${tmdbId}`);
      const movieData = await this.tmdbService.getMovie(tmdbId);

      // Create or update movie in database
      let movie = await this.movieModel.findOne({ tmdbId });
      if (!movie) {
        movie = await this.movieModel.create({
          tmdbId: movieData.id,
          title: movieData.title,
          releaseDate: new Date(movieData.release_date),
          overview: movieData.overview,
          posterPath: movieData.poster_path,
        });
      }

      // Get movie credits
      const credits = await this.tmdbService.getMovieCredits(tmdbId);

      // Process cast members
      for (const castMember of credits.cast) {
        // Only process relevant actors we're interested in
        if (this.relevantActors.includes(castMember.name)) {
          // Create or update actor
          let actor = await this.actorModel.findOne({ tmdbId: castMember.id });
          if (!actor) {
            actor = await this.actorModel.create({
              tmdbId: castMember.id,
              name: castMember.name,
              profilePath: castMember.profile_path,
            });
          }

          // Find or create character
          let character = await this.characterModel.findOne({ name: castMember.character });
          if (!character) {
            character = await this.characterModel.create({
              name: castMember.character,
            });
          }

          // Create movie-actor-character relationship if it doesn't exist
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
              characterName: castMember.character,
            });
          }
        }
      }

      return movie;
    } catch (error) {
      this.logger.error(
        `Error importing movie ${tmdbId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      throw error;
    }
  }
}
