import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Movie, MovieSchema } from '../schemas/movie.schema';
import { Actor, ActorSchema } from '../schemas/actor.schema';
import { Character, CharacterSchema } from '../schemas/character.schema';
import {
  MovieActorCharacter,
  MovieActorCharacterSchema,
} from '../schemas/movie-actor-character.schema';

import { DatabaseInitializerService } from './database-initializer.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Movie.name, schema: MovieSchema },
      { name: Actor.name, schema: ActorSchema },
      { name: Character.name, schema: CharacterSchema },
      { name: MovieActorCharacter.name, schema: MovieActorCharacterSchema },
    ]),
  ],
  providers: [DatabaseInitializerService],

  exports: [
    MongooseModule.forFeature([
      { name: Movie.name, schema: MovieSchema },
      { name: Actor.name, schema: ActorSchema },
      { name: Character.name, schema: CharacterSchema },
      { name: MovieActorCharacter.name, schema: MovieActorCharacterSchema },
    ]),
  ],
})
export class DatabaseModule {}
