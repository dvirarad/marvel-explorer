import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

import {
  TmdbMovieResponse,
  TmdbMovieCreditsResponse,
  TmdbPersonResponse,
  TmdbPersonMovieCreditsResponse,
  TmdbSearchPersonResponse,
} from './types/tmdb-api.types';

const axiosRateLimit = require('axios-rate-limit');

@Injectable()
export class TmdbService {
  private readonly logger = new Logger(TmdbService.name);
  private readonly accessToken: string;
  private readonly baseUrl: string = 'https://api.themoviedb.org/3';
  private readonly apiClient: AxiosInstance;

  // Constants for rate limiting and caching
  private readonly MAX_REQUESTS_PER_SECOND = 5;
  private readonly CACHE_TTL = 3600000; // 1 hour in milliseconds
  private readonly RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.accessToken = this.configService.get<string>('TMDB_API_KEY') || '';

    if (!this.accessToken) {
      this.logger.error('TMDB API access token is not defined in environment variables');
      throw new Error('TMDB API access token is required');
    }

    // Create axios instance with rate limiting
    this.apiClient = axiosRateLimit(
      axios.create({
        baseURL: this.baseUrl,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }),
      { maxRequests: this.MAX_REQUESTS_PER_SECOND, perMilliseconds: 1000 },
    );
  }

  /**
   * Make a request to the TMDB API with caching and retry logic
   * @param endpoint API endpoint
   * @param config Axios request config
   * @returns API response data
   */
  private async makeRequest<T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> {
    const cacheKey = `tmdb:${endpoint}:${JSON.stringify(config)}`;

    // Try to get from cache first
    const cachedData = await this.cacheManager.get<T>(cacheKey);
    if (cachedData) {
      this.logger.debug(`Cache hit for ${endpoint}`);
      return cachedData;
    }

    // If not in cache, make the API request with retry logic
    // Initialize lastError to avoid "used before being assigned" error
    let lastError: Error = new Error('Unknown error occurred');

    for (let attempt = 1; attempt <= this.RETRY_ATTEMPTS; attempt++) {
      try {
        this.logger.debug(
          `Making request to ${endpoint} (attempt ${attempt}/${this.RETRY_ATTEMPTS})`,
        );
        const response = await this.apiClient.get<T>(endpoint, config);

        // Store in cache
        await this.cacheManager.set(cacheKey, response.data, this.CACHE_TTL);

        return response.data;
      } catch (error: any) {
        lastError = error;

        if (error.response) {
          // Request made but server responded with error
          const status = error.response.status;

          // Don't retry for certain status codes (client errors)
          if (status === 401) {
            this.logger.error(`Authentication error: ${error.response.data.status_message}`);
            throw new HttpException('TMDB API authentication failed', HttpStatus.UNAUTHORIZED);
          } else if (status === 404) {
            this.logger.warn(`Resource not found: ${endpoint}`);
            throw new HttpException('Resource not found', HttpStatus.NOT_FOUND);
          } else if (status >= 400 && status < 500) {
            this.logger.error(`Client error (${status}): ${error.response.data.status_message}`);
            throw new HttpException(error.response.data.status_message || 'Client error', status);
          }
        }

        // For server errors or network issues, retry after delay
        if (attempt < this.RETRY_ATTEMPTS) {
          this.logger.warn(`Request failed, retrying in ${this.RETRY_DELAY}ms...`);
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        }
      }
    }

    // If we get here, all retry attempts failed
    this.logger.error(`All ${this.RETRY_ATTEMPTS} requests to ${endpoint} failed`);
    throw lastError;
  }

  /**
   * Get movie details by TMDB ID
   * @param movieId The TMDB movie ID
   * @returns Movie details
   */
  async getMovie(movieId: number): Promise<TmdbMovieResponse> {
    try {
      return await this.makeRequest<TmdbMovieResponse>(`/movie/${movieId}`);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Re-throw HttpExceptions
      }
      this.logger.error(
        `Error fetching movie ${movieId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      throw new HttpException('Failed to fetch movie details', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get movie credits (cast and crew)
   * @param movieId The TMDB movie ID
   * @returns Movie credits
   */
  async getMovieCredits(movieId: number): Promise<TmdbMovieCreditsResponse> {
    try {
      return await this.makeRequest<TmdbMovieCreditsResponse>(`/movie/${movieId}/credits`);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Re-throw HttpExceptions
      }
      this.logger.error(
        `Error fetching credits for movie ${movieId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      throw new HttpException('Failed to fetch movie credits', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get actor details by TMDB ID
   * @param actorId The TMDB person ID
   * @returns Actor details
   */
  async getActor(actorId: number): Promise<TmdbPersonResponse> {
    try {
      return await this.makeRequest<TmdbPersonResponse>(`/person/${actorId}`);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Re-throw HttpExceptions
      }
      this.logger.error(
        `Error fetching actor ${actorId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      throw new HttpException('Failed to fetch actor details', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get actor's movie credits
   * @param actorId The TMDB person ID
   * @returns Actor's movie credits
   */
  async getActorMovieCredits(actorId: number): Promise<TmdbPersonMovieCreditsResponse> {
    try {
      return await this.makeRequest<TmdbPersonMovieCreditsResponse>(
        `/person/${actorId}/movie_credits`,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Re-throw HttpExceptions
      }
      this.logger.error(
        `Error fetching movie credits for actor ${actorId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      throw new HttpException(
        'Failed to fetch actor movie credits',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Search for a person by name
   * @param query The search query (person name)
   * @returns Search results
   */
  async searchPerson(query: string): Promise<TmdbSearchPersonResponse> {
    try {
      return await this.makeRequest<TmdbSearchPersonResponse>('/search/person', {
        params: { query },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Re-throw HttpExceptions
      }
      this.logger.error(
        `Error searching for person ${query}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      throw new HttpException('Failed to search for person', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
