import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type MovieDocument = Movie & Document;

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
export class Movie {
  @ApiProperty({ example: 1726, description: 'TMDB ID of the movie' })
  @Prop({ required: true, unique: true, index: true })
  tmdbId: number;

  @ApiProperty({ example: 'Iron Man', description: 'Title of the movie' })
  @Prop({ required: true, index: true })
  title: string;

  @ApiProperty({ example: '2008-05-02T00:00:00.000Z', description: 'Release date of the movie' })
  @Prop({ index: true })
  releaseDate: Date;

  @ApiProperty({
    example: 'When Tony Stark is captured...',
    description: 'Movie overview/synopsis',
  })
  @Prop()
  overview: string;

  @ApiProperty({ example: '/78lPtwv72eTNqFW9COBYI0dWDJa.jpg', description: 'Poster image path' })
  @Prop()
  posterPath: string;

  @ApiProperty({
    example: 'https://image.tmdb.org/t/p/w500/78lPtwv72eTNqFW9COBYI0dWDJa.jpg',
    description: 'Full poster image URL',
  })
  @Prop()
  posterUrl: string;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);

MovieSchema.index({ title: 1, releaseDate: 1 });
