// src/config/marvel.config.ts

/**
 * Configuration file for Marvel-related constants
 */

// Base URL for TMDB images
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

// Poster size for movie images
export const POSTER_SIZE = 'w500';

// Profile size for actor images
export const PROFILE_SIZE = 'w500';

// List of Marvel movies to import with their TMDB IDs
export const MARVEL_MOVIES = {
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

// List of actors to include in the data import
export const RELEVANT_ACTORS = [
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

/**
 * Patterns to clean from character names during normalization
 */
export const CHARACTER_CLEAN_PATTERNS = [
  /\(.*?\)/g, // Anything in parentheses
  /\/ /g, // Slash with space after
  / \//g, // Slash with space before
  /lieutenant|lt\.\s*/gi, // Military ranks
  /colonel|col\.\s*/gi,
  /sergeant|sgt\.\s*/gi,
  /agent\s+/gi, // Agent title
  /dr\.|doctor\s+/gi, // Doctor titles
  /professor|prof\./gi, // Professor titles
  /'[^']*'/g, // Nicknames in quotes
];
