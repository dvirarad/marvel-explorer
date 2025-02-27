// src/websocket/progress.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, replace with your specific frontend origin
  },
})
export class ProgressGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ProgressGateway');
  private clientCount = 0;

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.clientCount++;
    this.logger.log(`Client connected: ${client.id}. Total clients: ${this.clientCount}`);
  }

  handleDisconnect(client: Socket) {
    this.clientCount--;
    this.logger.log(`Client disconnected: ${client.id}. Total clients: ${this.clientCount}`);
  }

  /**
   * Send progress update to all connected clients
   * @param taskId Unique identifier for the task
   * @param progress Progress data object
   */
  sendProgressUpdate(
    taskId: string,
    progress: {
      percent: number;
      message: string;
      status: 'running' | 'completed' | 'error';
      eta?: number; // Estimated time remaining in seconds
      details?: any; // Any additional details
    },
  ) {
    this.logger.debug(`Sending progress update for task ${taskId}: ${progress.percent}%`);
    this.server.emit('progressUpdate', { taskId, ...progress });
  }
}
