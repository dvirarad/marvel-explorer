import { Module } from '@nestjs/common';

import { TmdbModule } from '../tmdb/tmdb.module';

import { DatabaseManagementController } from './database-management.controller';

@Module({
  imports: [TmdbModule],
  controllers: [DatabaseManagementController],
})
export class DatabaseManagementModule {}
