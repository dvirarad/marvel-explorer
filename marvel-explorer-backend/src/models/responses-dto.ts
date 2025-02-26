import { ApiProperty } from '@nestjs/swagger';

export class MovieDto {
  @ApiProperty({ example: '5f9d5b3b9d9b4b2e3c8b4567' })
  id?: string;

  @ApiProperty({ example: 24428 })
  tmdbId: number;

  @ApiProperty({ example: 'The Avengers' })
  title: string;

  @ApiProperty({ example: '2012-05-04T00:00:00.000Z' })
  releaseDate: Date;

  @ApiProperty({ example: "Earth's mightiest heroes must come together..." })
  overview: string;

  @ApiProperty({ example: '/cezWGskPY5x7GaglTTRN4Fugfb8.jpg' })
  posterPath: string;
}

// Actor model for Swagger
export class ActorDto {
  @ApiProperty({ example: '5f9d5b3b9d9b4b2e3c8b4568' })
  id: string;

  @ApiProperty({ example: 3223 })
  tmdbId: number;

  @ApiProperty({ example: 'Robert Downey Jr.' })
  name: string;

  @ApiProperty({ example: '/5qHNjhtjMD4YWH3UP0rm4tKwxCL.jpg' })
  profilePath: string;
}

// Character model for Swagger
export class CharacterDto {
  @ApiProperty({ example: '5f9d5b3b9d9b4b2e3c8b4569' })
  id: string;

  @ApiProperty({ example: 'Iron Man / Tony Stark' })
  name: string;
}

// Movie Actor Character relationship model for Swagger
export class MovieActorCharacterDto {
  @ApiProperty({ example: '5f9d5b3b9d9b4b2e3c8b4570' })
  id: string;

  @ApiProperty({ type: () => MovieDto })
  movie: MovieDto;

  @ApiProperty({ type: () => ActorDto })
  actor: ActorDto;

  @ApiProperty({ type: () => CharacterDto })
  character: CharacterDto;

  @ApiProperty({ example: 'Iron Man / Tony Stark' })
  characterName: string;
}

export class MoviesPerActorResponseDto {
  // @ApiProperty({
  //     example: {
  //         'Robert Downey Jr.': ['Iron Man', 'The Avengers', 'Iron Man 3'],
  //         'Chris Evans': ['Captain America: The First Avenger', 'The Avengers'],
  //     },
  //     description: 'A mapping of actor names to the movies they appeared in',
  // })
  [actorName: string]: string[];
}

// ActorsWithMultipleCharacters response model
export class CharacterRoleDto {
  @ApiProperty({ example: 'Iron Man' })
  movieName: string;

  @ApiProperty({ example: 'Tony Stark' })
  characterName: string;
}

export class ActorsWithMultipleCharactersResponseDto {
  // @ApiProperty({
  //     example: {
  //         'Chris Evans': [
  //             { movieName: 'Fantastic Four', characterName: 'Johnny Storm' },
  //             { movieName: 'Captain America', characterName: 'Steve Rogers' },
  //         ],
  //     },
  //     description: 'A mapping of actor names to the characters they played in different movies',
  // })
  [actorName: string]: CharacterRoleDto[];
}

// CharactersWithMultipleActors response model
export class ActorRoleDto {
  @ApiProperty({ example: 'Fantastic Four (2005)' })
  movieName: string;

  @ApiProperty({ example: 'Chris Evans' })
  actorName: string;
}

export class CharactersWithMultipleActorsResponseDto {
  // @ApiProperty({
  //     example: {
  //         'Human Torch': [
  //             { movieName: 'Fantastic Four (2005)', actorName: 'Chris Evans' },
  //             { movieName: 'Fantastic Four (2015)', actorName: 'Michael B. Jordan' },
  //         ],
  //     },
  //     description: 'A mapping of character names to the actors who played them in different movies',
  // })
  [characterName: string]: ActorRoleDto[];
}
