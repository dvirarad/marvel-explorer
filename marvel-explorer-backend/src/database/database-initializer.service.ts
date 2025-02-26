import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseInitializerService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseInitializerService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    try {
      this.logger.log('Ensuring database indexes...');

      // This will create all defined indexes if they don't exist
      await this.connection.syncIndexes();

      this.logger.log('Database indexes synchronized successfully');

      const collections = ['movies', 'actors', 'characters', 'movieactorcharacters'];

      for (const collection of collections) {
        if (this.connection.db.collection(collection)) {
          const indexes = await this.connection.db.collection(collection).indexes();
          this.logger.debug(
            `Indexes for ${collection}: ${JSON.stringify(indexes.map(i => i.name))}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to initialize database: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      throw error;
    }
  }
}
