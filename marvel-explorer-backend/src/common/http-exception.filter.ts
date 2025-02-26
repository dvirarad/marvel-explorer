import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly INTERNAL_SERVER_ERROR = 'Internal server error';

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Get appropriate status code and message
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException ? exception.message : this.INTERNAL_SERVER_ERROR;

    // Log the error with details
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - ${message}`,
      exception.stack,
    );

    // Create error response object
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: status === HttpStatus.INTERNAL_SERVER_ERROR ? this.INTERNAL_SERVER_ERROR : message,
    };

    // Return structured error response
    response.status(status).json(errorResponse);
  }
}
