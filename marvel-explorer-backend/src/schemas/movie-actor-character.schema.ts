import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { Movie } from './movie.schema';
import { Actor } from './actor.schema';
import { Character } from './character.schema';

export type MovieActorCharacterDocument = MovieActorCharacter & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class MovieActorCharacter {
  @ApiProperty({ description: 'Reference to the movie' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Movie', required: true, index: true })
  movie: Movie;

  @ApiProperty({ description: 'Reference to the actor' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Actor', required: true, index: true })
  actor: Actor;

  @ApiProperty({ description: 'Reference to the character' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Character', index: true })
  character: Character;

  @ApiProperty({
    example: 'Iron Man / Tony Stark',
    description: 'Name of the character played by the actor in the movie',
  })
  @Prop({ required: true, index: true })
  characterName: string;
}

export const MovieActorCharacterSchema = SchemaFactory.createForClass(MovieActorCharacter);

MovieActorCharacterSchema.index({ movie: 1, actor: 1 });
MovieActorCharacterSchema.index({ actor: 1, character: 1 });
MovieActorCharacterSchema.index({ character: 1, actor: 1 });
MovieActorCharacterSchema.index({ movie: 1, character: 1 });
