import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface CardMovePayload {
  cardId: string;
  fromColumnId: string;
  toColumnId: string;
  newOrder: number;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  },
})
export class KanbanGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  private readonly logger = new Logger(KanbanGateway.name);

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('card:move')
  handleCardMove(@MessageBody() payload: CardMovePayload, @ConnectedSocket() client: Socket) {
    // Broadcast to all other clients
    client.broadcast.emit('card:moved', payload);
    return { event: 'card:move', data: 'ok' };
  }

  @SubscribeMessage('board:join')
  handleJoinBoard(@MessageBody() boardId: string, @ConnectedSocket() client: Socket) {
    client.join(`board:${boardId}`);
    return { event: 'board:joined', data: boardId };
  }

  @SubscribeMessage('board:leave')
  handleLeaveBoard(@MessageBody() boardId: string, @ConnectedSocket() client: Socket) {
    client.leave(`board:${boardId}`);
    return { event: 'board:left', data: boardId };
  }

  // Emit events to specific board room
  emitToBoard(boardId: string, event: string, data: unknown) {
    this.server.to(`board:${boardId}`).emit(event, data);
  }

  // Emit events to all clients
  emitToAll(event: string, data: unknown) {
    this.server.emit(event, data);
  }
}
