// src/database/database-management.controller.ts
import { Controller, Post, HttpStatus, HttpCode, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { DataPopulateService } from '../tmdb/data-populate.service';

class TaskDto {
  @IsOptional()
  @IsString()
  taskId?: string;
}

@ApiTags('database')
@Controller('database')
export class DatabaseManagementController {
  constructor(private readonly dataPopulateService: DataPopulateService) {}

  @Post('clean')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clean the database by removing all data' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Database clean operation started' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
  @ApiBody({ type: TaskDto, required: false })
  async cleanDatabase(@Body() taskDto: TaskDto = {}) {
    const taskId = taskDto.taskId || `clean-db-${Date.now()}`;
    return this.dataPopulateService.cleanDatabase(taskId);
  }

  @Post('reload')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reload the database with fresh data' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Database reload operation started' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
  @ApiBody({ type: TaskDto, required: false })
  async reloadDatabase(@Body() taskDto: TaskDto = {}) {
    const taskId = taskDto.taskId || `reload-db-${Date.now()}`;
    return this.dataPopulateService.reloadDatabase(taskId);
  }
}
