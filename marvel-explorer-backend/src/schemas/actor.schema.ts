import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ActorDocument = Actor & Document;

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
export class Actor {
  @ApiProperty({ example: 3223, description: 'TMDB ID of the actor' })
  @Prop({ required: true, unique: true, index: true })
  tmdbId: number;

  @ApiProperty({ example: 'Robert Downey Jr.', description: 'Name of the actor' })
  @Prop({ required: true, index: true })
  name: string;

  @ApiProperty({ example: '/5qHNjhtjMD4YWH3UP0rm4tKwxCL.jpg', description: 'Profile image path' })
  @Prop()
  profilePath: string;
}

export const ActorSchema = SchemaFactory.createForClass(Actor);

ActorSchema.index({ name: 'text' });
