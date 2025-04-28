import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private configService;
    private eventEmitter;
    server: Server;
    private readonly logger;
    constructor(configService: ConfigService, eventEmitter: EventEmitter2);
    handleDisconnect(client: Socket): void;
    handleConnection(client: Socket): Promise<void>;
    private handleOrderEvents;
}
