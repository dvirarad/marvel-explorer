// src/utils/fuse-character-matcher.ts
import Fuse from 'fuse.js';
import { Injectable } from '@nestjs/common';

interface CharacterData {
  name: string;
  normalizedName?: string;
  _id?: any;
}

@Injectable()
export class FuseCharacterMatcher {
  private static fuseInstance: Fuse<CharacterData> | null = null;
  private static characterData: CharacterData[] = [];
  private static matchCache = new Map<string, string>();

  /**
   * Normalize a character name by removing common noise patterns
   * @param name The raw character name
   * @returns Cleaned character name
   */
  public static normalizeForComparison(name: string): string {
    if (!name) return '';

    let normalized = name.trim().toLowerCase();

    // Remove common noise patterns
    const noisePatterns = [
      /\(uncredited\)/gi,
      /\(voice\)/gi,
      /\(archive footage\)/gi,
      /lt\.\s*/gi,
      /col\.\s*/gi,
      /colonel\s*/gi,
      /lieutenant\s*/gi,
      /captain\s*/gi,
      /sergeant\s*/gi,
      /sgt\.\s*/gi,
      /dr\.\s*/gi,
      /doctor\s*/gi,
      /professor\s*/gi,
      /prof\.\s*/gi,
      /agent\s*/gi,
      /the\s+/gi,
      /'[^']*'/g, // Remove nicknames in quotes like 'Rhodey'
      /\([^)]*\)/g, // Remove anything in parentheses
    ];

    noisePatterns.forEach(pattern => {
      normalized = normalized.replace(pattern, ' ');
    });

    // Replace multiple spaces with a single space
    return normalized.replace(/\s+/g, ' ').trim();
  }

  /**
   * Initialize Fuse.js with character data
   * @param characters Array of character objects with name property
   */
  public static initializeFuse(characters: Array<CharacterData>) {
    // Keep a reference to the original data
    this.characterData = characters.map(char => ({
      ...char,
      normalizedName: this.normalizeForComparison(char.name),
    }));

    const options = {
      includeScore: true,
      threshold: 0.6,
      keys: ['name', 'normalizedName'],
    };

    this.fuseInstance = new Fuse(this.characterData, options);

    // Clear the cache when reinitializing
    this.matchCache.clear();
  }

  /**
   * Find best match for a character name
   * @param characterName Name to match
   * @param threshold Maximum score threshold (lower is better)
   * @returns Matched character or null
   */
  public static findBestMatch(characterName: string, threshold = 0.4): CharacterData | null {
    if (!characterName || !this.fuseInstance) return null;

    // Check cache first
    if (this.matchCache.has(characterName)) {
      const matchedName = this.matchCache.get(characterName);
      // Find the character object with this name
      const originalCharacter = this.characterData.find(char => char.name === matchedName);
      return originalCharacter || null;
    }

    // Normalize the input name for better matching
    const normalizedName = this.normalizeForComparison(characterName);

    // Search with both original and normalized names
    const results = this.fuseInstance.search(characterName);
    const normalizedResults = this.fuseInstance.search(normalizedName);

    // Combine and sort results
    const allResults = [...results, ...normalizedResults].sort((a, b) => a.score - b.score); // Lower score is better

    // Find best match below threshold
    const bestMatch =
      allResults.length > 0 && allResults[0].score < threshold ? allResults[0].item : null;

    // Cache the result
    if (bestMatch) {
      this.matchCache.set(characterName, bestMatch.name);
    }

    return bestMatch;
  }

  /**
   * Check if two character names refer to the same character
   */
  public static areSameCharacter(name1: string, name2: string): boolean {
    if (!name1 || !name2) return false;
    if (name1 === name2) return true;

    // Create temporary Fuse instance for comparison
    const tempData = [{ name: name1, normalizedName: this.normalizeForComparison(name1) }];
    const tempFuse = new Fuse(tempData, {
      includeScore: true,
      threshold: 0.6,
      keys: ['name', 'normalizedName'],
    });

    // Search for name2 in the instance containing name1
    const results = tempFuse.search(name2);

    // If we get a result with good score, they're the same character
    return results.length > 0 && results[0].score < 0.4;
  }
}
