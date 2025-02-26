import { Injectable, Logger } from '@nestjs/common';

import { CHARACTER_CLEAN_PATTERNS } from '../config/marvel.config';

@Injectable()
export class CharacterNormalizerService {
  private readonly logger = new Logger(CharacterNormalizerService.name);

  /**
   * Normalize a character name by removing common noise patterns
   * @param name Raw character name
   * @returns Normalized character name
   */
  normalizeCharacterName(name: string): string {
    if (!name) return '';

    let normalized = name.toLowerCase().trim();

    // Apply all cleaning patterns from config
    CHARACTER_CLEAN_PATTERNS.forEach(pattern => {
      normalized = normalized.replace(pattern, ' ');
    });

    // Additional cleaning: remove "The" before nouns
    normalized = normalized.replace(/\bthe\s+/gi, ' ');

    // Replace multiple spaces with a single space
    normalized = normalized.replace(/\s+/g, ' ').trim();

    // Apply specific character normalization rules

    // Handle Human Torch / Johnny Storm patterns
    if (normalized.includes('human torch') && normalized.includes('johnny storm')) {
      normalized = 'johnny storm';
    } else if (normalized.includes('human torch')) {
      normalized = 'johnny storm';
    }

    // Handle Iron Man / Tony Stark patterns
    if (normalized.includes('iron man') && normalized.includes('tony stark')) {
      normalized = 'tony stark';
    } else if (normalized.includes('iron man')) {
      normalized = 'tony stark';
    }

    // Handle Captain America / Steve Rogers patterns
    if (
      (normalized.includes('captain america') || normalized.includes('america')) &&
      normalized.includes('steve rogers')
    ) {
      normalized = 'steve rogers';
    } else if (normalized.includes('captain america')) {
      normalized = 'steve rogers';
    }

    // Handle War Machine / James Rhodes patterns
    if (
      (normalized.includes('war machine') || normalized.includes('iron patriot')) &&
      normalized.includes('james rhodes')
    ) {
      normalized = 'james rhodes';
    } else if (normalized.includes('war machine') || normalized.includes('iron patriot')) {
      normalized = 'james rhodes';
    }

    // Handle Hulk / Bruce Banner patterns
    if (normalized.includes('hulk') && normalized.includes('bruce banner')) {
      normalized = 'bruce banner';
    } else if (normalized.includes('hulk')) {
      normalized = 'bruce banner';
    }

    // Handle Spider-Man / Peter Parker patterns
    if (
      (normalized.includes('spider') || normalized.includes('spiderman')) &&
      normalized.includes('peter parker')
    ) {
      normalized = 'peter parker';
    } else if (normalized.includes('spider') || normalized.includes('spiderman')) {
      normalized = 'peter parker';
    }

    // Handle Star-Lord / Peter Quill patterns
    if (
      (normalized.includes('star') || normalized.includes('starlord')) &&
      normalized.includes('peter quill')
    ) {
      normalized = 'peter quill';
    } else if (normalized.includes('star lord') || normalized.includes('starlord')) {
      normalized = 'peter quill';
    }

    // Handle Black Widow / Natasha patterns
    if (
      normalized.includes('black widow') &&
      (normalized.includes('natasha') ||
        normalized.includes('romanoff') ||
        normalized.includes('romanova'))
    ) {
      normalized = 'natasha romanoff';
    } else if (normalized.includes('black widow')) {
      normalized = 'natasha romanoff';
    } else if (normalized.includes('natalie rushman') && normalized.includes('natasha romanoff')) {
      normalized = 'natasha romanoff';
    } else if (normalized.includes('natalie rushman')) {
      normalized = 'natasha romanoff';
    }

    // Handle Captain Marvel / Carol Danvers patterns
    if (
      (normalized.includes('captain marvel') || normalized.includes('vers')) &&
      (normalized.includes('carol') || normalized.includes('danvers'))
    ) {
      normalized = 'carol danvers';
    } else if (normalized.includes('captain marvel') || normalized.includes('vers')) {
      normalized = 'carol danvers';
    }

    // Handle Hawkeye / Clint Barton patterns
    if (normalized.includes('hawkeye') && normalized.includes('clint barton')) {
      normalized = 'clint barton';
    } else if (normalized.includes('hawkeye')) {
      normalized = 'clint barton';
    }

    // Handle Falcon / Sam Wilson patterns - fix for "Sam Wilson Falcon" vs "Sam Wilson The Falcon"
    if (normalized.includes('falcon') && normalized.includes('sam wilson')) {
      normalized = 'sam wilson';
    } else if (normalized.includes('falcon')) {
      normalized = 'sam wilson';
    }

    return normalized;
  }

  /**
   * Format a normalized name for display
   * @param normalizedName Normalized character name
   * @returns Formatted name for display
   */
  formatCharacterNameForDisplay(normalizedName: string): string {
    // Capitalize each word
    return normalizedName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
