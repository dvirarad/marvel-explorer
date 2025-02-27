// src/utils/character-normalizer.service.ts
import { Injectable, Logger } from '@nestjs/common';

import { CHARACTER_ALIASES, CHARACTER_CLEAN_PATTERNS } from '../config/marvel.config';

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

    // Apply all cleaning patterns
    CHARACTER_CLEAN_PATTERNS.forEach(pattern => {
      normalized = normalized.replace(pattern, ' ');
    });

    // Replace multiple spaces with a single space
    normalized = normalized.replace(/\s+/g, ' ').trim();

    return normalized;
  }

  /**
   * Get the canonical form of a character name
   * @param name Raw character name
   * @returns Canonical character name
   */
  getCanonicalName(name: string): string {
    const normalized = this.normalizeCharacterName(name);

    // Check direct matches in aliases
    if (normalized in CHARACTER_ALIASES) {
      return normalized;
    }

    // Check if it's an alias of another character
    for (const [canonical, aliases] of Object.entries(CHARACTER_ALIASES)) {
      if (aliases.includes(normalized)) {
        return canonical;
      }
    }

    // Additional special case handling for problem characters

    // Handle compound names with both character names
    if (normalized.includes('iron man') && normalized.includes('tony stark')) {
      return 'tony stark';
    }

    if (
      normalized.includes('steve rogers') &&
      (normalized.includes('captain america') || normalized.includes('america'))
    ) {
      return 'steve rogers';
    }

    if (normalized.includes('peter quill') && normalized.includes('star')) {
      return 'peter quill';
    }

    if (
      normalized.includes('james rhodes') &&
      (normalized.includes('war machine') || normalized.includes('machine'))
    ) {
      return 'james rhodes';
    }

    if (normalized.includes('bruce banner') && normalized.includes('hulk')) {
      return 'bruce banner';
    }

    if (
      normalized.includes('carol danvers') ||
      normalized.includes('captain marvel') ||
      normalized.includes('vers')
    ) {
      return 'carol danvers';
    }

    // No match found, use the normalized name
    return normalized;
  }

  /**
   * Format a canonical name for display
   * @param canonicalName Canonical character name
   * @returns Formatted name for display
   */
  formatCharacterNameForDisplay(canonicalName: string): string {
    // Capitalize each word
    return canonicalName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Check if two character names refer to the same character
   * @param name1 First character name
   * @param name2 Second character name
   * @returns Whether they are the same character
   */
  areSameCharacter(name1: string, name2: string): boolean {
    if (!name1 || !name2) return false;

    const canonical1 = this.getCanonicalName(name1);
    const canonical2 = this.getCanonicalName(name2);

    // They have the same canonical form
    if (canonical1 === canonical2) return true;

    return false;
  }
}
