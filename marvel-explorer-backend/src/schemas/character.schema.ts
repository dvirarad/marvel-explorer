import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CharacterDocument = Character & Document;

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
export class Character {
  @ApiProperty({ example: 'Iron Man / Tony Stark', description: 'Name of the character' })
  @Prop({ required: true, index: true })
  name: string;
}

export const CharacterSchema = SchemaFactory.createForClass(Character);

CharacterSchema.index({ name: 'text' });
