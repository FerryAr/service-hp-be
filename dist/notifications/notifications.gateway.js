"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const websockets_1 = require("@nestjs/websockets");
const jsonwebtoken_1 = require("jsonwebtoken");
const socket_io_1 = require("socket.io");
let NotificationsGateway = NotificationsGateway_1 = class NotificationsGateway {
    configService;
    eventEmitter;
    server;
    logger = new common_1.Logger(NotificationsGateway_1.name);
    constructor(configService, eventEmitter) {
        this.configService = configService;
        this.eventEmitter = eventEmitter;
        this.eventEmitter.onAny((event, payload) => {
            if (event.startsWith('order.')) {
                this.handleOrderEvents(event, payload);
            }
        });
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    async handleConnection(client) {
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
            const jwtSecret = this.configService.get('JWT_SECRET');
            if (!jwtSecret) {
                this.logger.error('JWT secret is not defined');
                client.disconnect();
                return;
            }
            const decoded = (0, jsonwebtoken_1.verify)(bearerToken, jwtSecret);
            if (!decoded) {
                client.disconnect();
                return;
            }
            this.logger.log(`Client connected: ${client.id}`);
        }
        catch (error) {
            this.logger.error(error);
            client.disconnect();
        }
    }
    handleOrderEvents(event, payload) {
        switch (event) {
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
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
exports.NotificationsGateway = NotificationsGateway = NotificationsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/notifications',
        cors: {
            origin: '*'
        },
        pingTimeout: 60000,
        maxHttpBufferSize: 1e8,
    }),
    __metadata("design:paramtypes", [config_1.ConfigService,
        event_emitter_1.EventEmitter2])
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map