import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

import { DatabaseModule } from '../database/database.module';
import { CharacterNormalizerService } from '../utils/character-normalizer';
import { WebSocketModule } from '../websocket/websocket.module';

import { TmdbService } from './tmdb.service';
import { DataPopulateService } from './data-populate.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    WebSocketModule,
    DatabaseModule,
    CacheModule.register({
      ttl: 3600000, // 1 hour in milliseconds
      max: 100, // maximum number of items in cache
      isGlobal: false,
    }),
  ],
  providers: [TmdbService, DataPopulateService, CharacterNormalizerService],
  exports: [TmdbService, DataPopulateService],
})
export class TmdbModule {}
