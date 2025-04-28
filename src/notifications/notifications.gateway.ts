import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { verify } from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: '*'
  },
  pingTimeout: 60000,
  maxHttpBufferSize: 1e8,
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {
    // listen to any event and log it
    this.eventEmitter.onAny((event: string, payload: any) => {
      if (event.startsWith('order.')) {
        this.handleOrderEvents(event, payload);
      }
    });
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }


  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers['authorization'];
      if (!authHeader) {
        client.disconnect();
        return;
      }
      const bearerToken = authHeader.split(' ')[1];
      if (!bearerToken) {
        client.disconnect();
        return;
      }

      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        this.logger.error('JWT secret is not defined');
        client.disconnect();
        return;
      }
      const decoded = verify(bearerToken, jwtSecret);

      if (!decoded) {
        client.disconnect();
        return;
      }

      this.logger.log(`Client connected: ${client.id}`);

    } catch (error) {
      this.logger.error(error);
      client.disconnect();
    }
  }

  private handleOrderEvents(event: string, payload: any) {
    switch(event) {
      case 'order.created':
        this.server.emit('order.created', payload);
        break;
      case 'order.transfer_timeout_kt':
        this.server.emit('order.transfer_timeout_kt', payload);
        break;
      case 'order.bongkar_timeout':
        this.server.emit('order.bongkar_timeout', payload);
        break; 
      case 'order.inProgress':
        this.server.emit('order.in_progress', payload);
        break;
      case 'order.finished':
        this.server.emit('order.finished', payload);
        break;
      default:
        this.server.emit('order.update', payload);
        break;
    }
  }
}
