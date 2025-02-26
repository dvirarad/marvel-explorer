// src/app.module.ts
import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { TmdbModule } from './tmdb/tmdb.module';
import { MoviesModule } from './movies/movies.module';
import { ActorsModule } from './actors/actors.module';
import { CharactersModule } from './characters/characters.module';

@Module({
  imports: [
    // Configuration module for environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // MongoDB connection with debug logging
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');

        if (!uri) {
          Logger.error('MongoDB URI is not defined in environment variables', 'MongooseModule');
          throw new Error('MongoDB URI is not defined');
        }

        // Check if URI still contains placeholders
        if (uri.includes('<') && uri.includes('>')) {
          Logger.error(
            'MongoDB URI contains placeholders that need to be replaced with actual values',
            'MongooseModule',
          );

          // Log which placeholders are still present
          const placeholders = uri.match(/<[^>]+>/g);
          if (placeholders) {
            Logger.error(
              `Unresolved placeholders found: ${placeholders.join(', ')}`,
              'MongooseModule',
            );
          }

          throw new Error('MongoDB URI contains unresolved placeholders');
        }

        // Sanitize the URI to hide password before logging
        const sanitizedUri = uri.replace(
          /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/,
          'mongodb$1://$2:***@',
        );

        Logger.log(`Connecting to MongoDB: ${sanitizedUri}`, 'MongooseModule');

        return {
          uri,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        };
      },
      inject: [ConfigService],
    }),
    // Feature modules
    TmdbModule,
    MoviesModule,
    ActorsModule,
    CharactersModule,
  ],
})
export class AppModule {}
